from solution import solve


assert solve('/a//b/../') == '/a'
assert solve('a/../../b') == '../b'
