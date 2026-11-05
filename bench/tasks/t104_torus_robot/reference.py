import re

HEADINGS = "NESW"
STEPS = {"N": (0, 1), "E": (1, 0), "S": (0, -1), "W": (-1, 0)}


def solve(width: int, height: int, obstacles: list[tuple[int, int]], commands: str) -> tuple[int, int, str, int]:
    blocked = set(obstacles)
    x = y = 0
    facing = 0
    seen = {(0, 0)}
    for letter, digits in re.findall(r"([LRUFB])([0-9]*)", commands):
        if letter == "L":
            facing = (facing + 3) % 4
        elif letter == "R":
            facing = (facing + 1) % 4
        elif letter == "U":
            facing = (facing + 2) % 4
        else:
            dx, dy = STEPS[HEADINGS[facing]]
            if letter == "B":
                dx, dy = -dx, -dy
            for _ in range(int(digits) if digits else 1):
                nxt = ((x + dx) % width, (y + dy) % height)
                if nxt in blocked:
                    break
                x, y = nxt
                seen.add(nxt)
    return (x, y, HEADINGS[facing], len(seen))
