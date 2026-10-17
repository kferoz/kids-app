# 🔍 Reading Detectives

A **reading-comprehension journey for 3rd graders**, hosted by **Roco the
Raccoon** 🦝. The big idea: *every story is a mystery to solve.* Kids read short,
fun passages ("case files") and use clues to answer comprehension questions,
working through **15 numbered Cases** that unlock in order and take a reader from
**beginner to expert**.

Just open **`index.html`** in a web browser — no install, works offline.

## The north-star skill ladder (Cases 1 → 15)

Each case teaches one core comprehension skill, in a research-based order that
builds on the last:

| # | Case | Skill |
| --- | --- | --- |
| 1 | Who & Where? | Characters & setting |
| 2 | What Happened? | Plot & events |
| 3 | Put It In Order | Sequencing (with a tap-to-order game) |
| 4 | The Big Idea | Main idea & details |
| 5 | What Happens Next? | Making predictions |
| 6 | Between the Lines | Making inferences |
| 7 | Why Did It Happen? | Cause & effect |
| 8 | Secret Word Clues | Context clues / vocabulary |
| 9 | Same & Different | Compare & contrast |
| 10 | Fact or Opinion? | Fact vs. opinion |
| 11 | Why Write It? | Author's purpose (PIE) |
| 12 | The Big Lesson | Theme, drawing conclusions & summarizing |
| 13 | The Trouble & The Fix | Problem & solution |
| 14 | Nonfiction Detective | Nonfiction text features (headings, bold words, captions) |
| 15 | The Master Case | All skills combined — a mixed final mystery (with a tap-to-order game) |

Passages grow longer and richer as the cases go on.

## How a case works

1. **Detective Tip** — Roco teaches the skill in kid-friendly language (read-aloud).
2. **Case File** — a leveled passage to read, with a 🔊 *"Read it to me"* button.
3. **Solve the clues** — comprehension questions (multiple choice), plus
   **tap-to-order** sequencing on the sequence & summarizing cases.

Kindness-first: a wrong answer just says *"Look again, detective!"* — no penalty,
try again. Correct answers in a row build a 🔥 **combo streak**.

## Rewards & gadgets 🎉

- **⭐ Points** — +10 per clue solved.
- **🎟️ Stickers** — a themed detective sticker for each case, kept in your **Sticker Book**.
- **🎖️ Ranks** — level up as you solve cases: Rookie Reader → Junior → Sharp-Eye →
  Ace → **Master Detective**, shown on a **Power Meter**.
- **🏆 Trophies** — Case Opened, On the Case, Hot Streak, Flawless Detective,
  Clue Wizard, and the grand **👑 Reading Detective Chief** for solving all 12.
- **🎒 Detective Kit** (gadget room) — Sticker Book, rank ladder, trophy wall,
  a **Case File Bookshelf** of every passage you've read, and your best streak.
- **🔦 Clue Hunt** — a replayable bonus vocabulary game (context clues, quick-fire)
  that earns 🎟️ tickets for the hub's Prize Wheel.

Points, stickers and tickets also flow to the shared **Rewards Center**. Progress
saves automatically in your browser (`localStorage`, `rc_` keys).

## Files

```
detectives/
├── index.html        # screens: Home, Cases, Case player, Reward, Detective Kit, Clue Hunt
├── css/styles.css    # detective "case file" theme (navy + manila + gold)
└── js/
    ├── data.js       # the curriculum: CASES, CLUE_HUNT, RANKS, RC_TROPHIES
    └── app.js        # the case engine (teach/read/pick/order steps, rewards, storage)
```

**Add a case:** append a case object to `CASES` in `data.js` (no code changes —
the engine is data-driven). **Add Clue Hunt words:** append to `CLUE_HUNT`.
