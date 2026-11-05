from fractions import Fraction

DIGITS = "0123456789abcdefghijklmnopqrstuvwxyz"


def solve(text: str, src: int, dst: int, places: int) -> str:
    negative = text.startswith("-")
    body = text[1:] if negative else text
    whole, _, frac = body.lower().partition(".")
    value = Fraction(0)
    for ch in whole:
        value = value * src + DIGITS.index(ch)
    scale = Fraction(1)
    for ch in frac:
        scale /= src
        value += DIGITS.index(ch) * scale

    scaled = value.numerator * dst ** places // value.denominator
    head, tail = divmod(scaled, dst ** places)

    def digits(n, width):
        out = []
        while n:
            n, r = divmod(n, dst)
            out.append(DIGITS[r])
        return "".join(reversed(out)).rjust(width, "0")

    result = digits(head, 1)
    if places:
        result += "." + digits(tail, places)
    if negative and scaled:
        result = "-" + result
    return result
