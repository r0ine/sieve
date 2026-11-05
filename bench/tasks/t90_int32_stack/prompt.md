# int32_stack
Difficulty: hard

Implement `solve(program: list[str]) -> list[int] | None`.

Run a stack machine whose values are signed 32-bit two's-complement integers (range `-2147483648` to `2147483647`). The stack starts empty. Each instruction is one of the exact strings below (lowercase, single space before an operand, no other whitespace):

- `push N` — `N` is a decimal integer with an optional leading `-` and one or more digits; it may be far outside the 32-bit range. Push `N` wrapped to 32 bits (reduce modulo 2**32 into the signed range).
- `pop` — remove the top value.
- `dup` — push a copy of the top value.
- `swap` — exchange the top two values.
- `neg` — replace the top value `a` with `-a`, wrapped (so `-(-2147483648)` stays `-2147483648`).
- `add`, `sub`, `mul`, `div`, `mod` — pop `b` (the top), then pop `a`, push the result of `a op b`, wrapped to 32 bits.

`div` truncates toward zero (`-7 div 2 = -3`), and `mod` is the matching remainder `a - b * (a div b)`, whose sign follows `a` (`-7 mod 2 = -1`, `7 mod -2 = 1`). `-2147483648 div -1` wraps to `-2147483648` and `-2147483648 mod -1` is `0`.

Return `None` if any instruction does not have enough operands on the stack, if `div` or `mod` has `b == 0`, or if an instruction is not exactly one of the forms above (unknown name, missing or malformed operand, operand on an instruction that takes none, extra spaces). Execution stops at the first error. Otherwise return the final stack as a list from bottom to top.

## Examples

- `solve(["push 7", "push -2", "div"]) == [-3]`
- `solve(["push 2147483647", "push 1", "add"]) == [-2147483648]`
- `solve(["push 1", "add"]) is None`
