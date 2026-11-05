from math import gcd


def solve(low_n: int, low_d: int, high_n: int, high_d: int, max_d: int) -> int:
    def ceil_div(numerator: int, denominator: int) -> int:
        return -(-numerator // denominator)

    count = 0
    for denominator in range(1, max_d + 1):
        first = ceil_div(low_n * denominator, low_d)
        stop = ceil_div(high_n * denominator, high_d)
        count += sum(gcd(abs(numerator), denominator) == 1
                     for numerator in range(first, stop))
    return count
