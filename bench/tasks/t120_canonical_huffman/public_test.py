from solution import solve


assert solve({'a': 1, 'b': 1}) == {'a': '0', 'b': '1'}
assert solve({'a': 1, 'b': 1, 'c': 2}) == {'c': '0', 'a': '10', 'b': '11'}
assert solve({'x': 9}) == {'x': '0'}
