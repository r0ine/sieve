from collections import defaultdict
from heapq import heappop, heappush


def solve(edges: list[list], start: str, end: str) -> list | None:
    if start == end:
        return [0, [start]]

    outgoing = defaultdict(list)
    for source, destination, weight in edges:
        outgoing[source].append((destination, weight))

    initial = (0, 0, (start,))
    best = {start: initial}
    heap = [(0, 0, (start,), start)]
    while heap:
        cost, hops, path, node = heappop(heap)
        if (cost, hops, path) != best[node]:
            continue
        if node == end:
            return [cost, list(path)]
        for neighbor, weight in outgoing[node]:
            candidate = (cost + weight, hops + 1, path + (neighbor,))
            if neighbor not in best or candidate < best[neighbor]:
                best[neighbor] = candidate
                heappush(heap, (*candidate, neighbor))
    return None
