# 🔍 Fun Facts Explorer

An interactive learning app that helps **elementary students** discover amazing,
verified fun facts about the world — and test what they learned with mini-quizzes.

## What kids can do

- **Pick a topic** — Animals 🐘, Plants 🌻, Universe 🪐, Human Body 🦴, Ocean 🐠, Dinosaurs 🦕
- **Flip flashcards** — tap a card to reveal the fun fact behind a "Did you know?" teaser
- **Listen** — a "🔊 Read to me" button reads each fact aloud (great for early readers)
- **Collect stars ⭐** — mark facts as "learned" and earn stars for correct quiz answers
- **Take a quiz** — 5 friendly questions per topic with instant, encouraging feedback
- **Win trophies 🏆** — earn a 🏅 *Topic Master* trophy for learning every fact in a topic and a 🏆 *Quiz* trophy for completing each quiz, all shown in a **Trophy Case**
- **Play a game 🎮** — a **Memory Match** mini-game using the topic emojis; match every pair to win bonus stars
- **Surprise Me 🎲** — jump to a random fact from any topic

## Learning skills it builds

- Reading & listening comprehension
- Recall and self-testing (quiz mode)
- Curiosity and confidence through positive, encouraging feedback
- Progress motivation via a star-reward system

## How to run

No installation needed — it's a plain web app.

1. Open the `funfacts` folder.
2. Double-click **`index.html`** to open it in any modern web browser
   (Chrome, Edge, Firefox, Safari).

That's it! Works offline. Stars and learned facts are saved in the browser
so progress is remembered between visits.

> Tip for classrooms: on a whiteboard/touchscreen, use the **← / →** arrow keys
> to move between facts and **Space** to flip a card.

## Project structure

```
funfacts/
├── index.html        # App layout & screens
├── css/
│   └── styles.css    # Playful, responsive kid-friendly styling
└── js/
    ├── data.js       # All facts & quiz questions (easy to add more!)
    └── app.js        # App logic: navigation, flashcards, quiz, rewards
```

## Adding more facts

Open `js/data.js`. Each topic is an object with a `facts` array and a `quiz`
array. Copy the pattern of an existing entry to add new facts or questions —
no other code changes needed.
