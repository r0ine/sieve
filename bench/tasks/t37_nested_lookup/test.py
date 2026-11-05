from solution import solve


assert solve({}, []) == {}
assert solve({}, ['x']) is None
assert solve({'a': {'b': 3}}, ['a', 'b']) == 3
assert solve({'a': 1}, ['a', 'b']) is None
assert solve({'': 0}, ['']) == 0
assert solve({'a': None}, ['a']) is None
assert solve({'é': {'雪': -2}}, ['é', '雪']) == -2
assert solve({'x': {'x': 10**30}}, ['x', 'x']) == 10**30
