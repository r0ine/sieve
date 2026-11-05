import random
from itertools import combinations

from solution import solve


def brute(text):
    found = set()
    for size in range(1, len(text) + 1):
        for picks in combinations(range(len(text)), size):
            word = "".join(text[i] for i in picks)
            if word == word[::-1]:
                found.add(word)
    return len(found)


assert solve("") == 0
assert solve("a") == 1
assert solve("aa") == 2
assert solve("ab") == 2
assert solve("aaa") == 3
assert solve("aba") == 4
assert solve("abcd") == 4
assert solve("bccb") == 6
assert solve("aAa") == 4
assert solve("a a") == 4
assert solve("çöç") == 4
assert solve("aaaa") == 4
assert solve("abab") == 6
assert solve("abba") == 6
assert solve("aabaa") == 7
assert solve("abcba") == 10
assert solve("aabaa") == brute("aabaa")
assert solve("abcba") == brute("abcba")
assert solve("a" * 1000) == 1000
assert solve("ab" * 3) == brute("ab" * 3)
assert solve("abcabc") == brute("abcabc")
assert solve("racecar") == brute("racecar")
assert solve("xAxaXa") == brute("xAxaXa")
assert solve("aabbaabb") == brute("aabbaabb")
assert solve("abcdabcdabcdabcdabcdabcdabcdabcddcbadcbadcbadcbadcbadcbadcbadcba") == 104860361

rng = random.Random(91)
for alphabet in ("ab", "abc", "aB!", "xyzw"):
    for _ in range(4):
        sample = "".join(rng.choice(alphabet) for _ in range(rng.randint(5, 12)))
        assert solve(sample) == brute(sample), sample

assert 0 <= solve("".join(rng.choice("abcdefgh") for _ in range(1000))) < 1_000_000_007
