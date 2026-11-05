from solution import solve


assert solve("P1DT2H") == 93600
assert solve("-PT90M") == -5400
assert solve("PT0S") == 0
assert solve("P1D") == 86400
assert solve("PT1H") == 3600
assert solve("P1W") == 604800
assert solve("P1WT1S") == 604801
assert solve("P2DT3H4M5S") == 183845
assert solve("PT36H") == 129600
assert solve("P0010D") == 864000
assert solve("+P1D") == 86400
assert solve("-P0D") == 0
assert solve("P1000000W") == 604800000000
assert solve("PT1M1S") == 61
assert solve("P1W2D") == 777600
assert solve("PT") is None
assert solve("") is None
assert solve("P") is None
assert solve("-P") is None
assert solve("P1DT") is None
assert solve("1D") is None
assert solve("P1H") is None
assert solve("PT1D") is None
assert solve("P1D1W") is None
assert solve("PT1S1M") is None
assert solve("P1M") is None
assert solve("P1Y") is None
assert solve("p1d") is None
assert solve("P1d") is None
assert solve("PT1.5S") is None
assert solve("P 1D") is None
assert solve("P1D ") is None
assert solve(" P1D") is None
assert solve("PT-1S") is None
assert solve("P1DD") is None
assert solve("PT1H1H") is None
assert solve("P١D") is None
assert solve("--P1D") is None
assert solve("+-P1D") is None
assert solve("PD") is None
assert solve("PTS") is None
