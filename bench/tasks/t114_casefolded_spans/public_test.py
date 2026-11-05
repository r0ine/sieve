from solution import solve


assert solve('Straße', 'SS') == [(4, 5)]
assert solve('ß', 's') == []
assert solve('aaaa', 'aa') == [(0, 2), (1, 3), (2, 4)]
