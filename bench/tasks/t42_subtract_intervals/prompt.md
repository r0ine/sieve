# subtract intervals

Difficulty: hard

Write `solve(base: tuple[int, int], cuts: list[tuple[int, int]]) -> list[tuple[int, int]]`.

Treat base and cuts as closed integer intervals with start <= end. Return sorted disjoint closed pieces of base after removing every integer covered by any cut. Cuts may overlap, repeat, or extend outside base. Empty cuts leave base unchanged.

Examples:
- `solve((1, 5), [(2, 3)]) == [(1, 1), (4, 5)]`
- `solve((1, 3), [(0, 4)]) == []`
