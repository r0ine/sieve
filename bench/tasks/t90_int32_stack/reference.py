import re

PUSH = re.compile(r"push (-?[0-9]+)")
ARITY = {"pop": 1, "dup": 1, "swap": 2, "neg": 1, "add": 2, "sub": 2, "mul": 2, "div": 2, "mod": 2}


def _wrap(n):
    return (n + 2 ** 31) % 2 ** 32 - 2 ** 31


def _quot(a, b):
    q = abs(a) // abs(b)
    return q if (a < 0) == (b < 0) else -q


def solve(program: list[str]) -> list[int] | None:
    stack = []
    for line in program:
        match = PUSH.fullmatch(line)
        if match:
            stack.append(_wrap(int(match.group(1))))
            continue
        if line not in ARITY or len(stack) < ARITY[line]:
            return None
        if line == "pop":
            stack.pop()
        elif line == "dup":
            stack.append(stack[-1])
        elif line == "swap":
            stack[-1], stack[-2] = stack[-2], stack[-1]
        elif line == "neg":
            stack.append(_wrap(-stack.pop()))
        else:
            b = stack.pop()
            a = stack.pop()
            if line in ("div", "mod") and b == 0:
                return None
            if line == "add":
                r = a + b
            elif line == "sub":
                r = a - b
            elif line == "mul":
                r = a * b
            elif line == "div":
                r = _quot(a, b)
            else:
                r = a - b * _quot(a, b)
            stack.append(_wrap(r))
    return stack
