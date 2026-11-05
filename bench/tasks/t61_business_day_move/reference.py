from datetime import date as Date, timedelta


def solve(date: str, days: int, holidays: list[str]) -> str:
    current = Date.fromisoformat(date)
    if days == 0:
        return current.isoformat()

    closed = {Date.fromisoformat(item) for item in holidays}
    step = timedelta(days=1 if days > 0 else -1)
    remaining = abs(days)
    while remaining:
        current += step
        if current.weekday() < 5 and current not in closed:
            remaining -= 1
    return current.isoformat()
