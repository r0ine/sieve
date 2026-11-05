def solve(candidates: list[str], ballots: list[list[str]]) -> str | None:
    remaining = set(candidates)
    while remaining:
        if len(remaining) == 1:
            return next(iter(remaining))
        counts = {name: 0 for name in remaining}
        for ballot in ballots:
            for name in ballot:
                if name in remaining:
                    counts[name] += 1
                    break
        active = sum(counts.values())
        if active == 0:
            return min(remaining)
        for name, votes in counts.items():
            if votes * 2 > active:
                return name
        lowest = min(counts.values())
        remaining.remove(max(name for name, votes in counts.items() if votes == lowest))
    return None
