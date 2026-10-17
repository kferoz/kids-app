# 🗺️ Grammar Treasure Hunt

A pirate **treasure-map adventure** that turns English grammar practice into a quest.
Made for **elementary students (grades 1–4)**: sail an island map, solve a grammar
clue at every stop to move your ship forward, and dig up the buried treasure at the X!

## What kids can do

- **Pick a map** — five treasure adventures, each a themed grammar route:
  🏝️ Noun Bay · 🌋 Verb Volcano · 🪸 Adjective Reef · ⚓ Capital & Comma Cove ·
  🗺️ Mixed Treasure Lagoon
- **Follow the route** — a dashed sailing trail across island stops; the ship ⛵ hops
  forward each time a clue is solved, all the way to the 💰 where **X marks the spot**
- **Solve grammar clues** — one multiple-choice question per stop (nouns, verbs,
  adjectives, pronouns, capitalization & punctuation) with instant, friendly feedback
- **Listen** — a 🔊 button reads each clue aloud (great for early readers)
- **Collect gold coins 🪙** — earn a coin for every clue solved, plus a treasure bonus
  for reaching the X
- **Win trophies 🏆** — a 🏅 trophy for conquering each map, and a 👑 **Master Treasure
  Hunter** trophy for finishing all five — shown in a **Treasure Trophies** shelf
- **Earn up to 3 ⭐** per hunt — a flawless voyage (no wrong turns) earns all three

## Kind by design

- **No penalties** — a wrong answer just wiggles and says "try again, matey"; you keep
  trying until the clue is solved, so every child sails on and finishes the hunt.
- Keyboard-friendly: press **1–4** to pick an answer.

## Learning skills it builds

- Recognizing parts of speech (nouns, verbs, adjectives, pronouns) in real sentences
- Capitalization and end punctuation
- Reading and listening comprehension (read-aloud on every clue)
- Persistence and confidence through a rewarding, encouraging quest

## How to run

No installation needed — it's a plain web app.

1. Open the `treasure` folder.
2. Double-click **`index.html`** to open it in any modern web browser
   (Chrome, Edge, Firefox, Safari).

Works offline. Gold coins and trophies are saved in the browser, so progress is
remembered between visits.

## Project structure

```
treasure/
├── index.html        # App layout & screens
├── css/
│   └── styles.css    # Pirate treasure-map styling (parchment on a deep-teal sea)
└── js/
    ├── data.js       # The five ADVENTURES: routes + grammar clues
    └── app.js        # Game logic: map route, ship, clues, coins, trophies
```

## Adding more maps or clues

Open `js/data.js`. Each entry in `ADVENTURES` is
`{ id, name, emoji, blurb, route: [emoji per stop], clues: [{ q, options, answer }] }`.
Copy an existing adventure to add a new map — the home picker, the map route, and the
trophy shelf all update automatically. Keep `route` the same length as `clues`.
