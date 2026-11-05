# nested comment stripping

Difficulty: hard

Write `solve(source: str) -> str`.

Remove nested `/* ... */` block comments and `//` line comments from a source string. A line comment ends immediately before the next `\n` or at end of input; preserve that `\n` but remove any preceding `\r` inside the comment. Block comments may nest and may span lines; remove every character they contain, including newlines. An unclosed block comment consumes through end of input. Outside comments, single- and double-quoted strings are copied unchanged; a backslash escapes the next character inside a string, and comment markers there are literal. An unclosed string extends to end of input. Outside comments and strings, an unmatched `*/` is ordinary text. Do not insert replacement spaces.

Examples:
- `solve('a/* x */b') == 'ab'`
- `solve('x//y\nz') == 'x\nz'`
- `solve('"/*x*/"') == '"/*x*/"'`
