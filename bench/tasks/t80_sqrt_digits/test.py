import random

from solution import solve


assert solve(0, 0) == "0"
assert solve(0, 3) == "0.000"
assert solve(1, 0) == "1"
assert solve(1, 1) == "1.0"
assert solve(2, 0) == "1"
assert solve(2, 5) == "1.41421"
assert solve(2, 20) == "1.41421356237309504880"
assert solve(3, 10) == "1.7320508075"
assert solve(16, 2) == "4.00"
assert solve(99, 0) == "9"
assert solve(99, 3) == "9.949"
assert solve(10 ** 30, 2) == "1000000000000000.00"
assert solve(10 ** 30 - 1, 3) == "999999999999999.999"
assert solve(10 ** 30 - 1, 0) == "999999999999999"
assert solve(10 ** 32 - 1, 0) == "9999999999999999"
assert solve((10 ** 20 + 1) ** 2, 1) == "100000000000000000001.0"
assert solve((10 ** 20 + 1) ** 2 - 1, 1) == "100000000000000000000.9"
assert solve(2 ** 106, 0) == str(2 ** 53)
assert solve(2 ** 106 - 1, 0) == str(2 ** 53 - 1)
assert solve((2 ** 53 + 1) ** 2, 0) == str(2 ** 53 + 1)
assert solve((2 ** 53 + 1) ** 2 - 1, 0) == str(2 ** 53)
assert solve(50, 1) == "7.0"
assert solve(48, 4) == "6.9282"
assert solve(10, 50) == "3.16227766016837933199889354443271853371955513932521"
assert solve(5, 0) == "2"
assert solve(4, 3) == "2.000"
assert solve(3, 1) == "1.7"


def check(n, places, text):
    if places:
        head, tail = text.split(".")
        assert len(tail) == places
        assert head == "0" or not head.startswith("0")
        digits = int(head + tail)
    else:
        assert "." not in text
        assert text == "0" or not text.startswith("0")
        digits = int(text)
    target = n * 100 ** places
    assert digits * digits <= target < (digits + 1) * (digits + 1), (n, places, text)


rng = random.Random(80)
for _ in range(300):
    n = rng.choice([rng.randint(0, 1000), rng.randint(0, 10 ** 40), rng.randint(0, 10 ** 300)])
    places = rng.randint(0, 200)
    check(n, places, solve(n, places))
