# 🧭 Clue Island

A **drag-the-explorer treasure-map adventure** for **Grade 3 reading
comprehension**. Mira the Mapmaker follows her grandmother's maps across five
islands. Every stop on a map is locked by a story — the child **reads a short
passage, solves the comprehension clue, and the trail opens** another step
towards the ❌.

Just open **`index.html`** in a web browser — no installation, works offline.

## How it plays

1. Pick a map. Mira's boat ⛵ lands at the start of a dashed trail with six stops.
2. **Drag Mira 🧭 onto the next stop** — it pulses in coral, and the drop zone is
   generous so small hands don't have to be precise. (Tapping the stop works too,
   and so does pressing Enter — dragging is the fun way in, never the only way.)
3. A **passage** opens with **two comprehension questions**.
4. **Right answer** → 💎 **5 gems**, the trail segment turns gold, and Mira stays.
5. **Wrong answer** → the passage is still on screen, and a 💡 **"look for…"** hint
   tells the child *where in the text* to search. Answering after a re-read is
   still worth 💎 **2 gems** — re-reading is the skill, not a punishment.
6. Clear all six stops to open the island's **chest** and unlock the next map.

## The five maps

| # | Island | Story | Comprehension focus |
| --- | --- | --- | --- |
| 1 | 🏝️ **Sandy Cove** | Mira lands and picks up the trail | Key details, sequence |
| 2 | 🌴 **Palm Jungle** | Parrots, a rope bridge, a hidden shrine | Main idea, vocabulary in context |
| 3 | 🗿 **Stone Ruins** | An old city and a door that needs a green key | Inference, cause & effect |
| 4 | 🌋 **Ember Peak** | A sleeping volcano and a ranger's notice board | Author's purpose, fact vs opinion, compare & contrast |
| 5 | 💎 **Crystal Caves** | Whoever lit that signal fire | Drawing conclusions, summarising |

**30 passages · 1,700+ words · 60 questions · 15 comprehension skills:**
Author's Purpose · Cause & Effect · Character · Compare & Contrast · Drawing
Conclusions · Fact & Opinion · Inference · Key Details · Main Idea · Predicting ·
Problem & Solution · Sequence · Summarising · Text Features · Vocabulary.

The passages tell **one continuous story** across all five islands, and later
clues depend on remembering earlier ones — cold ashes on island 1 versus warm
ashes on island 4, a boot print in the ruins that turns up again in the caves.
That's deliberate: it rewards reading for meaning rather than answer-hunting.

There's a mix of **narrative** and **informational** text (a ranger's safety
notice, an explanation of how a lava tube forms, a conservation sign), because
Grade 3 comprehension standards cover both.

## Rewards

- 💎 **Gems** — 5 first try, 2 after a re-read (max 300).
- 🧰 **Chests** — one treasure per island, each with a name (The Brass Compass,
  The Parrot Feather, The Green Key, The Ember Stone, The Mapmaker's Chest).
- 🏆 **7 trophies**, including **Sharp Eyes** for clearing an island with no
  re-reads and **Skill Collector** for answering in 12 different skills.
- 🎟️ A Prize Wheel ticket for each island finished.

The 📔 **Journal** shows gems, passages read, chests, and a grid of every
comprehension skill with how many times it's been answered — so a grown-up can
see at a glance which skills are strong and which haven't come up yet.

## Accessibility & kindness notes

- **Read-aloud** on every passage (🔊 button, and a global mute).
- The passage **never disappears** when a question is answered wrong — you cannot
  re-read text you can't see.
- Dragging has **two fallbacks** (tap, and keyboard Enter), and uses pointer
  events so it works with mouse, touch and pen alike.
- A wrong answer never ends anything or takes points away.
- Honours `prefers-reduced-motion`.

## Where progress is saved

All in `localStorage` under the `ci_` prefix (per-learner namespaced by
`js/profile-store.js`):

| Key | What it holds |
| --- | --- |
| `ci_gems` | 💎 gems (also shown in the Rewards Center) |
| `ci_progress` | `{ islandId: stops cleared }` |
| `ci_chests` | Islands finished |
| `ci_clean` | Islands finished with no re-reads |
| `ci_skills` | `{ skillName: times answered correctly }` |
| `ci_trophies` | Trophy ids earned |
| `rw_tickets` | **Shared** Prize Wheel tickets (Arcade + every app) |

## Adding more to the app

`js/data.js` holds everything. A new island is one `ISLANDS` entry:

```js
{ id, n, name, emoji, blurb, theme, chest:{icon,name},
  start:{x,y},                       // where Mira's boat lands
  stops: [ { name, emoji, x, y,      // x/y are % of the map box
             passage:{title,text},
             qs:[ {skill,q,a,wrong:[3],why,lookFor} ] } ] }
```

- `a` is the correct answer **text**, never an index, so shuffling the choices
  can't desync the answer.
- Add a `.t-<id>` tint pair in `css/styles.css` for the new map's colour.
- The home screen, journal totals, skill grid and every trophy scale off the data.

Keep passages roughly **45–90 words** and give each question its own three
`wrong` answers of **similar length** to the correct one — a distractor that is
obviously shorter or longer is a giveaway a child can spot without reading.
