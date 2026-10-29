# 🧳 Adventure Pack

Apps imported from outside zips (`kids-learning-apps.zip` 2026-10-08; Times Table Quest + Sticker Quest 2026-10-28) and shown in the Hub as their
own **Adventure Pack** section. Each keeps its original look and runs standalone.

| App | Folder | Grade | What it is |
| --- | --- | --- | --- |
| 📖 Reading Adventures | `readingadventures/` | KG & G3 | 15 short KG stories + 15 chapter-style G3 stories (`GRADES` object in index.html; stories 11–15 star new funny characters and award a 🚗 car sticker (`sticker.kind:"car"`) + a ✨ `bonus` sticker), tricky-word help, quizzes, stickers, read-aloud. Grown-up admin (default PIN **1234**) configures rewards. Also holds **🔬 Science Test Prep** (G3: motion, forces, magnets, electromagnets — lessons, 10 stories, labs, games, quizzes, 20-Q practice test), added 2026-10-13; Hub tile deep-links with `#science`. |
| 🏴‍☠️ Pirate Math Quest | `piratemath/` | G3 | Chapter 1: Rounding, Addition, Mental Addition, Science, Communities islands. Chapter 2: Captain's Grand Review exam (Addition within 10,000). Switch chapters with the floating bar. |
| 📓 Subtraction Notebook Quest | `subtraction/` | G3 | 7 notebook sections (mental math, 3/4-digit regrouping, phrasing, word problems, multi-part). Printable worksheets PDF + `make_pdf.py` (needs reportlab). |
| 🦉 Times Table Quest | `timesquest/` | G3 | From `docs/times-table-quest.zip` (2026-10-28): Chapter 4 ×/÷ test prep with Practice, Challenge and a timed Exam Mode. See its README. |
| 🧩 Sticker Quest | `stickerquest/` | G3 | From `docs/sticker-quest-app.zip` (2026-10-28): fact families, equal groups, reading + 1-minute read-aloud; a sticker per task. See its README. |
| 📜 Why We Have the Bill of Rights | `billofrights/` | G3 | Guided reading with Ms. Compass — author's purpose, compare & contrast, cause & effect, quick check, build-your-answer. Pictures load from Wikimedia (online only). |

## Hub integration
- The three single-file apps load `../../js/profile-store.js` (per-learner progress) and have a
  floating **🎒 Hub** link.
- Hub cards carry `data-grades`; `js/hub.js` `applyFilter` hides cards not matching the
  logged-in learner's grade. Insights lists them as interest-only (`noProgress`).

## Rebuilding Pirate Math Quest
The originals are React components (`src/*.jsx`, using Tailwind + lucide-react). They are
pre-built into `js/app.js` + `css/app.css` so the app runs offline with no build step. To
rebuild after editing `src/`:

```sh
npm i react@18.3.1 react-dom@18.3.1 lucide-react@0.460.0 esbuild@0.24.0 tailwindcss@3.4.14
npx esbuild src/entry.jsx --bundle --minify --jsx=automatic --format=iife --define:process.env.NODE_ENV=\"production\" --outfile=js/app.js
npx tailwindcss -c src/tailwind.config.js -i src/input.css -o css/app.css --minify
```
(Run from `piratemath/`; set `content` in `src/tailwind.config.js` to `["./src/**/*.jsx"]`.)

## Reading Adventures source + Science Test Prep (2026-10-13)
`readingadventures/index.html` is now **built**: edit `src/base.html` (our hub-integrated copy, with the
car stories, tracker scripts and 🎒 Hub link) or `src/science/*`, then run `node build.js`. See
`readingadventures/CLAUDE.md` + `SCIENCE-TOPICS.md` (from the zip). Our additions on top of upstream:
Tracker hooks in `src/science/app-core.js` (`sciRunPick`, `sciRunNext`, `sciStoryCheck`), the
`#science` deep link in base.html INIT, and `ICONS.treasure`. The zip's own grade-3 stories 11–20
were NOT imported (they clash with our ids 11–15). Tests need `npm i` (Playwright).
