import ast


def solve(text: str) -> list:
    return ast.literal_eval(text.strip())
