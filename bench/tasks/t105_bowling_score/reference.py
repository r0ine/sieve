def solve(rolls: list[int]) -> int | None:
    if any(r < 0 or r > 10 for r in rolls):
        return None
    total = 0
    i = 0
    for _ in range(9):
        if i >= len(rolls):
            return None
        if rolls[i] == 10:
            if i + 2 >= len(rolls):
                return None
            total += 10 + rolls[i + 1] + rolls[i + 2]
            i += 1
            continue
        if i + 1 >= len(rolls) or rolls[i] + rolls[i + 1] > 10:
            return None
        frame = rolls[i] + rolls[i + 1]
        if frame == 10:
            if i + 2 >= len(rolls):
                return None
            total += rolls[i + 2]
        total += frame
        i += 2

    last = rolls[i:]
    if len(last) < 2:
        return None
    first, second = last[0], last[1]
    if first == 10:
        if len(last) != 3:
            return None
        if second != 10 and second + last[2] > 10:
            return None
    elif first + second == 10:
        if len(last) != 3:
            return None
    elif first + second > 10 or len(last) != 2:
        return None
    return total + sum(last)
