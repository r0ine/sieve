from solution import solve

assert solve([[2, 3], [3, 5]]) == [8, 15]
assert solve([[1, 4], [3, 6]]) == [9, 12]
assert solve([[0, 2], [1, 2]]) is None
assert solve([]) == [0, 1]
assert solve([[0, 1]]) == [0, 1]
assert solve([[5, 1]]) == [0, 1]
assert solve([[-1, 5]]) == [4, 5]
assert solve([[12, 5]]) == [2, 5]
assert solve([[1, 2], [1, 4]]) == [1, 4]
assert solve([[2, 4], [6, 8]]) == [6, 8]
assert solve([[1, 2], [0, 4]]) is None
assert solve([[3, 5], [2, 3]]) == [8, 15]
assert solve([[0, 2], [0, 3]]) == [0, 6]
assert solve([[1, 2], [0, 3]]) == [3, 6]
assert solve([[0, 2], [1, 3]]) == [4, 6]
assert solve([[2, 6], [8, 12]]) == [8, 12]
assert solve([[2, 6], [9, 12]]) is None
assert solve([[0, 4], [2, 6]]) == [8, 12]
assert solve([[0, 4], [3, 6]]) is None
assert solve([[1, 7], [1, 7]]) == [1, 7]
assert solve([[1, 7], [8, 7]]) == [1, 7]
assert solve([[1, 7], [2, 7]]) is None
assert solve([[2, 3], [3, 5], [2, 7]]) == [23, 105]
assert solve([[-1, 4], [3, 6]]) == [3, 12]
assert solve([[1000000000000, 2]]) == [0, 2]
assert solve([[0, 2], [0, 3], [0, 5]]) == [0, 30]
