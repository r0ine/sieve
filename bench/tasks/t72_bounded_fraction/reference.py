def solve(numerator: int, denominator: int, max_denominator: int) -> list[int]:
    best = None
    for candidate_denominator in range(1, max_denominator + 1):
        floor = numerator * candidate_denominator // denominator
        for candidate_numerator in (floor, floor + 1):
            error = abs(candidate_numerator * denominator - numerator * candidate_denominator)
            candidate = (error, candidate_denominator, candidate_numerator)
            if best is None:
                best = candidate
                continue
            previous_error, previous_denominator, previous_numerator = best
            comparison = error * previous_denominator - previous_error * candidate_denominator
            if comparison < 0 or (
                comparison == 0
                and (candidate_denominator, candidate_numerator)
                < (previous_denominator, previous_numerator)
            ):
                best = candidate
    return [best[2], best[1]]
