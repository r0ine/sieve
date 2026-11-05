SYMBOLS = (
    (1000, "M"), (900, "CM"), (500, "D"), (400, "CD"),
    (100, "C"), (90, "XC"), (50, "L"), (40, "XL"),
    (10, "X"), (9, "IX"), (5, "V"), (4, "IV"), (1, "I"),
)
VALUES = {"I": 1, "V": 5, "X": 10, "L": 50, "C": 100, "D": 500, "M": 1000}


def _encode(number: int) -> str:
    parts = []
    for value, symbol in SYMBOLS:
        count, number = divmod(number, value)
        parts.append(symbol * count)
    return "".join(parts)


def solve(numeral: str) -> int | None:
    if not numeral or any(char not in VALUES for char in numeral):
        return None

    total = 0
    for index, char in enumerate(numeral):
        value = VALUES[char]
        if index + 1 < len(numeral) and value < VALUES[numeral[index + 1]]:
            total -= value
        else:
            total += value
    return total if 1 <= total <= 3999 and _encode(total) == numeral else None
