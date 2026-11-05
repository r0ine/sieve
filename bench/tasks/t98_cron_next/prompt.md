# cron_next
Difficulty: hard

Implement `solve(expr: str, start: str) -> str`.

`expr` is a five-field cron expression `minute hour day-of-month month day-of-week`, fields separated by one or more spaces. `start` is a time `YYYY-MM-DD HH:MM` in the proleptic Gregorian calendar. Return the earliest minute strictly after `start` that matches `expr`, in the same `YYYY-MM-DD HH:MM` format. A match is guaranteed to exist within the next 8 years.

Field ranges: minute 0-59, hour 0-23, day-of-month 1-31, month 1-12, day-of-week 0-7 where both 0 and 7 mean Sunday (1 = Monday ... 6 = Saturday).

Each field is a comma-separated list of items. An item is one of:

- `*`: every value in the field's range;
- `n`: the single value n;
- `a-b`: every value from a to b inclusive (`a <= b`);
- any of the above followed by `/s` with `s >= 1`: take the base set's values starting from its lowest value and keep every s-th one. `*/s` starts at the field minimum (for day-of-week, `*` covers 0-7 here). `n/s` means from n up to the field maximum, stepping by s.

All numbers are valid for their field. A day-of-month value that does not exist in a given month simply never matches in that month.

Day matching: a field is called a star field when its text begins with `*` (so `*/2` counts as a star field). If the day-of-month field or the day-of-week field is a star field, a date matches only when it satisfies both of them. If neither is a star field, a date matches when it satisfies at least one of them. The month field must always match.

## Examples

- `solve("30 9 * * *", "2024-01-01 09:30") == "2024-01-02 09:30"`
- `solve("0 0 13 * 5", "2024-01-05 00:00") == "2024-01-12 00:00"`
- `solve("*/15 * * * *", "2024-01-01 00:50") == "2024-01-01 01:00"`
