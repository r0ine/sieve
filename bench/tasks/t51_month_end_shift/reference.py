from calendar import monthrange


def solve(date: str, months: int) -> str:
    year, month, day = map(int, date.split("-"))
    source_end = day == monthrange(year, month)[1]
    target_month = year * 12 + month - 1 + months
    target_year, month_index = divmod(target_month, 12)
    target_year_month = month_index + 1
    last_day = monthrange(target_year, target_year_month)[1]
    target_day = last_day if source_end else min(day, last_day)
    return f"{target_year:04d}-{target_year_month:02d}-{target_day:02d}"
