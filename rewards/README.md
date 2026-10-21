# 🎁 Rewards Center

One place to see **everything you've earned across all the learning apps** — plus fun
gadgets to play with: a **Prize Wheel** and a **Critter Collection**.

## What's inside

### 📊 My Progress
Because all the apps share the same browser storage, the Rewards Center reads each app's
saved points, stars, coins and trophies and shows them together:
- **Grand totals** — all rewards earned, all trophies won, and how many apps you've played
- **A card for every app** with its own totals and a shortcut to open it
- **Hub Badges** — special cross-app milestones (Explorer, Trophy Collector, All-Star,
  Reward Legend…). Earning one gives you **bonus 🎟️ tickets**!

### 🎡 Prize Wheel (gadget)
Spend a 🎟️ ticket to spin the wheel and win **collectible critters** or **bonus tickets**.
Earn tickets by playing the [Free Games Arcade](../arcade).

### 🎟️ Stickers
Every sticker from every app in one album (from `js/kidbar.js`; an app's stickers show here after it has been opened once).

### 💵 Dollars
The Dollar Bank: every $1 challenge in every app, what's earned, and what a grown-up has already handed over.

### 🐾 My Critters (gadget)
A collection of 12 friendly critters (Sparkle the unicorn, Rex the dino, Hoot the owl…)
that you unlock by spinning the Prize Wheel.

## How it works

- Learning apps save rewards under their own keys (`gg_stars`, `tt_points`, `th_coins`…).
- All apps are opened as `file://` pages, which share one browser storage, so this page
  can total them all up. Nothing is sent anywhere — it works fully offline.
- The Rewards Center saves its own data (tickets, critters, badges) under the `rw_` prefix.

## How to run

Open the `rewards` folder and double-click **`index.html`** in any modern browser. Play the
other apps and the Arcade first to fill it up!

## Project structure

```
rewards/
├── index.html
├── css/styles.css     # Festive gold + purple styling
└── js/
    ├── data.js        # App registry, hub milestones, critters, wheel segments
    └── app.js         # Cross-app totals, Prize Wheel, Critter Collection
```

## Adding an app to the Rewards Center

Add an entry to `REWARD_APPS` in `js/data.js` with the new app's name, folder URL, its
reward-currency key (`cur`) and its trophy-list key (`troph`). That's it.
