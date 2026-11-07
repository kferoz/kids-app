# 🚀 Read-Aloud Rocket

Phased **read-aloud lessons for a 3rd grader**, climbing from beginning-3rd-grade reading
up to **4th-grade level**. The child reads stories out loud to **Nova the robot**, who
listens through the microphone, marks every word, practises the tricky ones and shows a
**reading-speed meter** (words read correctly per minute).

It's built on the Phonics Pals engine (KG): the same listening buddy and kind corrections,
with longer passages, chunked long words and fluency timing for older readers.

Open `index.html`, or tap the 🚀 tile in the Hub's Elementary section (3rd grade logins only).

## Phases

| Phase | Name | Skill | Speed goal | Status |
|---|---|---|---|---|
| 1 | Launch Pad | short & long vowel review | 70 wpm | ✅ built |
| 2 | Vowel Team Orbit | vowel teams (ai/ay, ee/ea, oa/ow) & bossy R | 80 | ✅ built |
| 3 | Word-Part Station | prefixes un- & re-, suffixes -ful & -less (write goals use `starts`/`ends`) | 90 | ✅ built |
| 4 | Big Word Galaxy | 3-syllable words, dialogue with expression, punctuation as a road map, -tion/-sion (write goal `marks: ["?", "!"]`) | 100 | ✅ built |
| 5 | Root Planet | word roots: port (carry), tele/scope (far/look), graph (write), struct (build); write goals use `team: ["port"]` etc. (substring match) · Phase Check "The Space Camp Report" | 110 | ✅ built |
| 6 | Robot Academy 🤖 | main idea, inference, cause & effect, feelings from actions; robot & AI stories (Bolt, Shelly, Chef Clank, Ada) · Phase Check "The Rover That Would Not Quit" | 120 | ✅ built |
| 7 | AI Explorer Lab 🧠 | true articles: how AI learns, fact vs. opinion | 125 | coming soon |
| 8 | Robot Engineers 🦾 | how-to texts, sequence, problem-solution | 130 | coming soon |
| 9 | 4th-Grade Star ⭐ | compare & contrast, author's purpose, summarize | 135 | coming soon |

**🤖 Robot glitch questions (Phase 6 on):** each Check-up ends with “Nova's memory chip
mixed up the story. Which sentence is TRUE?”, a fun detail check. Data only, normal quiz item.

Speed goals follow typical (median) oral-reading-fluency norms for grades 3–4. They're
targets, never a fail: every new personal best is celebrated.

Each phase has **4 lessons + a Phase Check**. The Phase Check is a brand-new story read
aloud, plus 6 questions; 4 right passes and unlocks the next phase.

## Each lesson has four steps

1. **🔤 Word Lab**: the skill tip (read aloud), 8 story words. Tap a word to hear it in
   chunks (pic·nic). Word meanings, then 6 rounds of *tap the word you hear* and *read this
   word to Nova*.
2. **📖 Read Aloud**: one paragraph per screen. 🔊 *Read to me* models it with a word
   highlight. 🎤 *Read to Nova* listens: words turn green, skipped or swapped words turn
   orange, and Nova practises up to 3 of them. Focus words are blue, and dotted-underline
   words show their meaning when tapped. The ⚡ meter shows words a minute against the
   phase goal.
3. **❓ Check-up**: 4 questions in shuffled order, each with a one-line "why" and a
   📖 *look back at the story* button.
4. **✏️ Write It**: 2 writing prompts per lesson. The first answers a story question in a
   complete sentence (often with a starter like “Jen sat still because…”). The second is a
   creative sentence that uses the lesson's spelling pattern (“use a word with ai or ay”).
   Writing is checked kindly by the shared WritePad / WriteCheck from Sentence Studio
   (`js/writepad.js`, `js/writecheck.js`, `css/writepad.css`, kept in sync with
   `writestudio/`). It's needed for the sticker on a lesson's first finish. Lessons
   finished before Write It existed stay finished.

No microphone (or not Chrome/Edge): **grown-up helper mode**. The child reads to a
grown-up, who taps ✅ *I read it!* or marks 🤔 tricky words.

## Reading levels (`../js/readlevel.js`)

Each learner reads at a level, picked from the 🐣 chip (home and reader; the speed goal scales with the level: 60/75/90/100%) or set by a grown-up in
Admin → 🎤 Reading Levels. Everyone starts on Easy.

| Level | What counts | 3 stars |
|---|---|---|
| 🐣 Easy · Brave Beginner | close words, sound-alikes, dropped little words; a brave 2nd try at a word always counts | 70% |
| 🧭 Medium · Word Explorer | sound-alikes, two slips in long words, dropped the/a/of; 2nd try counts if close | 85% |
| ⭐ Hard · Super Reader | one-letter slips anywhere, word endings (jump/jumped); 2nd try counts if nearly right | 95% |
| 🏆 Expert · Expert Reader | grade level: the strict listener as it was before | every word |

Words that count only because of the level are coloured **yellow** (`.w.close`). Reading as well as the
next level wants fills ⚡ power (page/paragraph ≥ 90% at the next level +4, a word right first time +1);
16 ⚡ = level up (party, trophy `lv-<id>`, 🎟️ ticket). Levels never drop on their own. Every brave try
(a close word, a missed word, a read under 3 stars) counts toward 💪 Brave badges at 3/10/25/50/100
(🎟️ ticket each, trophy `brave-heart`). Saved as `rl_<app>` per learner.

## Adding a phase

Data only, in `js/data.js`: give the phase a `lessons` array (4 lessons) and a `check`.
The lesson shape is documented at the top of the file. Write numbers as words.
`js/listener.js` maps digits the recogniser returns ("20") back to words. Add story
names that recognisers mishear to its `ALIKE` table. Nothing else needs changing: the
Admin page counts 24 lessons and 6 phases (`admin/js/admin.js`): raise both when Phase 7 is built.
New story names go into `ALIKE` in `js/listener.js`. Avoid hyphenated words ("three-way") in passages: the
tokenizer joins them into one word, but the recogniser hears two.

## Saved progress (per learner, via the Hub login)

`rr_points`, `rr_stickers` (`l:<lesson>`, `p:<phase>`), `rr_trophies`, `rr_lessons`
(lab / paragraph stars / fluency / quiz / write / done / best wpm), `rr_checks`, `rr_perfect`,
`rr_fixed`, `rr_bestWcpm`, `rr_writing` (the child's Write It answers, newest 200); +1 shared Prize Wheel ticket (`rw_tickets`) per lesson and phase.
Everything is logged to the activity database through `Tracker` (answers, lessons, wpm).
