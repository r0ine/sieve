# distinct_palindromes
Difficulty: hard

Implement `solve(text: str) -> int`.

Count the distinct non-empty palindromic subsequences of `text`, modulo `1_000_000_007`.

A subsequence is obtained by deleting zero or more characters without reordering the rest. Two subsequences are the same when they are equal as strings, no matter which positions produced them. Characters are compared exactly as Unicode code points: case matters, and any character (spaces, punctuation, non-ASCII) may appear. `text` has at most 1000 characters; the empty string gives 0.

## Examples

- `solve("bccb") == 6`
- `solve("aaa") == 3`
- `solve("abcd") == 4`
