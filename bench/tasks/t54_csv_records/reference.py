def solve(text: str) -> list[list[str]]:
    if not text:
        return []

    records = []
    record = []
    field = []
    quoted = False
    index = 0
    ended_record = False

    while index < len(text):
        char = text[index]
        if quoted:
            if char == '"':
                if index + 1 < len(text) and text[index + 1] == '"':
                    field.append('"')
                    index += 1
                else:
                    quoted = False
            else:
                field.append(char)
        elif char == '"' and not field:
            quoted = True
            ended_record = False
        elif char == ",":
            record.append("".join(field))
            field = []
            ended_record = False
        elif char == "\n" or char == "\r":
            record.append("".join(field))
            records.append(record)
            record, field = [], []
            ended_record = True
            if char == "\r":
                index += 1
        else:
            field.append(char)
            ended_record = False
        index += 1

    if not ended_record:
        record.append("".join(field))
        records.append(record)
    return records
