def solve(prices: dict[str, int], stock: dict[str, int], coins: dict[int, int], events: list[tuple]) -> list[str]:
    bank = dict(coins)
    left = dict(stock)
    credit = 0
    out = []

    def pay(amount: int) -> list[int] | None:
        paid = []
        for coin in sorted(bank, reverse=True):
            take = min(amount // coin, bank[coin])
            paid += [coin] * take
            amount -= coin * take
        return paid if amount == 0 else None

    for event in events:
        kind = event[0]
        if kind == "insert":
            coin = event[1]
            if coin in bank:
                bank[coin] += 1
                credit += coin
                out.append(f"credit {credit}")
            else:
                out.append(f"reject {coin}")
        elif kind == "select":
            name = event[1]
            if name not in prices:
                out.append(f"unknown {name}")
            elif left[name] == 0:
                out.append(f"sold out {name}")
            elif credit < prices[name]:
                out.append(f"need {prices[name] - credit}")
            else:
                change = pay(credit - prices[name])
                if change is None:
                    out.append("no change")
                    continue
                for coin in change:
                    bank[coin] -= 1
                left[name] -= 1
                credit = 0
                text = f"vend {name}"
                if change:
                    text += " change " + ",".join(map(str, change))
                out.append(text)
        else:
            if credit == 0:
                out.append("idle")
                continue
            back = pay(credit)
            if back is None:
                out.append("no change")
                continue
            for coin in back:
                bank[coin] -= 1
            credit = 0
            out.append("return " + ",".join(map(str, back)))
    return out
