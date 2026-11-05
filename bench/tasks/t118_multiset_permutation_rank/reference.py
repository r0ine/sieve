from collections import Counter
from math import factorial


def solve(symbols: str, permutation: str) -> int | None:
    if Counter(symbols) != Counter(permutation):
        return None
    remaining = Counter(symbols)
    rank = 0
    for position, char in enumerate(permutation):
        for smaller in sorted(key for key in remaining if key < char and remaining[key]):
            remaining[smaller] -= 1
            count = factorial(len(permutation) - position - 1)
            for frequency in remaining.values():
                count //= factorial(frequency)
            rank += count
            remaining[smaller] += 1
        remaining[char] -= 1
    return rank
