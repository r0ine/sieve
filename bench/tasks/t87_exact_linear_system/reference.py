from fractions import Fraction


def solve(a: list[list[int]], b: list[int]) -> list[tuple[int, int]] | str:
    rows = [[Fraction(v) for v in row] + [Fraction(rhs)] for row, rhs in zip(a, b)]
    m, n = len(rows), len(a[0])
    pivots = []
    r = 0
    for c in range(n):
        pivot = next((i for i in range(r, m) if rows[i][c] != 0), None)
        if pivot is None:
            continue
        rows[r], rows[pivot] = rows[pivot], rows[r]
        lead = rows[r][c]
        rows[r] = [v / lead for v in rows[r]]
        for i in range(m):
            if i != r and rows[i][c] != 0:
                factor = rows[i][c]
                rows[i] = [x - factor * y for x, y in zip(rows[i], rows[r])]
        pivots.append(c)
        r += 1
        if r == m:
            break

    if any(all(v == 0 for v in row[:n]) and row[n] != 0 for row in rows):
        return "none"
    if len(pivots) < n:
        return "many"
    solution = [Fraction(0)] * n
    for i, c in enumerate(pivots):
        solution[c] = rows[i][n]
    return [(f.numerator, f.denominator) for f in solution]
