# 🏁 Turbo Grand Prix

A **championship racing game** for **Grade 3**. You race three rival drivers
across an **8-race season**. Every question you answer correctly pushes your car
further down the track — answer **fast** and keep a **streak** alive to trigger
turbo. Whoever is furthest at the chequered flag wins the race.

Just open **`index.html`** in a web browser — no installation, works offline.

> This is the older sibling of [`speedway/`](../speedway) (the Kindergarten car
> game). Same idea — driving as the reward for thinking — but a season, rivals,
> typed answers and a tuning garage instead of tap-a-gate.

## What it covers

Eight Grands Prix, each with its own topic. Questions are **generated fresh**
every lap, so a race is never the same twice.

| # | Grand Prix | Subject | Skills |
| --- | --- | --- | --- |
| 1 | 🏁 **Opening Circuit** | Math | Times tables to 12 × 12, missing factors |
| 2 | 🌲 **Forest Sprint** | Math | Division facts and division with remainders |
| 3 | 🏙️ **City Street Race** | Math | Place value, rounding, 3-digit add/subtract with regrouping |
| 4 | 🍕 **Fraction Flats** | Math | Comparing fractions, equivalent fractions, fractions of a set |
| 5 | 📚 **Grammar Gorge** | English | Nouns, verbs, adjectives, adverbs, verb tense |
| 6 | 🔤 **Word Works Raceway** | English | Synonyms, antonyms, prefixes, suffixes |
| 7 | ✍️ **Punctuation Pass** | English | Punctuation, contractions, plurals, homophones |
| 8 | 🏆 **Champion's Final** | Mixed | Word problems, elapsed time, area & perimeter, context clues, figurative language |

## How a race works

1. **10 questions** per Grand Prix — multiple choice, plus typed answers for
   missing factors and big addition/subtraction.
2. A **speed bar** runs down over 14 seconds. The faster you answer, the bigger
   your speed bonus — but **running out never blocks you**. You can still answer
   and still move; you just don't get the bonus.
3. **3 correct in a row** lights up **🔥 TURBO** for a bigger push.
4. A wrong answer costs your streak, shows the correct answer, **and explains
   why** — then you keep rolling. There's no "game over".
5. At the flag, positions are decided by distance:

| Position | Championship points | 🔧 Parts |
| --- | --- | --- |
| 🥇 1st | 10 | 5 |
| 🥈 2nd | 6 | 3 |
| 🥉 3rd | 3 | 2 |
| 4th | 1 | 1 |

Championship points are kept on your **best** result for each race, so a re-run
can improve your season but never damages it. Parts are earned every time.

## 🛠️ The Garage

🔧 parts buy three upgrades (levels 0–3, costing 5 / 10 / 20 parts), and they
change the **real race maths**:

| Upgrade | What it does |
| --- | --- |
| ⚙️ **Engine** | Distance per correct answer: 9.0 → 11.4 m |
| 🛞 **Tires** | Bigger speed bonus (+3.0 → +4.5) and you keep rolling further after a miss |
| 🔥 **Nitro** | Turbo triggers at a 2-answer streak instead of 3, and pushes harder (+3 → +5) |

This is the catch-up mechanic: a driver getting ~6/10 wins about 4% of races in a
stock car and about **half** of them in a fully tuned one, while a driver who
answers all 10 correctly wins regardless. Knowing the material always wins; the
garage just helps everyone else stay in the fight.

The Garage also holds the **championship standings** table and the **8 trophies**.

## ⏱️ Time Trial

Practice any track with **no rivals and no pressure**. It records a personal best
but deliberately **scores no championship points** — it's for learning, not standings.

## Ranks

Your season points give you a rank: 🔰 Rookie → 🚗 Privateer → 🏎️ Pro Driver →
⭐ Ace → 👑 Legend (0 / 12 / 28 / 48 / 68 points).

## Where progress is saved

All in `localStorage` under the `gp_` prefix (per-learner namespaced by
`js/profile-store.js`):

| Key | What it holds |
| --- | --- |
| `gp_points` | 🏅 championship points (also shown in the Rewards Center) |
| `gp_season` | `{ gpId: { pos, pts } }` — your best result per race |
| `gp_parts` / `gp_earned` | 🔧 parts to spend / earned in total |
| `gp_upgrades` | `{ engine, tires, nitro }` levels 0–3 |
| `gp_trial` | Best Time Trial score per track |
| `gp_beststreak` | Longest answer streak |
| `gp_trophies` | Trophy ids earned |
| `rw_tickets` | **Shared** Prize Wheel tickets (Arcade + every app) |

## Adding more to the app

`js/data.js` is the only file you need:

- **A new topic** → add a function to `QMAKERS` returning
  `{ q, k:"pick", choices:[{label,key}], answerKey, why }` or
  `{ q, k:"type", answer, why }`, then list its name in a race's `gens`.
- **A new race** → add a `GRANDS_PRIX` entry. The calendar, season bar, standings
  table, Time Trial chips and the Track Master trophy all scale off the list length.
- **Difficulty** → `RIVALS[].pace`, `GP_LAPS`, `GP_ANSWER_SECONDS`, `UPGRADES`
  and `UPGRADE_COST` are all at the bottom of the file.

Every question pool carries its **own** wrong answers (`wrong: [...]`) rather than
borrowing distractors from other rows — that's deliberate, so a distractor can
never accidentally be a second correct answer.
