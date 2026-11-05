from solution import solve


assert solve(3, [(0, 1), (1, 2)]) == [0, 1, 2]
assert solve(3, [(0, 1), (1, 2), (2, 0)]) == [0, 1, 2, 0]
assert solve(4, [(0, 1), (2, 3)]) is None
