def solve(intervals: list[tuple[int, int]]) -> int:
    total = 0
    current_start = current_end = None
    for start, end in sorted(intervals):
        if start == end:
            continue
        if current_end is None:
            current_start, current_end = start, end
        elif start <= current_end:
            current_end = max(current_end, end)
        else:
            total += current_end - current_start
            current_start, current_end = start, end
    if current_end is not None:
        total += current_end - current_start
    return total
