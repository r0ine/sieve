from solution import solve


assert solve('a,"b,c"') == ['a', 'b,c']
assert solve('') == ['']
