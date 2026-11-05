// SPDX-License-Identifier: PolyForm-Small-Business-1.0.0
// Gizli teste bakmadan aday seçimi. Aday: { id, publicPass: true|false|null, signature: string[]|null }.
// agreement = seçilen kümenin boyutu / toplam aday; uncertainty = 1 - agreement.

export const STRATEGIES = Object.freeze(['single', 'public', 'codet', 'combined', 'router', 'repair', 'repair+public', 'repair+codet']);

// repair stratejileri onarılmış adaylarla büyümüş havuzda mevcut seçicilerden birini kullanır.
const REPAIR_SELECTOR = { repair: 'combined', 'repair+public': 'public', 'repair+codet': 'codet' };

export const isRepair = (strategy) => Object.hasOwn(REPAIR_SELECTOR, strategy);

const isError = (cell) => typeof cell === 'string' && cell.startsWith('!');

function sharedColumns(pool) {
  const width = pool[0]?.signature.length ?? 0;
  const columns = [];
  for (let col = 0; col < width; col += 1) {
    if (!pool.every((c) => c.signature[col] === '!input')) columns.push(col);
  }
  return columns;
}

export function clusterBySignature(candidates) {
  const pool = candidates.filter((c) => Array.isArray(c.signature));
  const columns = sharedColumns(pool);
  const groups = new Map();
  for (const candidate of pool) {
    const cells = columns.map((col) => candidate.signature[col]);
    const key = JSON.stringify(cells);
    if (!groups.has(key)) groups.set(key, { members: [], errors: cells.filter(isError).length });
    groups.get(key).members.push(candidate.id);
  }
  return [...groups.values()]
    .map((group) => ({ ...group, size: group.members.length, first: Math.min(...group.members) }))
    .sort((a, b) => b.size - a.size || a.errors - b.errors || a.first - b.first);
}

function byAgreement(pool, total, reason) {
  const clusters = clusterBySignature(pool);
  if (!clusters.length) return null;
  const best = clusters[0];
  const agreement = best.size / total;
  return {
    chosen: best.first,
    agreement,
    uncertainty: 1 - agreement,
    clusters: clusters.map(({ size, members, errors }) => ({ size, members, errors })),
    reason,
  };
}

function fallback(candidates, reason, agreement = 0) {
  const first = [...candidates].sort((a, b) => a.id - b.id)[0];
  return { chosen: first?.id ?? null, agreement, uncertainty: 1 - agreement, clusters: [], reason };
}

export function selectCandidate(strategy, candidates) {
  if (isRepair(strategy)) return selectCandidate(REPAIR_SELECTOR[strategy], candidates);
  const total = candidates.length;
  if (!total) return fallback(candidates, 'aday yok');
  const ordered = [...candidates].sort((a, b) => a.id - b.id);
  const passing = ordered.filter((c) => c.publicPass === true);

  switch (strategy) {
    case 'single':
      return { chosen: ordered[0].id, agreement: null, uncertainty: null, clusters: [], reason: 'ilk aday' };
    case 'public': {
      if (!passing.length) return fallback(ordered, 'açık testi geçen yok, ilk aday');
      const agreement = passing.length / total;
      return { chosen: passing[0].id, agreement, uncertainty: 1 - agreement, clusters: [], reason: 'açık testi geçen ilk aday' };
    }
    case 'codet':
      return byAgreement(ordered, total, 'en büyük uzlaşma kümesi')
        ?? fallback(ordered, 'çıktı imzası yok, ilk aday');
    case 'combined':
    case 'router':
      if (passing.length) {
        return byAgreement(passing, total, 'açık testi geçenler içinde en büyük küme')
          ?? fallback(passing, 'geçenlerde imza yok, açık testi geçen ilk aday', passing.length / total);
      }
      return byAgreement(ordered, total, 'açık testi geçen yok; tüm adaylarda en büyük küme')
        ?? fallback(ordered, 'imza ve açık test yok, ilk aday');
    default:
      throw new Error(`Bilinmeyen strateji: ${strategy}`);
  }
}
