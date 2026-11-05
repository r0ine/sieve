from solution import solve

assert solve(["push 7", "push -2", "div"]) == [-3]
assert solve(["push 2147483647", "push 1", "add"]) == [-2147483648]
assert solve(["push 1", "add"]) is None
