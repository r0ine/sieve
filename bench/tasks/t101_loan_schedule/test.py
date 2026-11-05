from solution import solve


assert solve(1000, 0, 3) == [(333, 0, 667), (333, 0, 334), (334, 0, 0)]
assert solve(1000, 0, 4) == [(250, 0, 750), (250, 0, 500), (250, 0, 250), (250, 0, 0)]
assert solve(1001, 0, 2) == [(501, 0, 500), (500, 0, 0)]
assert solve(12345, 0, 1) == [(12345, 0, 0)]
assert solve(1, 0, 3) == [(0, 0, 1), (0, 0, 1), (1, 0, 0)]
assert solve(2, 0, 3) == [(1, 0, 1), (1, 0, 0)]
assert solve(5, 0, 4) == [(1, 0, 4), (1, 0, 3), (1, 0, 2), (2, 0, 0)]
assert solve(7, 0, 4) == [(2, 0, 5), (2, 0, 3), (2, 0, 1), (1, 0, 0)]
assert solve(10, 0, 4) == [(3, 0, 7), (3, 0, 4), (3, 0, 1), (1, 0, 0)]
assert solve(10, 0, 6) == [(2, 0, 8), (2, 0, 6), (2, 0, 4), (2, 0, 2), (2, 0, 0)]
assert solve(100000, 1200, 1) == [(101000, 1000, 0)]
assert solve(100000, 1200, 2) == [(50751, 1000, 50249), (50751, 502, 0)]
assert solve(100000, 1200, 3) == [(34002, 1000, 66998), (34002, 670, 33666), (34003, 337, 0)]
assert solve(50, 1200, 1) == [(51, 1, 0)]
assert solve(150, 1200, 1) == [(152, 2, 0)]
assert solve(100000, 1, 1) == [(100001, 1, 0)]
assert solve(100, 120000, 2) == [(133, 100, 67), (134, 67, 0)]

mortgage = solve(20000000, 600, 360)
assert mortgage[0] == (119910, 100000, 19980090)
assert mortgage[1] == (119910, 99900, 19960080)
assert mortgage[-1][2] == 0
assert all(row[2] > 0 for row in mortgage[:-1])
assert sum(p for p, _, _ in mortgage) - sum(i for _, i, _ in mortgage) == 20000000
assert all(p == 119910 for p, _, _ in mortgage[:-1])
assert len(mortgage) == 360
assert mortgage[-2:] == [(119910, 1191, 119417), (120014, 597, 0)]

car = solve(2500000, 499, 60)
assert car[0] == (47167, 10396, 2463229)
assert car[-2:] == [(47167, 390, 46945), (47140, 195, 0)]
assert car[-1][2] == 0
assert sum(p for p, _, _ in car) - sum(i for _, i, _ in car) == 2500000
assert len({p for p, _, _ in car[:-1]}) == 1
