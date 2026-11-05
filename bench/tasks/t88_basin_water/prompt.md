# basin_water
Difficulty: hard

Implement `solve(heights: list[list[int]]) -> int`.

`heights` is a rectangular grid of nonnegative integer column heights (it may be empty, or have a single row or column). Rain falls on every cell. Water flows between cells that share an edge (up, down, left, right — not diagonally) and drains away off the outer edge of the grid. Return the total volume of water that stays trapped once everything settles, in units of one cell times one height unit.

Precisely: the water level of a cell is the smallest possible value of the largest height met on a path from that cell to any cell on the outer border (the path includes both its first and last cell, and moves only between edge-adjacent cells). The trapped amount on a cell is its water level minus its own height. Border cells therefore trap nothing. Return the sum over all cells.

Note that a dip can drain through a long winding channel, and that water level is not determined by the tallest walls in the row and column alone.

## Examples

- `solve([[3, 3, 3], [3, 0, 3], [3, 3, 3]]) == 3`
- `solve([[3, 3, 3], [3, 0, 1], [3, 3, 3]]) == 1`
- `solve([[1, 4, 3, 1, 3, 2], [3, 2, 1, 3, 2, 4], [2, 3, 3, 2, 3, 1]]) == 4`
