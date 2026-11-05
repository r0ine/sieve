# normalize space

Difficulty: medium

Write `solve(text: str) -> str`.

Strip leading and trailing Unicode whitespace, replace each nonempty run of whitespace with one ASCII space, and preserve all non-whitespace characters and their case. Empty or whitespace-only input returns ''.

Examples:
- `solve('  a\t b\n') == 'a b'`
- `solve('') == ''`
