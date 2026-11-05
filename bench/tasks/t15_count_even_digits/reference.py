def solve(n: int) -> int:
    return sum(int(digit) % 2 == 0 for digit in str(abs(n)))
