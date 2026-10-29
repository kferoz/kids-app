# 🧩 Sticker Quest (G3)

Imported from `docs/sticker-quest-app.zip` (2026-10-28). Three tabs: Fact Families, Equal Groups,
Reading (Joseph Bruchac passage + one-minute read-aloud). Every finished task earns a sticker. Spec in `PRD.md`.

## Hub changes on top of the prototype
- Progress saved (PRD FR-5) in `stickerQuest_v1`:
  `{stickers, got (item ids already rewarded), completed:{facts:[i], groups:{i:[counts]}, reading}, fluency:[{score,read,errs,ts}]}`.
  Opens on the first unfinished family / problem.
- One sticker per item id, ever (FR-4). Fluency gives a sticker once per started timer, not per click.
- Content: 3 worksheet families + 5 extra; 3 worksheet group problems + 3 extra (`one` = singular container word).
- Reading fixes: Q1 asked about a map that isn't there (now "Where did Joseph grow up?"); the passage now shows
  the "Growing Up Near Mountains" heading that Q3 asks about.
- Google Fonts removed (offline/APK, no third-party request); falls back to Trebuchet.
- 🔊 read-aloud for the passage and word problems; tracker + kidbar scripts; $1 for finishing all 15 tasks.
- **4. Unit 2 Test Prep** tab (2026-10-29; `index.html#unit2` opens it). Learn cards (6 topics, 🔊 Hear it,
  📖 Story mode), Practice Easy / Medium (6 questions) and a Mixed Test (8, 3–5 easy). Files in `src/`:
  `data/unit2Questions.js` (23 questions), `data/unit2Topics.js`, `unit2Logic.js` (picking + scoring, no DOM),
  `unit2Art.js` (inline SVG + Hoot the owl), `unit2.js` (screens), `unit2.css`. Saved as `save.unit2` in the
  same key. One sticker per question ever + one per finished round. Tests: `node test/unit2-logic.js`,
  `node test/unit2-questions.js`.
- The passage is about a real author, written fresh for this app (not the worksheet text). Private family use only.
