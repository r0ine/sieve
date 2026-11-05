# nth weekday

Difficulty: hard

Write `solve(year: int, month: int, weekday: int, occurrence: int) -> str | None`.

Find a weekday in a proleptic Gregorian month. `year` is in 1..9999, `month` in 1..12, and `weekday` uses Monday=0 through Sunday=6. `occurrence` is a nonzero integer: positive values count from the first day of the month, negative values count backward from its last day. Return the date as `YYYY-MM-DD`, or `None` if that occurrence does not exist. Leap years are divisible by 4, except centuries not divisible by 400. No date outside the given month is eligible.

Examples:
- `solve(2024, 2, 3, -1) == '2024-02-29'`
- `solve(2023, 2, 0, 5) is None`
- `solve(2000, 1, 5, 1) == '2000-01-01'`
