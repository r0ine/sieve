# business_day_move
Difficulty: hard

Implement `solve(date: str, days: int, holidays: list[str]) -> str`.

Dates use valid Gregorian `YYYY-MM-DD` strings in years 0001 through 9999. A business day is Monday through Friday and is absent from the holiday list. Move `abs(days)` business days forward if `days > 0`, or backward if `days < 0`. The starting date is never counted, even when it is a business day. For `days == 0`, return the starting date unchanged, even if it is a weekend or holiday. Duplicate holidays have no extra effect; holidays on weekends are harmless. The result is guaranteed to stay within the supported year range. Return `YYYY-MM-DD`.

## Examples

- `solve("2024-04-05", 1, []) == "2024-04-08"`
- `solve("2024-04-01", 1, ["2024-04-02"]) == "2024-04-03"`
- `solve("2024-04-06", 0, []) == "2024-04-06"`
