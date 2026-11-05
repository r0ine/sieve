from solution import solve


assert solve([], 5) == []
assert solve(["a"], 1) == ["a"]
assert solve(["a"], 3) == ["a  "]
assert solve(["abcdef"], 3) == ["abcdef"]
assert solve(["This", "is", "an", "example", "of", "text", "justification."], 16) == [
    "This    is    an",
    "example  of text",
    "justification.  ",
]
assert solve(["What", "must", "be", "acknowledgment", "shall", "be"], 16) == [
    "What   must   be",
    "acknowledgment  ",
    "shall be        ",
]
assert solve(["a", "b", "c", "d"], 6) == ["a  b c", "d     "]
assert solve(["a", "b", "c", "d"], 8) == ["a b c d "]
assert solve(["a", "b", "c", "d"], 7) == ["a b c d"]
assert solve(["ab", "cd", "ef", "gh"], 9) == ["ab  cd ef", "gh       "]
assert solve(["ab", "cd", "ef", "gh"], 10) == ["ab  cd  ef", "gh        "]
assert solve(["a", "toolongword"], 5) == ["a    ", "toolongword"]
assert solve(["toolongword", "a"], 5) == ["toolongword", "a    "]
assert solve(["a", "bbbbbb", "c"], 4) == ["a   ", "bbbbbb", "c   "]
assert solve(["a", "b", "bbbbbb", "c", "d"], 4) == ["a  b", "bbbbbb", "c d "]
assert solve(["a", "b", "xxxxxx"], 4) == ["a  b", "xxxxxx"]
assert solve(["xxxxx", "yyyyy"], 4) == ["xxxxx", "yyyyy"]
assert solve(["abc", "de"], 3) == ["abc", "de "]
assert solve(["ab", "cde"], 5) == ["ab   ", "cde  "]
assert solve(["ab", "c"], 4) == ["ab c"]
assert solve(["a", "b"], 3) == ["a b"]
assert solve(["a", "b", "c"], 3) == ["a b", "c  "]
assert solve(["a", "b", "c", "d", "e"], 9) == ["a b c d e"]
assert solve(["a", "b", "c", "d", "e", "f"], 9) == ["a b c d e", "f        "]
assert solve(["a", "b", "c", "d", "ee", "f"], 9) == ["a  b  c d", "ee f     "]
assert solve(["one", "two", "three", "four"], 12) == ["one      two", "three four  "]
assert solve(["one", "two", "three", "four", "x"], 12) == ["one      two", "three four x"]
assert solve(["çok", "güzel"], 9) == ["çok güzel"]
assert solve(["çok", "güzel", "a"], 9) == ["çok güzel", "a        "]
assert all(len(line) == 20 for line in solve(["w" * (i % 7 + 1) for i in range(40)], 20))
