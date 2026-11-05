from solution import solve


assert solve('3:cat,') == ['cat']
assert solve('2:é,') == ['é']
assert solve('1:é,') is None
assert solve('') == []
assert solve('0:,') == ['']
assert solve('0:,0:,') == ['', '']
assert solve('1:a,1:b,') == ['a', 'b']
assert solve('5:hello,') == ['hello']
assert solve('1::,') == [':']
assert solve('1:,,') == [',']
assert solve('3:éa,') == ['éa']
assert solve('4:😀,') == ['😀']
assert solve('5:😀x,') == ['😀x']
assert solve('2:aa,0:,1:z,') == ['aa', '', 'z']
assert solve('00:,') is None
assert solve('01:a,') is None
assert solve('1:a') is None
assert solve('1:a;') is None
assert solve('1:,') is None
assert solve('0:') is None
assert solve('0:,,') is None
assert solve('3:ab,') is None
assert solve('3:abc,garbage') is None
assert solve('x:a,') is None
assert solve(':,') is None
assert solve('-1:a,') is None
assert solve('1a:a,') is None
assert solve('1:é,0:,') is None
assert solve('999999999999999999999:a,') is None
