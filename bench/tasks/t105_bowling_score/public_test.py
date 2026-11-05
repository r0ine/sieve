from solution import solve

assert solve([10] * 12) == 300
assert solve([9, 1] * 10 + [9]) == 190
assert solve([0] * 19) is None
