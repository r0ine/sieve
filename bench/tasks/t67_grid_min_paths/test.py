from solution import solve

assert solve([[1, 1], [1, 1]]) == [3, 2, "DR"]
assert solve([[1, None], [2, 3]]) == [6, 1, "DR"]
assert solve([]) == None
assert solve([[]]) == None
assert solve([[0]]) == [0, 1, ""]
assert solve([[None]]) == None
assert solve([[5]]) == [5, 1, ""]
assert solve([[-5]]) == [-5, 1, ""]
assert solve([[1, 2]]) == [3, 1, "R"]
assert solve([[1], [2]]) == [3, 1, "D"]
assert solve([[1, 2, 3]]) == [6, 1, "RR"]
assert solve([[1], [2], [3]]) == [6, 1, "DD"]
assert solve([[0, 0], [0, 0]]) == [0, 2, "DR"]
assert solve([[1, 9], [1, 1]]) == [3, 1, "DR"]
assert solve([[1, 1], [9, 1]]) == [3, 1, "RD"]
assert solve([[1, None], [None, 1]]) == None
assert solve([[1, 2, 3], [4, 5, 6]]) == [12, 1, "RRD"]
assert solve([[1, 1, 1], [1, 1, 1]]) == [4, 3, "DRR"]
assert solve([[0, 0, 0], [0, 0, 0], [0, 0, 0]]) == [0, 6, "DDRR"]
assert solve([[1, -5], [2, 3]]) == [-1, 1, "RD"]
assert solve([[-1, -1], [-1, -1]]) == [-3, 2, "DR"]
assert solve([[1, None, 1], [1, 1, 1]]) == [4, 1, "DRR"]
assert solve([[1, 1, 1], [None, None, 1]]) == [4, 1, "RRD"]
assert solve([[1, 1, 1], [1, None, 1], [1, 1, 1]]) == [5, 2, "DDRR"]
assert solve([[0, 0, 0], [0, None, 0], [0, 0, 0]]) == [0, 2, "DDRR"]
assert solve([[1000000000000, 1], [1, 1]]) == [1000000000002, 2, "DR"]
