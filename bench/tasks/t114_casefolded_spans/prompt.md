# casefolded spans

Difficulty: hard

Write `solve(text: str, needle: str) -> list[tuple[int, int]]`.

Return every half-open span `[start, end)` of original Unicode code point positions for which `text[start:end].casefold() == needle.casefold()`. `needle` is nonempty. A match may overlap another match. A case fold may expand one character into several (for example `ß` to `ss`), but a span cannot start or end inside that original character. Do not normalize Unicode: composed and decomposed characters remain different unless case folding itself makes them equal. Sort spans by increasing start, then end. Empty `text` returns `[]`.

Examples:
- `solve('Straße', 'SS') == [(4, 5)]`
- `solve('ß', 's') == []`
- `solve('aaaa', 'aa') == [(0, 2), (1, 3), (2, 4)]`
