import unicodedata


def _key(word: str) -> str:
    decomposed = unicodedata.normalize("NFKD", word)
    unmarked = "".join(
        character for character in decomposed
        if unicodedata.category(character) != "Mn"
    )
    return " ".join(unmarked.casefold().split())


def solve(words: list[str]) -> list[list[str]]:
    groups = []
    positions = {}
    for word in words:
        key = _key(word)
        if key not in positions:
            positions[key] = len(groups)
            groups.append([])
        groups[positions[key]].append(word)
    return groups
