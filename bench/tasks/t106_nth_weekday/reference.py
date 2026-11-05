from datetime import date
from calendar import monthrange


def solve(year: int, month: int, weekday: int, occurrence: int) -> str | None:
    days = monthrange(year, month)[1]
    if occurrence > 0:
        first = 1 + (weekday - date(year, month, 1).weekday()) % 7
        day = first + 7 * (occurrence - 1)
    else:
        last = days - (date(year, month, days).weekday() - weekday) % 7
        day = last + 7 * (occurrence + 1)
    return f'{year:04d}-{month:02d}-{day:02d}' if 1 <= day <= days else None
