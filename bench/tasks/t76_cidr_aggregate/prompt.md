# cidr_aggregate
Difficulty: hard

Implement `solve(blocks: list[str]) -> list[str]`.

Each input string is an IPv4 CIDR block `a.b.c.d/p`: four decimal octets from 0 to 255 written without leading zeros, then `/` and a prefix length `p` from 0 to 32. The input is always well formed. Host bits may be set (for example `10.1.2.3/24`); such a block means the whole network that contains that address, i.e. `10.1.2.0/24`.

Return the shortest possible list of CIDR blocks whose combined address set is exactly the union of the input blocks — no address added, none lost. Every output block must have all host bits zero and be written as `a.b.c.d/p` in the same format. Sort the output by network address ascending. Adjacent or overlapping ranges must be combined whenever a larger aligned block covers them exactly; ranges that touch but cannot form one aligned block are split into the fewest aligned blocks. The shortest list is unique. Empty input returns `[]`.

## Examples

- `solve(["10.0.0.0/24", "10.0.1.0/24"]) == ["10.0.0.0/23"]`
- `solve(["10.0.1.0/24", "10.0.2.0/24"]) == ["10.0.1.0/24", "10.0.2.0/24"]`
- `solve(["192.168.1.77/24"]) == ["192.168.1.0/24"]`
