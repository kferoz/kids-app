# 🦉 Times Table Quest (G3)

Imported from `docs/times-table-quest.zip` (2026-10-28). Chapter 4 "Multiplication Tables" test prep:
×/÷ facts, missing factor/divisor/dividend, even/odd, "which equation is correct", pack word problems.
Modes: Practice (10, hints), Challenge (12, mixed), Exam (20, 25 s each, no hints). Full spec in `PRD.md`.

## Hub changes on top of the original
- Loads profile-store → voice → activitydb → tracker (`data-app="timesquest"`) → dollars → kidbar.
- Greets the Hub's logged-in learner instead of a name box.
- Kid-side "Reset progress" removed: resets belong to Admin (keep-student-data rule).
- 🔊 read-aloud on every question; Enter presses Next after a wrong answer.
- `Tracker.answer` per first try, `Tracker.complete(mode, firstTryRight, size)` per round.
- $1 challenges (js/dollars.js): Exam Mode 18+/20, and a perfect 20/20.

Save key: `timesTableQuest_v2` (per learner). Overlaps `multiply/` (Times Table Takeoff) on ×, but this one adds ÷,
missing numbers and a test simulation.
