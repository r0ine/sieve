def solve(dimensions: list[int]) -> list:
    count = len(dimensions) - 1
    if count == 0:
        return [0, ""]

    table = {}
    for index in range(count):
        table[index, index] = (0, f"A{index + 1}")

    for width in range(2, count + 1):
        for left in range(count - width + 1):
            right = left + width - 1
            choices = []
            for middle in range(left, right):
                left_cost, left_text = table[left, middle]
                right_cost, right_text = table[middle + 1, right]
                cost = left_cost + right_cost + dimensions[left] * dimensions[middle + 1] * dimensions[right + 1]
                choices.append((cost, f"({left_text}{right_text})"))
            table[left, right] = min(choices)
    return list(table[0, count - 1])
