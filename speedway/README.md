# 🏎️ Learning Speedway

A **car-racing learning game** for **Kindergarten (ages 4–6)**, hosted by
**Rev the Race Car** 🏎️. Rev drives a three-lane road; every question puts three
**gates** across the road, and the child **steers into the right gate** to zoom
ahead a lap. Finish all 8 laps and you win a race — and a new car for the garage.

Just open **`index.html`** in a web browser — no installation, works offline.

## What it teaches

**16 roads** across two zones. Questions are generated fresh every lap, so a road
never plays out the same way twice.

### 🔤 English Street

| Road | Skill |
| --- | --- |
| 🔤 **Letter Lane** | Uppercase letter recognition |
| 🔡 **Little Letter Loop** | Matching BIG letters to little letters |
| 🔊 **Sound Street** | Beginning sounds (picture → starting letter) |
| 🎵 **Rhyme Road** | Rhyming words |
| 👀 **Sight Word Speedway** | Hearing and reading 30+ sight words |
| 🧩 **Word Builder Bend** | Reading short-vowel (CVC) words from a picture |
| 🔠 **Alphabet Avenue** | Alphabet order — which letter comes next |

### 🔢 Math Motorway

| Road | Skill |
| --- | --- |
| 🔢 **Number Lane** | Numeral recognition 0–20 (hear it, drive to it) |
| 🍎 **Counting Curve** | Counting objects to 12 |
| 🔺 **Shape Circuit** | Circle, square, triangle, star, heart, diamond |
| 🌈 **Color Crossing** | Ten colors, shown as real colored cars |
| ➕ **Adding Alley** | Adding within 10, with pictures to count |
| ➖ **Take-Away Track** | Subtracting within 10, with crossed-out pictures |
| ⚖️ **Bigger-Smaller Bridge** | Comparing numbers to 20 |
| 🔟 **Number Order Highway** | What comes next / what came before |
| 🔁 **Pattern Parkway** | Finishing repeating patterns |

### 🌈 Highway Dash

A free-drive mode that mixes questions from **every** road. No timer, no losing —
the child drives as long as they want and earns a 🎟️ ticket every 5 gates.

## How a race works

1. Rev sits in the middle lane. A question appears at the top (with read-aloud —
   tap 🔊 to hear it again).
2. Three gates stand across the road, one per lane. Tap one — or steer with
   **← →** and press **Enter** on a keyboard.
3. **Right gate:** it swings open, Rev zooms through, ⭐ **+5 points**, next lap.
4. **Wrong gate:** a small bump, *"good try — pick another gate!"*, and Rev rolls
   back to the middle. **Nothing is ever lost**, and after two tries a 💡 hint appears.

A race is **8 laps**. Finishing awards ★ stars (3 stars = no wrong gates), a
🎟️ Prize Wheel ticket, and **a brand-new car**.

## 🚗 The Garage

**17 cars** to collect — one for every road you finish, from 🚙 Rocky all the way
to 🚀 Rocket Rex. Tap any unlocked car in the Garage to drive it; it becomes the
car you see on the road. The Garage also holds the **8 trophies**.

## Design notes

- **Kindness-first** — a wrong gate never ends a race or removes points.
- **Pre-reader friendly** — read-aloud on every question, pictures over text,
  huge tap targets. Beginning-sound rounds use **letter names plus an example
  word** ("starts with M, like moon"), because browser speech says letter names,
  not phonemes.
- **Colors are drawn cars, not emoji** — emoji can't be recolored, so
  Color Crossing renders real CSS cars in ten colors.
- **Respects `prefers-reduced-motion`** — the scrolling road, clouds and bobbing
  car hold still for kids who need calm.

## Where progress is saved

All in `localStorage` under the `sw_` prefix (and per-learner namespaced by
`js/profile-store.js`):

| Key | What it holds |
| --- | --- |
| `sw_points` | ⭐ points (also shown in the Rewards Center) |
| `sw_stars` | `{ roadId: best star rating 1–3 }` — also the "races finished" list |
| `sw_cars` | Unlocked car ids |
| `sw_car` | The car currently being driven |
| `sw_trophies` | Trophy ids earned |
| `sw_dashbest` | Best Highway Dash gate count |
| `rw_tickets` | **Shared** Prize Wheel tickets (Arcade + every app) |

## Adding more to the app

Everything lives in `js/data.js` and is purely additive:

- **A new activity** → add a function to `ROUND_MAKERS` returning
  `{ q, say, visual?, choices:[{html,key}], answerKey, hint? }`, then add a
  `COURSES` entry pointing at it with `gen: "<yourMakerName>"`.
- **A new subject** (Science Skyway, Spanish Street…) → add a `ZONES` entry, give
  it a theme class in `css/styles.css` (`.z-<id> { --accent: … }`), and add its
  `COURSES`. The home screen, HUD counter, zone trophies and Highway Dash all
  scale automatically.
- **A new car** → append to `CAR_GARAGE` and point a course's `car:` at its id.
