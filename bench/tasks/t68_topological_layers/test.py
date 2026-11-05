from solution import solve

assert solve(["a", "b", "c"], [["a", "c"], ["b", "c"]]) == [["a", "b"], ["c"]]
assert solve(["a", "b"], [["a", "b"], ["b", "a"]]) == None
assert solve([], []) == []
assert solve(["a"], []) == [["a"]]
assert solve(["a"], [["a", "a"]]) == None
assert solve(["a", "b"], []) == [["a", "b"]]
assert solve(["b", "a"], []) == [["a", "b"]]
assert solve(["a", "b"], [["a", "b"]]) == [["a"], ["b"]]
assert solve(["a", "b"], [["b", "a"]]) == [["b"], ["a"]]
assert solve(["a", "b"], [["a", "b"], ["a", "b"]]) == [["a"], ["b"]]
assert solve(["a", "b", "c"], [["a", "b"], ["b", "c"]]) == [["a"], ["b"], ["c"]]
assert solve(["a", "b", "c"], [["a", "c"]]) == [["a", "b"], ["c"]]
assert solve(["a", "b", "c"], [["a", "b"], ["a", "c"]]) == [["a"], ["b", "c"]]
assert solve(["a", "b", "c"], [["a", "b"], ["b", "a"]]) == None
assert solve(["a", "b", "c"], [["a", "b"], ["b", "c"], ["c", "a"]]) == None
assert solve(["a", "b", "c"], [["a", "b"], ["b", "c"], ["a", "c"]]) == [["a"], ["b"], ["c"]]
assert solve(["a", "b", "c", "d"], [["a", "c"], ["b", "d"]]) == [["a", "b"], ["c", "d"]]
assert solve(["a", "b", "c", "d"], [["a", "b"], ["c", "d"]]) == [["a", "c"], ["b", "d"]]
assert solve(["a", "b", "c", "d"], [["a", "d"], ["b", "d"], ["c", "d"]]) == [["a", "b", "c"], ["d"]]
assert solve(["a", "b", "c", "d"], [["a", "b"], ["b", "c"], ["c", "d"]]) == [["a"], ["b"], ["c"], ["d"]]
assert solve(["x", "y", "z"], [["x", "y"], ["x", "z"], ["y", "z"]]) == [["x"], ["y"], ["z"]]
assert solve(["x", "y", "z"], [["x", "x"]]) == None
assert solve(["a", "b", "c"], [["a", "b"], ["a", "b"], ["b", "c"]]) == [["a"], ["b"], ["c"]]
assert solve(["a", "b", "c"], [["a", "b"], ["c", "b"]]) == [["a", "c"], ["b"]]
assert solve(["a", "b", "c", "d"], [["a", "c"], ["b", "c"], ["c", "d"]]) == [["a", "b"], ["c"], ["d"]]
assert solve(["A", "a"], [["A", "a"]]) == [["A"], ["a"]]
