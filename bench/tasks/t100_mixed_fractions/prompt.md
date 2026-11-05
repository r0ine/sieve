# mixed_fractions
Difficulty: hard

Implement `solve(expression: str) -> str`.

Evaluate an exact rational expression and print the result as a mixed number.

Input: tokens separated by one or more spaces (leading and trailing spaces allowed). Tokens alternate operand, operator, operand, ... starting and ending with an operand. Operators are `+`, `-`, `*`, `/` with the usual precedence (`*` and `/` before `+` and `-`) and left associativity. There are no parentheses and no unary operators. Each operand has one of these forms, where `W`, `N`, `D` are ASCII digit strings (leading zeros allowed) and `D` is never zero:

- `W` (an integer), `N/D` (a fraction), or `W_N/D` (a mixed number meaning `W + N/D`);
- any of these may carry a leading `-` attached to the operand, which negates the whole value: `-1_1/2` is `-(1 + 1/2)`.

Fractions in the input need not be reduced or proper (`6/4` and `1_6/4` are valid). If any division has a divisor equal to 0, return `undefined`.

Output: reduce the result. If it is an integer, print it (`0`, `7`, `-3`; never `-0`). Otherwise, if its absolute value is below 1, print `N/D` or `-N/D`. Otherwise print `W_N/D` or `-W_N/D` where `W` is the integer part of the absolute value and `N/D` the remaining proper fraction; the sign applies to the whole number.

## Examples

- `solve("1_1/2 + 3/4") == "2_1/4"`
- `solve("3/4 - 1_1/2") == "-3/4"`
- `solve("1 + 2 * 3") == "7"`
