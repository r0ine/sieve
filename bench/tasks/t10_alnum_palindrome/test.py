from solution import solve


assert solve('') is True
assert solve('!?') is True
assert solve('A man, a plan, a canal: Panama') is True
assert solve('ab') is False
assert solve('1a1') is True
assert solve('a_ba') is True
assert solve('Aa') is True
assert solve('Straßeessarts') is True
