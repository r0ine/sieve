from fractions import Fraction


def half_up(value: Fraction) -> int:
    return (value.numerator * 2 + value.denominator) // (value.denominator * 2)


def solve(principal: int, rate_bp: int, months: int) -> list[tuple[int, int, int]]:
    rate = Fraction(rate_bp, 120000)
    if rate:
        payment = half_up(principal * rate / (1 - (1 + rate) ** -months))
    else:
        payment = half_up(Fraction(principal, months))

    rows = []
    balance = principal
    for month in range(1, months + 1):
        interest = half_up(balance * rate)
        if month == months or payment >= balance + interest:
            rows.append((balance + interest, interest, 0))
            break
        balance += interest - payment
        rows.append((payment, interest, balance))
    return rows
