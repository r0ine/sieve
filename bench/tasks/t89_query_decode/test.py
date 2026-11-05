from solution import solve


assert solve("") == {}
assert solve("?") == {}
assert solve("&&&") == {}
assert solve("?&") == {}
assert solve("??a=1") == {"?a": ["1"]}
assert solve("?a=1&b=x+y&a=2") == {"a": ["1", "2"], "b": ["x y"]}
assert solve("q=%2B1%20%3D") == {"q": ["+1 ="]}
assert solve("flag&&=v") == {"flag": [""], "": ["v"]}
assert solve("a") == {"a": [""]}
assert solve("a=") == {"a": [""]}
assert solve("=") == {"": [""]}
assert solve("a==b") == {"a": ["=b"]}
assert solve("a=1=2") == {"a": ["1=2"]}
assert solve("a=1;b=2") == {"a": ["1;b=2"]}
assert solve("x=%26&y=%3d") == {"x": ["&"], "y": ["="]}
assert solve("k%3Dv=1") == {"k=v": ["1"]}
assert solve("a+b=c+d") == {"a b": ["c d"]}
assert solve("a=%2b") == {"a": ["+"]}
assert solve("a=%2") == {"a": ["%2"]}
assert solve("a=%") == {"a": ["%"]}
assert solve("a=%%41") == {"a": ["%A"]}
assert solve("a=%zz") == {"a": ["%zz"]}
assert solve("a=%4g") == {"a": ["%4g"]}
assert solve("a=100%") == {"a": ["100%"]}
assert solve("a=%41%42c") == {"a": ["ABc"]}
assert solve("a=%e2%82%ac") == {"a": ["€"]}
assert solve("a=%E2%82%AC") == {"a": ["€"]}
assert solve("a=%e2%82") == {"a": ["�"]}
assert solve("a=%e2%82x") == {"a": ["�x"]}
assert solve("a=%ff") == {"a": ["�"]}
assert solve("a=%ff%fe") == {"a": ["��"]}
assert solve("a=%c3") == {"a": ["�"]}
assert solve("a=%c3%a9") == {"a": ["é"]}
assert solve("a=%C3%28") == {"a": ["�("]}
assert solve("a=é") == {"a": ["é"]}
assert solve("a=é%e2%82%ac€") == {"a": ["é€€"]}
assert solve("caf%C3%A9=1&café=2") == {"café": ["1", "2"]}
assert solve("a=%00") == {"a": ["\x00"]}
assert solve("a=%0A%0d") == {"a": ["\n\r"]}
assert solve("a=%2520") == {"a": ["%20"]}
assert solve("a=1&a=&a") == {"a": ["1", "", ""]}
assert solve("b=1&a=2&b=3") == {"b": ["1", "3"], "a": ["2"]}
assert solve("x=a?b") == {"x": ["a?b"]}
assert solve("&?x=1") == {"?x": ["1"]}
assert solve("a=%f0%9f%98%80") == {"a": ["\U0001F600"]}
assert solve("a=%f0%9f%98") == {"a": ["�"]}
assert solve("a=%ed%a0%80") == {"a": ["���"]}
assert solve("a=%2B+%2B") == {"a": ["+ +"]}
