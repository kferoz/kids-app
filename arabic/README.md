# 🐪 Arabic Oasis (KG + 3rd grade)

Jamal the Camel teaches Arabic to total beginners. It covers Standard Arabic (Fusha) letters the way schools and Quran classes teach them (alphabet → harakat → joining → words). It also teaches everyday spoken basics (greetings, polite words, numbers), so kids use the language from day one.

Open `index.html`. No build step, works offline.

## Two paths

The Hub login's grade picks the path. With nobody logged in, the child picks one and can switch.

| Path | Phase 1 | Later phases (coming soon) |
|---|---|---|
| 🐣 Kindergarten | ا ب ت ث · ج ح خ · د ذ ر ز (3–4 letters a lesson) · Magic Words. **Phase 2:** س ش · ص ض · ط ظ · Colors | Last letters · Little vowels · First words · Words I can write |
| 🎒 3rd grade | all 28 letters in 4 lessons of 7, each with a Talk Time pack (greetings · polite words · about me · count to five). **Phase 2 Harakat Station:** fatha · kasra · damma · mix, with Talk Time (colors · family · food · feelings) | Sukoon/Shadda/Tanween · Letters hold hands · Word market · Sentence oasis |

Letter lessons go **👋 Meet the Letters** → **🎮 Letter Game** → **✍️ Trace It**. The 3rd-grade path adds **🗣️ Talk Time**.
- The Letter Game rounds are: hear the letter's name, then tap it. Picture word, then pick its first letter. **Dot Detective**: find the letter with "two dots on top". On the 3rd-grade path, also name the letter.
- Wrong answers come from look-alike letters (ب ت ث ن ي, ج ح خ…) that the child has already met. Dots are what tell Arabic letters apart.
- Talk Time is tap to hear, then say it out loud and tap "I said it!". Then a quiz: what does it mean, and "what would you say?" situations.

Harakat lessons (`kind:"harakat"`) go **👋 Meet the Mark** → **🎮 Sound Game** → **📖 Read Words** → **✍️ Trace It** → **🗣️ Talk Time**.
- The Sound Game's wrong answers are the same letter with an earlier mark (ba vs bi vs bu) once 2+ marks are known.
- Read Words splits a word into syllables (`wordParts`: letter + its mark). The child taps them right to left, taps "I read it!", then plays a "which word did Jamal say?" quiz.
- Trace It traces letters WITH their mark. The mark is its own piece, so it must be traced too.

## Speech

- With an Arabic voice on the device, Arabic letters, words and phrases are spoken in Arabic. Jamal's tips stay in English.
- Without one, Jamal says an English spelling (`LETTERS[x].say`, phrase `.tr`). The home screen tells grown-ups how to add an Arabic voice.
- `js/voice.js` no longer puts the learner's English Hub voice onto Arabic utterances.
- In the APK, `android/bridge.js` lists an "Android Arabic" voice when `AndroidBridge.ttsHasLang("ar")` is true. Speech in another language is sent as `lang:ar`, and `MainActivity.useVoice` switches the TTS language.

## Tracing

Letters are traced with TracePad in glyph mode (`js/tracepad.js`, shared with `tracewrite/`). It needs no stroke data. The letter is drawn from the font and split into its pieces (the body plus each dot). Then it is thinned to a one-pixel centre line.
- The ink must stay on the letter.
- It must cover about 82% of the body's centre line.
- It must touch every dot. Jamal says "don't forget the dots!"

Checking the centre line instead of area stops a fat part (the head of م) from outweighing a thin tail.

## Data

- Saved per learner (`ar_` keys): `ar_lessons` (ids `ak*` KG, `ag*` 3rd grade), `ar_met` (letters met), `ar_points`, `ar_stickers`, `ar_trophies`, `ar_traced`, `ar_said`, `ar_dots`. `ar_track` is only used when nobody is logged in.
- Hub tiles: one in Kindergarten, one in Elementary. Admin subject: Arabic (9th colour). Also listed in the Rewards Center.
