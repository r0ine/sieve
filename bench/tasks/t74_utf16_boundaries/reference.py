def solve(text: str, offsets: list[int]) -> list[int | None]:
    boundaries = {0: 0}
    units = 0
    for index, character in enumerate(text, 1):
        units += 2 if ord(character) > 0xFFFF else 1
        boundaries[units] = index
    return [boundaries.get(offset) for offset in offsets]
