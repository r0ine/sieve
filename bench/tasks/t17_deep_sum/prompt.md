# deep sum

Difficulty: medium

Write `solve(values: list) -> int`.

Sum integer leaves in a nested list structure. Every element is either an int or another list with the same rule. Empty lists contribute zero. Negative values and arbitrary nesting are allowed.

Examples:
- `solve([1, [2, [-3]]]) == 0`
- `solve([[], []]) == 0`
