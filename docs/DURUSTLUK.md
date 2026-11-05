# Honesty rules

Limits to follow when sharing results. A number that breaks a rule stays out of the report.

1. **No quality claims without a measurement.** Phrases like "more accurate", "more reliable" or "improves the model" are written only with a number measured on the same task set under the same conditions. Without a measurement, the sentence isn't written.

2. **The oracle ceiling is not presented as a selection result.** The oracle is the share of tasks where at least one candidate passed; no selector can reach it. It goes on its own row in the table, labeled "unreachable upper bound", and never in the success column.

3. **The hidden test is never used for selection.** It only measures the outcome. The selector decides with the public test, or with a fixed rule when there is none; mixing the hidden test into selection makes the measurement meaningless.

4. **Numbers are reported with their conditions.** Every result carries at least the model name, temperature, number of candidates and run date. If any of these is missing, the number can't be reproduced and doesn't go in the report.

5. **Model code only runs in a restricted setting.** Generated code first passes the banned-pattern check, runs in a temporary directory and is subject to a timeout. The filter is not a security guarantee, so the code is never run in the main working directory or in a privileged environment.

6. **Comparisons use equal conditions.** A single attempt, N candidates plus selection and, where used, the strong model are compared on the same task set, with the same prompts and the same scoring. Percentages from different sets are not placed side by side.

7. **Cost is not hidden.** Every result comes with its token count. A gain is never shown without the tokens spent.

8. **Failed calls are counted separately.** Timeouts, empty responses and API errors are reported as failures, not silently dropped.

9. **A small set means a small claim.** The 50-task set is not a general measure of ability. Results are written as "on this set, under this condition".
