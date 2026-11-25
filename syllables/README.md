# 🥁 Bongo's Syllable Beats

Learn syllables with Bongo the drumming monkey. Plain HTML/CSS/JS, works offline, no build step.

- **Kindergarten** (`index.html#kg`, 8 lessons): one clap → compound words → two-beat animals and food → one or two? → three beats → four beats → Beat Master Challenge.
- **Grade 3** (`index.html#g3`, 11 lessons): beat warm-up → compound words → VC/CV → open V/CV → closed VC/V → silent-e → consonant+le → vowel teams and bossy R → prefixes and suffixes → big grade-level words → Syllable Master Challenge.

Without a hash the learner's grade picks the track (Pre-K–G2 → KG, G3+ → G3). Lessons open one after another, from easy to grade level.

## A lesson
1. **👀 Learn**: one word card at a time. Coloured syllable chips (tap one to hear that beat), "Clap it with me" (a drum beat per syllable, then the whole word) and a **💡 fun memory note**. After the words come a **🧠 memory trick** and **😂 Bongo's Joke Drum** (tap for the punchline).
2. **🎯 Quiz**: 6 mixed questions (10 in a challenge). Each one gets two tries, kind words after a miss, and the answer clapped out after the second miss. Kinds:
   - `count`: how many claps
   - `pick`: which picture has N claps (KG)
   - `jumble`: tap the jumbled syllable cards in order
   - `missing`: which beat is missing
   - `chop`: tap between the letters to cut (G3)
   - `rule`: which split is right (G3)
   - `build`: match front and back chunks into 3 words (G3)
3. **🎤 Read to Bongo**: the child reads words (G3 also reads a sentence) into the mic. It is graded by `../js/readlevel.js` (🐣 Easy → 🏆 Expert), so close tries count early on. Without a mic, a grown-up taps "✅ I read it!".
4. **🎉 Party**: stars from first-try answers, a sticker, and the lesson's joke goes into the **Joke Box**.

The challenge needs 8 of 10 right on the first try. Winning it gives a trophy (`kg-master` / `g3-master`), which is a $1 challenge in `js/dollars.js`.

## Files
- `js/data.js`: lessons and words. Use `W("rab-bit", "🐰", "fun note", say?)`, where `-` marks the syllables and `say` gives read-aloud sounds for chunks the voice would spell out (`ble` → `bull`).
- `js/listener.js`: a copy of `phonics/js/listener.js` with its own sound-alikes. A one-word target also accepts the word said in chunks ("cup cake").
- `js/app.js`: screens and games.
- Tests: `node test/syllables.js`.

Storage (per learner): `sy_points`, `sy_lessons`, `sy_stickers`, `sy_trophies`, `sy_jokes`, `sy_stats`, `sy_mute`, `rl_syllables`.
