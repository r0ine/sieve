// SPDX-License-Identifier: PolyForm-Small-Business-1.0.0
// `sieve serve`: 127.0.0.1'de rastgele portta gerçek HTTP; model ve çoğu yerde seçim sahte.
import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { CODE_SYSTEM } from '../src/pipeline.mjs';
import { checkHost, checkOrigin, startServer, taskFromMessages } from '../src/serve.mjs';

const CODE = 'def solve(a, b):\n    return a + b\n';
const logs = [];
let release;
let holding;
const held = new Promise((resolve) => { holding = resolve; });
let server;
let port;

const fakeSolve = async ({ prompt }) => {
  if (prompt === 'hold') {
    await new Promise((resolve) => {
      release = resolve;
      holding();
    });
  }
  if (prompt === 'nothing') return { code: null, failed: 5, candidates: 5, firstError: 'HTTP 500 upstream' };
  return {
    code: CODE, strategy: 'codet', candidates: 5, usable: 5, agreement: 0.8,
    usage: { input: 100, output: 50, total: 150 },
  };
};

before(async () => {
  server = await startServer({ port: 0, model: 'openai:m', displayName: 'ollama:m', maxActive: 1, maxBody: 2048, solve: fakeSolve, log: (line) => logs.push(line) });
  port = server.address().port;
});
after(() => new Promise((resolve) => server.close(resolve)));

function request({ method = 'POST', path = '/v1/chat/completions', headers = {}, body } = {}) {
  const payload = body === undefined ? undefined : typeof body === 'string' ? body : JSON.stringify(body);
  return new Promise((resolve, reject) => {
    const req = http.request({
      host: '127.0.0.1', port, method, path,
      headers: { 'Content-Type': 'application/json', ...headers },
    }, (res) => {
      let text = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => { text += chunk; });
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, text, json: () => JSON.parse(text) }));
    });
    req.on('error', reject);
    req.end(payload);
  });
}

const chat = (content, extra = {}) => ({ model: 'whatever', messages: [{ role: 'system', content: 'be nice' }, { role: 'user', content }], ...extra });

test('yalnızca 127.0.0.1 dinlenir', () => {
  assert.equal(server.address().address, '127.0.0.1');
});

test('Host ve Origin denetimi', () => {
  assert.equal(checkHost('127.0.0.1:8787', 8787), true);
  assert.equal(checkHost('localhost:8787', 8787), true);
  assert.equal(checkHost('[::1]:8787', 8787), true);
  assert.equal(checkHost('evil.example:8787', 8787), false);
  assert.equal(checkHost('127.0.0.1:9999', 8787), false);
  assert.equal(checkHost('127.0.0.1.evil.example', 80), false);
  assert.equal(checkHost(undefined, 8787), false);
  assert.equal(checkOrigin(undefined), true);
  assert.equal(checkOrigin('http://localhost:3000'), true);
  assert.equal(checkOrigin('http://evil.example'), false);
  assert.equal(checkOrigin('null'), false);
});

test('son kullanıcı mesajı görev olur', () => {
  assert.equal(taskFromMessages([{ role: 'user', content: 'a' }, { role: 'assistant', content: 'b' }, { role: 'user', content: [{ type: 'text', text: 'c' }] }]), 'c');
  assert.equal(taskFromMessages([{ role: 'system', content: 'x' }]), '');
});

test('GET /v1/models', async () => {
  const res = await request({ method: 'GET', path: '/v1/models' });
  assert.equal(res.status, 200);
  assert.deepEqual(res.json().data.map((m) => m.id), ['ollama:m']);
});

test('POST /v1/chat/completions kodu OpenAI biçiminde döndürür', async () => {
  const res = await request({ body: chat('add two numbers'), headers: { Authorization: 'Bearer sk-do-not-log-1234' } });
  assert.equal(res.status, 200);
  const body = res.json();
  assert.equal(body.object, 'chat.completion');
  assert.equal(body.model, 'ollama:m');
  assert.equal(body.choices[0].message.content, '```python\n' + CODE.trimEnd() + '\n```');
  assert.deepEqual(body.usage, { prompt_tokens: 100, completion_tokens: 50, total_tokens: 150 });
  assert.equal(body.sieve.signal, 'weak');
  assert.ok(logs.length > 0);
  assert.ok(logs.every((line) => !line.includes('sk-do-not-log') && !line.includes('add two numbers')));
});

test('stream:true tek parça SSE ile gelir', async () => {
  const res = await request({ body: chat('add', { stream: true }) });
  assert.equal(res.status, 200);
  assert.match(res.headers['content-type'], /^text\/event-stream/);
  const events = res.text.split('\n\n').filter(Boolean);
  assert.equal(events.at(-1), 'data: [DONE]');
  const first = JSON.parse(events[0].slice('data: '.length));
  assert.equal(first.object, 'chat.completion.chunk');
  assert.match(first.choices[0].delta.content, /def solve/);
  assert.equal(JSON.parse(events[1].slice('data: '.length)).choices[0].finish_reason, 'stop');
});

test('yabancı Host ve Origin 403', async () => {
  const host = await request({ body: chat('x'), headers: { Host: `evil.example:${port}` } });
  assert.equal(host.status, 403);
  assert.equal(host.json().error.type, 'forbidden');
  const origin = await request({ body: chat('x'), headers: { Origin: 'https://evil.example' } });
  assert.equal(origin.status, 403);
});

test('anlamlı JSON hataları: 404, 405, 415, 400, 413, 502', async () => {
  assert.equal((await request({ method: 'GET', path: '/nope' })).status, 404);
  assert.equal((await request({ method: 'GET' })).status, 405);
  assert.equal((await request({ body: chat('x'), headers: { 'Content-Type': 'text/plain' } })).status, 415);
  const bad = await request({ body: '{not json' });
  assert.equal(bad.status, 400);
  assert.match(bad.json().error.message, /not valid JSON/);
  assert.equal((await request({ body: { messages: [] } })).status, 400);
  assert.equal((await request({ body: { messages: [{ role: 'system', content: 'x' }] } })).status, 400);
  const big = await request({ body: chat('x'.repeat(5000)) });
  assert.equal(big.status, 413);
  assert.equal(big.json().error.code, 413);
  const upstream = await request({ body: chat('nothing') });
  assert.equal(upstream.status, 502);
  assert.match(upstream.json().error.message, /no usable candidate \(5\/5 model calls failed\): HTTP 500/);
});

test('eşzamanlılık sınırı aşılınca 429 ve Retry-After', async () => {
  const first = request({ body: chat('hold') });
  await held;
  const rejected = await request({ body: chat('add') });
  assert.equal(rejected.status, 429);
  assert.equal(rejected.headers['retry-after'], '10');
  release();
  assert.equal((await first).status, 200);
  assert.equal((await request({ body: chat('add') })).status, 200);
});

test('gerçek seçim hattı: sahte model, gerçek sandbox', async () => {
  const complete = async ({ model, system }) => {
    const usage = { input: 10, output: 5, thinking: 0, total: 15 };
    if (system !== CODE_SYSTEM) return { text: '```json\n["1, 2", "-3, 3"]\n```', usage, model };
    return { text: '```python\n' + CODE + '```', usage, model };
  };
  const real = await startServer({ port: 0, complete, model: 'openai:m', samples: 2 });
  try {
    const res = await new Promise((resolve, reject) => {
      const req = http.request({ host: '127.0.0.1', port: real.address().port, method: 'POST', path: '/v1/chat/completions', headers: { 'Content-Type': 'application/json' } }, (r) => {
        let text = '';
        r.on('data', (c) => { text += c; });
        r.on('end', () => resolve({ status: r.statusCode, body: JSON.parse(text) }));
      });
      req.on('error', reject);
      req.end(JSON.stringify(chat('Write solve(a, b) returning a + b.')));
    });
    assert.equal(res.status, 200);
    assert.match(res.body.choices[0].message.content, /return a \+ b/);
    assert.equal(res.body.sieve.strategy, 'codet');
    assert.equal(res.body.sieve.agreement, 1);
    assert.equal(res.body.usage.total_tokens, 45);
  } finally {
    await new Promise((resolve) => real.close(resolve));
  }
});
