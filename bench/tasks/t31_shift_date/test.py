from solution import solve


assert solve('2024-02-28', 1) == '2024-02-29'
assert solve('2024-02-29', 1) == '2024-03-01'
assert solve('2023-02-28', 1) == '2023-03-01'
assert solve('2023-01-01', -1) == '2022-12-31'
assert solve('2000-02-28', 1) == '2000-02-29'
assert solve('1900-02-28', 1) == '1900-03-01'
assert solve('2024-06-01', 0) == '2024-06-01'
assert solve('0001-01-01', 1) == '0001-01-02'
