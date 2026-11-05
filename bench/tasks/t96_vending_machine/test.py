from solution import solve


menu = {"cola": 125, "chips": 50}
shelf = {"cola": 1, "chips": 5}
bank = {100: 0, 25: 2, 10: 0, 5: 1}
day = [
    ("insert", 100), ("insert", 50), ("insert", 25), ("select", "cola"),
    ("select", "cola"), ("select", "water"), ("cancel",), ("select", "chips"),
    ("insert", 100), ("select", "chips"), ("insert", 25), ("select", "chips"),
    ("insert", 25), ("cancel",),
]
log = solve(menu, shelf, bank, day)
assert log == [
    "credit 100", "reject 50", "credit 125", "vend cola",
    "sold out cola", "unknown water", "idle", "need 50",
    "credit 100", "vend chips change 25,25", "credit 25", "need 25",
    "credit 50", "return 25,25",
]
assert menu == {"cola": 125, "chips": 50}
assert shelf == {"cola": 1, "chips": 5}
assert bank == {100: 0, 25: 2, 10: 0, 5: 1}

assert solve({}, {}, {}, []) == []
assert solve({}, {}, {5: 0}, [("cancel",)]) == ["idle"]
assert solve({}, {}, {5: 0}, [("insert", 10)]) == ["reject 10"]
assert solve({}, {}, {5: 0}, [("insert", 10), ("cancel",)]) == ["reject 10", "idle"]
assert solve({}, {}, {5: 0}, [("insert", 5), ("cancel",)]) == ["credit 5", "return 5"]

gum = ({"gum": 30}, {"gum": 2}, {100: 0, 25: 2, 10: 0, 5: 1})
assert solve(*gum, [("insert", 100), ("select", "gum")]) == ["credit 100", "no change"]
assert solve(*gum, [("insert", 100), ("select", "gum"), ("cancel",)]) == ["credit 100", "no change", "return 100"]
assert solve(*gum, [("insert", 25), ("insert", 5), ("select", "gum")]) == ["credit 25", "credit 30", "vend gum"]
assert solve(*gum, [("insert", 25), ("insert", 25), ("select", "gum")]) == ["credit 25", "credit 50", "no change"]
assert solve(*gum, [("insert", 25), ("insert", 25), ("insert", 5), ("select", "gum")]) == [
    "credit 25", "credit 50", "credit 55", "vend gum change 25"
]

stuck = ({"x": 5}, {"x": 1}, {25: 1, 10: 0, 5: 0})
assert solve(*stuck, [("insert", 10), ("insert", 10), ("insert", 10), ("cancel",), ("select", "x")]) == [
    "credit 10", "credit 20", "credit 30", "no change", "vend x change 25"
]
assert solve(*stuck, [("insert", 10), ("insert", 10), ("insert", 10), ("select", "x"), ("select", "x"), ("cancel",)]) == [
    "credit 10", "credit 20", "credit 30", "vend x change 25", "sold out x", "idle"
]
assert solve(*stuck, [("insert", 10), ("select", "x"), ("cancel",)]) == ["credit 10", "no change", "return 10"]

assert solve({"free": 0}, {"free": 1}, {5: 0}, [("select", "free"), ("select", "free")]) == ["vend free", "sold out free"]
assert solve({"free": 0}, {"free": 1}, {5: 0}, [("insert", 5), ("select", "free")]) == ["credit 5", "vend free change 5"]

tea = ({"tea": 15}, {"tea": 3}, {10: 0, 5: 0})
assert solve(*tea, [("insert", 10), ("insert", 10), ("select", "tea"), ("insert", 5), ("select", "tea")]) == [
    "credit 10", "credit 20", "no change", "credit 25", "vend tea change 10"
]
assert solve(*tea, [("insert", 10), ("insert", 10), ("select", "tea"), ("insert", 5), ("select", "tea"), ("insert", 5), ("insert", 10), ("select", "tea")]) == [
    "credit 10", "credit 20", "no change", "credit 25", "vend tea change 10", "credit 5", "credit 15", "vend tea"
]
assert solve(*tea, [("select", "tea")]) == ["need 15"]
assert solve(*tea, [("insert", 5), ("select", "tea")]) == ["credit 5", "need 10"]
assert solve(*tea, [("insert", 5), ("select", "coffee"), ("cancel",)]) == ["credit 5", "unknown coffee", "return 5"]

assert solve({"a": 1}, {"a": 0}, {5: 0}, [("select", "a")]) == ["sold out a"]
assert solve({"a": 1}, {"a": 0}, {5: 0}, [("select", "b")]) == ["unknown b"]

wide = ({"a": 35}, {"a": 1}, {100: 0, 25: 1, 10: 2, 5: 3, 1: 5})
assert solve(*wide, [("insert", 100), ("select", "a")]) == ["credit 100", "vend a change 25,10,10,5,5,5,1,1,1,1,1"]
short = ({"a": 35}, {"a": 1}, {100: 0, 25: 1, 10: 2, 5: 3, 1: 4})
assert solve(*short, [("insert", 100), ("select", "a")]) == ["credit 100", "no change"]
assert solve(*short, [("insert", 100), ("select", "a"), ("insert", 5), ("select", "a"), ("cancel",)]) == [
    "credit 100", "no change", "credit 105", "no change", "return 100,5"
]
