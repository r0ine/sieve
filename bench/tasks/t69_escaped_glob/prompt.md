# escaped_glob
Difficulty: hard

Implement `solve(pattern: str, text: str) -> bool`.

Match the entire text against a glob pattern. An unescaped `?` matches exactly one Unicode code point, and an unescaped `*` matches zero or more Unicode code points. A backslash quotes the next pattern character, making it literal, even when that character is another backslash; every backslash is guaranteed to have a following character. All other characters match themselves exactly, with no normalization or case folding. Adjacent stars have the same effect as one star. The empty pattern matches only empty text. Match code points as Python string characters, not encoded bytes.

## Examples

- `solve("a*b", "acb") is True`
- `solve("a\\*b", "a*b") is True`
- `solve("a?b", "ab") is False`
