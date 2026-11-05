from math import gcd


def solve(congruences: list[list[int]]) -> list[int] | None:
    remainder, modulus = 0, 1
    for target, target_modulus in congruences:
        common = gcd(modulus, target_modulus)
        difference = target - remainder
        if difference % common:
            return None

        reduced = target_modulus // common
        inverse = pow(modulus // common, -1, reduced) if reduced > 1 else 0
        steps = (difference // common * inverse) % reduced
        remainder = (remainder + modulus * steps) % (modulus * reduced)
        modulus *= reduced
    return [remainder, modulus]
