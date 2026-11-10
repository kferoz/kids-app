/* ============================================================
   Koa's Reading Gym — lessons (original passages, Grade 3 CCSS
   RL/RI.3.1–3.7 ladder from easy to on-grade)

   Lesson   { id, belt, emoji, title, goal, tip, sticker, cross?,
              tap? ("qword" = tap the question word), champ?,
              cards: [[emoji, heading, text]], check: Q, A, B }
   Passage  { title, emoji, scene, words: [[word, meaning]],
              predict: [3 guesses], p: [[sentence, …], …] (parts),
              stops?: [{ after: partIndex, q, c, a }], qs: [Q] }
   Q (mc)   { q, c: [choices, right one FIRST], key: [words in q],
              ev: [snippets of the proof sentence(s)], why, think? }
   Q order  { type: "order", q, items: [in the right order], ev, think? }
   Q build  { type: "build", q, parts: [{ l, c: [right first] }], ev, think? }
   think    Koa's think-aloud for the modelled question (I do).
            Default actions: first line highlights the key words,
            middle lines the proof, last line the answer. A line
            may start with [x:choice] to cross a choice out.
   The app shuffles choices; test/readgym.js checks every snippet.
   ============================================================ */
var RG_BELTS = [
  { id: "white",  name: "White Belt",  emoji: "🤍", color: "#adb5bd", level: "Warm-up · Grade 1–2 texts" },
  { id: "yellow", name: "Yellow Belt", emoji: "💛", color: "#fab005", level: "Getting strong · Grade 2 texts" },
  { id: "green",  name: "Green Belt",  emoji: "💚", color: "#40c057", level: "Grade 3 skills" },
  { id: "blue",   name: "Blue Belt",   emoji: "💙", color: "#339af0", level: "Strong Grade 3 thinking" },
  { id: "gold",   name: "Gold Belt",   emoji: "🏆", color: "#f08c00", level: "Reading Champion" }
];

var RG_LESSONS = [
  /* ===================== WHITE BELT ===================== */
  { id: "movie", belt: 0, emoji: "🎬", title: "Make a Movie in Your Mind", sticker: "🍿",
    goal: "I can picture what I read and read every word.",
    tip: "Picture it like a movie. If the movie gets blurry, read that part again.",
    cards: [
      ["🎬", "Readers make movies", "Good readers make a movie in their mind. As you read, picture the people, the place and what happens."],
      ["🔍", "Read every word", "One word can change the whole movie! “A big dog” and “a tiny dog” are very different pictures."],
      ["🔁", "Blurry? Read it again", "If the movie in your head gets blurry, stop and read that part again. That's what strong readers do!"]
    ],
    check: { q: "What should you do when the movie in your mind gets blurry?", c: ["Read that part again", "Skip to the end", "Close the book"] },
    A: { title: "Pip's Red Kite", emoji: "🪁", scene: "🪁🌬️⛰️🌳", words: [["windy", "when lots of wind is blowing"]],
      predict: ["Pip flies a kite.", "Pip bakes a cake.", "Pip goes swimming."],
      p: [["Pip had a red kite with a long yellow tail.", "One windy day, she ran to the top of the hill."],
          ["The wind pulled the kite up, up, up.", "Then the kite got stuck in a tall tree!", "Pip's big brother climbed up and set it free."]],
      qs: [
        { q: "What color was Pip's kite?", c: ["red", "yellow", "blue"], key: ["color", "kite"], ev: ["red kite"],
          why: "The text says Pip had a red kite. Yellow was the tail, not the kite.",
          think: ["The question asks what COLOR. So I'm looking for a color word about the kite.",
                  "I'll scan for the word kite. The first sentence says “Pip had a red kite with a long yellow tail.”",
                  "Careful! Yellow is the TAIL. Reading every word helps me. The kite is red!"] },
        { q: "Where did Pip run on the windy day?", c: ["to the top of the hill", "to the beach", "to school"], key: ["run", "windy"], ev: ["top of the hill"],
          why: "“She ran to the top of the hill.”" },
        { q: "Who got the kite out of the tree?", c: ["Pip's big brother", "Pip's mom", "a bird"], key: ["kite", "tree"], ev: ["climbed up"],
          why: "“Pip's big brother climbed up and set it free.”" }
      ] },
    B: { title: "The Snowman", emoji: "⛄", scene: "⛄❄️🧣🥕", words: [["wrapped", "put something all the way around"]],
      predict: ["Kids make something out of snow.", "Kids go to the zoo.", "A dog learns a trick."],
      p: [["Leo and Mia made a snowman in the yard.", "They used two rocks for its eyes and a carrot for its nose."],
          ["Mia wrapped her green scarf around its neck.", "The next day the sun came out.", "By lunch, the snowman was a small, wet pile with a carrot on top."]],
      qs: [
        { q: "What did they use for the snowman's nose?", c: ["a carrot", "a rock", "a button"], key: ["nose"], ev: ["carrot for its nose"], why: "“…and a carrot for its nose.”" },
        { q: "What color was the scarf?", c: ["green", "red", "blue"], key: ["color", "scarf"], ev: ["green scarf"], why: "Mia wrapped her green scarf around its neck." },
        { q: "What happened to the snowman when the sun came out?", c: ["It melted.", "It grew bigger.", "It walked away."], key: ["sun"], ev: ["small, wet pile"],
          why: "A small, wet pile means the sun melted it. Picture the movie!" },
        { q: "Which picture matches the END of the story?", c: ["💧🥕 a wet pile with a carrot", "⛄ a tall snowman", "🏠 a snow house"], key: ["END"], ev: ["small, wet pile"],
          why: "At the end, the snowman was a small, wet pile with a carrot on top." }
      ] } },

  { id: "qwords", belt: 0, emoji: "❓", title: "Question Words Are Clues", sticker: "🗝️", tap: "qword",
    goal: "I can tell what kind of answer a question wants.",
    tip: "Look at the question word: Who = person, Where = place, When = time, Why = reason.",
    cards: [
      ["❓", "The first word is a clue", "The question word tells you what KIND of answer to look for."],
      ["🗺️", "What each one wants", "WHO 👤 a person or animal · WHERE 📍 a place · WHEN ⏰ a time · WHAT 📦 a thing or action · WHY 💡 a reason · HOW 🔧 the way it happens"],
      ["🎯", "Aim before you look", "Before hunting for the answer, ask yourself: “What is this question word asking me to find?”"]
    ],
    check: { q: "Which question word asks for a PLACE?", c: ["Where", "Who", "When"] },
    A: { title: "The Lost Mitten", emoji: "🧤", scene: "🧤🐿️🌳🏫", words: [["nest", "a home an animal makes"]],
      predict: ["Someone finds a lost thing.", "Someone builds a rocket.", "Someone wins a race."],
      p: [["On Monday morning, Ana lost her blue mitten on the way to school."],
          ["After school, she looked under the slide.", "She looked by the big oak tree."],
          ["At last she found it in a squirrel's nest!", "The squirrel had used it to keep warm."]],
      qs: [
        { q: "When did Ana lose her mitten?", c: ["on Monday morning", "on Friday night", "after lunch"], key: ["lose", "mitten"], ev: ["Monday morning"],
          why: "WHEN wants a time: “On Monday morning, Ana lost her blue mitten.”",
          think: ["The question word is WHEN. When asks for a TIME. So I'll look for time words like morning, Monday or after school.",
                  "The first sentence says “On Monday morning, Ana lost her blue mitten.”",
                  "Monday morning is a time. That's my answer!"] },
        { q: "Where did Ana find the mitten?", c: ["in a squirrel's nest", "under the slide", "in her backpack"], key: ["find", "mitten"], ev: ["found it in"],
          why: "WHERE wants a place. She LOOKED under the slide, but she FOUND it in a squirrel's nest." },
        { q: "Why did the squirrel take the mitten?", c: ["to keep warm", "to play catch", "to give it back"], key: ["squirrel", "mitten"], ev: ["keep warm"],
          why: "WHY wants a reason: the squirrel used it to keep warm." }
      ] },
    B: { title: "Grandpa's Garden", emoji: "🥕", scene: "👴🌱🥕🎃", words: [["weeds", "plants that grow where you don't want them"]],
      predict: ["Someone grows food.", "Someone flies a plane.", "Someone bakes bread."],
      p: [["Every Saturday, Sam helps Grandpa in his garden.", "Grandpa grows carrots, beans and big orange pumpkins."],
          ["Sam waters the plants with a little green can.", "He pulls the weeds because weeds steal water from the plants."],
          ["In the fall, they pick the pumpkins together."]],
      qs: [
        { q: "Who does Sam help?", c: ["Grandpa", "his teacher", "his sister"], key: ["Sam", "help"], ev: ["helps Grandpa"], why: "WHO wants a person: Sam helps Grandpa." },
        { q: "When do they pick the pumpkins?", c: ["in the fall", "every morning", "at night"], key: ["pick", "pumpkins"], ev: ["In the fall"], why: "WHEN wants a time: in the fall." },
        { q: "Why does Sam pull the weeds?", c: ["Weeds steal water from the plants.", "Weeds are pretty.", "Grandpa likes weeds."], key: ["pull", "weeds"], ev: ["steal water"],
          why: "WHY wants a reason. Look for “because”: because weeds steal water." },
        { q: "How does Sam water the plants?", c: ["with a little green can", "with a big hose", "with a bucket"], key: ["water", "plants"], ev: ["little green can"],
          why: "HOW wants the way: with a little green can." }
      ] } },

  { id: "proof", belt: 0, emoji: "👉", title: "Right There! Find the Proof", sticker: "🦅",
    goal: "I can find the sentence that proves my answer.",
    tip: "Scan for the key word like a hawk, then read that sentence slowly. That sentence is your proof.",
    cards: [
      ["👉", "Right There answers", "Some answers are RIGHT THERE in the text. Words from the question are often the same words in the text."],
      ["🦅", "Scan like a hawk", "Move your eyes quickly to find the key word. Then slow down and read that whole sentence carefully."],
      ["📌", "Proof!", "Proof is the sentence that shows your answer is right. Strong readers can always point to their proof."]
    ],
    check: { q: "What do you do after you find the key word?", c: ["Read that whole sentence carefully", "Stop reading", "Guess fast"] },
    A: { title: "Busy Bees", emoji: "🐝", scene: "🐝🌸🍯🏠", words: [["hive", "a home for bees"], ["nectar", "sweet juice inside flowers"]],
      predict: ["Facts about bees", "A story about a pirate", "How to build a car"],
      p: [["Honeybees live together in a home called a hive.", "One hive can have thousands of bees."],
          ["Worker bees fly from flower to flower.", "They drink a sweet juice called nectar.", "Back at the hive, the bees turn the nectar into honey."]],
      qs: [
        { q: "What is a honeybee's home called?", c: ["a hive", "a nest", "a den"], key: ["home"], ev: ["home called a hive"],
          why: "“Honeybees live together in a home called a hive.”",
          think: ["The key word is HOME. I'll scan like a hawk for the word home.",
                  "Found it! The first sentence: “Honeybees live together in a home called a hive.”",
                  "The answer is right there: a hive. And that sentence is my proof! 📌"] },
        { q: "What do worker bees drink?", c: ["nectar", "milk", "pond water"], key: ["drink"], ev: ["sweet juice called nectar"], why: "“They drink a sweet juice called nectar.”" },
        { q: "What do the bees turn the nectar into?", c: ["honey", "wax", "flowers"], key: ["turn", "nectar"], ev: ["into honey"], why: "“The bees turn the nectar into honey.”" }
      ] },
    B: { title: "Penguins", emoji: "🐧", scene: "🐧🧊🐟🌊", words: [["flippers", "flat body parts for swimming"], ["krill", "tiny sea animals like shrimp"]],
      predict: ["Facts about penguins", "A story about a dragon", "How to make soup"],
      p: [["Penguins are birds, but they cannot fly.", "Instead, they are super swimmers."],
          ["Their wings work like flippers to push them through the water.", "Penguins eat fish, squid and tiny shrimp called krill."],
          ["Thick feathers and a layer of fat keep them warm in the icy cold."]],
      qs: [
        { q: "Can penguins fly?", c: ["No, they cannot fly.", "Yes, very high.", "Only at night."], key: ["fly"], ev: ["cannot fly"], why: "“Penguins are birds, but they cannot fly.”" },
        { q: "What do penguins' wings work like?", c: ["flippers", "sails", "wheels"], key: ["wings"], ev: ["work like flippers"], why: "“Their wings work like flippers.”" },
        { q: "What are krill?", c: ["tiny shrimp", "big fish", "chunks of ice"], key: ["krill"], ev: ["called krill"], why: "“…tiny shrimp called krill.”" },
        { q: "What keeps penguins warm?", c: ["thick feathers and fat", "warm sunshine", "their nests"], key: ["warm"], ev: ["keep them warm"], why: "“Thick feathers and a layer of fat keep them warm.”" }
      ] } },

  /* ===================== YELLOW BELT ===================== */
  { id: "choices", belt: 1, emoji: "✂️", title: "Read Every Choice, Cross Out", sticker: "🪤", cross: true,
    goal: "I can read all the choices and cross out the wrong ones.",
    tip: "Read the question twice. Cross out ✗ choices that are wrong, then check your proof.",
    cards: [
      ["👀", "Twice, then all", "Read the question TWO times. Then read EVERY choice before you pick one."],
      ["🪤", "Watch for traps", "Some choices are traps. They use words from the text but they don't answer THIS question."],
      ["✗", "Cross out", "Tap ✗ to cross out choices you know are wrong. Then check the proof for the ones left."]
    ],
    check: { q: "What should you do before you pick an answer?", c: ["Read every choice", "Pick the first one", "Pick the longest one"] },
    A: { title: "The Class Pet", emoji: "🐹", scene: "🐹🏫🥕🎡", words: [["take care of", "keep safe, fed and happy"]],
      predict: ["A class has a pet.", "A class goes to space.", "A class plants a tree."],
      p: [["Room 12 has a hamster named Biscuit.", "Biscuit is brown and white and has tiny pink feet."],
          ["Each week, a different student takes care of him.", "This week it is Omar's turn.", "Omar fills the water bottle and gives Biscuit fresh carrots."],
          ["At night, Biscuit runs on his wheel while the school is quiet."]],
      qs: [
        { q: "Whose turn is it to take care of Biscuit this week?", c: ["Omar's", "Biscuit's", "the principal's"], key: ["turn", "week"], ev: ["Omar's turn"],
          why: "“This week it is Omar's turn.”",
          think: ["I read the question twice. It asks whose TURN it is THIS week.",
                  "[x:Biscuit's]Now I read every choice. Biscuit is the hamster. He can't take care of himself! Cross it out ✗.",
                  "[x:the principal's]The principal is not in the story at all. Cross it out ✗.",
                  "Only Omar's is left. My proof: “This week it is Omar's turn.” ✅"] },
        { q: "What does Omar give Biscuit?", c: ["fresh carrots", "a new wheel", "pink socks"], key: ["Omar", "give"], ev: ["fresh carrots"],
          why: "The wheel is in the story, but Omar doesn't give it. That's a trap! Omar gives fresh carrots." },
        { q: "When does Biscuit run on his wheel?", c: ["at night", "during math", "every morning"], key: ["wheel"], ev: ["At night"], why: "“At night, Biscuit runs on his wheel.”" }
      ] },
    B: { title: "Rainy Day Fort", emoji: "☔", scene: "☔🛋️🔦🍿", words: [["fort", "a little hideout you build"], ["peeked", "took a quick look"]],
      predict: ["Kids play inside on a rainy day.", "Kids go to the beach.", "Kids ride bikes."],
      p: [["It rained all day on Saturday, so Kai and Lily could not go to the park."],
          ["They pulled the cushions off the sofa.", "They put a big sheet over two chairs.", "Inside their fort, they read comics with a flashlight."],
          ["When Dad peeked in, he brought them popcorn."]],
      qs: [
        { q: "Why couldn't Kai and Lily go to the park?", c: ["It rained all day.", "The park was closed.", "They were sick."], key: ["park"], ev: ["rained all day"], why: "“It rained all day on Saturday, so Kai and Lily could not go to the park.”" },
        { q: "What did they put over two chairs?", c: ["a big sheet", "the cushions", "a flashlight"], key: ["chairs"], ev: ["big sheet"], why: "Trap alert! The cushions came off the sofa. The SHEET went over the chairs." },
        { q: "What did they do inside the fort?", c: ["read comics", "ate lunch", "played a video game"], key: ["inside", "fort"], ev: ["read comics"], why: "“Inside their fort, they read comics with a flashlight.”" },
        { q: "What did Dad bring?", c: ["popcorn", "a sheet", "comics"], key: ["Dad", "bring"], ev: ["brought them popcorn"], why: "“When Dad peeked in, he brought them popcorn.”" }
      ] } },

  { id: "order", belt: 1, emoji: "🪜", title: "First, Next, Last", sticker: "🍋",
    goal: "I can put events in order using order words.",
    tip: "Find the order words: first, next, then, after, finally, last.",
    cards: [
      ["🪜", "Steps on a ladder", "Stories and how-to texts happen in order, like steps on a ladder."],
      ["🔤", "Order words are clues", "first · next · then · after that · later · finally · last"],
      ["🗣️", "Retell it", "To retell, say what happened first, next and last, in your own words."]
    ],
    check: { q: "Which word tells you something happens at the END?", c: ["finally", "first", "next"] },
    A: { title: "Making Lemonade", emoji: "🍋", scene: "🍋🥤🧊🪧", words: [["squeezed", "pressed hard to get juice out"]],
      predict: ["Someone makes a drink.", "Someone fixes a bike.", "Someone climbs a tree."],
      p: [["Zoe wanted to sell lemonade.", "First, she squeezed six lemons into a jug.", "Next, she added water and some sugar."],
          ["Then she stirred it with a long spoon.", "Finally, she dropped in ice and opened her stand."]],
      qs: [
        { type: "order", q: "Put Zoe's steps in order.", items: ["squeezed six lemons", "added water and sugar", "stirred it with a spoon", "dropped in ice"], ev: ["First, she squeezed"],
          why: "First, Next, Then, Finally: the order words lead the way!",
          think: ["I look for the order words: First, Next, Then, Finally.",
                  "First she squeezed lemons. Next she added water and sugar.",
                  "Then she stirred it. Finally she dropped in ice. The order words were my clues! 🪜"] },
        { q: "What did Zoe do right after squeezing the lemons?", c: ["added water and sugar", "stirred it", "opened her stand"], key: ["after", "squeezing"], ev: ["Next, she added"], why: "“Next, she added water and some sugar.”" },
        { q: "Which word tells the LAST step?", c: ["Finally", "First", "Then"], key: ["LAST", "step"], ev: ["Finally, she dropped"], why: "Finally tells the last step." }
      ] },
    B: { title: "A Seed Grows", emoji: "🌻", scene: "🌱🌻☀️🌧️", words: [["soil", "dirt that plants grow in"], ["shoot", "a new little stem"]],
      predict: ["How a plant grows", "How a car is made", "A story about a cat"],
      p: [["A sunflower starts as a tiny seed in the soil.", "After rain soaks the soil, a root grows down from the seed."],
          ["Next, a little green shoot pushes up toward the sun.", "Then leaves open, and the stem grows taller every day.", "At last, a big yellow flower opens and turns to follow the sun."]],
      qs: [
        { type: "order", q: "Put the sunflower's life in order.", items: ["a tiny seed in the soil", "a root grows down", "a green shoot pushes up", "a big yellow flower opens"], ev: ["At last"], why: "Seed → root → shoot → flower." },
        { q: "What grows FIRST from the seed?", c: ["a root", "a flower", "leaves"], key: ["FIRST", "seed"], ev: ["root grows down"], why: "“…a root grows down from the seed.” Then comes the shoot." },
        { q: "What happens after the shoot pushes up?", c: ["Leaves open.", "A seed is planted.", "Rain soaks the soil."], key: ["after", "shoot"], ev: ["Then leaves open"], why: "“Then leaves open.” The other two happened BEFORE." },
        { q: "What does the flower do at last?", c: ["opens and follows the sun", "falls into the soil", "turns back into a seed"], key: ["last", "flower"], ev: ["At last"], why: "“At last, a big yellow flower opens and turns to follow the sun.”" }
      ] } },

  { id: "check", belt: 1, emoji: "🛑", title: "Stop and Check", sticker: "🧰", cross: true,
    goal: "I can notice when I'm confused and fix it.",
    tip: "Stop after each part: “Do I get it?” If not, re-read slowly, picture it, or read on for clues.",
    cards: [
      ["🤔", "Notice when you're lost", "Good readers notice when they don't understand. That's a superpower!"],
      ["🛑", "Stop after each part", "Stop after each part and ask: “What just happened? Do I get it?”"],
      ["🧰", "Fix-up tools", "Read it again · read slower · picture it · read on for clues · ask for help"]
    ],
    check: { q: "You read a part and don't understand it. What is a good fix-up?", c: ["Read it again, slowly", "Skip the whole story", "Guess and keep going"] },
    A: { title: "The Science Fair", emoji: "🔬", scene: "🔬🌋🎀🏆", words: [["judges", "people who decide who wins"]],
      predict: ["A kid makes a science project.", "A kid goes fishing.", "A kid loses a tooth."],
      p: [["Maya built a volcano for the science fair.", "She made it out of clay and painted it brown."],
          ["On the big day, she poured baking soda into the top.", "Then she added vinegar.", "Fizzy red foam bubbled over the sides!"],
          ["The judges clapped.", "Maya won a blue ribbon for second place."]],
      stops: [
        { after: 0, q: "Stop and check: what did Maya build?", c: ["a volcano", "a robot", "a car"] },
        { after: 1, q: "Stop and check: what made the foam?", c: ["baking soda and vinegar", "clay and paint", "water and sand"] }
      ],
      qs: [
        { q: "What place did Maya win?", c: ["second place", "first place", "third place"], key: ["place", "win"], ev: ["second place"],
          why: "A blue ribbon can mean different things. Re-reading shows: second place.",
          think: ["Hmm, a blue ribbon. I thought blue always meant first! Let me stop and check.",
                  "I'll re-read the last sentence slowly: “Maya won a blue ribbon for second place.”",
                  "Re-reading fixed my mistake. The answer is second place! 🧰"] },
        { q: "What color was the foam?", c: ["red", "brown", "blue"], key: ["color", "foam"], ev: ["Fizzy red foam"], why: "The volcano was brown, the ribbon was blue, but the FOAM was red." },
        { q: "What did Maya make the volcano out of?", c: ["clay", "paper", "sand"], key: ["volcano", "out of"], ev: ["out of clay"], why: "“She made it out of clay.”" }
      ] },
    B: { title: "Night Hike", emoji: "🌙", scene: "🌙🔦🦉🌲", words: [["headlamp", "a light that straps onto your head"]],
      predict: ["An adventure at night", "A day at the pool", "A birthday party"],
      p: [["Ben and his aunt went on a night hike.", "They each wore a headlamp, a light that straps onto your head."],
          ["Ben heard a soft “hoo-hoo” from a pine tree.", "He shined his light up and saw two big yellow eyes.", "It was an owl!"],
          ["Later, they turned off their lights and looked up.", "Without the lights, they could see hundreds of stars."]],
      stops: [
        { after: 0, q: "Stop and check: what is a headlamp?", c: ["a light you wear on your head", "a lamp on a table", "a kind of hat"] },
        { after: 1, q: "Stop and check: what did Ben see in the tree?", c: ["an owl", "a cat", "a kite"] }
      ],
      qs: [
        { q: "Who did Ben hike with?", c: ["his aunt", "his dad", "his class"], key: ["hike"], ev: ["Ben and his aunt"], why: "“Ben and his aunt went on a night hike.”" },
        { q: "What made the “hoo-hoo” sound?", c: ["an owl", "the wind", "his aunt"], key: ["sound"], ev: ["It was an owl"], why: "He saw two big yellow eyes. “It was an owl!”" },
        { q: "Why could they see so many stars?", c: ["They turned off their lights.", "It was raining.", "The owl showed them."], key: ["stars"], ev: ["Without the lights"], why: "“Without the lights, they could see hundreds of stars.”" },
        { q: "Where was the owl?", c: ["in a pine tree", "on a rock", "in the sky"], key: ["owl"], ev: ["from a pine tree"], why: "The sound came from a pine tree, and that's where Ben saw the eyes." }
      ] } },

  /* ===================== GREEN BELT ===================== */
  { id: "words", belt: 2, emoji: "🕵️", title: "Word Detective: Context Clues", sticker: "🔎", cross: true,
    goal: "I can figure out a new word from the clues around it.",
    tip: "Read the sentences around the new word. Try your meaning in the sentence. Does it make sense?",
    cards: [
      ["🕵️", "Don't skip it!", "Found a word you don't know? Be a word detective."],
      ["🔦", "Clues are around it", "Look at the words and sentences AROUND the new word. They are clues to its meaning."],
      ["🧪", "Test it", "“The puppy was so drowsy that it yawned and fell asleep.” Clues: yawned, fell asleep. Drowsy must mean sleepy! Try it in the sentence: it makes sense."]
    ],
    check: { q: "Where do you look for clues to a new word?", c: ["In the words and sentences around it", "Only at the pictures", "Nowhere, just skip it"] },
    A: { title: "The Enormous Pumpkin", emoji: "🎃", scene: "🎃🚜🏅👩‍🌾", words: [],
      predict: ["A farmer grows something big.", "A pirate finds gold.", "A girl learns to swim."],
      p: [["Farmer Rosa grew an enormous pumpkin.", "It was so big that five people could not lift it!"],
          ["She needed a tractor to haul it to the fair.", "The tractor pulled it slowly down the bumpy road."],
          ["At the fair, everyone gasped in astonishment.", "They had never seen such a giant pumpkin before."]],
      qs: [
        { q: "What does “enormous” mean?", c: ["very big", "very small", "very old"], key: ["enormous"], ev: ["five people could not lift"],
          why: "The clue: it was so big that five people could not lift it.",
          think: ["I don't know the word ENORMOUS. Time to be a word detective!",
                  "The next sentence is a clue: it was so BIG that five people could not lift it!",
                  "Let me test “very big” in the sentence: “Farmer Rosa grew a very big pumpkin.” It makes sense! 🕵️"] },
        { q: "What does “haul” mean?", c: ["pull or carry", "paint", "eat"], key: ["haul"], ev: ["pulled it slowly"], why: "The tractor PULLED it, so haul means to pull or carry." },
        { q: "What does “astonishment” mean?", c: ["great surprise", "sadness", "sleepiness"], key: ["astonishment"], ev: ["never seen such"], why: "They gasped and had never seen anything like it. That's great surprise!" }
      ] },
    B: { title: "Life in the Desert", emoji: "🐫", scene: "🐫🌵☀️🦎", words: [],
      predict: ["Facts about the desert", "A story about snow", "A recipe for pie"],
      p: [["The desert is arid, which means it gets very little rain.", "Animals that live there must save water."],
          ["A camel can go many days without drinking.", "Its hump stores fat, which gives it energy when food is scarce, or hard to find."],
          ["Many desert animals are nocturnal.", "They sleep in the hot day and come out at night when it is cool."]],
      qs: [
        { q: "What does “arid” mean?", c: ["very dry", "very wet", "very cold"], key: ["arid"], ev: ["very little rain"], why: "“…which means it gets very little rain.” Very little rain = very dry." },
        { q: "What does “scarce” mean?", c: ["hard to find", "easy to find", "very tasty"], key: ["scarce"], ev: ["hard to find"], why: "The text tells you right after the word: “or hard to find.”" },
        { q: "What does “nocturnal” mean?", c: ["awake at night", "awake in the day", "always asleep"], key: ["nocturnal"], ev: ["come out at night"], why: "They sleep in the day and come out at night." },
        { q: "Which words were the clue for “arid”?", c: ["which means it gets very little rain", "A camel can go many days", "They sleep in the hot day"], key: ["clue", "arid"], ev: ["very little rain"],
          why: "Authors often explain a hard word right after it with “which means” or “or”." }
      ] } },

  { id: "mainidea", belt: 2, emoji: "☂️", title: "Main Idea & Details", sticker: "🐙", cross: true,
    goal: "I can find the main idea and the details that support it.",
    tip: "The main idea is the umbrella ☂️ that covers ALL the details. Check the title and first sentence.",
    cards: [
      ["☂️", "Main idea = umbrella", "The MAIN IDEA is what the whole text is mostly about. It's like an umbrella over everything."],
      ["💧", "Details = raindrops", "DETAILS are the raindrops under the umbrella: small facts that tell more about the main idea."],
      ["✅", "Umbrella test", "Does your main idea cover ALL the details? If it only fits one sentence, it's a detail."],
      ["🔦", "Quick clue", "Look at the title and the first sentence. They often give away the main idea."]
    ],
    check: { q: "The main idea is…", c: ["what the whole text is mostly about", "one small fact", "the last word"] },
    A: { title: "Amazing Octopuses", emoji: "🐙", scene: "🐙🌊🪸🫙", words: [["clever", "smart and quick to learn"]],
      predict: ["Facts about a sea animal", "A story about a train", "How to bake a cake"],
      p: [["Octopuses are some of the cleverest animals in the sea.", "They can open jars to get the food inside.", "Some can find their way through mazes."],
          ["Others collect shells and use them as hiding places.", "Scientists say octopuses may even remember faces."]],
      qs: [
        { q: "What is the main idea?", c: ["Octopuses are very clever.", "Octopuses can open jars.", "Octopuses live in shells."], key: ["main idea"], ev: ["cleverest animals"],
          why: "“Octopuses are very clever” covers ALL the details: jars, mazes, shells and faces.",
          think: ["The title and the first sentence say octopuses are clever. That could be the umbrella!",
                  "Opening jars? That's a detail. Mazes, shells, remembering faces: more details. They all show how clever octopuses are.",
                  "Does “Octopuses are very clever” cover ALL of them? Yes! It's the umbrella ☂️."] },
        { q: "Which detail shows octopuses are clever?", c: ["They can open jars.", "They live in the sea.", "They are soft."], key: ["detail", "clever"], ev: ["open jars"], why: "Opening a jar to get food takes smarts!" },
        { q: "Which sentence is a DETAIL, not the main idea?", c: ["Some can find their way through mazes.", "Octopuses are very clever animals.", "This text is about clever octopuses."], key: ["DETAIL"], ev: ["mazes"],
          why: "Mazes is one small fact under the umbrella." }
      ] },
    B: { title: "Why We Need Trees", emoji: "🌳", scene: "🌳🐦🍎🐿️", words: [["oxygen", "the part of air we need to breathe"], ["shade", "a cool spot out of the sun"]],
      predict: ["Facts about trees", "A story about a robot", "How to play soccer"],
      p: [["Trees help people and animals in many ways.", "They give off oxygen, the air we need to breathe."],
          ["Birds and squirrels build homes in their branches.", "Many trees give us fruit, like apples and oranges.", "On hot days, their shade keeps us cool."]],
      qs: [
        { q: "What is the main idea?", c: ["Trees help people and animals in many ways.", "Birds live in trees.", "Apples grow on trees."], key: ["main idea"], ev: ["in many ways"], why: "It covers all the details: air, homes, fruit and shade." },
        { q: "Which detail tells how trees help ANIMALS?", c: ["Birds and squirrels build homes in their branches.", "Many trees give us fruit.", "Their shade keeps us cool."], key: ["detail", "ANIMALS"], ev: ["build homes"], why: "Birds and squirrels are animals that live in trees." },
        { q: "What is oxygen?", c: ["the air we need to breathe", "a kind of fruit", "a bird's home"], key: ["oxygen"], ev: ["give off oxygen"], why: "“…oxygen, the air we need to breathe.”" },
        { q: "Which would be the BEST new title?", c: ["Trees Are Great Helpers", "Apples Are Tasty", "How Squirrels Sleep"], key: ["BEST", "title"], ev: ["in many ways"], why: "A good title matches the main idea, not just one detail." }
      ] } },

  { id: "cause", belt: 2, emoji: "🔗", title: "Cause & Effect", sticker: "🎨", cross: true,
    goal: "I can tell why something happened and what happened because of it.",
    tip: "Cause = WHY it happened. Effect = WHAT happened. Look for because, so, since, as a result.",
    cards: [
      ["🔗", "Two linked parts", "A CAUSE is WHY something happens. An EFFECT is WHAT happens."],
      ["🌧️", "Example", "It rained (cause 💧) → so the game was cancelled (effect ⚾❌)."],
      ["🔤", "Clue words", "because · so · since · as a result. “Because” points to the cause!"]
    ],
    check: { q: "“Tom was tired because he stayed up late.” What is the CAUSE?", c: ["He stayed up late.", "Tom was tired.", "Tom went to school."] },
    A: { title: "The Spilled Paint", emoji: "🎨", scene: "🎨🐕🐾🧽", words: [["scrub", "rub hard to clean"]],
      predict: ["A pet makes a mess.", "A family goes camping.", "A kid wins a prize."],
      p: [["Ella was painting a picture in the kitchen.", "Her puppy, Max, wagged his tail so hard that he knocked over the paint."],
          ["Blue paint spilled all over the floor.", "Max stepped in it, so there were blue paw prints everywhere!"],
          ["Because the floor was such a mess, Ella and Mom had to scrub it for an hour."]],
      qs: [
        { q: "Why did the paint spill?", c: ["Max knocked it over with his tail.", "Ella dropped it.", "Mom moved it."], key: ["paint", "spill"], ev: ["knocked over the paint"],
          why: "Cause: Max's wagging tail. Effect: the paint spilled.",
          think: ["WHY asks for a CAUSE. What made the paint spill?",
                  "I find “he knocked over the paint”. What made that happen? Max wagged his tail so hard!",
                  "Cause: Max's wagging tail 🐕. Effect: the paint spilled 🎨."] },
        { q: "What was the EFFECT of Max stepping in the paint?", c: ["blue paw prints everywhere", "Max took a nap", "the picture was finished"], key: ["EFFECT", "stepping"], ev: ["paw prints"], why: "The word “so” leads to the effect: blue paw prints everywhere." },
        { q: "Why did Ella and Mom scrub the floor?", c: ["The floor was a big mess.", "It was cleaning day.", "Max asked them to."], key: ["scrub", "floor"], ev: ["Because the floor"], why: "“Because the floor was such a mess…”: because points to the cause." }
      ] },
    B: { title: "Why Leaves Change Color", emoji: "🍂", scene: "🍂🍁🌳☀️", words: [["chlorophyll", "the green stuff in leaves that makes food from sunlight"]],
      predict: ["Facts about fall leaves", "A story about a ghost", "How to build a kite"],
      p: [["In the fall, the days get shorter and colder.", "Because there is less sunlight, trees stop making the green stuff in their leaves called chlorophyll."],
          ["When the green fades, other colors can be seen.", "As a result, leaves turn yellow, orange and red."],
          ["Soon the leaves dry up, so they fall to the ground."]],
      qs: [
        { q: "Why do trees stop making chlorophyll in the fall?", c: ["There is less sunlight.", "It rains too much.", "The leaves are red."], key: ["chlorophyll", "fall"], ev: ["less sunlight"], why: "“Because there is less sunlight, trees stop making…”" },
        { q: "What is the EFFECT when the green fades?", c: ["Other colors can be seen.", "The tree grows taller.", "The days get longer."], key: ["EFFECT", "green"], ev: ["other colors can be seen"], why: "“When the green fades, other colors can be seen.”" },
        { q: "Why do the leaves fall to the ground?", c: ["They dry up.", "Birds pull them off.", "The wind is warm."], key: ["leaves", "fall"], ev: ["dry up"], why: "“Soon the leaves dry up, so they fall to the ground.”" },
        { q: "Which clue words show cause and effect in this text?", c: ["because, as a result, so", "first, next, last", "who, what, where"], key: ["clue words"], ev: ["As a result"], why: "Because, as a result and so all link a cause to an effect." }
      ] } },

  { id: "search", belt: 2, emoji: "🧩", title: "Think & Search", sticker: "⛺", cross: true,
    goal: "I can put together answers from more than one place.",
    tip: "Some answers are in pieces. Find EVERY piece, then put them together.",
    cards: [
      ["🧩", "Puzzle-piece answers", "Some answers are NOT in one sentence. The pieces are spread out like a puzzle."],
      ["🔍", "Think & Search", "Find each piece in the text, then put them together for your answer."],
      ["🚩", "Question clues", "Words like “two”, “both”, “all” and “how many in all” often mean you need more than one sentence."]
    ],
    check: { q: "A question asks for TWO things. What should you do?", c: ["Look for pieces in different sentences", "Read only the first sentence", "Use just one piece"] },
    A: { title: "Camp Pinecone", emoji: "⛺", scene: "⛺🛶🏹🔥", words: [["archery", "shooting arrows at a target"], ["canoe", "a long, thin boat you paddle"]],
      predict: ["A girl goes to summer camp.", "A boy goes to the dentist.", "A dog digs a hole."],
      p: [["On the first day of camp, Jada learned to paddle a canoe."],
          ["The next day, she tried archery and hit the target twice."],
          ["On the last night, the campers sat by the fire and sang songs."],
          ["Jada's favorite part was the canoe, because she saw a turtle sunning on a log."]],
      qs: [
        { q: "Name TWO things Jada did at camp.", c: ["paddled a canoe and tried archery", "swam and rode horses", "baked cookies and painted"], key: ["TWO"], ev: ["paddle a canoe", "tried archery"],
          why: "Piece 1: she paddled a canoe. Piece 2: she tried archery. Put them together!",
          think: ["TWO things! This is a Think & Search question. The pieces may be in different places. 🧩",
                  "Piece 1, first day: she learned to paddle a canoe. Piece 2, next day: she tried archery.",
                  "I put my pieces together: canoe AND archery!"] },
        { q: "How many times did Jada hit the target?", c: ["twice", "once", "three times"], key: ["target"], ev: ["target twice"], why: "“…hit the target twice.” Twice means two times." },
        { q: "What was Jada's favorite part, and why?", c: ["the canoe, because she saw a turtle", "archery, because she won", "the fire, because of the songs"], key: ["favorite"], ev: ["favorite part"],
          why: "Her favorite was the canoe because she saw a turtle sunning on a log." }
      ] },
    B: { title: "The Food Drive", emoji: "🥫", scene: "🥫📦🍝❤️", words: [["food drive", "when people collect food to give to others"], ["food bank", "a place that gives food to families who need it"]],
      predict: ["A school helps people.", "A school goes to the moon.", "A school has a snow day."],
      p: [["Hill School held a food drive to help families in town."],
          ["On Monday, the second graders brought 40 cans of soup.", "On Tuesday, the third graders brought 60 boxes of pasta."],
          ["Mr. Lee's class made posters to tell everyone about it."],
          ["At the end of the week, all the food went to the town food bank."]],
      qs: [
        { q: "Which TWO grades brought food?", c: ["second and third graders", "first and fifth graders", "only the third graders"], key: ["TWO", "grades"], ev: ["second graders brought", "third graders brought"], why: "Piece 1: second graders (soup). Piece 2: third graders (pasta)." },
        { q: "How many cans and boxes did they bring in all?", c: ["100", "40", "60"], key: ["in all"], ev: ["40 cans", "60 boxes"], why: "40 cans + 60 boxes = 100. You needed BOTH pieces!" },
        { q: "Why did Hill School hold the food drive?", c: ["to help families in town", "to win a prize", "to fill the classroom"], key: ["Why", "food drive"], ev: ["help families in town"], why: "“…a food drive to help families in town.”" },
        { q: "Where did the food go at the end?", c: ["the town food bank", "Mr. Lee's class", "the cafeteria"], key: ["end"], ev: ["town food bank"], why: "“…all the food went to the town food bank.”" }
      ] } },

  /* ===================== BLUE BELT ===================== */
  { id: "infer", belt: 3, emoji: "🧠", title: "Read Between the Lines", sticker: "💡", cross: true,
    goal: "I can use text clues and what I know to make an inference.",
    tip: "Clues from the text ➕ what I know 🟰 inference. Say: “I think ___ because the text says ___.”",
    cards: [
      ["🤫", "The author doesn't tell everything", "Sometimes you have to figure it out yourself. That's called making an INFERENCE."],
      ["➕", "The recipe", "Clues from the text ➕ what I already know 🟰 inference 💡"],
      ["🧥", "Example", "“Sam put on his coat, hat and mittens.” Clue: warm clothes. I know: people wear those when it's cold. Inference: it's cold outside!"],
      ["🗣️", "Say it with proof", "“I think ___ because the text says ___.”"]
    ],
    check: { q: "An inference comes from…", c: ["text clues + what I know", "just guessing", "only the pictures"] },
    A: { title: "The Empty Bowl", emoji: "🥣", scene: "🥣🐈🐟💧", words: [["trail", "a line of marks to follow"]],
      predict: ["A mystery at home", "A trip to the moon", "A soccer game"],
      p: [["When Nora came home, the fish bowl was empty.", "Her cat, Pepper, was sitting next to it, licking her lips."],
          ["Little drops of water made a trail across the table to Pepper's paws.", "Pepper would not look Nora in the eye."]],
      qs: [
        { q: "What most likely happened to the fish?", c: ["Pepper the cat took it.", "The fish went to school.", "Nora gave it away."], key: ["happened", "fish"], ev: ["licking her lips", "trail across the table"],
          why: "The text never says it! Clues (licking lips, water trail) + what you know (cats like fish) = Pepper took it.",
          think: ["The story never SAYS what happened to the fish. I have to infer! 🧠",
                  "Clue: Pepper is licking her lips. Clue: a trail of water goes right to her paws. What I know: cats love to catch fish.",
                  "Clues ➕ what I know 🟰 Pepper probably took the fish!"] },
        { q: "How do you think Pepper feels?", c: ["guilty", "proud of a drawing", "sleepy"], key: ["Pepper", "feels"], ev: ["would not look"], why: "She won't look Nora in the eye. People and pets do that when they feel guilty!" },
        { q: "Which clue shows the water came from the bowl?", c: ["Drops made a trail across the table.", "Nora came home.", "Pepper is a cat."], key: ["clue", "water"], ev: ["trail across the table"], why: "The trail of drops leads from the bowl to Pepper." }
      ] },
    B: { title: "Field Day", emoji: "🏃", scene: "🏃‍♀️🏅🌤️🏁", words: [["grinned", "smiled a big smile"]],
      predict: ["A girl in a big race", "A girl at the library", "A girl baking cookies"],
      p: [["Rosa tied her shoes tight and stretched her legs.", "She stared at the finish line and took a deep breath."],
          ["When the whistle blew, she shot forward like a rocket.", "At the end, Rosa held up a shiny medal and grinned from ear to ear."]],
      qs: [
        { q: "What is Rosa about to do at the start?", c: ["run a race", "take a nap", "eat lunch"], key: ["start"], ev: ["finish line"], why: "Clues: tied shoes, stretched, finish line. You know those mean a race!" },
        { q: "How does Rosa probably feel at the start?", c: ["nervous but ready", "bored", "angry at a friend"], key: ["feel", "start"], ev: ["deep breath"], why: "A deep breath before a race shows she's nervous but ready." },
        { q: "How did the race end for Rosa?", c: ["She won a medal.", "She fell down.", "She went home early."], key: ["end"], ev: ["shiny medal"], why: "She held up a shiny medal. You can infer she won!" },
        { q: "Which words help you know Rosa is happy?", c: ["grinned from ear to ear", "tied her shoes", "the whistle blew"], key: ["happy"], ev: ["grinned from ear to ear"], why: "A grin from ear to ear is a huge smile." }
      ] } },

  { id: "character", belt: 3, emoji: "🎭", title: "Character Detective", sticker: "🦁", cross: true,
    goal: "I can describe a character's traits and feelings with proof.",
    tip: "Watch what a character SAYS, DOES and THINKS. Traits last; feelings change.",
    cards: [
      ["😊", "Feelings change", "Feelings like happy, scared or nervous can change fast."],
      ["🦁", "Traits last", "Traits are what a character is like most of the time: brave, kind, honest, bossy."],
      ["👀", "Watch closely", "Find traits by watching what a character SAYS, DOES and THINKS."],
      ["📌", "Prove it", "“Leo is kind because he shared his lunch.”"]
    ],
    check: { q: "Which one is a character TRAIT?", c: ["brave", "Tuesday", "a red hat"] },
    A: { title: "The New Kid", emoji: "🎒", scene: "🎒🏫🤝😊", words: [["tightly", "very hard, not letting go"]],
      predict: ["A kid's first day at a new school", "A kid on a pirate ship", "A kid at the doctor"],
      p: [["Ravi stood alone by the door on his first day at a new school.", "He held his backpack straps tightly."],
          ["Kim walked over and smiled.", "“Hi! Want to sit with us at lunch?” she asked.", "She showed Ravi where the library was, too."],
          ["By the end of the day, Ravi was laughing with his new friends."]],
      qs: [
        { q: "Which word best describes Kim?", c: ["friendly", "shy", "bossy"], key: ["describes", "Kim"], ev: ["sit with us"],
          why: "Kim is friendly because she invited Ravi to lunch and showed him the library.",
          think: ["A trait is what someone is like. I'll watch what Kim SAYS and DOES. 👀",
                  "She smiled. She asked Ravi to sit with them at lunch. She showed him the library.",
                  "Someone who does all that is friendly! Kim is friendly because she invited Ravi to sit with her."] },
        { q: "How did Ravi feel at the start?", c: ["nervous", "excited", "angry"], key: ["Ravi", "start"], ev: ["straps tightly"], why: "He stood alone, holding his straps tightly. Those are clues he felt nervous." },
        { q: "How did Ravi's feelings change?", c: ["from nervous to happy", "from happy to sad", "they never changed"], key: ["feelings", "change"], ev: ["laughing with his new friends"], why: "Nervous at the door → laughing with friends at the end." }
      ] },
    B: { title: "The Broken Vase", emoji: "🏺", scene: "🏺⚽😬🤗", words: [["pounded", "beat hard and fast"]],
      predict: ["A boy makes a mistake.", "A boy finds a dinosaur.", "A boy plants a tree."],
      p: [["Jack kicked his soccer ball inside even though Mom said not to.", "Crash! Grandma's blue vase broke into pieces."],
          ["Jack's heart pounded.", "He could hide the pieces, but that didn't feel right."],
          ["He walked to the kitchen and said, “Mom, I broke the vase. I'm really sorry.”", "Mom hugged him and said, “Thank you for telling the truth.”"]],
      qs: [
        { q: "Which trait does Jack show at the end?", c: ["honest", "sneaky", "lazy"], key: ["trait", "end"], ev: ["I broke the vase"], why: "He told Mom the truth. That shows he is honest." },
        { q: "How did Jack feel right after the vase broke?", c: ["scared", "proud", "sleepy"], key: ["feel", "vase"], ev: ["heart pounded"], why: "His heart pounded. That's how scared feels!" },
        { q: "What did Jack think about doing first?", c: ["hiding the pieces", "buying a new vase", "calling Grandma"], key: ["think"], ev: ["hide the pieces"], why: "“He could hide the pieces, but that didn't feel right.”" },
        { q: "Why did Mom thank Jack?", c: ["He told the truth.", "He played soccer.", "He cleaned his room."], key: ["Mom", "thank"], ev: ["telling the truth"], why: "“Thank you for telling the truth.”" }
      ] } },

  { id: "rap", belt: 3, emoji: "🎤", title: "Answer in a Full Sentence", sticker: "🎤", cross: true,
    goal: "I can answer with R.A.P.: Restate, Answer, Prove.",
    tip: "R.A.P.: Restate the question, Answer it, Prove it with the text.",
    cards: [
      ["🎤", "Use the R.A.P. plan", "When you write an answer, use R.A.P.: Restate, Answer, Prove."],
      ["🔁", "R: Restate", "Turn the question into the start of your answer. “Why was Ali late?” → “Ali was late because…”"],
      ["✅", "A: Answer", "Finish the sentence with the right answer."],
      ["📌", "P: Prove", "Add proof from the text: “The text says…”"]
    ],
    check: { q: "What does the R in R.A.P. stand for?", c: ["Restate the question", "Run fast", "Read the title"] },
    A: { title: "The Garden Robot", emoji: "🤖", scene: "🤖🌱💧🔋", words: [["droopy", "hanging down, not standing up"], ["charged", "filled with power"]],
      predict: ["A robot helps in a garden.", "A robot goes to the moon.", "A robot bakes cookies."],
      p: [["Lena built a small robot named Sprout.", "Sprout's job was to water the plants every morning."],
          ["One day, the plants looked droopy and dry.", "Lena checked Sprout and found that its battery was dead."],
          ["She charged the battery, and soon Sprout was rolling and watering again."]],
      qs: [
        { type: "build", q: "Why were the plants droopy?", ev: ["battery was dead"],
          parts: [{ l: "Restate", c: ["The plants were droopy because", "I like plants because", "Robots are fun because"] },
                  { l: "Answer", c: ["Sprout's battery was dead.", "it was raining.", "Lena was on vacation."] },
                  { l: "Prove", c: ["The text says Lena found that its battery was dead.", "The text says Sprout is a robot.", "I think plants are green."] }],
          why: "The plants were droopy because Sprout's battery was dead. The text says Lena found that its battery was dead.",
          think: ["R: I turn the question into a start: “The plants were droopy because…”",
                  "A: Sprout's battery was dead, so it couldn't water them.",
                  "P: My proof: “Lena found that its battery was dead.”",
                  "My full R.A.P. answer is ready! 🎤"] },
        { q: "What was Sprout's job?", c: ["to water the plants", "to cook breakfast", "to sweep the floor"], key: ["job"], ev: ["Sprout's job"], why: "“Sprout's job was to water the plants every morning.”" },
        { type: "build", q: "How did Lena fix Sprout?", ev: ["charged the battery"],
          parts: [{ l: "Restate", c: ["Lena fixed Sprout by", "Sprout fixed Lena by", "The plants were"] },
                  { l: "Answer", c: ["charging its battery.", "painting it red.", "buying a new robot."] },
                  { l: "Prove", c: ["The text says she charged the battery.", "The text says the plants looked dry.", "The text says Lena built a robot."] }],
          why: "Lena fixed Sprout by charging its battery. The text says she charged the battery." }
      ] },
    B: { title: "The Library Card", emoji: "📚", scene: "📚🪪🦈😴", words: [["scientist", "a person who studies how things work"]],
      predict: ["A boy gets something special at the library.", "A boy goes skiing.", "A boy loses his dog."],
      p: [["Marco turned eight on Friday.", "His mom took him to the library to get his very own library card."],
          ["He picked out three books about sharks.", "He chose sharks because he wanted to be an ocean scientist someday."],
          ["That night, Marco read under his blanket until he fell asleep."]],
      qs: [
        { type: "build", q: "Why did Marco choose books about sharks?", ev: ["ocean scientist"],
          parts: [{ l: "Restate", c: ["Marco chose shark books because", "Sharks are big because", "The library is open because"] },
                  { l: "Answer", c: ["he wants to be an ocean scientist.", "his mom told him to.", "they were the only books."] },
                  { l: "Prove", c: ["The text says he wanted to be an ocean scientist someday.", "The text says he turned eight.", "The text says he fell asleep."] }],
          why: "Marco chose shark books because he wants to be an ocean scientist. The text says so!" },
        { q: "When did Marco get his library card?", c: ["after he turned eight", "on his first birthday", "on a school trip"], key: ["library card"], ev: ["turned eight"], why: "He turned eight, and his mom took him to get his card." },
        { type: "build", q: "What did Marco do that night?", ev: ["under his blanket"],
          parts: [{ l: "Restate", c: ["That night, Marco", "In the morning, Mom", "The sharks"] },
                  { l: "Answer", c: ["read under his blanket until he fell asleep.", "went swimming.", "lost his library card."] },
                  { l: "Prove", c: ["The text says he read under his blanket.", "The text says he picked three books.", "The text says the library was big."] }],
          why: "That night, Marco read under his blanket until he fell asleep." },
        { q: "How many books did Marco pick?", c: ["three", "one", "eight"], key: ["How many", "books"], ev: ["three books"], why: "“He picked out three books about sharks.” Eight is his age, a trap!" }
      ] } },

  { id: "summary", belt: 3, emoji: "✋", title: "Sum It Up", sticker: "🖐️", cross: true,
    goal: "I can summarize a story with Somebody, Wanted, But, So, Then.",
    tip: "Use the story hand ✋: Somebody · Wanted · But · So · Then. Only the most important parts!",
    cards: [
      ["📝", "Short and important", "A summary tells the MOST important parts in just a few words. Not every detail!"],
      ["✋", "The story hand", "One finger each: Somebody · Wanted · But · So · Then."],
      ["🐐", "Example", "Somebody: Goldie the goat. Wanted: an apple on a tree. But: it was too high. So: she stood on a box. Then: she got the apple!"]
    ],
    check: { q: "A good summary…", c: ["tells only the most important parts", "tells every single detail", "copies the whole story"] },
    A: { title: "Tiko's Tall Tower", emoji: "🧱", scene: "🧱🐕🚪📸", words: [["cheered", "shouted happily"]],
      predict: ["A boy builds something.", "A boy goes fishing.", "A boy rides a horse."],
      p: [["Tiko wanted to build the tallest block tower in his class."],
          ["But every time it got tall, his little dog bumped it and it fell down."],
          ["So Tiko moved to his bedroom and closed the door."],
          ["Then he built a tower taller than his teacher, and the class cheered when he showed them a photo."]],
      qs: [
        { type: "build", q: "Summarize the story with your story hand ✋.", ev: ["tallest block tower"],
          parts: [{ l: "Somebody", c: ["Tiko", "his teacher", "the dog"] },
                  { l: "Wanted", c: ["wanted to build the tallest tower,", "wanted to walk the dog,", "wanted to take a photo,"] },
                  { l: "But", c: ["but his dog kept knocking it down,", "but he had no blocks,", "but it rained,"] },
                  { l: "So", c: ["so he moved to his bedroom and closed the door.", "so he gave up.", "so he yelled at the dog."] },
                  { l: "Then", c: ["Then he built a super tall tower!", "Then he went to sleep.", "Then the dog built it."] }],
          why: "Tiko wanted to build the tallest tower, but his dog kept knocking it down, so he moved to his bedroom. Then he built a super tall tower!",
          think: ["Somebody: who is the main character? Tiko! 👦",
                  "Wanted: he wanted to build the tallest tower.",
                  "But: what was the problem? His dog kept knocking it down.",
                  "So: how did he fix it? He moved to his bedroom and closed the door.",
                  "Then: how did it end? He built a super tall tower!",
                  "Five fingers, five short parts. That's my summary ✋."] },
        { q: "Which is the BEST summary?", c: ["Tiko's dog kept knocking down his tower, so he built it in his room, and it was super tall.", "Tiko has a dog, a teacher, blocks, a bedroom and a door.", "The class cheered."], key: ["BEST", "summary"], ev: ["Then he built"],
          why: "It has the problem, the fix and the ending, and nothing extra." },
        { q: "Which detail is NOT needed in a summary?", c: ["He showed the class a photo.", "Tiko wanted a tall tower.", "His dog knocked it down."], key: ["NOT", "summary"], ev: ["showed them a photo"], why: "The photo is a small detail. The story still makes sense without it." }
      ] },
    B: { title: "Luna Learns to Swim", emoji: "🏊", scene: "🏊‍♀️🌊🫧🎉", words: [["afraid", "scared"], ["coach", "a person who teaches a sport"]],
      predict: ["A girl learns something hard.", "A girl visits a castle.", "A girl finds a puppy."],
      p: [["Luna wanted to swim across the pool with her big cousins."],
          ["But she was afraid to put her face in the water."],
          ["So her swim coach taught her to blow bubbles, a little more each day."],
          ["Then, at the end of summer, Luna swam all the way across, and her cousins cheered."]],
      qs: [
        { type: "build", q: "Summarize the story with your story hand ✋.", ev: ["swim across the pool"],
          parts: [{ l: "Somebody", c: ["Luna", "her coach", "her cousins"] },
                  { l: "Wanted", c: ["wanted to swim across the pool,", "wanted to buy goggles,", "wanted to go home,"] },
                  { l: "But", c: ["but she was afraid to put her face in the water,", "but the pool was closed,", "but she lost her towel,"] },
                  { l: "So", c: ["so her coach taught her to blow bubbles.", "so she quit.", "so her cousins swam for her."] },
                  { l: "Then", c: ["Then she swam all the way across!", "Then she went to bed.", "Then it snowed."] }],
          why: "Luna wanted to swim across, but she was afraid, so her coach taught her to blow bubbles. Then she swam all the way across!" },
        { q: "Which is the BEST summary?", c: ["Luna was afraid to put her face in the water, but she practiced and swam across.", "Luna has big cousins and a coach.", "There is a pool."], key: ["BEST", "summary"], ev: ["swam all the way across"], why: "It tells the problem, how she fixed it and the ending." },
        { q: "What was Luna's problem?", c: ["She was afraid to put her face in the water.", "She lost her goggles.", "The pool was closed."], key: ["problem"], ev: ["afraid to put her face"], why: "“But she was afraid to put her face in the water.” The But finger is the problem!" },
        { q: "How did the story end?", c: ["Luna swam across the pool.", "Luna quit swimming.", "The coach swam across."], key: ["end"], ev: ["swam all the way across"], why: "At the end of summer, Luna swam all the way across." }
      ] } },

  /* ===================== GOLD BELT ===================== */
  { id: "champion", belt: 4, emoji: "🏆", title: "Reading Champion Challenge", sticker: "🥇", cross: true, champ: true,
    goal: "I can use all my reading tools on my own.",
    tip: "Use your whole toolbox: preview, picture it, stop and check, read the question twice, find proof, cross out, check.",
    cards: [
      ["🧰", "Your toolbox", "You've learned 14 reading tools. Now you'll use them all on your own!"],
      ["📋", "Before reading", "Look at the title and picture. Predict. Learn the new words."],
      ["📖", "While reading", "Make a movie in your mind. Stop and check after each part."],
      ["✅", "Answering", "Read the question twice. Find the proof. Cross out traps. Think: right there, think & search, or between the lines?"]
    ],
    check: { q: "What is the BEST thing to do before you answer a question?", c: ["Find proof in the text", "Pick the shortest answer", "Answer before reading"] },
    A: { title: "The Storm Lighthouse", emoji: "🗼", scene: "⛈️🗼⛵🪔", words: [["lighthouse", "a tall tower with a bright light that warns boats"], ["harbor", "a safe place for boats near land"], ["lantern", "a lamp you can carry"]],
      predict: ["Someone helps a boat in a storm.", "Someone has a picnic.", "Someone learns to ride a bike."],
      p: [["Old Mr. Grant had kept the lighthouse on Gull Rock for forty years.", "Every night he climbed 120 steps to light the great lamp."],
          ["One stormy evening, the power went out across the whole island.", "Mr. Grant's granddaughter, June, was visiting.", "Through the window, she spotted a small fishing boat tossing in the huge waves."],
          ["“The lamp is dark!” June cried. “They can't see the rocks!”", "Mr. Grant grabbed an old oil lantern from the shelf.", "Together they hurried up the steps and hung it in the window."],
          ["The tiny light glowed through the rain.", "The boat turned away from the rocks and sailed safely into the harbor."]],
      stops: [{ after: 1, q: "Stop and check: what is the problem?", c: ["The lamp is dark and a boat is in danger.", "June is hungry.", "Mr. Grant lost his keys."] }],
      qs: [
        { q: "Why did the lighthouse lamp go dark?", c: ["The power went out on the island.", "Mr. Grant forgot to light it.", "June turned it off."], key: ["lamp", "dark"], ev: ["power went out"], why: "Cause and effect: the power went out across the whole island." },
        { q: "What does “tossing” mean in this story?", c: ["moving roughly up and down", "sleeping quietly", "throwing a ball"], key: ["tossing"], ev: ["tossing in the huge waves"], why: "Context clue: huge waves would make a small boat move roughly up and down." },
        { q: "Which words best describe June?", c: ["alert and caring", "lazy and bored", "rude and bossy"], key: ["describe", "June"], ev: ["spotted a small fishing boat", "can't see the rocks"], why: "She noticed the boat and worried about the people on it." },
        { type: "order", q: "Put the events in order.", items: ["The power went out.", "June spotted a boat.", "They hung up the lantern.", "The boat sailed into the harbor."], ev: ["sailed safely"], why: "Power out → boat spotted → lantern hung → boat safe." },
        { q: "What lesson does this story teach?", c: ["Even a small light can help in a big way.", "Never visit your grandpa.", "Boats should be fast."], key: ["lesson"], ev: ["tiny light glowed"], why: "A tiny lantern saved the boat. Small things can make a big difference!" }
      ] },
    B: { title: "Sea Turtles on the Move", emoji: "🐢", scene: "🐢🏖️🌕🌊", words: [["hatchlings", "babies that just came out of eggs"], ["confuse", "mix up"]],
      predict: ["Facts about sea turtles", "A story about a race car", "How to make pancakes"],
      p: [["Sea turtles spend almost their whole lives in the ocean.", "But mother sea turtles come back to the beach to lay their eggs."],
          ["A mother turtle digs a hole in the warm sand with her back flippers.", "She lays about 100 eggs, covers them and returns to the sea."],
          ["About two months later, the baby turtles, called hatchlings, break out of their shells.", "They crawl toward the brightest light, which is usually the moon shining on the water."],
          ["Bright lights from houses can confuse hatchlings, so some beach towns turn off their lights at night.", "This helps more baby turtles reach the ocean safely."]],
      qs: [
        { q: "What is this text mostly about?", c: ["how sea turtles lay eggs and how the babies reach the ocean", "why the moon is bright", "how to build a beach house"], key: ["mostly about"], ev: ["lay their eggs"], why: "That main idea covers every part: eggs, hatching and getting to the sea." },
        { q: "What are hatchlings?", c: ["baby turtles", "turtle eggs", "beach towns"], key: ["hatchlings"], ev: ["called hatchlings"], why: "“…the baby turtles, called hatchlings…”" },
        { q: "Why do some beach towns turn off their lights at night?", c: ["so the hatchlings don't get confused", "to save money on toys", "because turtles are scared of the dark"], key: ["towns", "lights"], ev: ["confuse hatchlings"], why: "Bright lights can confuse hatchlings, so towns turn them off." },
        { q: "About how many eggs are laid, and how long until they hatch?", c: ["about 100 eggs; about two months", "10 eggs; one week", "1,000 eggs; one year"], key: ["eggs", "how long"], ev: ["about 100 eggs", "two months later"], why: "Think & Search: 100 eggs is in part 2, two months is in part 3." },
        { type: "build", q: "Why do hatchlings crawl toward the water at night?", ev: ["brightest light"],
          parts: [{ l: "Restate", c: ["Hatchlings crawl toward the water because", "Turtles are green because", "The beach is sandy because"] },
                  { l: "Answer", c: ["they follow the brightest light, the moon on the water.", "they are hungry for sand.", "their mother calls them."] },
                  { l: "Prove", c: ["The text says they crawl toward the brightest light.", "The text says turtles have flippers.", "The text says towns have houses."] }],
          why: "Hatchlings crawl toward the water because they follow the brightest light. The text says so!" }
      ] } }
];

// Trophies (rg_trophies)
var RG_TROPHIES = [
  { id: "first",    icon: "👟", name: "First Workout",    how: "Finish your first lesson" },
  { id: "proof10",  icon: "📌", name: "Proof Pro",        how: "Find 10 proof sentences on your own" },
  { id: "perfect",  icon: "💯", name: "Perfect Reps",     how: "Get 3 stars on a lesson with no help" },
  { id: "white",    icon: "🤍", name: "White Belt",       how: "Finish the White Belt lessons" },
  { id: "yellow",   icon: "💛", name: "Yellow Belt",      how: "Finish the Yellow Belt lessons" },
  { id: "green",    icon: "💚", name: "Green Belt",       how: "Finish the Green Belt lessons" },
  { id: "blue",     icon: "💙", name: "Blue Belt",        how: "Finish the Blue Belt lessons" },
  { id: "champion", icon: "🏆", name: "Reading Champion", how: "Pass the Reading Champion Challenge" },
  { id: "allstars", icon: "🌟", name: "All-Star Reader",  how: "Get 3 stars on every lesson" }
];
