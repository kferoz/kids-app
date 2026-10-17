/* ============================================================
   Read-Aloud Rocket — data
   ------------------------------------------------------------
   Six phases that climb from beginning-3rd-grade reading to
   4th-grade level. Each phase = 4 lessons + a Phase Check that
   unlocks the next phase. Phases are added one at a time: a
   phase with no `lessons` shows as "coming soon".

   Lesson = {
     id, title, skill, tip,               // tip is read aloud in Word Lab
     focus: [8 words], chunks: { word: "kit·ten" },
     passage: [paragraphs],               // one paragraph per reading screen
     vocab: [{ w, def }],
     quiz: [{ q, choices: [...], answer, why }],   // answer = index; choices are shuffled at run time
     sticker: { emoji, name }
   }
   Phase Check = { title, passage: [...], quiz: [...] } — pass with 4 of 6.
   Write numbers as words: speech recognition hears "twenty" or "20".
   ============================================================ */

const PHASES = [
  {
    id: "p1", n: 1, title: "Launch Pad", sub: "Short & long vowel review", goal: 70,
    color: "#4dabf7", accent: "#1c7ed6", badge: { emoji: "🛰️", name: "Launch Pad Badge" },
    lessons: [
      {
        id: "p1l1", title: "The Lost Kitten at Camp", skill: "Short vowels",
        tip: "A closed syllable ends with a consonant, so the vowel is short. Listen: a in camp, e in tent, i in kit, o in lost, u in mud.",
        focus: ["camp", "tent", "lost", "kitten", "basket", "crept", "snack", "sunset"],
        chunks: { kitten: "kit·ten", basket: "bas·ket", sunset: "sun·set" },
        passage: [
          "Jen and her dad went camping at Elk Pond. They set up a red tent next to a big rock. Dad got the logs, and Jen got the snacks. Then Jen heard a soft little sound. It went mew, mew, mew.",
          "Jen crept past the tent and looked under a bush. A tiny gray kitten sat in the mud. It was wet and lost. Jen did not grab it. She sat still and held out her hand. The kitten sniffed her hand, and then it hopped into her lap.",
          "Jen and Dad set a basket by the fire with a soft blanket in it. The kitten got in and had a snack of fish. It was so happy that it began to purr.",
          "At sunset, a man ran up the path. “Fluff, you are safe!” he said. The kitten was his pet! He was so glad that he gave Jen a big hug and a jar of jam. Jen will never forget the kitten at camp."
        ],
        vocab: [{ w: "crept", def: "moved slowly and quietly" }, { w: "sniffed", def: "smelled with quick little breaths" }],
        quiz: [
          { q: "Where did Jen and her dad go camping?", choices: ["at Elk Pond", "at the beach", "in their backyard"], answer: 0, why: "The very first sentence says they went camping at Elk Pond." },
          { q: "Why did Jen sit still instead of grabbing the kitten?", choices: ["so the kitten would feel safe", "because she was afraid of cats", "because Dad told her to go to bed"], answer: 0, why: "A lost kitten is scared. Sitting still and holding out her hand helped it trust her." },
          { q: "What does the word crept mean?", choices: ["moved slowly and quietly", "ran very fast", "jumped up high"], answer: 0, why: "Jen crept past the tent so she would not scare the kitten." },
          { q: "How did the story end?", choices: ["The kitten's owner found it", "The kitten ran away", "Jen took the kitten home"], answer: 0, why: "At sunset a man came up the path. The kitten, Fluff, was his pet." }
        ],
        sticker: { emoji: "🐱", name: "Camp Kitten" }
      },
      {
        id: "p1l2", title: "The Kite Race", skill: "Silent e",
        tip: "When a word ends in e, the e is silent. It makes the vowel say its name. Cap turns into cape, kit into kite, hop into hope, and cub into cube.",
        focus: ["kite", "race", "shape", "stripes", "prize", "stone", "huge", "smiled"],
        chunks: {},
        passage: [
          "Every June, the town of Pine Lake has a kite race. Kids make kites at home and bring them to the big hill. This time, Jake made a kite in the shape of a whale. Rose made one with blue and white stripes.",
          "The wind came in a huge gust. Up, up, up went the kites! Jake ran with his line, and his whale kite rose up high. Then it began to dive. It came close to a tree, and Jake's face went pale.",
          "Rose dashed over to help. “Take five steps back and pull the line,” she said. Jake made the line tight, and his kite rose again. It went higher than the tree, higher than the old stone tower, and higher than every kite at the race.",
          "The judge gave Jake the prize, a shiny cup. Jake smiled and gave Rose a high five. “I could not have done it alone,” he said. “Next time, we will fly our kites side by side.”"
        ],
        vocab: [{ w: "gust", def: "a sudden, strong puff of wind" }, { w: "pale", def: "light in color, like a scared face" }],
        quiz: [
          { q: "What shape was Jake's kite?", choices: ["a whale", "a star", "a dragon"], answer: 0, why: "The story says Jake made a kite in the shape of a whale." },
          { q: "What problem did Jake have?", choices: ["His kite dived toward a tree", "His kite line broke", "It started to rain"], answer: 0, why: "His kite began to dive and came close to a tree." },
          { q: "How did Rose help Jake?", choices: ["She told him to step back and pull the line", "She gave him her kite", "She climbed the tree"], answer: 0, why: "Rose said, take five steps back and pull the line." },
          { q: "Which word has a silent e that makes the i say its name?", choices: ["prize", "trip", "will"], answer: 0, why: "In prize, the e at the end is silent and the i says its name." }
        ],
        sticker: { emoji: "🪁", name: "Kite Racer" }
      },
      {
        id: "p1l3", title: "Picnic at Sunset Pond", skill: "Two-syllable words",
        tip: "Long words are made of chunks called syllables. Split between two consonants in the middle, like pic, nic, picnic, and rab, bit, rabbit. A compound word is two small words stuck together, like sun and set, sunset.",
        focus: ["picnic", "rabbit", "sandwich", "napkin", "muffins", "insect", "basket", "blanket"],
        chunks: { picnic: "pic·nic", rabbit: "rab·bit", sandwich: "sand·wich", napkin: "nap·kin", muffins: "muf·fins", insect: "in·sect", basket: "bas·ket", blanket: "blan·ket" },
        passage: [
          "On Sunday, Max and his mom packed a picnic basket. They put in a sandwich, two muffins, a napkin, and a big jug of lemonade. Then they walked to Sunset Pond, where the grass was soft and green.",
          "Mom spread out a blanket, and Max opened the basket. Just then, a rabbit hopped out from behind a tree. It twitched its nose and looked right at the muffins. Max laughed. “Sorry, rabbit,” he said. “Muffins are not for bunnies.”",
          "Max tossed the rabbit a bit of carrot instead. The rabbit nibbled it and hopped away. Then a tiny insect landed on Max's napkin. It was a ladybug with seven spots. Max let it crawl onto his finger before it flew off.",
          "When the sun began to set, the pond turned pink and gold. Max and Mom packed up the basket. “That was the best picnic ever,” Max said. “Can we come back next Sunday?”"
        ],
        vocab: [{ w: "twitched", def: "moved in a quick little jerk" }, { w: "nibbled", def: "took tiny bites" }],
        quiz: [
          { q: "What did the rabbit want?", choices: ["the muffins", "the lemonade", "the blanket"], answer: 0, why: "The rabbit looked right at the muffins." },
          { q: "What did Max give the rabbit instead?", choices: ["a bit of carrot", "a muffin", "a sandwich"], answer: 0, why: "Max tossed the rabbit a bit of carrot instead." },
          { q: "What landed on Max's napkin?", choices: ["a ladybug", "a bee", "a butterfly"], answer: 0, why: "A tiny insect landed on the napkin. It was a ladybug with seven spots." },
          { q: "How do you split the word napkin into syllables?", choices: ["nap · kin", "na · pkin", "napk · in"], answer: 0, why: "Split between the two consonants in the middle, p and k: nap · kin." }
        ],
        sticker: { emoji: "🧺", name: "Picnic Pro" }
      },
      {
        id: "p1l4", title: "Helping at the Bake Sale", skill: "Endings -s, -es, -ed, -ing",
        tip: "Endings change a word. S or e s means more than one, like boxes. E d means it already happened. It can sound like t in mixed, d in smiled, or id in wanted. When we add i n g, we sometimes double the last letter, like run and running, or drop the e, like bake and baking.",
        focus: ["wanted", "baking", "mixed", "boxes", "running", "smiled", "stopped", "sliced"],
        chunks: { wanted: "want·ed", baking: "bak·ing", boxes: "box·es", running: "run·ning", stopped: "stopped" },
        passage: [
          "Our school was having a bake sale to raise money for new library books. My sister Ava and I wanted to help, so we spent Saturday baking in the kitchen. We mixed flour, sugar, and eggs in two big bowls.",
          "Ava sliced apples for a pie while I stirred the batter for cupcakes. The kitchen smelled sweet and warm. When the timer beeped, we pulled the pans out of the oven and set them on the counter to cool.",
          "On Monday, we carried six boxes of treats to school. Kids were running to our table before we even opened the boxes! We sold cupcakes, cookies, and slices of pie. Our principal smiled and dropped coins into the jar.",
          "By the end of the day, every box was empty. We had raised enough money for twenty new books. We stopped at the library on the way home, and the librarian thanked us. Baking had never felt so good."
        ],
        vocab: [{ w: "raise", def: "collect money for something" }, { w: "batter", def: "a runny mix that is baked into a cake" }],
        quiz: [
          { q: "Why did the school have a bake sale?", choices: ["to raise money for library books", "to buy a new oven", "to throw a party"], answer: 0, why: "The first sentence says it was to raise money for new library books." },
          { q: "What did Ava slice?", choices: ["apples", "bread", "bananas"], answer: 0, why: "Ava sliced apples for a pie." },
          { q: "In which word does the ending -ed sound like t?", choices: ["mixed", "wanted", "smiled"], answer: 0, why: "Mixed sounds like mix-t. Wanted ends with an id sound, and smiled ends with a d sound." },
          { q: "What happened at the end?", choices: ["They raised money for twenty books", "They lost the money jar", "Nobody came to the sale"], answer: 0, why: "Every box was empty, and they raised enough money for twenty new books." }
        ],
        sticker: { emoji: "🧁", name: "Bake Sale Star" }
      }
    ],
    check: {
      title: "The Science Fair Surprise",
      passage: [
        "Lin worked for two weeks on her science fair project. She wanted to find out which kind of ball bounces the highest. She tested a tennis ball, a rubber ball, and a basketball. She dropped each one from the same spot and measured each bounce with a long ruler.",
        "On the day of the fair, Lin set up her poster in the gym. She had made a chart with bright colors and neat labels. Just as the judges walked in, a gust of wind from the open door made her poster slide off the table. It landed face down on the floor.",
        "Lin felt her cheeks get hot. But she did not give up. She picked up the poster, smoothed it out, and calmly told the judges what she had learned. The rubber ball bounced the highest, and she could explain why.",
        "The judges smiled and wrote notes on their clipboards. When they called out the winners, Lin heard her name. She won second place! Her teacher said the best part was not the ribbon. It was how Lin stayed calm and kept going."
      ],
      quiz: [
        { q: "What did Lin want to find out?", choices: ["which ball bounces the highest", "which plant grows the fastest", "how magnets work"], answer: 0, why: "She wanted to find out which kind of ball bounces the highest." },
        { q: "What happened to Lin's poster?", choices: ["the wind blew it off the table", "it got wet in the rain", "a judge took it home"], answer: 0, why: "A gust of wind from the open door made her poster slide off the table." },
        { q: "How did Lin feel when her poster fell?", choices: ["embarrassed", "sleepy", "bored"], answer: 0, why: "Her cheeks got hot. That is a clue that she felt embarrassed." },
        { q: "Which ball bounced the highest?", choices: ["the rubber ball", "the tennis ball", "the basketball"], answer: 0, why: "The story says the rubber ball bounced the highest." },
        { q: "What does calmly mean?", choices: ["in a quiet, steady way", "in a loud, angry way", "very, very fast"], answer: 0, why: "Lin stayed calm. She spoke in a quiet, steady way even after the poster fell." },
        { q: "What is the big lesson of this story?", choices: ["Keep going when something goes wrong", "Winning is all that matters", "Never make a poster"], answer: 0, why: "Her teacher said the best part was how Lin stayed calm and kept going." }
      ]
    }
  },
  { id: "p2", n: 2, title: "Vowel Team Orbit", sub: "Vowel teams & bossy R (ai, ee, oa, ar, or, er)", goal: 80, color: "#9775fa", accent: "#6741d9", badge: { emoji: "🪐", name: "Orbit Badge" } },
  { id: "p3", n: 3, title: "Word-Part Station", sub: "Prefixes & suffixes (un-, re-, -ful, -less)", goal: 90, color: "#20c997", accent: "#0ca678", badge: { emoji: "🛸", name: "Station Badge" } },
  { id: "p4", n: 4, title: "Big Word Galaxy", sub: "Long words & reading with expression", goal: 100, color: "#ff922b", accent: "#e8590c", badge: { emoji: "🌌", name: "Galaxy Badge" } },
  { id: "p5", n: 5, title: "Root Planet", sub: "Word roots & vocabulary (4th-grade words)", goal: 110, color: "#f06595", accent: "#c2255c", badge: { emoji: "🌍", name: "Root Planet Badge" } },
  { id: "p6", n: 6, title: "4th-Grade Star", sub: "Longer passages, main idea & inference", goal: 120, color: "#fcc419", accent: "#e67700", badge: { emoji: "⭐", name: "4th-Grade Star Badge" } }
];

const PRAISE = {
  perfect: [
    "Perfect! You read every single word!",
    "Wow! A perfect launch! Every word was right!",
    "Amazing! That was smooth, strong reading!",
    "Every word! You're a reading rocket!"
  ],
  good: [
    "Great reading! Just a couple of words to polish.",
    "Strong reading! Let's fix one or two words.",
    "Nice work! You're almost at full speed!"
  ],
  tryAgain: [
    "Good effort! Reading takes practice, and you're practising.",
    "Nice try! Let's look at a few words together.",
    "You're getting stronger! Let's practise some words."
  ],
  fixed: ["Yes! You got it!", "That's it!", "Fixed! Nice job!", "Now you know that word!", "Exactly right!"],
  right: ["Correct!", "Yes, that's right!", "Smart thinking!", "You got it!", "Great job!"],
  oops: ["Good try! Look back at the story.", "Not quite. Try another one.", "Hmm, think again."]
};

const RR_TROPHIES = [
  { id: "first-read", icon: "🎤", name: "First Launch", desc: "Read a paragraph out loud to Nova" },
  { id: "first-lesson", icon: "🚀", name: "Lift-off", desc: "Finish your first lesson" },
  { id: "speed-goal", icon: "⚡", name: "Speed Booster", desc: "Reach the phase speed goal" },
  { id: "word-fixer", icon: "🔧", name: "Word Fixer", desc: "Practise 5 tricky words" },
  { id: "quiz-whiz", icon: "🧠", name: "Quiz Whiz", desc: "Get every Check-up answer right on the first try" },
  { id: "perfect-10", icon: "💯", name: "Perfect Ten", desc: "Read 10 paragraphs perfectly" },
  { id: "phase-pilot", icon: "🧑‍🚀", name: "Phase Pilot", desc: "Pass a Phase Check" }
];
