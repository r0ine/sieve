import random

from solution import solve


def brute(lo, hi, digit):
    d = str(digit)
    return sum(str(n).count(d) for n in range(lo, hi + 1))


assert solve(0, 0, 0) == 1
assert solve(0, 0, 1) == 0
assert solve(1, 1, 0) == 0
assert solve(1, 13, 1) == 6
assert solve(0, 10, 0) == 2
assert solve(100, 100, 0) == 2
assert solve(100, 100, 1) == 1
assert solve(11, 11, 1) == 2
assert solve(0, 99, 0) == 10
assert solve(1, 99, 0) == 9
assert solve(0, 999, 0) == 190
assert solve(0, 9999, 7) == 4000
assert solve(10 ** 18, 10 ** 18, 0) == 18
assert solve(10 ** 18, 10 ** 18, 1) == 1
assert solve(0, 10 ** 18 - 1, 5) == 18 * 10 ** 17
assert solve(0, 10 ** 18, 1) == 18 * 10 ** 17 + 1
zeros = 1 + 18 + sum((length - 1) * 9 * 10 ** (length - 2) for length in range(2, 19))
assert solve(0, 10 ** 18, 0) == zeros
assert solve(1, 10 ** 18, 0) == zeros - 1
assert solve(10 ** 17, 2 * 10 ** 17 - 1, 1) == 10 ** 17 + 17 * 10 ** 16
assert solve(999_999_999_999_999_999, 10 ** 18, 9) == 18
assert solve(999_999_999_999_999_999, 10 ** 18, 0) == 18

for lo, hi in [(0, 5000), (1, 1000), (99, 101), (1000, 1000), (7, 7), (0, 1), (9, 10), (90, 110)]:
    for digit in range(10):
        assert solve(lo, hi, digit) == brute(lo, hi, digit), (lo, hi, digit)

rng = random.Random(82)
for _ in range(300):
    lo = rng.randint(0, 30000)
    hi = lo + rng.randint(0, 3000)
    digit = rng.randint(0, 9)
    assert solve(lo, hi, digit) == brute(lo, hi, digit), (lo, hi, digit)

for _ in range(30):
    lo = rng.randint(0, 10 ** 18 - 500)
    hi = lo + rng.randint(0, 400)
    digit = rng.randint(0, 9)
    assert solve(lo, hi, digit) == brute(lo, hi, digit), (lo, hi, digit)
