# month_end_shift
Difficulty: hard

Implement `solve(date: str, months: int) -> str`.

The input date is a valid Gregorian date in `YYYY-MM-DD` form, with a year from 0001 through 9999. Move it by `months` calendar months; negative values move backward. The resulting year is guaranteed to remain in that range.

If the input day is the last day of its month, return the last day of the destination month. Otherwise, keep the input day when possible, or clamp it to the destination month's last day. A zero move returns the original date. Use Gregorian leap-year rules, including century exceptions. Return exactly `YYYY-MM-DD`.

## Examples

- `solve("2024-01-31", 1) == "2024-02-29"`
- `solve("2023-04-30", 1) == "2023-05-31"`
- `solve("2024-02-28", 12) == "2025-02-28"`
