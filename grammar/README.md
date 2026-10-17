# 🚀 Grammar Galaxy

An interactive learning app that helps **elementary students** master English
grammar the fun way — with lesson flashcards, friendly quizzes, a word-hunting
detective game, and **Superhero Story Rescue** reading-comprehension stories.

## What kids can do

- **Pick a topic** — Nouns 📛, Pronouns 🙋, Verbs 🏃, Adjectives 🎨, Adverbs 💨,
  Articles ✏️, Prepositions 📍, Conjunctions 🔗, Singular & Plural ➕,
  Verb Tenses ⏰, and Punctuation ❗
- **Flip lesson cards** — tap a card to reveal the grammar rule behind a friendly
  question, with simple examples
- **Listen** — a "🔊 Read to me" button reads each lesson aloud (great for early readers)
- **Collect stars ⭐** — mark lessons as "I Got It!" and earn stars for correct quiz answers
- **Take a quiz** — 5 friendly questions per topic with instant, encouraging feedback
- **Win trophies 🏆** — earn a 🏅 *Topic Master* trophy for learning every lesson in a
  topic and a 🏆 *Quiz* trophy for finishing each quiz, all shown in a **Trophy Case**
- **Play Word Detective 🕵️** — unlock a mini-game where kids tap the correct word
  (naming word, action word, describing word…) inside a sentence
- **Read Superhero Story Rescue 🦸** — **10 illustrated rescue stories** starring the
  Rescue Squad (⚡ Bolt, 🌊 Marina, 🔥 Ember, 🌪️ Gale, 💪 Titan & 🐾 Scout). Kids read
  each story page-by-page (with read-aloud), then answer **comprehension questions**
  about who/what/where/why and word meanings. Finishing a story earns a 📖 story trophy,
  and reading all ten unlocks the 🦸 **Super Reader** trophy.
- **Surprise Lesson 🎲** — jump to a random lesson from any topic

## Learning skills it builds

- Recognizing parts of speech in real sentences
- **Reading comprehension** — recalling details, sequence, and meaning from a story
- Reading & listening comprehension (read-aloud on every lesson and story page)
- Recall and self-testing (quiz mode)
- Social-emotional themes — teamwork, kindness, and safety in every rescue story
- Confidence through positive, encouraging feedback
- Progress motivation via a star-reward system

## How to run

No installation needed — it's a plain web app.

1. Open the `grammar` folder.
2. Double-click **`index.html`** to open it in any modern web browser
   (Chrome, Edge, Firefox, Safari).

That's it! Works offline. Stars, learned lessons, and trophies are saved in the
browser so progress is remembered between visits.

> Tip for classrooms: on a whiteboard/touchscreen, use the **← / →** arrow keys
> to move between lessons and **Space** to flip a card.

## Project structure

```
grammar/
├── index.html        # App layout & screens
├── css/
│   └── styles.css    # Playful, responsive kid-friendly styling
└── js/
    ├── data.js       # Lessons & quizzes (TOPICS), Word Detective (WORD_GAME), stories (STORIES)
    └── app.js        # App logic: flashcards, quiz, rewards, game, Story Rescue reader
```

## Adding more content

Open `js/data.js`:

- **Grammar lessons/quizzes** — each `TOPICS` entry has a `lessons` array and a `quiz`
  array. Copy an existing entry's pattern.
- **Word Detective rounds** — add to the `WORD_GAME` array.
- **Rescue stories** — add to the `STORIES` array. Each story is
  `{ id, title, emoji, heroes, pages: [{ emoji, text }], questions: [{ q, options, answer }] }`.
  Copy an existing story and the picker, reader, and comprehension quiz all update
  automatically — no other code changes needed.
