from solution import solve

assert solve({"a": [10, None]}, ["/a/1", "/a/2"]) == [[True, None], [False, None]]
assert solve({"a/b": 3}, ["/a~1b", ""]) == [[True, 3], [True, {"a/b": 3}]]
