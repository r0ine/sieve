// SPDX-License-Identifier: PolyForm-Small-Business-1.0.0

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { loadEnv, parseEnv } from '../src/env.mjs';
import { redactSecrets } from '../src/redact.mjs';

function scratch(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sieve-env-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  return dir;
}

function put(file, text) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, text);
}

test('parseEnv handles quotes, comments, export and CRLF', () => {
  const { values, invalidLines } = parseEnv([
    '﻿# keys',
    'PLAIN=abc',
    'export EXPORTED = spaced ',
    'DOUBLE="has # hash"',
    "SINGLE='a \"b\" \\n c'",
    'ESCAPED="line\\nnext \\"q\\""',
    'TRAILING=value # note',
    'EMPTY=',
    'not a pair',
  ].join('\r\n'));
  assert.deepEqual(values, {
    PLAIN: 'abc',
    EXPORTED: 'spaced',
    DOUBLE: 'has # hash',
    SINGLE: 'a "b" \\n c',
    ESCAPED: 'line\nnext "q"',
    TRAILING: 'value',
    EMPTY: '',
  });
  assert.deepEqual(invalidLines, [9]);
});

test('loadEnv: process env beats SIEVE_ENV_FILE beats ./.env beats ~/.config/sieve/.env', (t) => {
  const root = scratch(t);
  const cwd = path.join(root, 'work');
  const home = path.join(root, 'home');
  put(path.join(home, '.config', 'sieve', '.env'), 'A=home\nB=home\nC=home\nD=home\n');
  put(path.join(cwd, '.env'), 'A=cwd\nB=cwd\nC=cwd\n');
  put(path.join(root, 'chosen.env'), 'A=chosen\nB=chosen\n');

  const values = loadEnv({ env: { A: 'process', SIEVE_ENV_FILE: '../chosen.env' }, cwd, home });
  assert.equal(values.A, 'process');
  assert.equal(values.B, 'chosen');
  assert.equal(values.C, 'cwd');
  assert.equal(values.D, 'home');
});

test('loadEnv skips missing optional files', (t) => {
  const root = scratch(t);
  assert.deepEqual(loadEnv({ env: { ONLY: '1' }, cwd: root, home: root }), { ONLY: '1' });
});

test('loadEnv fails on a missing SIEVE_ENV_FILE and never echoes values', (t) => {
  const root = scratch(t);
  assert.throws(() => loadEnv({ env: { SIEVE_ENV_FILE: 'nope.env' }, cwd: root, home: root }), /nope\.env.*ENOENT/);

  put(path.join(root, '.env'), 'GOOD=nvapi-secretsecretsecretsecret\nbroken line nvapi-leakleakleakleakleak\n');
  assert.throws(() => loadEnv({ env: {}, cwd: root, home: root }), (error) => {
    assert.match(error.message, /line\(s\) 2/);
    assert.doesNotMatch(error.message, /nvapi|secret|leak/);
    return true;
  });
});

test('redactSecrets masks known values and common key shapes', () => {
  const known = 'plain-known-value-123';
  const text = [
    `echo ${known}`,
    'Authorization: Bearer abc.def-ghi_jkl',
    `nvapi-${'n'.repeat(24)}`,
    `sk-proj-${'s'.repeat(24)}`,
    `AIza${'g'.repeat(35)}`,
    '{"api_key": "hunter2hunter2"}',
    'password=letmein',
  ].join('\n');
  const clean = redactSecrets(text, [known]);
  for (const leak of [known, 'abc.def', 'nvapi-', 'sk-proj', 'AIza', 'hunter2', 'letmein']) {
    assert.ok(!clean.includes(leak), `${leak} leaked: ${clean}`);
  }
  assert.match(clean, /Authorization: Bearer <redacted>/);
  assert.match(clean, /echo <redacted>/);
});

test('redactSecrets leaves ordinary text and short known values alone', () => {
  const text = 'HTTP 400: model not found, try again';
  assert.equal(redactSecrets(text, ['short', '', null]), text);
});
