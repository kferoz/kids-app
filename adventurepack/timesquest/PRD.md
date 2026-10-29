# Product Requirements Document: Times Table Quest

**Version:** 1.0
**Status:** Draft for parent app integration
**Platform:** Web app (single HTML file, runs in any modern browser on phone, tablet, or computer, offline after first load)
**Audience:** Primary: students in Grade 3 (ages 8–9). Secondary: parents and teachers who set up practice.

---

## 1. Purpose

Help a Grade 3 student master multiplication and division facts for the Chapter 4 "Multiplication Tables" unit and prepare for the chapter test. The app turns repetitive drill into a game with points, streaks, levels, and badges so the child chooses to practice.

## 2. Goals and Non-Goals

**Goals**
- Build fluency with multiplication and division facts for the tables covered in the worksheet (6, 7, 8, 9, 11, 12), with the option to practice all tables 1–12.
- Cover the same question formats used on the worksheet and the Assessment Prep page: fill-in-the-blank, missing factor, missing divisor, missing dividend, even/odd rules, "which equation is correct," and word problems.
- Keep the child motivated through immediate feedback, points, streaks, levels, and badges.
- Give the parent a clear sense of which tables need more work.
- Simulate the test (timed, no hints) so the child practices under test conditions.

**Non-goals (v1)**
- No user accounts, logins, or cloud sync.
- No advertising, in-app purchases, or social features.
- No chat, messaging, or user-generated content.
- No curriculum content beyond multiplication and division facts.

## 3. Users and Context

| User | Context | Needs |
|---|---|---|
| Child (8–9) | Phone or tablet, short sessions (5–15 min), studying for a test | Big targets, clear feedback, fun rewards, no reading-heavy screens |
| Parent | Sets up practice, reviews progress, integrates with the parent app | Simple setup, visible progress, weak-table advice, no ads or data sharing |
| Teacher (secondary) | Assigns practice | Predictable content mapped to the chapter |

## 4. Key Features

### 4.1 Home Screen
- Name entry (optional, stored on device only).
- Table picker: tap any of 1–12 to toggle. A "Worksheet tables" shortcut selects 6, 7, 8, 9, 11, 12. "All" selects 1–12.
- Three game modes (see 4.2).
- Level indicator, total points, and badge shelf (locked badges shown in grey).
- "Reset progress" with a confirmation prompt.

### 4.2 Game Modes

| Mode | Questions | Timer | Hints | Wrong answers | Purpose |
|---|---|---|---|---|---|
| Practice | 10 | None | Yes (−2 pts) | Re-queued once at the end | Learning and drill |
| Challenge | 12 | None | Yes (−2 pts) | Re-queued once at the end | Mixed review including word and assessment-style questions |
| Exam Mode | 20 | 25 seconds per question | No | Not re-queued | Test simulation |

### 4.3 Question Types

| Type | Example | Input |
|---|---|---|
| Multiplication | `8 × 7 = ?` | Number pad |
| Missing factor | `? × 6 = 36`, `6 × ? = 36` | Number pad |
| Division | `42 ÷ 6 = ?` | Number pad |
| Missing divisor | `42 ÷ ? = 6` | Number pad |
| Missing dividend | `? ÷ 9 = 7` | Number pad |
| Word problem (packs) | "Alexa bought 36 fruit bars that came in packs of 4. How many packs?" | Number pad |
| Even or odd | "Is 7 × 9 even or odd?" | Two buttons |
| Which equation is correct | 4 options, one correct | Tap an option |

Numbers are generated from the selected tables. Factors range 1–12. Division questions always have whole-number answers.

### 4.4 Scoring and Rewards

| Event | Points |
|---|---|
| Correct answer | +10 |
| Quick-thinker bonus (answered within 5 s, no hint used) | +5 |
| Fire bonus (every 5 correct in a row) | +20 |
| Hint used | −2 (total score cannot go below 0) |
| Wrong answer | 0 (question returns later in Practice and Challenge) |

**Stars at round end** (based on first-try correct answers out of the round size):
- 3 stars: 90% or more
- 2 stars: 70% to 89%
- 1 star: below 70%

**Levels:** every 100 total points = 1 level. Level titles: Number Rookie, Times Table Explorer, Multiplication Ninja, Division Hero, Math Champion, Grand Master (the last title applies to all levels from 6 upward).

**Badges**

| Badge | Condition |
|---|---|
| ⭐ First Star | First point earned |
| 🔥 On Fire | Streak of 5 correct in a row |
| 💯 100 Points | Total of 100 points |
| 🏆 Perfect Round | Every question correct on the first try |
| 🎓 Exam Ready | 18 or more first-try correct in Exam Mode |
| 🥇 Table N Champ (×12) | 15 correct answers on table N (tables 1–12) |

### 4.5 Feedback
- **Correct:** green confirmation with a random encouraging phrase, the points earned, a happy mascot expression, a success sound, and confetti at 5-in-a-row.
- **Incorrect:** red message showing the right answer, an encouraging line, a short error sound, and a "Next" button (the child controls the pace).
- **Time's up (Exam Mode):** same as incorrect, labelled "Time's up!"
- **Mascot:** owl emoji that reacts to correct and incorrect answers.

### 4.6 Results Screen
- Star rating, first-try score, points earned, total points, and level.
- Badges unlocked this round, highlighted.
- Weak-table advice: the top three tables by error count this round.
- Exam Mode outcome: "You are ready for your test!" (90% or more) or a list of tables to practice for 10 minutes before retrying.
- Buttons: Play again (same mode) or Home.

### 4.7 Input and Accessibility
- Large on-screen number pad (buttons at least 48 px tall).
- Physical keyboard supported: digits, Backspace, Enter.
- Single-tap answer selection for multiple-choice questions.
- Colour is not the only signal: correct and incorrect states also show icons and text.
- Sounds are short and non-startling. Sound can be muted by the device volume (v1 has no mute toggle; see Roadmap).

## 5. Content Specification

### 5.1 Worksheet Alignment
Source: Chapter 4 Multiplication Tables, Chapter Review pages 301 and 304.

| Worksheet section | Covered by |
|---|---|
| Sections 1–6: ×/÷ facts for tables 6, 7, 8, 9, 11, 12 (both directions and missing numbers) | Multiplication, missing factor, division, missing divisor, missing dividend |
| Assessment 7–9: even and odd rules | Even or odd question type |
| Assessment 10: select the correct equations | Which equation is correct type |
| Assessment 11: missing box | Missing factor and missing divisor |
| Assessment 12: packs word problem | Word problem type |

### 5.2 Content Notes for Review
- **Odd × even rule:** the correct answer is always **even**. The worksheet at page 304, question 9 was marked "odd." The app teaches the correct rule ("Even × anything = even. Odd × odd = odd.").
- **Word-problem units:** answers ask for **packs**, not individual items.
- Content is generated, not stored as a fixed list. This gives effectively unlimited practice while keeping the same question forms.

## 6. Data, Privacy, and Safety

- **Storage:** all progress is saved in the browser's local storage on the device. Nothing is sent to a server.
- **Data collected:** the child's optional first name and game progress (points, badges, best streak, per-table correct counts, Exam Mode best). No email, location, device ID, or behavioral tracking.
- **Third parties:** none. No analytics, ads, or external scripts. Fonts use the system font stack.
- **Child privacy:** designed to align with COPPA and GDPR-K principles: no accounts, no personal data beyond an optional name, no external communication, no in-app purchases.
- **Parent control:** the parent can reset all progress from the home screen. (Deleting browser data also clears it.)
- **Content safety:** arithmetic only. No user-generated text other than the optional name, which is displayed only on the device.

## 7. Technical Requirements

- Single self-contained HTML file (HTML, CSS, and JavaScript inline). No build step.
- Works in current Chrome, Safari, Edge, and Firefox on iOS, Android, Windows, macOS, and ChromeOS.
- Load time under 1 second on a typical mobile connection (file size under 30 KB).
- Responsive layout from 320 px to 1920 px wide.
- Works offline once loaded.
- Uses the Web Audio API for sound. If audio is unavailable the app still works silently.
- Uses `localStorage` with a try/catch fallback. If storage is blocked, progress resets each visit but the game still runs.

## 8. Integration with the Parent App

| Integration point | Requirement |
|---|---|
| Launch | Open the HTML file in a WebView or iframe, or link to a hosted URL |
| Progress read | Parent app reads the `timesTableQuest_v2` key from storage (same origin) or a future export API |
| Progress export (proposed) | Export JSON: `{points, badges, tableWins, bestStreak, examBest}` for a parent dashboard |
| Session reporting (proposed) | `postMessage` event after each round: `{mode, correctFirst, size, weakTables, date}` |
| Authentication | None in v1. Parent app is responsible for any login. |

## 9. Success Metrics

- **Engagement:** at least 3 rounds per active week per child.
- **Learning:** first-try accuracy on worksheet tables rises above 85% within two weeks of regular use.
- **Test readiness:** Exam Mode first-try score of 18/20 or better before the chapter test.
- **Retention:** 4 or more active weeks out of 6.
- **Quality:** no runtime errors across the supported browsers in the test matrix.

## 10. Acceptance Criteria

1. Selecting the worksheet tables and starting Practice produces only questions using tables 6, 7, 8, 9, 11, 12.
2. A correct answer adds 10 points, plus 5 if answered within 5 seconds without a hint.
3. The 5th consecutive correct answer adds the fire bonus of 20 points and shows confetti.
4. Using a hint deducts 2 points and removes the speed bonus for that question.
5. A wrong answer shows the correct answer and a Next button. In Practice and Challenge, the question returns once at the end of the round.
6. In Exam Mode, a 25-second timer counts down. Expiry counts as wrong and advances the round. No hints are shown.
7. The results screen shows the correct star rating, first-try score, and weak tables.
8. Badges persist after closing and reopening the browser.
9. Reset progress clears all saved data after confirmation.
10. The number pad and physical keyboard both enter answers. Backspace removes a digit. Enter submits.
11. The even/odd question for an odd × even product returns "even."
12. The word-problem answer is the number of packs (product ÷ items per pack).

## 11. Roadmap

**v1.1**
- Sound mute toggle on the home screen.
- Text-to-speech read-aloud for the question (for early readers).
- Parent view: progress summary by table with a simple chart.

**v1.2**
- Export progress as JSON or CSV for the parent app.
- Adjustable exam timer (15, 25, 40 seconds).
- Custom practice sets selected by the parent.

**v2.0**
- Multiple child profiles on one device.
- Spaced-repetition scheduling: tables with more errors appear more often.
- Assignments from a teacher or parent, with due dates.
- Grade 4 content (division with remainders, multi-digit multiplication).

## 12. Open Questions

1. Should the parent app host the game in an iframe, or should it be a standalone link?
2. Does the parent want a PIN to access settings and reset progress?
3. Should practice content follow the school's pacing calendar, or stay on the full 1–12 range?
4. Is a sound mute toggle required before launch?
5. Which languages are needed? The current build is English only.

## 13. Known Limitations (v1.0)

- Progress is per browser and per device. It does not sync across devices.
- Clearing browser data erases progress.
- Word-problem names and objects are fixed in code.
- The worksheet's exact question order is not reproduced. Questions are randomised within the same forms.
- Only English text.
