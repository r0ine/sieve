from solution import solve


assert solve(0, 2) == 0
assert solve(7, 3) == 2
assert solve(-7, 3) == -3
assert solve(7, -3) == -3
assert solve(-7, -3) == 2
assert solve(6, 3) == 2
assert solve(1, -2) == -1
assert solve(10**30, 7) == 10**30 // 7
