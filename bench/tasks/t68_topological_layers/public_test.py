from solution import solve

assert solve(["a", "b", "c"], [["a", "c"], ["b", "c"]]) == [["a", "b"], ["c"]]
assert solve(["a", "b"], [["a", "b"], ["b", "a"]]) == None
