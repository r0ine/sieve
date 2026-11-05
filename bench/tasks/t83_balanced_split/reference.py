def _parts_needed(values, limit):
    count, running = 1, 0
    for v in values:
        if running + v > limit:
            count += 1
            running = v
        else:
            running += v
    return count


def solve(values: list[int], k: int) -> list[int]:
    lo, hi = max(values), sum(values)
    while lo < hi:
        mid = (lo + hi) // 2
        if _parts_needed(values, mid) <= k:
            hi = mid
        else:
            lo = mid + 1
    best = lo

    lengths = []
    start = 0
    for left in range(k, 0, -1):
        if left == 1:
            lengths.append(len(values) - start)
            break
        size, running = 0, 0
        for end in range(start, len(values) - left + 1):
            running += values[end]
            if running > best:
                break
            rest = values[end + 1:]
            if _parts_needed(rest, best) <= left - 1 <= len(rest):
                size = end - start + 1
        lengths.append(size)
        start += size
    return lengths
