from solution import solve


assert solve([], 0, 0) == []
assert solve([[1]], 0, 0) == []
assert solve([[1, 2], [3]], 0, 0) == [2, 3]
assert solve([[1, 2], [3]], 0, 1) == [1]
assert solve([[1, 2], [3]], 1, 0) == [1]
assert solve([[1, 2, 3]], 0, 1) == [3, 1]
assert solve([[1], [], [2]], 1, 0) == [1, 2]
assert solve([[5]], -1, 0) == [5]
