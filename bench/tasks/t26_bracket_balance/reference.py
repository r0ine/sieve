def solve(text: str) -> bool:
    closing = {')': '(', ']': '[', '}': '{'}
    stack = []
    for char in text:
        if char in "([{":
            stack.append(char)
        elif char in closing:
            if not stack or stack.pop() != closing[char]:
                return False
    return not stack
