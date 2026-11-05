from solution import solve

assert solve("x+1", "x-1") == "x^2 - 1"
assert solve("-x - 1", "x + 1") == "-x^2 - 2x - 1"
assert solve("x - x", "5") == "0"
