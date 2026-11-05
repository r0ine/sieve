# lru_trace
Difficulty: hard

Implement `solve(capacity: int, operations: list[list]) -> list[list]`.

Simulate a least-recently-used cache with nonnegative `capacity`. Keys are strings and values are integers. Operations are `["put", key, value]`, `["get", key]`, and `["delete", key]`. A successful get returns its value and makes the key most recent; a missing get returns `None` without changing order. A put creates or replaces a value and makes that key most recent; after it, evict the least recent key if the cache exceeds capacity. A delete removes a present key and otherwise does nothing. Neither put nor delete contributes a result. Return `[get_results, keys]`, where `keys` lists surviving keys from most to least recent. Capacity zero retains nothing.

## Examples

- `solve(2, [["put", "a", 1], ["put", "b", 2], ["get", "a"]]) == [[1], ["a", "b"]]`
- `solve(1, [["put", "a", 1], ["put", "b", 2], ["get", "a"]]) == [[None], ["b"]]`
