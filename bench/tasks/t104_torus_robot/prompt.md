# torus_robot
Difficulty: hard

Implement `solve(width: int, height: int, obstacles: list[tuple[int, int]], commands: str) -> tuple[int, int, str, int]`.

A robot moves on a `width` x `height` grid (`width, height >= 1`) of cells `(x, y)` with `0 <= x < width` and `0 <= y < height`. The grid wraps around on both axes like a torus. It starts at `(0, 0)` facing `N`; there is never an obstacle at `(0, 0)`. Obstacles may be listed more than once.

Directions: `N` is `y + 1`, `E` is `x + 1`, `S` is `y - 1`, `W` is `x - 1`, with coordinates taken modulo the grid size.

`commands` is a string with no separators made only of the commands below; digits appear only directly after `F` or `B`. Obstacles always lie inside the grid. Commands:

- `L` / `R`: turn 90 degrees left / right. `U`: turn 180 degrees.
- `F<k>`: move forward `k` cells; `B<k>`: move backward `k` cells without changing the facing. `<k>` is an optional run of ASCII digits (the maximal run directly after the letter); if absent, `k = 1`. `k` may be 0.

Movement is one cell at a time. If the next cell holds an obstacle, the robot stays where it is and the rest of that command is cancelled; execution continues with the next command.

Return `(x, y, facing, visited)` where `visited` is the number of distinct cells the robot has stood on, including the start cell.

## Examples

- `solve(5, 5, [], "F7") == (0, 2, "N", 5)`
- `solve(5, 5, [(0, 2)], "F4RF1") == (1, 1, "E", 3)`
- `solve(3, 3, [], "UF1") == (0, 2, "S", 2)`
