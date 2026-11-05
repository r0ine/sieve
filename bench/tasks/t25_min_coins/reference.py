def solve(amount: int, coins: list[int]) -> int:
    best = [amount + 1] * (amount + 1)
    best[0] = 0
    for value in range(1, amount + 1):
        for coin in coins:
            if coin <= value:
                best[value] = min(best[value], best[value - coin] + 1)
    return best[amount] if best[amount] <= amount else -1
