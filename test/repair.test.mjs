// SPDX-License-Identifier: PolyForm-Small-Business-1.0.0
// Onarım döngüsü: geri besleme metni, tur sınırı, maliyet ve gizli testin onarıma sızmaması.
import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { CODE_SYSTEM, loadTask, solveTask } from '../src/pipeline.mjs';
import { buildRows, scoreHidden, strategyCost } from '../src/report.mjs';
import { FEEDBACK_LIMIT, answeredColumns, failureFeedback, runRepairs, scrub } from '../src/repair.mjs';
import { isRepair, selectCandidate } from '../src/select.mjs';
import { runTestFile } from '../src/sandbox.mjs';
import { parseArgs } from '../bench/run.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const taskDir = path.join(root, 'bench', 'tasks', 't45_lru_cache');
const reference = fs.readFileSync(path.join(taskDir, 'reference.py'), 'utf8');
const hiddenSource = fs.readFileSync(path.join(taskDir, 'test.py'), 'utf8');
const publicSource = fs.readFileSync(path.join(taskDir, 'public_test.py'), 'utf8');
const promptSource = fs.readFileSync(path.join(taskDir, 'prompt.md'), 'utf8');
const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'sieve-repair-'));
after(() => fs.rmSync(scratch, { recursive: true, force: true }));

// İlk açık örneği geçer, kapasite 0'da sıfıra böler.
const BROKEN = 'def solve(capacity, operations):\n    1 // capacity\n    return [7]\n';
const fence = (code) => '```python\n' + code + '```';
const usage = { input: 10, output: 5, thinking: 0, total: 15 };

function fakeModel(drafts = [BROKEN, BROKEN]) {
  const repairPrompts = [];
  let drafted = 0;
  const complete = async ({ model, system, prompt }) => {
    if (system !== CODE_SYSTEM) return { text: '```json\n["2, [(\'put\', 1, 1), (\'get\', 1)]", "0, []"]\n```', usage, model };
    if (prompt.includes('Your previous solution')) {
      repairPrompts.push(prompt);
      return { text: fence(reference), usage, model };
    }
    return { text: fence(drafts[drafted++ % drafts.length]), usage, model };
  };
  return { complete, repairPrompts };
}

test('geri besleme yolları ve gizli dosya adını kırpar, sınırı aşmaz', () => {
  const candidate = {
    publicPass: false,
    publicAt: 'assert solve([1]) == 2',
    publicWhy: `AssertionError in C:\\Users\\x\\AppData\\Local\\Temp\\sieve-1\\test.py and /tmp/sieve-2/test.py ${'x'.repeat(900)}`,
    signature: ['!raise ZeroDivisionError', '!raise KeyError', '!timeout', '!raise TypeError'],
  };
  const text = failureFeedback(candidate, { probes: ['[0]', '[1]', '[2]', '[3]'], answered: new Set([0, 1, 2, 3]) });
  assert.ok(text.length <= FEEDBACK_LIMIT);
  assert.doesNotMatch(text, /test\.py|Users|tmp|sieve-/);
  assert.match(text, /public test failed at `assert solve\(\[1\]\) == 2`/);
  assert.match(text, /solve\(\[0\]\) raised ZeroDivisionError/);
  assert.match(text, /solve\(\[1\]\) raised KeyError/);
  assert.doesNotMatch(text, /\[2\]|TypeError/);
  assert.equal(scrub('public_test.py: 1/0'), 'public_test.py: 1/0');
});

test('herkesin düştüğü girdi ve geçen aday geri besleme üretmez', () => {
  const pool = [{ signature: ['!raise ValueError', '3'] }, { signature: ['!raise ValueError', '4'] }];
  const answered = answeredColumns(pool);
  assert.deepEqual([...answered], [1]);
  assert.equal(failureFeedback(pool[0], { probes: ['[]', '[1]'], answered }), '');
  assert.equal(failureFeedback({ publicPass: true, signature: ['1'] }, { probes: ['[1]'], answered }), '');
});

test('yalnız düşen aday onarılır, tur sınırı ve kimlikler doğru', async () => {
  const asked = [];
  const check = async (c) => Object.assign(c, { publicPass: c.code === 'ok', signature: [] });
  const ask = async (prompt, id) => {
    asked.push(id);
    return { id, code: 'still broken', usage, error: null };
  };
  const candidates = [
    { id: 0, code: 'bad', publicPass: false, publicWhy: 'AssertionError', signature: [] },
    { id: 1, code: 'ok', publicPass: true, signature: [] },
  ];
  const repairs = await runRepairs({ candidates, probes: [], rounds: 2, firstId: 3, promptText: 'p', ask, check });
  assert.deepEqual(repairs.map((c) => [c.id, c.repairOf, c.round]), [[3, 0, 1], [4, 3, 2]]);
  assert.deepEqual(asked, [3, 4]);
  assert.match(repairs[0].feedback, /AssertionError/);

  const none = await runRepairs({ candidates, probes: [], rounds: 0, firstId: 3, promptText: 'p', ask, check });
  assert.deepEqual(none, []);
});

test('runTestFile düşen açık test satırını verir', async () => {
  const file = path.join(scratch, 'public_test.py');
  fs.writeFileSync(file, 'from solution import solve\n\nassert solve(2) == 3\n');
  const verdict = await runTestFile('def solve(x):\n    return x\n', file);
  assert.equal(verdict.pass, false);
  assert.equal(verdict.at, 'assert solve(2) == 3');
});

test('repair seçicileri mevcut stratejilere eşlenir', () => {
  const pool = [{ id: 0, publicPass: false, signature: ['a'] }, { id: 4, publicPass: true, signature: ['b'] }];
  assert.equal(selectCandidate('repair', pool).chosen, selectCandidate('combined', pool).chosen);
  assert.equal(selectCandidate('repair+public', pool).chosen, 4);
  assert.equal(isRepair('toString'), false);
  assert.throws(() => selectCandidate('repair+oracle', pool), /Bilinmeyen strateji/);
});

test('--repair-rounds ayrıştırılır ve doğrulanır', () => {
  assert.equal(parseArgs(['--out', 'x.jsonl']).strategy.length, 1);
  assert.equal(parseArgs(['--out', 'x.jsonl'])['repair-rounds'], 1);
  const opts = parseArgs(['--out', 'x.jsonl', '--strategy', 'repair,repair+codet', '--repair-rounds', '2']);
  assert.deepEqual(opts.strategy, ['repair', 'repair+codet']);
  assert.equal(opts['repair-rounds'], 2);
  assert.throws(() => parseArgs(['--out', 'x', '--repair-rounds', '1.5']), /repair-rounds/);
});

test('onarım uçtan uca: gizli test girdi olmaz, maliyet sayılır, analiz satırı ayrı', async () => {
  const { complete, repairPrompts } = fakeModel();
  const touched = [];
  const spied = ['readFileSync', 'copyFileSync', 'existsSync'].map((name) => {
    const original = fs[name];
    fs[name] = (...args) => {
      touched.push(String(args[0]));
      return original.apply(fs, args);
    };
    return [name, original];
  });
  let solved;
  try {
    solved = await solveTask(loadTask(taskDir), {
      complete, strategies: ['combined', 'repair'], model: 'cheap', samples: 2, temperature: 0.8,
    });
  } finally {
    for (const [name, original] of spied) fs[name] = original;
  }
  assert.ok(touched.length);
  assert.ok(touched.every((file) => path.basename(file) !== 'test.py'), touched.join('\n'));

  assert.equal(repairPrompts.length, 2);
  const hiddenOnly = hiddenSource.split('\n').map((l) => l.trim())
    .filter((l) => l.startsWith('assert') && !publicSource.includes(l) && !promptSource.includes(l.slice(7)));
  assert.ok(hiddenOnly.length > 3);
  for (const prompt of repairPrompts) {
    assert.match(prompt, /ZeroDivisionError/);
    assert.match(prompt, /assert solve\(0, \[\('put', 1, 7\), \('get', 1\)\]\) == \[None\]/);
    assert.ok(!prompt.includes(taskDir));
    assert.doesNotMatch(prompt, /\btest\.py/);
    for (const line of hiddenOnly) assert.ok(!prompt.includes(line), line);
  }

  assert.deepEqual(solved.repairs.map((c) => [c.id, c.repairOf, c.publicPass]), [[3, 0, true], [4, 1, true]]);
  assert.equal(solved.outcomes.combined.chosen, 0);
  assert.equal(solved.outcomes.repair.chosen, 3);
  assert.equal(solved.usage.repairs.total, 30);
  assert.equal(strategyCost('repair', solved).total, strategyCost('combined', solved).total + 30);

  const verdicts = await scoreHidden(solved, path.join(taskDir, 'test.py'));
  assert.equal(verdicts.get(0).pass, false);
  assert.equal(verdicts.get(3).pass, true);
  const rows = buildRows(solved, verdicts, { run: 'test', model: 'cheap', samples: 2, temp: 0.8 });
  const repairRow = rows.find((r) => r.strategy === 'repair');
  assert.equal(repairRow.selectedPass, true);
  assert.equal(repairRow.repairRounds, 1);
  assert.equal(repairRow.repairs.length, 2);
  assert.equal(rows.find((r) => r.strategy === 'combined').repairs, undefined);

  const file = path.join(scratch, 'rows.jsonl');
  fs.writeFileSync(file, rows.map((r) => JSON.stringify(r)).join('\n') + '\n');
  const analysis = spawnSync(process.execPath, [path.join(root, 'bench', 'analyze.mjs'), file], { encoding: 'utf8' });
  assert.equal(analysis.status, 0, analysis.stderr);
  assert.match(analysis.stdout, /\| combined \| cheap \| 2 \| 0\.8 \| 1 \| 0 \| %0\.0 \| %0\.0 \| %0\.0 \|/);
  assert.match(analysis.stdout, /\| repair R=1 \| cheap \| 2 \| 0\.8 \| 1 \| 0 \| %0\.0 \| %100\.0 \| %0\.0 \| [\d.]+ \| - \| 2\.0 \| 75 \| 0 \|/);
  assert.match(analysis.stdout, /onarımlı havuzda oracle[^\n]*\n {2}repair R=1: %100\.0 \(ucuz adaylarda %0\.0\)/);
});

test('repair+public açık test yoksa atlanır, repair imzayla çalışır', async () => {
  const task = { ...loadTask(taskDir), publicTest: null };
  const solved = await solveTask(task, {
    complete: fakeModel([BROKEN, reference]).complete, strategies: ['repair', 'repair+public'], model: 'cheap', samples: 2, temperature: 0.8,
  });
  assert.deepEqual(solved.skipped, ['repair+public']);
  assert.equal(solved.candidates[0].publicPass, null);
  assert.deepEqual(solved.repairs.map((c) => c.repairOf), [0]);
  assert.match(solved.repairs[0].feedback, /^- solve\(0, [^\n]*\) raised ZeroDivisionError/);
  assert.equal(solved.outcomes.repair.chosen, 1);
});
