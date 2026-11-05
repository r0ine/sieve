def solve(data: dict, path: list[str]) -> object:
    current = data
    for key in path:
        if not isinstance(current, dict) or key not in current:
            return None
        current = current[key]
    return current
