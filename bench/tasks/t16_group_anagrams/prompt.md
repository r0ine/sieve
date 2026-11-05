# group anagrams

Difficulty: medium

Write `solve(words: list[str]) -> list[list[str]]`.

Group words that contain the same Unicode code points with the same multiplicities. Matching is case sensitive. Groups follow first appearance of their signature; words within each group retain input order. Empty input returns [].

Examples:
- `solve(['eat', 'tea', 'bat']) == [['eat', 'tea'], ['bat']]`
- `solve(['', '']) == [['', '']]`
