/* ============================================================
   Little Learners — Data
   A game-first app for KINDERGARTEN (ages ~4–6, pre-readers).
   Everything is picture + sound driven. No reading required.
   ============================================================ */

/* The play "worlds" shown on the home screen. */
const GAMES = [
  { id: "letters",   name: "Letter Land",     emoji: "🔤", color: "#ff6f91", tagline: "Find the letters! 🔤" },
  { id: "phonics",   name: "Sound It Out",    emoji: "🔊", color: "#ff9a5a", tagline: "Which word starts with…? 🔊" },
  { id: "rhyme",     name: "Rhyme Time",      emoji: "🎵", color: "#b06fff", tagline: "Find words that rhyme! 🎵" },
  { id: "numbers",   name: "Count Along",     emoji: "🔢", color: "#33c9dc", tagline: "Count, then tap the number! 🔢" },
  { id: "sequence",  name: "What's Next?",    emoji: "🚂", color: "#2fb4c9", tagline: "Finish the number train! 🚂" },
  { id: "colors",    name: "Color Pop",       emoji: "🎨", color: "#7ed957", tagline: "Tap the right color! 🎨" },
  { id: "shapes",    name: "Shape Detective", emoji: "🔷", color: "#8a7dff", tagline: "Hunt for the shapes! 🔍" },
  { id: "opposites", name: "Opposites",       emoji: "↔️", color: "#ff5aa8", tagline: "Find the opposite! ↔️" },
  { id: "animals",   name: "Animal Sounds",   emoji: "🐄", color: "#ffb020", tagline: "Who makes that sound? 🐾" },
  { id: "patterns",  name: "Pattern Party",   emoji: "🔁", color: "#ff8fb3", tagline: "What comes next in the pattern? 🔁" },
  { id: "oddone",    name: "Odd One Out",     emoji: "🔍", color: "#5ac8e0", tagline: "Tap the one that is different! 🔍" },
  { id: "match",     name: "Memory Match",    emoji: "🧩", color: "#ffb84d", tagline: "Find the matching pairs! 🧩" }
];

/* Repeating units for "Pattern Party" (the child finds what comes next). */
const PATTERN_SETS = [
  ["🔴", "🔵"], ["⭐", "🌙"], ["🐶", "🐱"], ["🍎", "🍌"], ["🔺", "🟦"],
  ["🌸", "🌼"], ["🚗", "✈️"], ["🔴", "🔵", "🟢"], ["🐝", "🦋", "🐞"], ["❤️", "💛", "💙"]
];
/* Extra emojis used as pattern wrong-answers (kept out of the units above). */
const PATTERN_DISTRACT = ["🟣", "🟠", "🐸", "🍇", "🟩", "🌟", "🚀", "🐢"];

/* Sets of 4 where one emoji does not belong, for "Odd One Out". */
const ODD_SETS = [
  { items: ["🐶", "🐱", "🐰", "🍎"], odd: "🍎" },   // fruit among animals
  { items: ["🍎", "🍌", "🍇", "🚗"], odd: "🚗" },   // car among fruit
  { items: ["🔴", "🔵", "🟢", "🐝"], odd: "🐝" },   // bee among dots
  { items: ["⭐", "🌙", "☀️", "🐟"], odd: "🐟" },   // fish among sky
  { items: ["🚗", "🚌", "✈️", "🍔"], odd: "🍔" },   // burger among vehicles
  { items: ["🌸", "🌼", "🌻", "🧦"], odd: "🧦" },   // sock among flowers
  { items: ["🐸", "🐍", "🐢", "🎈"], odd: "🎈" },   // balloon among animals
  { items: ["🔺", "🟦", "⭕", "🐶"], odd: "🐶" }    // dog among shapes
];

/* A–Z, each with a friendly word + emoji ("A is for Apple"). */
const LETTERS = [
  { letter: "A", word: "Apple",     emoji: "🍎" },
  { letter: "B", word: "Ball",      emoji: "⚽" },
  { letter: "C", word: "Cat",       emoji: "🐱" },
  { letter: "D", word: "Dog",       emoji: "🐶" },
  { letter: "E", word: "Egg",       emoji: "🥚" },
  { letter: "F", word: "Fish",      emoji: "🐟" },
  { letter: "G", word: "Grapes",    emoji: "🍇" },
  { letter: "H", word: "Hat",       emoji: "🎩" },
  { letter: "I", word: "Ice cream", emoji: "🍦" },
  { letter: "J", word: "Juice",     emoji: "🧃" },
  { letter: "K", word: "Kite",      emoji: "🪁" },
  { letter: "L", word: "Lion",      emoji: "🦁" },
  { letter: "M", word: "Moon",      emoji: "🌙" },
  { letter: "N", word: "Nest",      emoji: "🪺" },
  { letter: "O", word: "Orange",    emoji: "🍊" },
  { letter: "P", word: "Pig",       emoji: "🐷" },
  { letter: "Q", word: "Queen",     emoji: "👑" },
  { letter: "R", word: "Rainbow",   emoji: "🌈" },
  { letter: "S", word: "Sun",       emoji: "☀️" },
  { letter: "T", word: "Tiger",     emoji: "🐯" },
  { letter: "U", word: "Umbrella",  emoji: "☂️" },
  { letter: "V", word: "Van",       emoji: "🚐" },
  { letter: "W", word: "Whale",     emoji: "🐳" },
  { letter: "X", word: "X-ray",     emoji: "🩻" },
  { letter: "Y", word: "Yo-yo",     emoji: "🪀" },
  { letter: "Z", word: "Zebra",     emoji: "🦓" }
];

/* Fun emojis we repeat when counting (one is picked per round). */
const COUNT_EMOJIS = ["🍓", "🐢", "🐝", "🌸", "⭐", "🐠", "🍄", "🦋", "🎈", "🐥", "🍩", "🚗", "🐞", "🌼"];

/* Colors shown as big soft "blobs"; the name is spoken aloud. */
const COLORS = [
  { name: "Red",    hex: "#ff5a5a" },
  { name: "Blue",   hex: "#4a90ff" },
  { name: "Green",  hex: "#4bd15a" },
  { name: "Yellow", hex: "#ffcf3f" },
  { name: "Orange", hex: "#ff9f40" },
  { name: "Purple", hex: "#a55eff" },
  { name: "Pink",   hex: "#ff77c8" },
  { name: "Brown",  hex: "#a9744f" }
];

/* Shapes shown as big emoji; the name is spoken aloud. */
const SHAPES = [
  { name: "Circle",   emoji: "🔵" },
  { name: "Square",   emoji: "🟪" },
  { name: "Triangle", emoji: "🔺" },
  { name: "Star",     emoji: "⭐" },
  { name: "Heart",    emoji: "❤️" },
  { name: "Diamond",  emoji: "🔶" }
];

/* Emoji pairs used by the Memory Match game. */
const MATCH_EMOJIS = ["🐶", "🐱", "🐰", "🦊", "🐼", "🐸", "🦁", "🐵", "🐷", "🐔", "🦄", "🐢"];

/* Rhyming word families for "Rhyme Time" (each group rhymes together). */
const RHYMES = [
  [ { word: "Cat",  emoji: "🐱" }, { word: "Hat",   emoji: "🎩" }, { word: "Bat",  emoji: "🦇" } ],
  [ { word: "Dog",  emoji: "🐶" }, { word: "Frog",  emoji: "🐸" }, { word: "Log",  emoji: "🪵" } ],
  [ { word: "Bee",  emoji: "🐝" }, { word: "Tree",  emoji: "🌳" }, { word: "Key",  emoji: "🔑" } ],
  [ { word: "Sun",  emoji: "☀️" }, { word: "Bun",   emoji: "🍞" }, { word: "Run",  emoji: "🏃" } ],
  [ { word: "Car",  emoji: "🚗" }, { word: "Star",  emoji: "⭐" }, { word: "Jar",  emoji: "🫙" } ],
  [ { word: "Cake", emoji: "🍰" }, { word: "Snake", emoji: "🐍" }, { word: "Lake", emoji: "🏞️" } ],
  [ { word: "Fish", emoji: "🐟" }, { word: "Dish",  emoji: "🍽️" } ],
  [ { word: "Ball", emoji: "⚽" }, { word: "Wall",  emoji: "🧱" }, { word: "Doll", emoji: "🪆" } ]
];

/* Opposite pairs for the "Opposites" game. */
const OPPOSITES = [
  { a: { word: "Big",   emoji: "🐘" }, b: { word: "Small", emoji: "🐭" } },
  { a: { word: "Hot",   emoji: "🔥" }, b: { word: "Cold",  emoji: "❄️" } },
  { a: { word: "Up",    emoji: "⬆️" }, b: { word: "Down",  emoji: "⬇️" } },
  { a: { word: "Day",   emoji: "☀️" }, b: { word: "Night", emoji: "🌙" } },
  { a: { word: "Happy", emoji: "😄" }, b: { word: "Sad",   emoji: "😢" } },
  { a: { word: "Fast",  emoji: "🐆" }, b: { word: "Slow",  emoji: "🐢" } },
  { a: { word: "Wet",   emoji: "💧" }, b: { word: "Dry",   emoji: "🏜️" } },
  { a: { word: "Loud",  emoji: "🔊" }, b: { word: "Quiet", emoji: "🤫" } }
];

/* Animals and the sounds they make, for "Animal Sounds". */
const ANIMAL_SOUNDS = [
  { animal: "Cow",   emoji: "🐄", sound: "Moo" },
  { animal: "Dog",   emoji: "🐶", sound: "Woof" },
  { animal: "Cat",   emoji: "🐱", sound: "Meow" },
  { animal: "Duck",  emoji: "🦆", sound: "Quack" },
  { animal: "Sheep", emoji: "🐑", sound: "Baa" },
  { animal: "Lion",  emoji: "🦁", sound: "Roar" },
  { animal: "Pig",   emoji: "🐷", sound: "Oink" },
  { animal: "Horse", emoji: "🐴", sound: "Neigh" },
  { animal: "Frog",  emoji: "🐸", sound: "Ribbit" },
  { animal: "Bird",  emoji: "🐦", sound: "Tweet" }
];

/* Cheerful things the app says when a child is correct. */
const PRAISE = ["Yay! 🎉", "Great job! ⭐", "You did it! 🌟", "Awesome! 🎈", "Woohoo! 🥳", "So smart! 💫", "Nice work! 👏"];

/* ------------------------------------------------------------
   ☀️ Summer School — activities from the incoming-Kindergarten
   summer packet: beginning sounds, reading short words, counting,
   sight words, and finishing a sentence.
   ------------------------------------------------------------ */
const SUMMER_GAMES = [
  { id: "firstsound",     name: "First Sounds",        emoji: "🔤", color: "#ff6f91", tagline: "Which letter does it start with?" },
  { id: "readword",       name: "Read a Word",         emoji: "📖", color: "#33c9dc", tagline: "Read the word, tap the picture!" },
  { id: "countmatch",     name: "Count & Match",       emoji: "🔢", color: "#7ed957", tagline: "Count, then tap the number!" },
  { id: "sightword",      name: "Sight Words",         emoji: "👀", color: "#8a7dff", tagline: "Find the word you hear!" },
  { id: "finishsentence", name: "Finish the Sentence", emoji: "✏️", color: "#ffb020", tagline: "Pick the word that fits!" }
];

/* Simple CVC words with a clear picture, for "Read a Word". */
const SUMMER_WORDS = [
  { word: "cat", emoji: "🐱" }, { word: "dog", emoji: "🐶" }, { word: "sun", emoji: "☀️" },
  { word: "bug", emoji: "🐛" }, { word: "pig", emoji: "🐷" }, { word: "hat", emoji: "🎩" },
  { word: "bus", emoji: "🚌" }, { word: "cup", emoji: "☕" }, { word: "box", emoji: "📦" },
  { word: "map", emoji: "🗺️" }, { word: "fox", emoji: "🦊" }, { word: "web", emoji: "🕸️" }
];

/* Common sight words from the packet's sight-word sheet. */
const SIGHT_WORDS = ["the", "and", "you", "for", "are", "was", "his", "they", "said", "have", "this", "with", "that", "from"];

/* Finish-the-sentence prompts (a blank word to choose). */
const SUMMER_SENTENCES = [
  { text: "I can ___ .",     emoji: "🏃", say: "I can run.",          answer: "run",    options: ["run", "blue", "six"] },
  { text: "The ___ is hot.", emoji: "☀️", say: "The sun is hot.",     answer: "sun",    options: ["sun", "cat", "hat"] },
  { text: "I see a ___ .",   emoji: "🐶", say: "I see a dog.",        answer: "dog",    options: ["dog", "the", "and"] },
  { text: "The cat is ___ .",emoji: "😴", say: "The cat is sleepy.",  answer: "sleepy", options: ["sleepy", "run", "bus"] },
  { text: "We like to ___ .",emoji: "🎨", say: "We like to play.",    answer: "play",   options: ["play", "red", "two"] },
  { text: "A ___ can fly.",  emoji: "🐦", say: "A bird can fly.",     answer: "bird",   options: ["bird", "box", "map"] }
];
