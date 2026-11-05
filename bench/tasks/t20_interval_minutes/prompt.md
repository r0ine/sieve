# interval minutes

Difficulty: medium

Write `solve(start: str, end: str) -> int`.

Both strings are valid 24-hour HH:MM times. Return forward elapsed minutes from start to end; if end is earlier, it occurs the next day. Equal times mean zero minutes, not 24 hours.

Examples:
- `solve('23:50', '00:10') == 20`
- `solve('12:00', '12:00') == 0`
