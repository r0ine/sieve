import random

from solution import solve


assert solve([]) == []
assert solve(["10.0.0.0/24", "10.0.1.0/24"]) == ["10.0.0.0/23"]
assert solve(["10.0.1.0/24", "10.0.2.0/24"]) == ["10.0.1.0/24", "10.0.2.0/24"]
assert solve(["192.168.1.77/24"]) == ["192.168.1.0/24"]
assert solve(["0.0.0.0/0"]) == ["0.0.0.0/0"]
assert solve(["1.2.3.4/0"]) == ["0.0.0.0/0"]
assert solve(["0.0.0.0/0", "1.2.3.4/32"]) == ["0.0.0.0/0"]
assert solve(["0.0.0.0/1", "128.0.0.0/1"]) == ["0.0.0.0/0"]
assert solve(["128.0.0.0/1", "0.0.0.0/1"]) == ["0.0.0.0/0"]
assert solve(["255.255.255.255/32"]) == ["255.255.255.255/32"]
assert solve(["255.255.255.254/32", "255.255.255.255/32"]) == ["255.255.255.254/31"]
assert solve(["10.0.0.1/32", "10.0.0.2/32", "10.0.0.3/32", "10.0.0.4/32", "10.0.0.5/32", "10.0.0.6/32"]) == [
    "10.0.0.1/32", "10.0.0.2/31", "10.0.0.4/31", "10.0.0.6/32"]
assert solve(["10.0.0.0/32", "10.0.0.1/32", "10.0.0.2/32", "10.0.0.3/32"]) == ["10.0.0.0/30"]
assert solve(["10.0.0.0/8", "10.20.30.0/24"]) == ["10.0.0.0/8"]
assert solve(["10.0.0.0/24", "10.0.0.0/24"]) == ["10.0.0.0/24"]
assert solve(["10.0.0.128/25", "10.0.0.0/25", "10.0.1.0/24"]) == ["10.0.0.0/23"]
assert solve(["10.0.1.0/24", "10.0.0.0/24", "10.0.2.0/23"]) == ["10.0.0.0/22"]
assert solve(["10.0.0.0/23", "10.0.2.0/24"]) == ["10.0.0.0/23", "10.0.2.0/24"]
assert solve(["10.0.0.0/30", "10.0.0.2/31", "10.0.0.6/31"]) == ["10.0.0.0/30", "10.0.0.6/31"]
assert solve(["172.16.5.9/12"]) == ["172.16.0.0/12"]
assert solve(["172.31.255.255/12"]) == ["172.16.0.0/12"]
assert solve(["9.255.255.255/32", "10.0.0.0/32"]) == ["9.255.255.255/32", "10.0.0.0/32"]
assert solve(["127.255.255.255/32", "128.0.0.0/32"]) == ["127.255.255.255/32", "128.0.0.0/32"]
assert solve(["1.0.0.0/8", "2.0.0.0/7", "4.0.0.0/6"]) == ["1.0.0.0/8", "2.0.0.0/7", "4.0.0.0/6"]
assert solve(["0.0.0.0/8", "1.0.0.0/8", "2.0.0.0/7"]) == ["0.0.0.0/6"]
assert solve(["192.168.0.0/16", "192.168.10.0/24", "192.169.0.0/16"]) == ["192.168.0.0/15"]
assert solve(["10.0.0.5/31", "10.0.0.4/32"]) == ["10.0.0.4/31"]


def addresses(blocks):
    seen = set()
    for block in blocks:
        address, prefix = block.split("/")
        a, b, c, d = map(int, address.split("."))
        value = (a << 24) | (b << 16) | (c << 8) | d
        size = 1 << (32 - int(prefix))
        start = value - value % size
        seen.update(range(start, start + size))
    return seen


def aligned(block):
    address, prefix = block.split("/")
    a, b, c, d = map(int, address.split("."))
    value = (a << 24) | (b << 16) | (c << 8) | d
    return value % (1 << (32 - int(prefix))) == 0


rng = random.Random(76)
for _ in range(300):
    blocks = []
    for _ in range(rng.randint(1, 6)):
        prefix = rng.randint(26, 32)
        blocks.append(f"10.0.0.{rng.randint(0, 255)}/{prefix}")
    got = solve(blocks)
    assert addresses(got) == addresses(blocks), blocks
    assert all(aligned(b) for b in got), got
    starts = [addresses([b]) for b in got]
    assert sum(len(s) for s in starts) == len(addresses(got)), got
    assert [min(s) for s in starts] == sorted(min(s) for s in starts), got
    for i in range(len(got) - 1):
        left, right = got[i].split("/"), got[i + 1].split("/")
        if left[1] == right[1] and max(starts[i]) + 1 == min(starts[i + 1]):
            size = len(starts[i])
            assert min(starts[i]) % (2 * size) != 0, got
