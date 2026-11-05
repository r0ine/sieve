from solution import solve


assert solve([]) == ''
assert solve(['']) == ''
assert solve(['alone']) == 'alone'
assert solve(['flower', 'flow']) == 'flow'
assert solve(['a', 'A']) == ''
assert solve(['éa', 'éb']) == 'é'
assert solve(['same', 'same']) == 'same'
assert solve(['abc', 'abd', 'a']) == 'a'
