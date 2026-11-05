# radix_convert
Difficulty: hard

Implement `solve(text: str, src: int, dst: int, places: int) -> str`.

`text` is a number written in base `src`: an optional leading `-`, then one or more digits, then optionally a `.` followed by one or more digits. Digits are `0`-`9` followed by the letters `a`-`z` for values 10 to 35; letters may appear in upper or lower case. Every digit is valid for `src`. Bases satisfy `2 <= src, dst <= 36`, and `0 <= places <= 60`. Leading and trailing zeros are allowed in the input.

Convert the exact value to base `dst`, truncating toward zero so that at most `places` digits remain after the point (drop the rest, never round up; for negative numbers truncate the magnitude). The result must be computed exactly; inputs can have dozens of digits.

Output format:

- a `-` sign only if the truncated result is nonzero and negative (a value that truncates to zero has no sign);
- the integer part in base `dst` without leading zeros, `"0"` if it is zero;
- if `places > 0`, a `.` followed by exactly `places` digits (pad with `0`); if `places == 0`, no point at all;
- letter digits in lowercase.

## Examples

- `solve("ff", 16, 10, 0) == "255"`
- `solve("0.1", 10, 2, 8) == "0.00011001"`
- `solve("-0.001", 10, 10, 2) == "0.00"`
