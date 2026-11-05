DIGITS = "0123456789"


def solve(text: str) -> str:
    def expand(pos: int) -> tuple[str, int]:
        out = []
        while pos < len(text):
            ch = text[pos]
            if ch == "]":
                return "".join(out), pos + 1
            if ch == "[":
                inner, pos = expand(pos + 1)
                out.append(inner)
            elif ch in DIGITS:
                end = pos
                while end < len(text) and text[end] in DIGITS:
                    end += 1
                if end < len(text) and text[end] == "[":
                    inner, after = expand(end + 1)
                    out.append(inner * int(text[pos:end]))
                    pos = after
                else:
                    out.append(text[pos:end])
                    pos = end
            else:
                out.append(ch)
                pos += 1
        return "".join(out), pos

    return expand(0)[0]
