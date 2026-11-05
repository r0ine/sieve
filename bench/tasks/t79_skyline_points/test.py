import random

from solution import solve


assert solve([]) == []
assert solve([(0, 5, 0)]) == []
assert solve([(0, 5, 0), (3, 9, 0)]) == []
assert solve([(0, 2, 3)]) == [(0, 3), (2, 0)]
assert solve([(0, 2, 3), (2, 4, 3)]) == [(0, 3), (4, 0)]
assert solve([(2, 4, 3), (0, 2, 3)]) == [(0, 3), (4, 0)]
assert solve([(0, 2, 3), (2, 4, 5)]) == [(0, 3), (2, 5), (4, 0)]
assert solve([(0, 2, 5), (2, 4, 3)]) == [(0, 5), (2, 3), (4, 0)]
assert solve([(0, 2, 3), (3, 4, 3)]) == [(0, 3), (2, 0), (3, 3), (4, 0)]
assert solve([(0, 5, 2), (1, 3, 4)]) == [(0, 2), (1, 4), (3, 2), (5, 0)]
assert solve([(0, 5, 4), (1, 3, 2)]) == [(0, 4), (5, 0)]
assert solve([(0, 5, 4), (0, 5, 4)]) == [(0, 4), (5, 0)]
assert solve([(0, 5, 4), (0, 5, 6)]) == [(0, 6), (5, 0)]
assert solve([(0, 5, 4), (0, 3, 6)]) == [(0, 6), (3, 4), (5, 0)]
assert solve([(0, 5, 4), (2, 5, 6)]) == [(0, 4), (2, 6), (5, 0)]
assert solve([(0, 3, 4), (1, 3, 4), (2, 3, 4)]) == [(0, 4), (3, 0)]
assert solve([(0, 4, 3), (1, 2, 0)]) == [(0, 3), (4, 0)]
assert solve([(0, 1, 0), (1, 2, 1)]) == [(1, 1), (2, 0)]
assert solve([(-5, -2, 7), (-2, 1, 7), (1, 3, 2)]) == [(-5, 7), (1, 2), (3, 0)]
assert solve([(-10, -5, 1)]) == [(-10, 1), (-5, 0)]
assert solve([(2, 9, 10), (3, 7, 15), (5, 12, 12), (15, 20, 10), (19, 24, 8)]) == [
    (2, 10), (3, 15), (7, 12), (12, 0), (15, 10), (20, 8), (24, 0)]
assert solve([(1, 2, 1), (1, 2, 2), (1, 2, 3)]) == [(1, 3), (2, 0)]
assert solve([(0, 10, 3), (2, 4, 5), (4, 6, 5), (6, 8, 3)]) == [(0, 3), (2, 5), (6, 3), (10, 0)]
assert solve([(0, 10, 3), (2, 4, 5), (4, 6, 1)]) == [(0, 3), (2, 5), (4, 3), (10, 0)]
assert solve([(0, 1, 10 ** 12), (1, 2, 10 ** 12 + 1)]) == [(0, 10 ** 12), (1, 10 ** 12 + 1), (2, 0)]


def height_at(buildings, x):
    return max((h for left, right, h in buildings if left <= x < right), default=0)


rng = random.Random(79)
for _ in range(400):
    buildings = []
    for _ in range(rng.randint(0, 7)):
        left = rng.randint(-6, 6)
        buildings.append((left, left + rng.randint(1, 5), rng.randint(0, 4)))
    got = solve(buildings)
    assert [x for x, _ in got] == sorted({x for x, _ in got}), (buildings, got)
    assert all(got[i][1] != got[i + 1][1] for i in range(len(got) - 1)), (buildings, got)
    assert not got or (got[0][1] != 0 and got[-1][1] == 0), (buildings, got)
    for doubled in range(-30, 30):
        x = doubled / 2
        expected = height_at(buildings, x)
        current = 0
        for px, ph in got:
            if px <= x:
                current = ph
        assert current == expected, (buildings, got, x)
