def solve(n: int, d: int) -> int:
    magnitude = (2 * abs(n) + d) // (2 * d)
    return magnitude if n >= 0 else -magnitude
