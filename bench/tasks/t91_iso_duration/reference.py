import re

PATTERN = re.compile(
    r"([+-]?)P(?:([0-9]+)W)?(?:([0-9]+)D)?(T(?:([0-9]+)H)?(?:([0-9]+)M)?(?:([0-9]+)S)?)?"
)
UNITS = (604800, 86400, None, 3600, 60, 1)


def solve(text: str) -> int | None:
    match = PATTERN.fullmatch(text)
    if not match:
        return None
    sign, *parts = match.groups()
    weeks, days, time_part, hours, minutes, seconds = parts
    if time_part is not None and hours is None and minutes is None and seconds is None:
        return None
    if all(p is None for p in (weeks, days, hours, minutes, seconds)):
        return None
    total = 0
    for value, unit in zip(parts, UNITS):
        if unit is not None and value is not None:
            total += int(value) * unit
    return -total if sign == "-" else total
