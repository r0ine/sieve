def solve(pattern: str, text: str) -> bool:
    tokens = []
    index = 0
    while index < len(pattern):
        char = pattern[index]
        if char == "\\":
            index += 1
            tokens.append(("literal", pattern[index]))
        elif char == "*":
            if not tokens or tokens[-1][0] != "star":
                tokens.append(("star", ""))
        elif char == "?":
            tokens.append(("any", ""))
        else:
            tokens.append(("literal", char))
        index += 1

    matched = [False] * (len(text) + 1)
    matched[0] = True
    for kind, value in tokens:
        current = [False] * (len(text) + 1)
        if kind == "star":
            current[0] = matched[0]
            for position in range(1, len(current)):
                current[position] = matched[position] or current[position - 1]
        else:
            for position, character in enumerate(text, 1):
                current[position] = matched[position - 1] and (
                    kind == "any" or character == value
                )
        matched = current
    return matched[-1]
