def solve(value: int) -> str:
    if value == 0:
        return "0"

    digits = []
    while value:
        value, remainder = divmod(value, 3)
        if remainder == 2:
            remainder = -1
            value += 1
        digits.append("T" if remainder == -1 else str(remainder))
    return "".join(reversed(digits))
