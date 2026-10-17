# 🐣 Little Learners

A **game-first** learning app made for **kindergarteners (ages ~4–6)**. Everything is
picture-and-sound driven with big, tappable buttons — no reading needed. Kids learn by
playing, and collect **stars ⭐** and **trophies 🏆** to stay excited and keep going.

## What kids can do

Tap a game and play — each game reads its instructions aloud. There are **10 games**
covering early reading, math, and thinking skills:

**Letters & reading**
- **🔤 Letter Land** — meet a letter ("A is for Apple 🍎"), then tap the matching letter
- **🔊 Sound It Out** — beginning sounds: "Which one starts with B?" tap the picture
- **🎵 Rhyme Time** — find the picture whose name rhymes (cat → hat!)

**Numbers & math**
- **🔢 Count Along** — count the objects, then tap the right number
- **🚂 What's Next?** — finish the number train (1, 2, 3, … ?)

**Colors, shapes & thinking**
- **🎨 Color Pop** — listen, then tap the color that was named
- **🔷 Shape Detective** — hunt for the circle, star, heart and more
- **↔️ Opposites** — find the opposite (big → small, hot → cold)
- **🐄 Animal Sounds** — "Who says Moo?" tap the animal that makes the sound
- **🧩 Memory Match** — flip cards and find the matching animal pairs

**☀️ Summer School** (tap the button on the home screen) — five extra games built from the
incoming-Kindergarten summer packet, to get little ones ready for the school year:
- **🔤 First Sounds** — tap the letter a picture starts with
- **📖 Read a Word** — read a short word (cat, sun, bus) and tap its picture
- **🔢 Count & Match** — count the objects and tap the number
- **👀 Sight Words** — find the common word you hear (the, and, you, said…)
- **✏️ Finish the Sentence** — pick the word that completes a simple sentence

Finishing all five earns the **☀️ Summer Superstar** trophy.

Along the way they:

- **Earn a star ⭐** for every round they finish (shown in the top badge)
- **Win 16 trophies 🏆** — a 🏅 for finishing each of the 10 games, five ⭐ milestone
  trophies (10, 25, 50, 75 & 100 stars), and a 🎓 **Learning Champion** grand trophy for
  winning every game — all shown in a **Trophy Case**
- **Hear everything** — a 🔊 button repeats the instruction for pre-readers

## Kindness-first design

Made for the youngest learners:

- **No penalties** — a wrong tap just wiggles and gently says "try again". Kids keep
  trying until they get it, then get a happy celebration with confetti.
- **Read-aloud everything** — instructions and praise are spoken (speechSynthesis).
- **Big touch targets** — designed for small fingers on tablets and touchscreens.

## Learning skills it builds

- Letter recognition, beginning phonics, and rhyming (pre-reading skills)
- Counting, number recognition (1–9), and number sequencing
- Color and shape identification
- Opposites, listening, and animal knowledge
- Memory, focus, and confidence through play

## How to run

No installation needed — it's a plain web app.

1. Open the `kinder` folder.
2. Double-click **`index.html`** to open it in any modern web browser
   (Chrome, Edge, Firefox, Safari).

Works offline. Stars and trophies are saved in the browser, so progress is remembered
between visits. Tip: it shines on a **tablet or touchscreen**. Turn the sound on!

## Project structure

```
kinder/
├── index.html        # App layout & screens
├── css/
│   └── styles.css    # Big, playful, touch-first styling
└── js/
    ├── data.js       # Letters, numbers, colors, shapes, match emojis, games
    └── app.js        # Game engine, stars, trophies, read-aloud
```

## Adding more content

Open `js/data.js`. Add letters to `LETTERS`, colors to `COLORS`, shapes to `SHAPES`,
counting emojis to `COUNT_EMOJIS`, match emojis to `MATCH_EMOJIS`, rhyming families to
`RHYMES`, opposite pairs to `OPPOSITES`, or animals to `ANIMAL_SOUNDS` — the games build
their rounds from these pools automatically, no other code changes needed.
