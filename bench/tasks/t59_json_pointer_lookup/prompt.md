# json_pointer_lookup
Difficulty: hard

Implement `solve(document, pointers: list[str]) -> list[list]`.

For each JSON Pointer, return `[True, value]` if it resolves, or `[False, None]` if it does not. The document contains only JSON-compatible dictionaries with string keys, lists, strings, numbers, booleans, and `None`. An empty pointer selects the entire document. Every nonempty pointer starts with `/`; split its remaining text on `/`, then decode each token by replacing `~1` with `/` and `~0` with `~`, in that order. Pointers are guaranteed to use only these valid tilde escapes.

For a dictionary, use the decoded token as an exact key, even if it looks numeric. For a list, accept only `0` or a nonzero decimal index with no leading zeroes; reject `-`, signs, empty tokens, and out-of-range indices. Strings and scalar values cannot be traversed further. A stored `None` is found. Return the original values without modifying the document.

## Examples

- `solve({"a": [10, None]}, ["/a/1", "/a/2"]) == [[True, None], [False, None]]`
- `solve({"a/b": 3}, ["/a~1b", ""]) == [[True, 3], [True, {"a/b": 3}]]`
