from fractions import Fraction


def operand(token: str) -> Fraction:
    negative = token.startswith("-")
    token = token.lstrip("-")
    whole, _, rest = token.rpartition("_")
    if "/" in rest:
        top, bottom = rest.split("/")
        value = Fraction(int(top), int(bottom))
    else:
        value = Fraction(int(rest))
    if whole:
        value += int(whole)
    return -value if negative else value


def render(value: Fraction) -> str:
    if value.denominator == 1:
        return str(value.numerator)
    sign = "-" if value < 0 else ""
    whole, top = divmod(abs(value.numerator), value.denominator)
    fraction = f"{top}/{value.denominator}"
    return f"{sign}{whole}_{fraction}" if whole else f"{sign}{fraction}"


def solve(expression: str) -> str:
    tokens = expression.split()
    terms = [operand(tokens[0])]
    signs = []
    for op, token in zip(tokens[1::2], tokens[2::2]):
        value = operand(token)
        if op == "*":
            terms[-1] *= value
        elif op == "/":
            if value == 0:
                return "undefined"
            terms[-1] /= value
        else:
            signs.append(op)
            terms.append(value)
    total = terms[0]
    for op, value in zip(signs, terms[1:]):
        total = total + value if op == "+" else total - value
    return render(total)
