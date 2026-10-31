# Academy build progress

The user asked (2026-10-31) to finish every Academy phase in one go, saving work so a
fresh session can continue. **Read this file first when resuming.** Update it in the same
commit as each step.

## Phases

| Phase | What | Status |
|---|---|---|
| A | Syllabus `js/syllabus.js` (278 units), Academy-first Hub, `academy/syllabus.html`, Admin 🎓 Academy tab | ✅ done |
| C1 | Lesson engine: `academy/lesson.html`, `academy/js/lessons.js` (lesson → Quiz Kit pack), Hub Start buttons + progress | ✅ done |
| B | AdHoc: `js/adhoc.js` store, Admin editor (new/edit/remove/restore/import/export), Hub list, player | ✅ done |
| C2 | Lesson content: one file per grade and subject (42 files) | in progress, see below |

## How to add a lesson file

1. Write `academy/lessons/<grade>-<subject>.js` calling `AcademyLessons.add("<grade>-<subject>", {1: {...}, 2: {...}})`.
   The format is at the top of `academy/js/lessons.js`. Each unit: 2 learn cards and 8 questions
   (4 easy, 4 medium; mix mc / tf / c2 / match). The right answer comes first.
2. Run `node test/academy-lessons.js` (it checks the format, word limits, spoken versions for
   symbols in PK–G1, and re-computes "What is 7 × 8?"-style answers).
3. Tick the file below, update KNOWLEDGE.md only if something non-obvious came up, rebuild the
   APK (`node android/build-apk.mjs --if-changed`), commit and push.

Nothing else needs wiring: the Hub and the lesson page load the file by name.

## Lesson files (units in brackets)

| Grade | Math | English | Science | Social | Computing | Health |
|---|---|---|---|---|---|---|
| pk | ✅ (5) | ✅ (5) | ✅ (5) | ✅ (5) | ✅ (4) | ✅ (5) |
| kg | ✅ (8) | ✅ (8) | ✅ (7) | ✅ (6) | ✅ (5) | ✅ (6) |
| g1 | ✅ (8) | ✅ (8) | ✅ (7) | ✅ (7) | ✅ (5) | ✅ (6) |
| g2 | ✅ (8) | ✅ (8) | ✅ (7) | ✅ (7) | ☐ (6) | ☐ (6) |
| g3 | ✅ (8) | ✅ (8) | ✅ (8) | ✅ (7) | ☐ (5) | ☐ (6) |
| g4 | ✅ (8) | ✅ (8) | ✅ (7) | ✅ (7) | ☐ (5) | ☐ (6) |
| g5 | ✅ (8) | ✅ (8) | ✅ (8) | ✅ (8) | ☐ (5) | ☐ (6) |

Order being followed: math, English, science and social for every grade first (core), then
computing and health.

## Browser checks (session scratchpad, not in the repo)

`academy-e2e.js` (Hub, syllabus page, Admin tab) and `lesson-e2e.js` (Start buttons, a real
round, mastery, AdHoc editor and player). If the scratchpad is gone, re-create from KNOWLEDGE.md
notes: seed `hub_kids` + `hub_activeKid`, then RELOAD (a hash-only goto keeps the old page).
