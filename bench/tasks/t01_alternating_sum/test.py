from solution import solve


assert solve([]) == 0
assert solve([5]) == 5
assert solve([5, 2]) == 3
assert solve([4, 1, 3]) == 6
assert solve([-4, 1]) == -5
assert solve([0, 0, 0]) == 0
assert solve([7, 7, 7, 7]) == 0
assert solve([10**30, -10**30]) == 2 * 10**30
