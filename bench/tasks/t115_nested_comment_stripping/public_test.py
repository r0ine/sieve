from solution import solve


assert solve('a/* x */b') == 'ab'
assert solve('x//y\nz') == 'x\nz'
assert solve('"/*x*/"') == '"/*x*/"'
