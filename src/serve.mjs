// SPDX-License-Identifier: PolyForm-Small-Business-1.0.0
// OpenAI uyumlu yerel uç: POST /v1/chat/completions ve GET /v1/models. Yalnızca 127.0.0.1'e bağlanır.
// Host başlığı yalnızca loopback adlarına izin verir (DNS rebinding), Origin varsa o da loopback olmalı.
// Loga istek gövdesi, başlıklar ve anahtarlar yazılmaz; yalnızca yol, durum, süre ve aday sayıları.

import http from 'node:http';
import { randomUUID } from 'node:crypto';
import { solveText } from './solve.mjs';

export const BIND_HOST = '127.0.0.1';
export const DEFAULT_PORT = 8787;
export const DEFAULT_MAX_BODY = 256 * 1024;
export const DEFAULT_MAX_ACTIVE = 2;

const LOOPBACK = new Set(['127.0.0.1', 'localhost', '[::1]']);

class HttpError extends Error {
  constructor(status, type, message) {
    super(message);
    this.status = status;
    this.type = type;
  }
}

export function checkHost(hostHeader, port) {
  if (!hostHeader) return false;
  const match = /^(\[[^\]]+\]|[^:]+)(?::(\d+))?$/.exec(hostHeader.trim().toLowerCase());
  if (!match) return false;
  return LOOPBACK.has(match[1]) && Number(match[2] ?? 80) === port;
}

export function checkOrigin(origin) {
  if (origin === undefined) return true;
  try {
    const url = new URL(origin);
    return url.protocol === 'http:' && LOOPBACK.has(url.hostname);
  } catch {
    return false;
  }
}

// Sohbet geçmişinin tamamı değil, son kullanıcı mesajı görevdir; sistem mesajı CODE_SYSTEM ile değişir.
export function taskFromMessages(messages) {
  const text = (content) => {
    if (typeof content === 'string') return content;
    if (!Array.isArray(content)) return '';
    return content.filter((part) => part?.type === 'text' && typeof part.text === 'string').map((part) => part.text).join('\n');
  };
  const last = messages.findLast((m) => m?.role === 'user');
  return last ? text(last.content).trim() : '';
}

function send(res, status, body, headers = {}) {
  const payload = JSON.stringify(body);
  res.writeHead(status, { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload), ...headers });
  res.end(payload);
}

const failure = (error) => ({ error: { message: error.message, type: error.type, code: error.status } });

function readJson(req, limit) {
  const declared = Number(req.headers['content-length']);
  if (Number.isFinite(declared) && declared > limit) {
    return Promise.reject(new HttpError(413, 'invalid_request_error', `request body is larger than ${limit} bytes`));
  }
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    let over = false;
    req.on('data', (chunk) => {
      if (over) return;
      size += chunk.length;
      if (size > limit) {
        over = true;
        reject(new HttpError(413, 'invalid_request_error', `request body is larger than ${limit} bytes`));
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      if (over) return;
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
      } catch {
        reject(new HttpError(400, 'invalid_request_error', 'request body is not valid JSON'));
      }
    });
    req.on('error', reject);
  });
}

function completionBody({ id, created, model, content, usage, picked }) {
  return {
    id,
    object: 'chat.completion',
    created,
    model,
    choices: [{ index: 0, message: { role: 'assistant', content }, finish_reason: 'stop' }],
    usage: { prompt_tokens: usage.input, completion_tokens: usage.output, total_tokens: usage.total },
    sieve: {
      strategy: picked.strategy,
      candidates: picked.candidates,
      usable: picked.usable,
      agreement: picked.agreement,
      signal: 'weak',
    },
  };
}

function sendStream(res, { id, created, model, content }) {
  const chunk = (delta, finish) => `data: ${JSON.stringify({
    id, object: 'chat.completion.chunk', created, model, choices: [{ index: 0, delta, finish_reason: finish }],
  })}\n\n`;
  res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'close' });
  res.end(chunk({ role: 'assistant', content }, null) + chunk({}, 'stop') + 'data: [DONE]\n\n');
}

export function createServer({
  complete, model, displayName = model, samples = 5, strategy = 'combined',
  temperature = 0.8, maxTokens = 4096, maxBody = DEFAULT_MAX_BODY, maxActive = DEFAULT_MAX_ACTIVE,
  log = () => {}, solve = solveText,
}) {
  let active = 0;

  async function route(req, res, port) {
    if (!checkHost(req.headers.host, port)) throw new HttpError(403, 'forbidden', 'Host header must be a loopback address for this port');
    if (!checkOrigin(req.headers.origin)) throw new HttpError(403, 'forbidden', 'cross-origin requests are not accepted');

    const { pathname } = new URL(req.url, 'http://localhost');
    if (pathname === '/v1/models') {
      if (req.method !== 'GET') throw new HttpError(405, 'invalid_request_error', 'use GET');
      return send(res, 200, { object: 'list', data: [{ id: displayName, object: 'model', created: 0, owned_by: 'sieve' }] });
    }
    if (pathname !== '/v1/chat/completions') throw new HttpError(404, 'not_found', `no route for ${req.method} ${pathname}`);
    if (req.method !== 'POST') throw new HttpError(405, 'invalid_request_error', 'use POST');
    if (!/^application\/json\b/i.test(req.headers['content-type'] ?? '')) {
      throw new HttpError(415, 'invalid_request_error', 'Content-Type must be application/json');
    }
    if (active >= maxActive) {
      res.setHeader('Retry-After', '10');
      throw new HttpError(429, 'rate_limit_exceeded', `at most ${maxActive} requests are processed at once`);
    }

    active += 1;
    try {
      const payload = await readJson(req, maxBody);
      if (!Array.isArray(payload?.messages) || !payload.messages.length) {
        throw new HttpError(400, 'invalid_request_error', '`messages` must be a non-empty array');
      }
      const prompt = taskFromMessages(payload.messages);
      if (!prompt) throw new HttpError(400, 'invalid_request_error', 'no user message with text content');

      const started = Date.now();
      const picked = await solve({ prompt, complete, model, samples, strategy, temperature, maxTokens });
      if (!picked.code) {
        const why = picked.firstError ? `: ${picked.firstError.slice(0, 300)}` : '';
        throw new HttpError(502, 'upstream_error', `no usable candidate (${picked.failed}/${picked.candidates} model calls failed)${why}`);
      }
      log(`POST /v1/chat/completions 200 ${Date.now() - started} ms, ${picked.usable}/${picked.candidates} candidates, ${picked.strategy}, ${picked.usage.total} tokens`);

      const reply = {
        id: `chatcmpl-${randomUUID()}`,
        created: Math.floor(Date.now() / 1000),
        model: displayName,
        content: `\`\`\`python\n${picked.code.trimEnd()}\n\`\`\``,
      };
      if (payload.stream === true) return sendStream(res, reply);
      return send(res, 200, completionBody({ ...reply, usage: picked.usage, picked }));
    } finally {
      active -= 1;
    }
  }

  const server = http.createServer((req, res) => {
    route(req, res, server.address().port).catch((error) => {
      const known = error instanceof HttpError ? error : new HttpError(500, 'server_error', 'internal error');
      if (!(error instanceof HttpError)) log(`${req.method} ${req.url} 500 ${error.name}`);
      else if (known.status >= 500) log(`${req.method} ${req.url} ${known.status}`);
      if (res.headersSent) {
        res.destroy();
        return;
      }
      // Gövdenin geri kalanı okunmadıysa bağlantı kapanır; aksi halde istemci yazarken asılı kalabilir.
      send(res, known.status, failure(known), known.status === 413 ? { Connection: 'close' } : {});
    });
  });
  server.headersTimeout = 10_000;
  return server;
}

export function startServer({ port = DEFAULT_PORT, ...options }) {
  const server = createServer(options);
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, BIND_HOST, () => {
      server.off('error', reject);
      resolve(server);
    });
  });
}
