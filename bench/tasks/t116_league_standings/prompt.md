# league standings

Difficulty: hard

Write `solve(teams: list[str], games: list[tuple[str, str, int, int]]) -> list[tuple[str, int, int, int]]`.

Each game tuple is `(home, away, home_goals, away_goals)`. Teams are distinct strings; both game teams appear in `teams` and differ, and goals are nonnegative integers. A win awards three points to its winner, a draw one point to each, and a loss zero. For every team accumulate points, goal difference (goals scored minus conceded), and goals scored. Return `(team, points, goal_difference, goals_scored)` rows sorted by descending points, then descending goal difference, then descending goals scored, then ascending Python string order. Include teams with no games. Repeated fixtures are separate games. Empty `teams` returns `[]`.

Examples:
- `solve(['A', 'B'], [('A', 'B', 2, 1)]) == [('A', 3, 1, 2), ('B', 0, -1, 1)]`
- `solve(['B', 'A'], []) == [('A', 0, 0, 0), ('B', 0, 0, 0)]`
- `solve([], []) == []`
