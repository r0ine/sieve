# applicant optimal matching

Difficulty: hard

Write `solve(applicants: dict[str, list[str]], firms: dict[str, list[str]], capacities: dict[str, int]) -> list[tuple[str, str]]`.

Each applicant's list ranks distinct firm names in preference order; each firm's list ranks distinct applicant names. All listed names exist in the corresponding dictionaries. Every firm has a nonnegative capacity in `capacities`. A pair is acceptable only if both sides list each other. Run applicant-proposing deferred acceptance: each unmatched applicant proposes to the next firm on their list; a firm keeps its most preferred acceptable proposers up to capacity and rejects the rest, possibly displacing an earlier hold. Rejected applicants continue proposing until matched or their lists end. Return accepted `(applicant, firm)` pairs sorted by applicant name. Unmatched applicants are omitted. Empty dictionaries produce `[]`. Preferences have no ties; the final matching does not depend on proposal processing order.

Examples:
- `solve({'a': ['X'], 'b': ['X']}, {'X': ['b', 'a']}, {'X': 1}) == [('b', 'X')]`
- `solve({'a': ['X']}, {'X': []}, {'X': 1}) == []`
- `solve({}, {}, {}) == []`
