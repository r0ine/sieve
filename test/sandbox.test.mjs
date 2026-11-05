// SPDX-License-Identifier: PolyForm-Small-Business-1.0.0
import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { dockerArgs, extractCode, findBanned, probeOutputs, runTestFile, sandboxStatus } from '../src/sandbox.mjs';

const GOOD = 'def solve(values):\n    return sum(v if i % 2 == 0 else -v for i, v in enumerate(values))\n';
const fixtures = fs.mkdtempSync(path.join(os.tmpdir(), 'sieve-test-'));
let written = 0;
after(() => fs.rmSync(fixtures, { recursive: true, force: true }));

function writeTest(body) {
  written += 1;
  const file = path.join(fixtures, `public_test_${written}.py`);
  fs.writeFileSync(file, `from solution import solve\n${body}\n`);
  return file;
}

test('yasaklı kalıplar yakalanır', () => {
  for (const code of ['import os', 'from subprocess import run', 'x = open("a")', '__import__("os")',
    'exec("1")', 'eval("1")', 'import sys', 'from pathlib import Path', 'import importlib']) {
    assert.ok(findBanned(code), code);
  }
});

test('zararsız kod yasaklı sayılmaz', () => {
  for (const code of [GOOD, 'import math\nimport collections', 'def reopen(x):\n    return x', 'evaluate = 1', 'osmanli = 2']) {
    assert.equal(findBanned(code), null, code);
  }
});

test('en uzun python bloğu çıkarılır', () => {
  const text = 'şöyle:\n```python\nx = 1\n```\nve\n```py\ndef solve():\n    return 2\n```';
  assert.equal(extractCode(text), 'def solve():\n    return 2\n');
  assert.equal(extractCode('def solve(): return 1'), 'def solve(): return 1');
});

test('test dosyası geçer ve kalır', async () => {
  const testFile = writeTest('assert solve([4, 1, 3]) == 6');
  assert.deepEqual(await runTestFile(GOOD, testFile), { pass: true, why: '' });
  const wrong = await runTestFile('def solve(values):\n    return 0\n', testFile);
  assert.equal(wrong.pass, false);
  assert.match(wrong.why, /AssertionError/);
});

test('yasaklı kod çalıştırılmadan reddedilir', async () => {
  const testFile = writeTest('assert True');
  const verdict = await runTestFile('import os\ndef solve(v):\n    return 0\n', testFile);
  assert.equal(verdict.pass, false);
  assert.match(verdict.why, /yasaklı/);
});

test('sonsuz döngü zaman aşımına düşer', async () => {
  const testFile = writeTest('solve([])');
  const verdict = await runTestFile('def solve(v):\n    while True:\n        pass\n', testFile, { timeoutMs: 1500 });
  assert.deepEqual(verdict, { pass: false, why: 'zaman aşımı' });
});

test('çıktı imzası: sonuç, istisna, geçersiz girdi', async () => {
  const code = 'def solve(values):\n    print("gürültü")\n    if not values:\n        raise ValueError\n    return {values[0]: set(values)}\n';
  const probed = await probeOutputs(code, ['[3, 1, 2]', '[]', 'not a literal', '[10**3, -1]']);
  assert.equal(probed.ok, true);
  assert.deepEqual(probed.signature, ['{3: {1, 2, 3}}', '!raise ValueError', '!input', '{1000: {-1, 1000}}']);
});

test('içe aktarılamayan aday geçersiz sayılır', async () => {
  const probed = await probeOutputs('def solve(:\n', ['[1]']);
  assert.equal(probed.ok, false);
  assert.equal(probed.signature, null);
});

test('virgüllü import listesindeki riskli modül yakalanır', () => {
  assert.ok(findBanned('import math, os\n'));
  assert.ok(findBanned('def f():\n    import itertools, sys\n'));
  assert.equal(findBanned('import math, re\n'), null);
});

// Saldırılar süzgeci bilerek atlatır (random._os, __builtins__ sözlüğü, getattr); durdurması gereken çalışma katmanı.
const BYPASS = `import random
B = __builtins__ if isinstance(__builtins__, dict) else vars(__builtins__)
load = B['__imp' + 'ort__']
reach = B['op' + 'en']
host = getattr(random, '_' + 'os')
`;

async function attack(cases, options) {
  const names = Object.keys(cases);
  const bodies = names.map((name, i) => `def a${i}():\n    ${cases[name].replaceAll('\n', '\n    ')}\n`).join('');
  const code = `${BYPASS}${bodies}ATTACKS = [${names.map((_, i) => `a${i}`).join(', ')}]\ndef solve(i):\n    return ATTACKS[i]()\n`;
  assert.equal(findBanned(code), null, 'saldırı kodu süzgeçte takılmamalı');
  const probed = await probeOutputs(code, names.map((_, i) => String(i)), options);
  assert.equal(probed.ok, true, probed.why);
  return Object.fromEntries(names.map((name, i) => [name, probed.signature[i]]));
}

function assertAllBlocked(outcomes, allowed = /^!raise PermissionError$/) {
  for (const [name, outcome] of Object.entries(outcomes)) assert.match(outcome, allowed, name);
}

const py = (value) => JSON.stringify(value);

test('süzgeç: takma ad ve iç içe import yolları da yakalanır', () => {
  for (const code of ['import os as x', 'import math, os as o', 'from os import path as p', 'import os.path',
    'def f():\n    import subprocess as s', 'from importlib import import_module']) {
    assert.ok(findBanned(code), code);
  }
});

test('çalışma katmanı etkin: audit hook ve işletim sistemi sınırları', async () => {
  const status = await sandboxStatus();
  assert.equal(status.mode, 'local');
  assert.ok(status.guard, status.why);
  assert.ok(status.guard.layers.includes('audit-hook'));
  if (process.platform === 'win32') {
    assert.ok(status.guard.layers.includes('job:memory'), JSON.stringify(status.guard));
    assert.ok(status.guard.layers.includes('job:single-process'));
  }
  if (process.platform === 'linux') assert.ok(status.guard.layers.includes('rlimit:memory'));
});

test('sandbox dışı dosya okuma ve listeleme engellenir', async () => {
  const secret = path.join(fixtures, 'secret.txt');
  fs.writeFileSync(secret, 'gizli');
  const outcomes = await attack({
    'open ile okuma': `return reach(${py(secret)}).read()`,
    'os.open ile okuma': `return getattr(host, 'op' + 'en')(${py(secret)}, 0)`,
    'göreli yolla yukarı çıkma': `return reach('..' + host.sep + ${py(path.relative(os.tmpdir(), secret))}).read()`,
    'bayt yol': `return reach(${py(secret)}.encode()).read()`,
    'str alt sınıfı': `class S(str): pass\nreturn reach(S(${py(secret)})).read()`,
    'listeleme': `return host.listdir(${py(fixtures)})`,
    'scandir': `return [e.name for e in host.scandir(${py(os.homedir())})]`,
  });
  assertAllBlocked(outcomes);
});

test('engel yokken aynı saldırı gerçekten çalışır (test boş geçmiyor)', () => {
  const secret = path.join(fixtures, 'kontrol.txt');
  fs.writeFileSync(secret, 'gizli');
  const plain = spawnSync('python', ['-c', `print(open(${py(secret)}).read())`], { encoding: 'utf8' });
  assert.equal(plain.stdout.trim(), 'gizli');
});

test('dosya yazma, silme ve dizin değiştirme engellenir', async () => {
  const escaped = path.join(fixtures, 'escaped.txt');
  const victim = path.join(fixtures, 'victim.txt');
  fs.writeFileSync(victim, 'dokunma');
  const outcomes = await attack({
    'tmp dışına yazma': `return reach(${py(escaped)}, 'w').write('x')`,
    'çalışma klasörüne yazma': `return reach('leak.txt', 'w').write('x')`,
    'ekleme kipi': `return reach('solution.py', 'a').write('x')`,
    'os.open ile oluşturma': `return getattr(host, 'op' + 'en')(${py(escaped)}, host.O_WRONLY | host.O_CREAT)`,
    'silme': `return host.remove(${py(victim)})`,
    'yeniden adlandırma': `return host.rename(${py(victim)}, ${py(escaped)})`,
    'dizin değiştirme': `return host.chdir(${py(fixtures)})`,
    'ortam değişkeni yazma': `return host.putenv('SIEVE_X', '1')`,
  });
  assertAllBlocked(outcomes);
  assert.equal(fs.existsSync(escaped), false);
  assert.equal(fs.readFileSync(victim, 'utf8'), 'dokunma');
});

test('süreç başlatma yolları engellenir', async () => {
  const outcomes = await attack({
    'os.system': `return host.system('exit 0')`,
    'getattr zinciri': `return getattr(host, 'sys' + 'tem')('exit 0')`,
    'os.popen': `return host.popen('exit 0').read()`,
    'subprocess': `return load('subprocess').run(['python', '-c', '0']).returncode`,
    'os.spawnv': `return host.spawnv(host.P_WAIT, host.sys.executable, ['python', '-c', '0'])`,
    'fork': `return host.fork() if hasattr(host, 'fork') else host.system('exit 0')`,
    'kill': `return host.kill(host.getpid() + 100000, 0)`,
    'multiprocessing': `return load('multiprocessing').cpu_count()`,
  });
  assertAllBlocked(outcomes);
});

test('ağ, ctypes ve hook kurcalama engellenir', async () => {
  let connections = 0;
  const server = net.createServer((socket) => {
    connections += 1;
    socket.destroy();
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  try {
    const outcomes = await attack({
      'socket modülü': `return load('socket').create_connection(('127.0.0.1', ${port}), 2)`,
      '_socket modülü': `return load('_socket').socket()`,
      'urllib': `return load('urllib.request').urlopen('http://127.0.0.1:${port}/', timeout=2).read()`,
      'ctypes': `return load('ctypes').CDLL(None)`,
      'gc ile hook arama': `return len(load('gc').get_objects())`,
      'kod değiştirme': `f = lambda: 1\nf.__code__ = (lambda: 2).__code__\nreturn f()`,
      'kaynak sınırını kaldırma': `return load('mmap').mmap(-1, 10) if host.name == 'nt' else load('resource').setrlimit(load('resource').RLIMIT_AS, (-1, -1))`,
    });
    assertAllBlocked(outcomes);
    // CPython reddedilen addaudithook çağrısının hatasını yutar; kanıt, yeni hook'un hiç olay görmemesi.
    const hooked = await attack({
      'yeni audit hook': `seen = []\nhost.sys.addaudithook(lambda event, args: seen.append(event))\ncompile('1', 'x', 'eval')\nreturn seen`,
    });
    assert.deepEqual(hooked, { 'yeni audit hook': '[]' });
  } finally {
    server.close();
  }
  assert.equal(connections, 0);
});

test('ortam değişkenleri çocuğa geçmez', async () => {
  process.env.SIEVE_CANARY = 'anahtar-sızmasın';
  try {
    const outcomes = await attack({ environ: `return host.environ.get('SIEVE_CANARY')` });
    assert.deepEqual(outcomes, { environ: 'None' });
  } finally {
    delete process.env.SIEVE_CANARY;
  }
});

test('bellek şişirme sınırlanır', { skip: process.platform === 'darwin' && 'macOS RLIMIT_AS uygulamıyor' }, async () => {
  const outcomes = await attack({ bellek: 'return len(bytearray(1 << 30))' }, { memoryMb: 128 });
  assert.deepEqual(outcomes, { bellek: '!raise MemoryError' });
});

test('çok çıktı süreci erkenden durdurur', async () => {
  const testFile = writeTest('solve([])');
  const started = Date.now();
  const verdict = await runTestFile('def solve(v):\n    while True:\n        print("x" * 4096)\n', testFile, { timeoutMs: 8000 });
  assert.deepEqual(verdict, { pass: false, why: 'çıktı sınırı aşıldı' });
  assert.ok(Date.now() - started < 6000);
});

test('zaman aşımında uyuyan süreç de öldürülür', async () => {
  const testFile = writeTest('solve([])');
  const started = Date.now();
  const verdict = await runTestFile('import time\ndef solve(v):\n    time.sleep(60)\n', testFile, { timeoutMs: 1000 });
  assert.deepEqual(verdict, { pass: false, why: 'zaman aşımı' });
  assert.ok(Date.now() - started < 5000);
});

test('meşru standart kütüphane kullanımı çalışmaya devam eder', async () => {
  const code = `from collections import namedtuple, Counter
from dataclasses import dataclass
from fractions import Fraction
from datetime import date
import heapq, re, unicodedata, random, json

@dataclass
class Item:
    name: str

def solve(values):
    Pair = namedtuple('Pair', 'a b')
    heap = list(values)
    heapq.heapify(heap)
    return [Pair(1, 2).b, Counter('aab')['a'], str(Fraction(1, 3)), date(2024, 2, 29).isoformat(),
            re.sub('a', 'b', 'aa'), unicodedata.name('a'), Item('x').name, json.dumps([1]), heap[0]]
`;
  const probed = await probeOutputs(code, ['[3, 1, 2]']);
  assert.deepEqual(probed.signature, ["[2, 2, '1/3', '2024-02-29', 'bb', 'LATIN SMALL LETTER A', 'x', '[1]', 1]"]);
});

test('docker istenip bulunamazsa yerel katmana düşülür ve nedeni raporlanır', async (t) => {
  t.mock.method(console, 'warn', () => {});
  const saved = { mode: process.env.SIEVE_SANDBOX, image: process.env.SIEVE_DOCKER_IMAGE };
  process.env.SIEVE_SANDBOX = 'docker';
  process.env.SIEVE_DOCKER_IMAGE = 'sieve-test/olmayan-imaj:yok';
  try {
    const status = await sandboxStatus();
    assert.equal(status.mode, 'local');
    assert.equal(status.requested, 'docker');
    assert.ok(status.fallback);
    assert.ok(status.guard.layers.includes('audit-hook'));
    const testFile = writeTest('assert solve([4, 1, 3]) == 6');
    assert.deepEqual(await runTestFile(GOOD, testFile), { pass: true, why: '' });
    assert.equal(console.warn.mock.callCount(), 1);
  } finally {
    for (const [key, value] of [['SIEVE_SANDBOX', saved.mode], ['SIEVE_DOCKER_IMAGE', saved.image]]) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});

test('docker argümanları ağsız, salt-okunur ve sınırlı konteyner kurar', () => {
  const args = dockerArgs({ dir: '/tmp/sieve-x', name: 'sieve-1', memoryMb: 256, pythonArgs: ['-I', 'g.py'] });
  const joined = args.join(' ');
  for (const flag of ['--network none', '--read-only', '--cap-drop ALL', '--pids-limit 64', '--pull never',
    '--security-opt no-new-privileges', '--memory 320m', '--memory-swap 320m', '--user 65534:65534']) {
    assert.ok(joined.includes(flag), flag);
  }
  assert.ok(joined.includes('type=bind,source=/tmp/sieve-x,target=/work,readonly'));
  assert.deepEqual(args.slice(-3), ['python', '-I', 'g.py']);
});
