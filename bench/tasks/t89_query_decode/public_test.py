from solution import solve

assert solve("?a=1&b=x+y&a=2") == {"a": ["1", "2"], "b": ["x y"]}
assert solve("q=%2B1%20%3D") == {"q": ["+1 ="]}
assert solve("flag&&=v") == {"flag": [""], "": ["v"]}
