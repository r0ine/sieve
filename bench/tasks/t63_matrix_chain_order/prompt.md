# matrix_chain_order
Difficulty: hard

Implement `solve(dimensions: list[int]) -> list`.

`dimensions` has at least one positive integer. It describes `n = len(dimensions) - 1` matrices, where `Ai` has `dimensions[i-1]` rows and `dimensions[i]` columns. Find a full parenthesization that minimizes the number of scalar multiplications; multiplying an `a × b` matrix by a `b × c` matrix costs `a*b*c`. Among all minimum-cost parenthesizations, choose the lexicographically smallest rendering in Python string order. Render a leaf as `A1`, `A2`, etc. Render a product by concatenating `(`, the left rendering, the right rendering, and `)` without spaces.

Return `[cost, rendering]`. For no matrices return `[0, ""]`; for one matrix return `[0, "A1"]`. Use exact integer arithmetic.

## Examples

- `solve([10, 30, 5, 60]) == [4500, "((A1A2)A3)"]`
- `solve([1, 1, 1, 1]) == [2, "((A1A2)A3)"]`
