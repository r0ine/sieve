# word boundaries

Difficulty: medium

Write `solve(text: str) -> list[str]`.

Extract maximal runs of ASCII letters A-Z or a-z. All other characters, including digits, underscores, and non-ASCII letters, are separators. Preserve original case and order.

Examples:
- `solve('a_b2C') == ['a', 'b', 'C']`
- `solve('éHi!') == ['Hi']`
