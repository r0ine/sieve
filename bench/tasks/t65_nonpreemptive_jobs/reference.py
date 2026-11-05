from heapq import heappop, heappush


def solve(jobs: list[list[int]]) -> list[list[int]]:
    pending = sorted((release, index, duration, priority)
                     for index, (release, duration, priority) in enumerate(jobs))
    ready = []
    answer = []
    time = 0
    position = 0
    while len(answer) < len(jobs):
        if not ready and position < len(pending):
            time = max(time, pending[position][0])
        while position < len(pending) and pending[position][0] <= time:
            release, index, duration, priority = pending[position]
            heappush(ready, (priority, release, index, duration))
            position += 1
        _, _, index, duration = heappop(ready)
        time += duration
        answer.append([index, time])
    return answer
