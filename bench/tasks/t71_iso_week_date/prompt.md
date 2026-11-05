# iso_week_date
Difficulty: hard

Implement `solve(year: int, week: int, weekday: int) -> str | None`.

Interpret the three integers as an ISO 8601 week date in the proleptic Gregorian calendar. ISO weekdays are Monday = 1 through Sunday = 7. Week 1 is the week containing January 4, and ISO weeks begin on Monday. An ISO year has 52 or 53 weeks depending on the calendar. Return its Gregorian date in `YYYY-MM-DD` form, or `None` if the ISO year is outside 1 through 9999, the week or weekday is invalid, or the resulting Gregorian date is outside that year range. Never silently wrap an invalid week into another ISO year.

## Examples

- `solve(2025, 1, 1) == "2024-12-30"`
- `solve(2020, 53, 7) == "2021-01-03"`
- `solve(2021, 53, 1) is None`
