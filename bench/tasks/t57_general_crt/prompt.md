# general_crt
Difficulty: hard

Implement `solve(congruences: list[list[int]]) -> list[int] | None`.

Each pair `[remainder, modulus]` means `x ≡ remainder (mod modulus)`; every modulus is positive, and remainders can be negative or outside their modulus. Find an integer satisfying all pairs, including when moduli share factors. Return `[r, m]`, where `m` is the least common multiple of all moduli and `0 <= r < m`; every solution is congruent to `r` modulo `m`. Return `None` if the constraints conflict. For an empty list return `[0, 1]`. Python integers are unbounded; do not use floating point.

## Examples

- `solve([[2, 3], [3, 5]]) == [8, 15]`
- `solve([[1, 4], [3, 6]]) == [9, 12]`
- `solve([[0, 2], [1, 2]]) is None`
