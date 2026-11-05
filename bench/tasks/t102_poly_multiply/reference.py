import re

TERM = re.compile(r"([+-]?)([0-9]*)(x(?:\^([0-9]+))?)?")


def parse(text: str) -> dict[int, int]:
    text = text.replace(" ", "")
    poly: dict[int, int] = {}
    for chunk in re.findall(r"[+-]?[^+-]+", text):
        sign, coeff, var, power = TERM.fullmatch(chunk).groups()
        value = int(coeff) if coeff else 1
        exponent = (int(power) if power else 1) if var else 0
        if sign == "-":
            value = -value
        poly[exponent] = poly.get(exponent, 0) + value
    return poly


def solve(a: str, b: str) -> str:
    left, right = parse(a), parse(b)
    product: dict[int, int] = {}
    for e1, c1 in left.items():
        for e2, c2 in right.items():
            product[e1 + e2] = product.get(e1 + e2, 0) + c1 * c2

    parts = []
    for exponent in sorted((e for e, c in product.items() if c), reverse=True):
        coeff = product[exponent]
        size = abs(coeff)
        if exponent == 0:
            body = str(size)
        else:
            body = ("" if size == 1 else str(size)) + ("x" if exponent == 1 else f"x^{exponent}")
        if not parts:
            parts.append(("-" if coeff < 0 else "") + body)
        else:
            parts.append((" - " if coeff < 0 else " + ") + body)
    return "".join(parts) or "0"
