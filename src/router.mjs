// SPDX-License-Identifier: PolyForm-Small-Business-1.0.0
// Ucuz modelin uzlaşması eşiğin altındaysa güçlü modele yükselt. Her karar kayda geçer;
// bütçe dolduysa ya da güçlü model hata verdiyse bu da yazılır, sessizce geçilmez.

export const DEFAULT_THRESHOLD = 0.6;

export function shouldEscalate({ agreement, threshold = DEFAULT_THRESHOLD, strongRemaining }) {
  const score = agreement ?? 0;
  if (score >= threshold) return { escalate: false, reason: `uzlaşma ${score.toFixed(2)} >= eşik ${threshold}` };
  if (strongRemaining <= 0) return { escalate: false, reason: 'güçlü model bütçesi bitti, yükseltilmedi' };
  return { escalate: true, reason: `uzlaşma ${score.toFixed(2)} < eşik ${threshold}` };
}

export function settleEscalation({ cheap, strong }) {
  if (!strong || strong.error) return { pick: 'cheap', reason: `güçlü aday yok (${strong?.error ?? 'üretilmedi'})` };
  if (!strong.code) return { pick: 'cheap', reason: 'güçlü cevaptan kod çıkmadı' };
  if (strong.publicPass === false && cheap?.publicPass === true) {
    return { pick: 'cheap', reason: 'güçlü aday açık testte kaldı, ucuz seçilen geçiyordu' };
  }
  return { pick: 'strong', reason: 'güçlü aday seçildi' };
}

export async function routeTask({ selection, cheapCandidates, threshold, strongModel, strongRemaining, solveStrong }) {
  const decision = shouldEscalate({ agreement: selection.agreement, threshold, strongRemaining });
  const log = {
    agreement: selection.agreement,
    threshold,
    strongModel,
    escalated: false,
    reason: decision.reason,
  };
  const cheap = cheapCandidates.find((c) => c.id === selection.chosen) ?? null;
  if (!decision.escalate) return { chosen: selection.chosen, strong: null, log };

  log.escalated = true;
  let strong;
  try {
    strong = await solveStrong();
  } catch (error) {
    strong = { error: error.message, budget: error.name === 'BudgetError' };
  }
  const settled = settleEscalation({ cheap, strong });
  log.outcome = settled.pick;
  log.reason = `${decision.reason}; ${settled.reason}`;
  if (strong?.error) log.strongError = strong.error;
  return { chosen: settled.pick === 'strong' ? strong.id : selection.chosen, strong: strong?.error ? null : strong, log };
}
