def solve(base: tuple[int, int], cuts: list[tuple[int, int]]) -> list[tuple[int, int]]:
    start, end = base
    pieces = []
    cursor = start
    for cut_start, cut_end in sorted(cuts):
        if cut_end < cursor or cut_start > end:
            continue
        if cut_start > cursor:
            pieces.append((cursor, min(end, cut_start - 1)))
        cursor = max(cursor, cut_end + 1)
        if cursor > end:
            break
    if cursor <= end:
        pieces.append((cursor, end))
    return pieces
