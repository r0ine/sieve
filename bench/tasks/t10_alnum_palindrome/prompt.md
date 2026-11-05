# alnum palindrome

Difficulty: easy

Write `solve(text: str) -> bool`.

Keep Unicode alphanumeric characters (str.isalnum), casefold each character, then check whether the resulting string is a palindrome. An empty normalized string is a palindrome. Casefold may expand a character into multiple characters.

Examples:
- `solve('A man, a plan, a canal: Panama') is True`
- `solve('ab') is False`
