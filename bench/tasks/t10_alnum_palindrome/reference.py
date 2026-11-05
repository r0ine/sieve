def solve(text: str) -> bool:
    cleaned = "".join(char.casefold() for char in text if char.isalnum())
    return cleaned == cleaned[::-1]
