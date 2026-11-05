def solve(line: str) -> list[str] | None:
    words = []
    current = []
    started = False
    i = 0
    while i < len(line):
        ch = line[i]
        if ch in " \t":
            if started:
                words.append("".join(current))
                current, started = [], False
            i += 1
        elif ch == "\\":
            if i + 1 == len(line):
                return None
            current.append(line[i + 1])
            started = True
            i += 2
        elif ch == "'":
            end = line.find("'", i + 1)
            if end < 0:
                return None
            current.append(line[i + 1:end])
            started = True
            i = end + 1
        elif ch == '"':
            i += 1
            while True:
                if i == len(line):
                    return None
                ch = line[i]
                if ch == '"':
                    i += 1
                    break
                if ch == "\\" and i + 1 < len(line) and line[i + 1] in '"\\$`':
                    current.append(line[i + 1])
                    i += 2
                else:
                    current.append(ch)
                    i += 1
            started = True
        else:
            current.append(ch)
            started = True
            i += 1
    if started:
        words.append("".join(current))
    return words
