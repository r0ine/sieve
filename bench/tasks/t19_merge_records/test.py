from solution import solve


assert solve([]) == []
assert solve([('a', 1)]) == [('a', 1)]
assert solve([('a', 2), ('b', 1), ('a', -2)]) == [('a', 0), ('b', 1)]
assert solve([('', 3), ('', -1)]) == [('', 2)]
assert solve([('A', 1), ('a', 2)]) == [('A', 1), ('a', 2)]
assert solve([('x', 0), ('x', 0)]) == [('x', 0)]
assert solve([('n', 10**30), ('n', -1)]) == [('n', 10**30 - 1)]
assert solve([('é', -2), ('雪', 4), ('é', 1)]) == [('é', -1), ('雪', 4)]
