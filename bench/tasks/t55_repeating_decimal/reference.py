def solve(numerator: int, denominator: int) -> str:
    if numerator == 0:
        return "0"

    sign = "-" if numerator < 0 else ""
    whole, remainder = divmod(abs(numerator), denominator)
    if remainder == 0:
        return sign + str(whole)

    digits = []
    seen = {}
    while remainder and remainder not in seen:
        seen[remainder] = len(digits)
        digit, remainder = divmod(remainder * 10, denominator)
        digits.append(str(digit))

    if remainder:
        start = seen[remainder]
        fraction = "".join(digits[:start]) + "(" + "".join(digits[start:]) + ")"
    else:
        fraction = "".join(digits)
    return sign + str(whole) + "." + fraction
