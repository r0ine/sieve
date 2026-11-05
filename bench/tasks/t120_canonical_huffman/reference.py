import heapq


def solve(frequencies: dict[str, int]) -> dict[str, str]:
    if not frequencies:
        return {}
    heap = [(weight, symbol, symbol) for symbol, weight in frequencies.items()]
    heapq.heapify(heap)
    if len(heap) == 1:
        return {heap[0][1]: '0'}
    while len(heap) > 1:
        first_weight, first_symbol, first_node = heapq.heappop(heap)
        second_weight, second_symbol, second_node = heapq.heappop(heap)
        heapq.heappush(heap, (first_weight + second_weight,
                              min(first_symbol, second_symbol),
                              (first_node, second_node)))
    lengths = {}

    def visit(node: str | tuple, depth: int) -> None:
        if isinstance(node, str):
            lengths[node] = depth
        else:
            visit(node[0], depth + 1)
            visit(node[1], depth + 1)

    visit(heap[0][2], 0)
    ordered = sorted(lengths, key=lambda symbol: (lengths[symbol], symbol))
    codes = {}
    code = 0
    previous_length = lengths[ordered[0]]
    for symbol in ordered:
        length = lengths[symbol]
        code <<= length - previous_length
        codes[symbol] = f'{code:0{length}b}'
        code += 1
        previous_length = length
    return codes
