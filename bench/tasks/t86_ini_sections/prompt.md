# ini_sections
Difficulty: hard

Implement `solve(text: str) -> dict[str, dict[str, str]] | None`.

Parse a small INI dialect. Process `text` line by line:

1. Split on `"\n"`. If a line ends with `"\r"`, remove that one `"\r"`.
2. Strip spaces and tabs (only `" "` and `"\t"`) from both ends of the line.
3. An empty line is ignored. A line whose first character is `;` or `#` is a comment and ignored.
4. A line that starts with `[` and ends with `]` is a section header. The name is the text between the brackets, stripped of spaces and tabs at both ends and converted with `str.lower()`. If the name is empty, the whole input is invalid. Later keys belong to this section. A header that repeats an earlier section name (after lowercasing) continues that same section.
5. A line containing `=` is a key line. The key is the text before the first `=`, stripped of spaces and tabs and lowered with `str.lower()`; an empty key makes the whole input invalid. The value is everything after the first `=`, stripped of spaces and tabs. If the stripped value has length at least 2 and both starts and ends with `"`, remove exactly that outer pair of quotes and nothing else (no escape processing, inner text kept as is). `;` and `#` inside a value are ordinary characters. A repeated key in the same section overwrites the earlier value.
6. Any other line makes the whole input invalid.

Rule 4 is checked before rule 5, so `[a=b]` is a header named `a=b`.

Keys that appear before any header belong to the section named `""`. Return a dict mapping section name to a dict of key/value pairs. Every header creates its section, even if it gets no keys. The `""` section is present only if at least one key line appears before the first header. Return `None` for invalid input. Empty input returns `{}`.

## Examples

- `solve("a=1\n[S]\nb = \"x y\"") == {"": {"a": "1"}, "s": {"b": "x y"}}`
- `solve("[x]\n[X]\nk=1\nk=2") == {"x": {"k": "2"}}`
- `solve("[]") is None`
