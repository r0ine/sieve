# overlap count

Difficulty: easy

Write `solve(text: str, needle: str) -> int`.

Count all start positions where needle matches text, including overlapping matches. For an empty needle, return len(text) + 1. Matching is case sensitive and uses Python string indexes.

Examples:
- `solve('aaaa', 'aa') == 3`
- `solve('abc', '') == 4`
