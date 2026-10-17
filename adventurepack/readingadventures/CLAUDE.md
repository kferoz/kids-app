# Reading Adventures (+ Science Test Prep)

Single-file kids' learning web app (no framework, no backend). The built file `index.html` is self-contained:
open it in a browser, or `python3 -m http.server 8000` and visit http://localhost:8000.

## Layout
- `index.html`  – BUILT output. Do not hand-edit science parts here; edit `src/` and run `node build.js`.
- `src/base.html` – the main app (home, 3rd-grade + kindergarten story libraries, quiz, stickers, admin rewards, read-aloud).
  Contains two splice markers: `/*SCIENCE_CSS*/` and `/*SCIENCE_JS*/`.
- `src/science/` – Science Test Prep module (3rd grade; topics: motion, forces, magnets, electromagnetism):
  - `content-lessons.js`  SCI_TOPICS, SCI_LESSONS (slides), SCI_VOCAB, SCI_SORTS (push/pull, magnetic, balanced), SCI_PATTERNS, SCI_CHEAT
  - `content-stories.js`  SCI_STORIES (10 practice stories, easy -> hard, each question has a `why` explanation)
  - `content-bank.js`     SCI_BANK via Q(topic, level 1-3, q, opts, correctIndex, why), SCI_TF (true/false), SCI_CLOZE
  - `art.js`              SCI_ART: original inline-SVG diagrams for lesson slides (keys referenced by lessons)
  - `app-core.js`         state/navigation (sciGo/sciBack), hub, lessons, stories, quiz engine (sciStartRun), badges, menus
  - `app-labs.js`         Magnet Lab, Force Lab, Electromagnet Lab, flashcards, match-up
  - `science.css`
- `build.js` – concatenates src/science/* into src/base.html -> index.html. Run `npm run build` after any edit.
- `tests/` – Playwright checks: `npm i` then `npm run test:data` (content integrity) and `npm run test:e2e` (walks every screen).
  Set `CHROME_PATH` if Playwright can't find a browser.

## Hooks the science module adds to base.html (keep these when editing base.html)
`#scienceView` container; `setView('science')`; `goBack()` first calls `sciBack()`; `showNextCelebration()` handles type `'sci'`;
`renderHome()` appends the Science card (`showScience()`); `renderLibrary()` adds a banner for grade3.

## Data / storage
All progress is in browser localStorage (per device/browser): `readingAdventuresProgress_v2` (stories), `readingAdventuresAdminConfig_v2`,
`readingAdventuresRewards_v2`, `readingAdventuresVoiceSettings_v1`, `readingAdventuresScience_v1` (science progress, badges, mistakes).
Admin PIN default is 1234 (client-side only, not real security). Science progress does NOT affect the $ reward rules.

## Adding content (common tasks)
- New science question: add a `Q('forces', 2, "...", [opts], correctIdx, "why")` line in content-bank.js (options are shuffled at run time).
- New science story: push to SCI_STORIES. Every `tricky[].word` must appear as a whole word in `lines`; `syll` with the dots removed must equal `word`.
  `icon` must be a key in ICONS (base.html has many generated icons: speedster, catowl, bus, science, treasure, ...).
- New lesson slide: add to SCI_LESSONS[topic].slides with an `art` key, and add the SVG function to SCI_ART.
- New topic (e.g. next teacher unit): add to SCI_TOPICS, SCI_LESSONS, SCI_VOCAB, SCI_BANK (>= 5 level-1, 5 level-2, 4 level-3), SCI_TF, SCI_CHEAT.
- Regular reading stories: edit `GRADES.grade3.stories` / `GRADES.kinder.stories` in src/base.html (shape documented in the repo root CLAUDE.md).

## Conventions
- Kid-friendly, 3rd-grade reading level; short sentences; every quiz answer should have a one-line explanation.
- Illustrations are ORIGINAL generated SVG (no copyrighted character art). Character names may appear in story text only.
- Keep it one self-contained HTML file with no external network requests.
- After changes: `npm run build && npm run test:data && npm run test:e2e`.

## Regular reading stories (in src/base.html)
`GRADES = { grade3:{label,stories[],icon}, kinder:{..., bigText:true} }`. Story: `{id, level, title, icon, cast, blurb, sticker:{emoji,name}, lines[], tricky:[{word,syll:"Cat·boy",note}], questions:[{q,opts[],a}]}`.
3rd grade: ~12 lines, 5-6 tricky words, 5 questions. Kindergarten: ~6 lines, 2 tricky words, 3 questions. Sticker emojis must be unique.
Rewards: `evaluateRewards(gradeId)` pays per student (grade) for N perfect first-try stories (configurable in Admin). Icons: helper fns iconFrame/kidSvg/duoIcon + ICONS map.
