def _key(value):
    if isinstance(value, int):
        return (0, value, "", "")
    return (1, 0, value.lower(), value)


def solve(records: list[dict], spec: str) -> list[int]:
    order = list(range(len(records)))
    for field in reversed(spec.split(",")):
        descending = field.startswith("-")
        name = field[1:] if descending else field
        filled = [i for i in order if records[i].get(name) is not None]
        empty = [i for i in order if records[i].get(name) is None]
        filled.sort(key=lambda i: _key(records[i][name]), reverse=descending)
        order = filled + empty
    return order
