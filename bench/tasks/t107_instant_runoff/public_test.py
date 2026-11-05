from solution import solve


assert solve(['A', 'B', 'C'], [['A'], ['B', 'C'], ['C', 'B']]) == 'B'
assert solve(['A', 'B'], [[], []]) == 'A'
assert solve([], []) is None
