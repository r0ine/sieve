// SPDX-License-Identifier: PolyForm-Small-Business-1.0.0
// Ağsız uçtan uca: sahte model, gerçek görev (t45), gerçek python, analyze.mjs çıktısı.
import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { CODE_SYSTEM, loadTask, solveTask } from '../src/pipeline.mjs';
import { buildRows, scoreHidden } from '../src/report.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const taskDir = path.join(root, 'bench', 'tasks', 't45_lru_cache');
const reference = fs.readFileSync(path.join(taskDir, 'reference.py'), 'utf8');
const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sieve-pipe-'));
after(() => fs.rmSync(outDir, { recursive: true, force: true }));

// Açık örnekleri geçer, get sonrası tazelemeyi unutur: yalnızca ek girdiler ayırt edebilir.
const FIFO = `def solve(capacity, operations):
    from collections import OrderedDict
    store = OrderedDict()
    answers = []
    for op in operations:
        if op[0] == 'put':
            if capacity == 0:
                continue
            if op[1] not in store and len(store) >= capacity:
                store.popitem(last=False)
            store[op[1]] = op[2]
        else:
            answers.append(store.get(op[1]))
    return answers
`;

const fence = (code) => '```python\n' + code + '```';

function fakeModel() {
  const prompts = [];
  let codeCalls = 0;
  const complete = async ({ model, system, prompt }) => {
    prompts.push(prompt);
    const usage = { input: 10, output: 5, thinking: 0, total: 15 };
    if (system !== CODE_SYSTEM) {
      return { text: '```json\n["2, [(\'put\', 1, 1), (\'put\', 2, 2), (\'get\', 1), (\'put\', 3, 3), (\'get\', 2)]", "0, []"]\n```', usage, model };
    }
    if (model === 'strong') return { text: fence(reference), usage, model };
    codeCalls += 1;
    return { text: fence(codeCalls === 1 ? FIFO : reference), usage, model };
  };
  return { complete, prompts };
}

test('loadTask gizli testi döndürmez', () => {
  const task = loadTask(taskDir);
  assert.deepEqual(Object.keys(task).sort(), ['name', 'prompt', 'publicTest']);
  assert.match(task.publicTest, /public_test\.py$/);
});

test('aynı adaylarda stratejiler ayrışır, analiz tablosu oracle ayrı etiketli', async () => {
  const { complete, prompts } = fakeModel();
  const solved = await solveTask(loadTask(taskDir), {
    complete, strategies: ['single', 'public', 'codet', 'combined'], model: 'cheap', samples: 3, temperature: 0.8, threshold: 0.6,
  });
  const hiddenSource = fs.readFileSync(path.join(taskDir, 'test.py'), 'utf8');
  assert.ok(prompts.every((p) => !p.includes(hiddenSource.trim().split('\n').at(-1))));

  assert.equal(solved.outcomes.single.chosen, 0);
  assert.equal(solved.outcomes.public.chosen, 0);
  assert.equal(solved.outcomes.codet.chosen, 1);
  assert.equal(solved.outcomes.combined.chosen, 1);
  assert.equal(solved.outcomes.codet.agreement, 2 / 3);

  const verdicts = await scoreHidden(solved, path.join(taskDir, 'test.py'));
  assert.equal(verdicts.get(0).pass, false);
  assert.equal(verdicts.get(1).pass, true);

  const rows = buildRows(solved, verdicts, { run: 'test', model: 'cheap', samples: 3, temp: 0.8 });
  const file = path.join(outDir, 'rows.jsonl');
  fs.writeFileSync(file, rows.map((r) => JSON.stringify(r)).join('\n') + '\n');
  const analysis = spawnSync(process.execPath, [path.join(root, 'bench', 'analyze.mjs'), file], { encoding: 'utf8' });
  assert.equal(analysis.status, 0, analysis.stderr);
  assert.match(analysis.stdout, /oracle \(üst sınır, seçim değil\)/);
  assert.match(analysis.stdout, /\| single \| cheap \| 3 \| 0\.8 \| 1 \| 0 \| %66\.7 \| %0\.0 \| %100\.0 \|/);
  assert.match(analysis.stdout, /\| codet \| cheap \| 3 \| 0\.8 \| 1 \| 0 \| %66\.7 \| %100\.0 \| %100\.0 \|/);
});

test('router düşük uzlaşmada güçlü modele gider, bütçe yoksa gitmez', async () => {
  const run = (remaining) => solveTask(loadTask(taskDir), {
    complete: fakeModel().complete, strategies: ['router'], model: 'cheap', samples: 3, temperature: 0.8,
    threshold: 0.9, strongModel: 'strong', strongRemaining: () => remaining,
  });
  const escalated = await run(5);
  assert.equal(escalated.outcomes.router.route.escalated, true);
  assert.equal(escalated.outcomes.router.chosen, 3);
  assert.equal(escalated.strong.model, 'strong');

  const blocked = await run(0);
  assert.equal(blocked.outcomes.router.route.escalated, false);
  assert.match(blocked.outcomes.router.route.reason, /bütçe/);
});
