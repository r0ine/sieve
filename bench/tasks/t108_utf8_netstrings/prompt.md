# utf8 netstrings

Difficulty: hard

Write `solve(stream: str) -> list[str] | None`.

Parse a stream of consecutive netstrings. Each record has an ASCII decimal byte length, `:`, exactly that many UTF-8 bytes of payload, then `,`. Length zero is written `0`; any other length starts with 1..9, with no sign or leading zero. Payload may contain any Unicode characters, including `:` and `,`; length counts UTF-8 bytes, not Python characters. Return all decoded payloads, or `None` if any record is malformed, its payload ends inside a UTF-8 character, its comma is missing, or trailing data remains. Empty input is an empty list. The input itself is a Python Unicode string.

Examples:
- `solve('3:cat,') == ['cat']`
- `solve('2:é,') == ['é']`
- `solve('1:é,') is None`
