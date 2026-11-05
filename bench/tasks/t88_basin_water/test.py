import random

from solution import solve


def brute(grid):
    if not grid or not grid[0]:
        return 0
    rows, cols = len(grid), len(grid[0])
    top = max(max(row) for row in grid)
    level = [[grid[r][c] if r in (0, rows - 1) or c in (0, cols - 1) else top for c in range(cols)]
             for r in range(rows)]
    changed = True
    while changed:
        changed = False
        for r in range(1, rows - 1):
            for c in range(1, cols - 1):
                low = min(level[r + 1][c], level[r - 1][c], level[r][c + 1], level[r][c - 1])
                new = max(grid[r][c], low)
                if new < level[r][c]:
                    level[r][c] = new
                    changed = True
    return sum(level[r][c] - grid[r][c] for r in range(rows) for c in range(cols))


assert solve([]) == 0
assert solve([[]]) == 0
assert solve([[5]]) == 0
assert solve([[5, 0, 5]]) == 0
assert solve([[5], [0], [5]]) == 0
assert solve([[3, 3], [3, 3]]) == 0
assert solve([[3, 3, 3], [3, 0, 3], [3, 3, 3]]) == 3
assert solve([[3, 3, 3], [3, 0, 1], [3, 3, 3]]) == 1
assert solve([[3, 3, 3], [3, 0, 0], [3, 3, 3]]) == 0
assert solve([[1, 4, 3, 1, 3, 2], [3, 2, 1, 3, 2, 4], [2, 3, 3, 2, 3, 1]]) == 4
assert solve([[3, 3, 3, 3, 3], [3, 2, 2, 2, 3], [3, 2, 1, 2, 3], [3, 2, 2, 2, 3], [3, 3, 3, 3, 3]]) == 10
assert solve([[12, 13, 1, 12], [13, 4, 13, 12], [13, 8, 10, 12], [12, 13, 12, 12], [13, 13, 13, 13]]) == 14
assert solve([[9, 9, 9, 9, 9], [9, 0, 9, 0, 9], [9, 9, 9, 9, 9]]) == 18
assert solve([[9, 9, 9, 9, 9], [9, 0, 5, 0, 9], [9, 9, 9, 9, 9]]) == 22
assert solve([[9, 9, 9, 9, 9], [9, 0, 5, 0, 9], [9, 9, 9, 9, 2]]) == 22
assert solve([[9, 9, 9, 9, 9], [9, 0, 5, 0, 2], [9, 9, 9, 9, 9]]) == 7
maze = [
    [9, 9, 9, 9, 9, 9, 9],
    [9, 0, 0, 0, 0, 0, 9],
    [9, 9, 9, 9, 9, 0, 9],
    [9, 0, 0, 0, 9, 0, 9],
    [9, 0, 9, 0, 0, 0, 9],
    [9, 0, 9, 9, 9, 9, 9],
    [9, 1, 9, 9, 9, 9, 9],
]
assert solve(maze) == 15
maze[6][1] = 9
assert solve(maze) == 9 * 15
maze[6][1] = 4
assert solve(maze) == 4 * 15
assert solve([[10 ** 9, 10 ** 9, 10 ** 9], [10 ** 9, 0, 10 ** 9], [10 ** 9, 10 ** 9, 10 ** 9]]) == 10 ** 9

rng = random.Random(88)
for _ in range(300):
    rows, cols = rng.randint(1, 7), rng.randint(1, 7)
    grid = [[rng.randint(0, 6) for _ in range(cols)] for _ in range(rows)]
    assert solve(grid) == brute(grid), grid

big = [[rng.randint(0, 1000) for _ in range(150)] for _ in range(150)]
assert solve(big) == brute(big)
