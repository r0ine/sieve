from solution import solve


assert solve('') == ['']
assert solve(',') == ['', '']
assert solve('a,"b,c"') == ['a', 'b,c']
assert solve('"a""b"') == ['a"b']
assert solve('a,b,a') == ['a', 'b', 'a']
assert solve(' -1 ,2') == [' -1 ', '2']
assert solve('""') == ['']
assert solve('é,"雪,山"') == ['é', '雪,山']
