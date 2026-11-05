from solution import solve


assert solve("") == []
assert solve("   ") == []
assert solve(" \t ") == []
assert solve("a b c") == ["a", "b", "c"]
assert solve("  a   b  ") == ["a", "b"]
assert solve("a\tb") == ["a", "b"]
assert solve("a\nb") == ["a\nb"]
assert solve("a 'b c' d") == ["a", "b c", "d"]
assert solve('"a b" c') == ["a b", "c"]
assert solve("a'b'c") == ["abc"]
assert solve("''") == [""]
assert solve('""') == [""]
assert solve("a '' b") == ["a", "", "b"]
assert solve('"" a') == ["", "a"]
assert solve("a\\ b") == ["a b"]
assert solve("\\ ") == [" "]
assert solve("\\'") == ["'"]
assert solve("\\\\") == ["\\"]
assert solve("a\\nb") == ["anb"]
assert solve("'it''s'") == ["its"]
assert solve("'a\\b'") == ["a\\b"]
assert solve("'a\\'") == ["a\\"]
assert solve('"a\\"b"') == ['a"b']
assert solve('"a\\nb"') == ["a\\nb"]
assert solve('"\\$x"') == ["$x"]
assert solve('"\\`"') == ["`"]
assert solve('"\\\\"') == ["\\"]
assert solve('"\\\\" x') == ["\\", "x"]
assert solve("'\"'") == ['"']
assert solve("\"'\"") == ["'"]
assert solve('x="1 2"\'3\'') == ["x=1 23"]
assert solve('x="1 2"\'3 4\'') == ["x=1 23 4"]
assert solve('"\\x\\"y"') == ['\\x"y']
assert solve("a\\") is None
assert solve("'abc") is None
assert solve('"abc') is None
assert solve('"abc\\"') is None
assert solve('"abc\\') is None
assert solve("a 'b") is None
assert solve('"a\'b"') == ["a'b"]
assert solve("a\\\tb") == ["a\tb"]
