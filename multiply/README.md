# 🚀 Times Table Takeoff

A summer math app that helps an **incoming 3rd grader** get ready for the school year by
mastering the multiplication facts to **12 × 12** — the exact skill the incoming-3rd-grade
teachers asked families to practice over the break.

> From the 2nd-grade teachers' summer letter: *"One of the foundational skills your child
> will need in 3rd grade is mastery of multiplication facts up to 12 × 12… Focus on skip
> counting… The goal is for students to enter 3rd grade fluent in their times tables."*

This app turns that advice into a fun, four-phase mission.

## The four phases (build fluency step by step)

1. **🪜 Skip Counting** — the foundation the teachers highlighted. Fill in the missing
   number in a count-by-N sequence (5, 10, ⬚, 20, 25). Do it for every number 2–12.
2. **📖 Learn a Table** — see a whole times table with its skip-count strip, and tap
   **🔊 Read the table to me** to hear every fact.
3. **✍️ Fact Practice** — practice one table until you master it (facts *and* missing-factor
   puzzles like `6 × ⬚ = 42`). Score 9/10 to earn the table's **gold star**.
4. **🚀 Fluency Blast-off** — a mixed, quick-fire round of facts from every table to build
   the automatic recall the teachers want. Beat your best score!

## Rewards that keep it fun

- **Points ⭐** for every correct answer
- **A Table Mastery board** — earn a gold star for each table you master (×2 through ×12)
- **Trophies 🏆** — Blast Off (first table), Skip-Count Star, Halfway to the Stars,
  Fluent Flyer, and the grand **Times Table Champion** for mastering every table
- **Read-aloud** on every question, so a child can hear the fact as well as see it

## How to run

No installation needed — it's a plain web app.

1. Open the `multiply` folder.
2. Double-click **`index.html`** to open it in any modern web browser.

Works offline. Points, mastered tables, and trophies are saved in the browser. Just
10–15 minutes a day — exactly what the teachers suggested!

## Project structure

```
multiply/
├── index.html        # App layout & screens
├── css/
│   └── styles.css    # Bright "blast off to fluency" styling
└── js/
    ├── data.js       # Phases, tables to master, trophies
    └── app.js        # Fact generation, the four phases, mastery & trophies
```

## Adding or changing content

Multiplication facts are **generated** in `js/app.js`, so there's no fact list to edit.
To change which tables are practiced, edit the `TABLES` array in `js/data.js`
(currently 2–12). Phase names and trophies also live in `data.js`.
