import re


def solve(text: str) -> list[str]:
    return re.findall(r"[A-Za-z]+", text)
