from solution import solve

assert solve(["1.0.0", "1.0.0-rc.1", "1.0.0-beta"]) == ["1.0.0-beta", "1.0.0-rc.1", "1.0.0"]
assert solve(["2.0.0+z", "2.0.0+a"]) == ["2.0.0+z", "2.0.0+a"]
