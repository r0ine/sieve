# utf16_boundaries
Difficulty: hard

Implement `solve(text: str, offsets: list[int]) -> list[int | None]`.

Treat `text` as a sequence of Unicode scalar values; it contains no lone surrogate code points. For each integer offset measured in UTF-16 code units from the beginning, return the Python string index at that exact character boundary. Return `None` for negative offsets, offsets beyond the encoded length, or offsets inside the two code units of a supplementary character. A BMP character, including a combining mark, occupies one unit; a character above U+FFFF occupies two. Offset zero maps to index zero, and the final offset maps to `len(text)`. Do not normalize text or merge grapheme clusters.

## Examples

- `solve("A😀B", [0, 1, 2, 3, 4]) == [0, 1, None, 2, 3]`
- `solve("é", [0, 1, 2]) == [0, 1, 2]`
