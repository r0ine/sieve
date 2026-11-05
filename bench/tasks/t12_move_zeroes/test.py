from solution import solve


assert solve([]) == []
assert solve([0]) == [0]
assert solve([1]) == [1]
assert solve([0, 3, 0, -2]) == [3, -2, 0, 0]
assert solve([0, 0, 0]) == [0, 0, 0]
assert solve([-1, 0, -1]) == [-1, -1, 0]
assert solve([10**30, 0]) == [10**30, 0]
assert solve([0, 2, 2, 0]) == [2, 2, 0, 0]
