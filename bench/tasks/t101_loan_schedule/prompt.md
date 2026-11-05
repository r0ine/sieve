# loan_schedule
Difficulty: hard

Implement `solve(principal: int, rate_bp: int, months: int) -> list[tuple[int, int, int]]`.

Build a monthly amortization schedule. `principal >= 1` is in cents, `rate_bp >= 0` is the annual interest rate in basis points (525 means 5.25%), and `months >= 1`. All arithmetic must be exact (use rationals or integers, not floating point). `round(x)` below means rounding a nonnegative value to the nearest integer cent with halves rounded up (2.5 -> 3).

- Monthly rate `r = rate_bp / 120000`.
- Scheduled payment `P = round(principal * r / (1 - (1 + r) ** -months))` when `r > 0`, and `P = round(principal / months)` when `r == 0`.
- Start with `balance = principal`. For each month in order: `interest = round(balance * r)`. If this is the final month (month number `months`), or if `P >= balance + interest`, the payment is exactly `balance + interest`, the balance becomes 0 and the schedule ends. Otherwise the payment is `P` and the balance becomes `balance + interest - P`.

Return one tuple `(payment, interest, balance_after)` per month actually paid, in order. The schedule may end before `months` rows.

## Examples

- `solve(1000, 0, 3) == [(333, 0, 667), (333, 0, 334), (334, 0, 0)]`
- `solve(100000, 1200, 2) == [(50751, 1000, 50249), (50751, 502, 0)]`
- `solve(2, 0, 3) == [(1, 0, 1), (1, 0, 0)]`
