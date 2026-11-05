# bowling_score
Difficulty: hard

Implement `solve(rolls: list[int]) -> int | None`.

`rolls` lists the pins knocked down by each ball of one complete ten-pin bowling game. Return the total score, or `None` if the list is not exactly one valid complete game.

Validity:

- Every roll is an integer from 0 to 10.
- Frames 1-9: a roll of 10 on the first ball is a strike and ends the frame. Otherwise the frame has exactly two balls whose sum is at most 10.
- Frame 10: if the first ball is a strike, two more balls follow; if the first of those is also 10, the second may be 0-10, otherwise the two must sum to at most 10. If the first two balls of frame 10 (no strike) sum to exactly 10 (a spare), one more ball follows (0-10). Otherwise frame 10 has exactly two balls with sum at most 10.
- Too few rolls (incomplete game) or any roll after frame 10 is complete makes the input invalid.

Scoring: each frame scores its pins. A strike in frames 1-9 adds the next two rolls as a bonus; a spare in frames 1-9 adds the next roll. Frame 10 scores just the pins of its balls, with no further bonus. The empty list is invalid.

## Examples

- `solve([10] * 12) == 300`
- `solve([9, 1] * 10 + [9]) == 190`
- `solve([0] * 19) is None`
