# fragment_reassembly
Difficulty: hard

Implement `solve(length: int, fragments: list[list]) -> str | None`.

Recover a string of exactly `length` characters from fragments `[offset, text]`. Every offset is a nonnegative integer and every fragment fits within positions `0` through `length - 1`; empty fragments, including at offset `length`, are allowed. Each character in `text` fixes the character at `offset + index`. Overlapping fragments must agree character for character. Return `None` if any positions remain uncovered or any overlapping characters conflict. Otherwise return the assembled string. For length zero, return the empty string unless a fragment violates the stated input guarantee. Fragments can arrive in any order and may contain Unicode characters; offsets count Python string characters, not UTF-8 bytes.

## Examples

- `solve(5, [[2, "llo"], [0, "hel"]]) == "hello"`
- `solve(3, [[0, "ab"], [1, "xc"]]) is None`
- `solve(2, [[0, "a"]]) is None`
