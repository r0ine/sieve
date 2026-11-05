from collections import OrderedDict


def solve(capacity: int, operations: list[list]) -> list[list]:
    cache = OrderedDict()
    results = []
    for operation in operations:
        action, key = operation[:2]
        if action == "get":
            if key in cache:
                results.append(cache[key])
                cache.move_to_end(key)
            else:
                results.append(None)
        elif action == "delete":
            cache.pop(key, None)
        else:
            cache[key] = operation[2]
            cache.move_to_end(key)
            if len(cache) > capacity:
                cache.popitem(last=False)
    return [results, list(reversed(cache))]
