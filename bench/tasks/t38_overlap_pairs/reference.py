def solve(intervals: list[tuple[int, int]]) -> int:
    count = 0
    for i, (a, b) in enumerate(intervals):
        if a == b:
            continue
        for c, d in intervals[i + 1:]:
            if c < d and max(a, c) < min(b, d):
                count += 1
    return count
