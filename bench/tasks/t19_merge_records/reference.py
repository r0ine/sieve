def solve(records: list[tuple[str, int]]) -> list[tuple[str, int]]:
    totals = {}
    for key, amount in records:
        totals[key] = totals.get(key, 0) + amount
    return list(totals.items())
