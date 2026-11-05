from collections import OrderedDict


def solve(capacity: int, operations: list[tuple]) -> list[int | None]:
    cache = OrderedDict()
    results = []
    for operation in operations:
        if operation[0] == "get":
            key = operation[1]
            if key in cache:
                cache.move_to_end(key)
                results.append(cache[key])
            else:
                results.append(None)
        else:
            key, value = operation[1:]
            cache[key] = value
            cache.move_to_end(key)
            if len(cache) > capacity:
                cache.popitem(last=False)
    return results
