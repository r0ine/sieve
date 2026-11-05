def solve(total: int, weights: list[int]) -> list[int]:
    if total == 0:
        return [0] * len(weights)

    magnitude = abs(total)
    weight_sum = sum(weights)
    shares = []
    remainders = []
    for weight in weights:
        base, remainder = divmod(magnitude * weight, weight_sum)
        shares.append(base)
        remainders.append(remainder)

    left = magnitude - sum(shares)
    order = sorted(range(len(weights)), key=lambda index: (-remainders[index], index))
    for index in order[:left]:
        shares[index] += 1
    return [-share for share in shares] if total < 0 else shares
