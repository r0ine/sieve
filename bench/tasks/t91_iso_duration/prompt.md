# iso_duration
Difficulty: hard

Implement `solve(text: str) -> int | None`.

Parse a restricted ISO 8601 duration and return its length in whole seconds, or `None` if `text` does not match the grammar exactly.

Grammar, with no whitespace allowed anywhere:

- An optional sign, `+` or `-`, as the very first character. `-` negates the total; `+` changes nothing. At most one sign.
- The uppercase letter `P`.
- A date part: optionally `<n>W`, then optionally `<n>D`, in that order.
- Optionally a time part: the uppercase letter `T`, then optionally `<n>H`, then optionally `<n>M`, then optionally `<n>S`, in that order. If `T` is present, at least one of `H`, `M`, `S` must follow it.
- At least one component (`W`, `D`, `H`, `M` or `S`) must appear in total.

Each `<n>` is one or more ASCII digits `0`-`9` (no other Unicode digits), leading zeros allowed, no sign, no decimal point. Each designator may appear at most once and only in its own part and position: `M` means minutes and is valid only after `T`; years (`Y`) and months are not supported and make the input invalid. Letters are case-sensitive.

Units: `W` = 604800 seconds, `D` = 86400, `H` = 3600, `M` = 60, `S` = 1. Values are not range-limited (`PT90M` is valid). A negative zero total is returned as `0`.

## Examples

- `solve("P1DT2H") == 93600`
- `solve("-PT90M") == -5400`
- `solve("PT") is None`
