# run lengths

Difficulty: easy

Write `solve(text: str) -> list[tuple[str, int]]`.

Return consecutive character runs as (character, count) pairs. Compare Unicode code points exactly; do not normalize or casefold. Empty text returns an empty list.

Examples:
- `solve('aaabb') == [('a', 3), ('b', 2)]`
- `solve('aAa') == [('a', 1), ('A', 1), ('a', 1)]`
