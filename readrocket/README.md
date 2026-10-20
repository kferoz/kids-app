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
| 3 | Word-Part Station | prefixes & suffixes | 90 | coming soon |
| 4 | Big Word Galaxy | long words & expression | 100 | coming soon |
| 5 | Root Planet | roots & 4th-grade vocabulary | 110 | coming soon |
| 6 | 4th-Grade Star | longer passages, main idea, inference | 120 | coming soon |

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

## Adding a phase

Data only, in `js/data.js`: give the phase a `lessons` array (4 lessons) and a `check`.
The lesson shape is documented at the top of the file. Write numbers as words.
`js/listener.js` maps digits the recogniser returns ("20") back to words. Add story
names that recognisers mishear to its `ALIKE` table. Nothing else needs changing: the
Admin page already counts 24 lessons and 6 phases.

## Saved progress (per learner, via the Hub login)

`rr_points`, `rr_stickers` (`l:<lesson>`, `p:<phase>`), `rr_trophies`, `rr_lessons`
(lab / paragraph stars / fluency / quiz / write / done / best wpm), `rr_checks`, `rr_perfect`,
`rr_fixed`, `rr_bestWcpm`, `rr_writing` (the child's Write It answers, newest 200); +1 shared Prize Wheel ticket (`rw_tickets`) per lesson and phase.
Everything is logged to the activity database through `Tracker` (answers, lessons, wpm).
