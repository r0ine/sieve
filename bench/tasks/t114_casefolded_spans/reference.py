def solve(text: str, needle: str) -> list[tuple[int, int]]:
    target = needle.casefold()
    spans = []
    for start in range(len(text)):
        folded = ''
        for end in range(start + 1, len(text) + 1):
            folded += text[end - 1].casefold()
            if folded == target:
                spans.append((start, end))
            if len(folded) >= len(target):
                break
    return spans
