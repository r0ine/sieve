// SPDX-License-Identifier: PolyForm-Small-Business-1.0.0
// `sieve solve` ve `sieve serve`. Kod stdout'a, özet ve uyarılar stderr'e gider.

import fs from 'node:fs';
import path from 'node:path';
import { loadEnv } from './env.mjs';
import { createProviders } from './providers.mjs';
import { sandboxStatus } from './sandbox.mjs';
import { providerEnv, resolveModel, solveText, summaryLines, USER_STRATEGIES } from './solve.mjs';
import { DEFAULT_MAX_ACTIVE, DEFAULT_MAX_BODY, DEFAULT_PORT, startServer } from './serve.mjs';

export const USAGE = `usage:
  sieve solve --model <model> (--prompt "..." | --prompt-file <file>) [--tests public_test.py]
              [--samples 5] [--strategy combined|repair] [--strong <model>] [--sandbox docker|podman]
              [--temp 0.8] [--max-tokens 4096]
  sieve serve --model <model> [--port ${DEFAULT_PORT}] [--samples 5] [--strategy combined|repair]
              [--max-active ${DEFAULT_MAX_ACTIVE}] [--max-body ${DEFAULT_MAX_BODY}] [--sandbox docker|podman]

models: ollama:<name> (local Ollama, no key), openai:<name> (OPENAI_COMPAT_BASE_URL),
        opencode:<model>, kilo:<model>, codex-cli, gemini-*, deepseek-v4.1-flash (NVIDIA)

The task should ask for a Python function named solve; if the prompt doesn't mention it, Sieve adds that.
Tests are a Python file that imports from solution and uses assert.`;

const FLAGS = {
  solve: {
    text: ['model', 'prompt', 'prompt-file', 'tests', 'strategy', 'strong', 'sandbox'],
    number: ['samples', 'temp', 'max-tokens'],
  },
  serve: {
    text: ['model', 'strategy', 'sandbox'],
    number: ['port', 'samples', 'temp', 'max-tokens', 'max-active', 'max-body'],
  },
};

const INTEGERS = new Set(['samples', 'max-tokens', 'port', 'max-active', 'max-body']);

export function parseFlags(command, argv) {
  const spec = FLAGS[command];
  const opts = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith('--')) throw new Error(`unexpected argument: ${arg}`);
    let [key, value] = arg.slice(2).split(/=(.*)/s);
    if (!spec.text.includes(key) && !spec.number.includes(key)) throw new Error(`unknown flag: --${key}`);
    if (value === undefined) {
      value = argv[i + 1];
      i += 1;
    }
    if (value === undefined) throw new Error(`--${key} needs a value`);
    if (spec.number.includes(key)) {
      const number = Number(value);
      if (value.trim() === '' || !Number.isFinite(number)) throw new Error(`--${key} must be a number`);
      if (INTEGERS.has(key) && (!Number.isInteger(number) || number < (key === 'port' ? 0 : 1))) {
        throw new Error(`--${key} must be a positive integer`);
      }
      opts[key] = number;
    } else {
      opts[key] = value;
    }
  }
  if (!opts.model) throw new Error('--model is required');
  if (opts.strategy && !USER_STRATEGIES.includes(opts.strategy)) {
    throw new Error(`unknown strategy: ${opts.strategy} (choose ${USER_STRATEGIES.join(' or ')})`);
  }
  if (opts.sandbox && !['docker', 'podman', 'local'].includes(opts.sandbox)) {
    throw new Error('--sandbox must be docker, podman or local');
  }
  if (opts.port > 65535) throw new Error('--port must be at most 65535');
  return opts;
}

// Env dosyaları yalnızca Ollama dışı bir model anahtar isterse okunur; Ollama tek başına
// kullanılıyorsa hiçbirine dokunulmaz.
export async function buildProviders(models, makeProviders = createProviders, env = process.env) {
  if (!models.some((m) => m.ollama)) return makeProviders();
  const keyless = models.every((m) => m.model.startsWith('openai:'));
  return makeProviders({ env: providerEnv(models, keyless ? env : loadEnv()) });
}

async function applySandbox(choice, io) {
  if (!choice) return;
  process.env.SIEVE_SANDBOX = choice;
  if (choice === 'local') return;
  const status = await sandboxStatus();
  io.stderr(status.fallback
    ? `sieve: sandbox: local layers only (${status.fallback})`
    : `sieve: sandbox: ${status.mode} (${status.image})`);
}

async function runSolve(argv, io, makeProviders) {
  const opts = parseFlags('solve', argv);
  if (opts.prompt && opts['prompt-file']) throw new Error('use --prompt or --prompt-file, not both');
  const prompt = opts['prompt-file'] ? fs.readFileSync(opts['prompt-file'], 'utf8') : opts.prompt;
  if (!prompt?.trim()) throw new Error('--prompt or --prompt-file is required');
  const testsPath = opts.tests ? path.resolve(opts.tests) : null;
  if (testsPath && !fs.existsSync(testsPath)) throw new Error(`test file not found: ${opts.tests}`);

  const cheap = resolveModel(opts.model);
  const strong = opts.strong ? resolveModel(opts.strong) : null;
  const providers = await buildProviders([cheap, strong].filter(Boolean), makeProviders);
  await applySandbox(opts.sandbox, io);

  const picked = await solveText({
    prompt,
    testsPath,
    complete: providers.complete,
    model: cheap.model,
    samples: opts.samples ?? 5,
    strategy: opts.strategy ?? 'combined',
    strong: strong?.model ?? null,
    strongRemaining: () => (strong ? providers.remaining(strong.model) : 0),
    temperature: opts.temp ?? 0.8,
    maxTokens: opts['max-tokens'] ?? 4096,
  });

  if (!picked.code) {
    const why = picked.firstError ? `: ${picked.firstError.slice(0, 300)}` : '';
    io.stderr(`sieve: no usable candidate (${picked.failed}/${picked.candidates} model calls failed)${why}`);
    return 1;
  }
  io.stdout(picked.code.endsWith('\n') ? picked.code : `${picked.code}\n`);
  for (const line of summaryLines(picked)) io.stderr(line);
  return picked.hasTests && !picked.chosenPasses ? 3 : 0;
}

async function runServe(argv, io, makeProviders) {
  const opts = parseFlags('serve', argv);
  const cheap = resolveModel(opts.model);
  const providers = await buildProviders([cheap], makeProviders);
  await applySandbox(opts.sandbox, io);

  const server = await startServer({
    complete: providers.complete,
    model: cheap.model,
    displayName: cheap.name,
    samples: opts.samples ?? 5,
    strategy: opts.strategy ?? 'combined',
    temperature: opts.temp ?? 0.8,
    maxTokens: opts['max-tokens'] ?? 4096,
    maxActive: opts['max-active'] ?? DEFAULT_MAX_ACTIVE,
    maxBody: opts['max-body'] ?? DEFAULT_MAX_BODY,
    port: opts.port ?? DEFAULT_PORT,
    log: (line) => io.stderr(`sieve: ${line}`),
  });
  const { address, port } = server.address();
  io.stderr(`sieve: serving ${cheap.name} at http://${address}:${port}/v1 (no tests here: every answer is a weak-signal pick)`);
  await new Promise((resolve) => server.on('close', resolve));
  return 0;
}

const defaultIo = {
  stdout: (text) => process.stdout.write(text),
  stderr: (line) => process.stderr.write(`${line}\n`),
};

export async function main(argv, { io = defaultIo, makeProviders = createProviders } = {}) {
  const [command, ...rest] = argv;
  if (!command || ['help', '--help', '-h'].includes(command) || rest.includes('--help')) {
    io.stderr(USAGE);
    return command ? 0 : 2;
  }
  try {
    if (command === 'solve') return await runSolve(rest, io, makeProviders);
    if (command === 'serve') return await runServe(rest, io, makeProviders);
    io.stderr(`sieve: unknown command: ${command}\n\n${USAGE}`);
    return 2;
  } catch (error) {
    io.stderr(`sieve: ${error.message}`);
    return error.code === 'EADDRINUSE' ? 1 : 2;
  }
}
