from datetime import datetime, timedelta

BOUNDS = ((0, 59), (0, 23), (1, 31), (1, 12), (0, 7))


def expand(field: str, low: int, high: int) -> set[int]:
    values = set()
    for item in field.split(","):
        base, _, step = item.partition("/")
        if base == "*":
            first, last = low, high
        elif "-" in base:
            first, last = map(int, base.split("-"))
        else:
            first = int(base)
            last = high if step else first
        values.update(range(first, last + 1, int(step) if step else 1))
    return values


def solve(expr: str, start: str) -> str:
    fields = expr.split()
    minutes, hours, mdays, months, wdays = (expand(f, *b) for f, b in zip(fields, BOUNDS))
    if 7 in wdays:
        wdays.add(0)
    either = not fields[2].startswith("*") and not fields[4].startswith("*")

    moment = datetime.strptime(start, "%Y-%m-%d %H:%M") + timedelta(minutes=1)
    day = moment.date()
    for _ in range(366 * 9):
        if day.month in months:
            dom = day.day in mdays
            dow = (day.weekday() + 1) % 7 in wdays
            if (dom or dow) if either else (dom and dow):
                first_hour = moment.hour if day == moment.date() else 0
                for hour in sorted(h for h in hours if h >= first_hour):
                    first_minute = moment.minute if day == moment.date() and hour == moment.hour else 0
                    for minute in sorted(m for m in minutes if m >= first_minute):
                        return f"{day.isoformat()} {hour:02d}:{minute:02d}"
        day += timedelta(days=1)
    raise ValueError("no match")
