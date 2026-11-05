import csv


def solve(line: str) -> list[str]:
    if line == "":
        return [""]
    return next(csv.reader([line], strict=True))
