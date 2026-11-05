def solve(ranges: list[tuple[int, int]]) -> list[int]:
    return [value for start, end in ranges for value in range(start, end + 1)]
