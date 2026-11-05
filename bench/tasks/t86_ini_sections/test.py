from solution import solve


assert solve("") == {}
assert solve("\n\n") == {}
assert solve("  \t \n") == {}
assert solve("; only\n# comments") == {}
assert solve("a=1\n[S]\nb = \"x y\"") == {"": {"a": "1"}, "s": {"b": "x y"}}
assert solve("[x]\n[X]\nk=1\nk=2") == {"x": {"k": "2"}}
assert solve("[]") is None
assert solve("[  ]") is None
assert solve("[\t]") is None
assert solve("[a]") == {"a": {}}
assert solve("[ Main Section ]") == {"main section": {}}
assert solve("[a=b]") == {"a=b": {}}
assert solve("[a]x") is None
assert solve("[a] ; note") is None
assert solve("x[a]") is None
assert solve("[a") is None
assert solve("a]") is None
assert solve("=1") is None
assert solve("  = 1") is None
assert solve("key") is None
assert solve("[s]\njunk") is None
assert solve("k=") == {"": {"k": ""}}
assert solve("k =   ") == {"": {"k": ""}}
assert solve("a = b = c") == {"": {"a": "b = c"}}
assert solve("a==") == {"": {"a": "="}}
assert solve("My Key = Some Value") == {"": {"my key": "Some Value"}}
assert solve("k=\"\"") == {"": {"k": ""}}
assert solve("k=\"") == {"": {"k": "\""}}
assert solve("k=\"a\"b\"") == {"": {"k": "a\"b"}}
assert solve("k=\"\"x\"\"") == {"": {"k": "\"x\""}}
assert solve("k= \" padded \" ") == {"": {"k": " padded "}}
assert solve("k=\"a") == {"": {"k": "\"a"}}
assert solve("k='a'") == {"": {"k": "'a'"}}
assert solve("k=a ; not a comment") == {"": {"k": "a ; not a comment"}}
assert solve("k=#hash") == {"": {"k": "#hash"}}
assert solve("  ; indented comment\n\t# another") == {}
assert solve("[s]\r\nk = v\r\n") == {"s": {"k": "v"}}
assert solve("k=v\r") == {"": {"k": "v"}}
assert solve("k=v\r\r") == {"": {"k": "v\r"}}
assert solve("k=v ") == {"": {"k": "v "}}
assert solve("[a]\n[b]\n[a]\nx=1") == {"a": {"x": "1"}, "b": {}}
assert solve("[a]\nx=1\n[b]\n[A]\ny=2") == {"a": {"x": "1", "y": "2"}, "b": {}}
assert solve("x=1\nX=2") == {"": {"x": "2"}}
assert solve("[s]\nKEY=Value") == {"s": {"key": "Value"}}
assert solve("[ÄBC]") == {"äbc": {}}
assert solve("[a]\n[b]") == {"a": {}, "b": {}}
assert solve("[[a]]") == {"[a]": {}}
assert solve("x=1\n[s]\n\n; c\ny = 2\n") == {"": {"x": "1"}, "s": {"y": "2"}}
assert solve("[s]\nok=1\nbad") is None
assert solve("\tk\t=\tv\t") == {"": {"k": "v"}}
