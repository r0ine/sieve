from collections import Counter


def solve(values: list[int]) -> list[int]:
    counts = Counter(values)
    return sorted(counts, key=lambda value: (-counts[value], value))
