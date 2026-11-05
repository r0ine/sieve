// SPDX-License-Identifier: PolyForm-Small-Business-1.0.0
// Seçimden SONRA gizli testle puanlama ve JSONL satırları. Seçim kararları burada değişmez.

import { runTestFile } from './sandbox.mjs';
import { isRepair } from './select.mjs';

function sumUsage(...parts) {
  const total = { input: 0, output: 0, thinking: 0, total: 0 };
  for (const part of parts) for (const field of Object.keys(total)) total[field] += part?.[field] ?? 0;
  return total;
}

export function strategyCost(strategy, solved) {
  const { usage, candidates } = solved;
  if (strategy === 'single') return sumUsage(candidates.find((c) => !c.error)?.usage);
  if (strategy === 'public') return sumUsage(usage.candidates);
  if (strategy === 'router') return sumUsage(usage.candidates, usage.probes, usage.strong);
  if (isRepair(strategy)) return sumUsage(usage.candidates, usage.probes, usage.repairs);
  return sumUsage(usage.candidates, usage.probes);
}

export async function scoreHidden(solved, hiddenTest) {
  const verdicts = new Map();
  for (const candidate of [...solved.candidates, ...(solved.repairs ?? []), solved.strong].filter((c) => c?.code)) {
    verdicts.set(candidate.id, await runTestFile(candidate.code, hiddenTest));
  }
  return verdicts;
}

function view(candidate, verdict) {
  if (!candidate) return null;
  return {
    id: candidate.id,
    model: candidate.model,
    hidden: verdict?.pass ?? null,
    hiddenWhy: verdict?.why ?? null,
    publicPass: candidate.publicPass ?? null,
    publicWhy: candidate.publicWhy || undefined,
    probeWhy: candidate.probeWhy,
    error: candidate.error,
    usage: candidate.usage,
    repairOf: candidate.repairOf,
    round: candidate.round,
    feedback: candidate.feedback,
    code: candidate.code,
  };
}

export function buildRows(solved, verdicts, meta) {
  const shared = {
    ...meta,
    task: solved.task,
    probes: solved.probes?.length ?? null,
    probeError: solved.probeError ?? undefined,
  };
  const rows = solved.skipped.map((strategy) => ({ ...shared, strategy, skipped: 'public_test.py yok' }));
  for (const [strategy, outcome] of Object.entries(solved.outcomes)) {
    const repairing = isRepair(strategy);
    let contenders = solved.candidates;
    if (strategy === 'router' && solved.strong) contenders = [...solved.candidates, solved.strong];
    if (repairing) contenders = [...solved.candidates, ...solved.repairs];
    const chosen = contenders.find((c) => c.id === outcome.chosen) ?? null;
    rows.push({
      ...shared,
      strategy,
      chosen: chosen ? { id: chosen.id, model: chosen.model } : null,
      selectedPass: chosen ? verdicts.get(chosen.id)?.pass ?? false : null,
      agreement: outcome.agreement,
      uncertainty: outcome.uncertainty,
      reason: outcome.reason,
      clusters: outcome.clusters,
      route: outcome.route,
      cost: strategyCost(strategy, solved),
      candidates: solved.candidates.map((c) => view(c, verdicts.get(c.id))),
      strong: strategy === 'router' ? view(solved.strong, verdicts.get(solved.strong?.id)) : undefined,
      repairRounds: repairing ? solved.repairRounds : undefined,
      repairs: repairing ? solved.repairs.map((c) => view(c, verdicts.get(c.id))) : undefined,
    });
  }
  return rows;
}
