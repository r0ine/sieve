from solution import solve


assert solve(1, [('put', 1, 7), ('get', 1)]) == [7]
assert solve(0, [('put', 1, 7), ('get', 1)]) == [None]
