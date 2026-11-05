# csv_records
Difficulty: hard

Implement `solve(text: str) -> list[list[str]]`.

Parse a comma-separated document into records and fields. Input is valid under these rules: commas separate fields; records end with LF or CRLF; a field may be wrapped in double quotes only from its first character; inside a quoted field, `""` represents one literal quote, and commas or line endings are literal text. Outside quotes, a quote is never used. Spaces and Unicode characters are ordinary field content and are never trimmed. An empty field is an empty string. A blank line is one record containing one empty field.

An empty document has no records. A final LF or CRLF terminates the preceding record and does not create another record. A final comma does create an empty final field. Preserve line endings inside quoted fields exactly as written. No bare CR occurs in input.

## Examples

- `solve('a,"b,c"\nx,y') == [["a", "b,c"], ["x", "y"]]`
- `solve('""\n') == [[""]]`
- `solve("") == []`
