# repeat_groups
Difficulty: hard

Implement `solve(text: str) -> str`.

Expand repeat groups. `[` and `]` are always structural and always balanced in the input; every other character, including digits, spaces and non-ASCII letters, is ordinary text.

- A group is `[` ... `]`. Its content is expanded recursively, then repeated.
- The repeat count is the maximal run of ASCII digits that ends immediately before the `[`, read as a decimal integer (leading zeros allowed, so `007[z]` repeats 7 times). A count of 0 removes the group. A `[` with no digit directly before it repeats once.
- A run of digits that is not immediately followed by `[` is literal text and is copied unchanged. For example in `1a2[b]` the `1` is literal and the `2` is a count.
- Empty groups expand to the empty string. The empty input returns `""`.

## Examples

- `solve("3[a2[bc]]") == "abcbcabcbcabcbc"`
- `solve("a12b") == "a12b"`
- `solve("[ab]c") == "abc"`
