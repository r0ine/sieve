# Sandbox threat model

`src/sandbox.mjs` runs Python written by a model on someone else's machine. The model is not assumed to be malicious, but its output is untrusted: a prompt injection in a task, a poisoned dataset or plain carelessness can produce code that reads keys, deletes files or never stops. This document says what is stopped, how, and what is not.

## Layers

| # | Layer | Where | Platforms |
|---|-------|-------|-----------|
| 1 | Banned-pattern regex (`findBanned`) | Node, before running | all |
| 2 | Fresh temp directory, deleted afterwards | Node | all |
| 3 | Scrubbed environment: only `PATH`, `SystemRoot`/`WINDIR`, and `TEMP`/`TMP`/`HOME` pointing at the temp dir | Node | all |
| 4 | `python -I -B -X utf8`: no `PYTHON*` variables, no user site, no bytecode writes | Node | all |
| 5 | Job Object: 1 active process, per-process memory and CPU-time limit, kill-on-close, UI restrictions (clipboard, desktop, global atoms) | guard, via ctypes before the hook | Windows |
| 6 | rlimits: `AS`, `CPU`, `FSIZE` 1 MB, `NOFILE` 64, `CORE` 0, `NPROC` 0 | guard | Linux, macOS |
| 7 | `sys.addaudithook` policy | guard | all (Python 3.8+) |
| 8 | Output cap (1 MB, process killed when exceeded) and wall-clock timeout that kills the whole tree (`taskkill /T /F` on Windows, process-group `SIGKILL` elsewhere) | Node | all |
| 9 | Optional container (`SIEVE_SANDBOX=docker` or `podman`) | Node | where an engine and the image already exist |

The guard (`sieve_guard.py`, embedded in `sandbox.mjs`) is written into the temp dir on every run, applies 5/6, installs 7, then runs the test or probe script with `runpy`.

## Threats

| What model code might do | Stopped by | Gaps |
|---|---|---|
| Read files outside the sandbox (`~/.ssh`, `.env`, browser data) | Hook: `open`, `os.listdir`, `os.scandir`, `glob.glob` allowed only under the temp dir and Python's own install/`sys.path` roots. Paths are normalized with plain string operations; UNC, `\\?\`, drive-relative, trailing-dot names and `str` subclasses are refused. Container: only `/work` is mounted. | `os.stat`/`os.path.exists` raise no audit event, so existence, size and mtime of any path can be probed. Python's install directories are readable. The hidden test file sits in the same directory and in the same process as the candidate, so a candidate can read it (a cheating issue, not a host-safety one). |
| Write, delete, rename files | Hook: any `open` with a write mode or write flags, plus `os.remove/rename/mkdir/chmod/symlink/...`, `shutil.*`, `tempfile.*`. rlimit `FSIZE`. Container: read-only root, read-only mount. | Without a container the only barrier on Windows is the hook. |
| Network (exfiltration, scanning localhost) | Hook: all `socket.*` events; `socket`, `_socket`, `ssl` imports refused; `urllib.*`, `http.client.*` events. Container: `--network none`. | Without a container there is no OS-level network block. |
| Start processes, fork bomb | Hook: `os.system/exec/spawn/posix_spawn/fork/startfile`, `subprocess.Popen`, `_winapi.*`; `_posixsubprocess`, `multiprocessing` imports refused. Windows Job Object: `ActiveProcessLimit = 1`, enforced by the kernel even if the hook is bypassed. rlimit `NPROC = 0`. Container: `--pids-limit 64`. | `NPROC` is per user and ignored for root; macOS may refuse it. `NPROC = 0` also blocks threads on Linux. |
| Native code (`ctypes`, `cffi`, `mmap`) | `ctypes`/`_ctypes`/`cffi` imports refused, `ctypes.*` and `mmap.__new__` events refused. The guard's own ctypes modules are removed from `sys.modules` before the hook goes in, so a later import raises the `import` event. | Any third-party C extension already importable from site-packages runs without audit events. |
| Endless loop, sleep | Wall-clock timeout (default 10 s) kills the tree; CPU-time limit (timeout + 1 s) as a backstop on all three systems. | — |
| Memory exhaustion | Job Object `ProcessMemoryLimit` / `RLIMIT_AS`, default 512 MB (`memoryMb` option or `SIEVE_MEMORY_MB`). Allocation fails with `MemoryError`. Container: `--memory`, swap disabled. | macOS does not enforce `RLIMIT_AS`; there memory is bounded only by the timeout unless a container is used. |
| Output flood | Node stops reading and kills the tree at 1 MB of stdout+stderr; the result is `çıktı sınırı aşıldı`. | — |
| Steal secrets from environment variables | Child gets a fresh environment (layer 3). | `PATH` is passed so `python` can be found; it reveals directory names. |
| Disable the guard | The hook only uses immutable default arguments (frozensets, tuples, bound builtins) and keeps no reference in any module or frame, so patching `os.path`, `builtins` or module globals doesn't change its decisions. `gc.get_objects/get_referrers/get_referents`, `code.__new__`, `function.__new__`, setting `__code__`, `sys.addaudithook`, `resource.setrlimit` are refused. | See below. |
| GUI, clipboard, shutdown (Windows) | Job Object UI restrictions. | — |
| Survive after Sieve exits | Windows: kill-on-job-close. POSIX: CPU rlimit eventually kills a busy process. | On POSIX a sleeping process detached from a crashed Node parent survives until it wakes up. |

## Audit hooks are not a sandbox

PEP 578 is explicit that audit hooks are for detection, not containment. Known ways around layer 7:

- Memory-corruption bugs in CPython or in a C extension give arbitrary native execution, and from there the hook is irrelevant.
- Not every operation raises an event (`os.stat`, reading an already-open file descriptor, many functions in third-party extensions).
- The policy is a list. A stdlib function that reaches the OS through a path the list doesn't cover is allowed.

On Windows, layer 5 still holds after a hook bypass for process creation, memory and CPU, but not for file reads, writes or network. On Linux and macOS, rlimits hold for memory (Linux), CPU, file size and process count; files and network are again hook-only. That is why the container mode exists.

## Container mode

`SIEVE_SANDBOX=docker` (or `podman`) runs the same guard inside:

```
docker run --rm --pull never --network none --read-only --ipc none
  --cap-drop ALL --security-opt no-new-privileges --user 65534:65534
  --memory <memoryMb+64>m --memory-swap <same> --cpus 1 --pids-limit 64
  --tmpfs /tmp:rw,noexec,nosuid,size=16m
  --mount type=bind,source=<temp dir>,target=/work,readonly
  python:3.12-slim python -I -B -X utf8 sieve_guard.py ...
```

The image comes from `SIEVE_DOCKER_IMAGE` (default `python:3.12-slim`). Sieve never pulls or installs anything: on first use it runs `<engine> info` and `<engine> image inspect <image>`. If either fails it prints one warning to stderr and continues with the local layers. `sandboxStatus()` reports `mode`, `requested`, `fallback` and the layers the guard actually applied, so a caller can refuse to continue instead.

The container is the only mode that blocks file access and network at the kernel level. It shares the host kernel, so a kernel exploit still escapes; gVisor (`--runtime runsc`) or a VM is the next step if that matters. Container start-up counts against the timeout.

## Not covered yet

- An OS-level file and network boundary without a container: AppContainer or a low-integrity token on Windows, Landlock + seccomp or user namespaces on Linux, `sandbox-exec` on macOS.
- Pinning the image by digest.
- A strict mode that refuses to run when a layer is missing. Today it is the caller's choice via `sandboxStatus()`.
