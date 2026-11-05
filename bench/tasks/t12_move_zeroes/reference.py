def solve(values: list[int]) -> list[int]:
    nonzero = [value for value in values if value != 0]
    return nonzero + [0] * (len(values) - len(nonzero))
