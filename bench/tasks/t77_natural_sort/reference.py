import re

RUN = re.compile(r"[0-9]+|[^0-9]+")


def _key(text):
    runs = RUN.findall(text)
    primary = []
    widths = []
    for run in runs:
        if run[0].isdigit():
            primary.append((0, int(run), ""))
            widths.append(len(run))
        else:
            lowered = "".join(chr(ord(c) + 32) if "A" <= c <= "Z" else c for c in run)
            primary.append((1, 0, lowered))
    return primary, widths, text


def solve(items: list[str]) -> list[str]:
    return sorted(items, key=_key)
