from solution import solve


assert solve([], "a") == []
assert solve([{}], "a") == [0]
assert solve([{"a": 2}, {"a": 1}, {"a": 2}], "a") == [1, 0, 2]
assert solve([{"a": 2}, {"a": 1}, {"a": 2}], "-a") == [0, 2, 1]
assert solve([{}, {"a": 1}, {"a": None}], "-a") == [1, 0, 2]
assert solve([{}, {"a": 1}, {"a": None}], "a") == [1, 0, 2]
assert solve([{"a": None}, {}, {"a": None}], "a") == [0, 1, 2]
assert solve([{"a": None}, {}, {"a": None}], "-a") == [0, 1, 2]
assert solve([{"a": "x"}, {"a": 5}, {"a": -1}], "a") == [2, 1, 0]
assert solve([{"a": "x"}, {"a": 5}, {"a": -1}], "-a") == [0, 1, 2]
assert solve([{"a": "x"}, {}, {"a": 5}], "-a") == [0, 2, 1]
assert solve([{"n": "bob"}, {"n": "Bob"}, {"n": "alice"}, {"n": "BOB"}], "n") == [2, 3, 1, 0]
assert solve([{"n": "bob"}, {"n": "Bob"}, {"n": "alice"}, {"n": "BOB"}], "-n") == [0, 1, 3, 2]
assert solve([{"n": "b"}, {"n": "B"}, {"n": "b"}], "n") == [1, 0, 2]
assert solve([{"n": "b"}, {"n": "B"}, {"n": "b"}], "-n") == [0, 2, 1]
assert solve([{"n": "_"}, {"n": "a"}, {"n": "Z"}], "n") == [0, 1, 2]
assert solve([{"n": "abc"}, {"n": "Ab"}], "n") == [1, 0]
people = [
    {"name": "ann", "age": 30},
    {"name": "Bob", "age": 25},
    {"name": "cid", "age": 30},
    {"name": "dee"},
    {"name": "Ann", "age": 25},
    {"name": "eve", "age": None},
]
assert solve(people, "-age,name") == [0, 2, 4, 1, 3, 5]
assert solve(people, "age,name") == [4, 1, 0, 2, 3, 5]
assert solve(people, "age,-name") == [1, 4, 2, 0, 5, 3]
assert solve(people, "name") == [4, 0, 1, 2, 3, 5]
assert solve(people, "-name") == [5, 3, 2, 1, 0, 4]
assert solve(people, "missing") == [0, 1, 2, 3, 4, 5]
assert solve(people, "missing,-missing") == [0, 1, 2, 3, 4, 5]
assert solve(people, "missing,age") == [1, 4, 0, 2, 3, 5]
rows = [{"a": 1, "b": 2}, {"a": 1, "b": 1}, {"a": 0, "b": 2}, {"a": 1, "b": 2}]
assert solve(rows, "a,b") == [2, 1, 0, 3]
assert solve(rows, "-a,-b") == [0, 3, 1, 2]
assert solve(rows, "b,a") == [1, 2, 0, 3]
assert solve(rows, "-b,a") == [2, 0, 3, 1]
assert solve(rows, "a,a,a") == [2, 0, 1, 3]
assert solve(rows, "a,-a") == [2, 0, 1, 3]
assert solve([{"x": 0}, {"x": None}, {"x": -0}, {"x": ""}], "x") == [0, 2, 3, 1]
assert solve([{"x": 0}, {"x": None}, {"x": -0}, {"x": ""}], "-x") == [3, 0, 2, 1]
assert solve([{"x": 10 ** 30}, {"x": 10 ** 30 - 1}], "x") == [1, 0]
records = [{"k": 1}, {"k": 1}]
assert solve(records, "k") == [0, 1]
assert records == [{"k": 1}, {"k": 1}]
