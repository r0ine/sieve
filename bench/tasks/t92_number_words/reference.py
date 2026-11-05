SMALL = (
    "zero one two three four five six seven eight nine ten eleven twelve thirteen "
    "fourteen fifteen sixteen seventeen eighteen nineteen"
).split()
TENS = "_ _ twenty thirty forty fifty sixty seventy eighty ninety".split()
SCALES = ("", "thousand", "million", "billion", "trillion")


def below_thousand(n: int) -> list[str]:
    words = []
    hundreds, rest = divmod(n, 100)
    if hundreds:
        words += [SMALL[hundreds], "hundred"]
    if rest >= 20:
        tens, unit = divmod(rest, 10)
        words.append(TENS[tens] + (f"-{SMALL[unit]}" if unit else ""))
    elif rest:
        words.append(SMALL[rest])
    return words


def solve(n: int) -> str:
    if n == 0:
        return "zero"
    if n < 0:
        return "minus " + solve(-n)
    words = []
    for scale in SCALES:
        n, group = divmod(n, 1000)
        if group:
            words = below_thousand(group) + ([scale] if scale else []) + words
        if not n:
            break
    return " ".join(words)
