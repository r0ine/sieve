# csv record

Difficulty: hard

Write `solve(line: str) -> list[str]`.

Parse one valid CSV record using comma delimiters and double-quoted fields. Inside quoted fields, doubled quotes represent one quote; commas are literal. Unquoted fields contain no quotes, and no field contains a newline. Preserve spaces and empty fields. Empty input represents one empty field.

Examples:
- `solve('a,"b,c"') == ['a', 'b,c']`
- `solve('') == ['']`
