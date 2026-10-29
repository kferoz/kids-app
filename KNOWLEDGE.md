## FEATURE — Adventure Pack: Times Table Quest + Sticker Quest (from docs/ zips) · 2026-10-28
- Save keys kept from the zips (`timesTableQuest_v2`, `stickerQuest_v1`) so upstream saves stay compatible.
- Sticker Quest stickers key off item ids in `save.got`; the prototype re-awarded per click and never saved.
- kidbar `glob()` uses `new Function("typeof X")`, so it reads top-level `const` arrays like `BADGES`.
- Pages without a Hub link get the floating 🏠 top-left; pad header/top or it covers titles on phones.
- Headless tests: use a spare `http.server` port so the kids' real file:// data is untouched.
- profile-store namespaces getItem too: read `kb_album`, not `kk1::kb_album` (that becomes `kk1::kk1::…`).

## FEATURE — Rocket Phase 5, Phonics Magic e, Arabic Phase 3, Write & Trace Phase 3 · 2026-10-21
- Magic e sounding out says the vowel's NAME (`MAGIC_E[v].name`) and keeps the e silent. Avoid soft-c words (dice): `LETTER_SOUNDS.c` is "kuh".
- Arabic sukoon/shadda can't be voiced alone: syllables ride on a carrier alif (أَبْ "ab", أَبَّ "abba"); Trace It drops the carrier (`traceSyl`).
- `wordParts` must accept shadda before OR after the vowel (Unicode order varies), so it keeps `p.sh` and recomputes tr. `CONS["ا"] = ""` makes an alif after fathatan silent.
- Each new haraka has `pair` (dammatan↔damma, sukoon↔fatha); random distractors from 8 known marks hid the key contrast.
- Rocket root write goals reuse `team` (substring), so "sport" also passes `port`. Every `focus` word must appear in the passage (the content audit checks it).
- Old test suites auto-close the $1 celebration (lib.js observer) unless the seed sets `window.__keepParty`; retro dollars otherwise cover the buttons they click.

## FEATURE — Shared KidBar: floating Home, 🎒 pocket, Dollar Bank ($1 challenges) · 2026-10-21
- Every app page loads `js/dollars.js` then `js/kidbar.js` right after tracker.js. Rewards Center passes `data-pocket="off"`. Admin loads only dollars.js.
- $1 challenges are read from each app's saved state (mostly hard trophies), so apps need no calls. New phase trophies need a new `trophy(...)` line in `CHALLENGES`.
- Ledger `kb_dollars` is per learner. Rows carry `ch` (challenge id), `seen` (celebrated) and `paid` (set in Admin). `sync()` is idempotent by row id, so earlier wins pay out on first load.
- Admin's 💵 Dollars tab runs `sync` for every kid via `DollarBank.forKid(id)` raw keys. Rows a kid hasn't seen get celebrated in the next app they open.
- Many apps store sticker ids, not emojis. On the app's own page kidbar maps them through its data globals and mirrors them into `kb_album` for the cross-app album. Before that, other pages can only show a count.
- The floating 🏠 shows only when no `a[href]` equal to the Hub URL is on screen. That is why the bottom-left "🎒 Hub" pills were removed from the adventure-pack pages. tracker.js skips `kb_` keys.

## FEATURE — Round 2: Rocket Phase 4, Phonics Blends, Arabic harakat, Write & Trace Phase 2 · 2026-10-20
- A speech bubble that changes height moves the tracing pad under the child's finger mid-letter. It showed on phones as a "failed" ش trace even though every stroke was right. While a pad is open, `jamal()`/`buddy()` lock the bubble's `min-height` so it can only grow. The pad also scrolls itself fully into view, because it captures touches and kids can't scroll by dragging on it.
- Glyph tracing handles harakat for free. A fatha/kasra/damma is a separate connected piece, so "forgot the mark" works like "forgot the dots" (use `PRAISE.mark` for syllables).
- Phonics blends reuse the sh/ch/th screens through `isTeam(l)`. Each lesson's `teams` list drives highlighting, the "which team?" choices and wrong-answer pictures. Blends must NOT be added to `letterGroups` (st is two sounds). `teamCard()` only highlights them.
- WriteCheck `useAll` matches whole words, so it can't require "?" or "!". Use `need.marks: ["?", "!"]`.
- Arabic syllables: `CONS` + `HARAKAT[m].v` give the written form (ba, bi, bu). The English-voice fallback uses `fb` (bah, bee, boo), because an English voice reads "bi" as "bye".
- Tests: map pointer coordinates from the `.tp-ink` canvas rect, not `.tp-wrap`. The wrap's 3px border skews strokes on small screens.

## FEATURE — Write & Trace (KG), Arabic Oasis (KG+G3), Phase 3 / Step 4 · 2026-10-20
- `TracePad` (`tracewrite/js/tracepad.js` + `css/tracepad.css`, identical copies in `arabic/`) has two modes: SVG stroke paths (English handwriting) or a font glyph (Arabic, no stroke data).
- Stroke mode: one finger stroke may finish several guide strokes ("a" without lifting), but only if it is ≥75% of their combined length. Extra strokes are checked at half the tolerance. Without both rules, the c of "a" completed its stem and the stem of "t" completed its crossbar, so the child's next correct stroke got "wandered off".
- Glyph mode checks the font letter's pieces (connected components: body + each dot) and Zhang-Suen centre line. Area coverage and grid-cell coverage both accepted half letters: the thick ends of ت outweighed its bowl, and the head of م outweighed its tail.
- A pad sized by width with `aspect-ratio` makes thin letters (t, i) taller than the screen, and finger points off-screen are lost. Centre single letters on a sheet ≥120 wide and cap the pad width from the window height.
- A touch during the "watch me" demo must cancel the demo. Ignoring input while it played made the first strokes vanish.
- Arabic speech: `js/voice.js` no longer puts the learner's English Hub voice on non-English utterances. Android: `bridge.js` adds an "Android Arabic" voice when `AndroidBridge.ttsHasLang("ar")` is true, and non-English utterances go as voice `lang:ar` (`MainActivity.useVoice` → `setLanguage`). With no Arabic voice, the app speaks English spellings (`say`, `tr`) and never sends Arabic text to an English voice.
- WriteCheck `need.starts` (prefix goals) ignores look-alikes in `NOT_PREFIX` (under, uncle, unicorn, ready, really…). Otherwise "under" passes an un- goal.
- Phonics `letterGroups` keeps sh/ch/th/ck together, so sounding out says "shhh" and not "sss, huh". Step 4 opens only after Step 3 is done. `finishSightLesson` now serves sight-word and sound-team lessons.
- Admin `SUBJECTS` gained a 9th entry "Arabic" with `--s9` in admin.css (all 3 theme blocks).
- Tests: profile-store prefixes keys with `k` + kid id, so kid id "k1" stores `kk1::ar_lessons`.

## FINDING — Tooling gotchas on this Windows box · 2026-10-19
- Git Bash heredocs mangle backslash escapes (e.g. `\n`) in inline Python; write Python to a scratch file instead.
- `python -m http.server` responses get cached; refresh with `fetch(url, {cache:'reload'})` before reloading.
- Driven Chrome window reports `visibilityState: hidden`: time-on-task barely accrues and screenshots time out intermittently.
- CDP `type` into inputs may not land while hidden; set `.value` via JS and click submit instead.
- Claude-in-Chrome cannot open `file://` URLs; IndexedDB under file:// stays untested by automation.
- Python `open(p,"w")` on Windows writes CRLF; pass `newline=""` or LF files become whole-file git diffs.
- Line-ending-only changes alter the APK content hash: rebuild before committing, or the Stop hook bumps the version.
- The Bash tool runs commands through `eval`: an apostrophe inside a quoted heredoc (Ma'am, Grandma's) breaks parsing. Write such files with the Write tool.

## FINDING — Headless verification without Claude-in-Chrome · 2026-10-19
- Edge `--headless --dump-dom` silently outputs nothing here; use `playwright-core` with `executablePath` to msedge.exe.
- Install playwright-core in the scratchpad, not the project; no browser download needed.
- Lone 404 in console with no failing page response = auto `favicon.ico` request; harmless.
- Stub `speechSynthesis.speak` to fire `onend` at once; muted app speech still waits up to 2.5 s per line.
- Fake `SpeechRecognition` + `webkitSpeechRecognition` emitting `window.__said` as one final result drives mic flows.
- `evaluateOnNewDocument` seeds rerun on every reload: open a new page to keep seeded localStorage.

## FEATURE — Writing: Sentence Studio (G3) + Write It + Phase 2 of both reading paths · 2026-10-19
- `writecheck.js` + `writepad.js` + `css/writepad.css` exist as identical copies in `writestudio/` and `readrocket/`. Apps stay standalone, so edit one copy and `cp` it to the other.
- The writing box turns off spellcheck, autocorrect and auto-capitalize. Otherwise the phone keyboard fixes capitals and spelling before the checker can teach them.
- Feedback shows at most 3 fix notes, sorted by importance (length/goal → capitals/end marks → spelling). A wall of red ink discourages kids.
- "Say it first" dictation needs `single: true` plus a never-matching target. In continuous mode the listener only stops after 4 s of silence.
- Write It became a lesson requirement only for lessons not yet done (`!wasDone`), so lessons finished earlier keep their sticker/done state.
- Phonics steps 1–3 are all open from the start: sight words don't depend on finishing the storybooks.
- In "find the missing word", when the blank starts the sentence, show the choices capitalized ("The", not "the").
- Admin colors subjects from a fixed 8-slot list. A new subject needs a new color, so writing joined "Grammar & Writing". Subject names are derived from the registry, not stored, so renaming one is safe.

## FINDING — Publishing the repo safely (public GitHub) · 2026-10-17
- `kferoz/kids-app` is public. Keystore, signing password, PDFs, zips and `android/build/` are gitignored.
- The signing password moved to `android/signing.local.json` or env `KIDSAPP_KEY_PASS`. It never goes in source.
- `.gitattributes` sets `* -text`, so files stay byte-identical (CRLF kept) and the APK `--if-changed` hash stays stable.
- Commit only the latest `apk/KidsLearningHub.apk`. Versioned copies would bloat history.

## FEATURE — Android APK without Gradle (`android/build-apk.mjs`) · 2026-10-16
- Pipeline: aapt2 compile/link → javac → d8 → `jar -u` (assets + dex) → zipalign → apksigner.
- On Windows, `aapt2 -A` writes `assets/www\x` entry names that Android can't open. Add assets with `jar -u -M`.
- javac needs `core-lambda-stubs.jar` on the bootclasspath, or it can't find LambdaMetafactory.
- Every build bumps versionCode and uses the same keystore. Updates then install over the old app and keep its data.
- A Stop hook runs `--if-changed --hook`, so every change rebuilds the APK automatically.

## FINDING — WebView has no Web Speech; bridge it · 2026-10-16
- Android WebView lacks `speechSynthesis` and `webkitSpeechRecognition`. `bridge.js` polyfills both over `window.AndroidBridge`.
- The build injects `bridge.js` into every page's `<head>`, so the app code itself is unchanged.
- Session tokens on recognizer callbacks drop late results from a stopped session.
- `cancel()` must fire the utterance's error asynchronously. Apps that chain `onend` otherwise re-enter.
- Downloads use `saveFile` (MediaStore Downloads) because WebView ignores `<a download>`.

## FEATURE — Phased reading: Read-Aloud Rocket (G3) + Phonics Pals steps (KG) · 2026-10-16
- One phase per request. Phases without `lessons` in `data.js` render as "coming soon".
- Fluency score: words per minute from the first to the last heard word, plus 800 ms (minimum 4 s), capped at 220.
- Write numbers as words in passages. The listener maps recognized digits back to words.
- Never offer same-sound letters (c/k) together. They create two right answers.
- Ignore mic taps while listening, and drop results once the round has moved on.

## FEATURE — Per-learner voice, speed, pitch (`js/voice.js`) · 2026-10-16
- Wraps `speechSynthesis.speak`: swaps in the chosen voice and multiplies the app's rate and pitch.
- Stored globally in `hub_voice` `{kidId: {voice, rate, pitch}}`. Learners with no choice keep app defaults.
- Must load right after `profile-store.js` on every page, before any app script speaks.

## FEATURE — One class per login + never wipe data · 2026-10-16
- While a learner is logged in, the Hub hides other-grade tiles and the filter bar. Empty sections are hidden too.
- Reading Adventures maps `hub_activeKid` grade to `kinder`/`grade3` and filters its stories and stickers.
- ActivityDB schema changes are additive only. `navigator.storage.persist()` runs when the DB opens.
- Admin "Reset everything" needs the word RESET and auto-downloads a backup first.

## FEATURE — Phonics Pals read-aloud storybooks (`phonics/`, KG) · 2026-10-15
- Source: `docs/maahiphonics1–5.zip` phone photos; zips 3 and 4 contain only 0-byte JPGs.
- Books 3/4 (`sam`, `pip`) are original stand-ins flagged `bonus: true`; replace in `js/data.js` when re-sent.
- Illustrations are data-driven SVG: `art: { bg, items: [[type,x,y,scale,opts]] }` drawn by `js/art.js`.
- Listener aligns heard words to page tokens via LCS; ALIKE map forgives sound-alikes like "all"→Al.
- Fuzzy one-letter match is refused when heard word is another word in the same book (dog≠Dot).
- Async callbacks are wrapped in `onNav()` (nav counter) so late TTS/mic results can't render on a new screen.

## FINDING — Web Speech recognition gotchas · 2026-10-15
- Chrome now exposes unprefixed `SpeechRecognition`; test fakes must override it AND `webkitSpeechRecognition`.
- Headless Chrome's real recognizer fails with `not-allowed`; fake it via `evaluateOnNewDocument`.
- Continuous recognition can end on a pause; restart in `onend` while within the time budget.
- Aborted sessions still fire `onerror('aborted')`/`onend`; mark them dead and ignore, or the app wrongly falls back to helper mode.
- Recognition needs Chrome/Edge plus internet; `network`/`audio-capture` errors → grown-up helper mode.
- Stop TTS before listening, or the recognizer transcribes the app's own voice.

## FEATURE — Science Test Prep in Reading Adventures (zip drop 2) · 2026-10-13
- `readingadventures/index.html` is BUILT: `node build.js` splices `src/science/*` into `src/base.html` markers.
- Markers `/*SCIENCE_CSS*/` (before `</style>`) and `/*SCIENCE_JS*/` (must sit before INIT `showHome()` — SCI consts TDZ).
- `src/base.html` = our hub copy + upstream hooks (setView, goBack→sciBack, 'sci' celebration, home card, library banner).
- Upstream G3 stories 11–20 skipped: ids clash with our car stories 11–15; renumber to 16+ if wanted.
- `#science` hash opens the section; Hub "Science Prep" tile uses `data-app="readingadventures"` so tracking aggregates there.
- Science progress key `readingAdventuresScience_v1`; `test.best` is a percentage, not a question count.

## FEATURE — Activity database + tracker in every app · 2026-10-09
- `js/activitydb.js`: IndexedDB `KidsLearningHub` v1; stores `events` (indexes ts/kid/app/type/[kid,ts]), `students`, `meta`.
- IndexedDB chosen over SQLite/Mongo: no server, offline, keeps "open index.html" working.
- Writes during page close go to localStorage `hub_evq` (sync); ActivityDB flushes the queue on next page open.
- `js/tracker.js data-app="id"` must load after profile-store.js + activitydb.js, before app scripts.
- Tracker wraps `Storage.prototype.setItem` (after the profile shim) to log every progress-key delta automatically.
- Answers/finishes need hand-placed `Tracker.answer(ok, skill)` / `Tracker.complete(...)` hooks in each app's handlers.

## FEATURE — Common Admin page (replaces Insights) · 2026-10-09
- `admin/`: tabs Overview, Students, Progress, Suggestions, Forecast, Activity Log, Data; gate = math question or hashed `hub_adminPin`.
- `APPS` registry in `admin/js/admin.js` holds subject, grades, `progress(reader, kid)` → {done,total,label}; add new apps there.
- Admin reads learner progress raw as `k<id>::key`; it must NOT load profile-store.js.
- `KidsDB.addKid(..., {activate:false})` adds a student from Admin without switching the logged-in learner.
- `admin/js/charts.js`: dependency-free SVG charts; colours via CSS tokens `--s1..8`, `--seq-1..6` for dark mode.
- Forecast = least-squares line over 8 weekly points; ETA = remaining ÷ completes in last 28 days.

## FEATURE — Hub home screen as icon tiles · 2026-10-09
- Each app is `a.tile` with `--c1/--c2` gradient; Adventure Pack tiles filter by `data-grades="kg g3"`.
- Hidden `.tile-tip` bubbles widened phones' scrollWidth; now `display:none` unless `(hover: hover)`.
- `.kid-text` is a flex column — wrap inline greeting text in one span or each node becomes a line.

## FEATURE — Adventure Pack (imported kids-learning-apps.zip) · 2026-10-08
- `adventurepack/` holds readingadventures (KG+G3), piratemath, subtraction, billofrights; original looks kept.
- Pirate Math is React+Tailwind+lucide JSX, prebuilt with esbuild + tailwind CLI into `js/app.js` + `css/app.css`.
- Rebuild deps pinned: react 18.3.1, lucide-react 0.460.0, esbuild 0.24.0, tailwindcss 3.4.14 (steps in adventurepack/README.md).
- Pirate chapters switch via URL hash `#ch1`/`#ch2` from `src/entry.jsx` wrapper.
- Reading Adventures stories 11–15 per grade award `sticker.kind:'car'` + `bonus`; sticker book has Car/Bonus/Story shelves.
- Reading Adventures tricky-word matcher only matches single `[A-Za-z']+` tokens — no hyphenated tricky words.

## FEATURE — Clue Island drag-the-map reading app (Grade 3) · 2026-09-19
- `clueisland/` (`ci_`): drag Mira onto the next stop to unlock its passage + 2 questions.
- Each island needs `start:{x,y}`; without it Mira renders on the stop she must drag to.
- Trail path is `[start].concat(stops)`; segment j is walked once `at > j`.
- `near()` converts percent to PIXELS first — the map box is wider than tall.
- Wrong answer keeps the passage on screen and shows `q.lookFor`; 5 gems first try, 2 after.
- Answers are stored as text plus `wrong[3]`, never indexes, so shuffling cannot desync.

## FINDING — Authored-content checks that actually catch things · 2026-09-19
- Structural checks (one right answer, unique options) pass content still broken for a child.
- Distractor length: a 59-char answer against 19-26 is pickable without reading; cap ~2.2x.
- Passage length band of 35-95 words keeps every passage in Grade-3 range.
- Map stops closer than 12 percent units overlap once marker and label are drawn.
- Assert trophy reachability against the data: 15 skills exist, the trophy needs 12.
- Checker is pure data — `test/ci-content.js`, no browser needed; rerun after content edits.

## FEATURE — Turbo Grand Prix car game (Grade 3) · 2026-09-19
- `grandprix/` (`gp_`): 8 races of 10 questions, you against 3 rivals.
- Rivals advance `pace * (0.9 + rnd*0.2)` per question; final distance decides position.
- `UPGRADES` feed `tuning()` and change the real race maths — the catch-up mechanic.
- Championship points keep your BEST result per race, so a re-run only improves a season.
- Time Trial reuses the same engine with `trial=true`: no rivals, no championship points.
- Orbitron + Rubik night palette deliberately breaks house style for an older kid.

## FINDING — Simulate game balance instead of guessing it · 2026-09-19
- A 20k-race sim over accuracy x speed x upgrades showed 10/10-but-slow losing 41%.
- Knowing the material must always win; the whole fix was rival pace 11.5 to 11.0.
- After: 10/10-slow wins 82% and never places below 2nd; 8/10-fast is 50/50.
- Upgrades lift a 6/10 driver from 4% to 49% wins — the intended catch-up curve.
- `test/gp-balance.js` reads the real constants via `vm`, so it cannot drift from shipped values.

## FINDING — Verify generated questions by RE-COMPUTING them · 2026-09-19
- "answerKey appears once in choices" passes broken generators; re-parse the question and recompute.
- Caught `placeValue` asking "value of the 9" when 9 appeared twice — two right answers.
- Caught `rounding` and `fracCompare` filling only 3 of the 4 required options.
- Strip HTML (`replace(/<[^>]+>/g,'')`) before regex-parsing question text in the checker.
- Volume that found these: speedway 16 makers x 4000 rounds, grandprix 25 x 3000.

## FINDING — Fixed backgrounds need an explicit background-color · 2026-09-19
- `background-attachment: fixed` on a dark theme showed WHITE below the fold.
- Put `background-color` AFTER the `background:` shorthand — before it, the shorthand resets it.
- Orbitron lacks U+2B1A (⬚); use a styled `<span class="box">?</span>` for a blank.

## FEATURE — Learning Speedway car game (KG) · 2026-09-19
- `speedway/` (`sw_`): a 3-lane road where every answer is a gate you steer into.
- 16 courses x 8 laps in 2 zones, plus endless Highway Dash with no timer or fail state.
- Rounds are GENERATED: `ROUND_MAKERS[course.gen]()`; correct is `choice.key === answerKey`.
- `swOptions(correct, make)` dedupes; a `make()` returning null is skipped (guard 300).
- New subject = ZONE entry + `.z-<id> { --accent }` + COURSES; UI scales off `COURSES.length`.
- `sw_stars` `{courseId:1-3}` doubles as the done-map that Insights reads.

## FINDING — Author `display` rules beat the UA's `[hidden]` · 2026-09-19
- `el.hidden = true` failed to hide: `.big-btn { display: block }` outranks the UA's `[hidden]`.
- Add `[hidden] { display: none !important; }` whenever a toggled element has a display class.
- Only a screenshot caught it — the DOM property was being set correctly all along.

## FINDING — Seeding per-learner progress in a driven browser · 2026-09-19
- `profile-store.js` re-prefixes every non-`hub_`/`rw_` key, so seeding from an app page double-prefixes.
- Seed from the Hub or Insights page (no shim), or use `ProfileStore.rawSet`.
- `KidsDB.addKid` takes positional args `(name, avatar, grade)`, not an object.
- Each `puppeteer.launch` gets a fresh profile, so seed and assert inside one run.

## FEATURE — Per-profile progress via localStorage shim · 2026-07-06
- `js/profile-store.js` monkeypatches `Storage.prototype` get/set/removeItem (guarded `this===localStorage`) to prefix keys `k<hub_activeKid>::`.
- Global (unprefixed) keys = anything starting `hub_` (profiles/log) OR `rw_` (SHARED Prize Wheel: tickets/critters/milestones); guest (no kid) = no prefix.
- Include `../js/profile-store.js` BEFORE `js/data.js` in all 10 app pages; NOT on Hub or Insights (they need raw/explicit-namespace access).
- No app iterates localStorage (verified), so the shim needs no `key()`/`length` faking.
- Migration: `KidsDB.addKid` runs `migrateLegacyProgress` for the FIRST learner only — copies legacy non-`hub_`/non-`rw_`/non-`::` keys into `k<id>::`, gated by global flag `hub_legacyMigrated` (non-destructive).
- Insights reads the SELECTED (not active) learner via `nsKey(k)=k<selectedId>::key`; to make wheel per-kid, drop `rw_` from the two global lists.

## FEATURE — Kid login, KidsDB action log & Grown-Ups Insights · 2026-07-06 (superseded 2026-10-09)
- Hub-level (all apps share one file:// localStorage): `js/kidsdb.js` = `window.KidsDB` over `hub_kids`/`hub_activeKid`/`hub_events` (ring-buffer 800).
- Two grades only: `"kg"`/`"g3"`; `GRADES[code].cat` (`kinder`/`elementary`) auto-filters the Hub after login.
- `js/hub.js` builds the login overlay, greeting bar, and logs `open_app` via clicks on `[data-app]` tiles.
- `insights/` is now only a meta-refresh redirect to `admin/`; the old insights.js/css were removed.
- `hub_events` is still written, but ActivityDB (IndexedDB) is the full history — see Activity database entry.

## FEATURE — Reading Detectives comprehension app · 2026-07-05
- App in `detectives/` (localStorage `rc_`); Grade-3 reading-comprehension journey, mascot Roco the Raccoon 🦝.
- 15 `CASES` unlock in order (n===1 || solved(n-1)); each is a comprehension skill, beginner→expert (case 15 = mixed capstone).
- Data-driven steps by `k`: teach / read (unscored passage "case file") / pick / order (tap-to-sequence); +10 pts per pick/order.
- `order` step: `items` stored IN correct order, engine scrambles; wrong order shakes + returns all chips to retry.
- Rewards: `rc_points`/`rc_stickers`/`rc_solved`/`rc_beststreak`/`rc_cluebest`/`rc_trophies`; RANKS ladder (need 0/3/6/10/15); +1 `rw_tickets`/case.
- Chief trophy & Power Meter scale off `CASES.length` (auto-update on new cases); only hardcoded "N cases" UI/README text is manual.
- Clue Hunt bonus game (CLUE_HUNT): 10 shuffled context-clue rounds, choices stored as text+wrong[] (not index), awards tickets.

## FEATURE — Homeschool Academy numbered-lesson app · 2026-07-05 (expanded 2026-07-06)
- App in `homeschool/` (localStorage `hs_`); 4 `TRACKS` (kg-math/kg-english/g3-math/g3-english) × **20 lessons = 80 total** (n:16–20 appended 2026-07-06).
- HUD total is dynamic via `totalLessons()`; `HS_BADGES` top tier is `b80` (🏆, need 80); adding lessons is pure data append.
- Fully data-driven: lesson `{n,title,emoji,sticker,steps[]}`; step dispatched by `k`: teach/pick/count/type.
- `pick`=`{q,choices,answer}` (answer is index); `count`=`{emoji,n}` auto-builds numeric choices; `type`=`{q,answer}` (`"*"`=any non-empty).
- Path unlocks lesson n if `n===1 || done(n-1)`; +5 pts/correct, 1 sticker/lesson, +1 shared `rw_tickets`/lesson.
- Rewards: `hs_points`/`hs_stickers`/`hs_badges` (HS_BADGES by total lessons)/`hs_trophies` (HS_TROPHIES); registered in `rewards/js/data.js`.
- Serves two ages → placed in BOTH hub cat-sections (two `.app-card.homeschool` cards); indigo+gold theme, per-track accent.

## FINDING — Headless Chrome verification gotchas (Windows) · 2026-07-05
- `--dump-dom` emits nothing to stdout with `--headless=new` here (both Git Bash and PowerShell); use `--screenshot` instead.
- Launch via PowerShell `Start-Process -Wait -PassThru` + a unique `--user-data-dir`; bare `& chrome`/bash pipe returns 0 bytes.
- To auto-drive a `file://` app, load it in an iframe and poll — but parent↔iframe `contentDocument` is opaque-origin-blocked by default.
- Add `--allow-file-access-from-files` (and `--disable-web-security`) so cross-`file://` iframe DOM access works.
- Poll for `iframe.contentDocument.readyState==='complete'`; iframe `onload` races and is missed for fast local files.
- Validate data-only logic (e.g. answer-index ranges) in Node via `vm.runInContext`, appending `this.X=X;` since top-level `const` isn't a context property.
- To read a top-level `const` (e.g. `CASES`) from a driven iframe, use `iframe.contentWindow.eval('CASES…')` — it isn't on `window` (masks as `undefined.length`).
- Hub filter test lives at `test/hub-filter.html` (loads `../index.html` in an iframe, drives filter chips, asserts card visibility incl. the two Grade 3 cards).
- Gotcha: `el.offsetParent` is null for EVERYTHING inside a `display:none` iframe, so visibility checks there must walk the `hidden`-attribute chain, not use offsetParent.

## FINDING — file:// pages share ONE localStorage store · 2026-07-04
- All apps open as `file://` pages; their origin is `file://`, so they share one localStorage.
- Verified: `gg_stars` written in `grammar/` is readable from `index.html` and `multiply/`.
- This is what lets the Rewards Center aggregate every app and Arcade tickets reach the wheel.
- No per-folder isolation → every app MUST prefix keys (ff_/gg_/ll_/th_/rd_/tt_/rw_) to avoid collisions.
- Chrome-specific behaviour for file://; a real http origin would partition differently.

## FEATURE — Fun Zone: Free Games Arcade + Rewards Center · 2026-07-04
- `arcade/` = 4 quick mini-games (Quick Math, Word Scramble, Memory Match, Odd One Out).
- Every arcade win adds a 🎟️ to the SHARED `rw_tickets` key (spent on the Prize Wheel).
- `rewards/` aggregates all apps via registry `REWARD_APPS` (each app → its `cur`/`troph` keys).
- Cross-app `RW_MILESTONES` "hub badges" grant bonus tickets when newly earned.
- Prize Wheel: CSS conic-gradient, spends `rw_tickets`, `WHEEL` segments win `CRITTERS`.
- Rewards keys `rw_tickets`/`rw_critters`/`rw_milestones`; seeds 5 tickets if `rw_tickets` unset.

## FINDING — Reading scanned-image PDFs (SummerPacket) · 2026-07-04
- The packet PDFs are scanned images: `pdftotext`/pdfplumber return ~0 text chars.
- `pdftoppm` is not installed and the Read tool cannot rasterize PDFs itself.
- Install a rasterizer with `python -m pip install pymupdf` (`pip` alone is not on PATH).
- Render: `fitz.open(f)[n].get_pixmap(matrix=fitz.Matrix(2,2)).save(png)`, then Read the PNG.
- Assemble a PIL contact-sheet grid to survey many pages in one Read call.
- Gr3 pages render ~4000px at 2×; use ~1.1× for multi-page surveys.

## FEATURE — Times Table Takeoff (multiplication) · 2026-07-04
- Summer multiplication-fluency app in `multiply/`, localStorage `tt_`; from Gr3 packet p.2 teacher letter.
- Four phases: Skip Counting → Learn a Table → Fact Practice → Fluency Blast-off.
- Facts are generated in app.js (no fact list); `data.js` holds `TABLES` (2–12), `PHASES`, `TT_TROPHIES`.
- Practice masters a table at ≥9/10 (`tt_mastered` set + gold-star board); includes `a × ⬚ = p` items.
- Graded-quiz model (one attempt, reveals correct) — unlike the younger apps' retry model.
- Trophies: blastoff / skip-star / halfway / fluent / champion.

## FEATURE — Little Learners: Summer School mode · 2026-07-04
- Added `summerScreen` + `summerGrid` (home ☀️ button) reusing the existing pick engine.
- `SUMMER_GAMES` in kinder data.js: firstsound, readword, countmatch, sightword, finishsentence.
- `startPickGame` lookup changed to `GAMES.concat(SUMMER_GAMES)`; countmatch folded into the `numbers` branch.
- New data pools: `SUMMER_WORDS`, `SIGHT_WORDS`, `SUMMER_SENTENCES`.
- Summer trophies `game:<id>` (☀️) + grand `summer-champ` via `checkSummerGrand()`.
- Built from `SummerPacket/KG Summer Packet.pdf` skills.

## FINDING — Browser TTS speaks letter names, not phonemes · 2026-07-04
- `speechSynthesis` reads an isolated letter as its NAME ("em"), not its sound ("/m/").
- So phonics activities must use whole-word or first-sound framing, not isolated letters.
- Syllable chunks like "rab"/"bit" speak acceptably via TTS; single letters do not.
- True phoneme audio would need recorded clips (external hosts blocked offline).

## FEATURE — Reading Trail learn-to-read app · 2026-07-04
- Learn-to-read app in `reading/`, localStorage `rd_`; 10-stage unlock-in-order trail (structured-literacy sequence).
- One play screen; `renderRound` dispatches by `stage.activity`: pick/clap/soundout/karaoke/story.
- `soundout` engine serves both letter-blending and syllable-chunking (parts = letters or syllables).
- `story` stage: `stepsTotal = rounds.length + 1` (passage step 0, then comprehension `pick` questions).
- Three reward types: points ⭐ per step, stickers 🎟️ per stage, trophies 🏆 (`READING_TROPHIES`).
- `speakParts(parts, whole)` queues sequential utterances (syllables) then the whole word.

## FEATURE — Grammar Treasure Hunt app · 2026-07-04
- Pirate map grammar game in `treasure/`, localStorage `th_`; deliberately non-template look (parchment/teal, Pirata One + Fredoka).
- `ADVENTURES`: `{id,name,emoji,blurb,route:[emoji/stop],clues:[{q,options,answer}]}`; keep `route` length == `clues` length.
- Map renders island nodes + dashed `.trail-seg` connectors; ship sits at node index === correct-count.
- Reward currency is gold coins 🪙 (not stars); result 3-star rating derived from mistake count.
- Trophies `map:<id>` + grand `master`; kindness-first — a wrong answer never advances the ship.
- Built via the `frontend-design` skill; each app may carry its own visual identity.

## FEATURE — Grammar Galaxy: Superhero Story Rescue · 2026-07-04
- Reading-comprehension mode lives inside the grammar app, not a separate app.
- Stories in `grammar/js/data.js` `STORIES`; shape `{id,title,emoji,heroes,pages[{emoji,text}],questions[{q,options,answer}]}`.
- Four dedicated screens (storyScreen/readScreen/storyQuizScreen/storyResultScreen) registered in `el.screens`.
- Story quiz duplicates grammar-quiz logic under `sq*` element ids to avoid state entanglement.
- Trophies: `story:<id>` (📖) per story, grand `super-reader` (🦸) when all read; catalog now 33.
- Reader auto-reads each page via speechSynthesis; pages navigable with ← → keys.

## FEATURE — Kids Hub: Fun Zone + age-category filter · 2026-07-04
- Hub is split into a `.funzone` section (`.feature-card` arcade/rewards) then `.cat-section`s.
- Fun Zone is NOT a `.cat-section`, so the filter script leaves it visible for every filter.
- Inline script toggles each `.cat-section`'s `hidden` from `.filter-chip[data-filter]`; "all" shows both.
- Each app card carries an absolute `.level-badge` pill showing its age range.
- Styles live in `css/dashboard.css`; learning apps go under the right cat-section, cross-cutting apps in the Fun Zone.

## FEATURE — Little Learners kindergarten app · 2026-07-04
- Game-first app in `kinder/`, localStorage prefix `ll_`, for pre-readers (ages 4–6).
- All non-match games share one engine: `makeRound(type)` → `{stage,prompt,say,choices:[{html,correct}]}`.
- New game = add `GAMES` entry + `makeRound` branch + data pool; home/trophies auto-scale.
- Data pools: LETTERS, COLORS, SHAPES, COUNT_EMOJIS, MATCH_EMOJIS, RHYMES, OPPOSITES, ANIMAL_SOUNDS.
- Kindness-first: wrong taps wiggle + "try again", never penalize; one star per finished round.
- 16 trophies: per-game 🏅, star milestones 10/25/50/75/100, grand `champion` via `checkGrand()`.
- Colors are recolored CSS blobs; shapes are emoji (emoji can't be recolored).

## FINDING — No-build verification via puppeteer-core + system Chrome · 2026-07-04
- Apps are static `file://` no-build; drive with `puppeteer-core@23` against `C:/Program Files/Google/Chrome/Application/chrome.exe`.
- Use `headless:"new"`, args `--no-sandbox --disable-gpu`; install puppeteer-core in scratchpad, not the project.
- Cross-check wiring by diffing `getElementById`/`$("id")` refs against `id="..."` in the HTML.
- A top-level `const` in a classic script IS reachable by bare name in `page.evaluate` (not on `window`).
- Google Fonts fall back to a system font in offline/headless runs; visually harmless.
