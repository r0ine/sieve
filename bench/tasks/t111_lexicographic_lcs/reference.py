from functools import lru_cache


def solve(left: str, right: str) -> str:
    @lru_cache(None)
    def best(i: int, j: int) -> str:
        if i == len(left) or j == len(right):
            return ''
        choices = [best(i + 1, j), best(i, j + 1)]
        if left[i] == right[j]:
            choices.append(left[i] + best(i + 1, j + 1))
        return min(choices, key=lambda value: (-len(value), value))

    return best(0, 0)
