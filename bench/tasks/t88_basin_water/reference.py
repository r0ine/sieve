import heapq


def solve(heights: list[list[int]]) -> int:
    if not heights or not heights[0]:
        return 0
    rows, cols = len(heights), len(heights[0])
    seen = [[False] * cols for _ in range(rows)]
    heap = []
    for r in range(rows):
        for c in range(cols):
            if r in (0, rows - 1) or c in (0, cols - 1):
                heapq.heappush(heap, (heights[r][c], r, c))
                seen[r][c] = True
    total = 0
    while heap:
        level, r, c = heapq.heappop(heap)
        for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
            if 0 <= nr < rows and 0 <= nc < cols and not seen[nr][nc]:
                seen[nr][nc] = True
                h = heights[nr][nc]
                total += max(0, level - h)
                heapq.heappush(heap, (max(level, h), nr, nc))
    return total
