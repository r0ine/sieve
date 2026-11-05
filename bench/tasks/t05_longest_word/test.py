from solution import solve


assert solve('') == ''
assert solve('  \t\n ') == ''
assert solve('red blue') == 'blue'
assert solve('cat dog') == 'cat'
assert solve('a  bb ccc') == 'ccc'
assert solve('hi! no') == 'hi!'
assert solve('é 雪山') == '雪山'
assert solve('one\ttwo three') == 'three'
