from solution import solve


assert solve('aab') == (2, ['aa', 'b'])
assert solve('abba') == (1, ['abba'])
assert solve('') == (0, [])
