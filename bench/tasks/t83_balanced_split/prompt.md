# balanced_split
Difficulty: hard

Implement `solve(values: list[int], k: int) -> list[int]`.

`values` is a list of nonnegative integers (zeros allowed) and `1 <= k <= len(values)`. Split `values`, without reordering, into exactly `k` contiguous parts, each containing at least one element. The cost of a split is the largest part sum.

Return the lengths of the parts, from left to right, for a split of minimum cost. When several splits reach the minimum cost, return the one whose list of lengths is lexicographically largest, i.e. the first part is as long as possible, then the second part is as long as possible given the first, and so on (while still leaving at least one element for every remaining part). The lengths always sum to `len(values)`.

## Examples

- `solve([7, 2, 5, 10, 8], 2) == [3, 2]`
- `solve([1, 1, 1, 1], 2) == [2, 2]`
- `solve([5, 0, 0, 5], 2) == [3, 1]`
