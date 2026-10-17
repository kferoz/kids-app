/* ============================================================
   Reading Detectives — Curriculum Data
   ------------------------------------------------------------
   A "north star" reading-comprehension journey for GRADE 3.
   Roco the Raccoon 🦝 leads the reader through 15 numbered
   CASES that unlock in order, each teaching one comprehension
   skill and building from beginner to expert:

     1  Who & Where ............ characters & setting
     2  What Happened .......... plot & events
     3  Put It In Order ........ sequence  (+ ordering game)
     4  The Big Idea ........... main idea & details
     5  What Happens Next ...... making predictions
     6  Between the Lines ...... making inferences
     7  Why Did It Happen ...... cause & effect
     8  Secret Word Clues ...... context clues / vocabulary
     9  Same & Different ....... compare & contrast
    10  Fact or Opinion ........ fact vs. opinion
    11  Why Write It ........... author's purpose (PIE)
    12  The Big Lesson ......... theme & summarizing
    13  The Trouble & The Fix .. problem & solution
    14  Nonfiction Detective ... nonfiction text features
    15  The Master Case ........ all skills combined (capstone)

   Each CASE is a list of typed STEPS (`k`):
     teach : { k:'teach', emoji, title, text, say }
             Roco gives the "detective tip" for the skill.
     read  : { k:'read', title, emoji, text, say }
             A leveled passage shown as a "case file" with
             read-aloud. Not scored — it's the evidence.
     pick  : { k:'pick', q, choices, answer, say }
             A comprehension question; `answer` = index.
     order : { k:'order', prompt, items, say }
             Tap the events into the right sequence. `items`
             are stored IN ORDER; the engine scrambles them.

   Passages get longer & richer as the case number grows.
   ============================================================ */

const CASES = [
  /* ---------- CASE 1 — Characters & Setting ---------- */
  {
    n: 1, title: "Who & Where?", skill: "Characters & Setting", emoji: "🔍", sticker: "🔍",
    steps: [
      { k: "teach", emoji: "🦝", title: "Detective Tip: Who & Where",
        text: "Great detectives first find out WHO is in the story (the characters) and WHERE it happens (the setting). Look for names and places!",
        say: "Great detectives first find out who is in the story, the characters, and where it happens, the setting. Look for names and places." },
      { k: "read", title: "The New Puppy", emoji: "🐶🌳",
        text: "Mia sat on her front porch in the warm sunshine. Her new puppy, Pepper, rolled in the soft green grass. Pepper had one black ear and a waggy tail. Mia laughed as Pepper chased a yellow butterfly around the yard.",
        say: "The New Puppy. Mia sat on her front porch in the warm sunshine. Her new puppy, Pepper, rolled in the soft green grass. Pepper had one black ear and a waggy tail. Mia laughed as Pepper chased a yellow butterfly around the yard." },
      { k: "pick", q: "Who is the <b>main character</b>?",
        choices: ["Mia", "The butterfly", "Grandma"], answer: 0, say: "Who is the main character?" },
      { k: "pick", q: "Who is <b>Pepper</b>?",
        choices: ["Mia's puppy", "Mia's friend", "A bird"], answer: 0, say: "Who is Pepper?" },
      { k: "pick", q: "<b>WHERE</b> does the story happen?",
        choices: ["At Mia's home and yard", "At school", "At the beach"], answer: 0, say: "Where does the story happen?" },
      { k: "pick", q: "What did Pepper chase?",
        choices: ["A yellow butterfly", "A red ball", "A cat"], answer: 0, say: "What did Pepper chase?" }
    ]
  },

  /* ---------- CASE 2 — Plot & Events ---------- */
  {
    n: 2, title: "What Happened?", skill: "Plot & Events", emoji: "📓", sticker: "📓",
    steps: [
      { k: "teach", emoji: "🦝", title: "Detective Tip: The Plot",
        text: "The plot is WHAT happens in the story. Watch the actions closely — what do the characters DO?",
        say: "The plot is what happens in the story. Watch the actions closely. What do the characters do?" },
      { k: "read", title: "The Sandcastle", emoji: "🏖️🏰",
        text: "Ben and his sister built a huge sandcastle at the beach. They dug a deep moat all around it. Just then, a big wave rushed up and knocked over one tall tower. Ben felt sad for a second. But then they both laughed and built the castle even taller than before.",
        say: "The Sandcastle. Ben and his sister built a huge sandcastle at the beach. They dug a deep moat all around it. Just then, a big wave rushed up and knocked over one tall tower. Ben felt sad for a second. But then they both laughed and built the castle even taller than before." },
      { k: "pick", q: "What did Ben and his sister <b>build</b>?",
        choices: ["A sandcastle", "A treehouse", "A snowman"], answer: 0, say: "What did Ben and his sister build?" },
      { k: "pick", q: "What <b>knocked over</b> a tower?",
        choices: ["A big wave", "The wind", "A dog"], answer: 0, say: "What knocked over a tower?" },
      { k: "pick", q: "What did they do <b>after</b> the wave?",
        choices: ["Built it even taller", "Went home", "Started to cry"], answer: 0, say: "What did they do after the wave?" }
    ]
  },

  /* ---------- CASE 3 — Sequence ---------- */
  {
    n: 3, title: "Put It In Order", skill: "Sequence of Events", emoji: "🧭", sticker: "🧭",
    steps: [
      { k: "teach", emoji: "🦝", title: "Detective Tip: In Order",
        text: "Stories happen in order: first, next, then, last. Line up the events like clues on a timeline!",
        say: "Stories happen in order. First, next, then, last. Line up the events like clues on a timeline." },
      { k: "read", title: "Making Pancakes", emoji: "🥞👨‍🍳",
        text: "First, Dad cracked the eggs into a big bowl. Next, he stirred in the flour and the milk until it was smooth. Then he poured the batter into a hot pan and watched it bubble. Last, they sat down and ate the warm, fluffy pancakes together.",
        say: "Making Pancakes. First, Dad cracked the eggs into a big bowl. Next, he stirred in the flour and the milk until it was smooth. Then he poured the batter into a hot pan and watched it bubble. Last, they sat down and ate the warm, fluffy pancakes together." },
      { k: "pick", q: "What did Dad do <b>FIRST</b>?",
        choices: ["Cracked the eggs", "Ate the pancakes", "Poured the batter"], answer: 0, say: "What did Dad do first?" },
      { k: "order", prompt: "🕵️ Put the pancake steps in the right order:",
        items: ["Crack the eggs", "Stir in flour and milk", "Pour the batter in the pan", "Eat the pancakes"],
        say: "Tap the pancake steps in the right order." },
      { k: "pick", q: "What happened <b>LAST</b>?",
        choices: ["They ate the pancakes", "Dad cracked eggs", "Dad stirred the flour"], answer: 0, say: "What happened last?" }
    ]
  },

  /* ---------- CASE 4 — Main Idea & Details ---------- */
  {
    n: 4, title: "The Big Idea", skill: "Main Idea & Details", emoji: "💡", sticker: "💡",
    steps: [
      { k: "teach", emoji: "🦝", title: "Detective Tip: The Big Idea",
        text: "The main idea is what the whole passage is MOSTLY about. The small facts that tell more are the details.",
        say: "The main idea is what the whole passage is mostly about. The small facts that tell more are the details." },
      { k: "read", title: "Bats Are Amazing", emoji: "🦇🌙",
        text: "Bats are amazing animals. They are the only mammals that can truly fly. Most bats sleep upside down during the day and wake up at night. In the dark, they make special sounds that bounce back to help them find bugs. Bats even help farmers by eating pests.",
        say: "Bats Are Amazing. Bats are amazing animals. They are the only mammals that can truly fly. Most bats sleep upside down during the day and wake up at night. In the dark, they make special sounds that bounce back to help them find bugs. Bats even help farmers by eating pests." },
      { k: "pick", q: "What is this passage <b>MOSTLY</b> about?",
        choices: ["Bats are amazing animals", "Farmers grow food", "Bugs are tiny"], answer: 0, say: "What is this passage mostly about?" },
      { k: "pick", q: "<b>Detail:</b> When do most bats sleep?",
        choices: ["During the day", "At night", "All the time"], answer: 0, say: "When do most bats sleep?" },
      { k: "pick", q: "<b>Detail:</b> How do bats find bugs in the dark?",
        choices: ["They make sounds that bounce back", "They use bright eyes", "They smell them"], answer: 0, say: "How do bats find bugs in the dark?" }
    ]
  },

  /* ---------- CASE 5 — Predicting ---------- */
  {
    n: 5, title: "What Happens Next?", skill: "Making Predictions", emoji: "🔮", sticker: "🔮",
    steps: [
      { k: "teach", emoji: "🦝", title: "Detective Tip: Predict",
        text: "A smart detective uses clues to PREDICT what will happen next. Ask: what makes sense from the story so far?",
        say: "A smart detective uses clues to predict what will happen next. Ask, what makes sense from the story so far?" },
      { k: "read", title: "Dark Clouds", emoji: "⛅🌧️",
        text: "Lily and Sam were playing soccer in the park. Suddenly, the sky turned dark and gray. A cool wind began to blow the leaves around. They felt a few cold drops of water land on their arms. Lily looked up at the sky and quickly grabbed her jacket.",
        say: "Dark Clouds. Lily and Sam were playing soccer in the park. Suddenly, the sky turned dark and gray. A cool wind began to blow the leaves around. They felt a few cold drops of water land on their arms. Lily looked up at the sky and quickly grabbed her jacket." },
      { k: "pick", q: "What will <b>PROBABLY</b> happen next?",
        choices: ["It will start to rain", "The sun will get hot", "It will snow"], answer: 0, say: "What will probably happen next?" },
      { k: "pick", q: "Which <b>clues</b> helped you predict?",
        choices: ["Dark clouds, wind, and drops", "The green grass", "It was morning"], answer: 0, say: "Which clues helped you predict?" },
      { k: "pick", q: "What should Lily and Sam do next?",
        choices: ["Find cover from the rain", "Take a nap on the field", "Keep playing forever"], answer: 0, say: "What should Lily and Sam do next?" }
    ]
  },

  /* ---------- CASE 6 — Inferences ---------- */
  {
    n: 6, title: "Between the Lines", skill: "Making Inferences", emoji: "🕵️", sticker: "🕵️",
    steps: [
      { k: "teach", emoji: "🦝", title: "Detective Tip: Infer",
        text: "Sometimes a story doesn't tell you everything. Use the clues PLUS what you already know to figure it out. That's an inference!",
        say: "Sometimes a story doesn't tell you everything. Use the clues plus what you already know to figure it out. That is an inference." },
      { k: "read", title: "The Empty Plate", emoji: "🍪🐶",
        text: "When Grandma left the kitchen, the cookie plate was full. When she came back a few minutes later, the plate was completely empty. Rex the dog was under the table, licking his lips and wagging his tail. There were brown cookie crumbs scattered all over the floor beneath him.",
        say: "The Empty Plate. When Grandma left the kitchen, the cookie plate was full. When she came back a few minutes later, the plate was completely empty. Rex the dog was under the table, licking his lips and wagging his tail. There were brown cookie crumbs scattered all over the floor beneath him." },
      { k: "pick", q: "What <b>probably</b> happened to the cookies?",
        choices: ["Rex the dog ate them", "They magically vanished", "Grandma ate them all"], answer: 0, say: "What probably happened to the cookies?" },
      { k: "pick", q: "Which <b>clues</b> tell you that?",
        choices: ["Rex licking his lips and the crumbs", "The empty plate only", "The kitchen was clean"], answer: 0, say: "Which clues tell you that?" },
      { k: "pick", q: "The story never SAYS Rex ate them. How do you know?",
        choices: ["I used clues to infer it", "The story told me", "I guessed with no clues"], answer: 0, say: "The story never says Rex ate them. How do you know?" }
    ]
  },

  /* ---------- CASE 7 — Cause & Effect ---------- */
  {
    n: 7, title: "Why Did It Happen?", skill: "Cause & Effect", emoji: "⚡", sticker: "⚡",
    steps: [
      { k: "teach", emoji: "🦝", title: "Detective Tip: Cause & Effect",
        text: "The CAUSE is why something happens. The EFFECT is what happens because of it. Ask: what made this happen?",
        say: "The cause is why something happens. The effect is what happens because of it. Ask, what made this happen?" },
      { k: "read", title: "The Thirsty Plant", emoji: "🌱💧",
        text: "Ava forgot to water her little flower for a whole week. Day by day, the soil in the pot became dry and cracked. Slowly, the bright green leaves turned brown and began to droop toward the floor. When Ava finally remembered and gave it a big drink of water, the tired plant slowly began to perk back up.",
        say: "The Thirsty Plant. Ava forgot to water her little flower for a whole week. Day by day, the soil in the pot became dry and cracked. Slowly, the bright green leaves turned brown and began to droop toward the floor. When Ava finally remembered and gave it a big drink of water, the tired plant slowly began to perk back up." },
      { k: "pick", q: "<b>WHY</b> did the plant droop? (the cause)",
        choices: ["Ava forgot to water it", "It had too much water", "It was too cold"], answer: 0, say: "Why did the plant droop? That is the cause." },
      { k: "pick", q: "What was the <b>EFFECT</b> of no water?",
        choices: ["The leaves turned brown and drooped", "It grew tall flowers", "It turned blue"], answer: 0, say: "What was the effect of no water?" },
      { k: "pick", q: "What happened <b>because</b> Ava watered it?",
        choices: ["It perked back up", "It fell over", "Nothing changed"], answer: 0, say: "What happened because Ava watered it?" }
    ]
  },

  /* ---------- CASE 8 — Context Clues ---------- */
  {
    n: 8, title: "Secret Word Clues", skill: "Context Clues", emoji: "🔦", sticker: "🔦",
    steps: [
      { k: "teach", emoji: "🦝", title: "Detective Tip: Word Clues",
        text: "When you meet a new word, look at the words around it for clues to its meaning. Those are context clues!",
        say: "When you meet a new word, look at the words around it for clues to its meaning. Those are context clues." },
      { k: "read", title: "The Timid Mouse", emoji: "🐭🧀",
        text: "A timid little mouse hid quietly behind the wall. He was much too shy and scared to come out and play with the other mice. But when a kind cat smiled at him very gently, the mouse felt brave enough to finally peek out from his hiding spot.",
        say: "The Timid Mouse. A timid little mouse hid quietly behind the wall. He was much too shy and scared to come out and play with the other mice. But when a kind cat smiled at him very gently, the mouse felt brave enough to finally peek out from his hiding spot." },
      { k: "pick", q: "What does <b>timid</b> mean?",
        choices: ["Shy and scared", "Big and loud", "Fast and strong"], answer: 0, say: "What does timid mean?" },
      { k: "pick", q: "Which words are the <b>clues</b> for 'timid'?",
        choices: ["shy and scared", "behind the wall", "little mouse"], answer: 0, say: "Which words are the clues for timid?" },
      { k: "pick", q: "What does <b>brave</b> mean here?",
        choices: ["Not afraid", "Very hungry", "Sleepy"], answer: 0, say: "What does brave mean here?" }
    ]
  },

  /* ---------- CASE 9 — Compare & Contrast ---------- */
  {
    n: 9, title: "Same & Different", skill: "Compare & Contrast", emoji: "⚖️", sticker: "⚖️",
    steps: [
      { k: "teach", emoji: "🦝", title: "Detective Tip: Compare",
        text: "Compare two things to see how they are the SAME. Contrast them to see how they are DIFFERENT.",
        say: "Compare two things to see how they are the same. Contrast them to see how they are different." },
      { k: "read", title: "Frogs and Toads", emoji: "🐸🐫",
        text: "Frogs and toads are alike in many ways. They are both amphibians, they both hop, and they both like to eat bugs. But they are different too. A frog has smooth, wet skin and likes to live close to water. A toad has dry, bumpy skin and can live much farther from water.",
        say: "Frogs and Toads. Frogs and toads are alike in many ways. They are both amphibians, they both hop, and they both like to eat bugs. But they are different too. A frog has smooth, wet skin and likes to live close to water. A toad has dry, bumpy skin and can live much farther from water." },
      { k: "pick", q: "How are frogs and toads the <b>SAME</b>?",
        choices: ["They both hop and eat bugs", "They both have bumpy skin", "They both live in trees"], answer: 0, say: "How are frogs and toads the same?" },
      { k: "pick", q: "How is a frog <b>DIFFERENT</b> from a toad?",
        choices: ["A frog has smooth, wet skin", "A frog has dry, bumpy skin", "A frog has no legs"], answer: 0, say: "How is a frog different from a toad?" },
      { k: "pick", q: "Which animal has <b>dry, bumpy</b> skin?",
        choices: ["The toad", "The frog", "Both of them"], answer: 0, say: "Which animal has dry, bumpy skin?" }
    ]
  },

  /* ---------- CASE 10 — Fact or Opinion ---------- */
  {
    n: 10, title: "Fact or Opinion?", skill: "Fact vs. Opinion", emoji: "📌", sticker: "📌",
    steps: [
      { k: "teach", emoji: "🦝", title: "Detective Tip: Fact vs. Opinion",
        text: "A FACT is true and can be proven. An OPINION is what someone thinks or feels. Words like 'I think' or 'best' signal an opinion.",
        say: "A fact is true and can be proven. An opinion is what someone thinks or feels. Words like I think, or best, signal an opinion." },
      { k: "read", title: "Ice Cream Day", emoji: "🍦🎉",
        text: "Our school had an ice cream party last Friday afternoon. Ice cream is made from milk, sugar, and cream. I think chocolate is the best flavor in the whole world. The party started at two o'clock, and everyone got to pick their own toppings.",
        say: "Ice Cream Day. Our school had an ice cream party last Friday afternoon. Ice cream is made from milk, sugar, and cream. I think chocolate is the best flavor in the whole world. The party started at two o'clock, and everyone got to pick their own toppings." },
      { k: "pick", q: "Which sentence is an <b>OPINION</b>?",
        choices: ["Chocolate is the best flavor in the world", "Ice cream is made from milk", "The party started at two o'clock"], answer: 0, say: "Which sentence is an opinion?" },
      { k: "pick", q: "Which sentence is a <b>FACT</b>?",
        choices: ["Ice cream is made from milk and sugar", "Chocolate is the best", "Parties are the most fun"], answer: 0, say: "Which sentence is a fact?" },
      { k: "pick", q: "The words '<b>I think…</b>' are a signal for a…",
        choices: ["Opinion", "Fact", "Question"], answer: 0, say: "The words I think are a signal for a what?" }
    ]
  },

  /* ---------- CASE 11 — Author's Purpose ---------- */
  {
    n: 11, title: "Why Write It?", skill: "Author's Purpose (PIE)", emoji: "🖊️", sticker: "🖊️",
    steps: [
      { k: "teach", emoji: "🦝", title: "Detective Tip: PIE",
        text: "Authors write to PERSUADE, INFORM, or ENTERTAIN — remember PIE! Ask: is this trying to convince me, teach me, or make me smile?",
        say: "Authors write to persuade, inform, or entertain. Remember PIE. Ask, is this trying to convince me, teach me, or make me smile?" },
      { k: "read", title: "How to Brush Your Teeth", emoji: "🪥😁",
        text: "Brushing your teeth keeps them healthy and strong. First, squeeze a little bit of toothpaste onto your brush. Then, brush gently in small circles for two whole minutes. If you brush twice every day, you can stop cavities before they start.",
        say: "How to Brush Your Teeth. Brushing your teeth keeps them healthy and strong. First, squeeze a little bit of toothpaste onto your brush. Then, brush gently in small circles for two whole minutes. If you brush twice every day, you can stop cavities before they start." },
      { k: "pick", q: "Why did the author write this passage?",
        choices: ["To inform — teach how to brush", "To make you laugh", "To sell toothpaste"], answer: 0, say: "Why did the author write this passage?" },
      { k: "pick", q: "A silly story about a dog on roller skates is meant to…",
        choices: ["Entertain", "Inform", "Persuade"], answer: 0, say: "A silly story about a dog on roller skates is meant to?" },
      { k: "pick", q: "An ad that says 'Buy our juice — it's the best!' is meant to…",
        choices: ["Persuade", "Inform", "Entertain"], answer: 0, say: "An ad that says buy our juice, it's the best, is meant to?" }
    ]
  },

  /* ---------- CASE 12 — Theme & Summarize (capstone) ---------- */
  {
    n: 12, title: "The Big Lesson", skill: "Theme & Summarizing", emoji: "🏆", sticker: "🏆",
    steps: [
      { k: "teach", emoji: "🦝", title: "Master Tip: The Big Lesson",
        text: "The theme is the big LESSON a story teaches. Put ALL your clues together to draw a conclusion — then summarize the case in your own order!",
        say: "The theme is the big lesson a story teaches. Put all your clues together to draw a conclusion. Then summarize the case in your own order." },
      { k: "read", title: "The Ant and the Grasshopper", emoji: "🐜🎻",
        text: "All summer long, the busy ant worked hard, carrying food to store for the winter. The grasshopper only wanted to play his fiddle and dance, and he laughed at the hard-working ant. But when the cold winter finally came, the grasshopper was hungry and had nothing to eat. The kind ant shared her food, and the grasshopper learned that it is wise to plan ahead.",
        say: "The Ant and the Grasshopper. All summer long, the busy ant worked hard, carrying food to store for the winter. The grasshopper only wanted to play his fiddle and dance, and he laughed at the hard-working ant. But when the cold winter finally came, the grasshopper was hungry and had nothing to eat. The kind ant shared her food, and the grasshopper learned that it is wise to plan ahead." },
      { k: "pick", q: "What is the <b>LESSON</b> (theme) of this story?",
        choices: ["It is wise to plan and work ahead", "Never share with anyone", "Playing is always bad"], answer: 0, say: "What is the lesson, or theme, of this story?" },
      { k: "pick", q: "<b>Why</b> was the grasshopper hungry in winter?",
        choices: ["He played instead of storing food", "He got lost in the snow", "He gave his food away"], answer: 0, say: "Why was the grasshopper hungry in winter?" },
      { k: "order", prompt: "🕵️ Summarize the case — put it in order:",
        items: ["The ant works hard all summer", "The grasshopper plays and laughs", "Winter comes and the grasshopper is hungry", "The kind ant shares and he learns his lesson"],
        say: "Summarize the case. Put the events in order." },
      { k: "pick", q: "How would you describe the ant?",
        choices: ["Hard-working and kind", "Lazy and mean", "Silly and rude"], answer: 0, say: "How would you describe the ant?" }
    ]
  },

  /* ---------- CASE 13 — Problem & Solution ---------- */
  {
    n: 13, title: "The Trouble & The Fix", skill: "Problem & Solution", emoji: "🧩", sticker: "🧩",
    steps: [
      { k: "teach", emoji: "🦝", title: "Detective Tip: Problem & Solution",
        text: "Many stories have a PROBLEM the character must fix, and a SOLUTION — the clever way they solve it. Find the trouble, then find the fix!",
        say: "Many stories have a problem the character must fix, and a solution, the clever way they solve it. Find the trouble, then find the fix." },
      { k: "read", title: "The Stuck Kite", emoji: "🪁🌳",
        text: "Sam's brand-new kite soared high in the bright blue sky. Suddenly, the string slipped right out of his hand, and the kite got tangled up in a tall, leafy tree. Sam felt worried because he could not reach it. Then he had a clever idea. He found a long, sturdy stick and gently poked the kite until it came loose and floated softly back down to him.",
        say: "The Stuck Kite. Sam's brand-new kite soared high in the bright blue sky. Suddenly, the string slipped right out of his hand, and the kite got tangled up in a tall, leafy tree. Sam felt worried because he could not reach it. Then he had a clever idea. He found a long, sturdy stick and gently poked the kite until it came loose and floated softly back down to him." },
      { k: "pick", q: "What was Sam's <b>PROBLEM</b>?",
        choices: ["His kite got stuck in a tree", "He lost his string forever", "He had no kite at all"], answer: 0, say: "What was Sam's problem?" },
      { k: "pick", q: "How did Sam <b>SOLVE</b> the problem?",
        choices: ["He used a long stick to free it", "He climbed up the tree", "He bought a new kite"], answer: 0, say: "How did Sam solve the problem?" },
      { k: "pick", q: "How did Sam feel while the kite was stuck?",
        choices: ["Worried", "Excited", "Sleepy"], answer: 0, say: "How did Sam feel while the kite was stuck?" }
    ]
  },

  /* ---------- CASE 14 — Nonfiction Text Features ---------- */
  {
    n: 14, title: "Nonfiction Detective", skill: "Text Features", emoji: "📑", sticker: "📑",
    steps: [
      { k: "teach", emoji: "🦝", title: "Detective Tip: Text Features",
        text: "Nonfiction books have special tools called TEXT FEATURES — titles, headings, bold words, and captions — that help a detective find facts fast!",
        say: "Nonfiction books have special tools called text features. Titles, headings, bold words, and captions. They help a detective find facts fast." },
      { k: "read", title: "All About Honeybees", emoji: "🐝📖",
        text: "This nonfiction book has a title at the very top: \"All About Honeybees.\" One of its headings says \"Inside the Hive.\" In that part, the bold word nectar means the sweet juice that bees drink from flowers. Under a photo of a bee, a caption reads: \"A worker bee carries yellow pollen on its legs.\"",
        say: "All About Honeybees. This nonfiction book has a title at the very top: All About Honeybees. One of its headings says: Inside the Hive. In that part, the bold word nectar means the sweet juice that bees drink from flowers. Under a photo of a bee, a caption reads: A worker bee carries yellow pollen on its legs." },
      { k: "pick", q: "What is a <b>heading</b> for?",
        choices: ["It tells what a section is about", "It ends the book", "It is the price"], answer: 0, say: "What is a heading for?" },
      { k: "pick", q: "Why is the word 'nectar' in <b>bold</b>?",
        choices: ["It's an important word to know", "It is a spelling mistake", "It is the author's name"], answer: 0, say: "Why is the word nectar in bold?" },
      { k: "pick", q: "A <b>caption</b> is the text that…",
        choices: ["tells about a picture", "starts the whole book", "shows the page number"], answer: 0, say: "A caption is the text that does what?" },
      { k: "pick", q: "To quickly find the part about the hive, look at the…",
        choices: ["heading", "back cover", "page color"], answer: 0, say: "To quickly find the part about the hive, look at the what?" }
    ]
  },

  /* ---------- CASE 15 — The Master Case (mixed finale) ---------- */
  {
    n: 15, title: "The Master Case", skill: "All Skills Combined", emoji: "🎓", sticker: "🎓",
    steps: [
      { k: "teach", emoji: "🦝", title: "Master Tip: Your Final Case!",
        text: "This is it, Detective — your final case! Use EVERY skill you learned: main idea, clues, inferences, cause & effect, order, and the story's lesson. Crack it and become a Master Detective!",
        say: "This is it, Detective. Your final case. Use every skill you learned. Main idea, clues, inferences, cause and effect, order, and the story's lesson. Crack it and become a Master Detective!" },
      { k: "read", title: "The Lost Library Book", emoji: "📚🔍",
        text: "Maya loved the town library more than anywhere else. One rainy morning, she realized her favorite library book was missing from her room. She remembered reading it on the bus the afternoon before. Maya's stomach twisted with worry, because the book was due back that very day. Bravely, she retraced her steps and asked the friendly bus driver. He smiled and pulled the book from the lost-and-found box. Maya returned it just in time, and she learned to always keep her library books zipped safely in her backpack.",
        say: "The Lost Library Book. Maya loved the town library more than anywhere else. One rainy morning, she realized her favorite library book was missing from her room. She remembered reading it on the bus the afternoon before. Maya's stomach twisted with worry, because the book was due back that very day. Bravely, she retraced her steps and asked the friendly bus driver. He smiled and pulled the book from the lost-and-found box. Maya returned it just in time, and she learned to always keep her library books zipped safely in her backpack." },
      { k: "pick", q: "<b>Main idea:</b> What is this story MOSTLY about?",
        choices: ["Maya finding her lost library book", "How city buses work", "Rainy weather in town"], answer: 0, say: "Main idea. What is this story mostly about?" },
      { k: "pick", q: "<b>Inference:</b> How do you know Maya was worried?",
        choices: ["Her stomach twisted and the book was due", "She was laughing and singing", "She took a long nap"], answer: 0, say: "Inference. How do you know Maya was worried?" },
      { k: "pick", q: "<b>Cause & effect:</b> WHY did Maya ask the bus driver?",
        choices: ["She had read the book on the bus before", "The library was closed", "She missed her stop"], answer: 0, say: "Cause and effect. Why did Maya ask the bus driver?" },
      { k: "order", prompt: "🕵️ Crack the case — put Maya's day in order:",
        items: ["Maya reads the book on the bus", "She notices the book is missing", "She asks the friendly bus driver", "She returns the book just in time"],
        say: "Crack the case. Put Maya's day in the right order." },
      { k: "pick", q: "<b>Theme:</b> What LESSON did Maya learn?",
        choices: ["To keep her books safe in her backpack", "To never read on the bus", "To stop going to the library"], answer: 0, say: "Theme. What lesson did Maya learn?" }
    ]
  }
];

/* ---------- CLUE HUNT — the bonus vocabulary mini-game ----------
   Quick-fire context clues. Each round shows a sentence with a
   mystery word; tap the meaning. Choices are shuffled by the app,
   so the correct answer is stored as text, not an index. */
const CLUE_HUNT = [
  { q: "The <b>enormous</b> whale filled the whole tank.", answer: "very big", wrong: ["tiny", "fast"] },
  { q: "She felt <b>weary</b> after the long, long hike.", answer: "very tired", wrong: ["happy", "hungry"] },
  { q: "The <b>vivid</b> rainbow had bright, glowing colors.", answer: "very bright", wrong: ["dull", "dark"] },
  { q: "He <b>gazed</b> up at the stars for a long time.", answer: "looked / stared", wrong: ["ran away", "ate"] },
  { q: "The <b>ancient</b> castle was thousands of years old.", answer: "very old", wrong: ["brand new", "very small"] },
  { q: "The warm soup was <b>delicious</b> and tasty.", answer: "yummy", wrong: ["gross", "frozen"] },
  { q: "The <b>fragile</b> glass vase broke very easily.", answer: "easily broken", wrong: ["super strong", "heavy"] },
  { q: "We were <b>thrilled</b> and super excited to go!", answer: "very excited", wrong: ["bored", "sleepy"] },
  { q: "The <b>slender</b> snake was long and thin.", answer: "thin", wrong: ["fat", "round"] },
  { q: "The library was <b>silent</b> with no sound at all.", answer: "very quiet", wrong: ["loud", "dark"] },
  { q: "A <b>generous</b> friend always loves to share.", answer: "giving", wrong: ["greedy", "grumpy"] },
  { q: "The <b>curious</b> kitten wanted to explore the box.", answer: "wanting to know", wrong: ["angry", "sleepy"] },
  { q: "The trail was <b>narrow</b>, only one foot wide.", answer: "thin, not wide", wrong: ["huge", "tall"] },
  { q: "After a big lunch, the baby was <b>content</b>.", answer: "happy and satisfied", wrong: ["crying", "starving"] }
];

/* ---------- RANKS — the detective level ladder (by cases solved) ---------- */
const RANKS = [
  { need: 0,  icon: "🔰", name: "Rookie Reader" },
  { need: 3,  icon: "🥉", name: "Junior Detective" },
  { need: 6,  icon: "🥈", name: "Sharp-Eye Detective" },
  { need: 10, icon: "🥇", name: "Ace Detective" },
  { need: 15, icon: "🏅", name: "Master Detective" }
];

/* ---------- TROPHIES (grand achievements) ---------- */
const RC_TROPHIES = [
  { id: "first",   icon: "🌟", name: "Case Opened",        desc: "Solve your very first case" },
  { id: "halfway", icon: "🔎", name: "On the Case",         desc: "Solve 6 cases" },
  { id: "streak5", icon: "🔥", name: "Hot Streak",          desc: "Get 5 correct answers in a row" },
  { id: "perfect", icon: "💎", name: "Flawless Detective",  desc: "Solve a case with no mistakes" },
  { id: "cluewiz", icon: "🔦", name: "Clue Wizard",         desc: "Get a perfect score in Clue Hunt" },
  { id: "chief",   icon: "👑", name: "Reading Detective Chief", desc: "Solve all 15 cases" }
];
