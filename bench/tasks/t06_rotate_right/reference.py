def solve(values: list[int], k: int) -> list[int]:
    if not values:
        return []
    shift = k % len(values)
    return values[-shift:] + values[:-shift] if shift else values[:]
