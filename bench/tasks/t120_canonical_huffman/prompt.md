# canonical huffman codes

Difficulty: hard

Write `solve(frequencies: dict[str, int]) -> dict[str, str]`.

Each key is one distinct Unicode code point and each frequency is a positive integer. Build a binary Huffman tree by repeatedly removing the two nodes with the smallest `(total_frequency, smallest_symbol_in_subtree)` pair. Make the first removed node the left child and the second the right child. A leaf's tree depth is its code length. For one symbol, assign length 1. Then ignore the tree's left/right bit paths and assign canonical codes: sort symbols by `(length, symbol)`, give the first the all-zero bit string of its length, and for each next symbol increment the previous code as an integer and shift left by the increase in length. Return symbol-to-bit-string mapping; dictionary iteration order does not matter. Empty input returns `{}`. Frequencies and sums are exact, without overflow.

Examples:
- `solve({'a': 1, 'b': 1}) == {'a': '0', 'b': '1'}`
- `solve({'a': 1, 'b': 1, 'c': 2}) == {'c': '0', 'a': '10', 'b': '11'}`
- `solve({'x': 9}) == {'x': '0'}`
