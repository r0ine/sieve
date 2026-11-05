# query_decode
Difficulty: hard

Implement `solve(query: str) -> dict[str, list[str]]`.

Decode a URL query string. Standard-library URL helpers are not available in the runtime, so implement the rules yourself:

1. If `query` starts with `?`, remove that single leading `?` (only one).
2. Split the rest on `&`. `;` is an ordinary character, not a separator. Skip empty pieces.
3. Split each piece at its first `=` into name and value. A piece without `=` has value `""`. The name may be empty (`"=x"` has name `""`).
4. Decode name and value separately. First convert the text to bytes: every character that is not part of an escape is encoded as UTF-8. Then: `+` becomes a space byte; `%` followed by two hexadecimal digits (`0-9`, `a-f`, `A-F`) becomes the byte with that value; a `%` not followed by two hex digits stays a literal `%` (and the characters after it are processed normally). Finally decode the bytes as UTF-8 exactly like Python's `bytes.decode("utf-8", "replace")`, so invalid or truncated sequences become `"�"` per Python's rules.
5. Decoding happens after splitting, so an encoded `%26` or `%3D` never splits anything.

Return a dict mapping every decoded name to the list of its decoded values in order of appearance (a repeated name collects several values). An input with no pieces returns `{}`.

## Examples

- `solve("?a=1&b=x+y&a=2") == {"a": ["1", "2"], "b": ["x y"]}`
- `solve("q=%2B1%20%3D") == {"q": ["+1 ="]}`
- `solve("flag&&=v") == {"flag": [""], "": ["v"]}`
