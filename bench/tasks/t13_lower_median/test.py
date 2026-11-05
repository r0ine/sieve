from solution import solve


assert solve([]) is None
assert solve([2]) == 2
assert solve([8, 1, 4, 2]) == 2
assert solve([3, 1, 2]) == 2
assert solve([-5, -1, -3, -2]) == -3
assert solve([1, 1, 1, 2]) == 1
assert solve([10**30, -10**30]) == -10**30
assert solve([9, 8, 7, 6, 5]) == 7
