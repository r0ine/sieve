from solution import solve


assert solve({'a': ['X'], 'b': ['X']}, {'X': ['b', 'a']}, {'X': 1}) == [('b', 'X')]
assert solve({'a': ['X']}, {'X': []}, {'X': 1}) == []
assert solve({}, {}, {}) == []
