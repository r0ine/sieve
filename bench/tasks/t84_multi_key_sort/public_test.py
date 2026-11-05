from solution import solve

assert solve([{"a": 2}, {"a": 1}, {"a": 2}], "a") == [1, 0, 2]
assert solve([{"a": 2}, {"a": 1}, {"a": 2}], "-a") == [0, 2, 1]
assert solve([{}, {"a": 1}, {"a": None}], "-a") == [1, 0, 2]
