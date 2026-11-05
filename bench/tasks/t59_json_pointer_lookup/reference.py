def solve(document, pointers: list[str]) -> list[list]:
    answers = []
    for pointer in pointers:
        value = document
        found = True
        if pointer:
            for raw in pointer[1:].split("/"):
                token = raw.replace("~1", "/").replace("~0", "~")
                if isinstance(value, dict):
                    if token not in value:
                        found = False
                        break
                    value = value[token]
                elif isinstance(value, list):
                    if not token.isascii() or not token.isdecimal():
                        found = False
                        break
                    if len(token) > 1 and token[0] == "0":
                        found = False
                        break
                    index = int(token)
                    if index >= len(value):
                        found = False
                        break
                    value = value[index]
                else:
                    found = False
                    break
        answers.append([True, value] if found else [False, None])
    return answers
