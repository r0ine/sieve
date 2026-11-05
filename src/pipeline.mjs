// SPDX-License-Identifier: PolyForm-Small-Business-1.0.0
// Görev başına hat: N aday üret -> açık test ve çıktı imzası -> (repair) düşenleri onar -> seç -> gerekirse yükselt.
// Bu modül gizli test.py yolunu hiç görmez; loadTask onu bilerek döndürmez.

import fs from 'node:fs';
import path from 'node:path';
import { extractCode, probeOutputs, runTestFile } from './sandbox.mjs';
import { exampleInputs, mergeProbes, requestProbeInputs } from './probes.mjs';
import { isRepair, selectCandidate } from './select.mjs';
import { routeTask } from './router.mjs';
import { DEFAULT_REPAIR_ROUNDS, runRepairs } from './repair.mjs';
import { addUsage, emptyUsage } from './providers.mjs';

export const CODE_SYSTEM = 'You write Python 3 functions. Reply with one ```python code block containing only '
  + 'the complete function (and any helpers it needs). Standard library only, no input(), no printing, '
  + 'no file or network access, no explanations.';

const NEEDS_PUBLIC = new Set(['public', 'combined', 'router', 'repair+public']);
const NEEDS_PROBES = new Set(['codet', 'combined', 'router', 'repair', 'repair+public', 'repair+codet']);

export function loadTask(dir) {
  const publicTest = path.join(dir, 'public_test.py');
  return {
    name: path.basename(dir),
    prompt: fs.readFileSync(path.join(dir, 'prompt.md'), 'utf8'),
    publicTest: fs.existsSync(publicTest) ? publicTest : null,
  };
}

async function draft({ complete, model, prompt, temperature, maxTokens, id }) {
  try {
    const answer = await complete({ model, system: CODE_SYSTEM, prompt, temperature, maxTokens });
    return { id, model, code: extractCode(answer.text), usage: answer.usage, error: null };
  } catch (error) {
    return { id, model, code: null, usage: null, error: error.message, budget: error.name === 'BudgetError' };
  }
}

async function inspect(candidate, { publicTest, probes }) {
  if (!candidate.code) return Object.assign(candidate, { publicPass: null, signature: null });
  if (publicTest) {
    const verdict = await runTestFile(candidate.code, publicTest);
    candidate.publicPass = verdict.pass;
    candidate.publicWhy = verdict.why;
    if (verdict.at) candidate.publicAt = verdict.at;
  } else {
    candidate.publicPass = null;
  }
  if (probes) {
    const probed = await probeOutputs(candidate.code, probes);
    candidate.signature = probed.signature;
    if (probed.why) candidate.probeWhy = probed.why;
  } else {
    candidate.signature = null;
  }
  return candidate;
}

export async function solveTask(task, {
  complete,
  strategies,
  model,
  samples,
  temperature,
  maxTokens = 4096,
  probeCount = 8,
  probeModel = model,
  threshold,
  strongModel,
  strongMaxTokens = 16_384,
  strongRemaining = () => 0,
  repairRounds = DEFAULT_REPAIR_ROUNDS,
}) {
  const wanted = strategies.filter((s) => !(NEEDS_PUBLIC.has(s) && !task.publicTest));
  const skipped = strategies.filter((s) => !wanted.includes(s));
  const repairing = wanted.some(isRepair);
  const usage = { candidates: emptyUsage(), probes: emptyUsage(), strong: emptyUsage(), repairs: emptyUsage() };

  const candidates = await Promise.all(Array.from({ length: samples }, (_, id) => draft({
    complete, model, prompt: task.prompt, temperature, maxTokens, id,
  })));
  for (const candidate of candidates) addUsage(usage.candidates, candidate.usage);

  let probes = null;
  let probeError = null;
  if (wanted.some((s) => NEEDS_PROBES.has(s))) {
    const fromPrompt = exampleInputs(task.prompt);
    let generated = [];
    try {
      const reply = await requestProbeInputs({ complete, model: probeModel, promptText: task.prompt, count: probeCount });
      generated = reply.inputs;
      addUsage(usage.probes, reply.usage);
    } catch (error) {
      probeError = error.message;
    }
    probes = mergeProbes(fromPrompt, generated);
  }

  const usesPublic = repairing || wanted.some((s) => NEEDS_PUBLIC.has(s));
  const evaluation = { publicTest: usesPublic ? task.publicTest : null, probes };
  const usable = candidates.filter((c) => !c.error);
  await Promise.all(usable.map((c) => inspect(c, evaluation)));

  let repairs = [];
  if (repairing && repairRounds > 0) {
    repairs = await runRepairs({
      candidates: usable,
      probes,
      rounds: repairRounds,
      firstId: samples + 1,
      promptText: task.prompt,
      ask: (prompt, id) => draft({ complete, model, prompt, temperature, maxTokens, id }),
      check: (candidate) => inspect(candidate, evaluation),
    });
    for (const repaired of repairs) addUsage(usage.repairs, repaired.usage);
  }
  const repairPool = [...usable, ...repairs.filter((c) => !c.error)];

  const outcomes = {};
  let strong = null;
  for (const strategy of wanted) {
    const selection = selectCandidate(strategy, isRepair(strategy) ? repairPool : usable);
    if (strategy !== 'router') {
      outcomes[strategy] = { ...selection };
      continue;
    }
    const routed = await routeTask({
      selection,
      cheapCandidates: usable,
      threshold,
      strongModel,
      strongRemaining: strongRemaining(),
      solveStrong: async () => {
        const made = await draft({
          complete, model: strongModel, prompt: task.prompt, temperature: 0.2, maxTokens: strongMaxTokens, id: samples,
        });
        addUsage(usage.strong, made.usage);
        if (made.error) {
          const failure = new Error(made.error);
          if (made.budget) failure.name = 'BudgetError';
          throw failure;
        }
        return inspect(made, evaluation);
      },
    });
    strong = routed.strong;
    outcomes.router = { ...selection, chosen: routed.chosen, route: routed.log };
  }

  return {
    task: task.name, candidates, repairs, repairRounds: repairing ? repairRounds : null,
    strong, probes, probeError, outcomes, skipped, usage,
  };
}
