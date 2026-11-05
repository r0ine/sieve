# multi_key_sort
Difficulty: hard

Implement `solve(records: list[dict], spec: str) -> list[int]`.

Return the indices of `records` (positions in the input list) in sorted order. Nothing is modified.

`spec` is a comma-separated list of one or more field names with no whitespace, for example `"-age,name"`. A leading `-` makes that field descending; otherwise it is ascending. Fields are compared in the given order; a later field is consulted only when all earlier fields tie.

A field value in a record is an `int`, a `str`, `None`, or missing (the key is absent). For one field:

- `None` and missing are both "empty" and equal to each other. Empty values always come after all non-empty values, in both ascending and descending order.
- Among non-empty values, in ascending order every `int` comes before every `str`; ints compare numerically; strings compare first by their lowercase form (`str.lower()`), and if those are equal, by the original string with ordinary character-code ordering (`"Bob"` < `"bob"`).
- Descending order is the exact reverse of that non-empty ascending order (so strings come before ints), while empty values still go last.

Records that tie on every field keep their original relative order.

## Examples

- `solve([{"a": 2}, {"a": 1}, {"a": 2}], "a") == [1, 0, 2]`
- `solve([{"a": 2}, {"a": 1}, {"a": 2}], "-a") == [0, 2, 1]`
- `solve([{}, {"a": 1}, {"a": None}], "-a") == [1, 0, 2]`
