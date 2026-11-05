from solution import solve


assert solve("") == ""
assert solve("abc") == "abc"
assert solve("3[a]") == "aaa"
assert solve("2[ab]c") == "ababc"
assert solve("3[a2[bc]]") == "abcbcabcbcabcbc"
assert solve("0[abc]x") == "x"
assert solve("[ab]c") == "abc"
assert solve("a12b") == "a12b"
assert solve("a12[b]") == "a" + "b" * 12
assert solve("1a2[b]") == "1abb"
assert solve("007[z]") == "zzzzzzz"
assert solve("2[]") == ""
assert solve("2[3[]x]") == "xx"
assert solve("10[a]") == "a" * 10
assert solve("2[1x]") == "1x1x"
assert solve("2[x1]") == "x1x1"
assert solve("a2[b]3") == "abb3"
assert solve("2[a]2[b]") == "aabb"
assert solve("[[a]]") == "a"
assert solve("2[[a]b]") == "abab"
assert solve("3[ ]") == "   "
assert solve("2[é]") == "éé"
assert solve("1[2[3[c]]]") == "cccccc"
assert solve("x0[1[y]]z") == "xz"
assert solve("12") == "12"
assert solve("2[3]") == "33"
assert solve("99[]a") == "a"
assert solve("2[0[a]b]") == "bb"
assert solve("٢[a]") == "٢a"
assert solve("a 2[b c]") == "a b cb c"
assert solve("4[2[ab]c]") == "ababc" * 4
