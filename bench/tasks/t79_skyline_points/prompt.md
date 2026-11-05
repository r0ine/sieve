# skyline_points
Difficulty: hard

Implement `solve(buildings: list[tuple[int, int, int]]) -> list[tuple[int, int]]`.

Each building is `(left, right, height)` with integers `left < right` and `height >= 0`; coordinates may be negative. The buildings are in no particular order and may overlap, touch, nest or repeat. A building covers the half-open range `left <= x < right`.

The skyline height at a real point `x` is the maximum height of the buildings covering `x`, or `0` if none covers it. Return the key points of the skyline as `(x, h)` tuples sorted by `x`: a key point is placed at every `x` where the skyline height just right of `x` differs from the height just left of `x`, with `h` the new height (the height at `x` itself). Far to the left the height is `0`.

Consequences: no two consecutive key points have the same height, there is no point where nothing changes (touching buildings of equal height merge, zero-height buildings never appear), and if the list is not empty the last point has height `0`. Empty input, or only zero-height buildings, returns `[]`.

## Examples

- `solve([(0, 2, 3)]) == [(0, 3), (2, 0)]`
- `solve([(0, 2, 3), (2, 4, 3)]) == [(0, 3), (4, 0)]`
- `solve([(0, 5, 2), (1, 3, 4)]) == [(0, 2), (1, 4), (3, 2), (5, 0)]`
