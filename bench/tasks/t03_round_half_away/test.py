from solution import solve


assert solve(0, 3) == 0
assert solve(1, 3) == 0
assert solve(2, 3) == 1
assert solve(5, 2) == 3
assert solve(-5, 2) == -3
assert solve(-1, 2) == -1
assert solve(4, 2) == 2
assert solve(10**30 + 1, 2) == 500000000000000000000000000001
