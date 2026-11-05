from solution import solve

assert solve("a=1\n[S]\nb = \"x y\"") == {"": {"a": "1"}, "s": {"b": "x y"}}
assert solve("[x]\n[X]\nk=1\nk=2") == {"x": {"k": "2"}}
assert solve("[]") is None
