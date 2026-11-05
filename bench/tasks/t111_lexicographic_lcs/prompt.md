# lexicographic lcs

Difficulty: hard

Write `solve(left: str, right: str) -> str`.

Return a longest common subsequence of the two strings. A subsequence retains character order but may skip characters. If several have the maximum length, choose the lexicographically smallest string under Python's Unicode code point order. Repeated characters are distinct positions, and matching is exact without normalization or case folding. Empty strings have the empty subsequence. Each input has at most 100 Unicode code points.

Examples:
- `solve('abc', 'bac') == 'ac'`
- `solve('banana', 'ananas') == 'anana'`
- `solve('', 'abc') == ''`
