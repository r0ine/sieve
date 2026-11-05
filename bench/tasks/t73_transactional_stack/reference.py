def solve(operations: list[list]) -> list[list[int]]:
    stack = []
    popped = []
    saves = []
    for operation in operations:
        action = operation[0]
        if action == "push":
            stack.append(operation[1])
        elif action == "pop":
            popped.append(stack.pop())
        elif action == "dup":
            stack.append(stack[-1])
        elif action == "swap":
            stack[-2], stack[-1] = stack[-1], stack[-2]
        elif action == "add":
            top = stack.pop()
            stack[-1] += top
        elif action == "sub":
            top = stack.pop()
            stack[-1] -= top
        elif action == "begin":
            saves.append((stack.copy(), popped.copy()))
        elif action == "commit":
            saves.pop()
        else:
            stack, popped = saves.pop()
    return [stack, popped]
