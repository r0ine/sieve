from collections import Counter


def solve(formula: str) -> list[list]:
    stack = [Counter()]
    index = 0
    while index < len(formula):
        char = formula[index]
        if char == "(":
            stack.append(Counter())
            index += 1
        elif char == ")":
            group = stack.pop()
            index += 1
            start = index
            while index < len(formula) and formula[index].isdigit():
                index += 1
            multiplier = int(formula[start:index]) if index > start else 1
            for symbol, count in group.items():
                stack[-1][symbol] += count * multiplier
        else:
            start = index
            index += 1
            while index < len(formula) and formula[index].islower():
                index += 1
            symbol = formula[start:index]
            start = index
            while index < len(formula) and formula[index].isdigit():
                index += 1
            multiplier = int(formula[start:index]) if index > start else 1
            stack[-1][symbol] += multiplier
    return [[symbol, stack[0][symbol]] for symbol in sorted(stack[0])]
