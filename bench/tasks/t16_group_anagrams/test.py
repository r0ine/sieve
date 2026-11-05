from solution import solve


assert solve([]) == []
assert solve(['']) == [['']]
assert solve(['', '']) == [['', '']]
assert solve(['eat', 'tea', 'bat']) == [['eat', 'tea'], ['bat']]
assert solve(['ab', 'ba', 'a', 'b']) == [['ab', 'ba'], ['a'], ['b']]
assert solve(['Aa', 'aA', 'aa']) == [['Aa', 'aA'], ['aa']]
assert solve(['éa', 'aé', 'ea']) == [['éa', 'aé'], ['ea']]
assert solve(['aa', 'a', 'aa']) == [['aa', 'aa'], ['a']]
