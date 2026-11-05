import random
from fractions import Fraction
from math import gcd

from solution import solve


assert solve([[2, 1], [1, 3]], [3, 5]) == [(4, 5), (7, 5)]
assert solve([[1, 1], [2, 2]], [1, 3]) == "none"
assert solve([[1, 1], [2, 2]], [1, 2]) == "many"
assert solve([[5]], [10]) == [(2, 1)]
assert solve([[3]], [-2]) == [(-2, 3)]
assert solve([[-3]], [2]) == [(-2, 3)]
assert solve([[4]], [0]) == [(0, 1)]
assert solve([[0]], [0]) == "many"
assert solve([[0]], [1]) == "none"
assert solve([[0, 0]], [0]) == "many"
assert solve([[0, 0], [0, 0]], [0, 1]) == "none"
assert solve([[1, 2, 3]], [6]) == "many"
assert solve([[1, 0], [0, 1], [1, 1]], [2, 3, 5]) == [(2, 1), (3, 1)]
assert solve([[1, 0], [0, 1], [1, 1]], [2, 3, 6]) == "none"
assert solve([[1, 0], [0, 1], [0, 0]], [2, 3, 0]) == [(2, 1), (3, 1)]
assert solve([[1, 0], [0, 1], [0, 0]], [2, 3, 1]) == "none"
assert solve([[1, 1], [1, 1], [1, 1]], [2, 2, 2]) == "many"
assert solve([[1, 1], [1, 1], [1, -1]], [2, 2, 0]) == [(1, 1), (1, 1)]
assert solve([[0, 1], [1, 0]], [7, 9]) == [(9, 1), (7, 1)]
assert solve([[0, 0, 1], [0, 1, 0], [1, 0, 0]], [1, 2, 3]) == [(3, 1), (2, 1), (1, 1)]
assert solve([[1, 2], [2, 4], [1, 3]], [3, 6, 4]) == [(1, 1), (1, 1)]
assert solve([[1, 2], [2, 4], [1, 3]], [3, 7, 4]) == "none"
assert solve([[1, 2, 3], [2, 4, 6]], [1, 3]) == "none"
assert solve([[1, 2, 3], [2, 4, 6], [1, 1, 1]], [1, 2, 0]) == "many"
assert solve([[10 ** 20, 1], [1, 10 ** 20]], [1, 1]) == [(1, 10 ** 20 + 1), (1, 10 ** 20 + 1)]
assert solve([[10 ** 16, 10 ** 16 + 1], [10 ** 16 - 1, 10 ** 16]], [1, 1]) == [(-1, 1), (1, 1)]
assert solve([[1, 1, 1], [0, 2, 5], [2, 5, -1]], [6, -4, 27]) == [(5, 1), (3, 1), (-2, 1)]
assert solve([[2, 4], [3, 6]], [2, 3]) == "many"
assert solve([[6, 4], [3, 2]], [2, 2]) == "none"


def check_unique(a, b, got):
    assert isinstance(got, list) and len(got) == len(a[0]), got
    xs = []
    for num, den in got:
        assert den > 0 and Fraction(num, den).denominator == den, got
        xs.append(Fraction(num, den))
    for row, rhs in zip(a, b):
        assert sum(c * x for c, x in zip(row, xs)) == rhs, (a, b, got)


rng = random.Random(87)
for _ in range(200):
    n = rng.randint(1, 4)
    a = [[rng.randint(-5, 5) for _ in range(n)] for _ in range(n)]
    b = [rng.randint(-9, 9) for _ in range(n)]
    det_rows = [[Fraction(v) for v in row] for row in a]
    det = Fraction(1)
    for c in range(n):
        p = next((i for i in range(c, n) if det_rows[i][c] != 0), None)
        if p is None:
            det = Fraction(0)
            break
        if p != c:
            det_rows[c], det_rows[p] = det_rows[p], det_rows[c]
            det = -det
        det *= det_rows[c][c]
        for i in range(c + 1, n):
            f = det_rows[i][c] / det_rows[c][c]
            det_rows[i] = [x - f * y for x, y in zip(det_rows[i], det_rows[c])]
    got = solve(a, b)
    if det != 0:
        check_unique(a, b, got)
    else:
        assert got in ("none", "many"), (a, b, got)

def rank(matrix):
    rows = [[Fraction(v) for v in row] for row in matrix]
    r = 0
    for c in range(len(rows[0])):
        p = next((i for i in range(r, len(rows)) if rows[i][c] != 0), None)
        if p is None:
            continue
        rows[r], rows[p] = rows[p], rows[r]
        for i in range(len(rows)):
            if i != r and rows[i][c] != 0:
                f = rows[i][c] / rows[r][c]
                rows[i] = [x - f * y for x, y in zip(rows[i], rows[r])]
        r += 1
    return r


def classify(a, b):
    full = rank(a)
    if rank([row + [v] for row, v in zip(a, b)]) > full:
        return "none"
    return "many" if full < len(a[0]) else "one"


for _ in range(300):
    n = rng.randint(1, 3)
    m = rng.randint(1, 5)
    xs = [Fraction(rng.randint(-6, 6), rng.randint(1, 4)) for _ in range(n)]
    base = [[rng.choice([0, rng.randint(-4, 4)]) for _ in range(n)] for _ in range(m)]
    rhs = [sum(c * x for c, x in zip(row, xs)) for row in base]
    lcm = 1
    for v in rhs:
        lcm = lcm * v.denominator // gcd(lcm, v.denominator)
    a = [[c * lcm for c in row] for row in base]
    for b in ([int(v * lcm) for v in rhs], [int(v * lcm) + rng.randint(-1, 1) for v in rhs]):
        got = solve(a, b)
        kind = classify(a, b)
        if kind == "one":
            check_unique(a, b, got)
        else:
            assert got == kind, (a, b, got)
