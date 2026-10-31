# Quiz packs

A pack is one quiz for Quiz Corner (`quiz/index.html#<id>`). The shared Quiz Kit
(`js/quizkit/`) draws the Learn cards, Practice Easy / Medium and the Mixed Test,
reads aloud, scores, gives stickers, and reports to the Tracker. RewardKit stars and
Admin charts work without extra code.

## Add a pack

1. Copy `senses.js` to `quiz/packs/<id>.js` and change the content.
2. Add `<script src="packs/<id>.js"></script>` to `quiz/index.html`, above `js/app.js`.
3. Add a line to `js/catalog.js` with href `quiz/index.html#<id>`, app `"quiz"`, and its
   subject, section and grades.
4. Run `node test/phase4-quizkit.js`. It checks every pack.

## Pack fields

| field | what |
|---|---|
| `id` | short and unique; it names the save slot `qk_<id>` |
| `title`, `icon`, `blurb` | shown on the picker card and the quiz menu |
| `skill` | Tracker skill name: `"<skill>: <topic title>"` |
| `subject`, `grades` | same codes as `js/catalog.js` (pk, kg, g1–g5) |
| `readToMe` | `true` for Pre-K and KG, so a new learner hears every question |
| `sizes` | `{easy, medium, mixed}` questions per round (default 6 / 6 / 8) |
| `mascot` | `{name, emoji, hello}`, or `svg` instead of `emoji` |
| `lang` | the read-aloud language of the pack's own text, default `"en-US"` |
| `native` | `{lang: "ta-IN", name: "Tamil"}` when the text has words in another language (see below) |
| `topics` | Learn cards: `{n, title, art, facts[], story}`. A fact like `"Term: meaning"` shows the term in bold |
| `questions` | see below |

## Questions

Every question has `id` (unique in the pack), `topic` (a topic `n`),
`difficulty` (`"easy"` or `"medium"`), `type`, `prompt`, `explanation` and
`picture` (an emoji). Answers are option **ids**, never text, so the kit can
shuffle the choices.

| type | answer |
|---|---|
| `multiple_choice` | `options [{id,text}]`, `correctAnswer: "B"` |
| `true_false_sentence` | `options` True/False (`T`, `F`), `correctAnswer`, plus `audioText` |
| `choose_two` | 3+ `options`, `correctAnswers: ["A","C"]` |
| `matching` | `items [{id,text}]`, `options [{id,text}]`, `correctAnswers {itemId: optionId}`, plus `audioText` |

Rules the test enforces:
- Enough questions for a round: at least `sizes.easy` easy and `sizes.medium` medium questions.
- Sentences have 12 words or fewer, so they read well aloud.
- Every answer id exists. Matching has one option per item, with no option used twice.

Write for the ear, too: say "minus", not "−", and name a sound by an example word ("the a in
cat"), never "/a/", or read-aloud says "slash". When the screen text can't be spoken as is
(a blank `___`, a symbol, emoji), add `audioText`.

## Words in another language (Tamil, Arabic…)

Write each one as `{{native script|spelling}}`, e.g. `{{வணக்கம்|vanakkam}}`, and set `native`
on the pack. Screens show "வணக்கம் (vanakkam)". Read-aloud speaks the English parts in the
English voice and each native word with an on-device voice for `native.lang`. Without one,
it says the spelling. Native script is never sent to an English voice. The test fails any
native script outside `{{…}}`, a broken marker, or a spelling that isn't plain English letters.
Packs in this style: `tamil.js`.
