# weighted_jobs
Difficulty: hard

Implement `solve(jobs: list[tuple[int, int, int]]) -> list[int]`.

Each job is `(start, end, weight)` describing the half-open time interval `[start, end)` with `start < end` and `weight >= 0`. Times may be negative. Two jobs conflict when their intervals share any instant, that is when `s1 < e2 and s2 < e1`; jobs that only touch (`e1 == s2`) do not conflict. There are at most 16 jobs.

Choose a set of pairwise non-conflicting jobs and return their indices (positions in `jobs`) sorted ascending. The chosen set must:

1. have the maximum possible total weight;
2. among those, contain as few jobs as possible (so zero-weight jobs are never chosen);
3. among those, be the lexicographically smallest sorted index list.

The empty input, or an input where every job has weight 0, returns `[]`.

## Examples

- `solve([(0, 2, 3), (2, 4, 3)]) == [0, 1]`
- `solve([(0, 5, 10), (0, 2, 4), (2, 5, 6)]) == [0]`
- `solve([(0, 2, 3), (1, 3, 3)]) == [0]`
