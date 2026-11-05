def solve(start: str, end: str) -> int:
    def minutes(value: str) -> int:
        hour, minute = map(int, value.split(":"))
        return 60 * hour + minute

    return (minutes(end) - minutes(start)) % 1440
