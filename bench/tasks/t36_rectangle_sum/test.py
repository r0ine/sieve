from solution import solve


assert solve([], []) == []
assert solve([[]], []) == []
assert solve([[5]], [(0, 0, 0, 0)]) == [5]
assert solve([[1, 2], [3, 4]], [(0, 0, 1, 1)]) == [10]
assert solve([[1, 2], [3, 4]], [(0, 1, 1, 1)]) == [6]
assert solve([[1, 2], [3, 4]], [(1, 0, 1, 0)]) == [3]
assert solve([[-1, 2], [3, -4]], [(0, 0, 1, 1)]) == [0]
assert solve([[10**30, 10**30]], [(0, 0, 0, 1), (0, 1, 0, 1)]) == [2 * 10**30, 10**30]
