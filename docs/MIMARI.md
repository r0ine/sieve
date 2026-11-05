# Architecture

This document describes the code as it is today. If a behavior contradicts what is written here, the source is right and the document gets fixed.

## Flow

```
bench/run.mjs
  createProviders()                     src/providers.mjs
  for each task (--concurrency in parallel):
    loadTask(dir)                       src/pipeline.mjs   -> { name, prompt, publicTest }
    solveTask(task, ...)                src/pipeline.mjs
      draft() x N                       providers.complete
      requestProbeInputs()              src/probes.mjs     (if codet/combined/router requested)
      inspect() each candidate          src/sandbox.mjs    runTestFile(public_test.py), probeOutputs()
      selectCandidate(strategy)         src/select.mjs
      routeTask()                       src/router.mjs     (router only)
    scoreHidden(solved, test.py)        src/report.mjs     <- the hidden test first appears here
    buildRows() -> JSONL rows           src/report.mjs
bench/analyze.mjs  JSONL -> table
```

### bench/run.mjs

Parses the flags and validates strategy and model names against `STRATEGIES` and `knownModels()`. Sorts the folders under `bench/tasks/` that start with `t<number>_` and filters them by prefix if `--only` is given. Tasks are processed by a simple pool, `--concurrency` at a time.

The provider is created once, and the strong model budget is passed as `budgets: { [strong]: strong-budget }`; all tasks share this budget. `solveTask` runs for each task. If every candidate errored, the task is not scored, not written to the file, and goes on a retry list; tasks left on the list are rerun `--retry-rounds` more times after waiting 5 s at the end of a round. Otherwise `scoreHidden` runs `path.join(dir, 'test.py')` and the rows are appended to the file. The output file is opened with `flags: 'a'`: a second run appends rows and doesn't delete the old ones. With `--resume`, the `task` fields of the rows in the file are read and those tasks are removed from the list; model, strategy and N are not compared. The run info in the rows (`meta`) consists only of `run` (ISO date), `model`, `samples` and `temp`; the threshold and the strong model appear only in the `route` field of router rows.

### src/pipeline.mjs

`loadTask` returns only `name`, `prompt` (the contents of prompt.md) and `publicTest` (the path to the public test, or `null`).

`solveTask`, in order:

1. Moves the strategies that need `public_test.py` (`public`, `combined`, `router`) to the `skipped` list if there is no public test.
2. Requests N candidates at once with `Promise.all`. The system prompt is `CODE_SYSTEM`: a single python block, standard library only, no input/output and no file or network access. If a call fails, the candidate stays with an `error` field; a `BudgetError` is additionally marked `budget: true`.
3. If any requested strategy uses the signature (`codet`, `combined`, `router`), it collects extra inputs: arguments taken from the `solve(...) == ...` lines in the prompt, plus `--probes` inputs requested from the model. The extra-input request goes to the same cheap model (`probeModel` defaults to `model`; run.mjs doesn't change it). If this request fails, `probeError` is written and the run continues with the prompt examples only.
4. Each candidate without an error goes through `inspect`: it is run against the public test and on the extra inputs.
5. Each strategy calls `selectCandidate` over the same candidate list. For `router`, `routeTask` also runs.

The returned object holds the candidates' code, `publicPass`, `signature`, the selection results and three separate token totals (`candidates`, `probes`, `strong`).

### src/providers.mjs

A single `complete({ model, system, prompt, temperature, maxTokens })` interface. The path is chosen by model:

- `codex-cli`: `codex exec --sandbox read-only` runs as a child process, the prompt goes in through stdin, and the answer is read from the `--output-last-message` file. At most two processes at a time, at least 2 s between starts, a 300 s timeout per process. Tokens are not measured: `usage` is zero and `estimated: true` is returned.
- `opencode:<model>` and `kilo:<model>`: the system prompt and the task text are written to a temporary `request.txt`, then `opencode run --model <model> --file request.txt "<message>"` is run (the same arguments in a different order for kilo), and the answer is read from stdout. `cleanCliOutput` strips ANSI escapes and tool-log lines outside code blocks (such as `tool:`, `running:`). The two providers together run at most two processes; the start interval is 1 s per provider and the timeout is 180 s. Tokens are estimated as a quarter of the character count and marked `estimated: true`.
- Gemini models (`GEMINI_MODELS`): REST `generateContent`. Thought parts in the response are discarded, and `thoughtsTokenCount` is counted as a separate field. There is a minimum wait interval per model (`gemini-4-argon` 6 s, others 1 s).
- NVIDIA models (`NVIDIA_MODELS`, currently only `deepseek-v4.1-flash`): a direct request to the OpenAI-compatible `chat/completions` endpoint at `integrate.api.nvidia.com`; each entry names its model id and key variable (`NVIDIA_DEEPSEEK_KEY`).

Error bodies go through `redactSecrets` (`src/redact.mjs`) before they reach the client: known key values plus common shapes (`Bearer ...`, `nvapi-`, `sk-`, `AIza...`, `key=value` pairs) are masked. Keys come from `loadEnv()` in `src/env.mjs`.

### src/sandbox.mjs

Model code runs in one of two ways. Both first pass the `findBanned` check, and every run happens in a fresh directory under `os.tmpdir()` that is deleted afterwards. The child gets a scrubbed environment: `PATH`, `SystemRoot`/`WINDIR`, and `TEMP`/`TMP`/`HOME` pointing at the temp dir. Python is started as `python -I -B -X utf8 sieve_guard.py ...` (no `PYTHON*` variables, no user site, no bytecode writes). The guard, embedded in `sandbox.mjs`, first sets OS limits (on Windows a Job Object: one active process, memory and CPU-time caps, kill-on-close, UI restrictions; rlimits on Linux and macOS), then installs a `sys.addaudithook` policy that refuses file access outside the temp dir and Python's own roots, writes, network, process creation and native code, and only then puts the temp dir at the front of `sys.path` and runs the test or probe script with `runpy`. That is how `-I` and `from solution import solve` work together. The default timeout is 10 s and kills the whole process tree; memory defaults to 512 MB (`SIEVE_MEMORY_MB`); stdout and stderr together are capped at 1 MB, after which the process is killed.

With `SIEVE_SANDBOX=docker` or `podman` (`sieve solve --sandbox docker` sets it) the same guard runs inside a container with no network, a read-only root and a read-only mount of the temp dir. If the engine or the image (`SIEVE_DOCKER_IMAGE`, default `python:3.12-slim`; it is never pulled) is missing, a single warning goes to stderr and the local layers are used. `sandboxStatus()` reports which layers were actually applied. Layers, threats and the remaining gaps: [GUVENLIK.md](GUVENLIK.md).

- `runTestFile(code, testPath)`: puts `solution.py` and a copy of the test file in the directory and runs the test. Exit code 0 means pass; otherwise the last line of stderr is returned as the reason.
- `probeOutputs(code, inputs)`: writes `solution.py`, the embedded `sieve_probe.py` script and a `cases.json` with the inputs into the directory. The script parses each input with `ast`, allowing literal nodes only, calls `solve` with a deep copy of the input and converts the result to a canonical string (sets and dicts are sorted, floats rounded to 9 digits, truncated at 2000 characters). An exception becomes `!raise <Type>`, an unparseable input `!input`, and inputs left after a timeout `!timeout`. If `solve` can't be imported, the candidate has no signature. During a call, the candidate's `print` output is redirected to a separate buffer and doesn't get mixed into the signature.

`extractCode` takes the longest python block in the answer; if there is no block, the whole text counts as code.

### src/probes.mjs

`exampleInputs` extracts the argument text of `solve(...)` calls on lines containing `==` in the prompt, tracking balanced parentheses. `requestProbeInputs` asks the model for inputs only, not expected outputs; `parseProbeReply` pulls the JSON array out of the answer (only text elements shorter than 2000 characters, no duplicates, at most `count`). `mergeProbes` merges the two lists without duplicates.

### src/select.mjs

The selector looks only at a candidate's `id`, `publicPass` (`true`, `false` or `null`) and `signature`.

- `single`: the smallest `id`. Agreement is `null`.
- `public`: the smallest `id` that passes the public test; agreement = number passing / total candidates. If none pass, the first candidate, with agreement 0.
- `codet`: candidates that have a signature are clustered. Columns that are `!input` in all candidates are ignored. Clusters are sorted by size first, then (on a tie) by fewer `!` cells, then by smallest `id`; the member with the smallest `id` in the first cluster is selected. Agreement = cluster size / total candidates; candidates without a signature don't join a cluster but stay in the denominator.
- `combined` and `router`: the same clustering, first among the candidates that pass the public test. If none of the passing candidates has a signature, the first passing candidate is selected and agreement is the passing ratio. If nobody passes, clustering runs over all candidates.

The denominator is always the number of candidates without errors; candidates dropped by API errors are eliminated at the start of `solveTask`, so they don't lower agreement.

### src/router.mjs

`shouldEscalate`: if agreement is equal to or above the threshold, there is no escalation. A `null` agreement counts as 0. If it is below the threshold and the strong model's remaining attempts (`providers.remaining(strong)`) are above zero, it escalates; if the budget is spent, it doesn't escalate and the reason is written to the record.

On escalation the strong model writes a single candidate with the same prompt (temperature 0.2, `strongMaxTokens` 16384, `id` = N). This candidate also goes through `inspect` against the public test and the extra inputs. `settleEscalation` decides as follows: if the strong call errored or no block could be extracted from the code, the cheap selection stays; if the strong candidate fails the public test and the cheap selected one passes, the cheap selection stays; in every other case the strong candidate is selected. The strong candidate's signature doesn't take part in the decision. The decision is written to the `route` field as `agreement`, `threshold`, `strongModel`, `escalated`, `outcome`, `reason` and, if present, `strongError`.

### src/report.mjs

`scoreHidden` runs every cheap candidate that has code, and the strong candidate if there is one, on the hidden test and returns an `id -> result` map. So not only the selected candidate but all candidates are scored; pass@1 and the oracle are computed from this. `buildRows` writes one row per strategy: the selected candidate, `selectedPass`, agreement, clusters, `route` if present, cost, and the code of all candidates with their hidden/public test results.

`strategyCost` gives the tokens a strategy would have spent if it had run alone: `single` only the usage of the first candidate without an error, `public` all candidates, `codet` and `combined` all candidates plus the extra-input request, `router` those plus the strong model.

### bench/analyze.mjs

Reads the JSONL files, keeps the last row per `strategy|model|N|temperature|task` key and prints one table row per strategy group. The `atlanan` column counts two things together: rows skipped because there is no public test, and tasks where every candidate errored. Over the scored tasks:

- pass@1 avg: the per-task average of the rate at which candidates without errors pass the hidden test.
- success with selection: the share of `selectedPass`.
- oracle: the share of tasks where at least one cheap candidate without an error passed.
- failed calls: the number of candidates with a non-empty `error` field.

For strategies that have agreement, it also prints how many selections were correct above and below the threshold.

## Repair loop (src/repair.mjs)

Strategies: `repair` (selector `combined`), `repair+public` (selector `public`, skipped when there is no public test) and `repair+codet` (selector `codet`). All three share one repair pool, built once per task. When any repair strategy is requested, the extra inputs are always collected and the public test is run if it exists, so the pool doesn't change with whatever other strategies run alongside it.

1. After `inspect`, `failureFeedback` builds a short error summary for every candidate without an API error. Its only sources are the public test result (`publicWhy`, the last stderr line; `publicAt`, the source line under the `public_test.py` frame in the traceback), `probeWhy`, and the `!raise` / `!timeout` cells of the signature (at most two inputs). An input column where no original candidate returned a value is left out, so an invalid extra input doesn't push every candidate into the same repair.
2. The text goes through `scrub`: drive-letter paths and paths starting with `/` become `<yol>`, the name `test.py` becomes `<gizli>`, whitespace collapses to one line. Limits: 200 characters per line, 500 in total.
3. For each candidate with non-empty feedback, the same cheap model is asked for a repair with the same temperature and `CODE_SYSTEM`. The prompt is the task text, the previous code and the error summary. The repaired candidate goes through `inspect` again (public test and extra inputs) and carries `repairOf`, `round` and `feedback`.
4. `--repair-rounds` rounds (default 1). In the next round only the previous round's repairs that still fail are repaired again; the loop stops early when nothing is left to fix. With `0` no call is made and the `repair` pool is just the original candidates.
5. Ids start at `samples + 1` (`samples` is reserved for the router's strong candidate). Ties in selection go to the smallest `id`, so an original candidate wins over a repaired one.

Pool = original candidates without errors + repairs without errors; the agreement denominator is this pool. `scoreHidden` also runs the hidden test on the repairs, but only for scoring, after `solveTask` has returned.

Hidden test: `repair.mjs` never receives the `test.py` path; the name appears there only in the redaction pattern. `test/repair.test.mjs` wraps `fs.readFileSync`, `fs.copyFileSync` and `fs.existsSync` during `solveTask` and checks that no `test.py` path is touched, then checks that no repair prompt contains the task folder path, the name `test.py` or any assertion that exists only in the hidden test.

Cost: `usage.repairs` is kept separately; `strategyCost` sums candidate + extra-input + repair tokens for the repair strategies. Rows get `repairRounds` and a view of each repair (`repairs`). `analyze.mjs` groups these rows under the label `repair R=<n>`, shows repair calls per task in the `onarım/görev` column and counts repair errors in `başarısız çağrı`. The `oracle` column is still computed from the original cheap candidates only; the oracle of the repaired pool is printed below the table on its own line, labelled as an unreachable upper bound.

Limits:

- A bare `assert` writes only `AssertionError` to stderr; the feedback gives the failing public test line, not the expected value.
- A candidate that passes the public test but raises on an extra input is repaired too; the exception may be correct behaviour for an input outside the task's constraints, and this isn't distinguished.
- Repair calls go out in parallel per candidate; if all N candidates fail, that is N extra calls per round.
- `repair` and `combined` use the same original candidates, but `repair` spends more tokens; any gain has to be read together with the token difference.

## Where the hidden test can't enter selection

This is a structural separation, not process isolation. It rests on these points:

- `loadTask` doesn't return the hidden test's path; the object has only `name`, `prompt` and `publicTest` (`test/pipeline.test.mjs` checks the key list exactly).
- The `test.py` path is built in exactly one place in the code: in `bench/run.mjs`, when it is passed to `scoreHidden` after `solveTask` returns. `pipeline.mjs`, `select.mjs`, `router.mjs` and `probes.mjs` don't receive this path and never mention the name `test.py`.
- Selection and escalation decisions are completed inside `solveTask`; `scoreHidden` runs afterwards, and `buildRows` doesn't change the decision, it only reads the result of the selected `id`.
- The texts that go to the model are `prompt.md` and the fixed system prompts. The end-to-end test checks that no prompt contains the last line of the hidden test.
- While candidate code runs during selection, the temporary directory holds only `solution.py` and `public_test.py` (or the probe script and `cases.json`). The hidden test is copied into a separate temporary directory during scoring.

`reference.py` also sits in the task folder; the pipeline doesn't read it, and it is used only in tests.

## Budget, 429 and retries

`complete` makes at most `maxAttempts` (4) attempts per model. Before each attempt, `reserve(model)` takes one from the budget: the budget is per HTTP attempt, not per task or per call, and there is a single counter per model for the whole run. When the budget is spent, a `BudgetError` is thrown and no switch to another model happens. The default budget is 15 for `gemini-4-argon` and unlimited for other models; `--strong-budget` overrides the strong model's budget.

Before each attempt, the minimum interval defined for the model is waited out (for Gemini, codex-cli and the CLI providers; NVIDIA models have no interval). For CLI providers the interval is kept per provider rather than per model name: `opencode:a` and `opencode:b` share the same queue. The budget, on the other hand, is always per full model name. The interval is enforced by handing out slots among concurrent requests to the same model, so even though N candidates are requested in parallel, only one request per second goes out to Gemini.

Failure classification (`classifyFailure`):

- 429: if the server asks for a wait longer than 60 s (the Retry-After header or `RetryInfo.retryDelay` in the Gemini body), it is not retried and the label is "quota". Otherwise it is retried after the requested time, or with exponential backoff if no time was given.
- 5xx, timeouts and recognized network errors (`ECONNRESET`, `ERR_SSL...`, "fetch failed" and so on): retried.
- Other HTTP statuses (400, 401, 404, 410...) and unrecognized errors: not retried.

The wait time is `waitMs ?? 1000 * 2^(attempt-1)` plus 0-500 ms of random jitter. The last error comes back with the labels of all attempts in a single message (`failed after 4 attempts [HTTP 503, HTTP 429, ...]`); if the same network error repeated on every attempt, the message says so separately.

## Known limits

- The banned-pattern check is a regular expression, not a security boundary, and the audit hook is detection rather than containment (PEP 578): a memory bug in CPython or a C extension, or an operation that raises no audit event (`os.stat`, for one), gets past it. Without a container, file and network access are stopped only by the hook. That the hidden test stays out of selection rests on the separation in the code, not on a capability restriction of the candidate code. Details in [GUVENLIK.md](GUVENLIK.md).
- Resource limits depend on the platform: macOS doesn't enforce `RLIMIT_AS`, so there memory is bounded only by the timeout unless a container is used.
- Signature comparison is exact text equality. List outputs whose order is unspecified (e.g. groups) can land in different clusters even among correct candidates; floats are only rounded to 9 digits.
- Extra inputs come from the same cheap model and their validity isn't checked; an input that violates the task's constraints can push correct candidates into an exception and separate them too. Apart from the columns that are `!input` in all candidates, no filtering is done.
- `oracle` is computed from the cheap candidates only. When the router selects the strong candidate and it passes, the router's success with selection can exceed the oracle.
- Candidates dropped by API errors are not in the agreement denominator. If four of five candidates error and one remains, agreement is 1.0 and the router doesn't escalate.
- The strong model budget is checked by looking at the remaining attempts; if concurrent tasks decide to escalate at the same moment, one of them can get a `BudgetError`. In that case the error goes in the record and the cheap selection stays.
- `codex-cli` token usage is not measured and shows as zero in the cost column. For `opencode:` and `kilo:` the number written is an estimate from characters, not real consumption; thinking tokens are not counted at all. The cost column for these models is not comparable with API models.
- Temperature and `maxTokens` are not passed to the CLI providers (`codex-cli`, `opencode:`, `kilo:`). With these models `--temp` is only a label written to the row; the diversity of the N candidates is left to the CLI's own settings. The 0.2 temperature used for the router's strong model is likewise void in this case.
- The output file is appended to. If different runs accumulate in the same file, `analyze.mjs` takes the last row for the same key and notes the repeat count. `--resume`, since it looks only at the task name, can wrongly skip a task in a file that holds another model's rows.
- A task whose candidates all errored isn't written, so tasks that still fail after `--retry-rounds` never appear in the JSONL and don't enter the `atlanan` column in the analysis either. They are listed only in the final list in the run output; take them from there when writing a report.
- The threshold and the strong model aren't written to the run meta in the rows; they are only in the `route` field of router rows.
