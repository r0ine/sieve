from solution import solve


assert solve('') == ''
assert solve('  \t') == ''
assert solve('  a\t b\n') == 'a b'
assert solve('a') == 'a'
assert solve(' a  a ') == 'a a'
assert solve('é\u2003雪') == 'é 雪'
assert solve('a\r\nb') == 'a b'
assert solve('a_b') == 'a_b'
