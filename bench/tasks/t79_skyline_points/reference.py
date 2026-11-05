def solve(buildings: list[tuple[int, int, int]]) -> list[tuple[int, int]]:
    xs = sorted({x for left, right, _ in buildings for x in (left, right)})
    points = []
    current = 0
    for x in xs:
        height = max((h for left, right, h in buildings if left <= x < right), default=0)
        if height != current:
            points.append((x, height))
            current = height
    return points
