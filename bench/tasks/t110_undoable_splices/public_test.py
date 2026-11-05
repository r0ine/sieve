from solution import solve


assert solve('abc', [('edit', 1, 1, 'X')]) == 'aXc'
assert solve('abc', [('edit', 3, 0, '!'), ('undo',)]) == 'abc'
assert solve('a', [('undo',), ('redo',)]) == 'a'
