// SPDX-License-Identifier: PolyForm-Small-Business-1.0.0
// Görev denetimi: dört dosya var mı, reference.py gizli ve açık testten geçiyor mu.
// node bench/validate.mjs [t51 t76 ...]   (boşsa tüm görevler)

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), 'tasks');
const python = process.env.SIEVE_PYTHON || 'python';
const prefixes = process.argv.slice(2);
const names = fs.readdirSync(root)
  .filter((n) => /^t\d+_/.test(n) && (!prefixes.length || prefixes.some((p) => n.startsWith(p))))
  .sort();

function run(dir, script) {
  const work = fs.mkdtempSync(path.join(os.tmpdir(), 'sieve-val-'));
  try {
    fs.copyFileSync(path.join(dir, 'reference.py'), path.join(work, 'solution.py'));
    fs.copyFileSync(path.join(dir, script), path.join(work, script));
    const out = spawnSync(python, ['-E', '-s', script], { cwd: work, encoding: 'utf8', timeout: 20_000 });
    if (out.status === 0) return null;
    return (out.stderr || out.error?.message || 'zaman aşımı').trim().split('\n').slice(-2).join(' | ').slice(0, 220);
  } finally {
    fs.rmSync(work, { recursive: true, force: true });
  }
}

let bad = 0;
for (const name of names) {
  const dir = path.join(root, name);
  const missing = ['prompt.md', 'reference.py', 'test.py', 'public_test.py'].filter((f) => !fs.existsSync(path.join(dir, f)));
  if (missing.length) {
    bad += 1;
    console.log(`KUSURLU ${name}: eksik ${missing.join(', ')}`);
    continue;
  }
  const problems = ['test.py', 'public_test.py'].map((s) => [s, run(dir, s)]).filter(([, e]) => e);
  if (problems.length) {
    bad += 1;
    for (const [s, e] of problems) console.log(`KUSURLU ${name}: ${s} -> ${e}`);
  } else {
    console.log(`tamam   ${name}`);
  }
}
console.log(`${names.length - bad}/${names.length} görev temiz`);
process.exitCode = bad ? 1 : 0;
