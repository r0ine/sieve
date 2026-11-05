from solution import solve

assert solve([["push", 4], ["push", 2], ["sub"]]) == [[2], []]
assert solve([["push", 1], ["begin"], ["pop"], ["rollback"]]) == [[1], []]
