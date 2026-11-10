# 🐨 Koa's Reading Gym (Grade 3)

Reading-comprehension training with **Coach Koa the koala**. Reading is treated like a sport:
one "muscle" (strategy) per lesson, from easy Grade 1–2 texts up to strong Grade 3 thinking.
Open it from **My Academy → English** (units *Main Idea and Details*, *Characters and Point of
View*, *Text Structure: Cause and Effect*) or the Hub tile.

## How a lesson teaches (gradual release)

| Phase | What the child does |
|---|---|
| 📚 **Learn** | 3–4 strategy cards (read aloud) + a one-question check |
| 👀 **Watch Koa** | Preview (title, picture, predict, words to know) → read **one part at a time** (🔊 read-along highlight, Stop & Check questions, "did it make sense?" self-check) → Koa **thinks aloud** through Q1: the question word, key words, the proof sentence, crossing out traps |
| 🤝 **Together** | Coached steps: ① tap the key word (or question word) → ② tap the **proof sentence** in the text → ③ pick the answer. A wrong tap gets a hint, then the right one glows. |
| ⭐ **On my own** | A new passage. Answer, then **📌 Prove it!** by tapping the sentence (+bonus). 🧠 *Help me think* = hint ladder: strategy + key words → which part to look in → the proof itself. |

Question types: multiple choice (with ✗ cross-out from lesson 4), put-in-order, and sentence
builders (R.A.P. *Restate–Answer–Prove* and the ✋ *Somebody–Wanted–But–So–Then* summary).
From lesson 10 each question shows its QAR type (👉 Right There, 🧩 Think & Search, 🧠 Between the Lines).

## The ladder (15 lessons, 30 original passages, 108 questions)

🤍 White: Make a Movie in Your Mind · Question Words Are Clues · Right There! Find the Proof
💛 Yellow: Read Every Choice, Cross Out · First, Next, Last · Stop and Check
💚 Green: Word Detective (context clues) · Main Idea & Details · Cause & Effect · Think & Search
💙 Blue: Read Between the Lines (inference) · Character Detective · Answer in a Full Sentence (R.A.P.) · Sum It Up (SWBST)
🏆 Gold: Reading Champion Challenge (two passages, all question types, no coaching)

Standards: CCSS RL.3.1–3.3, RL.3.7, RI.3.1–3.4, RI.3.8, RF.3.4 · UK Y4 comprehension · Lgr22 Sv.

## Data & rewards

- Lessons in `js/data.js`; proof is stored as a **snippet** of the sentence (`ev`), not an index,
  so passages can be edited safely. `node test/readgym.js` checks every snippet hits exactly one sentence.
- Per learner (profile-store): `rg_points`, `rg_lessons {id: {done, stars, first, total, hints, proofs}}`,
  `rg_stickers` (lesson ids), `rg_trophies`, `rg_stats`. Stars = share of "On my own" questions right
  first time with no hints (≥85% ⭐⭐⭐, ≥50% ⭐⭐).
- Tracker logs every answer and `complete` per lesson (Admin, Insights, RewardKit); stickers give a
  Prize Wheel ticket (`rw_tickets`); Dollar Bank challenges: Reading Champion, all 15 lessons at 3 stars.
- Test hook: `window.ReadGym` (`start(id)`, `R`, `S`, `evIdx`).
