from datetime import date as Date, timedelta


def solve(date: str, days: int) -> str:
    shifted = Date.fromisoformat(date) + timedelta(days=days)
    return shifted.isoformat()
