# topological_layers
Difficulty: hard

Implement `solve(nodes: list[str], edges: list[list[str]]) -> list[list[str]] | None`.

The node names are distinct ASCII strings. Each directed edge `[source, destination]` names listed nodes; duplicate edges are allowed. Repeatedly take every currently zero-indegree node as one layer, sorted lexicographically, then remove that whole layer and its outgoing edges before forming the next. Return the layers in order. An empty graph returns `[]`. Return `None` if any nodes remain after no zero-indegree layer is available, including self-loops. Do not mutate the inputs.

## Examples

- `solve(["a", "b", "c"], [["a", "c"], ["b", "c"]]) == [["a", "b"], ["c"]]`
- `solve(["a", "b"], [["a", "b"], ["b", "a"]]) is None`
