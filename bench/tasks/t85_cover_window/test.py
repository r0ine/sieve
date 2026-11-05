import random
from collections import Counter

from solution import solve


def brute(text, need):
    if not need:
        return ""
    want = Counter(need)
    for size in range(len(need), len(text) + 1):
        for start in range(len(text) - size + 1):
            window = Counter(text[start:start + size])
            if all(window[c] >= n for c, n in want.items()):
                return text[start:start + size]
    return ""


assert solve("ADOBECODEBANC", "ABC") == "BANC"
assert solve("aa", "aa") == "aa"
assert solve("abab", "ab") == "ab"
assert solve("", "") == ""
assert solve("abc", "") == ""
assert solve("", "a") == ""
assert solve("a", "a") == "a"
assert solve("a", "aa") == ""
assert solve("a", "b") == ""
assert solve("a", "A") == ""
assert solve("bba", "ab") == "ba"
assert solve("baab", "aab") == "baa"
assert solve("abcba", "ab") == "ab"
assert solve("cabwefgewcwaefgcf", "cae") == "cwae"
assert solve("aaflslflsldkalskaaa", "aaa") == "aaa"
assert solve("aXbXa", "aa") == "aXbXa"
assert solve("a b", " ") == " "
assert solve("ab ba", "a a") == "ab ba"
assert solve("ab ba", "a  a") == ""
assert solve("ab  ba", "a  a") == "ab  ba"
assert solve("xyzzyx", "zz") == "zz"
assert solve("xyz", "zyx") == "xyz"
assert solve("acbbaca", "aba") == "baca"
assert solve("bdab", "ab") == "ab"
assert solve("ba" * 10, "ab") == "ba"

text = "a" * 50000 + "b" + "a" * 49999
assert solve(text, "ab") == "ab"
assert solve(text, "bb") == ""
text = "".join("xyz"[i % 3] for i in range(100000)) + "q"
assert solve(text, "qx") == "xq"
assert solve(text, "qy") == "yzxq"

rng = random.Random(85)
for _ in range(500):
    text = "".join(rng.choice("abcA") for _ in range(rng.randint(0, 14)))
    need = "".join(rng.choice("abcA") for _ in range(rng.randint(0, 4)))
    assert solve(text, need) == brute(text, need), (text, need)
