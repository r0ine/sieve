# nonpreemptive_jobs
Difficulty: hard

Implement `solve(jobs: list[list[int]]) -> list[list[int]]`.

Each job is `[release, duration, priority]` in input order. Releases are nonnegative integer times, durations are positive integers, and priorities are integers. A single processor starts idle at time zero. Once a job starts, it runs for its full duration and cannot be interrupted. At each idle moment, select among jobs whose release is at or before the current time: lowest numeric priority first, then earliest release, then lowest input index. If none is available, jump directly to the next release time. A job released exactly when another finishes is eligible for that selection. Return `[index, completion_time]` for each job in execution order. All times use exact integer arithmetic.

## Examples

- `solve([[0, 3, 1], [1, 1, 0]]) == [[0, 3], [1, 4]]`
- `solve([[0, 1, 2], [0, 1, 1]]) == [[1, 1], [0, 2]]`
