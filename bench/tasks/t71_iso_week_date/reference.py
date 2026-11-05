from datetime import date


def solve(year: int, week: int, weekday: int) -> str | None:
    try:
        return date.fromisocalendar(year, week, weekday).isoformat()
    except ValueError:
        return None
