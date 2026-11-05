import re

FORMS = (
    (re.compile(r"[1-9](?:_?[0-9])*"), 10, 0),
    (re.compile(r"0(?:_?0)*"), 10, 0),
    (re.compile(r"0[bB](?:_?[01])+"), 2, 2),
    (re.compile(r"0[oO](?:_?[0-7])+"), 8, 2),
    (re.compile(r"0[xX](?:_?[0-9a-fA-F])+"), 16, 2),
)


def solve(text: str) -> int | None:
    for pattern, base, skip in FORMS:
        if pattern.fullmatch(text):
            return int(text[skip:].replace("_", ""), base)
    return None
