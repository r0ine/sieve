from solution import solve

assert solve(5, [[2, "llo"], [0, "hel"]]) == "hello"
assert solve(3, [[0, "ab"], [1, "xc"]]) is None
assert solve(2, [[0, "a"]]) is None
assert solve(0, []) == ""
assert solve(0, [[0, ""]]) == ""
assert solve(1, []) is None
assert solve(1, [[0, "a"]]) == "a"
assert solve(1, [[0, "a"], [0, "a"]]) == "a"
assert solve(1, [[0, "a"], [0, "b"]]) is None
assert solve(2, [[0, "ab"]]) == "ab"
assert solve(2, [[1, "b"], [0, "a"]]) == "ab"
assert solve(2, [[0, "a"], [1, "b"]]) == "ab"
assert solve(2, [[0, "ab"], [0, "ab"]]) == "ab"
assert solve(2, [[0, "ab"], [1, "b"]]) == "ab"
assert solve(2, [[0, "ab"], [1, "c"]]) is None
assert solve(3, [[0, "abc"], [1, "bc"]]) == "abc"
assert solve(3, [[0, "abc"], [1, "bx"]]) is None
assert solve(3, [[0, "a"], [2, "c"]]) is None
assert solve(3, [[0, "a"], [1, "b"], [2, "c"]]) == "abc"
assert solve(3, [[0, ""], [0, "abc"]]) == "abc"
assert solve(3, [[3, ""], [0, "abc"]]) == "abc"
assert solve(4, [[2, "cd"], [0, "ab"]]) == "abcd"
assert solve(4, [[0, "ab"], [2, "cd"], [1, "bc"]]) == "abcd"
assert solve(4, [[0, "ab"], [2, "cd"], [1, "bx"]]) is None
assert solve(2, [[0, "é中"]]) == "é中"
assert solve(2, [[1, "中"], [0, "é"]]) == "é中"
