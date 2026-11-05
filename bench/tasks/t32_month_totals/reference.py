def solve(records: list[tuple[str, int]]) -> list[tuple[str, int]]:
    totals = {}
    for date, amount in records:
        month = date[:7]
        totals[month] = totals.get(month, 0) + amount
    return sorted(totals.items())
