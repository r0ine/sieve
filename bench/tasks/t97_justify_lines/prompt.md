# justify_lines
Difficulty: hard

Implement `solve(words: list[str], width: int) -> list[str]`.

Lay out the non-empty words (no spaces inside them) into fully justified lines of exactly `width` characters, `width >= 1`.

- Packing is greedy: a word joins the current line if the line's words plus one space between each pair would still fit in `width`; otherwise the current line is closed and the word starts a new line.
- A word longer than `width` always gets a line of its own: close the current line first if it has words, emit the long word unchanged (no padding, so that line is longer than `width`), and start the next word on a fresh line.
- A closed line with two or more words that is not the last line is fully justified: the spaces needed to reach `width` are spread over the gaps between words as evenly as possible, and when they cannot be spread evenly the leftmost gaps get one extra space each.
- A line with a single word, and the last line, are left-justified: words separated by one space, then padded on the right with spaces to `width`.
- The last line is the line holding the final word; if the final word is a long word, its line is still emitted unchanged.

Empty `words` returns `[]`.

## Examples

- `solve(["This", "is", "an", "example", "of", "text", "justification."], 16) == ["This    is    an", "example  of text", "justification.  "]`
- `solve(["a", "b", "c", "d"], 6) == ["a  b c", "d     "]`
- `solve(["a", "toolongword"], 5) == ["a    ", "toolongword"]`
