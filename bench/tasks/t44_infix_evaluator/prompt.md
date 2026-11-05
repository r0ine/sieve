# infix evaluator

Difficulty: hard

Write `solve(expression: str) -> int`.

Evaluate a valid integer expression containing decimal integers, whitespace, parentheses, binary + - * /, and unary + or -. Integer literals have no leading zero except 0. Standard precedence and left associativity apply; unary signs bind tighter than * and /. Division truncates toward zero and divisors are nonzero. The input always contains an expression.

Examples:
- `solve('2+3*4') == 14`
- `solve('(-7)/3') == -2`
