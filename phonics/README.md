# 🦜 Phonics Pals

Read-aloud phonics storybooks for a **Kindergartener**, with **Echo the parrot** — a
listening buddy who hears the child read through the microphone, marks every word, and
kindly practises the tricky ones.

Open `index.html` (or the 🦜 tile in the Hub's Kindergarten section).

## Steps (phases)

The home screen is a path of steps (`PHASES` in `js/data.js`). Steps 1–3 are open from
the start; each later step opens when the one before it is finished.

| Step | Name | What | Status |
|---|---|---|---|
| 1 | Letter Sounds | 4 lessons (s a t p i n · m d g o c k · e u r h b f · l j v w x y z q): 👋 Meet the Letters → 🎮 Sound Game (hear a sound → tap the letter, picture → first letter, say the word to Echo) → 🖼️ Picture Quiz | ✅ built |
| 2 | Story Books | the five books below | ✅ built |
| 3 | Sight Words | 4 lessons of 5 words (I a the see is · and my like go to · we can you look up · said here play come me): 👀 Meet the Words (hear it, spell it, see it in a sentence) → 🎮 Word Game (tap the word you hear, read it to Echo, find the missing word) → 🧩 Build a Sentence (tap word tiles in order, then read the sentence to Echo), the first step toward writing | ✅ built |
| 4 | Sh, Ch, Th | 4 lessons (sh · ch · th · mixed): 👋 Meet the Sound (two letters, one sound; tap pictures to sound them out with the team as ONE sound) → 🎮 Sound Game (tap the word you hear, pick the missing sh/ch/th, read a word to Echo) → 🧩 Build a Sentence. Opens after Step 3 | ✅ built |
| 5 | Blends | 4 lessons (st sp sn · fl cl bl · gr tr cr · end blends -st -nd -mp), `kind:"blend"`, same screens as Step 4. Each letter keeps its own sound when sounding out, and the blend letters are highlighted. Opens after Step 4 | ✅ built |
| 6 | Magic e | 4 lessons (a_e · i_e · o_e u_e · mix), `kind:"magic"`: 🪄 Meet Magic e (tap the wand: cap turns into cape, the picture changes) → 🎮 Magic Game (hear cap or cape, read the word that matches the picture, read a magic word to Echo) → 🧩 Build a Sentence. Sounding out says the vowel's NAME and keeps the e silent (`magicOut`). Trophy "Magic e Wizard". Opens after Step 5 | ✅ built |

Letter lessons are saved in `ph_lessons` and win `l:<id>` stickers plus the 🔠 *Letter Pro*
trophy. Letters that share a sound (c and k) are never offered together. *x* uses an
end-of-word picture (box), and *q* is spoken as “kwuh”. Book ids are unchanged, so book
progress (`ph_books`) carries over. Sight-word lessons are saved in `ph_lessons` too
(ids `sw1`–`sw4`); `ph_built` counts built sentences (🧩 *Sentence Builder* trophy at 6),
and 👀 *Sight Word Star* is for finishing all four.

## The five books

| # | Book | Sound | Source |
|---|------|-------|--------|
| 1 | Al | short **o** | child's school reader (text copied page by page) |
| 2 | Tim | short **u** | child's school reader |
| 3 | Sam and the Hat | short **a** | *bonus stand-in* — the photo zip arrived empty |
| 4 | Pip the Pig | short **i** | *bonus stand-in* — the photo zip arrived empty |
| 5 | The Jet | short **e** | child's school reader |

Books 3 and 4 are original stories in the same decodable style. When the real photos are
re-sent, replace their `pages` / `focus` / `sight` / `quiz` in `js/data.js` and drop the
`bonus: true` flag.

All pictures are hand-drawn SVG (`js/art.js`) — no image files. Each page describes its
picture as data: `art: { bg, items: [[type, x, y, scale, opts]] }`.

## Each book has three steps

1. **🔤 Sound Warm-up** — the vowel sound, tap-to-sound-out word cards (letters light up as
   each sound is spoken), sight words, then 6 quick rounds: *tap the word you hear* and
   *read this word to Echo* (mic).
2. **📖 Read the Story** — picture + big Andika text (short vowels in red, sight words in
   purple). **🔊 Read to me** highlights words as they're spoken. **🎤 Read to Echo**
   listens: words turn green live; skipped or swapped words turn orange and Echo practises
   up to 3 of them (sound it out → child says it). Fixing them all earns a bonus star.
3. **❓ Story Quiz** — 3–4 picture questions, read aloud.

## How the listening works

`js/listener.js` uses the browser's speech recognition (**Chrome or Edge**, needs internet).
Heard words are lined up against the page with a longest-common-subsequence match. It is
forgiving on purpose (sound-alikes like "all" for *Al*, one-letter slips), **except** when
the child says a different word from the same book (e.g. *dog* for *Dot*) — that is a real
swap and gets practised.

No mic / blocked mic / unsupported browser → **grown-up helper mode**: the child reads aloud,
taps **✅ I read it!**, and a grown-up can tap **🤔 Tricky word** to mark words to practise.

## Rewards

- ⭐ points (`ph_points`): page stars ×2, perfect-page bonus, warm-up, quiz, book bonus
- ⭐⭐⭐ per page (`ph_books[id].pages`)
- 🎟️ stickers (`ph_stickers`): one per finished book (`b:<id>`) + a fun sticker every 3 perfect pages
- 🏆 trophies (`ph_trophies`): First Read-Aloud, Book Finisher, Word Fixer, Quiz Whiz, Perfect Ten, Sound Star, Super Reader
- +1 shared Prize Wheel ticket (`rw_tickets`) per book finished the first time

Progress is per learner (Hub login), logged to the Admin page via `Tracker`.
