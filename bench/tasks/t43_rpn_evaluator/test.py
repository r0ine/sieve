from solution import solve


assert solve(['0']) == 0
assert solve(['-5']) == -5
assert solve(['7', '3', '/']) == 2
assert solve(['-7', '3', '/']) == -2
assert solve(['7', '-3', '/']) == -2
assert solve(['-7', '-3', '/']) == 2
assert solve(['2', '3', '+', '4', '*']) == 20
assert solve([str(10**30), '2', '*']) == 2 * 10**30
