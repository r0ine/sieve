# vending_machine
Difficulty: hard

Implement `solve(prices: dict[str, int], stock: dict[str, int], coins: dict[int, int], events: list[tuple]) -> list[str]`.

Simulate a vending machine and return one output line per event. Do not mutate the arguments. State:

- `credit`, starting at 0.
- A coin bank: `coins` maps each denomination to how many coins of it the machine holds. Its keys are also the only accepted denominations (a count may be 0).
- Item stock from `stock`; `prices` and `stock` have the same keys.

Events:

- `("insert", d)`: if `d` is an accepted denomination, the coin goes into the bank, `credit += d`, output `credit <credit>`. Otherwise output `reject <d>` and nothing changes.
- `("select", name)`: check in this order. If `name` is not a known item, output `unknown <name>`. Else if its stock is 0, output `sold out <name>`. Else if `credit < price`, output `need <price - credit>`. Otherwise the change is `credit - price`, paid from the bank (see below). If the change cannot be paid, output `no change` and nothing changes, credit included. On success, stock decreases by 1, the change coins leave the bank, credit becomes 0, and the output is `vend <name>` when the change is 0, otherwise `vend <name> change <coins>`.
- `("cancel",)`: if credit is 0, output `idle`. Otherwise pay out the whole credit from the bank the same way: on success credit becomes 0 and the output is `return <coins>`; on failure output `no change` and nothing changes.

Paying an amount: go through denominations from largest to smallest and take as many coins of each as possible without exceeding the remaining amount or the coins available. If the remaining amount is not 0 at the end, the payment fails, even if some other combination would have worked. Coins inserted earlier are already in the bank and can be paid out. `<coins>` lists the paid coins largest first, separated by commas without spaces, e.g. `25,25,10`.

## Examples

- `solve({"gum": 30}, {"gum": 2}, {100: 0, 25: 2, 10: 0, 5: 1}, [("insert", 100), ("select", "gum")]) == ["credit 100", "no change"]`
- `solve({"cola": 125}, {"cola": 1}, {100: 0, 25: 0}, [("insert", 100), ("insert", 50), ("insert", 25), ("select", "cola"), ("select", "cola")]) == ["credit 100", "reject 50", "credit 125", "vend cola", "sold out cola"]`
