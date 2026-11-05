# canonical_roman
Difficulty: hard

Implement `solve(numeral: str) -> int | None`.

Read a canonical Roman numeral from 1 through 3999. Return its integer value, or `None` if the text is not the unique standard spelling of a number in that range. Standard spelling is the concatenation of thousands (`M` repeated zero to three times), hundreds (`CM`, `D`, `CD`, or `C` repeated as appropriate), tens (the same pattern using `X`, `L`, `C`), and units (the same pattern using `I`, `V`, `X`). Subtractive pairs are only `IV`, `IX`, `XL`, `XC`, `CD`, and `CM`. Only uppercase ASCII symbols `IVXLCDM` are allowed; the empty string is invalid.

## Examples

- `solve("MCMXCIV") == 1994`
- `solve("IIII") is None`
- `solve("XL") == 40`
