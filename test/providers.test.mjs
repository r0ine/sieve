// SPDX-License-Identifier: PolyForm-Small-Business-1.0.0
// Ağa çıkmaz: fetch sahte, bekleme anında.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { PassThrough } from 'node:stream';
import { readFile, writeFile } from 'node:fs/promises';
import { BudgetError, classifyFailure, createProviders, knownModels, retryDelayFrom } from '../src/providers.mjs';

const FAKE_KEY = 'fake-gemini-key-for-tests';

function geminiReply(text) {
  return new Response(JSON.stringify({
    candidates: [{ content: { parts: [{ text: 'düşünce', thought: true }, { text }] } }],
    usageMetadata: { promptTokenCount: 10, candidatesTokenCount: 5, thoughtsTokenCount: 20, totalTokenCount: 35 },
  }), { status: 200 });
}

function build(fetchImpl, extra = {}) {
  const waits = [];
  const providers = createProviders({
    env: { GEMINI_API_KEY: FAKE_KEY },
    fetchImpl,
    sleep: async (ms) => { waits.push(ms); },
    random: () => 0,
    minIntervals: { 'gemini-4-argon': 0 },
    ...extra,
  });
  return { providers, waits };
}

test('gemini cevabı düşünce parçası olmadan döner, token alanları ayrılır', async () => {
  let seenHeaders;
  const { providers } = build(async (url, init) => {
    seenHeaders = init.headers;
    assert.match(url, /gemini-3\.5-flash:generateContent$/);
    return geminiReply('cevap');
  });
  const answer = await providers.complete({ model: 'gemini-3.5-flash', prompt: 'p' });
  assert.equal(answer.text, 'cevap');
  assert.deepEqual(answer.usage, { input: 10, output: 5, thinking: 20, total: 35 });
  assert.equal(seenHeaders['x-goog-api-key'], FAKE_KEY);
});

test('429 sonrası üstel geri çekilmeyle yeniden dener', async () => {
  let calls = 0;
  const { providers, waits } = build(async () => {
    calls += 1;
    return calls < 3 ? new Response('{}', { status: 429 }) : geminiReply('tamam');
  });
  const answer = await providers.complete({ model: 'gemini-4-argon', prompt: 'p' });
  assert.equal(answer.text, 'tamam');
  assert.deepEqual(waits, [1000, 2000]);
  assert.equal(providers.attempts('gemini-4-argon'), 3);
});

test('bütçe her denemeyi sayar ve dolunca BudgetError fırlatır', async () => {
  const { providers } = build(async () => new Response('{}', { status: 429 }), { budgets: { 'gemini-4-argon': 2 } });
  await assert.rejects(providers.complete({ model: 'gemini-4-argon', prompt: 'p' }), BudgetError);
  assert.equal(providers.remaining('gemini-4-argon'), 0);
  await assert.rejects(providers.complete({ model: 'gemini-4-argon', prompt: 'p' }), BudgetError);
});

test('tekrarlayan ağ hatası mesajda açıkça yazılır, anahtar sızmaz', async () => {
  const { providers } = build(async () => {
    throw new TypeError('fetch failed', { cause: Object.assign(new Error('ssl'), { code: 'ERR_SSL_INVALID_SESSION_ID' }) });
  });
  const error = await providers.complete({ model: 'gemini-3.5-flash', prompt: 'p' }).catch((e) => e);
  assert.match(error.message, /aynı ağ hatası 4 denemede tekrarladı \(ağ: ERR_SSL_INVALID_SESSION_ID\)/);
  assert.equal(error.message.includes(FAKE_KEY), false);
});

test('400 yeniden denenmez, gövdedeki anahtar maskelenir', async () => {
  let calls = 0;
  const { providers } = build(async () => {
    calls += 1;
    return new Response(`bad key ${FAKE_KEY}`, { status: 400 });
  });
  const error = await providers.complete({ model: 'gemini-3.5-flash', prompt: 'p' }).catch((e) => e);
  assert.equal(calls, 1);
  assert.equal(error.message.includes(FAKE_KEY), false);
});

test('uzun kota beklemesi istenirse yeniden denenmez', () => {
  const body = JSON.stringify({ error: { details: [{ '@type': 'type.googleapis.com/google.rpc.RetryInfo', retryDelay: '3600s' }] } });
  const error = Object.assign(new Error('Gemini HTTP 429'), { status: 429, retryAfterMs: retryDelayFrom(body, null) });
  assert.equal(classifyFailure(error).retry, false);
  assert.equal(retryDelayFrom('', '7'), 7000);
});

test('bilinmeyen model reddedilir', async () => {
  const { providers } = build(async () => geminiReply('x'));
  await assert.rejects(providers.complete({ model: 'gpt-9', prompt: 'p' }), /Bilinmeyen model/);
});

function fakeCodex(onInput) {
  return (command, args, options) => {
    assert.equal(command, 'codex');
    assert.deepEqual(args.slice(0, 6), ['exec', '--skip-git-repo-check', '--sandbox', 'read-only', '-c', 'model_reasoning_effort=medium']);
    assert.equal(args.at(-1), '-');
    assert.deepEqual(options.stdio, ['pipe', 'ignore', 'ignore']);
    const child = new EventEmitter();
    child.stdin = new PassThrough();
    let input = '';
    child.stdin.setEncoding('utf8');
    child.stdin.on('data', (chunk) => { input += chunk; });
    child.stdin.on('end', () => onInput({ child, input, output: args.at(-2) }));
    child.kill = () => { child.emit('close', null); return true; };
    return child;
  };
}

test('codex-cli birleşik istemi stdin ile alır ve çıktı dosyasını okur', async () => {
  let received;
  const spawnImpl = fakeCodex(async ({ child, input, output }) => {
    received = input;
    await writeFile(output, '  yanıt\n');
    child.emit('close', 0);
  });
  const { providers } = build(async () => { throw new Error('fetch çağrılmamalı'); }, {
    spawnImpl, minIntervals: { 'codex-cli': 0 },
  });
  const answer = await providers.complete({ model: 'codex-cli', system: 'kural', prompt: 'soru' });
  assert.equal(received, 'kural\n\nsoru');
  assert.equal(answer.text, 'yanıt');
  assert.deepEqual(answer.usage, { input: 0, output: 0, thinking: 0, total: 0, estimated: true });
});

test('codex-cli zaman aşımında süreci kapatır', async () => {
  let killed = false;
  const spawnImpl = fakeCodex(({ child }) => {
    child.kill = () => { killed = true; child.emit('close', null); return true; };
  });
  const { providers } = build(async () => {}, {
    spawnImpl, codexTimeoutMs: 10, maxAttempts: 1, minIntervals: { 'codex-cli': 0 },
  });
  await assert.rejects(providers.complete({ model: 'codex-cli', prompt: 'soru' }), /zaman aşımı/);
  assert.equal(killed, true);
});

test('codex-cli boş çıktı dosyasını reddeder', async () => {
  const spawnImpl = fakeCodex(async ({ child, output }) => {
    await writeFile(output, '  \n');
    child.emit('close', 0);
  });
  const { providers } = build(async () => {}, { spawnImpl, minIntervals: { 'codex-cli': 0 } });
  await assert.rejects(providers.complete({ model: 'codex-cli', prompt: 'soru' }), /boş cevap/);
});

test('codex-cli aynı anda en fazla iki süreç başlatır', async () => {
  const pending = [];
  const spawnImpl = fakeCodex(({ child, output }) => { pending.push({ child, output }); });
  const { providers } = build(async () => {}, { spawnImpl, minIntervals: { 'codex-cli': 0 } });
  const calls = Array.from({ length: 3 }, () => providers.complete({ model: 'codex-cli', prompt: 'soru' }));
  const waitFor = async (count) => {
    for (let i = 0; i < 100 && pending.length < count; i += 1) {
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
  };
  await waitFor(2);
  await new Promise((resolve) => setTimeout(resolve, 50));
  assert.equal(pending.length, 2);
  await writeFile(pending[0].output, 'ilk');
  pending[0].child.emit('close', 0);
  await waitFor(3);
  assert.equal(pending.length, 3);
  for (const entry of pending.slice(1)) {
    await writeFile(entry.output, 'sonraki');
    entry.child.emit('close', 0);
  }
  assert.deepEqual((await Promise.all(calls)).map((answer) => answer.text).sort(), ['ilk', 'sonraki', 'sonraki']);
});

function fakeCli(onStart) {
  return (command, args, options) => {
    assert.match(command, /^(opencode|kilo|copilot)(\.cmd)?$/);
    assert.deepEqual(options.stdio, ['ignore', 'pipe', 'pipe']);
    assert.equal(options.windowsHide, true);
    const child = new EventEmitter();
    child.stdout = new PassThrough();
    child.stderr = new PassThrough();
    child.kill = () => { child.emit('close', null); return true; };
    onStart({ command, args, child });
    return child;
  };
}

test('CLI modelleri dosyadan istem alır ve token kullanımını tahmin eder', async () => {
  assert.equal(knownModels('opencode:opencode/glm-5.3-flash-free'), true);
  assert.equal(knownModels('kilo:kilo/cohere/north-mini-code:free'), true);
  assert.equal(knownModels('kilo:'), false);
  for (const [model, commandName] of [
    ['opencode:opencode/glm-5.3-flash-free', 'opencode'],
    ['kilo:kilo/cohere/north-mini-code:free', 'kilo'],
  ]) {
    let received;
    const spawnImpl = fakeCli(async ({ command, args, child }) => {
      try {
        assert.equal(command, process.platform === 'win32' ? `${commandName}.cmd` : commandName);
        assert.equal(args[0], 'run');
        assert.equal(args[args.indexOf('--model') + 1], model.slice(model.indexOf(':') + 1));
        assert.equal(args.includes('kural'), false);
        assert.equal(args.includes('soru'), false);
        received = commandName === 'kilo'
          ? args[1].split('\n\nAnswer directly')[0]
          : await readFile(args[args.indexOf('--file') + 1], 'utf8');
        await null;
        child.stdout.end('```python\nprint(1)\n```\n');
        child.emit('close', 0);
      } catch (error) {
        child.emit('error', error);
      }
    });
    const { providers } = build(async () => { throw new Error('fetch çağrılmamalı'); }, {
      spawnImpl, minIntervals: { [model]: 0 },
    });
    const answer = await providers.complete({ model, system: 'kural', prompt: 'soru' });
    assert.equal(received, 'kural\n\nsoru');
    assert.equal(answer.text, '```python\nprint(1)\n```');
    assert.deepEqual(answer.usage, { input: 3, output: 6, thinking: 0, total: 9, estimated: true });
  }
});

test('copilot: istemi -p ile verir, kota için çağrı bütçesi uygular', async () => {
  const model = 'copilot:gpt-5-mini';
  assert.equal(knownModels(model), true);
  const seen = [];
  const spawnImpl = fakeCli(({ args, child }) => {
    seen.push(args);
    queueMicrotask(() => { child.stdout.end('yanıt'); child.emit('close', 0); });
  });
  const { providers } = build(async () => {}, { spawnImpl, minIntervals: { [model]: 0 }, budgets: { [model]: 1 } });
  const answer = await providers.complete({ model, system: 'kural', prompt: 'soru' });
  assert.equal(answer.text, 'yanıt');
  assert.equal(seen[0][0], '-p');
  assert.match(seen[0][1], /^kural\n\nsoru\n\nAnswer directly/);
  assert.equal(seen[0][seen[0].indexOf('--model') + 1], 'gpt-5-mini');
  assert.ok(seen[0].includes('-s') && seen[0].includes('--no-ask-user'));
  await assert.rejects(providers.complete({ model, prompt: 'soru' }), /bütçe|Bütçe|limit/i);
});

test('CLI çıktısındaki ANSI ve araç günlükleri ayıklanır', async () => {
  const model = 'opencode:provider/model';
  const spawnImpl = fakeCli(({ child }) => {
    queueMicrotask(() => {
      child.stdout.end('\x1b[32mtool: read request.txt\x1b[0m\n> Read request.txt\nYanıt\n```python\nprint("tool: keep")\n```\n');
      child.emit('close', 0);
    });
  });
  const { providers } = build(async () => {}, { spawnImpl, minIntervals: { [model]: 0 } });
  const answer = await providers.complete({ model, prompt: 'soru' });
  assert.equal(answer.text, 'Yanıt\n```python\nprint("tool: keep")\n```');
});

test('CLI boş çıktıyı reddeder', async () => {
  const model = 'kilo:provider/model';
  const spawnImpl = fakeCli(({ child }) => {
    queueMicrotask(() => { child.stdout.end('tool: read request.txt\n\x1b[0m'); child.emit('close', 0); });
  });
  const { providers } = build(async () => {}, { spawnImpl, minIntervals: { [model]: 0 }, maxAttempts: 1 });
  await assert.rejects(providers.complete({ model, prompt: 'soru' }), /boş cevap/);
});

test('CLI zaman aşımında süreci kapatır', async () => {
  let killed = false;
  const model = 'opencode:provider/model';
  const spawnImpl = fakeCli(({ child }) => {
    child.kill = () => { killed = true; child.emit('close', null); return true; };
  });
  const { providers } = build(async () => {}, {
    spawnImpl, cliTimeoutMs: 10, maxAttempts: 1, minIntervals: { [model]: 0 },
  });
  await assert.rejects(providers.complete({ model, prompt: 'soru' }), /zaman aşımı/);
  assert.equal(killed, true);
});

test('CLI sağlayıcıları birlikte en fazla iki süreç çalıştırır', async () => {
  const pending = [];
  const spawnImpl = fakeCli(({ child }) => { pending.push(child); });
  const { providers } = build(async () => {}, {
    spawnImpl,
    minIntervals: { 'opencode:provider/model': 0, 'kilo:provider/model': 0 },
  });
  const calls = ['opencode:provider/model', 'kilo:provider/model', 'opencode:provider/model']
    .map((model) => providers.complete({ model, prompt: 'soru' }));
  const waitFor = async (count) => {
    for (let i = 0; i < 100 && pending.length < count; i += 1) {
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
  };
  await waitFor(2);
  assert.equal(pending.length, 2);
  pending[0].stdout.end('ilk');
  pending[0].emit('close', 0);
  await waitFor(3);
  assert.equal(pending.length, 3);
  for (const child of pending.slice(1)) {
    child.stdout.end('sonraki');
    child.emit('close', 0);
  }
  assert.deepEqual((await Promise.all(calls)).map((answer) => answer.text).sort(), ['ilk', 'sonraki', 'sonraki']);
});

test('CLI çağrıları arasında bir saniyelik aralık ayrılır', async () => {
  const spawnImpl = fakeCli(({ child }) => {
    queueMicrotask(() => { child.stdout.end('yanıt'); child.emit('close', 0); });
  });
  const { providers, waits } = build(async () => {}, { spawnImpl });
  await providers.complete({ model: 'opencode:provider/one', prompt: 'soru' });
  await providers.complete({ model: 'opencode:provider/two', prompt: 'soru' });
  assert.equal(waits.length, 1);
  assert.ok(waits[0] > 0 && waits[0] <= 1_000);
});

const COMPAT_KEY = 'fake-compat-key-for-tests';

function compatProviders(fetchImpl, env = {}, extra = {}) {
  const waits = [];
  const providers = createProviders({
    env: { OPENAI_COMPAT_BASE_URL: 'http://localhost:11434/v1/', OPENAI_COMPAT_API_KEY: COMPAT_KEY, ...env },
    fetchImpl,
    sleep: async (ms) => { waits.push(ms); },
    random: () => 0,
    ...extra,
  });
  return { providers, waits };
}

const compatReply = (body) => new Response(JSON.stringify(body), { status: 200 });

test('openai: uç noktaya mesajları, model adını ve anahtarı gönderir; usage yanıttan gelir', async () => {
  assert.equal(knownModels('openai:llama3.1:8b'), true);
  assert.equal(knownModels('openai:llama3.1'), true);
  assert.equal(knownModels('openai:'), false);
  assert.ok(knownModels().includes('openai:<model>'));
  let seen;
  const { providers } = compatProviders(async (url, init) => {
    seen = { url, init, body: JSON.parse(init.body) };
    return compatReply({
      choices: [{ message: { content: ' cevap \n' } }],
      usage: { prompt_tokens: 12, completion_tokens: 8, total_tokens: 20 },
    });
  });
  const answer = await providers.complete({ model: 'openai:qwen3-8b', system: 'kural', prompt: 'soru', temperature: 0.2, maxTokens: 64 });
  assert.equal(seen.url, 'http://localhost:11434/v1/chat/completions');
  assert.equal(seen.init.method, 'POST');
  assert.equal(seen.init.headers.Authorization, `Bearer ${COMPAT_KEY}`);
  assert.deepEqual(seen.body, {
    model: 'qwen3-8b',
    messages: [{ role: 'system', content: 'kural' }, { role: 'user', content: 'soru' }],
    temperature: 0.2,
    max_tokens: 64,
  });
  assert.equal(answer.text, 'cevap');
  assert.deepEqual(answer.usage, { input: 12, output: 8, thinking: 0, total: 20 });
});

test('gateway: kendi adresine ve anahtarına gider, openai: ayarlarına karışmaz', async () => {
  assert.equal(knownModels('gateway:ornek-model'), true);
  assert.equal(knownModels('gateway:'), false);
  assert.ok(knownModels().includes('gateway:<model>'));
  let seen;
  const { providers } = compatProviders(async (url, init) => {
    seen = { url, headers: init.headers, body: JSON.parse(init.body) };
    return compatReply({ choices: [{ message: { content: 'tamam' } }] });
  }, { GATEWAY_API_KEY: 'lb-test-anahtar', GATEWAY_BASE_URL: 'https://api.example.test/v1' });
  const answer = await providers.complete({ model: 'gateway:ornek-model', prompt: 'soru' });
  assert.equal(seen.url, 'https://api.example.test/v1/chat/completions');
  assert.equal(seen.headers.Authorization, 'Bearer lb-test-anahtar');
  assert.equal(seen.body.model, 'ornek-model');
  assert.equal(answer.text, 'tamam');
});

test('gateway: anahtar yoksa ağa hiç çıkmaz', async () => {
  let called = false;
  const { providers } = compatProviders(async () => { called = true; return compatReply({}); }, {}, { maxAttempts: 1 });
  await assert.rejects(providers.complete({ model: 'gateway:ornek-model', prompt: 'soru' }), /GATEWAY_(API_KEY|BASE_URL)/);
  assert.equal(called, false);
});

test('openai: anahtar yoksa Authorization eklenmez, usage yoksa karakter/4 ile tahmin edilir', async () => {
  let headers;
  let body;
  const { providers } = compatProviders(async (_url, init) => {
    headers = init.headers;
    body = JSON.parse(init.body);
    return compatReply({ choices: [{ message: { content: 'abcdefgh' } }] });
  }, { OPENAI_COMPAT_API_KEY: undefined });
  const answer = await providers.complete({ model: 'openai:yerel', prompt: 'abcd' });
  assert.equal('Authorization' in headers, false);
  assert.deepEqual(body.messages, [{ role: 'user', content: 'abcd' }]);
  assert.deepEqual(answer.usage, { input: 1, output: 2, thinking: 0, total: 3, estimated: true });
});

test('openai: taban adres yoksa istek atılmaz', async () => {
  let calls = 0;
  const { providers } = compatProviders(async () => { calls += 1; }, { OPENAI_COMPAT_BASE_URL: '' });
  await assert.rejects(providers.complete({ model: 'openai:m', prompt: 'p' }), /OPENAI_COMPAT_BASE_URL/);
  assert.equal(calls, 0);
});

test('openai: 429 ve 5xx yeniden denenir, 4xx denenmez', async () => {
  const statuses = [429, 503];
  let calls = 0;
  const retried = compatProviders(async () => {
    calls += 1;
    return statuses.length ? new Response('{}', { status: statuses.shift() }) : compatReply({ choices: [{ message: { content: 'tamam' } }] });
  });
  const answer = await retried.providers.complete({ model: 'openai:m', prompt: 'p' });
  assert.equal(answer.text, 'tamam');
  assert.equal(calls, 3);
  assert.deepEqual(retried.waits, [1000, 2000]);

  let badCalls = 0;
  const bad = compatProviders(async () => { badCalls += 1; return new Response('model yok', { status: 404 }); });
  const error = await bad.providers.complete({ model: 'openai:m', prompt: 'p' }).catch((e) => e);
  assert.equal(badCalls, 1);
  assert.match(error.message, /HTTP 404/);
});

test('openai: hata gövdesindeki ve mesajdaki anahtar maskelenir', async () => {
  const { providers } = compatProviders(async () => new Response(`geçersiz anahtar ${COMPAT_KEY}`, { status: 401 }));
  const error = await providers.complete({ model: 'openai:m', prompt: 'p' }).catch((e) => e);
  assert.equal(error.message.includes(COMPAT_KEY), false);
  assert.equal(String(error.cause?.message).includes(COMPAT_KEY), false);
});

test('openai: boş cevap reddedilir', async () => {
  const { providers } = compatProviders(async () => compatReply({ choices: [{ message: { content: '  ' }, finish_reason: 'length' }] }), {}, { maxAttempts: 1 });
  await assert.rejects(providers.complete({ model: 'openai:m', prompt: 'p' }), /boş cevap.*length/);
});

test('openai: çağrı bütçesi her denemeyi sayar', async () => {
  const model = 'openai:m';
  const { providers } = compatProviders(async () => new Response('{}', { status: 500 }), {}, { budgets: { [model]: 2 } });
  await assert.rejects(providers.complete({ model, prompt: 'p' }), BudgetError);
  assert.equal(providers.attempts(model), 2);
  assert.equal(providers.remaining(model), 0);
});

test('NVIDIA modeli doğrudan chat/completions çağırır, hata gövdesinde anahtar kalmaz', async () => {
  const key = 'nvapi-test-key-0123456789abcdef';
  const seen = [];
  const providers = createProviders({
    env: { NVIDIA_DEEPSEEK_KEY: key },
    sleep: async () => {},
    random: () => 0,
    fetchImpl: async (url, init) => {
      seen.push({ url, init });
      if (seen.length === 1) return new Response(`bad key ${key}`, { status: 401 });
      return new Response(JSON.stringify({
        choices: [{ message: { content: ' cevap ' } }],
        usage: { prompt_tokens: 4, completion_tokens: 3, total_tokens: 7 },
      }), { status: 200 });
    },
  });

  const failure = await providers.complete({ model: 'deepseek-v4.1-flash', prompt: 'p' }).catch((e) => e);
  assert.match(failure.message, /HTTP 401/);
  assert.ok(!failure.message.includes(key));
  assert.equal(seen.length, 1);

  const answer = await providers.complete({ model: 'deepseek-v4.1-flash', system: 's', prompt: 'p' });
  assert.equal(answer.text, 'cevap');
  assert.deepEqual(answer.usage, { input: 4, output: 3, thinking: 0, total: 7 });
  const { url, init } = seen[1];
  assert.equal(url, 'https://integrate.api.nvidia.com/v1/chat/completions');
  assert.equal(init.headers.Authorization, `Bearer ${key}`);
  assert.equal(JSON.parse(init.body).model, 'deepseek-ai/deepseek-v4.1-flash');
});
