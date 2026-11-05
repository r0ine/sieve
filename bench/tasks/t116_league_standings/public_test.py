from solution import solve


assert solve(['A', 'B'], [('A', 'B', 2, 1)]) == [('A', 3, 1, 2), ('B', 0, -1, 1)]
assert solve(['B', 'A'], []) == [('A', 0, 0, 0), ('B', 0, 0, 0)]
assert solve([], []) == []
