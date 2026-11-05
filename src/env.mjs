// SPDX-License-Identifier: PolyForm-Small-Business-1.0.0
// Anahtar yükleme. Öncelik: process.env > SIEVE_ENV_FILE > ./.env > ~/.config/sieve/.env.
// Hata metinlerinde yalnızca dosya yolu ve satır numarası geçer, değer asla geçmez.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export function parseEnv(source) {
  const values = {};
  const invalidLines = [];
  source.replace(/^\uFEFF/, '').split(/\r?\n/).forEach((raw, index) => {
    const line = raw.trim();
    if (!line || line.startsWith('#')) return;
    const match = /^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/.exec(line);
    if (!match) {
      invalidLines.push(index + 1);
      return;
    }
    values[match[1]] = unquote(match[2]);
  });
  return { values, invalidLines };
}

function unquote(raw) {
  const double = /^"((?:\\.|[^"\\])*)"/.exec(raw);
  if (double) return double[1].replace(/\\(.)/g, (_, c) => (c === 'n' ? '\n' : c));
  const single = /^'([^']*)'/.exec(raw);
  if (single) return single[1];
  return raw.replace(/\s+#.*$/, '').trim();
}

export function envFiles({ env = process.env, cwd = process.cwd(), home = os.homedir() } = {}) {
  const files = [];
  if (env.SIEVE_ENV_FILE) files.push({ file: path.resolve(cwd, env.SIEVE_ENV_FILE), required: true });
  files.push({ file: path.join(cwd, '.env'), required: false });
  if (home) files.push({ file: path.join(home, '.config', 'sieve', '.env'), required: false });
  return files;
}

export function loadEnv(options = {}) {
  const env = options.env ?? process.env;
  const layers = [];
  for (const { file, required } of envFiles({ ...options, env })) {
    let source;
    try {
      source = fs.readFileSync(file, 'utf8');
    } catch (error) {
      if (error.code === 'ENOENT' && !required) continue;
      throw new Error(`env file could not be read: ${file} (${error.code ?? 'error'})`);
    }
    const { values, invalidLines } = parseEnv(source);
    if (invalidLines.length) {
      throw new Error(`env file ${file}: unparsable line(s) ${invalidLines.join(', ')}`);
    }
    layers.push(values);
  }
  return Object.assign({}, ...layers.reverse(), env);
}
