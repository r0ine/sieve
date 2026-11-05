def solve(stream: str) -> list[str] | None:
    encoded = stream.encode('utf-8')
    cursor = 0
    records = []
    while cursor < len(encoded):
        first = cursor
        while cursor < len(encoded) and 48 <= encoded[cursor] <= 57:
            cursor += 1
        if cursor == first or cursor == len(encoded) or encoded[cursor] != 58:
            return None
        if encoded[first] == 48 and cursor - first > 1:
            return None
        size = 0
        for digit in encoded[first:cursor]:
            size = size * 10 + digit - 48
            if size > len(encoded):
                return None
        cursor += 1
        end = cursor + size
        if end >= len(encoded) or encoded[end] != 44:
            return None
        try:
            records.append(encoded[cursor:end].decode('utf-8'))
        except UnicodeDecodeError:
            return None
        cursor = end + 1
    return records
