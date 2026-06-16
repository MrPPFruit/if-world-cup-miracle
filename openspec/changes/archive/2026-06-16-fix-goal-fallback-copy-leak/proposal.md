## Bug

High-scoring knockout reports can show repeated fallback goal copy such as `knockout-SF中国队第5次改写比分，记分牌只好继续加班。`

## Root Cause

`makeGoalLines` exhausts run-local unique goal-copy candidates in long runs. Its fallback factory then concatenates the internal `baseId` into visible text and reuses one sentence pattern for every remaining goal.

## Fix Goal

- Never expose internal line ids such as `knockout-SF` in visible commentary.
- Provide varied extra goal-copy candidates before fallback is needed.
- Add verification that generated narrative copy does not contain internal knockout ids.
