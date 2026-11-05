import re

CELL = re.compile(r"\$?([A-Za-z]+)\$?([0-9]+)")


def column_number(letters: str) -> int:
    number = 0
    for ch in letters.upper():
        number = number * 26 + ord(ch) - 64
    return number


def column_letters(number: int) -> str:
    letters = []
    while number:
        number, rest = divmod(number - 1, 26)
        letters.append(chr(65 + rest))
    return "".join(reversed(letters))


def solve(spec: str) -> list[str]:
    corners = []
    for part in spec.split(":"):
        letters, row = CELL.fullmatch(part).groups()
        corners.append((column_number(letters), int(row)))
    if len(corners) == 1:
        corners.append(corners[0])
    (c1, r1), (c2, r2) = corners
    return [
        f"{column_letters(col)}{row}"
        for row in range(min(r1, r2), max(r1, r2) + 1)
        for col in range(min(c1, c2), max(c1, c2) + 1)
    ]
