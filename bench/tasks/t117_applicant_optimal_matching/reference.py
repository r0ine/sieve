from collections import deque


def solve(applicants: dict[str, list[str]], firms: dict[str, list[str]], capacities: dict[str, int]) -> list[tuple[str, str]]:
    ranks = {firm: {name: index for index, name in enumerate(order)}
             for firm, order in firms.items()}
    held = {firm: [] for firm in firms}
    next_choice = {name: 0 for name in applicants}
    free = deque(applicants)
    while free:
        applicant = free.popleft()
        choices = applicants[applicant]
        while next_choice[applicant] < len(choices):
            firm = choices[next_choice[applicant]]
            next_choice[applicant] += 1
            if applicant not in ranks[firm] or capacities[firm] == 0:
                continue
            waiting = held[firm]
            waiting.append(applicant)
            waiting.sort(key=ranks[firm].__getitem__)
            rejected = waiting.pop() if len(waiting) > capacities[firm] else None
            if rejected == applicant:
                continue
            if rejected is not None:
                free.append(rejected)
            break
    return sorted((applicant, firm) for firm, waiting in held.items() for applicant in waiting)
