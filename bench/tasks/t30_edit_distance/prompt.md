# edit distance

Difficulty: medium

Write `solve(left: str, right: str) -> int`.

Return Levenshtein distance over Unicode code points. One insertion, deletion, or substitution costs 1; identical characters cost 0. Case matters.

Examples:
- `solve('kitten', 'sitting') == 3`
- `solve('', 'abc') == 3`
