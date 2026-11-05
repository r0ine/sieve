from solution import solve


assert solve('', '') == 0
assert solve('', 'abc') == 3
assert solve('abc', '') == 3
assert solve('kitten', 'sitting') == 3
assert solve('a', 'a') == 0
assert solve('a', 'A') == 1
assert solve('é', 'e') == 1
assert solve('aaaa', 'aa') == 2
