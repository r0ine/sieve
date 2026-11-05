from collections import Counter


def solve(text: str, need: str) -> str:
    if not need:
        return ""
    want = Counter(need)
    missing = len(need)
    best = None
    left = 0
    for right, ch in enumerate(text):
        if want[ch] > 0:
            missing -= 1
        want[ch] -= 1
        if missing:
            continue
        while want[text[left]] < 0:
            want[text[left]] += 1
            left += 1
        if best is None or right + 1 - left < best[1] - best[0]:
            best = (left, right + 1)
        want[text[left]] += 1
        missing += 1
        left += 1
    return text[best[0]:best[1]] if best else ""
