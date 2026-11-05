def solve(values: list[int]) -> tuple[int, int, int]:
    if not values:
        return (0, -1, -1)
    best = (values[0], 0, 0)
    for start in range(len(values)):
        total = 0
        for end in range(start, len(values)):
            total += values[end]
            if total > best[0] or (total == best[0] and (start, end) < best[1:]):
                best = (total, start, end)
    return best
