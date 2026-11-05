from functools import lru_cache


def solve(n: int, edges: list[tuple[int, int]]) -> list[int] | None:
    if not edges:
        return [0] if n else []
    full = (1 << len(edges)) - 1

    @lru_cache(None)
    def trail(vertex: int, used: int) -> tuple[int, ...] | None:
        if used == full:
            return (vertex,)
        choices = []
        for index, (left, right) in enumerate(edges):
            if used & (1 << index):
                continue
            if left == vertex or right == vertex:
                neighbor = right if left == vertex else left
                suffix = trail(neighbor, used | (1 << index))
                if suffix is not None:
                    choices.append((vertex,) + suffix)
        return min(choices) if choices else None

    candidates = [trail(start, 0) for start in range(n)]
    valid = [candidate for candidate in candidates if candidate is not None]
    return list(min(valid)) if valid else None
