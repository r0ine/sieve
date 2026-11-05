def solve(text: str, operations: list[tuple]) -> str:
    history = [text]
    position = 0
    for operation in operations:
        if operation[0] == 'undo':
            position = max(0, position - 1)
        elif operation[0] == 'redo':
            position = min(len(history) - 1, position + 1)
        else:
            _, start, delete_count, replacement = operation
            current = history[position]
            if start < 0:
                start += len(current)
            start = max(0, min(len(current), start))
            changed = current[:start] + replacement + current[start + delete_count:]
            history = history[:position + 1]
            history.append(changed)
            position += 1
    return history[position]
