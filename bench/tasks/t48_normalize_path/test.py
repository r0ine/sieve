from solution import solve


assert solve('.') == '.'
assert solve('a/..') == '.'
assert solve('/a//b/../') == '/a'
assert solve('a/../../b') == '../b'
assert solve('/../../a') == '/a'
assert solve('///') == '/'
assert solve('../..') == '../..'
assert solve('a/a/./b') == 'a/a/b'
