import random
from itertools import combinations

from solution import solve


def brute(values, k):
    n = len(values)
    best = None
    for cuts in combinations(range(1, n), k - 1):
        bounds = (0,) + cuts + (n,)
        lengths = [bounds[i + 1] - bounds[i] for i in range(k)]
        cost = max(sum(values[bounds[i]:bounds[i + 1]]) for i in range(k))
        key = (cost, [-x for x in lengths])
        if best is None or key < best[0]:
            best = (key, lengths)
    return best[1]


assert solve([5], 1) == [1]
assert solve([0], 1) == [1]
assert solve([7, 2, 5, 10, 8], 2) == [3, 2]
assert solve([7, 2, 5, 10, 8], 1) == [5]
assert solve([7, 2, 5, 10, 8], 5) == [1, 1, 1, 1, 1]
assert solve([1, 1, 1, 1], 2) == [2, 2]
assert solve([5, 0, 0, 5], 2) == [3, 1]
assert solve([0, 0, 0], 2) == [2, 1]
assert solve([0, 0, 0, 0], 3) == [2, 1, 1]
assert solve([1, 2, 3, 4, 5], 2) == [3, 2]
assert solve([1, 2, 3, 4, 5], 3) == [3, 1, 1]
assert solve([1, 4, 4], 3) == [1, 1, 1]
assert solve([10, 0, 0, 0, 10], 2) == [4, 1]
assert solve([10, 0, 0, 0, 10], 3) == [3, 1, 1]
assert solve([2, 3, 1, 2, 4, 3], 3) == [3, 2, 1]
assert solve([1, 1, 1, 1, 1, 1, 1], 3) == [3, 3, 1]
assert solve([9, 1, 1, 1, 1, 1, 1], 2) == [1, 6]
assert solve([1, 1, 1, 1, 1, 1, 9], 2) == [6, 1]

rng = random.Random(83)
for _ in range(500):
    n = rng.randint(1, 9)
    values = [rng.choice([0, 0, rng.randint(0, 9)]) for _ in range(n)]
    k = rng.randint(1, n)
    assert solve(values, k) == brute(values, k), (values, k)
