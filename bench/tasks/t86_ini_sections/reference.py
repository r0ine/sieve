BLANKS = " \t"


def solve(text: str) -> dict[str, dict[str, str]] | None:
    result = {}
    section = None
    for line in text.split("\n"):
        if line.endswith("\r"):
            line = line[:-1]
        line = line.strip(BLANKS)
        if not line or line[0] in ";#":
            continue
        if line.startswith("[") and line.endswith("]"):
            name = line[1:-1].strip(BLANKS).lower()
            if not name:
                return None
            section = name
            result.setdefault(section, {})
            continue
        if "=" not in line:
            return None
        key, _, value = line.partition("=")
        key = key.strip(BLANKS).lower()
        if not key:
            return None
        value = value.strip(BLANKS)
        if len(value) >= 2 and value[0] == '"' and value[-1] == '"':
            value = value[1:-1]
        result.setdefault(section if section is not None else "", {})[key] = value
    return result
