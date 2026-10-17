/* ============================================================
   Grammar Treasure Hunt — Data
   Each ADVENTURE is a treasure route for elementary students.
   Answer the grammar "clue" at every island to sail forward
   and dig up the treasure at the X.
     adventure = { id, name, emoji, blurb, route[emoji], clues[] }
     clue      = { q, options[], answer (index) }
   The route has one landmark emoji per clue; the code adds the
   final treasure node automatically.
   ============================================================ */

const ADVENTURES = [
  {
    id: "noun-bay",
    name: "Noun Bay",
    emoji: "🏝️",
    blurb: "Hunt for naming words along the shore.",
    route: ["🏝️", "🌴", "🐚", "🦜", "⛺", "🗿"],
    clues: [
      { q: "Ahoy! Which word is a noun (a naming word)?", options: ["run", "dog", "happy", "quickly"], answer: 1 },
      { q: "Find the noun: 'The ship sailed to the island.'", options: ["sailed", "to", "island", "the"], answer: 2 },
      { q: "Which one is a PROPER noun?", options: ["city", "London", "river", "boy"], answer: 1 },
      { q: "Pick the noun: 'A parrot sat on the mast.'", options: ["parrot", "on", "sat", "a"], answer: 0 },
      { q: "Which word names a place?", options: ["jump", "beach", "shiny", "loudly"], answer: 1 },
      { q: "Which word should start with a capital letter?", options: ["captain", "anna", "boat", "map"], answer: 1 }
    ]
  },
  {
    id: "verb-volcano",
    name: "Verb Volcano",
    emoji: "🌋",
    blurb: "Climb the volcano, one action word at a time.",
    route: ["🏝️", "🌴", "🗿", "🔥", "🌋", "⚓"],
    clues: [
      { q: "Which word is a verb (an action word)?", options: ["table", "swim", "red", "slowly"], answer: 1 },
      { q: "Find the verb: 'The pirate digs for gold.'", options: ["pirate", "digs", "for", "gold"], answer: 1 },
      { q: "Which word shows action?", options: ["happy", "jump", "chair", "blue"], answer: 1 },
      { q: "Pick the verb: 'Birds fly over the sea.'", options: ["birds", "fly", "over", "sea"], answer: 1 },
      { q: "Which is the PAST tense of 'run'?", options: ["runs", "running", "ran", "run"], answer: 2 },
      { q: "Finish it: 'Yesterday we ___ to the island.'", options: ["sail", "sailed", "sailing", "sails"], answer: 1 }
    ]
  },
  {
    id: "adjective-reef",
    name: "Adjective Reef",
    emoji: "🪸",
    blurb: "Dive the reef and describe what you see.",
    route: ["🏝️", "🪸", "🐠", "🐙", "🦀", "🏴‍☠️"],
    clues: [
      { q: "Which word is an adjective (a describing word)?", options: ["shiny", "run", "quickly", "ship"], answer: 0 },
      { q: "Find the adjective: 'The brave captain smiled.'", options: ["captain", "brave", "smiled", "the"], answer: 1 },
      { q: "Which word describes size?", options: ["huge", "jump", "sail", "loudly"], answer: 0 },
      { q: "Pick the adjective: 'We found a golden coin.'", options: ["found", "golden", "coin", "we"], answer: 1 },
      { q: "Which word tells how something feels to touch?", options: ["soft", "run", "boat", "there"], answer: 0 },
      { q: "Choose the describing word: 'A scary storm came.'", options: ["storm", "came", "scary", "a"], answer: 2 }
    ]
  },
  {
    id: "comma-cove",
    name: "Capital & Comma Cove",
    emoji: "⚓",
    blurb: "Only tidy sentences unlock this cove.",
    route: ["🏝️", "⚓", "🚢", "🧭", "🌊", "🏖️"],
    clues: [
      { q: "Which sentence is written correctly?", options: ["the ship is fast.", "The ship is fast.", "the Ship is fast", "The ship is fast"], answer: 1 },
      { q: "What ends a question? 'Where is the gold___'", options: [".", "?", "!", ","], answer: 1 },
      { q: "Which word needs a capital letter?", options: ["sea", "monday", "boat", "wave"], answer: 1 },
      { q: "Pick the correct sentence:", options: ["i found the map.", "I found the map.", "i found the map", "I found the Map."], answer: 1 },
      { q: "What ends an excited sentence? 'We found it___'", options: [".", "?", "!", ","], answer: 2 },
      { q: "Where does the comma go?", options: ["Yes, I will help.", "Yes I, will help.", "Yes I will, help.", "Yes I will help,"], answer: 0 }
    ]
  },
  {
    id: "mixed-lagoon",
    name: "Mixed Treasure Lagoon",
    emoji: "🗺️",
    blurb: "The biggest prize — all your grammar skills!",
    route: ["🏝️", "🌴", "🪸", "🗿", "⛰️", "🏆"],
    clues: [
      { q: "Which word is a noun?", options: ["treasure", "find", "shiny", "under"], answer: 0 },
      { q: "Which word is a verb?", options: ["gold", "dig", "deep", "slowly"], answer: 1 },
      { q: "Which word is an adjective?", options: ["sparkly", "map", "sail", "then"], answer: 0 },
      { q: "Which is a pronoun (it replaces a noun)?", options: ["Sam", "she", "runs", "big"], answer: 1 },
      { q: "Which sentence is correct?", options: ["the crew cheered.", "The crew cheered.", "the Crew cheered", "The crew cheered"], answer: 1 },
      { q: "Which word joins two ideas? 'I dug ___ I found gold.'", options: ["and", "dog", "blue", "run"], answer: 0 }
    ]
  }
];

/* Cheerful lines the game speaks/shows on a correct answer. */
const CHEERS = ["Arrr, correct! ⚓", "Treasure found! 💰", "Well sailed! ⛵", "Aye, that's right! 🦜", "Smooth sailing! 🌊", "Ye did it! ⭐"];
