from math import isqrt


def solve(n: int, places: int) -> str:
    root = isqrt(n * 10 ** (2 * places))
    if not places:
        return str(root)
    head, tail = divmod(root, 10 ** places)
    return f"{head}.{tail:0{places}d}"
