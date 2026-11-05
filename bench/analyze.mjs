// SPDX-License-Identifier: PolyForm-Small-Business-1.0.0
// node bench/analyze.mjs sonuc/a.jsonl [sonuc/b.jsonl ...] [--threshold 0.6]
// Strateji karşılaştırması. Oracle ayrı sütundadır: gizli teste bakarak seçilmiş üst sınırdır, seçim sonucu değildir.

import fs from 'node:fs';

const argv = process.argv.slice(2);
const thresholdAt = argv.indexOf('--threshold');
const threshold = thresholdAt >= 0 ? Number(argv[thresholdAt + 1]) : 0.6;
const files = argv.filter((arg, i) => !arg.startsWith('--') && (thresholdAt < 0 || i !== thresholdAt + 1));
if (!files.length) throw new Error('kullanım: node bench/analyze.mjs <jsonl> [...]');

const label = (row) => (row.repairRounds != null ? `${row.strategy} R=${row.repairRounds}` : row.strategy);

const latest = new Map();
let duplicates = 0;
for (const file of files) {
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    if (!line.trim()) continue;
    const row = JSON.parse(line);
    const key = [label(row), row.model, row.samples, row.temp, row.task].join('|');
    if (latest.has(key)) duplicates += 1;
    latest.set(key, row);
  }
}

const groups = new Map();
for (const row of latest.values()) {
  const key = `${label(row)}|${row.model}|${row.samples}|${row.temp}`;
  if (!groups.has(key)) groups.set(key, []);
  groups.get(key).push(row);
}

const pct = (part, whole) => (whole ? `%${(100 * part / whole).toFixed(1)}` : '-');
const ORDER = ['single', 'public', 'codet', 'combined', 'router', 'repair', 'repair+public', 'repair+codet'];
const rank = (key) => ORDER.indexOf(key.split(/[| ]/)[0]);
const table = [];
const calibration = [];
const repairCeilings = [];

for (const [key, rows] of [...groups].sort(([a], [b]) => rank(a) - rank(b))) {
  const [strategy, model, samples, temp] = key.split('|');
  const scored = rows.filter((r) => !r.skipped && r.candidates?.some((c) => !c.error));
  const skipped = rows.filter((r) => r.skipped).length;
  const empty = rows.filter((r) => !r.skipped).length - scored.length;

  let passAt1 = 0;
  let selected = 0;
  let oracle = 0;
  let tokens = 0;
  let failedCalls = 0;
  let escalations = 0;
  let repairCalls = 0;
  let repairOracle = 0;
  const repairing = rows.some((r) => r.repairRounds != null);
  const agreements = [];
  const bands = { high: [0, 0], low: [0, 0] };

  for (const row of rows.filter((r) => !r.skipped)) {
    failedCalls += row.candidates.filter((c) => c.error).length + (row.repairs ?? []).filter((c) => c.error).length;
  }
  for (const row of scored) {
    const ok = row.candidates.filter((c) => !c.error);
    passAt1 += ok.filter((c) => c.hidden).length / ok.length;
    selected += row.selectedPass ? 1 : 0;
    oracle += ok.some((c) => c.hidden) ? 1 : 0;
    tokens += row.cost?.total ?? 0;
    if (row.route?.escalated) escalations += 1;
    if (row.repairs) {
      repairCalls += row.repairs.length;
      repairOracle += [...ok, ...row.repairs.filter((c) => !c.error)].some((c) => c.hidden) ? 1 : 0;
    }
    if (typeof row.agreement === 'number') {
      agreements.push(row.agreement);
      const band = row.agreement >= threshold ? bands.high : bands.low;
      band[0] += row.selectedPass ? 1 : 0;
      band[1] += 1;
    }
  }

  const n = scored.length;
  table.push([
    strategy, model, `${samples}`, `${temp}`, `${n}`, `${skipped + empty}`,
    pct(passAt1, n), pct(selected, n), pct(oracle, n),
    agreements.length ? (agreements.reduce((a, b) => a + b, 0) / agreements.length).toFixed(2) : '-',
    strategy === 'router' ? `${escalations}` : '-',
    repairing && n ? (repairCalls / n).toFixed(1) : '-',
    n ? (tokens / n).toFixed(0) : '-',
    `${failedCalls}`,
  ]);
  if (repairing) repairCeilings.push(`${strategy}: ${pct(repairOracle, n)} (ucuz adaylarda ${pct(oracle, n)})`);
  if (agreements.length) {
    calibration.push(`${strategy}: uzlaşma >= ${threshold} -> ${bands.high[0]}/${bands.high[1]} doğru seçim; `
      + `< ${threshold} -> ${bands.low[0]}/${bands.low[1]} doğru seçim`);
  }
}

const header = ['strateji', 'model', 'N', 'sıcaklık', 'görev', 'atlanan', 'pass@1 ort.', 'seçimle başarı',
  'oracle (üst sınır, seçim değil)', 'ort. uzlaşma', 'yükseltme', 'onarım/görev', 'token/görev', 'başarısız çağrı'];
console.log(`| ${header.join(' | ')} |`);
console.log(`|${header.map(() => '---').join('|')}|`);
for (const line of table) console.log(`| ${line.join(' | ')} |`);

console.log('\npass@1 ort.: ucuz adayların gizli testten geçme oranının görev ortalaması (tek deneme beklentisi).');
console.log('seçimle başarı: stratejinin gizli teste bakmadan seçtiği adayın gizli testi geçtiği görev oranı.');
console.log('oracle: adaylardan en az biri geçti mi; seçicinin ulaşabileceği üst sınır, bir yöntemin sonucu değildir.');
console.log('token/görev: stratejinin tek başına koşsaydı harcayacağı token (single: 1 aday; diğerleri: tüm adaylar + ek girdiler + yükseltme ya da onarım çağrıları).');
console.log('onarım/görev: görev başına onarım çağrısı (R tur boyunca, hata verenler dahil). R=n onarım tur sayısıdır.');
if (repairCeilings.length) {
  console.log('\nonarımlı havuzda oracle (ulaşılamaz üst sınır, seçim sonucu değil):');
  for (const line of repairCeilings) console.log(`  ${line}`);
}
if (calibration.length) {
  console.log('\nuzlaşma ile doğruluk (az görevde anlamlı değildir):');
  for (const line of calibration) console.log(`  ${line}`);
}
if (duplicates) console.log(`\nnot: ${duplicates} tekrar satır vardı, her görev için son koşu kullanıldı.`);
