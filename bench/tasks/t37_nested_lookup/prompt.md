# nested lookup

Difficulty: medium

Write `solve(data: dict, path: list[str]) -> object`.

Follow string keys through nested dictionaries. Return None if a key is missing or an intermediate value is not a dictionary. Empty path returns the original data. A stored None is returned as None.

Examples:
- `solve({'a': {'b': 3}}, ['a', 'b']) == 3`
- `solve({}, ['x']) is None`
