from solution import solve


assert solve(0, []) == []
assert solve(1, []) == [0]
assert solve(3, [(0, 2), (1, 2)]) == [0, 1, 2]
assert solve(2, [(0, 1), (1, 0)]) is None
assert solve(1, [(0, 0)]) is None
assert solve(2, [(0, 1), (0, 1)]) == [0, 1]
assert solve(4, [(2, 3)]) == [0, 1, 2, 3]
assert solve(4, [(1, 0), (2, 0)]) == [1, 2, 0, 3]
