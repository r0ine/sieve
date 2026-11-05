# cell_range
Difficulty: hard

Implement `solve(spec: str) -> list[str]`.

`spec` is a spreadsheet reference, either a single cell `A1` or a range `A1:C3`. The input is always well formed.

- A cell is one or more ASCII letters (column, case-insensitive) followed by one or more ASCII digits (row). Either part may be preceded by a `$` absolute marker, which is ignored. Rows are at least 1 and may have leading zeros in the input.
- Columns use bijective base 26: `A`=1 ... `Z`=26, `AA`=27, `AZ`=52, `BA`=53, `ZZ`=702, `AAA`=703.
- The two corners of a range may be given in any order or orientation (`B3:A1`, `A3:B1` and `A1:B3` are the same rectangle). A single cell is the 1x1 rectangle.

Return every cell of the rectangle in canonical form: uppercase column letters, row without leading zeros, no `$`. Order the cells by row ascending, and within a row by column number ascending.

## Examples

- `solve("A1:B2") == ["A1", "B1", "A2", "B2"]`
- `solve("Z1:AB1") == ["Z1", "AA1", "AB1"]`
- `solve("$b$03") == ["B3"]`
