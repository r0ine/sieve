from solution import solve

assert solve(5, 5, [], "F7") == (0, 2, "N", 5)
assert solve(5, 5, [(0, 2)], "F4RF1") == (1, 1, "E", 3)
assert solve(3, 3, [], "UF1") == (0, 2, "S", 2)
