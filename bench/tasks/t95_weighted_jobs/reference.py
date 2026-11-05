def solve(jobs: list[tuple[int, int, int]]) -> list[int]:
    n = len(jobs)
    clash = [0] * n
    for i, (s1, e1, _) in enumerate(jobs):
        for j, (s2, e2, _) in enumerate(jobs):
            if i != j and s1 < e2 and s2 < e1:
                clash[i] |= 1 << j

    best_key, best = None, []
    for mask in range(1 << n):
        picked = [i for i in range(n) if mask >> i & 1]
        if any(clash[i] & mask for i in picked):
            continue
        key = (-sum(jobs[i][2] for i in picked), len(picked), picked)
        if best_key is None or key < best_key:
            best_key, best = key, picked
    return best
