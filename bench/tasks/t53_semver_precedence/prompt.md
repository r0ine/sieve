# semver_precedence
Difficulty: hard

Implement `solve(versions: list[str]) -> list[str]`.

Return a new list sorted by SemVer 2.0 precedence, with equal-precedence entries kept in their original order. Each input is valid: its core is three nonnegative decimal integers without leading zeroes except `0`; an optional prerelease is a dot-separated nonempty sequence of ASCII letters, digits, and hyphens; numeric prerelease identifiers have no leading zeroes; an optional `+build` suffix contains dot-separated nonempty ASCII letters, digits, and hyphens. Build metadata never affects precedence.

Compare the three core numbers numerically. A release ranks above every prerelease with the same core. Compare prerelease identifiers left to right: numeric against numeric numerically, numeric below nonnumeric, nonnumeric against nonnumeric by ASCII code-point order. If all compared identifiers match, the shorter prerelease ranks lower. Return the original version strings.

## Examples

- `solve(["1.0.0", "1.0.0-rc.1", "1.0.0-beta"]) == ["1.0.0-beta", "1.0.0-rc.1", "1.0.0"]`
- `solve(["2.0.0+z", "2.0.0+a"]) == ["2.0.0+z", "2.0.0+a"]`
