from solution import solve


assert solve('aGVsbG8') == b'hello'
assert solve('_w') == b'\xff'
assert solve('AB') is None
assert solve('') == b''
assert solve('AA') == b'\x00'
assert solve('AAA') == b'\x00\x00'
assert solve('AAAA') == b'\x00\x00\x00'
assert solve('AQ') == b'\x01'
assert solve('AQI') == b'\x01\x02'
assert solve('AQID') == b'\x01\x02\x03'
assert solve('Zg') == b'f'
assert solve('Zm8') == b'fo'
assert solve('Zm9v') == b'foo'
assert solve('Zm9vYg') == b'foob'
assert solve('-_8') == b'\xfb\xff'
assert solve('____') == b'\xff\xff\xff'
assert solve('A') is None
assert solve('AAAAA') is None
assert solve('Zg==') is None
assert solve('Zg=') is None
assert solve('Zg\n') is None
assert solve('Zg ') is None
assert solve('Zg+') is None
assert solve('Zg/') is None
assert solve('é') is None
assert solve('Zh') is None
assert solve('Zm9') is None
assert solve('_x') is None
assert solve('A_') is None
