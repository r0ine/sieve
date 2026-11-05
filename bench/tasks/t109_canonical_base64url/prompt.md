# canonical base64url

Difficulty: hard

Write `solve(text: str) -> bytes | None`.

Decode an unpadded RFC 4648 base64url string. Only ASCII letters, digits, `-`, and `_` are permitted. Empty input represents empty bytes. Padding characters, whitespace, standard base64 `+` and `/`, and non-ASCII characters are invalid. The encoding must be canonical: unused low bits in its final sextet must be zero, so decoding and encoding the bytes again yields exactly the input. A length congruent to 1 modulo 4 is invalid. Return `None` for every invalid input.

Examples:
- `solve('aGVsbG8') == b'hello'`
- `solve('_w') == b'\xff'`
- `solve('AB') is None`
