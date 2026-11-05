# transactional_stack
Difficulty: hard

Implement `solve(operations: list[list]) -> list[list[int]]`.

Run a stack machine with operations `["push", integer]`, `["pop"]`, `["dup"]`, `["swap"]`, `["add"]`, `["sub"]`, `["begin"]`, `["commit"]`, and `["rollback"]`. Pop removes the top value and appends it to a separate pop-results list. Dup copies the top value. Swap exchanges the top two. Add and sub remove the top two values and push, respectively, `second + top` or `second - top`.

Begin saves both the current stack and the current pop-results list. Commit discards the most recent save while keeping all changes; rollback restores both saved values. Transactions may nest: rolling back an outer transaction also undoes changes made in inner transactions that were committed. Input is guaranteed to have enough stack values for each operation and every begin is matched by a later commit or rollback. Return `[final_stack, pop_results]`. Values are exact Python integers.

## Examples

- `solve([["push", 4], ["push", 2], ["sub"]]) == [[2], []]`
- `solve([["push", 1], ["begin"], ["pop"], ["rollback"]]) == [[1], []]`
