from solution import solve


assert solve('12:00', '12:00') == 0
assert solve('23:50', '00:10') == 20
assert solve('00:00', '00:01') == 1
assert solve('23:59', '00:00') == 1
assert solve('01:00', '00:00') == 1380
assert solve('10:30', '11:00') == 30
assert solve('00:00', '23:59') == 1439
assert solve('20:20', '20:19') == 1439
