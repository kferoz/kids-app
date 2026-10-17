/* ============================================================
   Grammar Galaxy — Data
   Kid-friendly English grammar lessons + quizzes by topic.
   Each topic:  id, name, emoji, color, lessons[], quiz[]
   A lesson  = { emoji, teaser, rule, examples: [ "..." ] }
   A quiz Q  = { q, options[], answer (index) }
   ============================================================ */

const TOPICS = [
  {
    id: "nouns",
    name: "Nouns",
    emoji: "📛",
    color: "#ffb84d",
    lessons: [
      { emoji: "📛", teaser: "What is a noun?", rule: "A noun is a naming word. It names a person, place, animal, or thing.", examples: ["Person: teacher, mom, doctor", "Place: park, school, beach", "Animal: dog, cat, lion", "Thing: ball, apple, book"] },
      { emoji: "👧", teaser: "What are proper nouns?", rule: "A proper noun is the special name of one person, place, or thing. It always starts with a CAPITAL letter.", examples: ["Sara went to London.", "We visited Paris in July.", "My dog is named Max."] },
      { emoji: "🏠", teaser: "What are common nouns?", rule: "A common noun is a general name for any person, place, or thing. It does NOT need a capital letter.", examples: ["a girl, a city, a dog", "The boy read a book.", "We sat on a bench."] },
      { emoji: "🧠", teaser: "Can nouns be things you can't touch?", rule: "Some nouns name feelings or ideas you cannot touch. These are still nouns!", examples: ["love, joy, fear", "She showed great courage.", "I had a good idea."] },
      { emoji: "🍎", teaser: "How do you spot a noun in a sentence?", rule: "Ask: 'Is this a person, place, animal, or thing?' If yes, it's a noun. You can often put 'a', 'an', or 'the' in front of it.", examples: ["The cat sat on a mat. (cat, mat)", "A bird sang a song. (bird, song)"] }
    ],
    quiz: [
      { q: "Which word is a noun?", options: ["run", "happy", "dog", "quickly"], answer: 2 },
      { q: "Which one is a PROPER noun?", options: ["city", "London", "river", "boy"], answer: 1 },
      { q: "A noun is a word that names a...", options: ["person, place, or thing", "color only", "action", "number only"], answer: 0 },
      { q: "Pick the noun: 'The bird flew away.'", options: ["flew", "away", "bird", "the"], answer: 2 },
      { q: "Which word should start with a capital letter?", options: ["apple", "sara", "table", "chair"], answer: 1 }
    ]
  },
  {
    id: "pronouns",
    name: "Pronouns",
    emoji: "🙋",
    color: "#ff6f91",
    lessons: [
      { emoji: "🙋", teaser: "What is a pronoun?", rule: "A pronoun is a small word we use instead of a noun, so we don't repeat the same name again and again.", examples: ["Sara is kind. She helps everyone.", "The ball is red. It is round.", "Tom and I play. We have fun."] },
      { emoji: "👉", teaser: "Which words are pronouns?", rule: "Common pronouns are: I, you, he, she, it, we, they.", examples: ["I like ice cream.", "They went home.", "He is my friend."] },
      { emoji: "🎁", teaser: "What are 'my, your, his, her'?", rule: "These pronouns show who something belongs to. They are called possessive pronouns.", examples: ["This is my book.", "That is her bag.", "Their dog is friendly."] },
      { emoji: "🔁", teaser: "Why do we use pronouns?", rule: "Pronouns make sentences shorter and smoother instead of saying the noun over and over.", examples: ["Instead of: 'Ben likes Ben's toy.'", "We say: 'Ben likes his toy.'"] }
    ],
    quiz: [
      { q: "Which word is a pronoun?", options: ["table", "she", "jump", "blue"], answer: 1 },
      { q: "Finish it: 'Mia is nice. ___ shares her toys.'", options: ["He", "It", "She", "They"], answer: 2 },
      { q: "Which pronoun replaces 'Tom and I'?", options: ["They", "We", "You", "He"], answer: 1 },
      { q: "Pick the possessive pronoun: 'This is ___ hat.'", options: ["run", "my", "and", "the"], answer: 1 },
      { q: "Which pronoun fits a group of people? 'The kids play. ___ are happy.'", options: ["It", "She", "They", "He"], answer: 2 }
    ]
  },
  {
    id: "verbs",
    name: "Verbs",
    emoji: "🏃",
    color: "#7ed957",
    lessons: [
      { emoji: "🏃", teaser: "What is a verb?", rule: "A verb is an action or doing word. It tells what someone or something does.", examples: ["run, jump, eat, sing", "The dog barks.", "Birds fly."] },
      { emoji: "🧍", teaser: "Are 'is, am, are' verbs too?", rule: "Yes! Words like is, am, are, was, and were are 'being' verbs. They tell how someone or something IS.", examples: ["I am happy.", "She is tall.", "They are friends."] },
      { emoji: "👆", teaser: "How do you find the verb?", rule: "Ask: 'What is happening?' or 'What is the person doing?' That word is the verb.", examples: ["The cat sleeps. (sleeps)", "We read books. (read)"] },
      { emoji: "🕒", teaser: "Do verbs change with time?", rule: "Verbs can change to show when something happens: yesterday (past), now (present), or later (future).", examples: ["Today I walk.", "Yesterday I walked.", "Tomorrow I will walk."] }
    ],
    quiz: [
      { q: "Which word is a verb?", options: ["happy", "swim", "table", "red"], answer: 1 },
      { q: "Find the verb: 'The baby cries.'", options: ["The", "baby", "cries", "."], answer: 2 },
      { q: "Which is a 'being' verb?", options: ["jump", "is", "dog", "fast"], answer: 1 },
      { q: "A verb is a word that shows...", options: ["a name", "an action", "a color", "a place"], answer: 1 },
      { q: "Pick the verb: 'Birds sing in the morning.'", options: ["Birds", "sing", "morning", "in"], answer: 1 }
    ]
  },
  {
    id: "adjectives",
    name: "Adjectives",
    emoji: "🌈",
    color: "#8a7dff",
    lessons: [
      { emoji: "🌈", teaser: "What is an adjective?", rule: "An adjective is a describing word. It tells us more about a noun — like its color, size, or how it feels.", examples: ["a red ball", "a tall tree", "a happy child"] },
      { emoji: "📏", teaser: "What can adjectives describe?", rule: "Adjectives can tell size, color, shape, number, or feeling.", examples: ["Size: big, tiny", "Color: blue, green", "Feeling: kind, scary", "Number: two apples"] },
      { emoji: "🔎", teaser: "Where do adjectives go?", rule: "An adjective usually comes just before the noun it describes.", examples: ["a SOFT pillow", "the FUNNY clown", "three LITTLE pigs"] },
      { emoji: "✨", teaser: "Why use adjectives?", rule: "Adjectives make your writing more colorful and help the reader imagine things clearly.", examples: ["Plain: a dog", "Better: a fluffy, brown dog"] }
    ],
    quiz: [
      { q: "Which word is an adjective?", options: ["run", "yellow", "jump", "quickly"], answer: 1 },
      { q: "Find the adjective: 'The tall giraffe ate leaves.'", options: ["giraffe", "tall", "ate", "leaves"], answer: 1 },
      { q: "An adjective describes a...", options: ["verb", "noun", "number only", "period"], answer: 1 },
      { q: "Pick the describing word: 'a shiny star'", options: ["a", "shiny", "star", "none"], answer: 1 },
      { q: "Which sentence uses an adjective?", options: ["He ran.", "The cute puppy slept.", "They sat.", "It fell."], answer: 1 }
    ]
  },
  {
    id: "adverbs",
    name: "Adverbs",
    emoji: "⚡",
    color: "#33c9dc",
    lessons: [
      { emoji: "⚡", teaser: "What is an adverb?", rule: "An adverb tells us more about a verb. It often tells HOW something is done.", examples: ["She sang beautifully.", "He ran quickly.", "The turtle moved slowly."] },
      { emoji: "🔤", teaser: "How can you spot many adverbs?", rule: "Lots of adverbs end in '-ly'. But not all — some tell when or where.", examples: ["loudly, softly, happily", "When: now, later, today", "Where: here, there, outside"] },
      { emoji: "❓", teaser: "What questions do adverbs answer?", rule: "Adverbs answer: How? When? or Where? something happens.", examples: ["How? She smiled sweetly.", "When? We leave soon.", "Where? Come inside."] }
    ],
    quiz: [
      { q: "Which word is an adverb?", options: ["quickly", "cat", "blue", "table"], answer: 0 },
      { q: "Find the adverb: 'The boy shouted loudly.'", options: ["boy", "shouted", "loudly", "The"], answer: 2 },
      { q: "Many adverbs end in...", options: ["-ing", "-ly", "-ed", "-s"], answer: 1 },
      { q: "Adverbs often tell us HOW an action is...", options: ["colored", "done", "named", "counted"], answer: 1 },
      { q: "Pick the adverb: 'She walked slowly to school.'", options: ["walked", "slowly", "school", "She"], answer: 1 }
    ]
  },
  {
    id: "articles",
    name: "Articles (a, an, the)",
    emoji: "🔤",
    color: "#ff8c42",
    lessons: [
      { emoji: "🔤", teaser: "What are articles?", rule: "The little words 'a', 'an', and 'the' are called articles. They come before nouns.", examples: ["a cat", "an apple", "the sun"] },
      { emoji: "🅰️", teaser: "When do we use 'a' or 'an'?", rule: "Use 'a' before a consonant sound. Use 'an' before a vowel sound (a, e, i, o, u).", examples: ["a dog, a book, a car", "an egg, an umbrella, an orange"] },
      { emoji: "⭐", teaser: "When do we use 'the'?", rule: "Use 'the' when we talk about one special or already-known thing.", examples: ["the moon", "Close the door.", "the boy in red"] }
    ],
    quiz: [
      { q: "Which article goes before 'apple'?", options: ["a", "an", "the only", "no article"], answer: 1 },
      { q: "Choose the correct one: '___ dog barked.'", options: ["an", "a", "aa", "the an"], answer: 1 },
      { q: "'a', 'an', and 'the' are called...", options: ["verbs", "articles", "nouns", "adverbs"], answer: 1 },
      { q: "Which is correct?", options: ["a egg", "an egg", "an dog", "a apple"], answer: 1 },
      { q: "Fill in: 'I saw ___ moon last night.'", options: ["a", "an", "the", "no article"], answer: 2 }
    ]
  },
  {
    id: "prepositions",
    name: "Prepositions",
    emoji: "🧭",
    color: "#52b788",
    lessons: [
      { emoji: "🧭", teaser: "What is a preposition?", rule: "A preposition is a position word. It tells where something is or when it happens.", examples: ["on, in, under, over", "The cat is UNDER the table.", "We play IN the park."] },
      { emoji: "📦", teaser: "Which words show WHERE?", rule: "Words like in, on, under, beside, behind, and between tell us where something is.", examples: ["The ball is behind the box.", "She sat beside me.", "It is between the trees."] },
      { emoji: "⏰", teaser: "Can prepositions show WHEN?", rule: "Some prepositions tell time: before, after, during, at.", examples: ["We eat before school.", "Rest after lunch.", "Meet me at noon."] }
    ],
    quiz: [
      { q: "Which word is a preposition?", options: ["under", "run", "happy", "dog"], answer: 0 },
      { q: "Find the preposition: 'The cat sat on the mat.'", options: ["cat", "sat", "on", "mat"], answer: 2 },
      { q: "Prepositions often tell us...", options: ["a color", "where or when", "an action", "a name"], answer: 1 },
      { q: "Fill in: 'The bird is ___ the tree.'", options: ["in", "run", "happy", "and"], answer: 0 },
      { q: "Which sentence has a preposition?", options: ["She laughed.", "The toy is under the bed.", "They ate.", "He slept."], answer: 1 }
    ]
  },
  {
    id: "conjunctions",
    name: "Conjunctions",
    emoji: "🔗",
    color: "#c58b4d",
    lessons: [
      { emoji: "🔗", teaser: "What is a conjunction?", rule: "A conjunction is a joining word. It links words or parts of a sentence together.", examples: ["and, but, or, because, so", "I like tea and toast.", "It is small but strong."] },
      { emoji: "➕", teaser: "What does 'and' do?", rule: "'And' joins two things that go together.", examples: ["cats and dogs", "We sang and danced."] },
      { emoji: "🤔", teaser: "What do 'but' and 'because' do?", rule: "'But' shows a difference. 'Because' gives a reason.", examples: ["I ran, but I was slow.", "I smiled because I was happy."] }
    ],
    quiz: [
      { q: "Which word is a conjunction?", options: ["and", "cat", "blue", "run"], answer: 0 },
      { q: "Fill in: 'I was tired, ___ I kept going.'", options: ["but", "cat", "happy", "the"], answer: 0 },
      { q: "A conjunction is a word that...", options: ["names things", "joins words or ideas", "describes a noun", "shows action"], answer: 1 },
      { q: "Which word gives a reason?", options: ["and", "because", "or", "but"], answer: 1 },
      { q: "Fill in: 'Do you want milk ___ juice?'", options: ["or", "run", "happy", "under"], answer: 0 }
    ]
  },
  {
    id: "plurals",
    name: "Singular & Plural",
    emoji: "➕",
    color: "#ffb84d",
    lessons: [
      { emoji: "1️⃣", teaser: "What does 'singular' mean?", rule: "Singular means just ONE of something.", examples: ["one cat", "a book", "an apple"] },
      { emoji: "➕", teaser: "What does 'plural' mean?", rule: "Plural means MORE than one. We usually add '-s' to make a word plural.", examples: ["cat → cats", "book → books", "dog → dogs"] },
      { emoji: "🔡", teaser: "When do we add '-es'?", rule: "Add '-es' to words that end in s, x, ch, sh, or z.", examples: ["bus → buses", "box → boxes", "brush → brushes"] },
      { emoji: "✨", teaser: "Are some plurals special?", rule: "A few words change completely. These are irregular plurals — you learn them by heart!", examples: ["child → children", "mouse → mice", "foot → feet", "man → men"] }
    ],
    quiz: [
      { q: "What is the plural of 'dog'?", options: ["dog", "dogs", "doges", "dogies"], answer: 1 },
      { q: "Which word is singular?", options: ["cats", "books", "apple", "cars"], answer: 2 },
      { q: "What is the plural of 'box'?", options: ["boxs", "boxes", "box", "boxies"], answer: 1 },
      { q: "What is the plural of 'child'?", options: ["childs", "childes", "children", "childrens"], answer: 2 },
      { q: "'Plural' means...", options: ["only one", "more than one", "none", "a color"], answer: 1 }
    ]
  },
  {
    id: "tenses",
    name: "Verb Tenses",
    emoji: "⏰",
    color: "#8a7dff",
    lessons: [
      { emoji: "⏰", teaser: "What is a tense?", rule: "A tense tells WHEN a verb happens: in the past, present, or future.", examples: ["Past: yesterday", "Present: now", "Future: tomorrow"] },
      { emoji: "▶️", teaser: "What is the present tense?", rule: "The present tense is happening now.", examples: ["I play.", "She runs.", "We eat lunch."] },
      { emoji: "⏪", teaser: "What is the past tense?", rule: "The past tense already happened. Many verbs add '-ed'.", examples: ["I played.", "She walked.", "We jumped."] },
      { emoji: "⏩", teaser: "What is the future tense?", rule: "The future tense has not happened yet. We often use 'will'.", examples: ["I will play.", "She will run.", "We will eat."] }
    ],
    quiz: [
      { q: "Which sentence is in the PAST tense?", options: ["I play now.", "I played yesterday.", "I will play.", "I am playing."], answer: 1 },
      { q: "Which word shows the FUTURE?", options: ["walked", "will", "was", "did"], answer: 1 },
      { q: "Past tense verbs often end in...", options: ["-ing", "-ed", "-ly", "-s"], answer: 1 },
      { q: "'She runs.' is in which tense?", options: ["past", "present", "future", "none"], answer: 1 },
      { q: "Change to past: 'I jump.'", options: ["I jumping", "I jumped", "I will jump", "I jumps"], answer: 1 }
    ]
  },
  {
    id: "punctuation",
    name: "Punctuation",
    emoji: "✏️",
    color: "#ff6f91",
    lessons: [
      { emoji: "🔠", teaser: "When do we use capital letters?", rule: "Start every sentence with a CAPITAL letter. Names of people, places, and days also start with capitals.", examples: ["The sun is hot.", "My name is Ali.", "We go on Monday."] },
      { emoji: "⏹️", teaser: "What is a full stop (period)?", rule: "A full stop (.) shows the end of a sentence that tells something.", examples: ["I like cake.", "The dog is big.", "It is raining."] },
      { emoji: "❓", teaser: "When do we use a question mark?", rule: "A question mark (?) goes at the end of a sentence that asks something.", examples: ["What is your name?", "Are you okay?", "Can we play?"] },
      { emoji: "❗", teaser: "What is an exclamation mark?", rule: "An exclamation mark (!) shows strong feeling or excitement.", examples: ["Watch out!", "That is amazing!", "I won!"] },
      { emoji: "⏸️", teaser: "What does a comma do?", rule: "A comma (,) shows a short pause, and separates things in a list.", examples: ["I bought apples, pears, and figs.", "Yes, I can come."] }
    ],
    quiz: [
      { q: "What goes at the end of a question?", options: [".", "?", "!", ","], answer: 1 },
      { q: "Which sentence is written correctly?", options: ["the cat is black.", "The cat is black.", "the Cat is black", "THE cat is black"], answer: 1 },
      { q: "What ends a telling sentence?", options: ["?", "full stop (.)", "!", "no mark"], answer: 1 },
      { q: "Which mark shows excitement?", options: [".", ",", "!", "?"], answer: 2 },
      { q: "Names of people start with a...", options: ["small letter", "capital letter", "number", "comma"], answer: 1 }
    ]
  },
  {
    id: "synonyms",
    name: "Synonyms",
    emoji: "🤝",
    color: "#2fb4c9",
    lessons: [
      { emoji: "🤝", teaser: "What is a synonym?", rule: "Synonyms are words that mean the SAME thing, or almost the same.", examples: ["big = large", "happy = glad", "little = small"] },
      { emoji: "😀", teaser: "Words for happy", rule: "Many words can mean happy. Using different words makes writing more fun.", examples: ["happy, glad, joyful", "She felt cheerful and merry."] },
      { emoji: "🏃", teaser: "Words for fast", rule: "Some words mean fast or quick. They are synonyms.", examples: ["fast, quick, speedy", "The speedy rabbit ran."] },
      { emoji: "😢", teaser: "Words for sad", rule: "Sad, unhappy, and upset are synonyms — they share a meaning.", examples: ["sad, unhappy, upset", "He felt gloomy in the rain."] },
      { emoji: "✍️", teaser: "How do synonyms help?", rule: "Swap a word for a synonym to make sentences more interesting.", examples: ["'nice' → 'kind', 'pleasant'", "'said' → 'shouted', 'whispered'"] }
    ],
    quiz: [
      { q: "Which word is a synonym for 'big'?", options: ["tiny", "large", "cold", "fast"], answer: 1 },
      { q: "Choose a synonym for 'happy'.", options: ["glad", "angry", "slow", "wet"], answer: 0 },
      { q: "Which word means the same as 'fast'?", options: ["quiet", "quick", "small", "soft"], answer: 1 },
      { q: "A synonym for 'little' is...", options: ["huge", "small", "loud", "warm"], answer: 1 },
      { q: "Which pair are synonyms?", options: ["hot / cold", "up / down", "start / begin", "day / night"], answer: 2 }
    ]
  },
  {
    id: "antonyms",
    name: "Antonyms",
    emoji: "↔️",
    color: "#8a7dff",
    lessons: [
      { emoji: "↔️", teaser: "What is an antonym?", rule: "Antonyms are words that mean the OPPOSITE of each other.", examples: ["hot ↔ cold", "up ↔ down", "big ↔ small"] },
      { emoji: "☀️", teaser: "Day and night", rule: "Some antonyms are pairs we see every day.", examples: ["day ↔ night", "light ↔ dark", "open ↔ shut"] },
      { emoji: "😀", teaser: "Feelings can be opposite", rule: "Feeling words often have an opposite.", examples: ["happy ↔ sad", "brave ↔ scared", "kind ↔ mean"] },
      { emoji: "🐢", teaser: "Fast and slow", rule: "Words that describe how we move can be opposites.", examples: ["fast ↔ slow", "high ↔ low", "push ↔ pull"] },
      { emoji: "🔎", teaser: "How to spot an antonym", rule: "Ask: 'What is the opposite?' That word is the antonym.", examples: ["The opposite of 'wet' is 'dry'.", "The opposite of 'full' is 'empty'."] }
    ],
    quiz: [
      { q: "Which word is the opposite of 'hot'?", options: ["warm", "cold", "big", "fast"], answer: 1 },
      { q: "What is an antonym for 'happy'?", options: ["glad", "sad", "joyful", "kind"], answer: 1 },
      { q: "The opposite of 'up' is...", options: ["down", "over", "high", "top"], answer: 0 },
      { q: "Which word means the opposite of 'big'?", options: ["huge", "large", "small", "tall"], answer: 2 },
      { q: "Which pair are antonyms?", options: ["begin / start", "fast / quick", "open / shut", "happy / glad"], answer: 2 }
    ]
  }
];

/* ------------------------------------------------------------
   Word Detective — the reward mini-game.
   Show a sentence; the child taps the word of the asked type.
   Each round = { words[], type, label, answer (index) }
   ------------------------------------------------------------ */
const WORD_GAME = [
  { words: ["The", "happy", "dog", "barked"], type: "adjective", label: "describing word", answer: 1 },
  { words: ["Birds", "fly", "in", "the", "sky"], type: "verb", label: "action word", answer: 1 },
  { words: ["My", "sister", "reads", "books"], type: "noun", label: "naming word", answer: 1 },
  { words: ["The", "cat", "sat", "under", "the", "table"], type: "preposition", label: "position word", answer: 3 },
  { words: ["She", "sang", "the", "song", "loudly"], type: "adverb", label: "how word (often -ly)", answer: 4 },
  { words: ["Tom", "and", "Ben", "played"], type: "conjunction", label: "joining word", answer: 1 },
  { words: ["The", "tiny", "mouse", "ran", "away"], type: "adjective", label: "describing word", answer: 1 },
  { words: ["We", "jumped", "over", "the", "puddle"], type: "verb", label: "action word", answer: 1 },
  { words: ["A", "red", "apple", "fell", "down"], type: "noun", label: "naming word", answer: 2 },
  { words: ["The", "ball", "rolled", "slowly", "away"], type: "adverb", label: "how word (often -ly)", answer: 3 },
  { words: ["I", "like", "tea", "but", "not", "coffee"], type: "conjunction", label: "joining word", answer: 3 },
  { words: ["The", "book", "is", "on", "the", "shelf"], type: "preposition", label: "position word", answer: 3 }
];

/* ------------------------------------------------------------
   Superhero Story Rescue — reading & comprehension practice.
   The "Rescue Squad" is a team of kind heroes:
     ⚡ Bolt (super speed) · 🌊 Marina (water) · 🔥 Ember (light & warmth)
     🌪️ Gale (wind) · 💪 Titan (strength) · 🐾 Scout (talks to animals)
   Each story: id, title, emoji, heroes, pages[{emoji,text}], questions[{q,options,answer}]
   ------------------------------------------------------------ */
const STORIES = [
  {
    id: "kitten-tree",
    title: "The Kitten in the Tall Tree",
    emoji: "🐱",
    heroes: "Bolt & Gale",
    pages: [
      { emoji: "🐱🌳", text: "High in the tall oak tree, a tiny kitten cried, 'Meow! Meow!' She was too scared to climb down. A little girl named Mia looked up. 'Help! My kitten Muffin is stuck!'" },
      { emoji: "⚡", text: "Bolt zoomed to the park in the blink of an eye. He looked up at Muffin. 'Do not worry, we will help you,' he said kindly. But the branch was very high, even for Bolt." },
      { emoji: "🌪️🐱", text: "Then Gale arrived. She spun a soft, gentle wind. The breeze lifted Muffin off the branch and floated her down, down, down — right into Mia's arms! 'Thank you!' cried Mia. Helping others felt wonderful." }
    ],
    questions: [
      { q: "Who was stuck in the tree?", options: ["Mia", "Muffin the kitten", "Bolt", "A bird"], answer: 1 },
      { q: "How did Gale help Muffin get down?", options: ["She climbed the tree", "She made a gentle wind", "She shook the tree", "She called for a ladder"], answer: 1 },
      { q: "How did the team feel after helping?", options: ["Angry", "Wonderful", "Sleepy", "Scared"], answer: 1 }
    ]
  },
  {
    id: "runaway-balloon",
    title: "The Runaway Balloon",
    emoji: "🎈",
    heroes: "Gale & Bolt",
    pages: [
      { emoji: "🎈", text: "At the fair, a boy named Sam held a big red balloon. Whoosh! A gust of wind pulled it from his hand. The balloon flew up into the sky. Sam's eyes filled with tears." },
      { emoji: "🌪️", text: "Gale saw the balloon float away. 'I can catch it!' she said. She flew up high, but the balloon drifted higher and higher, over the tall trees." },
      { emoji: "⚡🎈", text: "Bolt had an idea. He ran up a hill so fast that he was above the balloon! Gale blew a soft wind, and together they guided the balloon back to Sam. 'You saved it! Teamwork is the best!'" }
    ],
    questions: [
      { q: "What did Sam lose?", options: ["His hat", "His red balloon", "His shoe", "His dog"], answer: 1 },
      { q: "Why did the balloon fly away?", options: ["A bird took it", "A gust of wind pulled it", "Sam threw it", "It popped"], answer: 1 },
      { q: "What lesson did Sam learn?", options: ["Teamwork is the best", "Balloons are scary", "Never go to the fair", "Running is bad"], answer: 0 }
    ]
  },
  {
    id: "lost-puppy",
    title: "The Lost Puppy",
    emoji: "🐶",
    heroes: "Scout & Marina",
    pages: [
      { emoji: "🐶", text: "A little puppy was lost near the river. He was cold, wet, and could not find his way home. He whimpered softly and shivered." },
      { emoji: "🐾", text: "Scout could talk to animals. She listened closely. 'This puppy is named Pip,' she said. 'He lives on Maple Street, but he is too tired to walk.'" },
      { emoji: "🌊🐶", text: "Marina made a stream of warm water to help Pip feel cozy. Then the team carried Pip home. His family cheered, 'Pip! We missed you!' Pip wagged his tail with joy." }
    ],
    questions: [
      { q: "Where was the puppy lost?", options: ["Near the river", "At school", "In a cave", "On a mountain"], answer: 0 },
      { q: "What special thing could Scout do?", options: ["Fly", "Talk to animals", "Run fast", "Make ice"], answer: 1 },
      { q: "What is the puppy's name?", options: ["Muffin", "Pip", "Sam", "Bolt"], answer: 1 }
    ]
  },
  {
    id: "flood-maple",
    title: "Flood on Maple Street",
    emoji: "🌊",
    heroes: "The whole team",
    pages: [
      { emoji: "🌧️🌊", text: "It rained and rained. The river rose high and water flooded Maple Street. People stood on their porches. 'We need help!' they called." },
      { emoji: "💪🌪️", text: "Titan lifted a fallen tree that blocked the road. Gale blew the storm clouds away so the rain would stop. The team worked quickly and calmly." },
      { emoji: "🌊🦸", text: "Marina pushed the flood water back into the river. Bolt zoomed everyone to dry, safe ground. Soon the sun came out. 'When we work together,' said Titan, 'we can do anything.'" }
    ],
    questions: [
      { q: "What made Maple Street flood?", options: ["A lot of rain", "A broken pipe", "The heroes", "Snow"], answer: 0 },
      { q: "Who lifted the fallen tree?", options: ["Bolt", "Titan", "Marina", "Scout"], answer: 1 },
      { q: "The word 'calmly' means the team worked in a...", options: ["scared way", "quiet, steady way", "very slow way", "silly way"], answer: 1 }
    ]
  },
  {
    id: "ferris-wheel",
    title: "The Stuck Ferris Wheel",
    emoji: "🎡",
    heroes: "Bolt & Titan",
    pages: [
      { emoji: "🎡", text: "At the fair, the big Ferris wheel stopped with a CLUNK. Two children were stuck at the very top! 'Do not be afraid,' the ride helper called. 'Help is coming.'" },
      { emoji: "💪", text: "Titan held the wheel steady so it would not wobble. 'You are safe,' he said in a strong, kind voice. The children felt braver." },
      { emoji: "⚡🎡", text: "Bolt fixed the broken gear faster than you can blink. Slowly, the wheel turned again and brought the children safely to the ground. 'We were brave because you helped us!'" }
    ],
    questions: [
      { q: "What got stuck at the fair?", options: ["A car", "The Ferris wheel", "A boat", "A train"], answer: 1 },
      { q: "How did Titan help?", options: ["He fixed the gear", "He held the wheel steady", "He flew up", "He made wind"], answer: 1 },
      { q: "Why did the children feel braver?", options: ["The heroes helped them", "They were hungry", "It was sunny", "They went home"], answer: 0 }
    ]
  },
  {
    id: "bakery-smoke",
    title: "Smoke at the Bakery",
    emoji: "🍞",
    heroes: "Marina & Scout",
    pages: [
      { emoji: "🍞💨", text: "Smoke puffed from the corner bakery! A little cat named Biscuit was inside, hiding under a table. The baker was worried. 'Please help Biscuit!'" },
      { emoji: "🌊", text: "Marina sprayed cool water and the smoke began to clear. 'Stay low, where the air is fresh,' she reminded everyone. That is a smart safety rule." },
      { emoji: "🐾🐱", text: "Scout crawled in low and gently carried Biscuit outside to fresh air. Biscuit was safe! 'Remember,' said Marina, 'if there is smoke, stay low and get out fast.'" }
    ],
    questions: [
      { q: "Who was hiding in the bakery?", options: ["A dog", "Biscuit the cat", "The baker", "A mouse"], answer: 1 },
      { q: "What safety rule did Marina teach?", options: ["Run upstairs", "Stay low and get out", "Hide under a bed", "Open every door"], answer: 1 },
      { q: "How did Scout carry Biscuit out?", options: ["Gently and low", "Very fast", "By flying", "In a box"], answer: 0 }
    ]
  },
  {
    id: "cave-rescue",
    title: "The Cave Rescue",
    emoji: "🕳️",
    heroes: "Ember & Scout",
    pages: [
      { emoji: "🕳️🥾", text: "Two hikers took a wrong turn and got lost in a dark cave. It was cold and they could not see. 'Hello? Is anyone there?' they called." },
      { emoji: "🔥", text: "Ember made a warm, glowing light in her hands. It lit up the cave like a friendly lantern. 'Follow the light,' she said gently." },
      { emoji: "🐾🦇", text: "Scout asked the cave bats to show the way out. Squeak! The bats led the team to the exit. The hikers stepped into the sunshine. 'Next time we will bring a flashlight!'" }
    ],
    questions: [
      { q: "Where did the hikers get lost?", options: ["In a cave", "In a forest", "At the fair", "On a boat"], answer: 0 },
      { q: "How did Ember help them see?", options: ["She made a glowing light", "She shouted", "She dug a hole", "She made rain"], answer: 0 },
      { q: "Which animals showed the way out?", options: ["Cats", "Bats", "Dogs", "Birds"], answer: 1 }
    ]
  },
  {
    id: "whale-shallow",
    title: "The Whale in Shallow Water",
    emoji: "🐋",
    heroes: "Marina & Titan",
    pages: [
      { emoji: "🐋", text: "A young whale swam too close to shore and got stuck in shallow water. She could not reach the deep sea. She sang a sad, low song." },
      { emoji: "💪", text: "Titan gently dug a deeper channel in the sand so water could flow around the whale. He was careful and slow, so the whale would not be scared." },
      { emoji: "🌊🐋", text: "Marina raised the tide with her water powers. The whale floated free and swam back to the deep blue sea. 'Be gentle with animals,' said Marina, 'and they will trust you.'" }
    ],
    questions: [
      { q: "What happened to the whale?", options: ["She got stuck in shallow water", "She flew away", "She got lost in a cave", "She was hungry"], answer: 0 },
      { q: "How did Marina help the whale swim free?", options: ["She raised the tide", "She pushed her", "She called a boat", "She sang"], answer: 0 },
      { q: "Why was Titan careful and slow?", options: ["So the whale would not be scared", "He was tired", "It was night", "He was hungry"], answer: 0 }
    ]
  },
  {
    id: "city-blackout",
    title: "Blackout in the City",
    emoji: "🌃",
    heroes: "Ember & Bolt",
    pages: [
      { emoji: "🌃", text: "One night, all the lights in the city went out. It was very dark. People could not find their way, and some children were afraid of the dark." },
      { emoji: "🔥", text: "Ember floated up high and made a warm, glowing light, like a little sun. The streets lit up. The children were not afraid anymore." },
      { emoji: "⚡💡", text: "Bolt raced to the power station and fixed the broken wires. ZAP! The city lights blinked back on. 'Even in the dark,' said Ember, 'we can help each other shine.'" }
    ],
    questions: [
      { q: "What went wrong in the city?", options: ["All the lights went out", "It flooded", "A fire started", "It snowed"], answer: 0 },
      { q: "Who fixed the broken wires?", options: ["Ember", "Bolt", "Marina", "Titan"], answer: 1 },
      { q: "What did Ember mean by 'help each other shine'?", options: ["We can help each other", "We should sleep", "We can run fast", "Lights are bad"], answer: 0 }
    ]
  },
  {
    id: "mountain-blizzard",
    title: "The Mountain Blizzard",
    emoji: "⛰️",
    heroes: "The whole team",
    pages: [
      { emoji: "⛰️❄️", text: "High on the snowy mountain, a family was caught in a blizzard. The cold wind blew hard and they could not find the path down." },
      { emoji: "🌪️🔥", text: "Gale calmed the swirling snow so everyone could see. Ember made a warm glow to keep the family cozy and safe from the cold." },
      { emoji: "💪⚡", text: "Titan cleared the deep snow from the path, and Bolt guided the family down to the warm cabin. 'Thank you, Rescue Squad!' Another safe rescue, together." }
    ],
    questions: [
      { q: "Where was the family caught?", options: ["On a snowy mountain", "In a cave", "At the beach", "In the city"], answer: 0 },
      { q: "How did Ember keep the family cozy?", options: ["She made a warm glow", "She gave them coats", "She dug a hole", "She made wind"], answer: 0 },
      { q: "What is the team's name?", options: ["The Rescue Squad", "The Grammar Gang", "The Star Team", "The Wind Club"], answer: 0 }
    ]
  }
];
