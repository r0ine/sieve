# topological order

Difficulty: hard

Write `solve(n: int, edges: list[tuple[int, int]]) -> list[int] | None`.

Nodes are 0 through n-1; each directed edge (u,v) requires u before v. Return the lexicographically smallest topological order, or None if any cycle exists. Duplicate edges and self loops are allowed. For n=0 return [].

Examples:
- `solve(3, [(0, 2), (1, 2)]) == [0, 1, 2]`
- `solve(2, [(0, 1), (1, 0)]) is None`
