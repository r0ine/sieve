from solution import solve


assert solve([]) == (0, 0)
assert solve([[5]]) == (5, 5)
assert solve([[1, 2], [3, 4]]) == (5, 5)
assert solve([[1, 0], [0, 2]]) == (3, 0)
assert solve([[0, 2], [3, 0]]) == (0, 5)
assert solve([[-1, 2], [3, -4]]) == (-5, 5)
assert solve([[1, 2, 3], [4, 5, 6], [7, 8, 9]]) == (15, 15)
assert solve([[10**30, 0], [0, -10**30]]) == (0, 0)
