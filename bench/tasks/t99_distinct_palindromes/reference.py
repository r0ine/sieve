MOD = 1_000_000_007


def solve(text: str) -> int:
    n = len(text)
    if n == 0:
        return 0
    nxt = [0] * n
    prv = [0] * n
    last = {}
    for i, ch in enumerate(text):
        prv[i] = last.get(ch, -1)
        last[ch] = i
    last = {}
    for i in range(n - 1, -1, -1):
        nxt[i] = last.get(text[i], n)
        last[text[i]] = i

    dp = [[0] * n for _ in range(n)]
    for i in range(n - 1, -1, -1):
        row, below = dp[i], dp[i + 1] if i + 1 < n else None
        row[i] = 1
        for j in range(i + 1, n):
            if text[i] != text[j]:
                value = row[j - 1] + below[j] - (below[j - 1] if j - 1 > i else 0)
            else:
                inner = below[j - 1] if j - 1 > i else 0
                low, high = nxt[i], prv[j]
                if low > high:
                    value = 2 * inner + 2
                elif low == high:
                    value = 2 * inner + 1
                else:
                    value = 2 * inner - (dp[low + 1][high - 1] if high - 1 > low else 0)
            row[j] = value % MOD
    return dp[0][n - 1]
