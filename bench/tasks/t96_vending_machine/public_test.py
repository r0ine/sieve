from solution import solve

assert solve({"gum": 30}, {"gum": 2}, {100: 0, 25: 2, 10: 0, 5: 1}, [("insert", 100), ("select", "gum")]) == ["credit 100", "no change"]
assert solve({"cola": 125}, {"cola": 1}, {100: 0, 25: 0}, [("insert", 100), ("insert", 50), ("insert", 25), ("select", "cola"), ("select", "cola")]) == ["credit 100", "reject 50", "credit 125", "vend cola", "sold out cola"]
