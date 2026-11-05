// SPDX-License-Identifier: PolyForm-Small-Business-1.0.0
// NVIDIA, Gemini, OpenAI uyumlu uç noktalar ve CLI ajanları için tek complete() arayüzü.
// Bütçe her HTTP denemesini sayar; dolunca BudgetError fırlar, başka modele geçilmez.

import path from 'node:path';
import os from 'node:os';
import { spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { loadEnv } from './env.mjs';
import { redactSecrets } from './redact.mjs';

// Node, Windows'ta .cmd dosyasını shell olmadan çalıştırmaz (EINVAL); npm shim'inin gösterdiği asıl dosyayı bulur.
function resolveCli(provider) {
  if (process.platform !== 'win32') return { command: provider, prefix: [] };
  for (const dir of (process.env.PATH || '').split(path.delimiter)) {
    const shim = path.join(dir, `${provider}.cmd`);
    if (!existsSync(shim)) continue;
    const target = [...readFileSync(shim, 'utf8').matchAll(/"%dp0%\\([^"]+)"/g)].at(-1)?.[1];
    if (!target) continue;
    const full = path.join(dir, target);
    if (!existsSync(full)) continue;
    return /\.exe$/i.test(full) ? { command: full, prefix: [] } : { command: process.execPath, prefix: [full] };
  }
  return { command: `${provider}.cmd`, prefix: [] };
}

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

export const GEMINI_MODELS = Object.freeze({
  'gemini-4-argon': { minIntervalMs: 6_000, budget: 15, timeoutMs: 240_000 },
  'gemini-3.5-flash': { minIntervalMs: 1_000, budget: Infinity, timeoutMs: 180_000 },
  'gemini-3.5-flash-lite': { minIntervalMs: 1_000, budget: Infinity, timeoutMs: 180_000 },
  'gemini-3.1-flash-lite': { minIntervalMs: 1_000, budget: Infinity, timeoutMs: 180_000 },
});

// OpenAI uyumlu NVIDIA uç noktasından çağrılan modeller ve anahtarlarının env adları.
// deepseek-v4-flash 2026-08-07'de kapatıldı (HTTP 410).
export const NVIDIA_MODELS = Object.freeze({
  'deepseek-v4.1-flash': { id: 'deepseek-ai/deepseek-v4.1-flash', envKey: 'NVIDIA_DEEPSEEK_KEY', timeoutMs: 120_000 },
});

const NVIDIA_BASE = 'https://integrate.api.nvidia.com/v1';
const OPENAI_COMPAT_TIMEOUT_MS = 180_000;
// Paylaşılan kota; bir süreçte yanlışlıkla boşaltılmasın.
const GATEWAY_BUDGET = 2_000;

const NETWORK_CODES = /ERR_SSL|ECONNRESET|ECONNREFUSED|EPIPE|ETIMEDOUT|EAI_AGAIN|ENOTFOUND|UND_ERR/;
const LONGEST_RETRY_WAIT_MS = 60_000;

export class BudgetError extends Error {
  constructor(model, limit) {
    super(`${model} çağrı bütçesi doldu (${limit} deneme); başka modele geçilmedi`);
    this.name = 'BudgetError';
    this.model = model;
  }
}

export function knownModels(model) {
  const names = [...Object.keys(NVIDIA_MODELS), ...Object.keys(GEMINI_MODELS), 'codex-cli'];
  if (model === undefined) return [...names, 'opencode:<model>', 'kilo:<model>', 'copilot:<model>', 'openai:<model>', 'gateway:<model>'];
  return names.includes(model) || /^(?:opencode|kilo|copilot|openai|gateway):[^\s:][^\s]*$/.test(model);
}

export function emptyUsage() {
  return { input: 0, output: 0, thinking: 0, total: 0 };
}

export function addUsage(sum, usage) {
  if (!usage) return sum;
  for (const field of Object.keys(sum)) sum[field] += usage[field] ?? 0;
  return sum;
}

export function nvidiaUsage(raw) {
  const input = raw?.prompt_tokens ?? 0;
  const completion = raw?.completion_tokens ?? 0;
  const thinking = raw?.completion_tokens_details?.reasoning_tokens ?? 0;
  return { input, output: completion - thinking, thinking, total: raw?.total_tokens ?? input + completion };
}

export function geminiUsage(raw) {
  const input = raw?.promptTokenCount ?? 0;
  const output = raw?.candidatesTokenCount ?? 0;
  const thinking = raw?.thoughtsTokenCount ?? 0;
  return { input, output, thinking, total: raw?.totalTokenCount ?? input + output + thinking };
}

export function retryDelayFrom(body, retryAfterHeader) {
  const seconds = Number(retryAfterHeader);
  if (retryAfterHeader && Number.isFinite(seconds)) return seconds * 1000;
  try {
    const details = JSON.parse(body)?.error?.details ?? [];
    const info = details.find((d) => String(d['@type'] ?? '').endsWith('RetryInfo'));
    const match = /^([\d.]+)s$/.exec(info?.retryDelay ?? '');
    return match ? Number(match[1]) * 1000 : null;
  } catch {
    return null;
  }
}

export function classifyFailure(error) {
  const status = error.status ?? Number(/HTTP (\d{3})/.exec(error.message ?? '')?.[1] ?? NaN);
  if (status === 429) {
    const wait = error.retryAfterMs;
    if (wait != null && wait > LONGEST_RETRY_WAIT_MS) {
      return { retry: false, label: `HTTP 429 (kota; ${Math.round(wait / 1000)} sn bekleme istiyor)` };
    }
    return { retry: true, label: 'HTTP 429', waitMs: wait ?? null };
  }
  if (status >= 500) return { retry: true, label: `HTTP ${status}` };
  if (Number.isFinite(status)) return { retry: false, label: `HTTP ${status}` };

  const code = error.cause?.code ?? error.code ?? '';
  if (NETWORK_CODES.test(code)) return { retry: true, label: `ağ: ${code}`, network: true };
  const text = `${error.message ?? ''} ${error.cause?.message ?? ''}`;
  if (/fetch failed|other side closed|socket|terminated/i.test(text)) {
    return { retry: true, label: `ağ: ${code || 'bağlantı kapandı'}`, network: true };
  }
  if (error.name === 'TimeoutError' || error.name === 'AbortError' || /zaman aşımı/.test(text)) {
    return { retry: true, label: 'zaman aşımı' };
  }
  return { retry: false, label: error.name || 'hata' };
}

function describeFailure(model, error, labels) {
  const repeatedNetwork = labels.length > 1 && labels.every((l) => l === labels[0] && l.startsWith('ağ:'));
  const head = repeatedNetwork
    ? `${model}: aynı ağ hatası ${labels.length} denemede tekrarladı (${labels[0]}); Node fetch bu ortamda bağlantıyı kuramıyor`
    : `${model}: ${labels.length} denemede başarısız [${labels.join(', ')}]`;
  const wrapped = new Error(`${head}: ${error.message}`, { cause: error });
  wrapped.attempts = labels.length;
  wrapped.lastLabel = labels.at(-1);
  return wrapped;
}

const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function cleanCliOutput(output) {
  const plain = output
    .replace(/\x1b\][^\x07\x1b]*(?:\x07|\x1b\\)/g, '')
    .replace(/\x1b\[[0-?]*[ -/]*[@-~]/g, '')
    .replace(/\x1b[@-_]/g, '')
    .replace(/\r(?!\n)/g, '\n');
  let fenced = false;
  return plain.split('\n').filter((line) => {
    if (/^\s*```/.test(line)) fenced = !fenced;
    if (fenced) return true;
    const prefixedTool = /^\s*[│|>→●⏺]\s*(?:read|bash|grep|glob)\b/i.test(line);
    const status = /^\s*(?:\[[\d:. -]+\]\s*)?(?:[│|>→●⏺]\s*)?(?:tool(?: call)?|running|executing|reading|writing)\s*[:>]/i.test(line);
    return !prefixedTool && !status;
  }).join('\n').trim();
}

// Free Copilot planında aylık premium istek kotası küçük; bir süreçte en fazla bu kadar çağrı yapılır.
const COPILOT_BUDGET = 30;

export function createProviders({
  env = loadEnv(),
  budgets = {},
  minIntervals = {},
  maxAttempts = 4,
  fetchImpl = fetch,
  spawnImpl = spawn,
  codexTimeoutMs = 300_000,
  cliTimeoutMs = 180_000,
  sleep = pause,
  random = Math.random,
} = {}) {
  const attemptsByModel = new Map();
  const nextSlot = new Map();
  const codexQueue = [];
  const cliQueue = [];
  let activeCodex = 0;
  let activeCli = 0;

  const limitFor = (model) => budgets[model] ?? GEMINI_MODELS[model]?.budget ?? (model.startsWith('copilot:') ? COPILOT_BUDGET : model.startsWith('gateway:') ? GATEWAY_BUDGET : Infinity);

  function reserve(model) {
    const used = attemptsByModel.get(model) ?? 0;
    const limit = limitFor(model);
    if (used >= limit) throw new BudgetError(model, limit);
    attemptsByModel.set(model, used + 1);
  }

  async function waitTurn(model) {
    const cli = /^(opencode|kilo|copilot):/.exec(model)?.[1];
    const gap = minIntervals[model] ?? (cli ? 1_000 : model === 'codex-cli' ? 2_000 : GEMINI_MODELS[model]?.minIntervalMs ?? 0);
    if (!gap) return;
    const now = Date.now();
    const slot = cli ?? model;
    const start = Math.max(now, nextSlot.get(slot) ?? 0);
    nextSlot.set(slot, start + gap);
    if (start > now) await sleep(start - now);
  }

  async function callCodex({ model, system, prompt }) {
    if (activeCodex >= 2) await new Promise((resolve) => codexQueue.push(resolve));
    activeCodex += 1;
    try {
      await waitTurn(model);
      const dir = await mkdtemp(path.join(os.tmpdir(), 'sieve-codex-'));
      const output = path.join(dir, 'answer.txt');
      try {
        const args = ['exec', '--skip-git-repo-check', '--sandbox', 'read-only', '-c', 'model_reasoning_effort=medium', '--output-last-message', output, '-'];
        await new Promise((resolve, reject) => {
          let child;
          try {
            child = spawnImpl('codex', args, { stdio: ['pipe', 'ignore', 'ignore'], windowsHide: true });
          } catch {
            reject(new Error('codex-cli başlatılamadı'));
            return;
          }
          let settled = false;
          const finish = (error) => {
            if (settled) return;
            settled = true;
            clearTimeout(timer);
            if (error) reject(error);
            else resolve();
          };
          const timer = setTimeout(() => {
            const error = new Error('codex-cli zaman aşımı');
            error.name = 'TimeoutError';
            finish(error);
            try { child.kill(); } catch {}
          }, codexTimeoutMs);
          child.once('error', () => finish(new Error('codex-cli başlatılamadı')));
          child.once('close', (code) => finish(code === 0 ? null : new Error('codex-cli başarısız oldu')));
          child.stdin.on('error', () => {});
          child.stdin.end([system, prompt].filter(Boolean).join('\n\n'));
        });
        let text;
        try {
          text = (await readFile(output, 'utf8')).trim();
        } catch {
          throw new Error('codex-cli çıktı dosyası okunamadı');
        }
        if (!text) throw new Error('codex-cli boş cevap döndürdü');
        return { text, usage: { ...emptyUsage(), estimated: true }, model };
      } finally {
        await rm(dir, { recursive: true, force: true });
      }
    } finally {
      activeCodex -= 1;
      codexQueue.shift()?.();
    }
  }

  async function callCli({ model, system, prompt }) {
    if (activeCli >= 2) await new Promise((resolve) => cliQueue.push(resolve));
    activeCli += 1;
    try {
      await waitTurn(model);
      const [provider, cliModel] = model.split(/:(.*)/s);
      const dir = await mkdtemp(path.join(os.tmpdir(), `sieve-${provider}-`));
      try {
        const request = [system, prompt].filter(Boolean).join('\n\n');
        const input = path.join(dir, 'request.txt');
        await writeFile(input, request, { mode: 0o600 });
        const { command, prefix } = spawnImpl === spawn ? resolveCli(provider) : { command: `${provider}.cmd`, prefix: [] };
        const message = 'Read the attached request and answer it. Return only the final answer.';
        const args = provider === 'opencode'
          ? ['run', '--model', cliModel, '--file', input, message]
          : provider === 'copilot'
            ? ['-p', `${request}\n\nAnswer directly in this message. Do not use any tools or read files.`, '--model', cliModel, '-s', '--no-ask-user']
            : ['run', `${request}\n\nAnswer directly in this message. Do not use any tools or read files.`, '--model', cliModel];
        const output = await new Promise((resolve, reject) => {
          let child;
          try {
            child = spawnImpl(command, [...prefix, ...args], { stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
          } catch {
            reject(new Error(`${provider} başlatılamadı`));
            return;
          }
          let stdout = '';
          let settled = false;
          const finish = (error) => {
            if (settled) return;
            settled = true;
            clearTimeout(timer);
            if (error) reject(error);
            else resolve(stdout);
          };
          const timer = setTimeout(() => {
            const error = new Error(`${provider} zaman aşımı`);
            error.name = 'TimeoutError';
            finish(error);
            try { child.kill(); } catch {}
          }, cliTimeoutMs);
          child.stdout.on('data', (chunk) => { stdout += chunk; });
          child.stderr.on('data', () => {});
          child.once('error', () => finish(new Error(`${provider} başlatılamadı`)));
          child.once('close', (code) => finish(code === 0 ? null : new Error(`${provider} başarısız oldu`)));
        });
        const text = cleanCliOutput(output);
        if (!text) throw new Error(`${provider} boş cevap döndürdü`);
        const inputTokens = Math.ceil(request.length / 4);
        const outputTokens = Math.ceil(text.length / 4);
        return { text, usage: { input: inputTokens, output: outputTokens, thinking: 0, total: inputTokens + outputTokens, estimated: true }, model };
      } finally {
        await rm(dir, { recursive: true, force: true });
      }
    } finally {
      activeCli -= 1;
      cliQueue.shift()?.();
    }
  }

  async function callNvidia({ model, system, prompt, temperature, maxTokens }) {
    const entry = NVIDIA_MODELS[model];
    const key = env[entry.envKey];
    if (!key) throw new Error(`${entry.envKey} ayarlı değil`);
    const messages = system ? [{ role: 'system', content: system }] : [];
    messages.push({ role: 'user', content: prompt });

    const base = (env.NVIDIA_CHAT_BASE_URL || NVIDIA_BASE).replace(/\/$/, '');
    const response = await fetchImpl(`${base}/chat/completions`, {
      method: 'POST',
      signal: AbortSignal.timeout(entry.timeoutMs),
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: entry.id, messages, temperature, max_tokens: maxTokens }),
    });
    if (!response.ok) {
      const raw = await response.text();
      const error = new Error(`NVIDIA API HTTP ${response.status}: ${redactSecrets(raw.slice(0, 400), [key])}`);
      error.status = response.status;
      error.retryAfterMs = retryDelayFrom('', response.headers.get('retry-after'));
      throw error;
    }
    const payload = await response.json();
    const message = payload.choices?.[0]?.message ?? {};
    const text = (typeof message.content === 'string' ? message.content : '').trim();
    if (!text) throw new Error(`${model} boş cevap döndürdü (finish_reason: ${payload.choices?.[0]?.finish_reason ?? 'bilinmiyor'})`);
    return { text, usage: nvidiaUsage(payload.usage), model };
  }

  async function callOpenAICompat({ model, system, prompt, temperature, maxTokens }) {
    const profile = model.startsWith('gateway:') ? 'gateway' : 'openai';
    const base = (profile === 'gateway'
      ? env.GATEWAY_BASE_URL || ''
      : env.OPENAI_COMPAT_BASE_URL || '').trim().replace(/\/+$/, '');
    if (!base) throw new Error(profile === 'gateway' ? 'GATEWAY_BASE_URL ayarlı değil' : 'OPENAI_COMPAT_BASE_URL ayarlı değil');
    const key = (profile === 'gateway' ? env.GATEWAY_API_KEY : env.OPENAI_COMPAT_API_KEY) || '';
    if (profile === 'gateway' && !key) throw new Error('GATEWAY_API_KEY ayarlı değil');
    const messages = system ? [{ role: 'system', content: system }] : [];
    messages.push({ role: 'user', content: prompt });

    const headers = { 'Content-Type': 'application/json' };
    if (key) headers.Authorization = `Bearer ${key}`;
    const response = await fetchImpl(`${base}/chat/completions`, {
      method: 'POST',
      signal: AbortSignal.timeout(OPENAI_COMPAT_TIMEOUT_MS),
      headers,
      body: JSON.stringify({ model: model.slice(model.indexOf(':') + 1), messages, temperature, max_tokens: maxTokens }),
    });
    if (!response.ok) {
      const raw = await response.text();
      const error = new Error(`OpenAI uyumlu API HTTP ${response.status}: ${redactSecrets(raw.slice(0, 400), key ? [key] : [])}`);
      error.status = response.status;
      error.retryAfterMs = retryDelayFrom('', response.headers.get('retry-after'));
      throw error;
    }

    const payload = await response.json();
    const choice = payload.choices?.[0];
    const text = (typeof choice?.message?.content === 'string' ? choice.message.content : '').trim();
    if (!text) throw new Error(`${model} boş cevap döndürdü (finish_reason: ${choice?.finish_reason ?? 'bilinmiyor'})`);
    if (payload.usage) return { text, usage: nvidiaUsage(payload.usage), model };
    const input = Math.ceil([system, prompt].filter(Boolean).join('\n\n').length / 4);
    const output = Math.ceil(text.length / 4);
    return { text, usage: { input, output, thinking: 0, total: input + output, estimated: true }, model };
  }

  async function callGemini({ model, system, prompt, temperature, maxTokens }) {
    const key = env.GEMINI_API_KEY;
    if (!key) throw new Error('GEMINI_API_KEY ayarlı değil');
    const body = {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature, maxOutputTokens: maxTokens },
    };
    if (system) body.systemInstruction = { parts: [{ text: system }] };

    const response = await fetchImpl(`${GEMINI_BASE}/${model}:generateContent`, {
      method: 'POST',
      signal: AbortSignal.timeout(GEMINI_MODELS[model].timeoutMs),
      headers: { 'x-goog-api-key': key, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const raw = await response.text();
      const error = new Error(`Gemini HTTP ${response.status}: ${redactSecrets(raw.slice(0, 400), [key])}`);
      error.status = response.status;
      error.retryAfterMs = retryDelayFrom(raw, response.headers.get('retry-after'));
      throw error;
    }

    const payload = await response.json();
    const candidate = payload.candidates?.[0];
    const text = (candidate?.content?.parts ?? [])
      .filter((part) => part.text && !part.thought)
      .map((part) => part.text)
      .join('')
      .trim();
    if (!text) {
      const why = candidate?.finishReason ?? payload.promptFeedback?.blockReason ?? 'bilinmiyor';
      throw new Error(`${model} boş cevap döndürdü (finishReason: ${why})`);
    }
    return { text, usage: geminiUsage(payload.usageMetadata), model };
  }

  async function complete({ model, system, prompt, temperature = 0.8, maxTokens = 4096 }) {
    const send = model === 'codex-cli' ? callCodex
      : /^(?:opencode|kilo|copilot):/.test(model) ? callCli
      : /^(?:openai|gateway):/.test(model) ? callOpenAICompat
      : GEMINI_MODELS[model] ? callGemini
      : NVIDIA_MODELS[model] ? callNvidia : null;
    if (!send || !knownModels(model)) throw new Error(`Bilinmeyen model: ${model} (bilinenler: ${knownModels().join(', ')})`);

    const labels = [];
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      reserve(model);
      if (model !== 'codex-cli' && send !== callCli) await waitTurn(model);
      try {
        return await send({ model, system, prompt, temperature, maxTokens });
      } catch (error) {
        const verdict = classifyFailure(error);
        labels.push(verdict.label);
        if (!verdict.retry || attempt === maxAttempts) throw describeFailure(model, error, labels);
        const backoff = verdict.waitMs ?? 1000 * 2 ** (attempt - 1);
        await sleep(backoff + random() * 500);
      }
    }
    return null;
  }

  return {
    complete,
    attempts: (model) => attemptsByModel.get(model) ?? 0,
    remaining: (model) => limitFor(model) - (attemptsByModel.get(model) ?? 0),
    snapshot: () => Object.fromEntries(attemptsByModel),
  };
}
