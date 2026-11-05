from solution import solve


assert solve('[]') == []
assert solve('[0]') == [0]
assert solve('[1, [-2, 3]]') == [1, [-2, 3]]
assert solve('[[], []]') == [[], []]
assert solve(' [ -1 , 2, ] ') == [-1, 2]
assert solve('[[[5]]]') == [[[5]]]
assert solve('[10, 10, -10]') == [10, 10, -10]
assert solve('[' + str(10**30) + ']') == [10**30]
