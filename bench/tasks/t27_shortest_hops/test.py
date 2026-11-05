from solution import solve


assert solve({}, 1, 1) == 0
assert solve({}, 1, 2) == -1
assert solve({1: [2], 2: [3]}, 1, 3) == 2
assert solve({1: [2, 3], 2: [3]}, 1, 3) == 1
assert solve({1: [2, 2], 2: [1]}, 1, 3) == -1
assert solve({-1: [0], 0: [-2]}, -1, -2) == 2
assert solve({10**30: [-1]}, 10**30, -1) == 1
assert solve({1: [2]}, 2, 1) == -1
