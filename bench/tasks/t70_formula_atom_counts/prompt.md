# formula_atom_counts
Difficulty: hard

Implement `solve(formula: str) -> list[list]`.

Parse a valid symbolic formula and return its total atom counts as `[symbol, count]` pairs sorted by symbol in Python string order. A formula is a nonempty sequence of terms. A term is either an element symbol (one uppercase ASCII letter followed by zero or more lowercase ASCII letters) or a parenthesized nonempty sequence of terms. Either term may have an optional positive decimal multiplier immediately after it; multipliers have no leading zeroes and contain at most 1000 digits. An omitted multiplier means one. Parentheses can nest. Symbols are names only; do not check a periodic table. Return each distinct symbol once and use exact integers, even for very large multipliers.

## Examples

- `solve("H2O") == [["H", 2], ["O", 1]]`
- `solve("Mg(OH)2") == [["H", 2], ["Mg", 1], ["O", 2]]`
- `solve("K4(ON(SO3)2)2") == [["K", 4], ["N", 2], ["O", 14], ["S", 4]]`
