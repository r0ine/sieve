from solution import solve


assert solve('') == []
assert solve('123_') == []
assert solve('a_b2C') == ['a', 'b', 'C']
assert solve('éHi!') == ['Hi']
assert solve('AbC') == ['AbC']
assert solve('a--a') == ['a', 'a']
assert solve('ONE two') == ['ONE', 'two']
assert solve('x' * 100) == ['x' * 100]
