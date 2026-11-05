def solve(source: str) -> str:
    output = []
    index = 0
    depth = 0
    quote = None
    escaped = False
    line_comment = False
    while index < len(source):
        char = source[index]
        pair = source[index:index + 2]
        if line_comment:
            if char == '\n':
                output.append(char)
                line_comment = False
            index += 1
        elif depth:
            if pair == '/*':
                depth += 1
                index += 2
            elif pair == '*/':
                depth -= 1
                index += 2
            else:
                index += 1
        elif quote is not None:
            output.append(char)
            if escaped:
                escaped = False
            elif char == '\\':
                escaped = True
            elif char == quote:
                quote = None
            index += 1
        elif char in "'\"":
            quote = char
            output.append(char)
            index += 1
        elif pair == '/*':
            depth = 1
            index += 2
        elif pair == '//':
            line_comment = True
            index += 2
        else:
            output.append(char)
            index += 1
    return ''.join(output)
