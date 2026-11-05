from functools import lru_cache


def solve(text: str) -> tuple[int, list[str]]:
    @lru_cache(None)
    def partition(start: int) -> tuple[str, ...]:
        if start == len(text):
            return ()
        choices = []
        for end in range(start + 1, len(text) + 1):
            piece = text[start:end]
            if piece == piece[::-1]:
                choices.append((piece,) + partition(end))
        return min(choices, key=lambda pieces: (len(pieces), pieces))

    pieces = partition(0)
    return len(pieces), list(pieces)
