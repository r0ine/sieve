from solution import solve


assert solve(0, []) == []
assert solve(0, [('put', 1, 7), ('get', 1)]) == [None]
assert solve(1, [('put', 1, 7), ('get', 1)]) == [7]
assert solve(1, [('put', 1, 7), ('put', 2, 8), ('get', 1), ('get', 2)]) == [None, 8]
assert solve(2, [('put', 1, 1), ('put', 2, 2), ('get', 1), ('put', 3, 3), ('get', 2)]) == [1, None]
assert solve(1, [('put', -1, 0), ('put', -1, -2), ('get', -1)]) == [-2]
assert solve(2, [('get', 4), ('get', 4)]) == [None, None]
assert solve(1, [('put', 1, 10**30), ('get', 1)]) == [10**30]
