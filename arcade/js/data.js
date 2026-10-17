/* ============================================================
   Free Games Arcade — Data
   Quick, standalone educational mini-games. Every game you finish
   earns 🎟️ tickets, saved to the shared "rw_tickets" key so you can
   spend them on the Prize Wheel in the Rewards Center.
   ============================================================ */

const ARCADE_GAMES = [
  { id: "math",     name: "Quick Math",    emoji: "➕", color: "#33c9dc", tagline: "Solve the sums fast!" },
  { id: "scramble", name: "Word Scramble", emoji: "🔤", color: "#ff8a3d", tagline: "Unscramble the word!" },
  { id: "memory",   name: "Memory Match",  emoji: "🧠", color: "#a56bff", tagline: "Find the matching pairs!" },
  { id: "oddone",   name: "Odd One Out",   emoji: "🔍", color: "#7ed957", tagline: "Spot the one that's different!" }
];

/* Word Scramble: unscramble letters to spell the word (emoji is a hint). */
const SCRAMBLE_WORDS = [
  { word: "CAT", emoji: "🐱" }, { word: "DOG", emoji: "🐶" }, { word: "SUN", emoji: "☀️" },
  { word: "STAR", emoji: "⭐" }, { word: "FISH", emoji: "🐟" }, { word: "TREE", emoji: "🌳" },
  { word: "CAKE", emoji: "🍰" }, { word: "FROG", emoji: "🐸" }, { word: "BOOK", emoji: "📚" }, { word: "MOON", emoji: "🌙" }
];

/* Odd One Out: 4 words, one doesn't fit the category. */
const ARCADE_ODD = [
  { q: "Which is NOT a fruit?",   items: ["Apple", "Banana", "Carrot", "Grape"],  odd: "Carrot" },
  { q: "Which is NOT an animal?", items: ["Dog", "Cat", "Table", "Lion"],         odd: "Table" },
  { q: "Which is NOT a color?",   items: ["Red", "Blue", "Seven", "Green"],       odd: "Seven" },
  { q: "Which is NOT a number?",  items: ["Three", "Ten", "Dog", "Five"],         odd: "Dog" },
  { q: "Which does NOT fly?",     items: ["Bird", "Plane", "Fish", "Bee"],        odd: "Fish" },
  { q: "Which is NOT a shape?",   items: ["Circle", "Square", "Apple", "Triangle"], odd: "Apple" },
  { q: "Which is NOT a drink?",   items: ["Milk", "Juice", "Water", "Chair"],     odd: "Chair" },
  { q: "Which is NOT a day?",     items: ["Monday", "Friday", "Purple", "Sunday"], odd: "Purple" }
];

/* Memory Match card faces. */
const ARCADE_MEMORY = ["🍎", "🚀", "🐶", "⭐", "🌈", "🐸", "🎈", "🦋", "🐙", "🍕", "🦄", "🐝"];
