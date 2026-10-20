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
     write: [prompt, prompt],             // ✏️ Write It: see js/writepad.js + js/writecheck.js
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
        write: [
          { emoji: "🐱", p: "Why did Jen sit still instead of grabbing the kitten? Answer in a complete sentence.", starter: "Jen sat still because", model: "Jen sat still because the lost kitten was scared.", need: { min: 8, use: ["because"] } },
          { emoji: "🏕️", p: "If you found a lost kitten, what would you name it? Tell why.", ideas: ["I would name it", "because", "fluffy", "tiny"], model: "I would name it Muffin because it is soft and sweet.", need: { min: 7, use: ["because"] } }
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
        write: [
          { emoji: "🪁", p: "How did Rose help Jake? Answer in a complete sentence.", model: "Rose told Jake to step back and pull the line tight.", need: { min: 7 } },
          { emoji: "🐋", p: "Design your own kite! What shape is it? Use a silent-e word like shape, kite, huge or stripes.", ideas: ["My kite", "shape", "huge", "stripes", "white", "whale", "snake"], model: "My kite is a huge snake with white stripes.", need: { min: 7, use: ["kite", "kites", "shape", "huge", "stripe", "stripes", "white", "whale", "snake", "cute", "cape", "line", "nine", "five", "made", "make", "rope", "nose", "stone", "home", "plane", "flame", "lake", "smile", "side", "ride", "time", "game", "name", "same", "tube", "cube", "shine", "dive", "rose", "fine", "wide", "bike", "hope", "bone", "face", "tale"], useHint: "Use a silent-e word, like kite, shape, huge or white." } }
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
        write: [
          { emoji: "🐰", p: "What did Max give the rabbit instead of muffins? Answer in a complete sentence.", model: "Max gave the rabbit a bit of carrot instead of a muffin.", need: { min: 7 } },
          { emoji: "🧺", p: "Plan your dream picnic! Write two sentences: what would you pack, and where would you go?", ideas: ["I would pack", "sandwich", "muffins", "We would go to", "picnic"], model: "I would pack pizza and strawberries. We would have our picnic on top of a hill.", need: { min: 12, sentences: 2 } }
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
        write: [
          { emoji: "🧁", p: "Why did the school have a bake sale? Answer in a complete sentence.", model: "The school had a bake sale to raise money for new library books.", need: { min: 8 } },
          { emoji: "🍪", p: "What would you bake for a bake sale? Use a word that ends in -ed or -ing, like baking, mixed or sliced.", ideas: ["I would bake", "baking", "mixed", "sprinkled", "frosted", "chocolate"], model: "I would bake frosted cupcakes with sprinkles on top.", need: { min: 7, ends: ["ed", "ing"], teamHint: "Use a word that ends in -ed or -ing, like baking, mixed or frosted." } }
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
  {
    id: "p2", n: 2, title: "Vowel Team Orbit", sub: "Vowel teams & bossy R (ai, ee, oa, ar, or, er)", goal: 80,
    color: "#9775fa", accent: "#6741d9", badge: { emoji: "🪐", name: "Orbit Badge" },
    lessons: [
      {
        id: "p2l1", title: "The Rainy Day Parade", skill: "Vowel teams ai & ay",
        tip: "When two vowels go walking, the first one does the talking. A i and a y both say the long a sound, like rain and play. A y usually comes at the end of a word, and a i comes in the middle.",
        focus: ["rain", "paint", "waited", "train", "tail", "stay", "gray", "away"],
        chunks: { waited: "wait·ed", away: "a·way" },
        passage: [
          "Kay had waited all week for the Main Street parade. She had painted a sign with bright yellow paint. It said, “Hooray for Bay Town!” But on Sunday morning, gray clouds rolled in, and rain began to fall.",
          "“Will they say the parade is off?” Kay asked. Her dad looked out the window. “Let's wait and see,” he said. Kay put on her raincoat anyway. She did not want to stay inside all day.",
          "Soon the rain turned into a light spray, and the gray clouds drifted away. A band began to play, and the parade got on its way! A tiny train rolled by with a painted dragon on top. The dragon's long tail swayed back and forth.",
          "Kay held up her sign and waved it high. A man on the train saw it and waved back. Then the sun came out, and a rainbow stretched over Main Street. “What a great day!” Kay said. “Rain or shine, a parade is always fun.”"
        ],
        vocab: [{ w: "spray", def: "tiny drops of water floating in the air" }, { w: "swayed", def: "moved slowly from side to side" }],
        quiz: [
          { q: "What did Kay paint?", choices: ["a sign for the parade", "a picture of a dragon", "her raincoat"], answer: 0, why: "She painted a sign with bright yellow paint that said Hooray for Bay Town." },
          { q: "What was the problem at the start of the story?", choices: ["It began to rain", "Kay lost her sign", "The band was late"], answer: 0, why: "Gray clouds rolled in, and rain began to fall on parade day." },
          { q: "What does swayed mean?", choices: ["moved slowly from side to side", "fell down", "stood very still"], answer: 0, why: "The dragon's tail swayed back and forth, from side to side." },
          { q: "Which word has the ai team that says the long a sound, like rain?", choices: ["tail", "tall", "tell"], answer: 0, why: "In tail, the a and i team up to say the long a sound." }
        ],
        write: [
          { emoji: "🌧️", p: "Why did Kay put on her raincoat? Answer in a complete sentence.", starter: "Kay put on her raincoat because", model: "Kay put on her raincoat because she did not want to stay inside all day.", need: { min: 8, use: ["because"] } },
          { emoji: "🎉", p: "Imagine you are in a parade! What would you ride or carry? Use a word with ai or ay, like rain, paint, play or day.", ideas: ["I would", "paint", "train", "play", "hooray", "sail", "gray"], model: "I would ride a gray train and play my drum all day.", need: { min: 6, team: ["ai", "ay"], teamHint: "Use a word with ai or ay in it, like rain, paint, play or day." } }
        ],
        sticker: { emoji: "🌈", name: "Parade Rainbow" }
      },
      {
        id: "p2l2", title: "The Secret Seed", skill: "Vowel teams ee & ea",
        tip: "E e and e a both say the long e sound, like seed and leaf. When you see these teams, say the name of the letter e. Be careful: sometimes e a says the short e sound, like in bread.",
        focus: ["seed", "green", "sweet", "leaves", "beans", "dream", "creep", "reaching"],
        chunks: { reaching: "reach·ing" },
        passage: [
          "One day, Grandma Bea gave Neel a tiny brown seed. “This is a secret seed,” she said. “Plant it, and keep it warm. Give it water each week. Then wait and see what it will be.”",
          "Neel planted the seed in a pot and set it by the window. He gave it water and a little bit of sunshine every day. After three weeks, a green sprout peeked out of the dirt. Neel jumped up and cheered.",
          "The plant grew and grew. Soon it had big green leaves, and a long vine began to creep up the wall. It needed a stick to lean on, so Neel and Grandma made one out of an old broom handle. The vine kept reaching higher.",
          "By the end of the summer, the vine was covered with long green pods. Neel opened one, and inside were five sweet beans. “Your secret seed was a bean!” Grandma laughed. That night, Neel had a dream about a bean vine that reached all the way to the moon."
        ],
        vocab: [{ w: "sprout", def: "a tiny new plant just starting to grow" }, { w: "creep", def: "move slowly and quietly" }],
        quiz: [
          { q: "Who gave Neel the seed?", choices: ["Grandma Bea", "his teacher", "a farmer"], answer: 0, why: "The first sentence says Grandma Bea gave Neel a tiny brown seed." },
          { q: "How long did it take for the sprout to peek out?", choices: ["three weeks", "one day", "a whole year"], answer: 0, why: "After three weeks, a green sprout peeked out of the dirt." },
          { q: "Why did the plant need a stick?", choices: ["so the vine had something to lean on", "to keep the birds away", "to measure how tall it was"], answer: 0, why: "The vine needed a stick to lean on as it climbed." },
          { q: "Which word has the same vowel sound as seed?", choices: ["dream", "bed", "bread"], answer: 0, why: "In dream, e a says long e. Bread has e a too, but there it says the short e sound. Tricky!" }
        ],
        write: [
          { emoji: "🌱", p: "What did the secret seed turn into? Answer in a complete sentence.", model: "The secret seed turned into a bean plant with sweet beans.", need: { min: 6, use: ["bean", "beans"] } },
          { emoji: "🪄", p: "If you had a magic seed, what would you grow? Use a word with ee or ea, like seed, tree, treat or dream.", ideas: ["I would grow", "tree", "sweet", "treats", "green", "leaves", "giant"], model: "I would grow a giant tree that drips sweet treats every week.", need: { min: 7, team: ["ee", "ea"], teamHint: "Use a word with ee or ea in it, like seed, tree, treat or dream." } }
        ],
        sticker: { emoji: "🫘", name: "Magic Bean" }
      },
      {
        id: "p2l3", title: "Joan's Goat Boat", skill: "Long o: oa & ow",
        tip: "O a and o w can both say the long o sound, like boat and snow. Watch out! O w can also say ow, like in cow. If a word doesn't make sense, try the other sound.",
        focus: ["goat", "boat", "coast", "toast", "road", "floated", "slowly", "bowl"],
        chunks: { floated: "float·ed", slowly: "slow·ly" },
        passage: [
          "Joan lived by the coast with her pet goat, Moe. Moe was a good goat, but he loved to eat things he should not eat. He ate soap, a sock, and once, a whole piece of toast with jam.",
          "Every summer, the town held a boat race. Joan built a little boat out of old wood and painted it yellow. On the day of the race, she loaded her boat into a wagon and pulled it down the road to the water. Moe trotted along behind her.",
          "Joan began to row. Her boat floated slowly at first, but then it picked up speed. Suddenly, she heard a splash. Moe had jumped in! He swam up to the boat, and Joan pulled him aboard. The crowd began to cheer and shout, “Go, goat, go!”",
          "Joan rowed as fast as she could, and Moe stood at the front like a captain. They did not win the race, but they won a prize for the best team. The prize was a big bowl of oats. Moe ate every last one."
        ],
        vocab: [{ w: "coast", def: "the land right next to the sea" }, { w: "aboard", def: "onto a boat, a train or a plane" }],
        quiz: [
          { q: "What did Moe love to do?", choices: ["eat things he should not eat", "sleep all day", "sing songs"], answer: 0, why: "Moe ate soap, a sock, and even a piece of toast with jam!" },
          { q: "What surprising thing happened during the race?", choices: ["Moe jumped into the water", "The boat sank", "Joan fell asleep"], answer: 0, why: "Joan heard a splash. Moe had jumped in!" },
          { q: "What prize did Joan and Moe win?", choices: ["a bowl of oats for the best team", "a gold cup for first place", "a new boat"], answer: 0, why: "They did not win the race, but they won the best team prize: a big bowl of oats." },
          { q: "In which word does ow say the long o sound, like in snow?", choices: ["slowly", "cow", "how"], answer: 0, why: "Slowly says slow. In cow and how, o w says ow." }
        ],
        write: [
          { emoji: "🐐", p: "Did Joan and Moe win the race? Answer in a complete sentence, and tell what they won.", model: "Joan and Moe did not win the race, but they won a prize for the best team.", need: { min: 8 } },
          { emoji: "⛵", p: "Write a funny sentence about a goat on a boat. Use a word with oa or ow, like goat, float, toast or slow.", ideas: ["The goat", "boat", "floated", "toast", "slowly", "coat", "snow"], model: "The goat ate my toast and then floated away on the boat.", need: { min: 7, team: ["oa", "ow"], teamHint: "Use a word with oa or ow in it, like goat, float, toast or slow." } }
        ],
        sticker: { emoji: "🐐", name: "Captain Goat" }
      },
      {
        id: "p2l4", title: "Storm on the Farm", skill: "Bossy R: ar, or, er, ir, ur",
        tip: "When r comes after a vowel, it is bossy! It changes the vowel's sound. A r says ar, like farm. O r says or, like horse. E r, i r and u r all say er, like her, bird and turn.",
        focus: ["farm", "barn", "horse", "storm", "first", "bird", "curled", "burst"],
        chunks: { curled: "curled" },
        passage: [
          "Carmen lived on a farm with three horses, a herd of cows, and a short, fat dog named Burt. One night in March, a storm rolled over the hills. Thunder roared, and the barn door started to bang.",
          "Carmen jumped out of bed. She grabbed her flashlight and her purple coat and ran to the barn. The first thing she saw was Star, her favorite horse. Star was stamping her hooves and snorting. She was scared of the storm.",
          "Carmen sat down next to Star and began to hum a soft song. Burt curled up in the straw beside them. A little bird fluttered down from the roof and perched on a cart. Slowly, Star stopped stamping and lowered her head.",
          "By morning, the storm was over. The sun burst through the clouds, and the wet fields sparkled. Carmen's mother found her asleep in the barn with Star, Burt, and the bird. “You took good care of the farm,” she whispered with a smile."
        ],
        vocab: [{ w: "herd", def: "a big group of animals, like cows, that stay together" }, { w: "perched", def: "sat on something high, like a bird on a branch" }],
        quiz: [
          { q: "Why did Carmen run to the barn?", choices: ["because of the storm and the banging door", "to feed the cows", "to look for her dog"], answer: 0, why: "A storm rolled in, and the barn door started to bang." },
          { q: "How did Carmen help Star calm down?", choices: ["She hummed a soft song", "She rode her in the rain", "She gave her a carrot"], answer: 0, why: "Carmen sat next to Star and began to hum a soft song." },
          { q: "Where did Carmen's mother find her in the morning?", choices: ["asleep in the barn", "in her bed", "in the kitchen"], answer: 0, why: "Her mother found her asleep in the barn with Star, Burt, and the bird." },
          { q: "Which word has the same bossy r sound as bird?", choices: ["turn", "barn", "horse"], answer: 0, why: "I r in bird and u r in turn both say er." }
        ],
        write: [
          { emoji: "🐴", p: "How did Carmen help Star? Answer in a complete sentence.", model: "Carmen helped Star by sitting with her and humming a soft song.", need: { min: 7 } },
          { emoji: "⛈️", p: "Write a sentence about a stormy night. Use two bossy R words, like storm, dark, thunder, bird or turn.", ideas: ["dark", "storm", "thunder", "roared", "bird", "turned", "under"], model: "The dark storm roared, and my dog hid under the bed.", need: { min: 8, team: ["ar", "or", "er", "ir", "ur"], teamN: 2, teamHint: "Use two bossy R words, like dark, storm, thunder, bird or turn." } }
        ],
        sticker: { emoji: "🐴", name: "Storm Helper" }
      }
    ],
    check: {
      title: "The Lighthouse Helper",
      passage: [
        "Every summer, Ray stayed with his Uncle Joe, who was the keeper of the lighthouse on Seal Point. Each night, Uncle Joe climbed the steep stairs to the top and turned on the great light. The beam swept across the dark sea to keep the boats safe.",
        "One evening, a thick gray fog rolled in from the ocean. Ray could not see the rocks or even the end of the dock. Then the phone rang. A fishing boat was lost in the fog, and the captain needed help to find the harbor.",
        "Uncle Joe hurried up the stairs, but the big light would not turn on. The storm had broken a wire. Then Ray remembered the old foghorn in the shed. He raced down the path, found the horn, and pulled the cord with all his strength. A deep, loud BOOM rolled out over the water.",
        "Ray kept blowing the horn until his arms were sore. At last, a light appeared in the fog. The fishing boat followed the sound and floated safely into the harbor. The captain shook Ray's hand. “You were the lighthouse tonight,” he said, and Ray beamed with pride."
      ],
      quiz: [
        { q: "Where did Uncle Joe work?", choices: ["at the lighthouse on Seal Point", "on a fishing boat", "at a fish market"], answer: 0, why: "Uncle Joe was the keeper of the lighthouse on Seal Point." },
        { q: "What problem did the fishing boat have?", choices: ["It was lost in the fog", "It ran out of food", "It had a hole in it"], answer: 0, why: "A fishing boat was lost in the fog and needed help to find the harbor." },
        { q: "Why couldn't Uncle Joe use the big light?", choices: ["The storm had broken a wire", "He lost the key", "The light was too hot"], answer: 0, why: "The big light would not turn on because the storm had broken a wire." },
        { q: "How did Ray help the boat find the harbor?", choices: ["He blew the old foghorn", "He waved a flashlight", "He swam out to the boat"], answer: 0, why: "Ray pulled the foghorn's cord, and the boat followed the sound." },
        { q: "What is a harbor?", choices: ["a safe place where boats stay", "a big storm", "a tall tower"], answer: 0, why: "The boat floated safely into the harbor, a calm place where boats can stay." },
        { q: "What does “Ray beamed with pride” mean?", choices: ["Ray smiled because he felt proud", "Ray turned on a light", "Ray felt sad and tired"], answer: 0, why: "Beamed means smiled big. Ray was proud that he helped save the boat." }
      ]
    }
  },
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
  { id: "phase-pilot", icon: "🧑‍🚀", name: "Phase Pilot", desc: "Pass a Phase Check" },
  { id: "rocket-writer", icon: "✏️", name: "Rocket Writer", desc: "Finish 3 Write It missions" }
];
