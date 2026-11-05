# lexicographic euler trail

Difficulty: hard

Write `solve(n: int, edges: list[tuple[int, int]]) -> list[int] | None`.

The vertices are `0` through `n-1`. Each tuple is a distinct undirected edge instance; parallel edges and self-loops are allowed. Return a vertex sequence using every edge instance exactly once, or `None` if none exists. Choose the lexicographically smallest complete vertex sequence among all possible starts and edge choices. A self-loop adds the same vertex twice to the sequence. With no edges, return `[0]` if `n > 0`, otherwise `[]`. Inputs satisfy `0 <= n`, valid endpoint indices, and at most 12 edges.

Examples:
- `solve(3, [(0, 1), (1, 2)]) == [0, 1, 2]`
- `solve(3, [(0, 1), (1, 2), (2, 0)]) == [0, 1, 2, 0]`
- `solve(4, [(0, 1), (2, 3)]) is None`
