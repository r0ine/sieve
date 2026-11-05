# minimum palindrome partition

Difficulty: hard

Write `solve(text: str) -> tuple[int, list[str]]`.

Partition the entire string into contiguous nonempty palindromic pieces. A palindrome is exactly equal to its reversal by Unicode code points, with no case folding or normalization. Minimize the number of pieces. Among partitions with that minimum, choose the lexicographically smallest list of pieces using Python's normal list and string order. Return `(piece_count, pieces)`. Empty input returns `(0, [])`. Input length is at most 100 code points.

Examples:
- `solve('aab') == (2, ['aa', 'b'])`
- `solve('abba') == (1, ['abba'])`
- `solve('') == (0, [])`
