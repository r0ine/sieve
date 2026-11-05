# rpn evaluator

Difficulty: hard

Write `solve(tokens: list[str]) -> int`.

Evaluate a valid reverse Polish expression with signed decimal integer tokens and binary +, -, *, /. Division truncates toward zero. Every division has a nonzero divisor and the expression leaves exactly one value. Tokens are nonempty.

Examples:
- `solve(['7', '3', '/']) == 2`
- `solve(['-7', '3', '/']) == -2`
