// SPDX-License-Identifier: PolyForm-Small-Business-1.0.0
// Model kodunu korumalı çalıştırma. Katmanlar ve açık kalan sınırlar: docs/GUVENLIK.md.
// Yerel mod: yasaklı kalıp süzgeci, geçici klasör, `python -I` + önyükleyici (audit hook, Job Object / rlimit),
// temizlenmiş ortam, çıktı tavanı, zaman aşımında tüm süreç ağacını öldürme.
// SIEVE_SANDBOX=docker|podman: aynı önyükleyici ağsız, salt-okunur, sınırlı bir konteynerde çalışır.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import { spawn, spawnSync } from 'node:child_process';

const PYTHON = process.env.SIEVE_PYTHON || 'python';
const OUTPUT_CAP = 1 << 20;
const GUARD_FILE = 'sieve_guard.py';
const CONTAINER_DIR = '/work';
const DEFAULT_IMAGE = 'python:3.12-slim';

export const DEFAULT_TIMEOUT_MS = 10_000;
export const DEFAULT_MEMORY_MB = 512;

const RISKY_MODULES = 'os|subprocess|shutil|socket|pathlib|requests|urllib|ctypes|sys|importlib';

export const BANNED_PATTERNS = Object.freeze([
  new RegExp(`\\bimport\\s+(${RISKY_MODULES})\\b`),
  new RegExp(`\\bfrom\\s+(${RISKY_MODULES})\\b`),
  new RegExp(`^[ \\t]*import\\s[^\\n#]*\\b(${RISKY_MODULES})\\b`, 'm'),
  /\bopen\s*\(/,
  /__import__/,
  /\bexec\s*\(/,
  /\beval\s*\(/,
]);

export function findBanned(code) {
  return BANNED_PATTERNS.find((pattern) => pattern.test(code)) ?? null;
}

export function extractCode(text) {
  const blocks = [...String(text).matchAll(/```(?:python|py)?[^\n]*\n([\s\S]*?)```/g)].map((m) => m[1]);
  if (blocks.length) return blocks.sort((a, b) => b.length - a.length)[0];
  return String(text).trim();
}

// Önyükleyici: önce işletim sistemi sınırlarını koyar, sonra audit hook'u kurar, en son hedef betiği çalıştırır.
// Hook yalnızca değişmez varsayılan argümanlara dayanır; model kodu os.path ya da builtins'i değiştirse de
// kararı etkileyemez. Bu yine de bir Python içi denetimdir, tam yalıtım değildir.
const GUARD_SCRIPT = String.raw`
import sys

if not hasattr(sys, 'addaudithook'):
    sys.stderr.write('sieve: python 3.8+ gerekli\n')
    raise SystemExit(70)

import json
import os
import runpy

WINDOWS = sys.platform == 'win32'

DENIED_EVENTS = frozenset((
    'os.system', 'os.exec', 'os.spawn', 'os.posix_spawn', 'os.fork', 'os.forkpty', 'os.startfile',
    'os.kill', 'os.killpg', 'subprocess.Popen', 'pty.spawn', 'signal.pthread_kill',
    'os.chdir', 'os.chmod', 'os.chown', 'os.chflags', 'os.lchflags', 'os.lchmod', 'os.lchown',
    'os.link', 'os.symlink', 'os.mkdir', 'os.mkfifo', 'os.mknod', 'os.remove', 'os.rename', 'os.rmdir',
    'os.truncate', 'os.utime', 'os.lockf', 'os.putenv', 'os.unsetenv', 'os.add_dll_directory',
    'os.getxattr', 'os.listxattr', 'os.setxattr', 'os.removexattr',
    'os.listdrives', 'os.listmounts', 'os.listvolumes',
    'tempfile.mkstemp', 'tempfile.mkdtemp', 'mmap.__new__', 'webbrowser.open',
    'sqlite3.connect', 'sqlite3.connect/handle', 'sqlite3.enable_load_extension', 'sqlite3.load_extension',
    'resource.setrlimit', 'resource.prlimit', 'sys.addaudithook', 'sys.remote_exec',
    'gc.get_objects', 'gc.get_referrers', 'gc.get_referents', 'code.__new__', 'function.__new__',
    'syslog.openlog', 'syslog.syslog', '_posixshmem.shm_open', '_posixshmem.shm_unlink',
))
DENIED_PREFIXES = (
    'socket.', 'ctypes.', '_winapi.', 'winreg.', 'msvcrt.', 'shutil.', 'fcntl.', 'urllib.',
    'http.client.', 'ftplib.', 'smtplib.', 'poplib.', 'imaplib.', 'nntplib.', 'telnetlib.', 'ssl.',
)
BLOCKED_MODULES = frozenset((
    'ctypes', '_ctypes', 'cffi', '_cffi_backend', '_posixsubprocess', 'multiprocessing', '_multiprocessing',
    'socket', '_socket', 'ssl', '_ssl', '_xxsubinterpreters', '_interpreters', '_xxinterpchannels',
))
GUARDED_ATTRS = frozenset(('__code__', '__closure__', '__globals__'))
LISTING_EVENTS = frozenset(('os.listdir', 'os.scandir', 'glob.glob', 'glob.glob/2'))


def limit_windows(memory_mb, cpu_seconds):
    import ctypes
    from ctypes import wintypes

    class Basic(ctypes.Structure):
        _fields_ = [
            ('PerProcessUserTimeLimit', ctypes.c_int64), ('PerJobUserTimeLimit', ctypes.c_int64),
            ('LimitFlags', wintypes.DWORD), ('MinimumWorkingSetSize', ctypes.c_size_t),
            ('MaximumWorkingSetSize', ctypes.c_size_t), ('ActiveProcessLimit', wintypes.DWORD),
            ('Affinity', ctypes.c_size_t), ('PriorityClass', wintypes.DWORD), ('SchedulingClass', wintypes.DWORD),
        ]

    class Counters(ctypes.Structure):
        _fields_ = [(name, ctypes.c_uint64) for name in (
            'ReadOperationCount', 'WriteOperationCount', 'OtherOperationCount',
            'ReadTransferCount', 'WriteTransferCount', 'OtherTransferCount')]

    class Extended(ctypes.Structure):
        _fields_ = [
            ('BasicLimitInformation', Basic), ('IoInfo', Counters),
            ('ProcessMemoryLimit', ctypes.c_size_t), ('JobMemoryLimit', ctypes.c_size_t),
            ('PeakProcessMemoryUsed', ctypes.c_size_t), ('PeakJobMemoryUsed', ctypes.c_size_t),
        ]

    class UiRestrictions(ctypes.Structure):
        _fields_ = [('UIRestrictionsClass', wintypes.DWORD)]

    kernel32 = ctypes.WinDLL('kernel32', use_last_error=True)
    kernel32.CreateJobObjectW.restype = wintypes.HANDLE
    kernel32.CreateJobObjectW.argtypes = (ctypes.c_void_p, wintypes.LPCWSTR)
    kernel32.SetInformationJobObject.argtypes = (wintypes.HANDLE, ctypes.c_int, ctypes.c_void_p, wintypes.DWORD)
    kernel32.AssignProcessToJobObject.argtypes = (wintypes.HANDLE, wintypes.HANDLE)
    kernel32.GetCurrentProcess.restype = wintypes.HANDLE
    kernel32.SetErrorMode(0x8003)

    job = kernel32.CreateJobObjectW(None, None)
    if not job:
        raise ctypes.WinError(ctypes.get_last_error())

    limits = Extended()
    limits.BasicLimitInformation.LimitFlags = 0x2 | 0x8 | 0x100 | 0x400 | 0x2000
    limits.BasicLimitInformation.PerProcessUserTimeLimit = cpu_seconds * 10_000_000
    limits.BasicLimitInformation.ActiveProcessLimit = 1
    limits.ProcessMemoryLimit = memory_mb << 20
    if not kernel32.SetInformationJobObject(job, 9, ctypes.byref(limits), ctypes.sizeof(limits)):
        raise ctypes.WinError(ctypes.get_last_error())

    layers = ['job:memory', 'job:cpu', 'job:single-process', 'job:kill-on-close']
    ui = UiRestrictions(0xFF)
    if kernel32.SetInformationJobObject(job, 4, ctypes.byref(ui), ctypes.sizeof(ui)):
        layers.append('job:ui-restrictions')
    if not kernel32.AssignProcessToJobObject(job, kernel32.GetCurrentProcess()):
        raise ctypes.WinError(ctypes.get_last_error())
    return layers


def limit_posix(memory_mb, cpu_seconds):
    import resource

    layers = []
    wanted = (
        ('RLIMIT_AS', memory_mb << 20, 'memory'), ('RLIMIT_CPU', cpu_seconds, 'cpu'),
        ('RLIMIT_FSIZE', 1 << 20, 'fsize'), ('RLIMIT_NOFILE', 64, 'nofile'),
        ('RLIMIT_CORE', 0, 'core'), ('RLIMIT_NPROC', 0, 'nproc'),
    )
    for name, value, label in wanted:
        kind = getattr(resource, name, None)
        if kind is None:
            continue
        try:
            hard = resource.getrlimit(kind)[1]
            if hard != resource.RLIM_INFINITY:
                value = min(value, hard)
            resource.setrlimit(kind, (value, value))
            layers.append('rlimit:' + label)
        except (ValueError, OSError):
            pass
    return layers


def forget_ctypes():
    for name in list(sys.modules):
        if name == 'ctypes' or name.startswith('ctypes.') or name == '_ctypes':
            del sys.modules[name]


def read_roots(workdir):
    roots = [workdir, sys.prefix, sys.base_prefix, sys.exec_prefix, sys.base_exec_prefix,
             os.path.dirname(sys.executable), os.path.dirname(getattr(sys, '_base_executable', sys.executable))]
    roots += [entry for entry in sys.path if entry]
    return roots + [os.path.realpath(root) for root in roots]


def install(workdir, raw_roots):
    sep = '\\' if WINDOWS else '/'
    fold = WINDOWS or sys.platform == 'darwin'
    write_flags = 0
    for name in ('O_WRONLY', 'O_RDWR', 'O_APPEND', 'O_CREAT', 'O_TRUNC'):
        write_flags |= getattr(os, name, 0)

    def resolve(path, cwd=workdir, sep=sep, windows=WINDOWS, fold=fold, kind=type, text=str, raw=bytes, count=len):
        if kind(path) is raw:
            path = path.decode('utf-8', 'surrogateescape')
        elif kind(path) is not text:
            return None
        if '\0' in path:
            return None
        if windows:
            path = path.replace('/', '\\')
            if path.startswith('\\\\'):
                return None
            if path[1:2] == ':':
                if path[2:3] != '\\':
                    return None
            elif path.startswith('\\'):
                path = cwd[:2] + path
            else:
                path = cwd + '\\' + path
        elif not path.startswith('/'):
            path = cwd + '/' + path
        parts = []
        for part in path.split(sep):
            if part == '' or part == '.':
                continue
            if part == '..':
                if count(parts) > (1 if windows else 0):
                    parts.pop()
                continue
            if windows and (part.rstrip('. ') != part or (parts and ':' in part)):
                return None
            parts.append(part)
        if windows:
            full = sep.join(parts) + (sep if count(parts) == 1 else '')
        else:
            full = '/' + '/'.join(parts)
        return full.lower() if fold else full

    roots = set()
    for root in raw_roots:
        full = resolve(root)
        if full and full != '/' and not (WINDOWS and len(full) <= 3):
            roots.add(full)
    prefixes = tuple(root + sep for root in roots)
    roots = frozenset(roots)

    def readable(path, resolve=resolve, roots=roots, prefixes=prefixes):
        full = resolve(path)
        return full is not None and (full in roots or full.startswith(prefixes))

    def hook(event, args, readable=readable, denied=DENIED_EVENTS, denied_prefixes=DENIED_PREFIXES,
             blocked=BLOCKED_MODULES, guarded=GUARDED_ATTRS, listing=LISTING_EVENTS, write_flags=write_flags,
             kind=type, number=int, text=str, refuse=PermissionError):
        if event == 'open':
            path, mode, flags = args
            if kind(mode) is text and ('w' in mode or 'a' in mode or 'x' in mode or '+' in mode):
                raise refuse('sieve: dosyaya yazma engellendi')
            if kind(flags) is number and flags & write_flags:
                raise refuse('sieve: dosyaya yazma engellendi')
            if kind(path) is not number and not readable(path):
                raise refuse('sieve: sandbox dışı okuma engellendi')
        elif event in listing:
            path = args[0] if args and args[0] is not None else '.'
            if kind(path) is not number and not readable(path):
                raise refuse('sieve: sandbox dışı listeleme engellendi')
        elif event == 'import':
            if args[0].partition('.')[0] in blocked:
                raise refuse('sieve: modül engellendi: ' + args[0])
        elif event == 'object.__setattr__' or event == 'object.__delattr__':
            if args[1] in guarded:
                raise refuse('sieve: fonksiyon iç yapısını değiştirme engellendi')
        elif event in denied or event.startswith(denied_prefixes):
            raise refuse('sieve: ' + event + ' engellendi')

    sys.addaudithook(hook)


def main():
    memory_mb, cpu_seconds, report = (int(value) for value in sys.argv[1].split(':'))
    target = sys.argv[2]
    layers, missing = [], []
    try:
        layers += limit_windows(memory_mb, cpu_seconds) if WINDOWS else limit_posix(memory_mb, cpu_seconds)
    except Exception as error:
        missing.append('os-limits: ' + type(error).__name__ + ': ' + str(error))
    forget_ctypes()

    workdir = os.getcwd()
    install(workdir, read_roots(workdir))
    layers.append('audit-hook')

    if report:
        print(json.dumps({'python': sys.version.split()[0], 'platform': sys.platform,
                          'layers': layers, 'missing': missing}))
        return
    sys.argv = [target] + sys.argv[3:]
    sys.path.insert(0, workdir)
    runpy.run_path(target, run_name='__main__')


main()
`;

const warned = new Set();
const engines = new Map();

function probeEngine(engine, image) {
  const check = (args) => spawnSync(engine, args, { timeout: 10_000, windowsHide: true, stdio: 'ignore' });
  const info = check(['info']);
  if (info.error || info.status !== 0) {
    return { mode: 'local', requested: engine, fallback: `${engine} kullanılamıyor (${info.error?.code ?? `çıkış ${info.status}`})` };
  }
  const inspect = check(['image', 'inspect', image]);
  if (inspect.error || inspect.status !== 0) {
    return { mode: 'local', requested: engine, fallback: `${image} imajı yerelde yok; indirme yapılmaz` };
  }
  return { mode: engine, engine, image };
}

function sandboxMode() {
  const wanted = (process.env.SIEVE_SANDBOX || 'local').toLowerCase();
  if (wanted !== 'docker' && wanted !== 'podman') return { mode: 'local' };
  const image = process.env.SIEVE_DOCKER_IMAGE || DEFAULT_IMAGE;
  const key = `${wanted} ${image}`;
  if (!engines.has(key)) engines.set(key, probeEngine(wanted, image));
  const mode = engines.get(key);
  if (mode.fallback && !warned.has(key)) {
    warned.add(key);
    console.warn(`sieve: SIEVE_SANDBOX=${wanted} istendi ama ${mode.fallback}; yerel katmanla devam ediliyor.`);
  }
  return mode;
}

export function dockerArgs({ dir, name, image = DEFAULT_IMAGE, memoryMb = DEFAULT_MEMORY_MB, pythonArgs }) {
  const memory = `${memoryMb + 64}m`;
  return [
    'run', '--rm', '--name', name, '--pull', 'never',
    '--network', 'none', '--read-only', '--ipc', 'none',
    '--cap-drop', 'ALL', '--security-opt', 'no-new-privileges', '--user', '65534:65534',
    '--memory', memory, '--memory-swap', memory, '--cpus', '1', '--pids-limit', '64',
    '--tmpfs', '/tmp:rw,noexec,nosuid,size=16m',
    '--mount', `type=bind,source=${dir},target=${CONTAINER_DIR},readonly`,
    '--workdir', CONTAINER_DIR, '--env', 'HOME=/tmp',
    image, 'python', ...pythonArgs,
  ];
}

function childEnv(dir) {
  const env = { TEMP: dir, TMP: dir, TMPDIR: dir, HOME: dir };
  if (process.env.PATH) env.PATH = process.env.PATH;
  if (process.platform === 'win32') {
    env.SystemRoot = process.env.SystemRoot || 'C:\\Windows';
    env.WINDIR = process.env.WINDIR || env.SystemRoot;
  }
  return env;
}

function killTree(child) {
  if (child.exitCode !== null || child.signalCode !== null) return;
  if (process.platform === 'win32') {
    const taskkill = path.join(process.env.SystemRoot || 'C:\\Windows', 'System32', 'taskkill.exe');
    spawn(taskkill, ['/PID', String(child.pid), '/T', '/F'], { windowsHide: true, stdio: 'ignore' })
      .on('error', () => child.kill());
    return;
  }
  try {
    process.kill(-child.pid, 'SIGKILL');
  } catch {
    child.kill('SIGKILL');
  }
}

function runPython(dir, script, args, { timeoutMs, memoryMb, report = false }) {
  fs.writeFileSync(path.join(dir, GUARD_FILE), GUARD_SCRIPT);
  const cpuSeconds = Math.ceil(timeoutMs / 1000) + 1;
  const pythonArgs = ['-I', '-B', '-X', 'utf8', GUARD_FILE, `${memoryMb}:${cpuSeconds}:${report ? 1 : 0}`, script, ...args];
  const mode = sandboxMode();
  const name = `sieve-${process.pid}-${randomBytes(4).toString('hex')}`;
  let command = PYTHON;
  let argv = pythonArgs;
  if (mode.engine) {
    if (process.platform !== 'win32') fs.chmodSync(dir, 0o755);
    command = mode.engine;
    argv = dockerArgs({ dir, name, image: mode.image, memoryMb, pythonArgs });
  }

  return new Promise((resolve) => {
    let stdout = '';
    let stderr = '';
    let timedOut = false;
    let overflow = false;
    const child = spawn(command, argv, {
      cwd: dir,
      env: mode.engine ? process.env : childEnv(dir),
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true,
      detached: process.platform !== 'win32',
    });
    const stop = () => {
      killTree(child);
      if (mode.engine) spawn(mode.engine, ['kill', name], { windowsHide: true, stdio: 'ignore' }).on('error', () => {});
    };
    const timer = setTimeout(() => {
      timedOut = true;
      stop();
    }, timeoutMs);
    const collect = (append) => (chunk) => {
      if (overflow) return;
      append(chunk);
      if (stdout.length + stderr.length > OUTPUT_CAP) {
        overflow = true;
        stop();
      }
    };
    child.stdout.setEncoding('utf8').on('data', collect((chunk) => { stdout += chunk; }));
    child.stderr.setEncoding('utf8').on('data', collect((chunk) => { stderr += chunk; }));
    child.on('error', (error) => {
      clearTimeout(timer);
      resolve({ status: null, stdout, stderr: `python başlatılamadı: ${error.message}`, timedOut: false, overflow: false });
    });
    child.on('close', (status) => {
      clearTimeout(timer);
      resolve({ status, stdout, stderr, timedOut, overflow });
    });
  });
}

async function inScratchDir(work) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sieve-'));
  try {
    return await work(dir);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
  }
}

const lastLine = (text) => text.trim().split('\n').at(-1)?.trim() ?? '';

function memoryLimit(memoryMb) {
  return memoryMb ?? (Number(process.env.SIEVE_MEMORY_MB) || DEFAULT_MEMORY_MB);
}

function failingStatement(stderr, fileName) {
  const lines = stderr.split(/\r?\n/);
  const frame = new RegExp(`File "(?:[^"]*[\\\\/])?${fileName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}", line \\d+`);
  const at = lines.findLastIndex((line) => frame.test(line));
  const source = at >= 0 ? lines[at + 1]?.trim() : '';
  return source && !source.startsWith('File ') ? source : '';
}

export async function runTestFile(code, testPath, { timeoutMs = DEFAULT_TIMEOUT_MS, memoryMb } = {}) {
  const banned = findBanned(code);
  if (banned) return { pass: false, why: `yasaklı kalıp ${banned}` };
  return inScratchDir(async (dir) => {
    const testName = path.basename(testPath);
    fs.writeFileSync(path.join(dir, 'solution.py'), code);
    fs.copyFileSync(testPath, path.join(dir, testName));
    const run = await runPython(dir, testName, [], { timeoutMs, memoryMb: memoryLimit(memoryMb) });
    if (run.timedOut) return { pass: false, why: 'zaman aşımı' };
    if (run.overflow) return { pass: false, why: 'çıktı sınırı aşıldı' };
    if (run.status === 0) return { pass: true, why: '' };
    const why = lastLine(run.stderr) || `çıkış kodu ${run.status}`;
    const at = failingStatement(run.stderr, testName);
    return at ? { pass: false, why, at } : { pass: false, why };
  });
}

const PROBE_SCRIPT = String.raw`
import ast, copy, io, json, sys

LITERAL_NODES = (
    ast.Expression, ast.Tuple, ast.List, ast.Set, ast.Dict, ast.Constant, ast.Load,
    ast.UnaryOp, ast.BinOp, ast.USub, ast.UAdd, ast.Add, ast.Sub, ast.Mult, ast.Pow,
)

def parse_args(source):
    tree = ast.parse('(' + source + ',)', mode='eval')
    if not all(isinstance(node, LITERAL_NODES) for node in ast.walk(tree)):
        raise ValueError('literal değil')
    return eval(compile(tree, '<probe>', 'eval'), {'__builtins__': {}}, {})

def canon(value):
    if isinstance(value, (set, frozenset)):
        return '{' + ', '.join(sorted(canon(v) for v in value)) + '}'
    if isinstance(value, dict):
        return '{' + ', '.join(sorted(canon(k) + ': ' + canon(v) for k, v in value.items())) + '}'
    if isinstance(value, list):
        return '[' + ', '.join(canon(v) for v in value) + ']'
    if isinstance(value, tuple):
        return '(' + ', '.join(canon(v) for v in value) + (',)' if len(value) == 1 else ')')
    if isinstance(value, float):
        return repr(round(value, 9))
    return repr(value)

real_stdout = sys.stdout
emit = lambda line: (real_stdout.write(json.dumps(line) + '\n'), real_stdout.flush())

with open(sys.argv[1], encoding='utf-8') as handle:
    cases = json.load(handle)

sys.stdout = io.StringIO()
try:
    target = getattr(__import__('solution'), sys.argv[2])
except BaseException as error:
    emit({'import': type(error).__name__})
    raise SystemExit(0)

for source in cases:
    try:
        args = parse_args(source)
    except Exception:
        emit('!input')
        continue
    try:
        emit(canon(target(*copy.deepcopy(args)))[:2000])
    except BaseException as error:
        emit('!raise ' + type(error).__name__)
    sys.stdout = io.StringIO()
`;

export async function probeOutputs(code, inputs, { entry = 'solve', timeoutMs = DEFAULT_TIMEOUT_MS, memoryMb } = {}) {
  const banned = findBanned(code);
  if (banned) return { ok: false, why: `yasaklı kalıp ${banned}`, signature: null };
  if (!inputs.length) return { ok: true, why: '', signature: [] };
  return inScratchDir(async (dir) => {
    fs.writeFileSync(path.join(dir, 'solution.py'), code);
    fs.writeFileSync(path.join(dir, 'sieve_probe.py'), PROBE_SCRIPT);
    fs.writeFileSync(path.join(dir, 'cases.json'), JSON.stringify(inputs));
    const run = await runPython(dir, 'sieve_probe.py', ['cases.json', entry], { timeoutMs, memoryMb: memoryLimit(memoryMb) });

    if (run.overflow) return { ok: false, why: 'çıktı sınırı aşıldı', signature: null };
    const lines = run.stdout.split('\n').filter(Boolean).map((line) => {
      try {
        return JSON.parse(line);
      } catch {
        return '!garbled';
      }
    });
    if (lines[0]?.import) return { ok: false, why: `içe aktarma hatası ${lines[0].import}`, signature: null };
    if (run.status !== 0 && !run.timedOut) {
      return { ok: false, why: lastLine(run.stderr) || `çıkış kodu ${run.status}`, signature: null };
    }
    const signature = inputs.map((_, i) => lines[i] ?? '!timeout');
    return { ok: true, why: run.timedOut ? 'zaman aşımı (kalan girdiler !timeout)' : '', signature };
  });
}

// Hangi katmanların gerçekten devrede olduğunu boş bir betikle ölçer; docker istenip bulunamadıysa nedenini döndürür.
export async function sandboxStatus({ memoryMb } = {}) {
  const mode = sandboxMode();
  return inScratchDir(async (dir) => {
    fs.writeFileSync(path.join(dir, 'empty.py'), '');
    const run = await runPython(dir, 'empty.py', [], { timeoutMs: 30_000, memoryMb: memoryLimit(memoryMb), report: true });
    let guard = null;
    try {
      guard = JSON.parse(lastLine(run.stdout));
    } catch {
      guard = null;
    }
    const { engine, ...shown } = mode;
    return { ...shown, guard, why: guard ? '' : lastLine(run.stderr) || `çıkış kodu ${run.status}` };
  });
}
