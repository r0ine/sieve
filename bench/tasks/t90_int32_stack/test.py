import random

from solution import solve

MIN, MAX = -2147483648, 2147483647

assert solve([]) == []
assert solve(["push 7", "push -2", "div"]) == [-3]
assert solve(["push 2147483647", "push 1", "add"]) == [MIN]
assert solve(["push 1", "add"]) is None
assert solve(["push -7", "push 2", "div"]) == [-3]
assert solve(["push -7", "push 2", "mod"]) == [-1]
assert solve(["push 7", "push -2", "mod"]) == [1]
assert solve(["push -7", "push -2", "div"]) == [3]
assert solve(["push -7", "push -2", "mod"]) == [-1]
assert solve(["push 7", "push 2", "mod"]) == [1]
assert solve(["push 6", "push -3", "div"]) == [-2]
assert solve(["push -6", "push 3", "mod"]) == [0]
assert solve(["push 1", "push 3", "div"]) == [0]
assert solve(["push -1", "push 3", "div"]) == [0]
assert solve(["push -1", "push 3", "mod"]) == [-1]
assert solve(["push -2147483648", "push -1", "div"]) == [MIN]
assert solve(["push -2147483648", "push -1", "mod"]) == [0]
assert solve(["push -2147483648", "neg"]) == [MIN]
assert solve(["push -2147483648", "push -1", "mul"]) == [MIN]
assert solve(["push 2147483647", "neg"]) == [-MAX]
assert solve(["push 0", "neg"]) == [0]
assert solve(["push -2147483648", "push 1", "sub"]) == [MAX]
assert solve(["push 65536", "push 65536", "mul"]) == [0]
assert solve(["push 65536", "push 32768", "mul"]) == [MIN]
assert solve(["push 123456789", "push 987654321", "mul"]) == [-67153019]
assert solve(["push 2147483648"]) == [MIN]
assert solve(["push 4294967296"]) == [0]
assert solve(["push 4294967295"]) == [-1]
assert solve(["push -2147483649"]) == [MAX]
assert solve(["push 99999999999999999999999"]) == [(99999999999999999999999 + 2 ** 31) % 2 ** 32 - 2 ** 31]
assert solve(["push -0"]) == [0]
assert solve(["push 007"]) == [7]
assert solve(["push 1", "push 0", "div"]) is None
assert solve(["push 1", "push 0", "mod"]) is None
assert solve(["push 0", "push 0", "div"]) is None
assert solve(["push 1", "push 2", "swap"]) == [2, 1]
assert solve(["push 1", "swap"]) is None
assert solve(["pop"]) is None
assert solve(["dup"]) is None
assert solve(["neg"]) is None
assert solve(["push 5", "dup", "mul"]) == [25]
assert solve(["push 5", "pop"]) == []
assert solve(["push 3", "push 4", "sub"]) == [-1]
assert solve(["push 1", "push 2", "push 3"]) == [1, 2, 3]
assert solve(["push 1", "push 0", "div", "push 5"]) is None
assert solve(["push 1", "nop"]) is None
assert solve(["PUSH 1"]) is None
assert solve(["push"]) is None
assert solve(["push "]) is None
assert solve(["push  1"]) is None
assert solve(["push 1 "]) is None
assert solve([" push 1"]) is None
assert solve(["push +1"]) is None
assert solve(["push --1"]) is None
assert solve(["push 1.0"]) is None
assert solve(["push 0x10"]) is None
assert solve(["push 1_000"]) is None
assert solve(["push ١"]) is None
assert solve(["push 1", "add "]) is None
assert solve(["push 1", "dup 1"]) is None
assert solve(["push 1", "Dup"]) is None
assert solve(["push 1\n"]) is None


def wrap(n):
    n &= 0xFFFFFFFF
    return n - 0x100000000 if n & 0x80000000 else n


def c_div(a, b):
    q = abs(a) // abs(b)
    if (a < 0) != (b < 0):
        q = -q
    return q


rng = random.Random(90)
edge = [MIN, MIN + 1, -2, -1, 0, 1, 2, MAX - 1, MAX, 7, -7, 3, -3]
for _ in range(2000):
    a = rng.choice(edge + [rng.randint(MIN, MAX)])
    b = rng.choice(edge + [rng.randint(MIN, MAX), rng.randint(-50, 50)])
    for op in ("add", "sub", "mul", "div", "mod"):
        got = solve([f"push {a}", f"push {b}", op])
        if op in ("div", "mod") and b == 0:
            assert got is None
            continue
        if op == "add":
            want = a + b
        elif op == "sub":
            want = a - b
        elif op == "mul":
            want = a * b
        elif op == "div":
            want = c_div(a, b)
        else:
            want = a - b * c_div(a, b)
        assert got == [wrap(want)], (a, b, op, got)
