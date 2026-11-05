def solve(values: list) -> int:
    total = 0
    for value in values:
        total += solve(value) if isinstance(value, list) else value
    return total
