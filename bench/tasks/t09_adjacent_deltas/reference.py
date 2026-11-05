def solve(values: list[int]) -> list[int]:
    return [right - left for left, right in zip(values, values[1:])]
