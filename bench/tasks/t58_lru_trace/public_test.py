from solution import solve

assert solve(2, [["put", "a", 1], ["put", "b", 2], ["get", "a"]]) == [[1], ["a", "b"]]
assert solve(1, [["put", "a", 1], ["put", "b", 2], ["get", "a"]]) == [[None], ["b"]]
