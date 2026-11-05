import ast


def solve(expression: str) -> int:
    def evaluate(node: ast.AST) -> int:
        if isinstance(node, ast.Constant):
            return node.value
        if isinstance(node, ast.UnaryOp):
            value = evaluate(node.operand)
            return -value if isinstance(node.op, ast.USub) else value
        left = evaluate(node.left)
        right = evaluate(node.right)
        if isinstance(node.op, ast.Add):
            return left + right
        if isinstance(node.op, ast.Sub):
            return left - right
        if isinstance(node.op, ast.Mult):
            return left * right
        quotient = abs(left) // abs(right)
        return -quotient if (left < 0) != (right < 0) else quotient

    return evaluate(ast.parse(expression.strip(), mode="eval").body)
