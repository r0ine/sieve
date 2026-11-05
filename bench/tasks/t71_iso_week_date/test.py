from solution import solve

assert solve(2025, 1, 1) == "2024-12-30"
assert solve(2020, 53, 7) == "2021-01-03"
assert solve(2021, 53, 1) is None
assert solve(2024, 1, 1) == "2024-01-01"
assert solve(2024, 1, 7) == "2024-01-07"
assert solve(2024, 9, 4) == "2024-02-29"
assert solve(2024, 52, 1) == "2024-12-23"
assert solve(2024, 52, 7) == "2024-12-29"
assert solve(2024, 53, 1) is None
assert solve(2025, 1, 7) == "2025-01-05"
assert solve(2020, 53, 1) == "2020-12-28"
assert solve(2023, 1, 1) == "2023-01-02"
assert solve(2023, 1, 7) == "2023-01-08"
assert solve(2022, 52, 1) == "2022-12-26"
assert solve(2022, 52, 7) == "2023-01-01"
assert solve(2015, 53, 1) == "2015-12-28"
assert solve(2015, 53, 7) == "2016-01-03"
assert solve(2016, 53, 1) is None
assert solve(2000, 1, 1) == "2000-01-03"
assert solve(1, 1, 1) == "0001-01-01"
assert solve(2024, 0, 1) is None
assert solve(2024, 54, 1) is None
assert solve(2024, 1, 0) is None
assert solve(2024, 1, 8) is None
assert solve(0, 1, 1) is None
assert solve(10000, 1, 1) is None
