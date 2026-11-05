# digit_tally
Difficulty: hard

Implement `solve(lo: int, hi: int, digit: int) -> int`.

With `0 <= lo <= hi <= 10**18` and `0 <= digit <= 9`, return the total number of times the decimal digit `digit` occurs when every integer from `lo` to `hi` inclusive is written in ordinary decimal form, without leading zeros. The number `0` is written as `"0"` (one zero digit); `100` contains two zeros. Each occurrence counts, so `11` contributes two ones.

The range can contain up to 10**18 numbers, so iterating over it is too slow; the answer must be exact.

## Examples

- `solve(1, 13, 1) == 6`
- `solve(0, 10, 0) == 2`
- `solve(100, 100, 0) == 2`
