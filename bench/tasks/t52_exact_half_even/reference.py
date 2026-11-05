def solve(value: str, places: int) -> str:
    negative = value.startswith("-")
    unsigned = value.lstrip("+-")
    whole, dot, fraction = unsigned.partition(".")
    magnitude = int(whole + fraction)
    shift = len(fraction) - places

    if shift > 0:
        quotient, remainder = divmod(magnitude, 10 ** shift)
        twice = 2 * remainder
        divisor = 10 ** shift
        if twice > divisor or (twice == divisor and quotient % 2):
            quotient += 1
    else:
        quotient = magnitude * 10 ** -shift

    if places >= 0:
        digits = str(quotient).zfill(places + 1)
        result = digits if places == 0 else digits[:-places] + "." + digits[-places:]
    else:
        result = str(quotient * 10 ** -places)
    return "-" + result if negative and quotient else result
