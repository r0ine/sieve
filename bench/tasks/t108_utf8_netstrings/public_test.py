from solution import solve


assert solve('3:cat,') == ['cat']
assert solve('2:é,') == ['é']
assert solve('1:é,') is None
