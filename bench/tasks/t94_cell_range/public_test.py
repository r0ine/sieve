from solution import solve

assert solve("A1:B2") == ["A1", "B1", "A2", "B2"]
assert solve("Z1:AB1") == ["Z1", "AA1", "AB1"]
assert solve("$b$03") == ["B3"]
