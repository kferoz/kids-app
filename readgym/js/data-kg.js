/* ============================================================
   Koa's Reading Gym — KINDERGARTEN track (listen & think)
   Same lesson shape as data.js, plus:
     pics: [emoji per part]   a picture beside each sentence
   Koa reads every part, question and choice aloud; choices start
   with a picture. Guided questions skip the key-word step
   (tap: "none") unless a lesson teaches question words.
   CCSS RL.K.1–3, RL.K.7, RI.K.1–2, L.K.4 (with prompting & support).
   Trophy ids start "k-" so they never clash with the Grade 3 track.
   ============================================================ */
var RGK_BELTS = [
  { id: "white",  name: "White Belt",  emoji: "🤍", color: "#adb5bd", level: "Listening ears" },
  { id: "yellow", name: "Yellow Belt", emoji: "💛", color: "#fab005", level: "Story finder" },
  { id: "green",  name: "Green Belt",  emoji: "💚", color: "#40c057", level: "Thinking reader" },
  { id: "blue",   name: "Blue Belt",   emoji: "💙", color: "#339af0", level: "Super thinker" },
  { id: "gold",   name: "Gold Belt",   emoji: "🏆", color: "#f08c00", level: "Super Listener" }
];

var RGK_LESSONS = [
  /* ===================== WHITE BELT ===================== */
  { id: "k-pictures", belt: 0, emoji: "🖼️", title: "Pictures Help Us", sticker: "🖍️", tap: "none",
    goal: "I can use the pictures to understand a story.",
    tip: "Look at the pictures and listen to the words. They tell the story together.",
    cards: [
      ["🖼️", "Pictures tell the story", "Look at the pictures. They show who is in the story and what happens."],
      ["👂", "Listen with your ears", "Listen to every word. Words tell the story too."],
      ["👀", "Look and listen", "Look and listen together, and the story makes sense!"]
    ],
    check: { q: "What can help you understand a story?", c: ["🖼️ the pictures", "🙈 closing your eyes", "🏃 running around"] },
    A: { title: "Bo's Ball", emoji: "⚽", scene: "👦⚽🦆", words: [], predict: ["⚽ A boy plays with a ball.", "🎂 A cat has a party.", "🚀 A rocket goes to space."],
      pics: ["⚽", "🦵", "🦆"],
      p: [["Bo has a red ball."], ["Bo kicks the ball."], ["The ball goes in the pond!"]],
      qs: [
        { q: "What does Bo have?", c: ["⚽ a red ball", "🪁 a kite", "🧸 a teddy"], key: ["Bo"], ev: ["red ball"], why: "The picture and the words say: Bo has a red ball.",
          think: ["What does Bo have? Let me look and listen.", "The first picture is a ball. The words say: Bo has a red ball.", "So Bo has a red ball! ⚽"] },
        { q: "Where does the ball go?", c: ["🦆 in the pond", "🌳 up a tree", "🏠 in the house"], key: ["ball"], ev: ["in the pond"], why: "The ball goes in the pond!" },
        { q: "What does Bo do to the ball?", c: ["🦵 kicks it", "🍽️ eats it", "🛏️ sleeps on it"], key: ["Bo"], ev: ["kicks"], why: "Bo kicks the ball." }
      ] },
    B: { title: "Mia's Hat", emoji: "👒", scene: "👧👒🌬️", words: [], predict: ["👒 A girl and her hat", "🐟 A fish that swims", "🚒 A fire truck"],
      pics: ["👒", "🌬️", "🎈", "🙌"],
      p: [["Mia has a big hat."], ["The wind blows."], ["The hat flies up, up, up!"], ["Dad catches the hat."]],
      qs: [
        { q: "What does Mia have?", c: ["👒 a big hat", "👟 a shoe", "🎒 a bag"], key: ["Mia"], ev: ["big hat"], why: "Mia has a big hat." },
        { q: "What makes the hat fly?", c: ["🌬️ the wind", "🐶 a dog", "🌧️ the rain"], key: ["hat"], ev: ["wind blows"], why: "The wind blows, and the hat flies up!" },
        { q: "Who catches the hat?", c: ["👨 Dad", "👧 Mia", "🐦 a bird"], key: ["catches"], ev: ["Dad catches"], why: "Dad catches the hat." }
      ] } },

  { id: "k-who", belt: 0, emoji: "🐻", title: "Who Is in the Story?", sticker: "🐻", tap: "none",
    goal: "I can name the characters in a story.",
    tip: "Characters are the people or animals in the story. Ask: WHO is it about?",
    cards: [
      ["🐻", "Characters", "The people or animals in a story are called characters."],
      ["❓", "Ask WHO", "WHO is in the story? WHO is it about?"],
      ["⭐", "The main character", "The main character is in the story the most."]
    ],
    check: { q: "Characters are…", c: ["🐻 the people or animals in a story", "🎨 the colors", "📄 the pages"] },
    A: { title: "Duck and Frog", emoji: "🦆", scene: "🦆🐸🌿", words: [], predict: ["🦆🐸 Two animal friends", "🚗 A fast car", "🍕 Making pizza"],
      pics: ["🦆", "🐸", "🎉"],
      p: [["Duck sat by the pond."], ["Frog hopped over to say hi."], ["Duck and Frog played all day."]],
      qs: [
        { q: "Who sat by the pond?", c: ["🦆 Duck", "🐸 Frog", "🐱 Cat"], key: ["pond"], ev: ["Duck sat"], why: "Duck sat by the pond.",
          think: ["WHO sat by the pond? I'm looking for a character.", "The first part says: Duck sat by the pond. And the picture is a duck!", "So the answer is Duck! 🦆"] },
        { q: "Who hopped over to say hi?", c: ["🐸 Frog", "🦆 Duck", "🐰 Bunny"], key: ["hopped"], ev: ["Frog hopped"], why: "Frog hopped over to say hi." },
        { q: "Who are the characters in this story?", c: ["🦆🐸 Duck and Frog", "🐶🐱 Dog and Cat", "🐻🐝 Bear and Bee"], key: ["characters"], ev: ["played all day"], why: "Duck and Frog are the characters." }
      ] },
    B: { title: "Pig Bakes a Cake", emoji: "🐷", scene: "🐷🐔🐄🎂", words: [], predict: ["🐷 A pig makes something", "🚀 A trip to the moon", "🏊 A swim race"],
      pics: ["🐷", "🥚", "🥛", "🎂"],
      p: [["Pig wanted to bake a cake."], ["Hen gave Pig some eggs."], ["Cow gave Pig some milk."], ["They all ate the cake!"]],
      qs: [
        { q: "Who wanted to bake a cake?", c: ["🐷 Pig", "🐔 Hen", "🐄 Cow"], key: ["cake"], ev: ["Pig wanted"], why: "Pig wanted to bake a cake." },
        { q: "Who gave Pig some eggs?", c: ["🐔 Hen", "🐄 Cow", "🐶 Dog"], key: ["eggs"], ev: ["some eggs"], why: "Hen gave Pig some eggs." },
        { q: "Who is the main character?", c: ["🐷 Pig", "🐄 Cow", "🐱 Cat"], key: ["main"], ev: ["Pig wanted"], why: "Pig is in the story the most. Pig is the main character!" }
      ] } },

  { id: "k-where", belt: 0, emoji: "🏡", title: "Where Is the Story?", sticker: "🏖️", tap: "none",
    goal: "I can tell where a story happens.",
    tip: "The setting is WHERE the story happens. Look and listen for a place.",
    cards: [
      ["🏡", "Setting", "The setting is WHERE a story happens."],
      ["🖼️", "Look for places", "Words and pictures show the place: a park, a house, the sea."],
      ["❓", "Ask WHERE", "Where are they? Look and listen for a place."]
    ],
    check: { q: "The setting is…", c: ["📍 where the story happens", "👤 who is in the story", "📏 how long it is"] },
    A: { title: "Day at the Beach", emoji: "🏖️", scene: "🏖️🏰🌊", words: [], predict: ["🏖️ A day at the beach", "❄️ A snowy day", "🏫 A day at school"],
      pics: ["🏖️", "🏰", "🌊"],
      p: [["Sam and Mom went to the beach."], ["Sam made a sand castle."], ["A big wave came and splashed it!"]],
      qs: [
        { q: "Where did Sam and Mom go?", c: ["🏖️ the beach", "🏫 school", "🛒 the store"], key: ["Mom"], ev: ["went to the beach"], why: "They went to the beach. That's the setting!",
          think: ["WHERE did they go? I'm listening for a place.", "The first part says: Sam and Mom went to the beach.", "A beach is a place. The setting is the beach! 🏖️"] },
        { q: "What did Sam make?", c: ["🏰 a sand castle", "🪁 a kite", "🍪 a cookie"], key: ["make"], ev: ["sand castle"], why: "Sam made a sand castle." },
        { q: "What splashed the castle?", c: ["🌊 a big wave", "🐕 a dog", "🌧️ the rain"], key: ["splashed"], ev: ["big wave"], why: "A big wave came and splashed it!" }
      ] },
    B: { title: "Owl in the Woods", emoji: "🦉", scene: "🦉🌲🌙", words: [], predict: ["🦉 An owl and where it lives", "🐠 A fish tank", "🎈 A birthday"],
      pics: ["🌲", "😴", "🌙"],
      p: [["Owl lives in the woods."], ["Owl sleeps in a tree all day."], ["At night, Owl flies over the trees."]],
      qs: [
        { q: "Where does Owl live?", c: ["🌲 in the woods", "🏙️ in a city", "🌊 in the sea"], key: ["live"], ev: ["lives in the woods"], why: "Owl lives in the woods." },
        { q: "Where does Owl sleep?", c: ["🌳 in a tree", "🛏️ in a bed", "🚗 in a car"], key: ["sleep"], ev: ["sleeps in a tree"], why: "Owl sleeps in a tree all day." },
        { q: "When does Owl fly?", c: ["🌙 at night", "☀️ in the morning", "🍽️ at lunch"], key: ["fly"], ev: ["At night"], why: "At night, Owl flies over the trees." }
      ] } },

  /* ===================== YELLOW BELT ===================== */
  { id: "k-find", belt: 1, emoji: "🔎", title: "Find It in the Story", sticker: "🔍", tap: "none",
    goal: "I can find the part of the story that tells the answer.",
    tip: "The answer is in the story. Find the part that tells you, and point to it!",
    cards: [
      ["🔎", "Answers are in the story", "The story holds the answers. We can find them!"],
      ["👉", "Point to it", "Find the part of the story that tells you. Point to it!"],
      ["👂", "Listen again", "Not sure? Tap 🔊 and listen to that part again."]
    ],
    check: { q: "Where can you find the answer?", c: ["📖 in the story", "🛏️ under the bed", "👟 in my shoe"] },
    A: { title: "The Little Seed", emoji: "🌱", scene: "👧🌱🌼", words: [], predict: ["🌱 Growing a plant", "🚂 A train ride", "🐧 A penguin swims"],
      pics: ["🪴", "💧", "🌼"],
      p: [["Ana put a seed in a pot."], ["She gave it water every day."], ["Soon a yellow flower grew!"]],
      qs: [
        { q: "Where did Ana put the seed?", c: ["🪴 in a pot", "👟 in a shoe", "🛁 in the bath"], key: ["seed"], ev: ["in a pot"], why: "Ana put a seed in a pot.",
          think: ["Where did Ana put the seed? The answer is in the story. Let me find it!", "Part 1 says: Ana put a seed in a pot. I'll point to it. 👉", "So the answer is in a pot! 🪴"] },
        { q: "What did Ana give the seed?", c: ["💧 water", "🍕 pizza", "🧸 a toy"], key: ["give"], ev: ["water every day"], why: "She gave it water every day." },
        { q: "What color was the flower?", c: ["💛 yellow", "❤️ red", "💙 blue"], key: ["flower"], ev: ["yellow flower"], why: "Soon a yellow flower grew!" }
      ] },
    B: { title: "Max the Puppy", emoji: "🐶", scene: "🐶🕳️🦴", words: [], predict: ["🐶 A puppy", "🦒 A tall giraffe", "🚲 A bike ride"],
      pics: ["🐶", "🕳️", "🦴"],
      p: [["Max is a little brown puppy."], ["Max likes to dig holes."], ["One day, Max dug up an old bone!"]],
      qs: [
        { q: "What color is Max?", c: ["🤎 brown", "🖤 black", "🤍 white"], key: ["color"], ev: ["brown puppy"], why: "Max is a little brown puppy." },
        { q: "What does Max like to do?", c: ["🕳️ dig holes", "🏊 swim", "📚 read books"], key: ["like"], ev: ["dig holes"], why: "Max likes to dig holes." },
        { q: "What did Max dig up?", c: ["🦴 a bone", "🧸 a teddy", "👑 a crown"], key: ["dig"], ev: ["old bone"], why: "Max dug up an old bone!" }
      ] } },

  { id: "k-qwords", belt: 1, emoji: "❓", title: "Who? What? Where?", sticker: "🗝️", tap: "qword",
    goal: "I know what WHO, WHAT and WHERE questions ask.",
    tip: "WHO asks about a person or animal. WHAT asks about a thing. WHERE asks about a place.",
    cards: [
      ["👤", "WHO", "WHO asks about a person or an animal."],
      ["📦", "WHAT", "WHAT asks about a thing, or what someone does."],
      ["📍", "WHERE", "WHERE asks about a place."]
    ],
    check: { q: "Which word asks about a PLACE?", c: ["📍 Where", "👤 Who", "📦 What"] },
    A: { title: "Rain Day", emoji: "☔", scene: "🌧️👢💦", words: [], predict: ["☔ Playing in the rain", "🌵 A hot desert", "🎹 A music class"],
      pics: ["🌧️", "👢", "💦"],
      p: [["It was raining at the park."], ["Lily put on her red boots."], ["She jumped in a big puddle. Splash!"]],
      qs: [
        { q: "Where was it raining?", c: ["🛝 at the park", "🏫 at school", "🛏️ in bed"], key: ["raining"], ev: ["at the park"], why: "WHERE asks for a place: at the park.",
          think: ["The first word is WHERE. Where asks about a place!", "The story says: It was raining at the park.", "A park is a place. The answer is at the park! 🛝"] },
        { q: "Who put on red boots?", c: ["👧 Lily", "👨 Dad", "🐶 a dog"], key: ["boots"], ev: ["red boots"], why: "WHO asks for a person: Lily." },
        { q: "What did Lily jump in?", c: ["💦 a puddle", "🛏️ a bed", "🍂 some leaves"], key: ["jump"], ev: ["big puddle"], why: "WHAT asks for a thing: a puddle." }
      ] },
    B: { title: "The Bus Ride", emoji: "🚌", scene: "🚌👫🚒", words: [], predict: ["🚌 A ride on a bus", "🐳 A whale swims", "🍰 Baking a cake"],
      pics: ["🚌", "👫", "🚒"],
      p: [["Ben rides the bus to school."], ["He sits next to his friend Kim."], ["They see a fire truck go by!"]],
      qs: [
        { q: "Where does Ben ride the bus to?", c: ["🏫 school", "🏖️ the beach", "🏥 the doctor"], key: ["bus"], ev: ["to school"], why: "WHERE: to school." },
        { q: "Who sits next to Ben?", c: ["👧 Kim", "👵 Grandma", "🐱 a cat"], key: ["sits"], ev: ["friend Kim"], why: "WHO: his friend Kim." },
        { q: "What do they see?", c: ["🚒 a fire truck", "🚀 a rocket", "🐘 an elephant"], key: ["see"], ev: ["fire truck"], why: "WHAT: a fire truck." }
      ] } },

  { id: "k-order", belt: 1, emoji: "🪜", title: "First, Next, Last", sticker: "🥪", tap: "none",
    goal: "I can tell what happened first, next and last.",
    tip: "First = the beginning. Next = the middle. Last = the end.",
    cards: [
      ["1️⃣", "First", "What happens at the beginning."],
      ["2️⃣", "Next", "What happens in the middle."],
      ["3️⃣", "Last", "What happens at the end."]
    ],
    check: { q: "Which word tells about the END?", c: ["3️⃣ Last", "1️⃣ First", "2️⃣ Next"] },
    A: { title: "Making a Sandwich", emoji: "🥪", scene: "👨🍞🥪", words: [], predict: ["🥪 Making food", "⚽ A soccer game", "🌙 Going to the moon"],
      pics: ["🍞", "🥜", "🔪"],
      p: [["First, Dad got two slices of bread."], ["Next, he spread peanut butter."], ["Last, he cut it in half, and we ate it!"]],
      qs: [
        { type: "order", q: "Put the steps in order.", items: ["🍞 get the bread", "🥜 spread peanut butter", "🔪 cut it in half"], ev: ["Last, he cut"], why: "First bread, next peanut butter, last cut it!",
          think: ["I listen for First, Next and Last.", "First, Dad got bread. Next, he spread peanut butter.", "Last, he cut it in half. Yum! 🥪"] },
        { q: "What did Dad do first?", c: ["🍞 got the bread", "🔪 cut it", "😋 ate it"], key: ["first"], ev: ["First, Dad"], why: "First, Dad got two slices of bread." },
        { q: "What did Dad spread?", c: ["🥜 peanut butter", "🍓 jam", "🍯 honey"], key: ["spread"], ev: ["peanut butter"], why: "Next, he spread peanut butter." }
      ] },
    B: { title: "Bedtime", emoji: "🛏️", scene: "👦🛁🪥📖", words: [], predict: ["🛏️ Getting ready for bed", "🏄 Surfing", "🎪 A circus"],
      pics: ["🛁", "🪥", "📖"],
      p: [["First, Leo takes a bath."], ["Next, he brushes his teeth."], ["Last, Mom reads him a story."]],
      qs: [
        { type: "order", q: "Put Leo's bedtime in order.", items: ["🛁 take a bath", "🪥 brush teeth", "📖 read a story"], ev: ["Last, Mom"], why: "Bath, then teeth, then a story!" },
        { q: "What does Leo do after his bath?", c: ["🪥 brushes his teeth", "📖 reads", "🍳 cooks"], key: ["after"], ev: ["brushes his teeth"], why: "Next, he brushes his teeth." },
        { q: "What happens last?", c: ["📖 Mom reads a story", "🛁 Leo takes a bath", "🪥 Leo brushes his teeth"], key: ["last"], ev: ["Mom reads"], why: "Last, Mom reads him a story." }
      ] } },

  /* ===================== GREEN BELT ===================== */
  { id: "k-feel", belt: 2, emoji: "😊", title: "How Do They Feel?", sticker: "💖", tap: "none",
    goal: "I can tell how a character feels and why.",
    tip: "Look for clues like crying or smiling. Then ask: WHY do they feel that way?",
    cards: [
      ["😊", "Characters have feelings", "Happy, sad, mad, scared, surprised…"],
      ["🔍", "Look for clues", "Faces in pictures, and words like smiled or cried, show feelings."],
      ["💬", "Ask WHY", "Ask: WHY do they feel that way?"]
    ],
    check: { q: "Which one is a feeling?", c: ["😢 sad", "🍎 apple", "🚗 car"] },
    A: { title: "The Lost Teddy", emoji: "🧸", scene: "👧🧸🛏️", words: [], predict: ["🧸 A lost toy", "🚀 A space trip", "🐠 A fish tank"],
      pics: ["🔍", "😢", "😊"],
      p: [["Zoe could not find her teddy."], ["She cried and cried."], ["Then she found Teddy under the bed! She smiled."]],
      qs: [
        { q: "How did Zoe feel when Teddy was lost?", c: ["😢 sad", "😄 happy", "😴 sleepy"], key: ["Zoe"], ev: ["cried and cried"], why: "She cried. People cry when they are sad.",
          think: ["How did Zoe feel? Let me look for clues.", "The story says she cried and cried. People cry when they are sad.", "So Zoe felt sad. 😢"] },
        { q: "How did Zoe feel at the end?", c: ["😊 happy", "😢 sad", "😠 mad"], key: ["end"], ev: ["She smiled"], why: "She smiled. Smiling means happy!" },
        { q: "Why did Zoe feel happy?", c: ["🧸 she found Teddy", "🍦 she got ice cream", "🎈 she got a balloon"], key: ["happy"], ev: ["found Teddy"], why: "She found Teddy under the bed!" }
      ] },
    B: { title: "Thunder", emoji: "⛈️", scene: "⛈️👦👴", words: [], predict: ["⛈️ A stormy night", "🏖️ A sunny beach", "🎂 A party"],
      pics: ["⛈️", "🙈", "🤗"],
      p: [["Boom! Thunder shook the window."], ["Raj hid under his blanket."], ["Grandpa gave him a hug, and Raj felt safe."]],
      qs: [
        { q: "How did Raj feel when he heard the thunder?", c: ["😨 scared", "😄 happy", "😴 sleepy"], key: ["thunder"], ev: ["hid under his blanket"], why: "He hid under his blanket. He was scared." },
        { q: "What did Grandpa do?", c: ["🤗 gave him a hug", "📺 turned on the TV", "🍪 baked cookies"], key: ["Grandpa"], ev: ["gave him a hug"], why: "Grandpa gave him a hug." },
        { q: "How did Raj feel at the end?", c: ["😌 safe", "😨 scared", "😠 mad"], key: ["end"], ev: ["felt safe"], why: "After the hug, Raj felt safe." }
      ] } },

  { id: "k-predict", belt: 2, emoji: "🔮", title: "What Will Happen Next?", sticker: "🔮", tap: "none",
    goal: "I can use clues to guess what happens next.",
    tip: "A prediction is a smart guess. Use the clues in the words and pictures.",
    cards: [
      ["🔮", "Predict", "A prediction is a smart guess about what will happen next."],
      ["🔍", "Use clues", "Look at the pictures and listen to the words for clues."],
      ["✅", "Check it", "Keep listening to see if you were right!"]
    ],
    check: { q: "A prediction is…", c: ["🔮 a smart guess about what happens next", "📕 the end of the book", "🖼️ a picture"] },
    A: { title: "Ice Cream Day", emoji: "🍦", scene: "👧🍦☀️", words: [], predict: ["🍦 Ice cream on a hot day", "⛄ Making a snowman", "🚂 A train"],
      pics: ["🍦", "☀️", "💧"],
      p: [["Nina got a big ice cream cone."], ["The sun was very hot."], ["Drip, drip! The ice cream started to melt."]],
      qs: [
        { q: "What will happen next to the ice cream?", c: ["🫠 it will melt more", "❄️ it will freeze", "🌳 it will grow"], key: ["ice cream"], ev: ["started to melt"], why: "The hot sun melts ice cream, so it will melt more.",
          think: ["What will happen next? Let me find clues.", "Clue: the sun is very hot. Clue: the ice cream started to melt.", "Hot sun melts ice cream! I predict it will melt more. 🫠"] },
        { q: "Why is the ice cream melting?", c: ["☀️ the sun is hot", "🌧️ it is raining", "🌙 it is night"], key: ["melting"], ev: ["sun was very hot"], why: "The sun was very hot." },
        { q: "What should Nina do next?", c: ["😋 eat it fast", "🛏️ go to sleep", "🧥 put on a coat"], key: ["Nina"], ev: ["Drip, drip"], why: "It's melting, so she should eat it fast!" }
      ] },
    B: { title: "The Tall Tower", emoji: "🧱", scene: "👦🧱〰️", words: [], predict: ["🧱 Building with blocks", "🐝 A bee", "🌧️ A rainy day"],
      pics: ["🧱", "☝️", "〰️"],
      p: [["Kai built a tall tower with blocks."], ["He put one more block on top."], ["The tower began to wobble."]],
      qs: [
        { q: "What will happen next?", c: ["💥 the tower will fall", "🚀 it will fly away", "🌱 it will grow"], key: ["next"], ev: ["wobble"], why: "A wobbly tower will fall down!" },
        { q: "Which clue helped you guess?", c: ["〰️ The tower began to wobble.", "🧱 Kai used blocks.", "👦 Kai is a boy."], key: ["clue"], ev: ["began to wobble"], why: "Wobbling is a clue that it will fall." },
        { q: "What did Kai build with?", c: ["🧱 blocks", "🥄 spoons", "📚 books"], key: ["build"], ev: ["with blocks"], why: "Kai built a tall tower with blocks." }
      ] } },

  { id: "k-facts", belt: 2, emoji: "🐸", title: "Fact Finder", sticker: "🐸", tap: "none",
    goal: "I can tell what a fact book is about.",
    tip: "The topic is what the WHOLE book is about. Every page tells a fact about it.",
    cards: [
      ["📘", "Fact books", "Some books teach us true facts about real things."],
      ["🎯", "The topic", "The topic is what the whole book is about."],
      ["⭐", "Facts", "Each page tells a fact about the topic."]
    ],
    check: { q: "A fact book tells…", c: ["📘 true facts about real things", "🧚 a pretend story", "😂 a joke"] },
    A: { title: "Frogs", emoji: "🐸", scene: "🐸🪰💧", words: [["tadpole", "a baby frog that swims"]], predict: ["🐸 Facts about frogs", "🚗 Facts about cars", "🍰 How to bake"],
      pics: ["🐸", "🪰", "💧"],
      p: [["Frogs can jump very far."], ["Frogs eat bugs with their long, sticky tongue."], ["Baby frogs are called tadpoles."]],
      qs: [
        { q: "What is this book about?", c: ["🐸 frogs", "🐶 dogs", "🚗 cars"], key: ["book"], ev: ["jump very far"], why: "Every part is about frogs. The topic is frogs!",
          think: ["What is the WHOLE book about? Let me listen to every part.", "Frogs jump. Frogs eat bugs. Baby frogs are tadpoles. Every part is about frogs!", "The topic is frogs! 🐸"] },
        { q: "What do frogs eat?", c: ["🪰 bugs", "🍕 pizza", "🥕 carrots"], key: ["eat"], ev: ["eat bugs"], why: "Frogs eat bugs with their sticky tongue." },
        { q: "What are baby frogs called?", c: ["💧 tadpoles", "🐶 puppies", "🐥 chicks"], key: ["baby"], ev: ["tadpoles"], why: "Baby frogs are called tadpoles." }
      ] },
    B: { title: "Bees", emoji: "🐝", scene: "🐝🌸🍯", words: [["hive", "a home for bees"]], predict: ["🐝 Facts about bees", "🦖 A dinosaur story", "🚀 Rockets"],
      pics: ["🏠", "🌸", "🍯"],
      p: [["Bees live in a hive."], ["Bees fly from flower to flower."], ["Bees make sweet honey."]],
      qs: [
        { q: "What is this book about?", c: ["🐝 bees", "🦆 ducks", "🌧️ rain"], key: ["book"], ev: ["live in a hive"], why: "Every part is about bees!" },
        { q: "Where do bees live?", c: ["🏠 in a hive", "🌊 in the sea", "🕳️ in a hole"], key: ["live"], ev: ["in a hive"], why: "Bees live in a hive." },
        { q: "What do bees make?", c: ["🍯 honey", "🥛 milk", "🍞 bread"], key: ["make"], ev: ["sweet honey"], why: "Bees make sweet honey." }
      ] } },

  /* ===================== BLUE BELT ===================== */
  { id: "k-words", belt: 3, emoji: "🔤", title: "New Words", sticker: "🐋", tap: "none",
    goal: "I can use pictures and other words to learn a new word.",
    tip: "Hear a new word? Look at the picture and listen to the words around it.",
    cards: [
      ["🔤", "A new word!", "Sometimes we hear a word we don't know."],
      ["🖼️", "Use the picture", "The picture can show what the word means."],
      ["👂", "Listen around it", "The other words help too!"]
    ],
    check: { q: "What can help you learn a new word?", c: ["🖼️ the picture and the other words", "🙉 covering your ears", "⏩ skipping it"] },
    A: { title: "The Huge Whale", emoji: "🐋", scene: "🐋🚢🌊", words: [], predict: ["🐋 A big sea animal", "🐜 A tiny ant", "🏎️ A race car"],
      pics: ["🐋", "🚢", "🌊"],
      p: [["Look! A huge whale is in the sea."], ["It is bigger than a boat!"], ["It is the biggest animal of all."]],
      qs: [
        { q: "What does huge mean?", c: ["🐋 very big", "🐜 very small", "🏎️ very fast"], key: ["huge"], ev: ["bigger than a boat"], why: "It is bigger than a boat, so huge means very big!",
          think: ["Huge? That's a new word. Let me be a word detective!", "The next part says: It is bigger than a boat! And the whale picture is giant.", "So huge must mean very big! 🐋"] },
        { q: "Where is the whale?", c: ["🌊 in the sea", "🌲 in the woods", "🏠 in a house"], key: ["whale"], ev: ["in the sea"], why: "A huge whale is in the sea." },
        { q: "What is the whale bigger than?", c: ["🚢 a boat", "🏔️ a mountain", "🌍 the world"], key: ["bigger"], ev: ["bigger than a boat"], why: "It is bigger than a boat!" }
      ] },
    B: { title: "Sleepy Cat", emoji: "🐱", scene: "🐱🥱😴", words: [], predict: ["🐱 A tired cat", "🐟 A fish party", "🚒 A fire truck"],
      pics: ["🐱", "🥱", "😴"],
      p: [["Tom the cat was very drowsy."], ["He yawned a big yawn."], ["Then he curled up and fell asleep."]],
      qs: [
        { q: "What does drowsy mean?", c: ["😴 sleepy", "🍔 hungry", "💦 wet"], key: ["drowsy"], ev: ["fell asleep"], why: "He yawned and fell asleep, so drowsy means sleepy." },
        { q: "What did Tom do?", c: ["🥱 yawned", "🎤 sang", "🏃 ran"], key: ["Tom"], ev: ["yawned a big yawn"], why: "He yawned a big yawn." },
        { q: "Which clue helped you know drowsy?", c: ["🥱 He yawned.", "🐱 Tom is a cat.", "🏠 He has a home."], key: ["clue"], ev: ["yawned a big yawn"], why: "Yawning is a clue for sleepy!" }
      ] } },

  { id: "k-think", belt: 3, emoji: "💡", title: "Think About It", sticker: "💡", tap: "none",
    goal: "I can use clues to figure out what the story doesn't say.",
    tip: "Clues + what I already know = a good idea!",
    cards: [
      ["🕵️", "Be a detective", "Sometimes the story doesn't tell everything. We use clues!"],
      ["🧥", "Example", "Mia put on her coat and mittens. Clue! It must be cold outside."],
      ["💡", "Clues + what I know", "Clues + what I already know = a good idea!"]
    ],
    check: { q: "Sam put on a raincoat. Why?", c: ["🌧️ it is raining", "☀️ it is hot", "🌙 it is bedtime"] },
    A: { title: "Surprise!", emoji: "🎂", scene: "🎂🎈🎉", words: [], predict: ["🎉 A party", "🏫 A school day", "🌧️ A rainy walk"],
      pics: ["🎂", "🎈", "🎉"],
      p: [["Mom put candles on a cake."], ["Balloons filled the room."], ["Everyone yelled, “Surprise, Leo!”"]],
      qs: [
        { q: "What is happening?", c: ["🎂 a birthday party", "🏫 a school day", "🛏️ bedtime"], key: ["happening"], ev: ["candles"], why: "Candles, balloons and SURPRISE! It's a birthday party.",
          think: ["The story doesn't say birthday. Let me use clues!", "Clues: candles on a cake, balloons, and everyone yells SURPRISE!", "I know cakes with candles are for birthdays. It's Leo's birthday party! 🎂"] },
        { q: "Whose party is it?", c: ["👦 Leo's", "👩 Mom's", "🐶 the dog's"], key: ["party"], ev: ["Surprise, Leo"], why: "Everyone yelled, “Surprise, Leo!”" },
        { q: "How does Leo probably feel?", c: ["😄 happy", "😢 sad", "😠 mad"], key: ["Leo"], ev: ["Surprise, Leo"], why: "A surprise party makes you happy!" }
      ] },
    B: { title: "Muddy Paws", emoji: "🐾", scene: "🐕🐾🟫", words: [], predict: ["🐾 A messy mystery", "🧁 Baking cupcakes", "🚀 A rocket"],
      pics: ["🟫", "🐾", "🐕"],
      p: [["Mud was all over the kitchen floor."], ["There were little paw prints too."], ["Buddy the dog sat in the corner, all wet and muddy."]],
      qs: [
        { q: "Who made the mess?", c: ["🐕 Buddy the dog", "👨 Dad", "🐟 a fish"], key: ["mess"], ev: ["wet and muddy"], why: "Clues: paw prints, and Buddy is muddy!" },
        { q: "Which clue helped you?", c: ["🐾 the paw prints", "🍳 the kitchen", "📐 the corner"], key: ["clue"], ev: ["paw prints"], why: "Paw prints come from a dog's feet!" },
        { q: "What was Buddy doing before?", c: ["🌧️ playing in the mud", "🛏️ sleeping in bed", "🛁 taking a clean bath"], key: ["Buddy"], ev: ["wet and muddy"], why: "He is wet and muddy, so he played in the mud." }
      ] } },

  { id: "k-retell", belt: 3, emoji: "🖐️", title: "Retell It", sticker: "🥕", tap: "none",
    goal: "I can retell a story: beginning, middle and end.",
    tip: "Retell in order: Beginning, Middle, End. Just the big parts!",
    cards: [
      ["🔁", "Retell", "Retell means telling the story again in your own words."],
      ["🅱️", "Beginning, Middle, End", "What happened at the beginning? In the middle? At the end?"],
      ["👍", "Just the big parts", "Tell the most important parts, in order."]
    ],
    check: { q: "When you retell, you tell…", c: ["🔁 the story in order", "🆕 a new story", "🔚 only the last word"] },
    A: { title: "Bunny's Carrot", emoji: "🐰", scene: "🐰🥕🐭", words: [], predict: ["🐰 A hungry bunny", "🚂 A train trip", "⚽ A soccer game"],
      pics: ["🐰", "🥕", "🐭"],
      p: [["Bunny was very hungry."], ["She found a giant carrot, but it was stuck!"], ["Mouse helped her pull, and out it came!"]],
      qs: [
        { type: "build", q: "Retell the story.", ev: ["very hungry"],
          parts: [{ l: "Beginning", c: ["🐰 Bunny was hungry.", "😴 Bunny was sleepy.", "🐭 Mouse was hungry."] },
                  { l: "Middle", c: ["🥕 She found a carrot, but it was stuck.", "⚽ She found a ball.", "🏫 She went to school."] },
                  { l: "End", c: ["🐭 Mouse helped pull it out.", "🏃 The carrot ran away.", "🛏️ Bunny went to bed."] }],
          why: "Bunny was hungry. She found a carrot, but it was stuck. Mouse helped pull it out.",
          think: ["Beginning: Bunny was hungry.", "Middle: she found a giant carrot, but it was stuck!", "End: Mouse helped her pull it out.", "Beginning, middle, end. I retold the story! 🖐️"] },
        { q: "Who helped Bunny?", c: ["🐭 Mouse", "🐻 Bear", "🐸 Frog"], key: ["helped"], ev: ["Mouse helped"], why: "Mouse helped her pull." },
        { q: "What was the problem?", c: ["🥕 the carrot was stuck", "🌧️ it was raining", "🗺️ Bunny was lost"], key: ["problem"], ev: ["it was stuck"], why: "The carrot was stuck!" }
      ] },
    B: { title: "Pia's Kite", emoji: "🪁", scene: "👧🪁🌳", words: [], predict: ["🪁 A kite adventure", "🐟 A fish", "🎻 A music show"],
      pics: ["🪁", "🌳", "👧"],
      p: [["Pia had a new kite."], ["The wind blew it into a tree."], ["Pia's big sister climbed up and got it back."]],
      qs: [
        { type: "build", q: "Retell the story.", ev: ["new kite"],
          parts: [{ l: "Beginning", c: ["🪁 Pia had a new kite.", "🚲 Pia had a new bike.", "🐶 Pia had a dog."] },
                  { l: "Middle", c: ["🌳 The wind blew it into a tree.", "🌊 It fell in the sea.", "🔥 It got burned."] },
                  { l: "End", c: ["👧 Her sister got it back.", "😢 She never saw it again.", "🏠 She went home."] }],
          why: "Pia had a new kite. The wind blew it into a tree. Her sister got it back." },
        { q: "What was the problem?", c: ["🌳 the kite got stuck in a tree", "💔 the kite broke", "🤒 Pia was sick"], key: ["problem"], ev: ["into a tree"], why: "The wind blew the kite into a tree." },
        { q: "How did the story end?", c: ["👧 her sister got the kite back", "🌬️ the kite flew away", "😢 Pia cried all day"], key: ["end"], ev: ["got it back"], why: "Her big sister climbed up and got it back." }
      ] } },

  /* ===================== GOLD BELT ===================== */
  { id: "k-champion", belt: 4, emoji: "🏆", title: "Super Listener Challenge", sticker: "🥇", tap: "none", champ: true,
    goal: "I can use all my listening tools on my own.",
    tip: "Look and listen, find it in the story, and think about the clues.",
    cards: [
      ["🧰", "Your tools", "You learned to look, listen, find it and think!"],
      ["👂", "Listen to it all", "Listen to the whole story and look at the pictures."],
      ["🔎", "Find it", "Find the part of the story that tells you."],
      ["💡", "Think", "Use clues to answer the tricky ones."]
    ],
    check: { q: "What can you do if you're not sure?", c: ["🔊 listen to that part again", "⚡ guess fast", "🛑 stop"] },
    A: { title: "Snow Day", emoji: "❄️", scene: "❄️👦👧⛄", words: [], predict: ["❄️ Playing in the snow", "🏖️ A beach day", "🚀 A rocket"],
      pics: ["❄️", "🏃", "⛄", "☕"],
      p: [["Snow fell all night."], ["In the morning, Eli and Ava ran outside."], ["First they made a snowman, and then they had a snowball fight."], ["Last, they drank warm cocoa by the fire."]],
      qs: [
        { q: "Who ran outside?", c: ["👦👧 Eli and Ava", "🐶 the dog", "👵 Grandma"], key: ["outside"], ev: ["Eli and Ava"], why: "Eli and Ava ran outside." },
        { q: "Where did they play?", c: ["❄️ outside in the snow", "🏖️ at the beach", "🛝 in the gym"], key: ["play"], ev: ["ran outside"], why: "They ran outside into the snow." },
        { type: "order", q: "Put what they did in order.", items: ["⛄ made a snowman", "❄️ had a snowball fight", "☕ drank warm cocoa"], ev: ["Last, they drank"], why: "Snowman, snowball fight, then cocoa!" },
        { q: "How did the kids probably feel?", c: ["😄 happy and excited", "😢 sad", "😴 bored"], key: ["feel"], ev: ["ran outside"], why: "They RAN outside to play in the snow. They were excited!" }
      ] },
    B: { title: "Sea Turtles", emoji: "🐢", scene: "🐢🌊🏖️", words: [], predict: ["🐢 Facts about sea turtles", "🦁 A lion story", "🚗 Cars"],
      pics: ["🌊", "🐢", "🥚", "🏖️"],
      p: [["Sea turtles live in the ocean."], ["They have a hard shell."], ["Mother turtles lay eggs in the sand."], ["Baby turtles crawl to the sea."]],
      qs: [
        { q: "What is this book about?", c: ["🐢 sea turtles", "🐠 fish", "🦀 crabs"], key: ["book"], ev: ["live in the ocean"], why: "Every part is about sea turtles." },
        { q: "Where do mother turtles lay eggs?", c: ["🏖️ in the sand", "🌳 in a tree", "🏠 in a house"], key: ["eggs"], ev: ["in the sand"], why: "Mother turtles lay eggs in the sand." },
        { q: "What do sea turtles have?", c: ["🐢 a hard shell", "🪶 feathers", "🐻 fur"], key: ["have"], ev: ["hard shell"], why: "They have a hard shell." },
        { q: "What do baby turtles do?", c: ["🌊 crawl to the sea", "🕊️ fly away", "🌳 climb trees"], key: ["baby"], ev: ["crawl to the sea"], why: "Baby turtles crawl to the sea." }
      ] } }
];

var RGK_TROPHIES = [
  { id: "k-first",    icon: "👟", name: "First Workout",    how: "Finish your first lesson" },
  { id: "k-proof10",  icon: "👉", name: "Super Finder",     how: "Find the answer in the story 10 times" },
  { id: "k-perfect",  icon: "💯", name: "Perfect Listener", how: "Get 3 stars on a lesson with no help" },
  { id: "k-white",    icon: "🤍", name: "White Belt",       how: "Finish the White Belt lessons" },
  { id: "k-yellow",   icon: "💛", name: "Yellow Belt",      how: "Finish the Yellow Belt lessons" },
  { id: "k-green",    icon: "💚", name: "Green Belt",       how: "Finish the Green Belt lessons" },
  { id: "k-blue",     icon: "💙", name: "Blue Belt",        how: "Finish the Blue Belt lessons" },
  { id: "k-champion", icon: "🏆", name: "Super Listener",   how: "Pass the Super Listener Challenge" },
  { id: "k-allstars", icon: "🌟", name: "All-Star Listener",how: "Get 3 stars on every lesson" }
];
