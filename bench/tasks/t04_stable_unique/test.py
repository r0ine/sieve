from solution import solve


assert solve([]) == []
assert solve([1]) == [1]
assert solve([3, 1, 3, 2]) == [3, 1, 2]
assert solve([-1, -1, 0]) == [-1, 0]
assert solve([0, 0, 0]) == [0]
assert solve([2, 1, 2, 1]) == [2, 1]
assert solve([10**30, -10**30, 10**30]) == [10**30, -10**30]
assert solve([-2, -1, -2, 0]) == [-2, -1, 0]
