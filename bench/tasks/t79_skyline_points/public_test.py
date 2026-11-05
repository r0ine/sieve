from solution import solve

assert solve([(0, 2, 3)]) == [(0, 3), (2, 0)]
assert solve([(0, 2, 3), (2, 4, 3)]) == [(0, 3), (4, 0)]
assert solve([(0, 5, 2), (1, 3, 4)]) == [(0, 2), (1, 4), (3, 2), (5, 0)]
