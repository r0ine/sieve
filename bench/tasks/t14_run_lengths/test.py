from solution import solve


assert solve('') == []
assert solve('a') == [('a', 1)]
assert solve('aaabb') == [('a', 3), ('b', 2)]
assert solve('aAa') == [('a', 1), ('A', 1), ('a', 1)]
assert solve('111') == [('1', 3)]
assert solve('éé雪') == [('é', 2), ('雪', 1)]
assert solve('abab') == [('a', 1), ('b', 1), ('a', 1), ('b', 1)]
assert solve(' ' * 100) == [(' ', 100)]
