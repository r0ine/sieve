from solution import solve

assert solve([["a", "b", 2], ["a", "c", 1], ["c", "b", 1]], "a", "b") == [2, ["a", "b"]]
assert solve([["a", "c", 1], ["c", "d", 1], ["a", "b", 1], ["b", "d", 1]], "a", "d") == [2, ["a", "b", "d"]]
assert solve([], "a", "a") == [0, ["a"]]
assert solve([], "a", "b") is None
assert solve([["a", "b", 0]], "a", "b") == [0, ["a", "b"]]
assert solve([["a", "b", 3]], "b", "a") is None
assert solve([["a", "b", 3], ["a", "b", 1]], "a", "b") == [1, ["a", "b"]]
assert solve([["a", "b", 1], ["a", "b", 1]], "a", "b") == [1, ["a", "b"]]
assert solve([["a", "b", 0], ["b", "a", 0]], "a", "a") == [0, ["a"]]
assert solve([["a", "b", 0], ["b", "a", 0], ["b", "c", 1]], "a", "c") == [1, ["a", "b", "c"]]
assert solve([["a", "b", 5], ["a", "c", 1], ["c", "b", 1]], "a", "b") == [2, ["a", "c", "b"]]
assert solve([["a", "b", 2], ["a", "c", 1], ["c", "b", 1]], "a", "b") == [2, ["a", "b"]]
assert solve([["a", "c", 1], ["c", "b", 1], ["a", "d", 1], ["d", "b", 1]], "a", "b") == [2, ["a", "c", "b"]]
assert solve([["a", "x", 0], ["x", "b", 0], ["a", "b", 0]], "a", "b") == [0, ["a", "b"]]
assert solve([["a", "b", 10], ["a", "c", 2], ["c", "b", 3]], "a", "b") == [5, ["a", "c", "b"]]
assert solve([["a", "c", 0], ["c", "d", 2], ["a", "b", 1], ["b", "d", 1]], "a", "d") == [2, ["a", "b", "d"]]
assert solve([["a", "c", 0], ["c", "d", 1], ["a", "b", 0], ["b", "d", 1]], "a", "d") == [1, ["a", "b", "d"]]
assert solve([["x", "y", 1]], "a", "b") is None
assert solve([["a", "b", 1], ["b", "c", 1]], "a", "c") == [2, ["a", "b", "c"]]
assert solve([["a", "b", 1], ["b", "c", 1]], "b", "c") == [1, ["b", "c"]]
assert solve([["a", "b", 1], ["b", "c", 1]], "c", "a") is None
assert solve([["a", "a", 0], ["a", "b", 1]], "a", "b") == [1, ["a", "b"]]
assert solve([["a", "b", 1000000000000]], "a", "b") == [1000000000000, ["a", "b"]]
assert solve([["a", "A", 1], ["a", "b", 1], ["A", "z", 1], ["b", "z", 1]], "a", "z") == [2, ["a", "A", "z"]]
assert solve([["a", "b", 0], ["b", "c", 0], ["a", "c", 0]], "a", "c") == [0, ["a", "c"]]
