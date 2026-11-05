from solution import solve

assert solve(["file10", "file2", "file1"]) == ["file1", "file2", "file10"]
assert solve(["a07", "a7", "A7"]) == ["A7", "a7", "a07"]
assert solve(["b", "10", "a"]) == ["10", "a", "b"]
