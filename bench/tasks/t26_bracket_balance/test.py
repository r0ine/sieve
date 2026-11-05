from solution import solve


assert solve('') is True
assert solve('abc') is True
assert solve('x([{}])') is True
assert solve('([)]') is False
assert solve('(') is False
assert solve(')') is False
assert solve('((()))') is True
assert solve('é{雪[1]}') is True
