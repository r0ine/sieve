from solution import solve

assert solve("a*b", "acb") is True
assert solve("a\\*b", "a*b") is True
assert solve("a?b", "ab") is False
