# poly_multiply
Difficulty: hard

Implement `solve(a: str, b: str) -> str`.

Multiply two polynomials in `x` with integer coefficients and print the product in canonical form.

Input format (always valid): spaces may appear anywhere and are ignored. A polynomial is one or more terms; the first term may start with `+` or `-`, and every later term must be preceded by exactly one `+` or `-`. A term is either a coefficient alone (`7`), or an optional coefficient followed by `x`, optionally followed by `^` and an exponent (`x`, `3x`, `x^4`, `12x^0`). Coefficients and exponents are ASCII digit strings, possibly with leading zeros and possibly `0`. A missing coefficient means 1, a missing exponent means 1, and `x^0` is a constant. Terms with the same exponent may repeat and terms may be in any order.

Output format:

- Combine like terms, drop zero terms, list terms by exponent descending. The zero polynomial is `0`.
- A term with exponent 0 prints its coefficient's absolute value. Exponent 1 prints `x`, higher exponents print `x^e`. A coefficient of absolute value 1 is omitted before `x`; otherwise the absolute value is written directly before `x` (`3x^2`).
- The first term is prefixed with `-` if negative and nothing if positive. Each later term is joined with ` + ` or ` - ` according to its sign.

## Examples

- `solve("x+1", "x-1") == "x^2 - 1"`
- `solve("-x - 1", "x + 1") == "-x^2 - 2x - 1"`
- `solve("x - x", "5") == "0"`
