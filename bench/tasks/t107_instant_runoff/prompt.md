# instant runoff

Difficulty: hard

Write `solve(candidates: list[str], ballots: list[list[str]]) -> str | None`.

Candidate names are distinct nonempty strings. Each ballot ranks zero or more distinct names from `candidates`, highest first; unranked names never receive that ballot. In each round, count each ballot for its highest-ranked remaining candidate. Exhausted ballots do not count toward the majority threshold. A candidate with strictly more than half of the active ballots wins. If no ballots are active, return the lexicographically smallest remaining candidate. Otherwise eliminate exactly one candidate with the fewest votes; among tied candidates eliminate the lexicographically largest. Recount from the original ballots after elimination. If only one candidate remains, return it. Empty `candidates` returns `None`. String order is Python's ordinary lexicographic order.

Examples:
- `solve(['A', 'B', 'C'], [['A'], ['B', 'C'], ['C', 'B']]) == 'B'`
- `solve(['A', 'B'], [[], []]) == 'A'`
- `solve([], []) is None`
