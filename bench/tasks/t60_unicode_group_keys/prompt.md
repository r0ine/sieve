# unicode_group_keys
Difficulty: hard

Implement `solve(words: list[str]) -> list[list[str]]`.

Group strings by a comparison key. For each input string, apply Unicode NFKD normalization, remove every character whose Unicode category is `Mn` (nonspacing mark), apply Unicode `casefold()`, then split on Unicode whitespace and join the pieces with one ASCII space. The resulting string is its key. Do not repeat normalization or mark removal after casefolding. Two strings share a group exactly when their keys match.

Return groups in order of each key's first appearance. Within each group, preserve the original strings and their input order. Empty strings and strings made only of whitespace have the empty key. Do not mutate the input.

## Examples

- `solve(["Café", "cafe", "Tea"]) == [["Café", "cafe"], ["Tea"]]`
- `solve(["Ａ", "a", "ß", "ss"]) == [["Ａ", "a"], ["ß", "ss"]]`
