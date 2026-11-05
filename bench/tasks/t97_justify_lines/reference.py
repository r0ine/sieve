def solve(words: list[str], width: int) -> list[str]:
    groups = []
    line = []
    for word in words:
        if len(word) > width:
            if line:
                groups.append(line)
            groups.append([word])
            line = []
        elif line and len(" ".join(line + [word])) > width:
            groups.append(line)
            line = [word]
        else:
            line.append(word)
    if line:
        groups.append(line)

    out = []
    for index, group in enumerate(groups):
        if len(group) == 1 and len(group[0]) > width:
            out.append(group[0])
        elif len(group) == 1 or index == len(groups) - 1:
            out.append(" ".join(group).ljust(width))
        else:
            gaps = len(group) - 1
            spaces = width - sum(map(len, group))
            each, extra = divmod(spaces, gaps)
            text = group[0]
            for i, word in enumerate(group[1:]):
                text += " " * (each + (1 if i < extra else 0)) + word
            out.append(text)
    return out
