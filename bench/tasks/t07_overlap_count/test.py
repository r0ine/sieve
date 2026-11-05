from solution import solve


assert solve('', '') == 1
assert solve('', 'a') == 0
assert solve('abc', '') == 4
assert solve('aaaa', 'aa') == 3
assert solve('abababa', 'aba') == 3
assert solve('ABCabc', 'abc') == 1
assert solve('ééé', 'éé') == 2
assert solve('a' * 100, 'a' * 50) == 51
