def solve(grid: list[list[int]], row: int, col: int) -> list[int]:
    result = []
    for r, c in ((row - 1, col), (row, col + 1), (row + 1, col), (row, col - 1)):
        if 0 <= r < len(grid) and 0 <= c < len(grid[r]):
            result.append(grid[r][c])
    return result
