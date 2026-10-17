/* ============================================================
   Reading Trail — Data
   A stage-by-stage "learn to read" journey for early elementary
   (great for 2nd–3rd graders building fluency). The order follows
   how reading is taught: letter sounds → blends → word families →
   syllables → blending → sight words → sentences → fluency → story.

   Each STAGE has an `activity` type that decides how it is played:
     "pick"     — tap the correct answer   round: {text?,say,prompt,kind,choices:[{t,correct}]}
     "clap"     — count the syllables      round: {word,emoji,syllables,parts[]}
     "soundout" — hear the parts, blend    round: {word,emoji,parts[],kind,choices:[{t,correct}]}
     "karaoke"  — read a phrase along      round: {words[]}
     "story"    — read a passage + Qs      stage: {passage[], rounds:[pick questions]}

   Every completed stage awards a collectible sticker.
   ============================================================ */

const READING_STAGES = [
  {
    id: "letter-sounds",
    name: "Letter Sounds",
    emoji: "🔤",
    activity: "pick",
    sticker: { emoji: "🌟", name: "Sound Star" },
    intro: "Every word is built from sounds. Let's find the first sound!",
    rounds: [
      { text: "🐒 monkey", say: "monkey", prompt: "Which letter makes the FIRST sound in monkey?", kind: "letter", choices: [{ t: "m", correct: true }, { t: "s" }, { t: "t" }, { t: "a" }] },
      { text: "☀️ sun", say: "sun", prompt: "Which letter makes the FIRST sound in sun?", kind: "letter", choices: [{ t: "s", correct: true }, { t: "b" }, { t: "f" }, { t: "o" }] },
      { text: "⚽ ball", say: "ball", prompt: "Which letter makes the FIRST sound in ball?", kind: "letter", choices: [{ t: "b", correct: true }, { t: "d" }, { t: "p" }, { t: "g" }] },
      { text: "🍎 apple", say: "apple", prompt: "Which letter makes the FIRST sound in apple?", kind: "letter", choices: [{ t: "a", correct: true }, { t: "e" }, { t: "i" }, { t: "o" }] },
      { text: "🐯 tiger", say: "tiger", prompt: "Which letter makes the FIRST sound in tiger?", kind: "letter", choices: [{ t: "t", correct: true }, { t: "k" }, { t: "c" }, { t: "l" }] }
    ]
  },
  {
    id: "blends",
    name: "Blends & Digraphs",
    emoji: "🔠",
    activity: "pick",
    sticker: { emoji: "🎈", name: "Blend Buddy" },
    intro: "Two letters can team up to make one sound, like sh and ch.",
    rounds: [
      { prompt: "Tap the word that starts with SH.", say: "Which word starts with s h?", kind: "word", choices: [{ t: "🚢 ship", say: "ship", correct: true }, { t: "🐶 dog", say: "dog" }, { t: "☀️ sun", say: "sun" }] },
      { prompt: "Tap the word that starts with CH.", say: "Which word starts with c h?", kind: "word", choices: [{ t: "🧀 cheese", say: "cheese", correct: true }, { t: "🌳 tree", say: "tree" }, { t: "🐟 fish", say: "fish" }] },
      { prompt: "Tap the word that starts with TH.", say: "Which word starts with t h?", kind: "word", choices: [{ t: "👍 thumb", say: "thumb", correct: true }, { t: "🦁 lion", say: "lion" }, { t: "🍰 cake", say: "cake" }] },
      { prompt: "Tap the word that starts with BL.", say: "Which word starts with b l?", kind: "word", choices: [{ t: "🔵 blue", say: "blue", correct: true }, { t: "🔴 red", say: "red" }, { t: "🟢 green", say: "green" }] },
      { prompt: "Tap the word that starts with ST.", say: "Which word starts with s t?", kind: "word", choices: [{ t: "⭐ star", say: "star", correct: true }, { t: "🌙 moon", say: "moon" }, { t: "☁️ cloud", say: "cloud" }] }
    ]
  },
  {
    id: "word-families",
    name: "Word Families",
    emoji: "🏠",
    activity: "pick",
    sticker: { emoji: "🏡", name: "Family Finder" },
    intro: "Words that rhyme belong to the same word family. Change the first letter!",
    rounds: [
      { prompt: "Which word rhymes with CAT?", say: "Which word rhymes with cat?", kind: "word", choices: [{ t: "🎩 hat", say: "hat", correct: true }, { t: "🐶 dog", say: "dog" }, { t: "🖊️ pen", say: "pen" }] },
      { prompt: "Which word rhymes with PIG?", say: "Which word rhymes with pig?", kind: "word", choices: [{ t: "🌾 wig", say: "wig", correct: true }, { t: "🚌 bus", say: "bus" }, { t: "🕸️ net", say: "net" }] },
      { prompt: "Which word rhymes with HOP?", say: "Which word rhymes with hop?", kind: "word", choices: [{ t: "🔝 top", say: "top", correct: true }, { t: "🐱 cat", say: "cat" }, { t: "🦵 leg", say: "leg" }] },
      { prompt: "Which word rhymes with FUN?", say: "Which word rhymes with fun?", kind: "word", choices: [{ t: "☀️ sun", say: "sun", correct: true }, { t: "🛏️ bed", say: "bed" }, { t: "🎩 hat", say: "hat" }] },
      { prompt: "Which word rhymes with WELL?", say: "Which word rhymes with well?", kind: "word", choices: [{ t: "🔔 bell", say: "bell", correct: true }, { t: "🗺️ map", say: "map" }, { t: "☕ cup", say: "cup" }] }
    ]
  },
  {
    id: "clap-syllables",
    name: "Clap the Syllables",
    emoji: "👏",
    activity: "clap",
    sticker: { emoji: "🥁", name: "Clap Champ" },
    intro: "Big words break into beats called syllables. Clap them out!",
    rounds: [
      { word: "cat", emoji: "🐱", syllables: 1, parts: ["cat"] },
      { word: "rabbit", emoji: "🐰", syllables: 2, parts: ["rab", "bit"] },
      { word: "banana", emoji: "🍌", syllables: 3, parts: ["ba", "na", "na"] },
      { word: "pencil", emoji: "✏️", syllables: 2, parts: ["pen", "cil"] },
      { word: "butterfly", emoji: "🦋", syllables: 3, parts: ["but", "ter", "fly"] }
    ]
  },
  {
    id: "blend-sounds",
    name: "Blend the Sounds",
    emoji: "🔊",
    activity: "soundout",
    kind: "letters",
    sticker: { emoji: "🎧", name: "Sound Blender" },
    intro: "Slide the sounds together to read a word: c–a–t… cat!",
    rounds: [
      { word: "cat", emoji: "🐱", parts: ["c", "a", "t"], choices: [{ t: "🐱", correct: true }, { t: "🐶" }, { t: "🐟" }] },
      { word: "sun", emoji: "☀️", parts: ["s", "u", "n"], choices: [{ t: "☀️", correct: true }, { t: "🌙" }, { t: "⭐" }] },
      { word: "dog", emoji: "🐶", parts: ["d", "o", "g"], choices: [{ t: "🐶", correct: true }, { t: "🐱" }, { t: "🐔" }] },
      { word: "bug", emoji: "🐛", parts: ["b", "u", "g"], choices: [{ t: "🐛", correct: true }, { t: "🐝" }, { t: "🦋" }] }
    ]
  },
  {
    id: "chunk-syllables",
    name: "Chunk the Syllables",
    emoji: "🧩",
    activity: "soundout",
    kind: "syllables",
    sticker: { emoji: "🧠", name: "Chunk Master" },
    intro: "Long words are easy when you read them one chunk at a time.",
    rounds: [
      { word: "rabbit", emoji: "🐰", parts: ["rab", "bit"], choices: [{ t: "🐰", correct: true }, { t: "🐭" }, { t: "🦊" }] },
      { word: "tiger", emoji: "🐯", parts: ["ti", "ger"], choices: [{ t: "🐯", correct: true }, { t: "🦁" }, { t: "🐱" }] },
      { word: "pumpkin", emoji: "🎃", parts: ["pump", "kin"], choices: [{ t: "🎃", correct: true }, { t: "🍎" }, { t: "🍊" }] },
      { word: "sunflower", emoji: "🌻", parts: ["sun", "flow", "er"], choices: [{ t: "🌻", correct: true }, { t: "🌹" }, { t: "🌵" }] }
    ]
  },
  {
    id: "sight-words",
    name: "Sight Words",
    emoji: "👀",
    activity: "pick",
    sticker: { emoji: "🔮", name: "Word Watcher" },
    intro: "Some words we just KNOW by sight. Snap them up fast!",
    rounds: [
      { text: "said", say: "said", prompt: "Tap the word: said", kind: "word", choices: [{ t: "said", correct: true }, { t: "sing" }, { t: "sad" }, { t: "side" }] },
      { text: "was", say: "was", prompt: "Tap the word: was", kind: "word", choices: [{ t: "was", correct: true }, { t: "saw" }, { t: "war" }, { t: "wan" }] },
      { text: "you", say: "you", prompt: "Tap the word: you", kind: "word", choices: [{ t: "you", correct: true }, { t: "yes" }, { t: "use" }, { t: "yet" }] },
      { text: "they", say: "they", prompt: "Tap the word: they", kind: "word", choices: [{ t: "they", correct: true }, { t: "then" }, { t: "them" }, { t: "the" }] },
      { text: "friend", say: "friend", prompt: "Tap the word: friend", kind: "word", choices: [{ t: "friend", correct: true }, { t: "found" }, { t: "front" }, { t: "fried" }] },
      { text: "because", say: "because", prompt: "Tap the word: because", kind: "word", choices: [{ t: "because", correct: true }, { t: "before" }, { t: "between" }, { t: "become" }] }
    ]
  },
  {
    id: "read-sentence",
    name: "Read the Sentence",
    emoji: "💬",
    activity: "pick",
    sticker: { emoji: "🎯", name: "Sentence Star" },
    intro: "Now put words together and read a whole sentence!",
    rounds: [
      { text: "The cat sat on the mat.", say: "The cat sat on the mat.", prompt: "What is this sentence about?", kind: "emoji", choices: [{ t: "🐱", correct: true }, { t: "🐶" }, { t: "🐟" }] },
      { text: "The sun is very hot.", say: "The sun is very hot.", prompt: "Which picture matches?", kind: "emoji", choices: [{ t: "☀️", correct: true }, { t: "🌧️" }, { t: "❄️" }] },
      { text: "I see a big red bus.", say: "I see a big red bus.", prompt: "Which picture matches?", kind: "emoji", choices: [{ t: "🚌", correct: true }, { t: "🚗" }, { t: "🚲" }] },
      { text: "The dog can run fast.", say: "The dog can run fast.", prompt: "Which picture matches?", kind: "emoji", choices: [{ t: "🐶", correct: true }, { t: "🐢" }, { t: "🐌" }] }
    ]
  },
  {
    id: "fluency",
    name: "Fluency Phrases",
    emoji: "⚡",
    activity: "karaoke",
    sticker: { emoji: "🚀", name: "Fluent Flyer" },
    intro: "Read smoothly! Follow the words as they light up, then read along.",
    rounds: [
      { words: ["Once", "upon", "a", "time"] },
      { words: ["The", "big", "brown", "dog"] },
      { words: ["We", "like", "to", "read", "books"] },
      { words: ["Off", "we", "go", "to", "play"] }
    ]
  },
  {
    id: "story-time",
    name: "Story Time",
    emoji: "📚",
    activity: "story",
    sticker: { emoji: "🏆", name: "Bookworm" },
    intro: "You're ready to read a whole story. Let's go!",
    passage: [
      "Meg is a little red hen.",
      "She lives on a big, sunny farm.",
      "One day, Meg finds a lost egg in the tall grass.",
      "She keeps the egg warm all night long.",
      "In the morning, a tiny chick says, 'Peep!'",
      "Meg is so happy. She is not alone anymore."
    ],
    rounds: [
      { prompt: "Who is the story about?", say: "Who is the story about?", kind: "word", choices: [{ t: "Meg the hen", correct: true }, { t: "a puppy" }, { t: "a boy" }, { t: "a cat" }] },
      { prompt: "What did Meg find in the grass?", say: "What did Meg find in the grass?", kind: "word", choices: [{ t: "a lost egg", correct: true }, { t: "a ball" }, { t: "a hat" }, { t: "a coin" }] },
      { prompt: "How did Meg feel at the end?", say: "How did Meg feel at the end?", kind: "word", choices: [{ t: "happy", correct: true }, { t: "sad" }, { t: "angry" }, { t: "sleepy" }] }
    ]
  }
];

/* Ollie the Owl cheers the reader on. */
const OLLIE_CHEERS = ["Hoot hoot! You did it! 🦉", "Super reading! 🌟", "You're getting so strong! 💪", "Wonderful! 📖", "Wow, well read! 🎉", "You're a reading star! ⭐"];

/* Milestone trophies (beyond the per-stage stickers). */
const READING_TROPHIES = [
  { id: "first-steps", icon: "🐣", name: "First Steps", desc: "Finish your first stage" },
  { id: "sprout",      icon: "🌱", name: "Reading Sprout", desc: "Finish 3 stages" },
  { id: "wizard",      icon: "🪄", name: "Word Wizard", desc: "Finish 6 stages" },
  { id: "perfect",     icon: "✨", name: "Perfect Reader", desc: "Finish a stage with no mistakes" },
  { id: "champion",    icon: "🏆", name: "Reading Champion", desc: "Finish the whole trail" }
];
