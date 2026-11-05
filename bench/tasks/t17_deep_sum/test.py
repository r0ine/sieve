from solution import solve


assert solve([]) == 0
assert solve([[], []]) == 0
assert solve([1, [2, [-3]]]) == 0
assert solve([-1, [-2]]) == -3
assert solve([0, [0]]) == 0
assert solve([[1], [1], 1]) == 3
assert solve([10**30, [-10**30]]) == 0
assert solve([[[[[5]]]]]) == 5
