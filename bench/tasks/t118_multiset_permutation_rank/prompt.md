# multiset permutation rank

Difficulty: hard

Write `solve(symbols: str, permutation: str) -> int | None`.

Treat both strings as sequences of Unicode code points. If `permutation` is not a rearrangement of exactly the characters in `symbols`, return `None`. Otherwise list all distinct permutations of that multiset in ascending Python lexicographic order and return the zero-based index of `permutation`. Repeated characters do not create duplicate entries. Empty strings have rank zero. Do not case fold or normalize. Each string has at most 12 characters; the answer is an exact integer.

Examples:
- `solve('aab', 'aba') == 1`
- `solve('abc', 'cba') == 5`
- `solve('aa', 'ab') is None`
