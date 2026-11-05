def solve(values: list[int]) -> int:
    return sum(value if index % 2 == 0 else -value for index, value in enumerate(values))
