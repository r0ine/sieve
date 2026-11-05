from solution import solve


assert solve([]) == (0, -1, -1)
assert solve([5]) == (5, 0, 0)
assert solve([-2, 3, -1, 3]) == (5, 1, 3)
assert solve([-5, -2, -3]) == (-2, 1, 1)
assert solve([0, 0]) == (0, 0, 0)
assert solve([1, -1, 1]) == (1, 0, 0)
assert solve([2, 2, -4, 2, 2]) == (4, 0, 1)
assert solve([10**30, -1, 10**30]) == (2 * 10**30 - 1, 0, 2)
