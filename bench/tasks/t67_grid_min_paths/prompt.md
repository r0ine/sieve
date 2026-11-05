# grid_min_paths
Difficulty: hard

Implement `solve(grid: list[list[int | None]]) -> list | None`.

The grid is rectangular when nonempty. An integer cell is passable and contributes its value, which may be negative; `None` is blocked. Start at the top-left cell and finish at the bottom-right, moving only down (`D`) or right (`R`). Return `None` if the grid has no rows, has zero columns, either endpoint is blocked, or no route exists.

Among all routes, find the minimum sum of cell values, including both endpoints. Return `[minimum_sum, number_of_minimum_routes, lexicographically_smallest_move_string]`. Count distinct move strings exactly, without a modulus. Compare move strings with Python string order, so `D` precedes `R`. A one-cell passable grid has one route with an empty move string.

## Examples

- `solve([[1, 1], [1, 1]]) == [3, 2, "DR"]`
- `solve([[1, None], [2, 3]]) == [6, 1, "DR"]`
- `solve([]) is None`
