# normalize path

Difficulty: hard

Write `solve(path: str) -> str`.

Normalize a nonempty POSIX path. Collapse repeated slashes and '.' segments. '..' removes a preceding ordinary segment; leading '..' remain in relative paths but cannot move above root in absolute paths. Remove trailing slashes except for root. Return '.' if a relative path normalizes to empty.

Examples:
- `solve('/a//b/../') == '/a'`
- `solve('a/../../b') == '../b'`
