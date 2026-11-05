def _upto(n, digit):
    if n < 0:
        return 0
    total = 1 if digit == 0 else 0
    place = 1
    while place <= n:
        high, rest = divmod(n, place * 10)
        current, low = divmod(rest, place)
        if digit:
            total += high * place
            if current > digit:
                total += place
            elif current == digit:
                total += low + 1
        elif high:
            total += (high - 1) * place
            total += place if current else low + 1
        place *= 10
    return total


def solve(lo: int, hi: int, digit: int) -> int:
    return _upto(hi, digit) - _upto(lo - 1, digit)
