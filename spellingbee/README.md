# 🐝 Buzzy's Spelling Bee (3rd grade)

Spelling-bee practice with Buzzy the bee, built from the **School Spelling Bee Study Words
2026–27** (`docs/Spelling Bee Word Lists 2026-27.pdf`). It opens from the **🐝 Spelling Bee**
card in the learner's Academy (Grade 3 only) and from the Hub's app grid.

## Word lists (`js/words.js`)

| List | Level | Words | Role |
|---|---|---|---|
| 1st grade | One Bee | 50 | warm-up |
| 2nd grade | One Bee | 50 | warm-up |
| **3rd grade** | One Bee | 50 | **my grade** (Daily Buzz, Hive Hero, Bee Champion) |
| 4th grade | Two Bee | 50 | challenge |
| 5th grade | Two Bee | 50 | super challenge |

Each word is `[word, meaning, sentence, alt?]`. `alt` is another accepted spelling
(fertiliser, pinata). Grades 6–8 (Three Bee) are left out as too hard for a 3rd grader;
a grown-up can add any word in Admin. Each list splits into 5 **honeycombs** of 10 words.

## Ways to practise (per honeycomb)

1. **📖 Learn**: big letter tiles (vowels pink), meaning, sentence, 🔊 say, 🐌 slow, 🔤 spell it to me.
2. **🧩 Missing Letters**: vowels and double letters are blanked first; type to fill.
3. **🔀 Unscramble**: tap jumbled honey tiles in order; a wrong try gives the first letter.
4. **🎧 Hear & Spell**: hear the word, ask for meaning, sentence (word hidden) or first letter, then type it.
   Green/red boxes show which letters were right. After 2 misses the word is spelled out and
   the child types it once to lock it in.
5. **🎤 Bee Contest**: a stage with judges and spotlights; Buzzy is the pronouncer. Ask
   "say it again", "definition", "sentence", "slowly" like a real bee. One try per word,
   3 hearts ❤️❤️❤️.

Plus: **☀️ Daily Buzz** (5 grade-3 words a day, unmastered first, same 5 all day, 🎟️ ticket),
**🫙 Tricky Jar** (every missed word; spelling it right removes it), **🎤 Grand Bee** (a whole
list, 3 hearts), **🧪 Practice tests** from Admin (Learn, Unscramble, scored Test, Contest).

**Mastery:** a word is mastered (🍯) after 2 first-try correct spellings in Hear & Spell,
Contest, Daily Buzz, Tricky Jar or a Test (no hints). A miss in those modes drops it a level
and drops it in the Tricky Jar. Missing Letters and Unscramble are practice: points only.

## Rewards

🍯 honey points (1 practice, 2 first try, 3 on stage), a sticker + 🎟️ Prize Wheel ticket for
every full honeycomb and every Grand Bee won, 10 trophies (`SB_TROPHIES`), Buzzy compliments
("Bee-autiful!", "Hive five!"), confetti. RewardKit stars/gifts come from `Tracker` reports.
Dollar Bank $1: **Bee Champion** (win the 3rd-grade Grand Bee) and **Hive Hero** (master all 50).

## Grown-up word sets (Admin → 🐝 Spelling Bee)

Stored in `hub_spellbee` (shared by all learners) by `../js/spellbee-store.js`. One word per
line: `word | meaning | sentence`, and `colour (or color)` for a second spelling. Sets can be
hidden, removed and restored, exported and imported. The Results table shows each learner's
mastered count, Tricky Jar and test scores (best, last, words missed last time).

## Saved progress (per learner)

`sb_points`, `sb_words` {word: {m 0–3, ok, bad, t}}, `sb_jar`, `sb_stickers` [{id, e, n}],
`sb_trophies`, `sb_daily` [days], `sb_tests` {setId: {best, last, tries, missed}}, `sb_stats`
(streak, best, unscr), `sb_list`, `sb_mute`.
