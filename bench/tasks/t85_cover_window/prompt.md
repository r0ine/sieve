# cover_window
Difficulty: hard

Implement `solve(text: str, need: str) -> str`.

Return the shortest contiguous substring of `text` that contains every character of `need` at least as many times as it occurs in `need` (multiplicity counts: `need = "aab"` requires two `a` and one `b`). Characters are compared exactly (case-sensitive; spaces and punctuation are ordinary characters). The characters may appear in any order inside the window, and the window may contain other characters.

If several shortest windows exist, return the leftmost one. If `need` is empty, return `""`. If no window exists, return `""`. Inputs can be up to 100000 characters long, so the solution should run in roughly linear time.

## Examples

- `solve("ADOBECODEBANC", "ABC") == "BANC"`
- `solve("aa", "aa") == "aa"`
- `solve("abab", "ab") == "ab"`
