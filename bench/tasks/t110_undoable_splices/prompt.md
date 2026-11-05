# undoable splices

Difficulty: hard

Write `solve(text: str, operations: list[tuple]) -> str`.

Process operations in order on a Unicode string; positions count Python Unicode code points. An `('edit', start, delete_count, replacement)` operation first resolves a negative `start` as `len(current) + start`, then clamps it to `[0, len(current)]`. It removes at most `delete_count` characters from there and inserts `replacement`. `delete_count` is nonnegative. Every edit, even one leaving the text unchanged, adds a history state and discards all redo states. `('undo',)` moves back one state when possible; `('redo',)` moves forward one state when possible. Undo or redo at a boundary does nothing. Return the final text. All operation tuples have these valid forms.

Examples:
- `solve('abc', [('edit', 1, 1, 'X')]) == 'aXc'`
- `solve('abc', [('edit', 3, 0, '!'), ('undo',)]) == 'abc'`
- `solve('a', [('undo',), ('redo',)]) == 'a'`
