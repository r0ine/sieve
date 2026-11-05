def solve(teams: list[str], games: list[tuple[str, str, int, int]]) -> list[tuple[str, int, int, int]]:
    totals = {team: [0, 0, 0] for team in teams}
    for home, away, home_goals, away_goals in games:
        home_row = totals[home]
        away_row = totals[away]
        home_row[1] += home_goals - away_goals
        away_row[1] += away_goals - home_goals
        home_row[2] += home_goals
        away_row[2] += away_goals
        if home_goals > away_goals:
            home_row[0] += 3
        elif away_goals > home_goals:
            away_row[0] += 3
        else:
            home_row[0] += 1
            away_row[0] += 1
    rows = [(team, *totals[team]) for team in teams]
    return sorted(rows, key=lambda row: (-row[1], -row[2], -row[3], row[0]))
