from solution import solve


assert solve([]) == 0
assert solve([1]) == 1
assert solve([3, 1, 2, 4]) == 3
assert solve([2, 2, 2]) == 1
assert solve([5, 4, 3]) == 1
assert solve([-3, -2, -1]) == 3
assert solve([10**30, 0, 10**30]) == 2
assert solve([1, 3, 2, 4, 3, 5]) == 4
