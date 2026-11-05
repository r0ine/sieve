# number_words
Difficulty: hard

Implement `solve(n: int) -> str`.

Spell the integer `n` in American English words, where `-10**15 < n < 10**15`. Output is lowercase, words are separated by exactly one space, with no leading or trailing space and no punctuation other than hyphens.

- `0` is `zero`. A negative number is `minus ` followed by the words for its absolute value.
- 1-19: `one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen`.
- Tens: `twenty thirty forty fifty sixty seventy eighty ninety`. A number 21-99 that is not a multiple of ten joins tens and unit with a hyphen: `forty-two`.
- Hundreds: `<unit> hundred`, followed by a space and the words for the remainder 1-99 if it is nonzero. Never use `and`: 105 is `one hundred five`.
- Split the absolute value into groups of three digits from the right. Each nonzero group is spelled as above and followed by its scale word: `thousand`, `million`, `billion`, `trillion` (none for the lowest group). Groups equal to zero are skipped entirely. 1100 is `one thousand one hundred`, never `eleven hundred`.

## Examples

- `solve(342) == "three hundred forty-two"`
- `solve(1000010) == "one million ten"`
- `solve(-7) == "minus seven"`
