# sqrt_digits
Difficulty: hard

Implement `solve(n: int, places: int) -> str`.

`n` is a nonnegative integer of any size (it may have hundreds of digits) and `0 <= places <= 200`. Return the decimal expansion of the exact square root of `n`, truncated (never rounded) to exactly `places` digits after the decimal point.

Format: the integer part in decimal without leading zeros (`"0"` if it is zero); if `places > 0`, a `.` and exactly `places` digits; if `places == 0`, no point. Floating-point arithmetic is not precise enough for this task; the result must be exact for every input.

## Examples

- `solve(2, 5) == "1.41421"`
- `solve(16, 2) == "4.00"`
- `solve(99, 0) == "9"`
