# lex_shortest_path
Difficulty: hard

Implement `solve(edges: list[list], start: str, end: str) -> list | None`.

Each directed edge is `[source, destination, weight]`, where node names are strings and weights are nonnegative integers. Duplicate edges are allowed. Find a path from `start` to `end`. Choose the path with the smallest total weight; among those, the fewest edges; among those, the lexicographically smallest sequence of node names using Python string order. Return `[total_weight, node_sequence]`. Return `None` if no path exists. If `start == end`, return `[0, [start]]`, regardless of edges. Zero-weight cycles are allowed. Do not mutate the edges.

## Examples

- `solve([["a", "b", 2], ["a", "c", 1], ["c", "b", 1]], "a", "b") == [2, ["a", "b"]]`
- `solve([["a", "c", 1], ["c", "d", 1], ["a", "b", 1], ["b", "d", 1]], "a", "d") == [2, ["a", "b", "d"]]`
