# 🎮 Free Games Arcade

Quick, free, **educational mini-games** kids can play instantly — no lesson required.
Every game you finish earns **🎟️ tickets** that you spend on the **Prize Wheel** in the
[Rewards Center](../rewards).

## The games

- **➕ Quick Math** — fast addition, subtraction and multiplication (8 questions)
- **🔤 Word Scramble** — tap the letters in order to unscramble the word (with a picture hint)
- **🧠 Memory Match** — flip cards and find the matching pairs
- **🔍 Odd One Out** — spot the word that doesn't belong to the group

Each correct answer (or matched pair / solved word) earns a 🎟️ ticket.

## How tickets work

Tickets are saved in the shared browser storage (`rw_tickets`), so tickets you win here
show up in the **Rewards Center**, where you spend them on the **Prize Wheel** to win
collectible critters and bonus tickets. Everything is free and works offline.

## How to run

Open the `arcade` folder and double-click **`index.html`** in any modern browser.

## Project structure

```
arcade/
├── index.html
├── css/styles.css     # Bright arcade styling
└── js/
    ├── data.js        # Game list, scramble words, odd-one-out sets, memory faces
    └── app.js         # Four games + the shared ticket system
```

## Adding games or content

Add words to `SCRAMBLE_WORDS`, category sets to `ARCADE_ODD`, or card faces to
`ARCADE_MEMORY` in `js/data.js`. Quick Math questions are generated in `app.js`.
