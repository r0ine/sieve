from solution import solve

assert solve([["a", "b", 2], ["a", "c", 1], ["c", "b", 1]], "a", "b") == [2, ["a", "b"]]
assert solve([["a", "c", 1], ["c", "d", 1], ["a", "b", 1], ["b", "d", 1]], "a", "d") == [2, ["a", "b", "d"]]
