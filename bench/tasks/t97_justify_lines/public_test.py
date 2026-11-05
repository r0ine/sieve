from solution import solve

assert solve(["This", "is", "an", "example", "of", "text", "justification."], 16) == ["This    is    an", "example  of text", "justification.  "]
assert solve(["a", "b", "c", "d"], 6) == ["a  b c", "d     "]
assert solve(["a", "toolongword"], 5) == ["a    ", "toolongword"]
