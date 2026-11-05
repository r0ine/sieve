def solve(people: list[tuple[str, int]]) -> list[tuple[str, int]]:
    return sorted(people, key=lambda person: (person[1], person[0].casefold()))
