def _parse(block):
    address, prefix = block.split("/")
    value = 0
    for octet in address.split("."):
        value = value * 256 + int(octet)
    size = 1 << (32 - int(prefix))
    start = value - value % size
    return start, start + size - 1


def _format(start, size):
    octets = [str(start >> shift & 255) for shift in (24, 16, 8, 0)]
    return ".".join(octets) + "/" + str(32 - size.bit_length() + 1)


def solve(blocks: list[str]) -> list[str]:
    ranges = sorted(_parse(b) for b in blocks)
    merged = []
    for lo, hi in ranges:
        if merged and lo <= merged[-1][1] + 1:
            merged[-1][1] = max(merged[-1][1], hi)
        else:
            merged.append([lo, hi])

    out = []
    for lo, hi in merged:
        while lo <= hi:
            size = lo & -lo if lo else 1 << 32
            while size > hi - lo + 1:
                size >>= 1
            out.append(_format(lo, size))
            lo += size
    return out
