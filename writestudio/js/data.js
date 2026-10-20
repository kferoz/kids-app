/* ============================================================
   Sentence Studio — data
   ------------------------------------------------------------
   A writing course for a 3rd grader: from "what is a sentence?" up to
   writing a whole paragraph and a story in their own words.
   3 levels; a level opens when every lesson in the level before is done.

   Lesson = {
     id, title, skill, emoji,
     learn: { points: [..], good, bad?, joke },   // 💡 Learn It
     practice: [round, ...],                      // 🎮 Practice (6 rounds)
     write: [prompt, ...],                        // ✏️ Write It (checked by WriteCheck)
     sticker: { emoji, name }
   }
   Practice rounds:
     { t:"yesno", s, yes, why }                    is it a complete sentence?
     { t:"punct", s, a, why }                      pick . ? or !
     { t:"pick",  q, choices, answer, why }        choices shuffle at run time
     { t:"build", words:[..], end }                tap the tiles in order
     { t:"join",  a, b, glue, choices, why }       join two sentences
     { t:"order", q, items:[..], why }             tap the sentences in order
   Write prompt = { p, emoji, show?, note?, starter?, ideas?, model?, need, spin? }
     or a planner: { plan:true, p, emoji, spark?, parts:[{ label, hint, starter?, model?, need }], need }
   `need` is documented in js/writecheck.js.
   ============================================================ */

const LEVELS = [
  { id: "w1", n: 1, title: "Sentence Sprouts", sub: "What a sentence needs", emoji: "🌱", color: "#8ce99a", accent: "#2f9e44" },
  { id: "w2", n: 2, title: "Super Sentences", sub: "Details, describing words & glue words", emoji: "🌿", color: "#74c0fc", accent: "#1971c2" },
  { id: "w3", n: 3, title: "Paragraph Power", sub: "Hamburger paragraphs, how-to & stories", emoji: "🌳", color: "#ffc078", accent: "#e8590c" }
];

const LESSONS = [
  /* ---------------- Level 1: Sentence Sprouts ---------------- */
  {
    id: "s1", level: "w1", title: "What's a Sentence?", skill: "Complete sentences", emoji: "🧩",
    learn: {
      points: [
        "A sentence is a complete thought. It tells WHO (or what) and WHAT HAPPENS.",
        "It starts with a capital letter.",
        "It ends with a stop sign: a period (.), a question mark (?) or an exclamation mark (!)."
      ],
      good: "The puppy chewed my sock.", bad: "The puppy.",
      joke: "“The puppy.” Then what? Did it dance? Did it fly? We need to know what happens!"
    },
    practice: [
      { t: "yesno", s: "The puppy chewed my sock.", yes: true, why: "It has a WHO (the puppy) and WHAT HAPPENED (chewed my sock)." },
      { t: "yesno", s: "Under the big bed.", yes: false, why: "Who is under the bed? What happened? It's not a complete thought." },
      { t: "yesno", s: "My sister laughed.", yes: true, why: "Short but complete: who (my sister) and what happened (laughed)." },
      { t: "yesno", s: "Jumping on the trampoline.", yes: false, why: "Who is jumping? The WHO part is missing." },
      { t: "pick", q: "Which one is written correctly?", choices: ["The frog jumped into the pond.", "the frog jumped into the pond.", "The frog jumped into the pond"], answer: 0, why: "It starts with a capital T and ends with a period." },
      { t: "build", words: ["My", "cat", "sleeps", "in", "a", "box"], end: "." }
    ],
    write: [
      { emoji: "🐶", p: "Write a sentence about your favorite animal.", ideas: ["My", "favorite", "animal", "is", "fluffy", "fast", "likes", "to"], model: "My dog Max loves to chase his tail.", need: { min: 4 } },
      { emoji: "🍎", p: "Write a sentence about something you ate today.", ideas: ["I", "ate", "for", "breakfast", "lunch", "crunchy", "yummy"], model: "I ate a crunchy apple for lunch.", need: { min: 5 } }
    ],
    sticker: { emoji: "🧩", name: "Sentence Builder" }
  },
  {
    id: "s2", level: "w1", title: "Telling, Asking & WOW!", skill: "End marks . ? !", emoji: "❗",
    learn: {
      points: [
        "A telling sentence ends with a period (.). The sky is blue.",
        "An asking sentence ends with a question mark (?). It often starts with who, what, where, when, why, how, can or do.",
        "A WOW sentence shows a big feeling and ends with an exclamation mark (!). We won!"
      ],
      good: "Can I have a pet llama?",
      joke: "A period is a stop sign. A question mark is a curious hook. An exclamation mark is a sentence shouting HOORAY!"
    },
    practice: [
      { t: "punct", s: "Can we go to the zoo", a: "?", why: "It asks something, so it needs a question mark." },
      { t: "punct", s: "The sky is blue", a: ".", why: "It just tells a fact, so it gets a period." },
      { t: "punct", s: "Watch out for the shark", a: "!", why: "That's a big, scary feeling! It needs an exclamation mark." },
      { t: "punct", s: "Where did my other shoe go", a: "?", why: "It starts with Where and asks a question." },
      { t: "build", words: ["Do", "you", "like", "pizza"], end: "?" },
      { t: "pick", q: "Which one is a WOW sentence?", choices: ["We won the big game!", "We ate lunch.", "Did we win?"], answer: 0, why: "It shows a big, happy feeling and ends with !" }
    ],
    write: [
      { emoji: "👽", p: "An alien lands in your backyard! Write a QUESTION you would ask it.", ideas: ["Where", "What", "Why", "Can", "Do", "you", "your", "planet"], model: "Where is your home planet?", need: { min: 4, end: "?" } },
      { emoji: "🎉", p: "Write a WOW sentence about something exciting.", ideas: ["I", "found", "won", "huge", "best", "ever"], model: "I found a dinosaur bone in my yard!", need: { min: 4, end: "!" } },
      { emoji: "🛏️", p: "Write a TELLING sentence about your bedroom.", ideas: ["My", "bedroom", "has", "a", "cozy", "big", "window"], model: "My bedroom has a blue rug and a big window.", need: { min: 5, end: "." } }
    ],
    sticker: { emoji: "❗", name: "Mark Master" }
  },
  {
    id: "s3", level: "w1", title: "Who + Did What", skill: "The two parts of a sentence", emoji: "🎰",
    learn: {
      points: [
        "Every sentence has two parts.",
        "The WHO part names someone or something: The silly monkey…",
        "The DID WHAT part tells what they do: …ate a banana."
      ],
      good: "The silly monkey | ate a banana.",
      joke: "Without a WHO, a sentence is a mystery. Without a DID WHAT, it's a statue just standing there!"
    },
    practice: [
      { t: "pick", q: "Which WHO part fits?  ______ ran across the field.", choices: ["The speedy cheetah", "Very fast", "In the morning"], answer: 0, why: "The speedy cheetah is WHO ran across the field." },
      { t: "pick", q: "Which DID WHAT part fits?  My grandma ______", choices: ["baked cookies.", "in the kitchen.", "and my grandpa."], answer: 0, why: "Baked cookies tells what Grandma did." },
      { t: "yesno", s: "The robot danced.", yes: true, why: "WHO: the robot. DID WHAT: danced." },
      { t: "yesno", s: "Ate all the cake.", yes: false, why: "Who ate the cake? The WHO part is missing!" },
      { t: "build", words: ["The", "goofy", "goat", "ate", "my", "homework"], end: "." },
      { t: "pick", q: "Which is the WHO part?  The tiny ant carried a crumb.", choices: ["The tiny ant", "carried a crumb", "a crumb"], answer: 0, why: "The tiny ant is who did the carrying." }
    ],
    write: [
      { emoji: "🎰", p: "Spin the Silly Sentence Machine! Then write your WHO and DID WHAT as a sentence.",
        spin: { who: ["A dancing pickle", "My grumpy teacher", "A tiny dragon", "The giant hamster", "A robot chef", "My baby brother", "A sneaky penguin", "The king"],
                did: ["sang a song", "ate a cloud", "rode a skateboard", "sneezed glitter", "built a sandcastle", "told a joke", "juggled eggs", "slipped on spaghetti"],
                where: ["on the moon", "in the bathtub", "at the zoo", "under my bed", "on a pirate ship", "in the library", "at the beach", "in a volcano"] },
        model: "A tiny dragon juggled eggs in the library, and the librarian said shhh!", need: { min: 5 } },
      { emoji: "🦸", p: "Now your own idea! Write a sentence about a superhero. Give it a WHO part and a DID WHAT part.", ideas: ["Captain", "saved", "zoomed", "the city", "flew"], model: "Captain Pancake saved the city from a syrup flood.", need: { min: 5 } }
    ],
    sticker: { emoji: "🎰", name: "Silly Sentence Spinner" }
  },

  /* ---------------- Level 2: Super Sentences ---------------- */
  {
    id: "s4", level: "w2", title: "Stretch It!", skill: "Adding when, where & how", emoji: "🧵",
    learn: {
      points: [
        "Short sentences are fine, but details make them exciting.",
        "Stretch a sentence by adding WHEN (after school), WHERE (in the mud) or HOW (very quickly).",
        "The dog ran. → The muddy dog ran across the kitchen after his bath!"
      ],
      good: "The muddy dog ran across the kitchen after his bath!", bad: "The dog ran.",
      joke: "A short sentence is plain toast. Details are the butter and the jam!"
    },
    practice: [
      { t: "pick", q: "Which sentence tells WHERE?", choices: ["The cat slept on the warm windowsill.", "The cat slept.", "The cat slept all day."], answer: 0, why: "On the warm windowsill tells where the cat slept." },
      { t: "pick", q: "Which sentence tells WHEN?", choices: ["We went swimming after school.", "We went swimming in the lake.", "We went swimming with Grandpa."], answer: 0, why: "After school tells when." },
      { t: "pick", q: "Which sentence is stretched the most?", choices: ["The little blue bird sang a happy song in the morning.", "The little bird sang.", "The bird sang."], answer: 0, why: "It tells what kind of bird, what it sang, and when." },
      { t: "build", words: ["The", "baby", "giggled", "in", "the", "bathtub"], end: "." },
      { t: "pick", q: "Which detail tells HOW?", choices: ["slowly", "yesterday", "at the park"], answer: 0, why: "Slowly tells how something happened. Many HOW words end in -ly." },
      { t: "build", words: ["After", "lunch", "we", "played", "tag", "outside"], end: "." }
    ],
    write: [
      { emoji: "🐕", p: "Stretch this sentence: “The dog ran.” Add where, when or how!", starter: "The", ideas: ["muddy", "dog", "ran", "across", "through", "after", "quickly", "the park"], model: "The muddy dog ran across the kitchen after his bath.", need: { min: 8, useAll: ["dog", "ran"] } },
      { emoji: "🍦", p: "Stretch this sentence: “I ate ice cream.” Who were you with? Where? What flavor?", ideas: ["On", "a", "hot", "day", "chocolate", "with", "at the beach"], model: "On a hot Saturday, I ate a huge chocolate ice cream at the beach.", need: { min: 9, useAll: ["ate", "ice cream"] } }
    ],
    sticker: { emoji: "🧵", name: "Sentence Stretcher" }
  },
  {
    id: "s5", level: "w2", title: "Juicy Describing Words", skill: "Adjectives & the five senses", emoji: "🍉",
    learn: {
      points: [
        "Describing words (adjectives) tell what kind: color, size, shape, how it feels, smells, tastes or sounds.",
        "Use your five senses: 👀 see, 👂 hear, 👃 smell, 👅 taste, ✋ touch.",
        "Swap tired words for juicy ones: good → delicious, big → enormous, nice → friendly."
      ],
      good: "The hot, cheesy pizza smelled amazing.", bad: "The pizza was good.",
      joke: "Nova said the pizza was “good.” Penny said it was “cheesy, gooey and crispy.” Whose pizza would you rather eat?"
    },
    practice: [
      { t: "pick", q: "Which word is juicier than “big”?", choices: ["enormous", "nice", "went"], answer: 0, why: "Enormous means really, really big!" },
      { t: "pick", q: "Which sentence paints a better picture?", choices: ["The soft, fluffy kitten purred.", "The cat was nice.", "It was a cat."], answer: 0, why: "Soft and fluffy help you see and feel the kitten." },
      { t: "pick", q: "Which sense?  “The cookies smelled like warm cinnamon.”", choices: ["smell 👃", "hearing 👂", "touch ✋"], answer: 0, why: "Smelled is a clue: it's your nose!" },
      { t: "pick", q: "Find the describing word:  The slimy frog hopped.", choices: ["slimy", "frog", "hopped"], answer: 0, why: "Slimy tells what kind of frog." },
      { t: "pick", q: "Pick a juicier word for “good”:  The cake was good.", choices: ["delicious", "fine", "okay"], answer: 0, why: "Delicious tells exactly how good it tasted!" },
      { t: "build", words: ["The", "sparkly", "purple", "dragon", "roared"], end: "!" }
    ],
    write: [
      { emoji: "🍕", p: "Describe a pizza using at least 2 describing words. How does it look, smell and taste?", ideas: ["cheesy", "hot", "crispy", "gooey", "spicy", "golden", "smelled", "tasted"], model: "The hot, cheesy pizza had a crispy golden crust.", need: { min: 6, adj: 2 } },
      { emoji: "👾", p: "Invent a monster! Describe it with at least 3 describing words.", ideas: ["slimy", "green", "huge", "fuzzy", "stinky", "silly", "purple", "spiky"], model: "My monster is a huge, fuzzy, purple blob with six silly eyes.", need: { min: 8, adj: 3 } }
    ],
    sticker: { emoji: "🍉", name: "Juicy Word Chef" }
  },
  {
    id: "s6", level: "w2", title: "Glue Words", skill: "and, but, so, because", emoji: "🧴",
    learn: {
      points: [
        "Glue words join two short sentences into one longer one.",
        "AND adds more. BUT shows a surprise or a problem. SO tells what happened next.",
        "BECAUSE tells WHY. I wore a coat because it was cold."
      ],
      good: "I was hungry, so I made a sandwich.",
      joke: "Glue words are sticky! Just don't eat them like Nova did. Robots and glue don't mix."
    },
    practice: [
      { t: "join", a: "I was hungry.", b: "I ate a snack.", glue: "so", choices: ["so", "but", "because"], why: "Being hungry made me eat a snack. SO tells what happened next." },
      { t: "join", a: "I wanted to play outside.", b: "It was raining.", glue: "but", choices: ["but", "so", "and"], why: "Rain is a problem! BUT shows the surprise." },
      { t: "join", a: "Mia smiled.", b: "She got a puppy.", glue: "because", choices: ["because", "but", "so"], why: "Getting a puppy is WHY she smiled." },
      { t: "join", a: "Leo likes soccer.", b: "He likes basketball.", glue: "and", choices: ["and", "but", "because"], why: "AND adds one more thing Leo likes." },
      { t: "pick", q: "Which sentence makes sense?", choices: ["I wore a coat because it was cold.", "I wore a coat because I was hot.", "I wore a coat so it was cold."], answer: 0, why: "Cold weather is a good reason to wear a coat." },
      { t: "build", words: ["I", "fell", "down,", "but", "I", "got", "back", "up"], end: "." }
    ],
    write: [
      { emoji: "💛", p: "Finish this: “I like ___ because ___.” Tell what you like and WHY.", starter: "I like", ideas: ["because", "it is", "I can", "makes me"], model: "I like rainy days because I can splash in puddles.", need: { min: 7, use: ["because"] } },
      { emoji: "😲", p: "Write a sentence that uses “but” to show a surprise or a problem.", ideas: ["tried", "wanted", "but", "suddenly"], model: "I tried to bake cookies, but the dog ate the dough!", need: { min: 7, use: ["but"] } },
      { emoji: "⛄", p: "Write a sentence that uses “so” to tell what happened next.", ideas: ["It", "was", "so", "we"], model: "It started to snow, so we built a snowman.", need: { min: 7, use: ["so"] } }
    ],
    sticker: { emoji: "🧴", name: "Glue Word Genius" }
  },
  {
    id: "s7", level: "w2", title: "Fix-It Doctor", skill: "Editing: capitals, marks & spelling", emoji: "🩺",
    learn: {
      points: [
        "Good writers check their work, like a doctor checking a patient.",
        "🩺 Capitals: the first word, names (Sam, Texas), and the word I.",
        "🩺 Stop signs at the end. 🩺 Spelling. 🩺 Does it make sense?",
        "Read your writing out loud. Your ears catch mistakes your eyes miss!"
      ],
      good: "My friend Sam and I went to the park.", bad: "my frend sam and i went to the park",
      joke: "Penny's sentence is sick! It has a bad case of lowercase-itis. Quick, Doctor, get the capitals!"
    },
    practice: [
      { t: "pick", q: "Which one is fixed correctly?  (my dog max likes to run)", choices: ["My dog Max likes to run.", "my dog Max likes to run.", "My dog max likes to run"], answer: 0, why: "Capital M for the first word, capital M for the name Max, and a period." },
      { t: "pick", q: "Which sentence is spelled correctly?", choices: ["My friend said we were going to school.", "My frend sed we wuz going to skool.", "My freind siad we were going to school."], answer: 0, why: "Friend, said, were and school are spelled right in the first one." },
      { t: "pick", q: "Which one is correct?", choices: ["I went to the park.", "i went to the park.", "I goed to the park."], answer: 0, why: "I is always a capital, and we say went, not goed." },
      { t: "pick", q: "Find the mistake:  We ate pizza. it was yummy.", choices: ["“it” needs a capital: It", "“pizza” needs a capital", "nothing is wrong"], answer: 0, why: "A new sentence starts after the period, so It needs a capital." },
      { t: "pick", q: "Which sentence ends correctly?", choices: ["Do you have a pet?", "Do you have a pet.", "do you have a pet"], answer: 0, why: "It's asking, so it ends with a question mark." },
      { t: "pick", q: "Which word is spelled correctly?", choices: ["because", "becuase", "becuz"], answer: 0, why: "Be-cause: b e c a u s e." }
    ],
    write: [
      { emoji: "🩺", p: "Doctor time! Type this sentence again, with every mistake fixed.", show: "i saw sam at the park", note: "3 fixes: two capitals and a stop sign", need: { match: "I saw Sam at the park." } },
      { emoji: "🩹", p: "This one has spelling germs! Type it again, fixed.", show: "my frend and i went to skool", note: "Fix 2 spellings, 2 capitals and the stop sign", need: { match: "My friend and I went to school." } },
      { emoji: "🌮", p: "Penny wrote “diner”, but a diner is a restaurant! Fix the whole sentence.", show: "can we have tacos for diner", note: "It's asking something…", need: { match: "Can we have tacos for dinner?" } }
    ],
    sticker: { emoji: "🩺", name: "Doctor Editor" }
  },

  /* ---------------- Level 3: Paragraph Power ---------------- */
  {
    id: "s8", level: "w3", title: "Hamburger Paragraph", skill: "Topic sentence, details, closing", emoji: "🍔",
    learn: {
      points: [
        "A paragraph is a group of sentences about ONE topic.",
        "🍞 Top bun: the topic sentence tells what the paragraph is about.",
        "🥬🍅🧀 The fillings: three detail sentences that tell more.",
        "🍞 Bottom bun: a closing sentence wraps it up."
      ],
      good: "Dogs make wonderful pets. They are loyal. They learn tricks. They keep you active. That is why dogs are the best!",
      joke: "A paragraph with no topic sentence is a burger with no bun. Messy fingers everywhere!"
    },
    practice: [
      { t: "order", q: "Build the burger! Tap the sentences in order.", items: ["Dogs make wonderful pets.", "They are loyal and love their families.", "They can learn fun tricks.", "That is why dogs are the best pets."], why: "Topic sentence first, details in the middle, closing sentence last." },
      { t: "pick", q: "Which is the best TOPIC sentence for a paragraph about summer?", choices: ["Summer is my favorite season.", "I ate a popsicle.", "The pool was cold."], answer: 0, why: "It tells what the whole paragraph is about. The others are details." },
      { t: "pick", q: "Topic: My trip to the beach. Which sentence does NOT belong?", choices: ["My cat likes to sleep on my bed.", "I built a giant sandcastle.", "We found pink seashells."], answer: 0, why: "The cat has nothing to do with the beach trip." },
      { t: "pick", q: "Which is a good CLOSING sentence for a paragraph about soccer?", choices: ["That's why soccer is the best sport ever.", "Soccer has a ball.", "Kick!"], answer: 0, why: "It wraps up the whole paragraph." },
      { t: "order", q: "Put this paragraph in order.", items: ["Recess is the best part of my day.", "I can run and play tag with my friends.", "I can swing as high as the sky.", "Recess always makes me smile."], why: "Topic, details, then the closing sentence." },
      { t: "pick", q: "What does a detail sentence do?", choices: ["tells more about the topic", "starts a brand-new topic", "says goodbye"], answer: 0, why: "Details are the yummy fillings that tell more about the topic." }
    ],
    write: [
      { plan: true, emoji: "🏖️", p: "Write a hamburger paragraph about your favorite place.",
        parts: [
          { label: "🍞 Top bun", hint: "Topic sentence: what is your favorite place?", starter: "My favorite place is", model: "My favorite place is my grandma's garden.", need: { min: 5 } },
          { label: "🥬 Detail 1", hint: "What do you see there?", model: "There are tall sunflowers and buzzing bees.", need: { min: 5 } },
          { label: "🍅 Detail 2", hint: "What do you do there?", model: "I help Grandma pick juicy red tomatoes.", need: { min: 5 } },
          { label: "🧀 Detail 3", hint: "How does it make you feel?", model: "It makes me feel calm and happy.", need: { min: 5 } },
          { label: "🍞 Bottom bun", hint: "Closing sentence: wrap it up!", starter: "That is why", model: "That is why Grandma's garden is my favorite place.", need: { min: 5 } }
        ],
        need: { min: 25, sentences: 5 } }
    ],
    sticker: { emoji: "🍔", name: "Paragraph Chef" }
  },
  {
    id: "s9", level: "w3", title: "First, Next, Then, Last", skill: "Order words & how-to writing", emoji: "🪜",
    learn: {
      points: [
        "How-to writing tells the steps in order.",
        "Order words help the reader follow along: First, Next, Then, After that, Finally.",
        "Put a comma after an order word at the start: First, get the bread."
      ],
      good: "First, get two slices of bread. Next, spread the peanut butter. Finally, take a big bite!",
      joke: "If you put your shoes on before your socks, your toes will be very confused!"
    },
    practice: [
      { t: "order", q: "How to brush your teeth: tap the steps in order.", items: ["First, put toothpaste on your brush.", "Next, brush your teeth in little circles.", "Then, spit out the toothpaste.", "Finally, rinse your mouth with water."], why: "The order words First, Next, Then and Finally are clues." },
      { t: "pick", q: "Which word shows the LAST step?", choices: ["Finally", "First", "Next"], answer: 0, why: "Finally means at the very end." },
      { t: "pick", q: "Making pancakes. Which word fits the first step?  ______, crack the eggs into a bowl.", choices: ["First", "Finally", "Last"], answer: 0, why: "Cracking eggs comes at the start, so First fits." },
      { t: "order", q: "How to plant a seed: tap the steps in order.", items: ["First, dig a small hole.", "Next, drop in a seed.", "Then, cover it with dirt.", "Last, water it every day."], why: "You can't cover the seed before you drop it in!" },
      { t: "pick", q: "Which sentence uses an order word?", choices: ["After that, we ate cake.", "We ate cake.", "Cake is yummy."], answer: 0, why: "After that is an order word." },
      { t: "pick", q: "How to make a sandwich. Which step does NOT belong?", choices: ["Feed the goldfish.", "Put cheese on the bread.", "Get two slices of bread."], answer: 0, why: "The goldfish has nothing to do with a sandwich. (Sorry, goldfish!)" }
    ],
    write: [
      { plan: true, emoji: "🥪", p: "Write how to make your favorite snack, step by step.",
        parts: [
          { label: "🎯 Topic", hint: "What will you teach us to make?", starter: "Here is how to make", model: "Here is how to make a banana smoothie.", need: { min: 5 } },
          { label: "1️⃣ First", hint: "What do you do first?", starter: "First,", model: "First, peel a ripe banana.", need: { min: 4, use: ["first"] } },
          { label: "2️⃣ Next", hint: "What comes next?", starter: "Next,", model: "Next, put the banana and milk in a blender.", need: { min: 4, use: ["next"] } },
          { label: "3️⃣ Then", hint: "And then?", starter: "Then,", model: "Then, blend it until it is smooth.", need: { min: 4, use: ["then"] } },
          { label: "🏁 Finally", hint: "What is the last step?", starter: "Finally,", model: "Finally, pour it into a cup and enjoy!", need: { min: 4, use: ["finally", "last"] } }
        ],
        need: { min: 25, sentences: 5, trans: 3 } }
    ],
    sticker: { emoji: "🪜", name: "Step-by-Step Star" }
  },
  {
    id: "s10", level: "w3", title: "My Own Story", skill: "Beginning, middle & end", emoji: "📜",
    learn: {
      points: [
        "A story has a BEGINNING (who and where), a MIDDLE (a problem!) and an END (how it is solved).",
        "Start with a hook that grabs the reader: BOOM! or a question.",
        "Show feelings and let characters talk: “Help!” yelled Mia."
      ],
      good: "BOOM! The volcano in my backyard erupted, and out popped a tiny dragon.",
      joke: "Every story needs a problem. Penny's problem? Her eraser ran away to join the circus!"
    },
    practice: [
      { t: "pick", q: "Which beginning has the best HOOK?", choices: ["BOOM! The volcano in my backyard just erupted.", "This is a story.", "Once there was a thing."], answer: 0, why: "BOOM! grabs the reader and makes them want to read more." },
      { t: "order", q: "Put the story in order: beginning, middle, end.", items: ["Max found a tiny egg in the forest.", "The egg cracked, and a baby dragon peeked out!", "The dragon was hungry and started eating Max's socks.", "Max fed it pancakes, and they became best friends."], why: "First the egg, then the dragon, then the problem, then the happy ending." },
      { t: "pick", q: "Lily's kite got stuck in a tree. Her brother got a ladder and helped her. What is the PROBLEM?", choices: ["the kite got stuck", "her brother got a ladder", "Lily had a kite"], answer: 0, why: "A problem is something that goes wrong. The ladder is the solution." },
      { t: "pick", q: "Sam's hands shook and his heart pounded. How did Sam feel?", choices: ["nervous", "sleepy", "bored"], answer: 0, why: "Shaking hands and a pounding heart show he was nervous." },
      { t: "pick", q: "Which sentence shows talking correctly?", choices: ["“Help!” yelled Mia.", "Help yelled Mia.", "“Help yelled Mia.”"], answer: 0, why: "Only the words Mia says go inside the talking marks." },
      { t: "pick", q: "Which is the best ENDING?", choices: ["From that day on, Max never went anywhere without his dragon.", "The.", "Max had a dragon. The end. The end."], answer: 0, why: "It wraps up the story in a satisfying way." }
    ],
    write: [
      { plan: true, spark: true, emoji: "📜", p: "Spin a Story Spark, then write your very own story!",
        parts: [
          { label: "🌅 Beginning", hint: "Who is in your story, and where are they? Start with a hook!", model: "BOOM! A tiny dragon crashed into my school library.", need: { min: 6 } },
          { label: "⚡ Problem", hint: "What goes wrong?", model: "The dragon was scared of the dark and started to cry.", need: { min: 6 } },
          { label: "🧠 Middle", hint: "What does your character try? How do they feel?", model: "I felt nervous, but I grabbed my flashlight to help.", need: { min: 6 } },
          { label: "🌈 Ending", hint: "How is the problem solved?", model: "“Thank you!” said the dragon, and we read books together all night.", need: { min: 6 } }
        ],
        need: { min: 28, sentences: 4 } }
    ],
    sticker: { emoji: "📜", name: "Story Author" }
  }
];

/* Story Sparks for stories and Free Write */
const SPARKS = [
  "A dragon who is afraid of the dark", "The day my shoes started talking", "A pizza that floated away",
  "My hamster becomes class president", "A secret door in the school library", "A robot who wants to be a chef",
  "The day it rained jelly beans", "A shark who can't swim", "I shrank to the size of an ant",
  "A unicorn who lost its horn", "The playground turned into a jungle", "My teacher is secretly a superhero",
  "A penguin who moves to the desert", "The best birthday surprise ever", "A sock that wanted an adventure",
  "My dog learns to talk for one day"
];

const PRAISE = {
  right: ["Correct!", "Yes, that's right!", "Smart thinking!", "You got it!", "Writer brain!"],
  oops: ["Good try! Look again.", "Not quite. Try another one.", "Hmm, think again. You've got this!"]
};

const WS_TROPHIES = [
  { id: "first-write", icon: "✏️", name: "First Words", desc: "Save your first piece of writing" },
  { id: "first-lesson", icon: "🌱", name: "Sprouting Writer", desc: "Finish your first lesson" },
  { id: "self-fix", icon: "🩺", name: "Self Fixer", desc: "Fix your own mistakes 5 times (no Show me)" },
  { id: "perfect-5", icon: "🌟", name: "Clean Copy", desc: "Get 3 stars on 5 pieces of writing" },
  { id: "paragraph", icon: "🍔", name: "Paragraph Chef", desc: "Write a whole paragraph" },
  { id: "story", icon: "📜", name: "Real Author", desc: "Write your own story" },
  { id: "free-3", icon: "✨", name: "Idea Machine", desc: "Do 3 Free Writes" },
  { id: "all-levels", icon: "👑", name: "Writing Champion", desc: "Finish all 10 lessons" }
];
