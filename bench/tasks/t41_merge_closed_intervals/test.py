from solution import solve


assert solve([]) == []
assert solve([(1, 1)]) == [(1, 1)]
assert solve([(1, 2), (3, 4)]) == [(1, 4)]
assert solve([(1, 2), (4, 5)]) == [(1, 2), (4, 5)]
assert solve([(5, 8), (1, 6)]) == [(1, 8)]
assert solve([(-3, -2), (-1, 0)]) == [(-3, 0)]
assert solve([(1, 3), (1, 3)]) == [(1, 3)]
assert solve([(10**30, 10**30), (10**30 - 1, 10**30 - 1)]) == [(10**30 - 1, 10**30)]
