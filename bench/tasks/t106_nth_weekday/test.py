from solution import solve


assert solve(2024, 2, 3, -1) == '2024-02-29'
assert solve(2023, 2, 0, 5) is None
assert solve(2000, 1, 5, 1) == '2000-01-01'
assert solve(2024, 2, 3, 1) == '2024-02-01'
assert solve(2024, 2, 3, 5) == '2024-02-29'
assert solve(2024, 2, 3, 6) is None
assert solve(2024, 2, 3, -5) == '2024-02-01'
assert solve(2024, 2, 3, -6) is None
assert solve(2023, 2, 1, 4) == '2023-02-28'
assert solve(2023, 2, 1, 5) is None
assert solve(2023, 2, 1, -1) == '2023-02-28'
assert solve(2023, 2, 1, -4) == '2023-02-07'
assert solve(2023, 2, 1, -5) is None
assert solve(1900, 2, 2, 4) == '1900-02-28'
assert solve(1900, 2, 2, 5) is None
assert solve(2000, 2, 1, 5) == '2000-02-29'
assert solve(2000, 2, 1, -1) == '2000-02-29'
assert solve(2021, 8, 6, 5) == '2021-08-29'
assert solve(2021, 8, 6, -1) == '2021-08-29'
assert solve(2021, 8, 6, -5) == '2021-08-01'
assert solve(2021, 8, 6, -6) is None
assert solve(2022, 1, 5, 5) == '2022-01-29'
assert solve(2022, 1, 5, -5) == '2022-01-01'
assert solve(2022, 1, 5, 6) is None
assert solve(2024, 4, 0, 5) == '2024-04-29'
assert solve(2024, 4, 0, -5) == '2024-04-01'
