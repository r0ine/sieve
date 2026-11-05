// SPDX-License-Identifier: PolyForm-Small-Business-1.0.0
// `sieve solve`: sahte sağlayıcı, gerçek python sandbox'ı, ağ yok.
import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { main, parseFlags } from '../src/cli.mjs';
import { CODE_SYSTEM } from '../src/pipeline.mjs';
import { OLLAMA_BASE_URL, importedNames, providerEnv, resolveModel, strategyFor, taskPrompt } from '../src/solve.mjs';

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sieve-cli-'));
after(() => fs.rmSync(dir, { recursive: true, force: true }));

const testsFile = path.join(dir, 'public_test.py');
fs.writeFileSync(testsFile, 'from solution import solve\nassert solve([3, 1, 2]) == [1, 2, 3]\nassert solve([]) == []\n');

const PROMPT = 'Write solve(xs) that returns xs sorted ascending.\nsolve([2, 1]) == [1, 2]';
const RIGHT = 'def solve(xs):\n    return sorted(xs)\n';
const WRONG = 'def solve(xs):\n    return list(xs)\n';
const fence = (code) => '```python\n' + code + '```';

function fakeProviders(answers, { fail = false } = {}) {
  const seen = { models: [], env: undefined, prompts: [] };
  let next = 0;
  const make = (options = {}) => {
    seen.env = options.env;
    return {
      remaining: () => 5,
      complete: async ({ model, system, prompt }) => {
        seen.models.push(model);
        seen.prompts.push(prompt);
        if (fail) throw new Error('HTTP 500 upstream');
        const usage = { input: 20, output: 10, thinking: 0, total: 30 };
        if (system !== CODE_SYSTEM) return { text: '```json\n["[5, 4, 4]", "[-1, 0]", "[]"]\n```', usage, model };
        const code = answers[next % answers.length];
        next += 1;
        return { text: fence(code), usage, model };
      },
    };
  };
  return { make, seen };
}

function capture() {
  const out = [];
  const err = [];
  return { io: { stdout: (s) => out.push(s), stderr: (s) => err.push(s) }, out, err };
}

test('bayraklar: --a b ve --a=b, sayılar ve stratejiler denetlenir', () => {
  const opts = parseFlags('solve', ['--model', 'ollama:qwen2.5-coder:1.5b', '--samples=3', '--prompt', 'x']);
  assert.equal(opts.model, 'ollama:qwen2.5-coder:1.5b');
  assert.equal(opts.samples, 3);
  assert.throws(() => parseFlags('solve', ['--model', 'm', '--samples', '0']), /positive integer/);
  assert.throws(() => parseFlags('solve', ['--model', 'm', '--strategy', 'codet']), /unknown strategy/);
  assert.throws(() => parseFlags('solve', ['--model', 'm', '--port', '1']), /unknown flag/);
  assert.throws(() => parseFlags('serve', ['--model', 'm', '--host', '0.0.0.0']), /unknown flag/);
  assert.throws(() => parseFlags('solve', ['--prompt', 'x']), /--model is required/);
  assert.throws(() => parseFlags('solve', ['--model', 'm', '--sandbox', 'vm']), /--sandbox/);
});

test('ollama: kısayolu openai: + yerel adres, anahtar boşaltılır', () => {
  const local = resolveModel('ollama:qwen2.5-coder:1.5b');
  assert.deepEqual(local, { name: 'ollama:qwen2.5-coder:1.5b', model: 'openai:qwen2.5-coder:1.5b', ollama: true });
  const env = providerEnv([local], { OPENAI_COMPAT_BASE_URL: 'https://elsewhere/v1', OPENAI_COMPAT_API_KEY: 'sk-x', OTHER: '1' });
  assert.equal(env.OPENAI_COMPAT_BASE_URL, OLLAMA_BASE_URL);
  assert.equal(env.OPENAI_COMPAT_API_KEY, '');
  assert.equal(env.OTHER, '1');
  assert.throws(() => providerEnv([local, resolveModel('openai:gpt-x')], {}), /cannot be mixed/);
  assert.throws(() => resolveModel('ollama:'), /needs a model name/);
  assert.throws(() => resolveModel('no-such-model'), /unknown model/);
});

test('istem solve adını anmıyorsa eklenir; testler başka ad içe aktarıyorsa eklenmez', () => {
  assert.equal(taskPrompt(PROMPT).text, PROMPT);
  assert.match(taskPrompt('Sort a list.').text, /entry-point function `solve`\.$/);
  assert.deepEqual(importedNames('from solution import add, mul as m\nimport solution\nsolution.div(1)'), ['add', 'mul', 'div']);
  const other = taskPrompt('Add two numbers.', 'from solution import add\nassert add(1, 2) == 3\n');
  assert.equal(other.text, 'Add two numbers.');
  assert.match(other.notes[0], /tests import add/);
  assert.match(taskPrompt('x', 'assert True\n').notes[0], /never mentions `solution`/);
  assert.equal(strategyFor('combined', { hasTests: false }), 'codet');
  assert.equal(strategyFor('combined', { hasTests: true, hasStrong: true }), 'router');
  assert.equal(strategyFor('repair', { hasTests: false }), 'repair');
});

test('solve: testle seçilen kod stdout, güçlü sinyal özeti stderr', async () => {
  const fake = fakeProviders([WRONG, RIGHT, RIGHT]);
  const { io, out, err } = capture();
  const code = await main(['solve', '--model', 'ollama:qwen2.5-coder:1.5b', '--prompt', PROMPT, '--tests', testsFile, '--samples', '3'], { io, makeProviders: fake.make });
  assert.equal(code, 0, err.join('\n'));
  assert.equal(out.join(''), RIGHT);
  assert.equal(fake.seen.env.OPENAI_COMPAT_BASE_URL, OLLAMA_BASE_URL);
  assert.ok(fake.seen.models.every((m) => m === 'openai:qwen2.5-coder:1.5b'));
  const summary = err.join('\n');
  assert.match(summary, /3\/3 candidates usable, strategy combined, agreement 0\.67, \d+ tokens/);
  assert.match(summary, /strong signal: the chosen code passes your tests \(2\/3 passed\)/);
});

test('solve: test yoksa uzlaşmayla seçer ve zayıf sinyal der', async () => {
  const fake = fakeProviders([RIGHT, WRONG, RIGHT]);
  const { io, out, err } = capture();
  const code = await main(['solve', '--model', 'ollama:m', '--prompt', 'Sort xs ascending.', '--samples', '3'], { io, makeProviders: fake.make });
  assert.equal(code, 0, err.join('\n'));
  assert.equal(out.join(''), RIGHT);
  assert.match(err.join('\n'), /strategy codet, agreement 0\.67/);
  assert.match(err.join('\n'), /weak signal/);
  assert.ok(fake.seen.prompts.some((p) => p.includes('Name the entry-point function `solve`')));
});

test('solve: hiçbir aday testi geçmezse kod yine basılır, çıkış kodu 3', async () => {
  const fake = fakeProviders([WRONG]);
  const { io, out, err } = capture();
  const code = await main(['solve', '--model', 'ollama:m', '--prompt', PROMPT, '--tests', testsFile, '--samples', '2'], { io, makeProviders: fake.make });
  assert.equal(code, 3);
  assert.equal(out.join(''), WRONG);
  assert.match(err.join('\n'), /no candidate passed your tests \(0\/2\)/);
});

test('solve: tüm çağrılar düşerse stdout boş, çıkış kodu 1', async () => {
  const fake = fakeProviders([], { fail: true });
  const { io, out, err } = capture();
  const code = await main(['solve', '--model', 'ollama:m', '--prompt', PROMPT, '--samples', '2'], { io, makeProviders: fake.make });
  assert.equal(code, 1);
  assert.equal(out.length, 0);
  assert.match(err.join('\n'), /no usable candidate \(2\/2 model calls failed\): HTTP 500/);
});

test('solve: hatalı kullanım 2 döner, yardım metni stderr', async () => {
  const { io, err } = capture();
  assert.equal(await main(['solve', '--model', 'ollama:m'], { io }), 2);
  assert.match(err.at(-1), /--prompt or --prompt-file is required/);
  assert.equal(await main(['solve', '--model', 'ollama:m', '--prompt', 'x', '--tests', path.join(dir, 'nope.py')], { io }), 2);
  assert.equal(await main(['--help'], { io }), 0);
  assert.match(err.at(-1), /^usage:/);
  assert.equal(await main(['frobnicate'], { io }), 2);
});
