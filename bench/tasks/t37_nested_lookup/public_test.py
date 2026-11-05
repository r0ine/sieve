from solution import solve


assert solve({'a': {'b': 3}}, ['a', 'b']) == 3
assert solve({}, ['x']) is None
