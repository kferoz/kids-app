# ✏️ Sentence Studio

A **writing course for a 3rd grader**. It starts at “what is a sentence?” and builds up to
writing a whole paragraph and an original story **in the child's own words**. The guide is
**Penny the Pencil**, who is silly, kind and always specific with praise.

Open `index.html`, or tap the ✏️ tile in the Hub's Elementary section (3rd grade logins only).

## Levels and lessons

A level opens when every lesson in the level before it is finished.

| Level | Lesson | Skill | Write It |
|---|---|---|---|
| 🌱 1 Sentence Sprouts | What's a Sentence? | who + what happens, capital, stop sign | favorite animal, something you ate |
| | Telling, Asking & WOW! | . ? ! | a question for an alien, a WOW sentence, a telling sentence |
| | Who + Did What | subject & predicate | 🎰 Silly Sentence Machine, a superhero sentence |
| 🌿 2 Super Sentences | Stretch It! | add when / where / how | stretch “The dog ran.” and “I ate ice cream.” |
| | Juicy Describing Words | adjectives, five senses, tired words | describe a pizza (2 adjectives), invent a monster (3) |
| | Glue Words | and, but, so, because | “I like ___ because ___”, a *but* sentence, a *so* sentence |
| | Fix-It Doctor | editing: capitals, end marks, spelling | retype 3 messy sentences correctly |
| 🌳 3 Paragraph Power | Hamburger Paragraph | topic, 3 details, closing | 🍔 planner: my favorite place |
| | First, Next, Then, Last | order words, how-to | planner: how to make a snack |
| | My Own Story | beginning, problem, middle, ending | 🎲 Story Spark + story planner |

## Each lesson has three steps

1. **💡 Learn It**: 3–4 short points read aloud, a 👍 *like this* / 🤔 *not quite* example,
   and a joke.
2. **🎮 Practice**: 6 quick rounds. *Is it a complete sentence?*, *pick the end mark*,
   multiple choice, *build the sentence from word tiles*, *glue two sentences together*,
   and *put the sentences in order*. Every answer comes with a one-line “why”.
3. **✏️ Write It**: the child writes their own sentences in the WritePad (below).
   Paragraph lessons use a **planner**: one part at a time, stacked like a burger. The parts
   then join into one paragraph, which is read back and checked as a whole.

Plus **✨ Free Write** (Story Spark prompts, 3+ sentences) and **📓 My Writing Book**, which
keeps every saved piece. Tap a page to hear it.

## The WritePad: think it, say it, write it

`js/writepad.js` (UI) and `js/writecheck.js` (checker) are shared with Read-Aloud Rocket's
✏️ Write It step. **Keep the copies in `readrocket/js` (and `css/writepad.css`) in sync.**

- **Word bank** chips, **💡 Show me an example** (with “now make it your own”),
  **🎤 Say it first**, and **🔊 Read my writing**. Say it first is speech-to-text that shows
  the child's idea in a bubble; it is never typed in for them. Read my writing helps the
  child hear their own mistakes.
- The text box turns off the browser's spellcheck and auto-capitalise, so the checker
  (not the keyboard) teaches capitals and spelling.
- **✅ Check my writing** gives feedback as **two stars and a wish**: specific praise first
  (“Describing words like *huge* and *fluffy* paint a picture!”), then **at most three** fix
  notes, biggest first (length, the lesson goal, then capitals, end marks, *I*, spelling,
  doubled words, spacing). Each note has a **Show me** button that makes the fix so the
  child can see it. Last comes one optional “super-writer idea” (tired words, a run-on,
  every sentence starting the same way, a question missing its question mark).
- Stars: 3 if the writing is right on the first check, 2 after fixes (or if Show me was
  used), 1 for *Save it as it is*, which appears after 3 checks so nobody gets stuck.
- The checker runs offline: a list of ~300 common 3rd-grade misspellings and wrong past
  tenses (goed, runned), describing-word and order-word lists, and per-prompt goals
  (`need`: min words, sentences, must-use words, end mark, adjectives, order words,
  phonics letter-teams, exact fix-it match). See the header of `js/writecheck.js`.

## Saved progress (per learner, via the Hub login)

`ws_points`, `ws_stickers` (`l:<lesson>`), `ws_trophies`, `ws_lessons`
(learn / practice / write / done / stars), `ws_journal` (the Writing Book, newest 300),
`ws_free`, `ws_selfFix`, `ws_clean`; +1 shared Prize Wheel ticket (`rw_tickets`) per lesson.
`Tracker` logs every practice answer and every saved piece of writing (first 200–400
characters) so a grown-up can read it in Admin → Activity Log.

## Adding lessons

Data only, in `js/data.js`. The lesson, practice round and write-prompt shapes are
documented at the top of the file. Raise the Admin total (10) in `admin/js/admin.js`.
