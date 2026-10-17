# 🦉 Reading Trail

A **learn-to-read adventure** for early elementary students (great for 2nd–3rd graders
building fluency). Guided by **Ollie the Owl**, kids climb a trail of ten stages that
follow how reading is actually taught — from letter sounds all the way to reading a whole
story — earning **points, collectible stickers, and trophies** along the way.

## How it teaches reading (stage by stage)

The trail follows a research-based order used by classroom teachers. Each stage unlocks
the next, so kids build skills in the right sequence:

1. **🔤 Letter Sounds** — hear a word, find the letter that makes its first sound
2. **🔠 Blends & Digraphs** — two letters, one sound (sh, ch, th, bl, st)
3. **🏠 Word Families** — rhyming words (cat, hat, bat) to unlock reading by pattern
4. **👏 Clap the Syllables** — break words into beats you can clap
5. **🔊 Blend the Sounds** — slide sounds together: c–a–t… cat!
6. **🧩 Chunk the Syllables** — read long words one chunk at a time (rab·bit, sun·flow·er)
7. **👀 Sight Words** — instantly recognize common words (said, was, they, because)
8. **💬 Read the Sentence** — read a whole sentence and match its meaning
9. **⚡ Fluency Phrases** — read smoothly with a "read-along" word highlight
10. **📚 Story Time** — read a short story and answer comprehension questions

## Fun & rewards that keep kids engaged

- **Read-aloud everywhere 🔊** — Ollie can say any sound, word, syllable, phrase, or
  story, so a child who is still learning can always hear it modeled
- **Interactive by design** — clap out syllables, tap chunks to hear them, blend sounds,
  and follow the karaoke-style highlight while reading along
- **Points ⭐** — earn a reading point for every step you complete
- **Collectible stickers 🎟️** — finish a stage and win its sticker for your **Sticker Book**
  (10 to collect: Sound Star, Clap Champ, Chunk Master, Bookworm and more)
- **Trophies 🏆** — First Steps, Reading Sprout, Word Wizard, Perfect Reader (a flawless
  stage), and the grand **Reading Champion** for finishing the whole trail
- **Kindness-first** — a wrong answer just says "give it another go" — no penalties, so
  every child keeps going and succeeds

## How to run

No installation needed — it's a plain web app.

1. Open the `reading` folder.
2. Double-click **`index.html`** to open it in any modern web browser.

Works offline. Points, stickers, and trophies are saved in the browser, so progress is
remembered between visits. **Turn the sound on** — it's a reading app!

## Project structure

```
reading/
├── index.html        # App layout & screens
├── css/
│   └── styles.css    # Sunny "reading garden" trail styling
└── js/
    ├── data.js       # The 10 READING_STAGES + trophies
    └── app.js        # Trail, five activity engines, points, stickers, trophies
```

## Adding more stages or practice

Open `js/data.js`. Each entry in `READING_STAGES` has an `activity` type
(`pick`, `clap`, `soundout`, `karaoke`, or `story`) plus its `rounds` and a `sticker`.
Copy the pattern of an existing stage of the same activity to add more practice — the
trail, sticker book, and trophies all update automatically.
