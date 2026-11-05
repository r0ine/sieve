// SPDX-License-Identifier: PolyForm-Small-Business-1.0.0
// Sınav koşucusu. Adaylar görev başına bir kez üretilir, istenen tüm stratejiler aynı adaylar üzerinde
// seçim yapar; gizli test.py yalnızca seçimden sonra puanlama için çalışır.
// node bench/run.mjs --strategy single,public,repair --model deepseek-v4.1-flash --samples 3 --temp 0.8 --out sonuc/x.jsonl
//   [--repair-rounds 1] [--only t01,t02] [--resume]

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createProviders, knownModels } from '../src/providers.mjs';
import { loadTask, solveTask } from '../src/pipeline.mjs';
import { buildRows, scoreHidden } from '../src/report.mjs';
import { STRATEGIES } from '../src/select.mjs';
import { DEFAULT_THRESHOLD } from '../src/router.mjs';
import { DEFAULT_REPAIR_ROUNDS } from '../src/repair.mjs';

const tasksRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), 'tasks');
const NUMERIC = new Set(['samples', 'temp', 'concurrency', 'threshold', 'probes', 'strong-budget', 'max-tokens', 'retry-rounds', 'repair-rounds']);

export function parseArgs(argv) {
  const opts = {
    strategy: ['single'],
    model: 'deepseek-v4.1-flash',
    samples: 5,
    temp: 0.8,
    concurrency: 2,
    threshold: DEFAULT_THRESHOLD,
    probes: 8,
    strong: 'gemini-4-argon',
    'strong-budget': 15,
    'max-tokens': 4096,
    'retry-rounds': 2,
    'repair-rounds': DEFAULT_REPAIR_ROUNDS,
    only: null,
    out: null,
    resume: false,
  };
  for (let i = 0; i < argv.length;) {
    const key = argv[i].replace(/^--/, '');
    if (key === 'resume') {
      opts.resume = true;
      i += 1;
      continue;
    }
    const value = argv[i + 1];
    if (!(key in opts)) throw new Error(`Bilinmeyen bayrak: --${key}`);
    if (value === undefined) throw new Error(`--${key} için değer yok`);
    if (NUMERIC.has(key)) opts[key] = Number(value);
    else if (key === 'strategy' || key === 'only') opts[key] = value.split(',').map((s) => s.trim()).filter(Boolean);
    else opts[key] = value;
    i += 2;
  }
  if (!opts.out) throw new Error('--out gerekli');
  if (!Number.isInteger(opts['retry-rounds']) || opts['retry-rounds'] < 0) throw new Error('--retry-rounds sıfır veya pozitif tam sayı olmalı');
  if (!Number.isInteger(opts['repair-rounds']) || opts['repair-rounds'] < 0) throw new Error('--repair-rounds sıfır veya pozitif tam sayı olmalı');
  if (!Number.isInteger(opts.samples) || opts.samples < 1) throw new Error('--samples pozitif tam sayı olmalı');
  if (!Number.isInteger(opts.concurrency) || opts.concurrency < 1) throw new Error('--concurrency pozitif tam sayı olmalı');
  const unknown = opts.strategy.filter((s) => !STRATEGIES.includes(s));
  if (unknown.length) throw new Error(`Bilinmeyen strateji: ${unknown.join(', ')} (seçenekler: ${STRATEGIES.join(', ')})`);
  for (const model of [opts.model, opts.strong]) {
    if (!knownModels(model)) throw new Error(`Bilinmeyen model: ${model} (bilinenler: ${knownModels().join(', ')})`);
  }
  return opts;
}

async function pool(items, limit, worker) {
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) await worker(items[next++]);
  }));
}

export function completedTasks(file) {
  if (!fs.existsSync(file)) return new Set();
  const done = new Set();
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    if (!line.trim()) continue;
    try {
      const row = JSON.parse(line);
      if (typeof row.task === 'string') done.add(row.task);
    } catch {
      throw new Error(`Geçersiz JSONL satırı: ${file}`);
    }
  }
  return done;
}

export async function retryFailed(names, rounds, concurrency, worker, wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms)), onRetry = () => {}) {
  let pending = names;
  for (let round = 0; round <= rounds && pending.length; round += 1) {
    if (round) {
      onRetry(round, pending);
      await wait(5_000);
    }
    const retry = [];
    await pool(pending, concurrency, async (name) => {
      if (!await worker(name)) retry.push(name);
    });
    pending = retry;
  }
  return pending;
}

async function main(argv) {
  const opts = parseArgs(argv);
  let names = fs.readdirSync(tasksRoot).filter((n) => /^t\d+_/.test(n)).sort();
  if (opts.only) names = names.filter((n) => opts.only.some((prefix) => n.startsWith(prefix)));
  if (!names.length) throw new Error('Seçilen görev yok');

  const providers = createProviders({ budgets: { [opts.strong]: opts['strong-budget'] } });
  const outFile = path.resolve(process.cwd(), opts.out);
  if (opts.resume) {
    const done = completedTasks(outFile);
    names = names.filter((name) => !done.has(name));
    console.log(`devam: ${done.size} görev atlandı, ${names.length} görev kaldı`);
  }
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  const sink = fs.createWriteStream(outFile, { flags: 'a' });
  const meta = { run: new Date().toISOString(), model: opts.model, samples: opts.samples, temp: opts.temp };
  const missingPublic = new Set();
  let finished = 0;

  async function runTask(name) {
    const dir = path.join(tasksRoot, name);
    const task = loadTask(dir);
    if (!task.publicTest) missingPublic.add(name);

    const solved = await solveTask(task, {
      complete: providers.complete,
      strategies: opts.strategy,
      model: opts.model,
      samples: opts.samples,
      temperature: opts.temp,
      maxTokens: opts['max-tokens'],
      probeCount: opts.probes,
      threshold: opts.threshold,
      strongModel: opts.strong,
      strongRemaining: () => providers.remaining(opts.strong),
      repairRounds: opts['repair-rounds'],
    });
    const failed = solved.candidates.filter((c) => c.error);
    if (failed.length === solved.candidates.length) {
      console.log(`${name} tekrar denenecek (${failed.length} çağrı başarısız: ${failed[0].error.slice(0, 160)})`);
      return false;
    }
    const verdicts = await scoreHidden(solved, path.join(dir, 'test.py'));
    for (const row of buildRows(solved, verdicts, meta)) sink.write(JSON.stringify(row) + '\n');

    finished += 1;
    const note = failed.length ? ` (${failed.length} çağrı başarısız: ${failed[0].error.slice(0, 160)})` : '';
    console.log(`${finished}/${names.length} ${name}${note}`);
    const strongError = solved.outcomes.router?.route?.strongError;
    if (strongError) console.log(`  yükseltme hatası: ${strongError.slice(0, 200)}`);
    return true;
  }

  const pending = await retryFailed(names, opts['retry-rounds'], opts.concurrency, runTask, undefined,
    (round, retry) => console.log(`tekrar deneme ${round}/${opts['retry-rounds']}: ${retry.join(', ')}`));

  await new Promise((resolve) => sink.end(resolve));
  if (missingPublic.size) {
    console.log(`public_test.py olmayan ${missingPublic.size} görev; public/combined/router/repair+public atlandı: ${[...missingPublic].join(', ')}`);
  }
  if (pending.length) console.log(`tekrar denenecek ${pending.length} görev: ${pending.join(', ')}`);
  console.log(`model deneme sayıları: ${JSON.stringify(providers.snapshot())}`);
  console.log(`bitti -> ${opts.out}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main(process.argv.slice(2));
}
