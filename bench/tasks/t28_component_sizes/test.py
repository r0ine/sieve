from solution import solve


assert solve(0, []) == []
assert solve(1, []) == [1]
assert solve(4, [(0, 1), (1, 2)]) == [1, 3]
assert solve(3, []) == [1, 1, 1]
assert solve(3, [(0, 1), (1, 0)]) == [1, 2]
assert solve(2, [(0, 0)]) == [1, 1]
assert solve(5, [(0, 1), (2, 3)]) == [1, 2, 2]
assert solve(4, [(0, 1), (1, 2), (2, 3)]) == [4]
