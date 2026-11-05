from solution import solve


assert solve([], []) == []
assert solve([], [-1]) == [-1]
assert solve([1], []) == [1]
assert solve([1, 3], [2, 3]) == [1, 2, 3, 3]
assert solve([-3, 0], [-2, 1]) == [-3, -2, 0, 1]
assert solve([2, 2], [2]) == [2, 2, 2]
assert solve([10**30], [-10**30]) == [-10**30, 10**30]
assert solve([1, 2], [3, 4]) == [1, 2, 3, 4]
