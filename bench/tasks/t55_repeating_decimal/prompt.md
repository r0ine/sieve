# repeating_decimal
Difficulty: hard

Implement `solve(numerator: int, denominator: int) -> str`.

Return the exact base-ten expansion of the rational number. `denominator` is positive. Use a leading minus sign only for a nonzero negative result. Include at least one integer digit. Omit the decimal point when the fractional part terminates immediately. For a nonterminating expansion, put the shortest repeating cycle in parentheses, starting at its first occurrence after any nonrepeating prefix. Do not include redundant leading zeroes in the integer part or trailing zeroes in a terminating fractional part. Integers can be arbitrarily large; do not use floating point. The denominator is at most 10,000.

## Examples

- `solve(1, 6) == "0.1(6)"`
- `solve(-22, 7) == "-3.(142857)"`
- `solve(1, 8) == "0.125"`
