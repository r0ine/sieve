from functools import cmp_to_key


def _parts(version: str):
    public = version.split("+", 1)[0]
    core, separator, prerelease = public.partition("-")
    numbers = tuple(map(int, core.split(".")))
    identifiers = prerelease.split(".") if separator else None
    return numbers, identifiers


def _compare(left: str, right: str) -> int:
    left_core, left_pre = _parts(left)
    right_core, right_pre = _parts(right)
    if left_core != right_core:
        return (left_core > right_core) - (left_core < right_core)
    if left_pre is None or right_pre is None:
        return (left_pre is None) - (right_pre is None)
    for first, second in zip(left_pre, right_pre):
        first_numeric, second_numeric = first.isdigit(), second.isdigit()
        if first_numeric != second_numeric:
            return -1 if first_numeric else 1
        a, b = (int(first), int(second)) if first_numeric else (first, second)
        if a != b:
            return (a > b) - (a < b)
    return (len(left_pre) > len(right_pre)) - (len(left_pre) < len(right_pre))


def solve(versions: list[str]) -> list[str]:
    return sorted(versions, key=cmp_to_key(_compare))
