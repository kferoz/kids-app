# 🎓 Homeschool Academy

A **numbered homeschool lesson path** in **Math** and **English**, hosted by
**Ziggy the robot** 🤖. Kids work through lessons **1, 2, 3…** that unlock in
order, earning points, collectible stickers, badges and trophies along the way.

Just open **`index.html`** in a web browser — no installation, works offline.

## Who it's for

Two complete levels, four numbered curricula (**20 lessons each = 80 lessons**):

| Track | Level | What it covers |
| --- | --- | --- |
| 🐣 **Kindergarten · Math** | Ages 4–6 | Counting to 20, more/fewer, number order, counting on, shapes, adding & taking away, patterns, sorting, positions, comparing sizes, ways to make 10, doubles, skip counting by 2s & 10s, measuring |
| 🐣 **Kindergarten · English** | Ages 4–6 | Upper/lowercase letters, beginning & ending sounds, vowels, rhyming, sight words, word families, nouns & verbs, building & reading words, sh/ch digraphs, capital letters, question words |
| 🎒 **Grade 3 · Math** | Grade 3 | Place value, regrouping add/subtract, times tables 2–12, division & remainders, fractions, word problems, rounding, time, money, area & perimeter, division facts, elapsed time, bar graphs, multi-step problems |
| 🎒 **Grade 3 · English** | Grade 3 | Nouns, pronouns, verbs & tenses, adjectives/adverbs, synonyms/antonyms, prefixes/suffixes, contractions, homophones, plurals, punctuation, sentences, context clues, sentence parts, figurative language & reading |

## How a lesson works

Each lesson is a short sequence of **steps**:

- **Teach** — Ziggy explains the idea (with read-aloud).
- **Practice** — tap-the-answer questions, counting games (for the little ones),
  and typed answers (for Grade 3).

Kindness-first: a wrong tap just says *"good try — pick another!"* with no penalty.
Early-reader friendly with **read-aloud** on every step (tap 🔊 to toggle sound).

## Rewards 🎉

- **⭐ Points** — +5 for every correct answer.
- **🎟️ Stickers** — a new collectible sticker each time you finish a lesson,
  saved in your **Sticker Book** (Trophy Room).
- **🎖️ Badges** — for total lessons done (Bronze → Master Scholar).
- **🏆 Trophies** — First Lesson, Bookworm, Rising Star, Class Graduate, and the
  grand **👑 Valedictorian** for finishing every lesson in every track.
- Finishing a lesson also drops a **🎟️ ticket** into the shared **Rewards Center**
  Prize Wheel, and your points/stickers show up there too.

Progress is saved automatically in your browser (`localStorage`, `hs_` keys).

## Files

```
homeschool/
├── index.html        # screens: Home, Path, Lesson, Reward, Trophy Room
├── css/styles.css    # academy theme (indigo + gold, per-track colors)
└── js/
    ├── data.js       # the curriculum: TRACKS, lessons, badges, trophies
    └── app.js        # the lesson engine (steps, rewards, storage)
```

**Add a lesson:** append a lesson object to the right track array in `data.js`.
**Add a track:** add an entry to `TRACKS`. No code changes needed — the engine is
fully data-driven.
