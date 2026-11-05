// SPDX-License-Identifier: PolyForm-Small-Business-1.0.0
import { test } from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { completedTasks, parseArgs, retryFailed } from '../bench/run.mjs';

test('devam bayrağı ve tekrar sayısı ayrıştırılır', () => {
  const opts = parseArgs(['--out', 'sonuc.jsonl', '--resume', '--model', 'opencode:provider/model', '--retry-rounds', '3']);
  assert.equal(opts.resume, true);
  assert.equal(opts['retry-rounds'], 3);
  assert.equal(opts.model, 'opencode:provider/model');
  assert.throws(() => parseArgs(['--out', 'x', '--retry-rounds', '-1']), /retry-rounds/);
});

test('tamamlanan görev adları JSONL dosyasından okunur', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'sieve-resume-test-'));
  try {
    const file = path.join(dir, 'sonuc.jsonl');
    assert.deepEqual([...completedTasks(file)], []);
    await writeFile(file, '{"task":"t01_a","strategy":"single"}\n{"task":"t02_b","strategy":"public"}\n');
    assert.deepEqual([...completedTasks(file)], ['t01_a', 't02_b']);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('yalnız başarısız görevler beklenip yeniden denenir', async () => {
  const calls = [];
  const waits = [];
  const pending = await retryFailed(['t01', 't02'], 2, 2, async (name) => {
    calls.push(name);
    return name === 't01' || calls.filter((call) => call === 't02').length === 2;
  }, async (ms) => { waits.push(ms); });
  assert.deepEqual(calls, ['t01', 't02', 't02']);
  assert.deepEqual(waits, [5_000]);
  assert.deepEqual(pending, []);

  const exhausted = await retryFailed(['t03'], 2, 1, async () => false, async (ms) => { waits.push(ms); });
  assert.deepEqual(exhausted, ['t03']);
  assert.equal(waits.length, 3);
});
