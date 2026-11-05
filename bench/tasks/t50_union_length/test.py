from solution import solve


assert solve([]) == 0
assert solve([(0, 0)]) == 0
assert solve([(0, 3), (2, 5)]) == 5
assert solve([(0, 2), (2, 4)]) == 4
assert solve([(0, 2), (3, 5)]) == 4
assert solve([(-3, -1), (-2, 1)]) == 4
assert solve([(1, 3), (1, 3)]) == 2
assert solve([(0, 10**30)]) == 10**30
