# Raw results

One JSON line per task and strategy, as written by `bench/run.mjs`. Tables in the main README come from `node bench/analyze.mjs results/raw/<file>.jsonl`. Local temp paths in error messages were replaced with `<tmp>`.

| File | Model | Task set |
|---|---|---|
| qwen15-local.jsonl | qwen2.5-coder 1.5B (Ollama) | 105 tasks |
| kilo-90.jsonl | Kilo north-mini-code (free) | 82 of 90 tasks completed |
| kilo-router-zor.jsonl | Kilo north-mini-code + cloud strong tier (router) | 29 of 40 hard tasks completed |
| g31-90.jsonl, g31-zor76.jsonl | Gemini 3.1 flash-lite | 43 of 90, 6 of 15 (rest hit rate limits) |
| codex-zor.jsonl, copilot-zor76.jsonl, oc-deepseek-zor.jsonl | strong-model reference points, hard tasks | one attempt each (N=5 for deepseek) |

Runs are incomplete where free providers dropped calls; see the caveats in the main README before quoting any number.
