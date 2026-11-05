from solution import solve


assert solve([]) == []
assert solve([1]) == [1]
assert solve([3, 1, 3, 2, 2]) == [2, 3, 1]
assert solve([-1, 2, -1, 2]) == [-1, 2]
assert solve([5, 4, 3]) == [3, 4, 5]
assert solve([0, 0, -1]) == [0, -1]
assert solve([10**30, -10**30]) == [-10**30, 10**30]
assert solve([2, 2, 1, 1, 1]) == [1, 2]
