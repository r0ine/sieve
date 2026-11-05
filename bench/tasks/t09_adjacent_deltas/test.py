from solution import solve


assert solve([]) == []
assert solve([3]) == []
assert solve([3, 7, 2]) == [4, -5]
assert solve([-2, -2]) == [0]
assert solve([0, -1, -3]) == [-1, -2]
assert solve([10**30, -10**30]) == [-2 * 10**30]
assert solve([1, 1, 1, 1]) == [0, 0, 0]
assert solve([-5, 5, -5]) == [10, -10]
