from solution import solve

assert solve('a,"b,c"\nx,y') == [["a", "b,c"], ["x", "y"]]
assert solve('""\n') == [[""]]
assert solve("") == []
