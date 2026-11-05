def solve(matrix: list[list[int]]) -> tuple[int, int]:
    size = len(matrix)
    return (sum(matrix[i][i] for i in range(size)),
            sum(matrix[i][size - 1 - i] for i in range(size)))
