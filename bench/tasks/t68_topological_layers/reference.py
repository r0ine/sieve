def solve(nodes: list[str], edges: list[list[str]]) -> list[list[str]] | None:
    outgoing = {node: [] for node in nodes}
    indegree = {node: 0 for node in nodes}
    for source, destination in edges:
        outgoing[source].append(destination)
        indegree[destination] += 1

    remaining = set(nodes)
    layers = []
    while remaining:
        layer = sorted(node for node in remaining if indegree[node] == 0)
        if not layer:
            return None
        layers.append(layer)
        for node in layer:
            remaining.remove(node)
        for node in layer:
            for destination in outgoing[node]:
                indegree[destination] -= 1
    return layers
