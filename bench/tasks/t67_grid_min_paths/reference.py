def solve(grid: list[list[int | None]]) -> list | None:
    if not grid or not grid[0] or grid[0][0] is None or grid[-1][-1] is None:
        return None

    rows, columns = len(grid), len(grid[0])
    best = [[None] * columns for _ in range(rows)]
    best[0][0] = (grid[0][0], 1, "")
    for row in range(rows):
        for column in range(columns):
            if (row == 0 and column == 0) or grid[row][column] is None:
                continue
            candidates = []
            if row and best[row - 1][column] is not None:
                cost, count, path = best[row - 1][column]
                candidates.append((cost + grid[row][column], count, path + "D"))
            if column and best[row][column - 1] is not None:
                cost, count, path = best[row][column - 1]
                candidates.append((cost + grid[row][column], count, path + "R"))
            if candidates:
                minimum = min(item[0] for item in candidates)
                best[row][column] = (
                    minimum,
                    sum(item[1] for item in candidates if item[0] == minimum),
                    min(item[2] for item in candidates if item[0] == minimum),
                )
    result = best[-1][-1]
    return list(result) if result is not None else None
