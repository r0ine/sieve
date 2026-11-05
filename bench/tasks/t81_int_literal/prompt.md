# int_literal
Difficulty: hard

Implement `solve(text: str) -> int | None`.

Return the value of `text` if the whole string is exactly one Python 3 integer literal, otherwise `None`. No sign, no whitespace and no other characters are allowed anywhere. The accepted forms are:

- **Decimal:** a digit `1`-`9` followed by any number of digits `0`-`9`; or one or more `0` digits (the value is zero). Leading zeros before a nonzero digit are invalid (`"07"`, `"00_7"`).
- **Binary:** `0b` or `0B`, then one or more digits `0`-`1`.
- **Octal:** `0o` or `0O`, then one or more digits `0`-`7`.
- **Hexadecimal:** `0x` or `0X`, then one or more digits `0`-`9`, `a`-`f`, `A`-`F`.

Underscores: a single `_` may appear between two digits, and in the binary/octal/hex forms a single `_` may also appear directly after the prefix, before the first digit (`"0x_ff"` is valid). Two underscores in a row, a leading or trailing underscore, or an underscore inside the prefix (`"0_x1"`) are invalid. Only ASCII digits count as digits: other Unicode digit characters make the input invalid. An empty string is invalid.

## Examples

- `solve("1_000") == 1000`
- `solve("0x_Ff") == 255`
- `solve("012") is None`
