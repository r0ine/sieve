def solve(text: str) -> list[tuple[str, int]]:
    runs = []
    for char in text:
        if runs and runs[-1][0] == char:
            previous, count = runs[-1]
            runs[-1] = (previous, count + 1)
        else:
            runs.append((char, 1))
    return runs
