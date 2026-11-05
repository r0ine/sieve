# shell_words
Difficulty: hard

Implement `solve(line: str) -> list[str] | None`.

Split a command line into words using these quoting rules, scanning left to right. Return `None` on a syntax error.

- Outside quotes, a space or tab ends the current word. Runs of spaces/tabs are one separator; leading and trailing ones produce nothing. No other character (newline included) is a separator.
- Outside quotes, a backslash makes the next character literal, whatever it is (so `\ ` is a literal space inside a word and `\n` is the letter `n`). A backslash as the last character of the line is an error.
- `'` starts a single-quoted section that ends at the next `'`. Everything inside is literal, backslashes included. A missing closing `'` is an error.
- `"` starts a double-quoted section that ends at the next unescaped `"`. Inside it, a backslash followed by one of `"` `\` `$` `` ` `` produces just that character; a backslash followed by anything else is kept as a literal backslash and that character is processed normally. A missing closing `"` is an error (an escaped `\"` does not close it).
- Quoted sections and unquoted text with no separator between them join into one word (`a"b"'c'` is `abc`). A quoted section always creates a word even if empty: the line `a '' b` gives `["a", "", "b"]`.

The empty or all-whitespace line returns `[]`.

## Examples

- `solve("a 'b c' d") == ["a", "b c", "d"]`
- `solve('x="1 2"\'3\'') == ["x=1 23"]`
- `solve("'abc") is None`
