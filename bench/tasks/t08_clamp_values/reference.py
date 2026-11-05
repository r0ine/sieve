def solve(values: list[int], low: int, high: int) -> list[int]:
    return [min(high, max(low, value)) for value in values]
