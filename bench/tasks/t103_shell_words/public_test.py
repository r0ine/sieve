from solution import solve

assert solve("a 'b c' d") == ["a", "b c", "d"]
assert solve('x="1 2"\'3\'') == ["x=1 23"]
assert solve("'abc") is None
