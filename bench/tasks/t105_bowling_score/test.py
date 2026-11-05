from solution import solve


assert solve([0] * 20) == 0
assert solve([1] * 20) == 20
assert solve([10] * 12) == 300
assert solve([5] * 21) == 150
assert solve([9, 1] * 10 + [9]) == 190
assert solve([10] * 9 + [0, 0]) == 240
assert solve([0] * 18 + [10, 10, 10]) == 30
assert solve([0] * 18 + [10, 5, 5]) == 20
assert solve([0] * 18 + [10, 10, 5]) == 25
assert solve([0] * 18 + [10, 0, 10]) == 20
assert solve([0] * 18 + [5, 5, 10]) == 20
assert solve([0] * 18 + [0, 10, 10]) == 20
assert solve([10] + [0] * 18) == 10
assert solve([10, 5, 3] + [0] * 16) == 26
assert solve([0, 10, 5, 0] + [0] * 16) == 20
assert solve([10, 10, 4, 2] + [0] * 14) == 46
assert solve([0] * 16 + [10, 10, 10, 10]) == 60
assert solve([0] * 16 + [10, 3, 7, 10]) == 40
assert solve([0, 10] * 9 + [0, 0]) == 90
assert solve([]) is None
assert solve([0] * 19) is None
assert solve([0] * 21) is None
assert solve([11] + [0] * 19) is None
assert solve([-1] + [0] * 19) is None
assert solve([6, 5] + [0] * 18) is None
assert solve([0] * 18 + [10, 10]) is None
assert solve([0] * 18 + [10, 5, 6]) is None
assert solve([0] * 18 + [10, 5, 10]) is None
assert solve([0] * 18 + [5, 5]) is None
assert solve([0] * 18 + [5, 4, 1]) is None
assert solve([0] * 18 + [5, 6]) is None
assert solve([0] * 18 + [10]) is None
assert solve([0] * 16 + [10]) is None
assert solve([10] * 11) is None
assert solve([10] * 13) is None
assert solve([3, 7] * 10) is None
assert solve([3, 7] * 10 + [3, 0]) is None
assert solve([10] * 12 + [0]) is None
