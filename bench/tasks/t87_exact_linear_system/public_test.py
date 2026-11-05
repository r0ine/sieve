from solution import solve

assert solve([[2, 1], [1, 3]], [3, 5]) == [(4, 5), (7, 5)]
assert solve([[1, 1], [2, 2]], [1, 3]) == "none"
assert solve([[1, 1], [2, 2]], [1, 2]) == "many"
