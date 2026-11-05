from solution import solve


assert solve([], 0, 1) == []
assert solve([-3, 2, 9], 0, 5) == [0, 2, 5]
assert solve([4, 4], 4, 4) == [4, 4]
assert solve([-10, -2, 0], -5, -1) == [-5, -2, -1]
assert solve([0, 1, 2], 0, 2) == [0, 1, 2]
assert solve([10**30], -1, 1) == [1]
assert solve([-10**30], -1, 1) == [-1]
assert solve([2, 2, -2], -2, 2) == [2, 2, -2]
