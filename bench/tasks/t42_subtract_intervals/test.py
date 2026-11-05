from solution import solve


assert solve((1, 5), []) == [(1, 5)]
assert solve((1, 5), [(2, 3)]) == [(1, 1), (4, 5)]
assert solve((1, 3), [(0, 4)]) == []
assert solve((1, 5), [(2, 4), (3, 3)]) == [(1, 1), (5, 5)]
assert solve((1, 5), [(6, 8)]) == [(1, 5)]
assert solve((-3, 2), [(-1, 0)]) == [(-3, -2), (1, 2)]
assert solve((0, 0), [(0, 0)]) == []
assert solve((0, 10**30), [(1, 10**30 - 1)]) == [(0, 0), (10**30, 10**30)]
