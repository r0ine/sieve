# exact_half_even
Difficulty: hard

Implement `solve(value: str, places: int) -> str`.

`value` is a finite decimal string matching `[+-]?[0-9]+(\.[0-9]+)?`. It may have leading zeros and arbitrarily many digits. Round it to `places` decimal places using round-half-to-even on the absolute value; `places` can be negative, in which case it names a power of ten to the left of the decimal point. A discarded portion exactly equal to half rounds toward the result with an even retained digit. Apply the original sign after rounding, but render every zero as unsigned.

For nonnegative `places`, include exactly that many digits after the decimal point. For negative `places`, return an integer with the appropriate trailing zeroes. Never use exponent notation or thousands separators. Inputs are guaranteed to have at most 1000 digits and `-20 <= places <= 20`.

## Examples

- `solve("2.345", 2) == "2.34"`
- `solve("-2.355", 2) == "-2.36"`
- `solve("250", -2) == "200"`
