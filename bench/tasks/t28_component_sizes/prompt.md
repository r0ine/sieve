# component sizes

Difficulty: medium

Write `solve(n: int, edges: list[tuple[int, int]]) -> list[int]`.

Nodes are 0 through n-1. Edges are undirected and endpoints are valid. Return connected component sizes sorted ascending. Self loops and repeated edges do not change sizes. n may be zero.

Examples:
- `solve(4, [(0, 1), (1, 2)]) == [1, 3]`
- `solve(0, []) == []`
