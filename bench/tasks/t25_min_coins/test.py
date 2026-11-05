from solution import solve


assert solve(0, []) == 0
assert solve(1, []) == -1
assert solve(6, [1, 3, 4]) == 2
assert solve(3, [2]) == -1
assert solve(7, [2, 3]) == 3
assert solve(4, [2, 2]) == 2
assert solve(10, [6, 4]) == 2
assert solve(11, [1, 5, 7]) == 3
