from solution import solve


assert solve([]) == []
assert solve([('A', 1)]) == [('A', 1)]
assert solve([('Bob', 20), ('amy', 20)]) == [('amy', 20), ('Bob', 20)]
assert solve([('A', -1), ('B', 0)]) == [('A', -1), ('B', 0)]
assert solve([('a', 1), ('A', 1)]) == [('a', 1), ('A', 1)]
assert solve([('z', 2), ('a', 1)]) == [('a', 1), ('z', 2)]
assert solve([('é', 1), ('É', 1)]) == [('é', 1), ('É', 1)]
assert solve([('x', 10**30), ('y', -10**30)]) == [('y', -10**30), ('x', 10**30)]
