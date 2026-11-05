from solution import solve


assert solve([]) == 0
assert solve([(0, 1)]) == 0
assert solve([(0, 2), (1, 3), (2, 4)]) == 2
assert solve([(0, 1), (1, 2)]) == 0
assert solve([(1, 1), (0, 2)]) == 0
assert solve([(0, 2), (0, 2)]) == 1
assert solve([(-3, -1), (-2, 0)]) == 1
assert solve([(0, 10**30), (10**30 - 1, 10**30)]) == 1
