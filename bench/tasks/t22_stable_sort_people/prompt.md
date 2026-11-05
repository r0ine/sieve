# stable sort people

Difficulty: medium

Write `solve(people: list[tuple[str, int]]) -> list[tuple[str, int]]`.

Sort (name, age) pairs by ascending age, then by casefolded name. If both keys match, keep original order. Preserve each original name exactly. Empty input returns [].

Examples:
- `solve([('Bob', 20), ('amy', 20)]) == [('amy', 20), ('Bob', 20)]`
- `solve([('A', -1), ('B', 0)]) == [('A', -1), ('B', 0)]`
