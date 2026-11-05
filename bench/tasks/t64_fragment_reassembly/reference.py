def solve(length: int, fragments: list[list]) -> str | None:
    cells = [None] * length
    for offset, text in fragments:
        for index, character in enumerate(text):
            position = offset + index
            previous = cells[position]
            if previous is not None and previous != character:
                return None
            cells[position] = character
    return "".join(cells) if all(cell is not None for cell in cells) else None
