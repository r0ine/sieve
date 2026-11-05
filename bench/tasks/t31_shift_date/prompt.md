# shift date

Difficulty: medium

Write `solve(date: str, days: int) -> str`.

date is a valid YYYY-MM-DD Gregorian date. Add signed whole days and return YYYY-MM-DD. The resulting year is guaranteed between 0001 and 9999. Leap years follow the Gregorian calendar.

Examples:
- `solve('2024-02-28', 1) == '2024-02-29'`
- `solve('2023-01-01', -1) == '2022-12-31'`
