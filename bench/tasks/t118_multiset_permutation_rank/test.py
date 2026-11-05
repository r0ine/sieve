from solution import solve


assert solve("aab", "aba") == 1
assert solve("abc", "cba") == 5
assert solve("", "") == 0
assert solve("a", "a") == 0
assert solve("a", "b") is None
assert solve("aab", "aab") == 0
assert solve("aab", "baa") == 2
assert solve("abc", "abc") == 0
assert solve("abc", "acb") == 1
assert solve("abc", "bac") == 2
assert solve("abc", "bca") == 3
assert solve("abc", "cab") == 4
assert solve("aaa", "aaa") == 0
assert solve("aaaa", "aaaa") == 0
assert solve("abab", "aabb") == 0
assert solve("abab", "abab") == 1
assert solve("abab", "abba") == 2
assert solve("abab", "baab") == 3
assert solve("abab", "baba") == 4
assert solve("abab", "bbaa") == 5
assert solve("aabc", "aabc") == 0
assert solve("aabc", "abac") == 2
assert solve("aabc", "cbaa") == 11
assert solve("abcd", "dcba") == 23
assert solve("éa", "aé") == 0
assert solve("éa", "éa") == 1
assert solve("😀a", "a😀") == 0
assert solve("😀a", "😀a") == 1
assert solve("aa", "a") is None
assert solve("aa", "ab") is None
assert solve("", "a") is None
assert solve("a", "") is None
assert solve("aabbcc", "ccbbaa") == 89
assert solve("zzzza", "zzzza") == 4
