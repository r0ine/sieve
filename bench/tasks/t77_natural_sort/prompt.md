# natural_sort
Difficulty: hard

Implement `solve(items: list[str]) -> list[str]`.

Return a new list with the strings in "natural" order. All strings contain only printable ASCII characters (code points 32 to 126) and may be empty.

Split every string into maximal runs: a digit run is one or more consecutive characters `0`-`9`; a text run is one or more consecutive non-digit characters. A string is thus a sequence of alternating runs (the empty string has no runs). Order two strings by these rules, using the next rule only when all earlier rules tie:

1. Compare the run sequences element by element from the left. Two digit runs compare by their integer value (`"007"` equals `"7"` here). Two text runs compare after converting `A`-`Z` to lowercase, using ordinary character-code ordering of the lowered text (so `"a"` < `"ab"` < `"b"`, and `"_"` < `"Z"` because `"_"` is compared against `"z"`). A digit run is smaller than a text run. If one sequence is a proper prefix of the other, the shorter sequence is smaller.
2. Compare the lengths of the digit runs, in order, as a list of integers, lexicographically (fewer leading zeros first: `"a7"` < `"a07"` < `"a007"`).
3. Compare the original strings by ordinary character-code ordering (`"A"` < `"a"`).

Equal strings stay as duplicates. A sign or a dot is plain text: `"-5"` is the text run `"-"` followed by the digit run `"5"`; `"1.10"` is three runs.

## Examples

- `solve(["file10", "file2", "file1"]) == ["file1", "file2", "file10"]`
- `solve(["a07", "a7", "A7"]) == ["A7", "a7", "a07"]`
- `solve(["b", "10", "a"]) == ["10", "a", "b"]`
