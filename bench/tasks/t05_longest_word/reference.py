def solve(text: str) -> str:
    words = text.split()
    return max(words, key=len, default="")
