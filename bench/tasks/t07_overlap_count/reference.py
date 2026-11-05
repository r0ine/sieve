def solve(text: str, needle: str) -> int:
    if not needle:
        return len(text) + 1
    return sum(text.startswith(needle, index) for index in range(len(text) - len(needle) + 1))
