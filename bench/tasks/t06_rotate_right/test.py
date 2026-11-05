from solution import solve


assert solve([], 9) == []
assert solve([1], -7) == [1]
assert solve([1, 2, 3], 0) == [1, 2, 3]
assert solve([1, 2, 3], 1) == [3, 1, 2]
assert solve([1, 2, 3], -1) == [2, 3, 1]
assert solve([1, 2, 3], 4) == [3, 1, 2]
assert solve([1, 1, 2], 2) == [1, 2, 1]
assert solve([-2, 0, 10**20], -4) == [0, 10**20, -2]
