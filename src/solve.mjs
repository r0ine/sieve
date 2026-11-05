// SPDX-License-Identifier: PolyForm-Small-Business-1.0.0
// `sieve solve` ve `sieve serve` için ortak çekirdek: tek bir istem için N aday üretir, seçer,
// seçilen kodu ve kullanıcıya gösterilecek özeti döndürür. Hat ve seçici değişmez, yalnızca çağrılır.

import fs from 'node:fs';
import path from 'node:path';
import { solveTask } from './pipeline.mjs';
import { knownModels } from './providers.mjs';
import { DEFAULT_THRESHOLD } from './router.mjs';

export const OLLAMA_BASE_URL = 'http://localhost:11434/v1';
export const USER_STRATEGIES = Object.freeze(['combined', 'repair']);

// Ek girdiler ve imza her zaman `solve` adlı fonksiyon üzerinden toplanır (probes.mjs, sandbox.mjs).
const ENTRY = 'solve';

export function resolveModel(name) {
  if (typeof name !== 'string' || !name.trim()) throw new Error('--model is required');
  if (!name.startsWith('ollama:')) {
    if (!knownModels(name)) throw new Error(`unknown model: ${name} (known: ollama:<name>, ${knownModels().join(', ')})`);
    return { name, model: name, ollama: false };
  }
  const tag = name.slice('ollama:'.length);
  if (!tag || /\s/.test(tag)) throw new Error('ollama: needs a model name, e.g. ollama:qwen2.5-coder:1.5b');
  return { name, model: `openai:${tag}`, ollama: true };
}

// Ollama kısayolu OPENAI_COMPAT_BASE_URL'i yerel adrese sabitler ve anahtarı boşaltır; başka bir
// openai: uç noktasıyla aynı koşuda karışamaz, çünkü sağlayıcı tek bir taban adres tutar.
export function providerEnv(models, base) {
  const env = { ...base };
  if (!models.some((m) => m.ollama)) return env;
  if (models.some((m) => !m.ollama && m.model.startsWith('openai:'))) {
    throw new Error('ollama: and openai: models cannot be mixed in one run; both use OPENAI_COMPAT_BASE_URL');
  }
  env.OPENAI_COMPAT_BASE_URL = OLLAMA_BASE_URL;
  env.OPENAI_COMPAT_API_KEY = '';
  return env;
}

export function importedNames(testSource) {
  const names = new Set();
  for (const [, list] of testSource.matchAll(/^\s*from\s+solution\s+import\s+\(?([\w\s,]+)\)?/gm)) {
    for (const part of list.split(',')) {
      const name = part.trim().split(/\s+as\s+/)[0].trim();
      if (name) names.add(name);
    }
  }
  for (const [, name] of testSource.matchAll(/\bsolution\.(\w+)/g)) names.add(name);
  return [...names];
}

export function taskPrompt(prompt, testSource = null) {
  const notes = [];
  const imported = testSource == null ? [] : importedNames(testSource);
  if (testSource != null && !/\bsolution\b/.test(testSource)) {
    notes.push('the test file never mentions `solution`; candidates are saved as solution.py, so it probably cannot import them');
  }
  if (/\bsolve\s*\(/.test(prompt)) return { text: prompt, notes };
  const others = imported.filter((name) => name !== ENTRY);
  if (others.length && !imported.includes(ENTRY)) {
    notes.push(`tests import ${others.join(', ')}, not solve; output agreement is unavailable, only the tests rank candidates`);
    return { text: prompt, notes };
  }
  return { text: `${prompt.trimEnd()}\n\nName the entry-point function \`${ENTRY}\`.`, notes };
}

export function strategyFor(strategy, { hasTests, hasStrong }) {
  if (!USER_STRATEGIES.includes(strategy)) {
    throw new Error(`unknown strategy: ${strategy} (choose ${USER_STRATEGIES.join(' or ')})`);
  }
  if (strategy === 'repair') return 'repair';
  if (!hasTests) return 'codet';
  return hasStrong ? 'router' : 'combined';
}

function sumUsage(usage) {
  const parts = Object.values(usage);
  const sum = (field) => parts.reduce((total, part) => total + (part?.[field] ?? 0), 0);
  return { input: sum('input'), output: sum('output') + sum('thinking'), total: sum('total') };
}

export async function solveText({
  prompt, testsPath = null, complete, model, samples = 5, strategy = 'combined',
  strong = null, strongRemaining = () => 0, temperature = 0.8, maxTokens = 4096,
}) {
  if (!prompt?.trim()) throw new Error('empty prompt');
  if (testsPath && path.basename(testsPath).toLowerCase() === 'solution.py') {
    throw new Error('the test file cannot be named solution.py; that name is taken by the candidate');
  }
  const testSource = testsPath ? fs.readFileSync(testsPath, 'utf8') : null;
  const task = taskPrompt(prompt, testSource);
  const used = strategyFor(strategy, { hasTests: Boolean(testsPath), hasStrong: Boolean(strong) });
  const notes = [...task.notes];
  if (strong && used !== 'router') notes.push('--strong only applies with --tests and the combined strategy; ignored');

  const solved = await solveTask({ name: 'solve', prompt: task.text, publicTest: testsPath }, {
    complete,
    strategies: [used],
    model,
    samples,
    temperature,
    maxTokens,
    threshold: DEFAULT_THRESHOLD,
    strongModel: strong ?? undefined,
    strongRemaining,
  });

  const outcome = solved.outcomes[used] ?? null;
  const everyone = [...solved.candidates, ...solved.repairs, ...(solved.strong ? [solved.strong] : [])];
  const picked = everyone.find((c) => c.id === outcome?.chosen && c.code) ?? null;
  const usable = solved.candidates.filter((c) => c.code && !c.error);
  const pool = everyone.filter((c) => c.code && !c.error);
  const failed = solved.candidates.filter((c) => c.error);

  return {
    code: picked?.code ?? null,
    strategy: used,
    reason: outcome?.reason ?? null,
    agreement: outcome?.agreement ?? null,
    escalated: Boolean(outcome?.route?.escalated),
    strongPicked: Boolean(solved.strong && picked === solved.strong),
    hasTests: Boolean(testsPath),
    chosenPasses: testsPath ? picked?.publicPass === true : null,
    passing: pool.filter((c) => c.publicPass === true).length,
    candidates: solved.candidates.length,
    usable: usable.length,
    repairs: solved.repairs.length,
    pool: pool.length,
    failed: failed.length,
    firstError: failed[0]?.error ?? null,
    usage: sumUsage(solved.usage),
    notes,
  };
}

export function signalOf(result) {
  if (!result.hasTests) return 'weak signal: no tests, candidates were only compared with each other';
  if (result.chosenPasses) return `strong signal: the chosen code passes your tests (${result.passing}/${result.pool} passed)`;
  return `no candidate passed your tests (${result.passing}/${result.pool}); this is a best guess`;
}

export function summaryLines(result) {
  const head = [
    `${result.usable}/${result.candidates} candidates usable`,
    result.repairs ? `${result.repairs} repairs` : null,
    `strategy ${result.strategy}`,
    result.agreement == null ? null : `agreement ${result.agreement.toFixed(2)}`,
    result.escalated ? (result.strongPicked ? 'escalated, strong model chosen' : 'escalated, cheap pick kept') : null,
    `${result.usage.total} tokens`,
  ].filter(Boolean).join(', ');
  return [`sieve: ${head}`, `sieve: ${signalOf(result)}`, ...result.notes.map((note) => `sieve: note: ${note}`)];
}
