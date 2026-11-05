from solution import solve


assert solve(0, 1, 1, 1, 3) == 4
assert solve(-1, 2, 1, 2, 2) == 2
assert solve(1, 1, 1, 1, 10) == 0
assert solve(0, 1, 1, 1, 1) == 1
assert solve(0, 1, 1, 1, 2) == 2
assert solve(0, 1, 1, 1, 4) == 6
assert solve(0, 1, 1, 1, 5) == 10
assert solve(1, 2, 1, 1, 4) == 3
assert solve(1, 3, 2, 3, 3) == 2
assert solve(-1, 1, 0, 1, 3) == 4
assert solve(-2, 1, -1, 1, 3) == 4
assert solve(-1, 1, 1, 1, 1) == 2
assert solve(-1, 1, 1, 1, 2) == 4
assert solve(-1, 2, 0, 1, 4) == 3
assert solve(0, 1, 1, 2, 4) == 3
assert solve(1, 2, 1, 2, 10) == 0
assert solve(0, 1, 0, 1, 0) == 0
assert solve(0, 1, 1, 1, 0) == 0
assert solve(2, 1, 3, 1, 3) == 4
assert solve(10, 1, 11, 1, 3) == 4
assert solve(-10, 1, -9, 1, 3) == 4
assert solve(1, 4, 3, 4, 4) == 4
assert solve(-3, 4, -1, 4, 4) == 4
assert solve(2, 3, 4, 3, 4) == 4
assert solve(-1, 3, 1, 3, 5) == 6
assert solve(0, 1, 2, 1, 2) == 4
assert solve(0, 1, 2, 1, 3) == 8
assert solve(3, 2, 5, 2, 4) == 6
assert solve(1000000, 1, 1000001, 1, 3) == 4
