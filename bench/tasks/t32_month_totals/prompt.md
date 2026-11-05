# month totals

Difficulty: medium

Write `solve(records: list[tuple[str, int]]) -> list[tuple[str, int]]`.

Each record contains a valid YYYY-MM-DD date and an integer amount. Sum amounts by YYYY-MM month and return (month, total) pairs in ascending month order. Preserve zero totals. Empty input returns [].

Examples:
- `solve([('2024-02-01', 2), ('2024-02-20', -1)]) == [('2024-02', 1)]`
- `solve([]) == []`
