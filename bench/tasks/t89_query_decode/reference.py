HEX = "0123456789abcdefABCDEF"


def _decode(text):
    out = bytearray()
    i = 0
    while i < len(text):
        ch = text[i]
        if ch == "+":
            out.append(32)
            i += 1
        elif ch == "%" and i + 2 < len(text) and text[i + 1] in HEX and text[i + 2] in HEX:
            out.append(int(text[i + 1:i + 3], 16))
            i += 3
        else:
            out += ch.encode("utf-8")
            i += 1
    return out.decode("utf-8", "replace")


def solve(query: str) -> dict[str, list[str]]:
    if query.startswith("?"):
        query = query[1:]
    result = {}
    for piece in query.split("&"):
        if not piece:
            continue
        name, _, value = piece.partition("=")
        result.setdefault(_decode(name), []).append(_decode(value))
    return result
