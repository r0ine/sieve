# Sieve

A harness for measuring how much better it is to take N candidates from a cheap code model for the same task and pick one without looking at the hidden test, compared with a single attempt.

For each task the model writes N candidates. The candidates run in a temporary directory: if there is a public test (`public_test.py`), each one is run against it, and the outputs they give on the same inputs are collected into a signature. The selector picks one candidate from these two pieces of information. The hidden `test.py` runs only after selection is finished, to score it.

Strategies decide over the same candidates, so every strategy requested in a run sees exactly the same code:

- `single`: the first candidate. The baseline.
- `public`: the first candidate that passes the public test.
- `codet`: clusters candidates by output signature and picks from the largest cluster (similar to CodeT, but no expected output is generated; it only checks whether candidates agree with each other).
- `combined`: the largest cluster among candidates that pass the public test; if none pass, the largest cluster among all candidates.
- `router`: selects like `combined`, but if agreement is below the threshold it also has the strong model write the task.

## What to expect, and what not to

Generating more candidates adds no information to the model. On a task the model can never write correctly, all five candidates are wrong and no selector can fix that. Selection can reduce errors only when some candidates are correct and there is a signal that tells the correct ones apart (the public test, agreement between candidates).

The `oracle` column in the analysis table is not a strategy: it answers "did at least one candidate pass the hidden test" and is computed by looking at the hidden test. It shows the ceiling a selector could reach and is not to be read as a result.

A number only means something together with the model, temperature, number of candidates, run date and tokens spent. The 120-task set is not a general measure of ability. Rules: [docs/DURUSTLUK.md](docs/DURUSTLUK.md).

## Quick start (Ollama)

Needs Node and `python`. No API key: `ollama:<name>` is shorthand for `openai:<name>` at `http://localhost:11434/v1`.

```
ollama pull qwen2.5-coder:1.5b
npm link
sieve solve --model ollama:qwen2.5-coder:1.5b --samples 5 --tests public_test.py --prompt "Write solve(s) that returns True if s reads the same backwards, ignoring case and non-letters." > solution.py
sieve serve --model ollama:qwen2.5-coder:1.5b
```

`npm link` puts `sieve` on PATH; `node bin/sieve.mjs ...` works without it. `solve` prints only the chosen code on stdout. On stderr it prints the candidate count, the strategy, the agreement, the tokens spent, and how strong the evidence is: with `--tests` the chosen code passed your tests ("strong signal"); without tests the candidates were only compared with each other ("weak signal"). The task should ask for a function named `solve` (Sieve appends that request if the prompt doesn't mention it); the test file imports from `solution` and uses `assert`, like `bench/tasks/*/public_test.py`.

Other flags: `--strategy combined|repair` (`repair` feeds failures back to the model once), `--strong <model>` (with `--tests`, escalates to a stronger model when agreement is below 0.6), `--sandbox docker|podman`, `--prompt-file`, `--temp`, `--max-tokens`. Exit codes: 0 done, 1 no usable candidate, 2 usage error, 3 code printed but no candidate passed your tests.

`sieve serve` answers OpenAI-style `POST /v1/chat/completions` (`stream: true` gets the whole answer as one SSE chunk) and `GET /v1/models` on `127.0.0.1:8787` only. It takes the last user message as the task, ignores the client's system prompt and sampling parameters, and returns the chosen function in a python block. Requests with a non-loopback `Host` or `Origin` get 403; bodies over 256 KB get 413; more than 2 requests at once get 429 (`--max-body`, `--max-active`). There are no tests on this path, so every answer is a weak-signal pick.

## Limits

Sieve is for work that can be checked by running it: a single Python function, ideally with a few tests or `solve(...) == ...` examples in the prompt. It is not for general chat, explanations, multi-file changes or agent work; a chat client pointed at `sieve serve` gets code blocks, nothing else. Expect roughly 4-6 times the tokens of a single answer at the default 5 samples (candidates plus the extra-input request, more with `repair` or `--strong`). Without tests, agreement only shows that the candidates behave alike, not that they are right; a small model can agree with itself on a wrong answer. Candidate code runs on your machine; what the sandbox stops and what it doesn't is in [docs/GUVENLIK.md](docs/GUVENLIK.md), and only `--sandbox docker` gives a kernel-level file and network boundary.

## Setup

No npm dependencies. You need:

- Node.js (used with Node 24; it relies on `node --test`, `fetch` and `AbortSignal.timeout`).
- `python` on PATH (Python 3, standard library only). For a different interpreter, put its path in the `SIEVE_PYTHON` environment variable; `src/sandbox.mjs` reads it straight from `process.env`.

Key names are in `.env.example`:

```
NVIDIA_DEEPSEEK_KEY=
GEMINI_API_KEY=
OPENAI_COMPAT_BASE_URL=
OPENAI_COMPAT_API_KEY=
```

Keys are read by `src/env.mjs`, first match wins: environment variables, the file named by `SIEVE_ENV_FILE`, `.env` in the current directory, then `~/.config/sieve/.env`. Values never appear in errors or logs. You only need the key for the model you use. For the `codex-cli` model, the `codex` command just has to be on PATH and signed in.

## Running

```
node bench/run.mjs --strategy single,public,codet,combined --model gemini-3.1-flash-lite --samples 5 --temp 0.8 --out sonuc/g31lite.jsonl
node bench/analyze.mjs sonuc/g31lite.jsonl
```

`bench/run.mjs` flags (each takes a value):

| Flag | Default | Meaning |
| --- | --- | --- |
| `--out` | required | JSONL output file; appended to if it exists |
| `--strategy` | `single` | comma-separated: `single,public,codet,combined,router` |
| `--model` | `deepseek-v4.1-flash` | the cheap model that generates candidates |
| `--samples` | `5` | candidates per task (N) |
| `--temp` | `0.8` | candidate temperature |
| `--max-tokens` | `4096` | output limit per candidate |
| `--probes` | `8` | extra inputs requested from the model |
| `--concurrency` | `2` | tasks processed at the same time |
| `--threshold` | `0.6` | router escalation threshold |
| `--strong` | `gemini-4-argon` | the model the router escalates to |
| `--strong-budget` | `15` | total HTTP attempt budget for the strong model |
| `--only` | all | task name prefixes, e.g. `t01,t4` |
| `--retry-rounds` | `2` | extra rounds for tasks where every candidate errored |
| `--resume` | off | takes no value; skips tasks that already have a row in the output file |

A task whose candidates all fail with API errors is not written to the file; once the round ends it waits 5 s and is retried. Tasks that still fail after `--retry-rounds` are listed at the end of the run. `--resume` looks only at the task name: if the file has any row for that task, the task is skipped, whatever model and strategy wrote it. Write different runs to separate files.

Known models: `deepseek-v4.1-flash` (NVIDIA; the catalog is `NVIDIA_MODELS` in `src/providers.mjs`), `gemini-4-argon`, `gemini-3.5-flash`, `gemini-3.5-flash-lite`, `gemini-3.1-flash-lite`, `codex-cli`, and CLI models of the form `opencode:<model>` / `kilo:<model>` (e.g. `opencode:opencode/deepseek-v4.1-flash-free`). The check lives in `knownModels()`; an unknown model name is rejected before the run starts. For CLI models the relevant command (`opencode`, `kilo`; `.cmd` on Windows) must be on PATH. These providers don't report token counts, so they are estimated from character counts; `--temp` and `--max-tokens` are not passed to them.

`bench/analyze.mjs` accepts several files; for the same strategy, model, N, temperature and task it uses the last row. `--threshold` changes the band in the agreement-versus-accuracy breakdown.

At the end of a run it prints how many HTTP attempts each model used and the tasks that have no `public_test.py`. Failed calls stay in the rows with an `error` field and are counted in a separate column in the analysis.

## Tasks

Each task is a folder under `bench/tasks/`. [bench/tasks/INDEX.md](bench/tasks/INDEX.md) lists name, difficulty and signature for `t01`-`t50`. The runner doesn't read INDEX; it takes every folder whose name starts with `t<number>_`. Each folder contains:

- `prompt.md`: the only text sent to the model. The signature is always `solve(...)`. Example lines of the form `solve(...) == ...` are also used as extra inputs.
- `public_test.py`: the public test the selector can see (`from solution import solve` and `assert`).
- `test.py`: the hidden test, run only for scoring.
- `reference.py`: a hand-written correct solution. The pipeline doesn't read it; it is used only as a fake model answer in tests.

If a task has no `public_test.py`, `public`, `combined` and `router` don't run for it and the row gets `skipped`.

## Tests

```
node --test
```

It doesn't touch the network; provider tests use a fake `fetch` and a fake `spawn`. The sandbox and the end-to-end pipeline test run real `python` (`pipeline.test.mjs` runs the `t45_lru_cache` task from start to finish with a fake model and checks that no prompt contains a line from the hidden test). `test/cli.test.mjs` and `test/serve.test.mjs` cover `sieve solve` with a fake provider and `sieve serve` over real HTTP on 127.0.0.1. As of 2026-11-05 all 108 tests pass.

## Results

All numbers below come from runs on this repo's task set (120 tasks; `bench/tasks/`), N=5 candidates, temperature 0.8 where the provider honors it. Raw per-task rows are produced by `bench/run.mjs`; tables by `bench/analyze.mjs`. Read the caveats under the tables before quoting anything.

"Single" is the first candidate (one ordinary attempt). "Best selection" is the best of the selection strategies that never see the hidden test. "Oracle" means at least one of the five candidates passed; it is an upper bound for any selector, not a method.

| Model | Tasks scored | Single | Best selection | Oracle | Tokens per task: single → combined |
|---|---|---|---|---|---|
| qwen2.5-coder 1.5B (local, Ollama) | 105 | 19.4% | 35.2% (repair), 33.3% (public/combined) | 35.2% | 431 → 3502 (repair: 6584) |
| Kilo north-mini-code (free) | 82 of 90 | 68.7% | 81.7% (combined) | 84.1% | 473 → 2477 |
| Kilo north-mini-code, hard tasks, router with a cloud model as the strong tier | 29 of 40 | 35.3% | 69.0% (router, 4 tasks escalated) | 62.1% (cheap model only) | 649 → 3231 (cloud tokens not counted) |
| Gemini 3.1 flash-lite | 43 of 90 | 95.8% | 97.7% | 100% | 362 → 1710 |

Strong models, one attempt each, on the hard tasks only (reference points, not Sieve results): Codex 40/40, Copilot (auto) 15/15, deepseek-v4.1-flash via OpenCode 14 of 14 completed tasks.

Local inference speed on an RTX 4060 Laptop (8 GB), Ollama, 3 repeats: qwen2.5-coder 1.5B about 109 tokens/s; 3B and 7B were measured while another job shared the GPU (27.5 and 14.0 tokens/s) and should be re-measured.

What the data supports:

- On the two weaker models selection helped consistently: +13 points (Kilo, 82 tasks) and +14 to +16 points (1.5B, 105 tasks) over a single attempt. Selection reached the oracle for the 1.5B model and stayed 2.4 points below it for Kilo.
- The router (escalate to a stronger model when candidates disagree) beat the cheap model's own oracle on the hard tasks, which is expected: the strong model solves tasks none of the cheap candidates solved.
- On Gemini the task set was too easy (96% single), so nothing could be measured.
- `repair` (feeding the failing public-test line back to the model for one round) matched the best selector on the 1.5B model, at about 15 times the single-attempt token cost.

What it does not support yet:

- Cost is not free: selection spends 4.7 to 8 times the tokens of a single attempt. We have not run the fair comparison "best of five single attempts at the same token budget"; until then, say "selection helps at higher cost", not "selection is cheaper".
- Several runs are incomplete. Free providers dropped calls (rate limits, network errors), so some tasks never completed: 8 tasks missing for Kilo, 11 for the router run, 47 for Gemini. Tasks that fail to run may not be representative.
- Tasks were written mostly by AI coding agents and checked by running their reference solutions against their own tests (`bench/validate.mjs`). Two tasks had wrong expected values fixed by the same agent. There is no independent human review.
- Selection only works when something can be checked: a public test or sample inputs. With only agreement between candidates (no test), identical wrong answers win: in a smoke test all three 1.5B candidates produced the same wrong code and agreed with confidence 1.00.
- These are small function-level tasks, not multi-file software work. Nothing here says anything about competing with large cloud models on real projects.

## Architecture

Modules, flow, the points where the hidden test can't enter selection, and known limits: [docs/MIMARI.md](docs/MIMARI.md).

## License

[PolyForm Small Business 1.0.0](LICENSE.md). Source-available, not OSI open source: free for individuals and companies with fewer than 100 people and under USD 1M revenue; larger companies need a separate license from the author.
