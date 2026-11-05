from solution import solve


assert solve("A1") == ["A1"]
assert solve("a1") == ["A1"]
assert solve("$b$03") == ["B3"]
assert solve("A1:A1") == ["A1"]
assert solve("A1:B2") == ["A1", "B1", "A2", "B2"]
assert solve("B2:A1") == ["A1", "B1", "A2", "B2"]
assert solve("B1:A2") == ["A1", "B1", "A2", "B2"]
assert solve("A2:B1") == ["A1", "B1", "A2", "B2"]
assert solve("Z1:AB1") == ["Z1", "AA1", "AB1"]
assert solve("AB1:Z1") == ["Z1", "AA1", "AB1"]
assert solve("AZ3:BA3") == ["AZ3", "BA3"]
assert solve("YZ1:ZA1") == ["YZ1", "ZA1"]
assert solve("AAA1:ZZ1") == ["ZZ1", "AAA1"]
assert solve("zz9") == ["ZZ9"]
assert solve("XFD1048576") == ["XFD1048576"]
assert solve("$A$1:$B$1") == ["A1", "B1"]
assert solve("$a1:b$2") == ["A1", "B1", "A2", "B2"]
assert solve("A01:A03") == ["A1", "A2", "A3"]
assert solve("A10:A9") == ["A9", "A10"]
assert solve("C3:A1") == ["A1", "B1", "C1", "A2", "B2", "C2", "A3", "B3", "C3"]
assert solve("Y2:AB2") == ["Y2", "Z2", "AA2", "AB2"]
assert solve("aY1:Az1") == ["AY1", "AZ1"]
assert solve("ZY5:AAB5") == ["ZY5", "ZZ5", "AAA5", "AAB5"]
assert solve("B9:B11") == ["B9", "B10", "B11"]
assert len(solve("A1:Z100")) == 2600
assert solve("A1:Z100")[26] == "A2"
assert solve("A1:Z100")[-1] == "Z100"
assert solve("Z99:Z100") == ["Z99", "Z100"]
