# nested int parser

Difficulty: hard

Write `solve(text: str) -> list`.

Parse a valid Python-style list literal made only of nested lists and signed decimal integers. Integer literals have no leading zero except 0. ASCII whitespace may occur anywhere between tokens, and a trailing comma is allowed in each list. Return nested Python lists and ints. The outermost value is always a list; no strings, booleans, or other literals appear.

Examples:
- `solve('[1, [-2, 3]]') == [1, [-2, 3]]`
- `solve('[]') == []`
