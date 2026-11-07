/* ============================================================
   Read-Aloud Rocket — data
   ------------------------------------------------------------
   Phases that climb from beginning-3rd-grade reading to
   4th-grade level (6+ = robots & AI). Each phase = 4 lessons + a Phase Check that
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
  {
    id: "p3", n: 3, title: "Word-Part Station", sub: "Prefixes & suffixes (un-, re-, -ful, -less)", goal: 90,
    color: "#20c997", accent: "#0ca678", badge: { emoji: "🛸", name: "Station Badge" },
    lessons: [
      {
        id: "p3l1", title: "The Unlucky Unicorn Costume", skill: "Prefix un-",
        tip: "A prefix is a word part stuck on the front of a word. U n means not. Unhappy means not happy. Unlock means the opposite of lock. Find the base word, then add not!",
        focus: ["unhappy", "unpack", "unlock", "unsure", "untie", "unkind", "unusual", "unfair"],
        chunks: { unhappy: "un·hap·py", unpack: "un·pack", unlock: "un·lock", unsure: "un·sure", untie: "un·tie", unkind: "un·kind", unusual: "un·u·su·al", unfair: "un·fair" },
        passage: [
          "Mia was unhappy. The school costume parade was the next day, and her costume box was still taped shut. She tried to unpack it, but the tape would not come off. Then she saw a tiny lock on the side. Who locks a costume box?",
          "Her brother Leo found the key in a sock drawer. Mia used it to unlock the box. Inside was a unicorn costume, but the horn was floppy, the tail was tangled, and one shoe was missing. Mia felt unsure. Could she still wear it?",
          "Leo did not laugh, because that would be unkind. Instead, he helped her untie the knots in the tail. Mom stuffed the floppy horn with socks until it stood up tall. For the missing shoe, Mia wore one rain boot. It looked very unusual.",
          "At the parade, a boy said, “That is unfair! Your unicorn has a rain boot!” Mia grinned. “It is a puddle unicorn,” she said. The judges laughed and gave her a ribbon for the most creative costume. Mia was not unhappy anymore. She was unstoppable!"
        ],
        vocab: [{ w: "unusual", def: "not usual; different and surprising" }, { w: "creative", def: "full of new and clever ideas" }],
        quiz: [
          { q: "Why was Mia unhappy at the start?", choices: ["Her costume box was taped and locked", "She was sick", "The parade was cancelled"], answer: 0, why: "The tape would not come off, and there was a tiny lock on the side of the box." },
          { q: "What does unkind mean?", choices: ["not kind", "very kind", "kind again"], answer: 0, why: "The prefix un- means not, so unkind means not kind." },
          { q: "How did Mom fix the floppy horn?", choices: ["She stuffed it with socks", "She glued it to a hat", "She bought a new one"], answer: 0, why: "Mom stuffed the floppy horn with socks until it stood up tall." },
          { q: "Which word means the opposite of lock?", choices: ["unlock", "relock", "locker"], answer: 0, why: "Un- turns lock around. Unlock means open it, the opposite of lock." }
        ],
        write: [
          { emoji: "🦄", p: "How did Mia turn her costume problem into a win? Answer in a complete sentence.", model: "Mia wore a rain boot and called herself a puddle unicorn, and she won a ribbon.", need: { min: 8 } },
          { emoji: "🙃", p: "Write about a time something was unfair, unusual or unexpected. Use an un- word!", ideas: ["It was unusual when", "unfair", "unhappy", "unexpected", "unlucky"], model: "It was unusual when my cat climbed into the fridge.", need: { min: 7, starts: ["un"], teamHint: "Use a word that starts with un-, like unhappy, unusual or unfair." } }
        ],
        sticker: { emoji: "🦄", name: "Puddle Unicorn" }
      },
      {
        id: "p3l2", title: "Robo Redo", skill: "Prefix re-",
        tip: "R e is a prefix that means again. Redo means do again. Reread means read again. Return means come back again. When you see r e at the front, think: again!",
        focus: ["rebuild", "redo", "reread", "refill", "repaint", "replay", "return", "restart"],
        chunks: { rebuild: "re·build", redo: "re·do", reread: "re·read", refill: "re·fill", repaint: "re·paint", replay: "re·play", return: "re·turn", restart: "re·start" },
        passage: [
          "Omar built a robot for the science club. He named it Robo. Robo could roll, beep, and wave one arm. But on the first try, Robo rolled straight into the wall, beeped sadly, and fell over. One wheel popped off and rolled under the couch.",
          "“I will just rebuild it,” Omar said. He reread the plan from the beginning. He saw that he had put the wheels on backwards. So he took them off to redo that part. Then he had to refill the battery box with fresh batteries.",
          "Robo's paint was scratched, so Omar decided to repaint it bright blue. He gave it two silly eyes and a bow tie. When he pressed restart, Robo blinked, rolled across the room, and waved. Then it bumped into the cat. The cat was not amused.",
          "At the science club, Omar showed a video of the first crash. Everyone laughed, and they asked him to replay it three times. “Mistakes are part of building,” said the teacher. Omar smiled. He could not wait to return next week with Robo Two."
        ],
        vocab: [{ w: "amused", def: "thinking something is funny" }, { w: "battery", def: "a small thing that stores power for toys and robots" }],
        quiz: [
          { q: "What happened the first time Robo moved?", choices: ["It rolled into the wall and fell over", "It flew across the room", "It sang a song"], answer: 0, why: "On the first try, Robo rolled straight into the wall and fell over." },
          { q: "What mistake had Omar made?", choices: ["He put the wheels on backwards", "He forgot the eyes", "He used the wrong color"], answer: 0, why: "When he reread the plan, he saw he had put the wheels on backwards." },
          { q: "What does reread mean?", choices: ["read again", "not read", "read fast"], answer: 0, why: "The prefix re- means again. Reread means read again." },
          { q: "What did the teacher say about mistakes?", choices: ["They are part of building", "They are not allowed", "They mean you should quit"], answer: 0, why: "The teacher said, mistakes are part of building." }
        ],
        write: [
          { emoji: "🤖", p: "What did Omar do after Robo crashed? Answer in a complete sentence.", model: "Omar reread the plan and rebuilt Robo with the wheels on the right way.", need: { min: 8 } },
          { emoji: "🔁", p: "If you could replay one day of your life, which day would it be? Use a re- word like replay, redo or return.", ideas: ["I would replay", "because", "return", "redo"], model: "I would replay my birthday because we went to the water park.", need: { min: 8, starts: ["re"], teamHint: "Use a word that starts with re-, like replay, redo, return or rebuild." } }
        ],
        sticker: { emoji: "🤖", name: "Robo Two" }
      },
      {
        id: "p3l3", title: "The Helpful Hamster", skill: "Suffix -ful",
        tip: "A suffix is a word part stuck on the end of a word. F u l means full of. Helpful means full of help. Careful means full of care. Notice: the suffix has only one l!",
        focus: ["helpful", "careful", "cheerful", "thankful", "colorful", "playful", "hopeful", "wonderful"],
        chunks: { helpful: "help·ful", careful: "care·ful", cheerful: "cheer·ful", thankful: "thank·ful", colorful: "col·or·ful", playful: "play·ful", hopeful: "hope·ful", wonderful: "won·der·ful" },
        passage: [
          "Our class hamster is named Peanut. He is small, fluffy, and very playful. Every morning he runs on his wheel so fast that it squeaks. Our teacher says Peanut is the most cheerful member of Room Twelve, and he does not even do homework.",
          "One Friday, Ms. Diaz dropped her ring. It rolled across the floor and vanished under the bookshelf. Nobody could reach it. Ms. Diaz looked sad. Then Zoe had a hopeful idea. “Peanut is small,” she said. “Maybe he can be helpful.”",
          "We were very careful. We built a little tunnel out of paper tubes that led under the shelf. We put a sunflower seed at the end. Peanut sniffed the air, scurried through the tunnel, and came back out with a seed in his cheek and something shiny in his paws.",
          "It was the ring! The whole class cheered. Ms. Diaz was so thankful that she gave Peanut a tiny colorful party hat and an extra seed. Then she wrote on the board, “Even the smallest helper can do something wonderful.”"
        ],
        vocab: [{ w: "vanished", def: "went out of sight all of a sudden" }, { w: "scurried", def: "ran with quick, short steps" }],
        quiz: [
          { q: "What was the problem in the story?", choices: ["Ms. Diaz's ring rolled under the bookshelf", "Peanut ran away", "The class lost its homework"], answer: 0, why: "The ring rolled across the floor and vanished under the bookshelf." },
          { q: "Why did Zoe think Peanut could help?", choices: ["because he is small", "because he can talk", "because he is strong"], answer: 0, why: "Zoe said, Peanut is small. He could fit where hands could not." },
          { q: "What does thankful mean?", choices: ["full of thanks", "without thanks", "thanks again"], answer: 0, why: "The suffix -ful means full of, so thankful means full of thanks." },
          { q: "What did the class use to lead Peanut under the shelf?", choices: ["a tunnel of paper tubes", "a long string", "a toy car"], answer: 0, why: "They built a little tunnel out of paper tubes with a seed at the end." }
        ],
        write: [
          { emoji: "🐹", p: "How did Peanut help Ms. Diaz? Answer in a complete sentence.", model: "Peanut ran through the tunnel and brought back the lost ring.", need: { min: 7 } },
          { emoji: "🌟", p: "Tell about a time you were helpful. Use a -ful word like helpful, careful or thankful.", ideas: ["I was helpful when", "careful", "thankful", "cheerful"], model: "I was helpful when I carried the groceries, and my mom was thankful.", need: { min: 8, ends: ["ful"], teamHint: "Use a word that ends in -ful, like helpful, careful or thankful." } }
        ],
        sticker: { emoji: "🐹", name: "Hero Hamster" }
      },
      {
        id: "p3l4", title: "The Fearless Firefly", skill: "Suffix -less",
        tip: "L e s s is a suffix that means without. Fearless means without fear. Careless means without care. -less and -ful are opposites: careful and careless!",
        focus: ["fearless", "sleepless", "endless", "careless", "helpless", "spotless", "harmless", "useless"],
        chunks: { fearless: "fear·less", sleepless: "sleep·less", endless: "end·less", careless: "care·less", helpless: "help·less", spotless: "spot·less", harmless: "harm·less", useless: "use·less" },
        passage: [
          "Flick was the smallest firefly in Willow Woods. His light was tiny, so the other fireflies said it was useless. Flick did not argue. He kept his wings spotless and practised blinking every night. Blink, blink, blink. He was small, but he was fearless.",
          "One summer night, a little rabbit named Pip got lost. The woods were dark and seemed endless. Pip felt helpless. He sat under a log and shivered. His mother had a sleepless night, calling his name over and over.",
          "Flick heard the call. He zipped through the trees, blinking his tiny light. He was not careless. He checked every log and every bush. At last he found Pip. “Follow my light,” Flick said. “I am harmless, and I know the way home.”",
          "Pip followed the little blinking light all the way home. His mother hugged him tight. The next night, the other fireflies asked Flick to lead their parade. His light was still tiny, but now everyone knew it was not useless at all."
        ],
        vocab: [{ w: "argue", def: "disagree with someone using words" }, { w: "shivered", def: "shook because of cold or fear" }],
        quiz: [
          { q: "Why did the other fireflies think Flick's light was useless?", choices: ["because it was tiny", "because it was red", "because it blinked too fast"], answer: 0, why: "Flick was the smallest firefly, and his light was tiny." },
          { q: "What does fearless mean?", choices: ["without fear", "full of fear", "fear again"], answer: 0, why: "The suffix -less means without, so fearless means without fear." },
          { q: "How did Flick help Pip?", choices: ["He led Pip home with his light", "He carried Pip on his back", "He called Pip's mother on the phone"], answer: 0, why: "Flick said, follow my light, and led Pip all the way home." },
          { q: "Which word is the opposite of careful?", choices: ["careless", "cared", "caring"], answer: 0, why: "-ful means full of and -less means without. Careless is the opposite of careful." }
        ],
        write: [
          { emoji: "✨", p: "How did the other fireflies change their minds about Flick? Answer in a complete sentence.", model: "The fireflies asked Flick to lead their parade because his light helped Pip.", need: { min: 8 } },
          { emoji: "🦸", p: "Write about something that makes you feel fearless. Use a -less word like fearless, endless or spotless.", ideas: ["I feel fearless when", "endless", "careless", "harmless"], model: "I feel fearless when I jump off the diving board.", need: { min: 7, ends: ["less"], teamHint: "Use a word that ends in -less, like fearless, endless or spotless." } }
        ],
        sticker: { emoji: "✨", name: "Fearless Firefly" }
      }
    ],
    check: {
      title: "The Treehouse Redo",
      passage: [
        "Kai and his grandpa spent a whole summer building a treehouse in the old oak tree. It had a rope ladder, a tiny window, and a sign that said, “No Grown-Ups, Except Grandpa.” Kai was thankful for every hour they spent hammering together.",
        "Then a big storm came. In the morning, Kai ran outside and felt helpless. Half the roof was gone, the sign was in the mud, and the ladder was tangled in a bush. He was unsure if the treehouse could ever be fixed.",
        "Grandpa put a hand on his shoulder. “Treehouses are not finished,” he said. “They are just waiting to be rebuilt.” They made a careful plan. This time they used stronger nails and a roof that sloped, so the rain could slide off.",
        "It took two weeks to rebuild and repaint it. When they were done, the treehouse looked even better than before. Kai hung the muddy sign back up, but he added one word. Now it said, “No Grown-Ups, Except Fearless Grandpa.”"
      ],
      quiz: [
        { q: "Who built the treehouse with Kai?", choices: ["his grandpa", "his teacher", "his best friend"], answer: 0, why: "Kai and his grandpa spent a whole summer building it." },
        { q: "What did the storm do to the treehouse?", choices: ["It blew away half the roof", "It knocked down the tree", "It painted it blue"], answer: 0, why: "Half the roof was gone, the sign was in the mud, and the ladder was tangled." },
        { q: "What does rebuilt mean?", choices: ["built again", "not built", "built badly"], answer: 0, why: "The prefix re- means again, so rebuilt means built again." },
        { q: "Why did they make the new roof slope?", choices: ["so the rain could slide off", "so it looked funny", "so birds could sit on it"], answer: 0, why: "They made a roof that sloped, so the rain could slide off." },
        { q: "What does helpless mean?", choices: ["without help, not able to fix things", "full of help", "helping again"], answer: 0, why: "The suffix -less means without. Kai felt like he could not fix it." },
        { q: "What is the big lesson of this story?", choices: ["When something breaks, you can rebuild it even better", "Never build a treehouse", "Storms are fun"], answer: 0, why: "Grandpa said treehouses are just waiting to be rebuilt, and the new one was even better." }
      ]
    }
  },
  {
    id: "p4", n: 4, title: "Big Word Galaxy", sub: "Long words & reading with expression", goal: 100,
    color: "#ff922b", accent: "#e8590c", badge: { emoji: "🌌", name: "Galaxy Badge" },
    lessons: [
      {
        id: "p4l1", title: "The Fantastic Volcano", skill: "Three-syllable words",
        tip: "Big words are just small chunks holding hands. Clap the chunks: fan, tas, tic, fantastic! Vol, ca, no, volcano! Read one chunk at a time, then say the whole word smoothly.",
        focus: ["fantastic", "volcano", "enormous", "important", "remember", "together", "carefully", "banana"],
        chunks: { fantastic: "fan·tas·tic", volcano: "vol·ca·no", enormous: "e·nor·mous", important: "im·por·tant", remember: "re·mem·ber", together: "to·geth·er", carefully: "care·ful·ly", banana: "ba·na·na" },
        passage: [
          "For the science fair, Leo and his best friend Priya decided to build a volcano. Not a tiny one. They wanted an enormous volcano that would make the whole gym gasp. They worked together every afternoon for a week, shaping clay around an old plastic bottle.",
          "Priya read the directions carefully. “It is important to remember the order,” she said. “First the baking soda, then the soap, and the vinegar goes in last.” Leo nodded, but he was busy painting red lava down the sides and eating a banana.",
          "On the big day, a crowd gathered around their table. Leo poured in the baking soda and the soap. Then, with a dramatic bow, he poured in the vinegar. Nothing happened. Everyone waited. Leo's ears turned pink. Had they forgotten something?",
          "Suddenly, the volcano rumbled, and bright red foam shot out of the top! It bubbled over the table and onto Leo's shoes. The crowd cheered. “That was fantastic!” said the judge, laughing. Leo looked at his foamy sneakers and grinned. “It was supposed to do that,” he said."
        ],
        vocab: [{ w: "enormous", def: "very, very big" }, { w: "dramatic", def: "big and showy, to get attention" }],
        quiz: [
          { q: "What did Leo and Priya build?", choices: ["a volcano", "a robot", "a rocket"], answer: 0, why: "They decided to build an enormous volcano for the science fair." },
          { q: "Why did Priya say it was important to remember the order?", choices: ["so the volcano would erupt the right way", "so they would finish early", "so the judge would not see"], answer: 0, why: "The baking soda, soap and vinegar had to go in the right order to make the foam." },
          { q: "How many syllables are in the word volcano?", choices: ["three", "two", "four"], answer: 0, why: "Vol · ca · no. Clap it: three chunks!" },
          { q: "How did Leo feel when nothing happened at first?", choices: ["embarrassed", "sleepy", "angry"], answer: 0, why: "His ears turned pink. That is a clue he felt embarrassed." }
        ],
        write: [
          { emoji: "🌋", p: "What happened when the volcano finally erupted? Answer in a complete sentence.", model: "Red foam shot out of the top and bubbled onto Leo's shoes.", need: { min: 8 } },
          { emoji: "🔬", p: "What would YOU build for a science fair? Use a big word with three syllables, like fantastic, enormous or important.", ideas: ["I would build", "fantastic", "enormous", "important", "together", "volcano"], model: "I would build an enormous robot that cleans my room.", need: { min: 7, use: ["fantastic", "enormous", "important", "together", "volcano", "remember", "carefully", "banana", "dinosaur", "beautiful", "wonderful", "amazing", "telescope", "computer", "elephant", "butterfly", "spaghetti", "tomato", "potato", "animal", "invention", "experiment", "chocolate", "favorite", "different", "excited"], useHint: "Use a three-syllable word, like fantastic, enormous or important." } }
        ],
        sticker: { emoji: "🌋", name: "Foamy Volcano" }
      },
      {
        id: "p4l2", title: "Grandpa's Talking Parrot", skill: "Reading dialogue with expression",
        tip: "Quotation marks show the exact words a character says. Read them the way the character feels! If someone whispered, read softly. If someone shouted, read it big. Your voice is the movie!",
        focus: ["whispered", "shouted", "giggled", "grumbled", "squawked", "announced", "muttered", "exclaimed"],
        chunks: { whispered: "whis·pered", shouted: "shout·ed", giggled: "gig·gled", grumbled: "grum·bled", squawked: "squawked", announced: "an·nounced", muttered: "mut·tered", exclaimed: "ex·claimed" },
        passage: [
          "Grandpa has a green parrot named Captain. Captain repeats everything he hears, which is usually funny and sometimes a disaster. One morning, Grandpa announced, “We are having a fancy dinner tonight. The mayor is coming!” Captain flapped his wings. “The mayor is coming!” he squawked.",
          "All day, we cleaned. Grandpa grumbled about the dust. “This house is a mess,” he muttered under his breath. My sister Nora giggled. “Captain heard that,” she whispered. Captain tilted his head. We all held our breath, but he only ate a sunflower seed.",
          "At seven o'clock, the doorbell rang. The mayor stepped inside, smiling, in a shiny blue suit. “Welcome!” Grandpa exclaimed. Then Captain cleared his throat. “This house is a mess!” he shouted. Grandpa's face turned as red as a tomato. Nora covered her mouth.",
          "But the mayor burst out laughing. “My house is a mess too!” she said. “My dog ate my shoe this morning.” Everyone laughed, and dinner was wonderful. Later, Grandpa looked at Captain and sighed. “Tomorrow,” he whispered, “we practise saying nice things.”"
        ],
        vocab: [{ w: "mayor", def: "the leader of a town or city" }, { w: "disaster", def: "something that goes very, very wrong" }],
        quiz: [
          { q: "What is special about Captain?", choices: ["He repeats everything he hears", "He can fly to the moon", "He can cook dinner"], answer: 0, why: "Captain repeats everything he hears, which is usually funny and sometimes a disaster." },
          { q: "How should you read “This house is a mess,” he muttered?", choices: ["quietly and grumpy", "loud and happy", "fast and excited"], answer: 0, why: "Muttered means talking quietly to yourself, often in a grumpy way." },
          { q: "Why did Grandpa's face turn red?", choices: ["Captain shouted that the house was a mess", "He ate a hot pepper", "He ran up the stairs"], answer: 0, why: "Captain shouted Grandpa's grumpy words in front of the mayor!" },
          { q: "How did the mayor react?", choices: ["She laughed and said her house was messy too", "She left right away", "She got angry"], answer: 0, why: "The mayor burst out laughing. Her dog ate her shoe that morning!" }
        ],
        write: [
          { emoji: "🦜", p: "Why was Captain's shout a problem? Answer in a complete sentence.", model: "Captain shouted that the house was a mess in front of the mayor.", need: { min: 8 } },
          { emoji: "💬", p: "Write what YOUR pet (or a pretend pet) would say. Use a talking word like whispered, shouted, giggled or grumbled.", ideas: ["My cat", "whispered", "shouted", "giggled", "grumbled", "Feed me!"], model: "My cat shouted, Feed me right now or I will sit on your homework!", need: { min: 6, use: ["whispered", "shouted", "giggled", "grumbled", "squawked", "announced", "muttered", "exclaimed", "yelled", "cried", "laughed", "asked", "said", "screamed", "sang", "barked", "meowed", "growled"], useHint: "Use a talking word, like whispered, shouted, giggled or grumbled." } }
        ],
        sticker: { emoji: "🦜", name: "Captain Parrot" }
      },
      {
        id: "p4l3", title: "Lost in the Corn Maze", skill: "Punctuation is your road map",
        tip: "Punctuation tells your voice what to do. A comma means take a tiny pause. A period means stop. A question mark makes your voice go up at the end. An exclamation mark means say it with feeling!",
        focus: ["suddenly", "finally", "direction", "nervous", "signal", "shortcut", "scarecrow", "giant"],
        chunks: { suddenly: "sud·den·ly", finally: "fi·nal·ly", direction: "di·rec·tion", nervous: "ner·vous", signal: "sig·nal", shortcut: "short·cut", scarecrow: "scare·crow", giant: "gi·ant" },
        passage: [
          "The corn maze at Hill Farm was giant. The stalks were taller than Dad, and every path looked the same. “Stay together,” said Mom. But Sam spotted a shortcut, and he ran ahead. Left, right, left again. When he turned around, his family was gone.",
          "Sam's heart beat fast. Which direction was the exit? He felt nervous, and his hands were sweaty. Should he run? Should he yell? Then he remembered what Mom always said: “If you are ever lost, stop, stay calm, and make a signal.”",
          "So Sam stopped. He took three deep breaths. Then he cupped his hands around his mouth and called, “Mom! Dad! I am by the scarecrow!” A big scarecrow with a straw hat was standing right next to him. It looked like it was smiling.",
          "Suddenly, he heard Dad's voice. “Stay right there, buddy!” A minute later, his family came around the corner. Finally, Sam could relax. Mom hugged him tight. “You did exactly the right thing,” she said. Sam smiled. “No more shortcuts,” he said. “Maybe just one.”"
        ],
        vocab: [{ w: "stalks", def: "the tall main stems of plants like corn" }, { w: "signal", def: "a sign or sound that sends a message" }],
        quiz: [
          { q: "Why did Sam get lost?", choices: ["He ran ahead to take a shortcut", "His family left without him", "It got dark"], answer: 0, why: "Sam spotted a shortcut and ran ahead, and then his family was gone." },
          { q: "How should your voice sound when you read “Should he run?”", choices: ["going up at the end, like a question", "very quiet and flat", "like a loud shout"], answer: 0, why: "A question mark makes your voice go up at the end." },
          { q: "What did Sam do that was smart?", choices: ["He stopped, stayed calm, and called out where he was", "He kept running", "He hid in the corn"], answer: 0, why: "He remembered Mom's rule: stop, stay calm, and make a signal." },
          { q: "What does the comma tell you in “Left, right, left again”?", choices: ["take a tiny pause between the words", "stop reading", "shout the words"], answer: 0, why: "Commas mean a tiny pause, like Sam turning each corner." }
        ],
        write: [
          { emoji: "🌽", p: "What should you do if you get lost? Answer in a complete sentence.", model: "If you get lost, you should stop, stay calm, and call for help.", need: { min: 8 } },
          { emoji: "❓", p: "Write a question and an exclamation about a corn maze. Use a question mark and an exclamation mark!", ideas: ["Where is the exit?", "Wow!", "This maze is huge!", "Can you find me?"], model: "Where is the exit? This maze is so huge!", need: { min: 6, sentences: 2, marks: ["?", "!"] } }
        ],
        sticker: { emoji: "🌽", name: "Maze Master" }
      },
      {
        id: "p4l4", title: "The Invention Convention", skill: "Big endings: -tion and -sion",
        tip: "When you see t i o n at the end of a word, it says shun, like in station. S i o n can say shun or zhun, like in television. So in, ven, tion is invention!",
        focus: ["invention", "convention", "attention", "station", "television", "decision", "explosion", "celebration"],
        chunks: { invention: "in·ven·tion", convention: "con·ven·tion", attention: "at·ten·tion", station: "sta·tion", television: "tel·e·vi·sion", decision: "de·ci·sion", explosion: "ex·plo·sion", celebration: "cel·e·bra·tion" },
        passage: [
          "Every spring, our town holds an Invention Convention. Kids bring machines they made at home. This year, Mia made an invention called the Sock Finder. It was a little robot with a magnet, a flashlight, and a very good nose for lost socks.",
          "At her station, Mia set up a pile of laundry. “May I have your attention, please?” she said. A crowd gathered. Even a news crew with a television camera came over. Mia pressed the big green button, and the Sock Finder rolled into the pile.",
          "It beeped and blinked. Then there was a loud pop, almost like an explosion, and socks flew everywhere! One landed on the reporter's head. For a moment, nobody moved. Mia had to make a quick decision. Should she cry, or should she laugh?",
          "She laughed, and so did everyone else. “It finds socks,” she said, “and then it shares them!” The judges loved her good attitude, and she won the prize for Most Surprising Invention. That night, her family had a celebration with pizza, and every single sock was finally matched."
        ],
        vocab: [{ w: "convention", def: "a big meeting where people show and share things" }, { w: "attitude", def: "the way you think and feel about something" }],
        quiz: [
          { q: "What did Mia's invention do?", choices: ["It found lost socks", "It made pizza", "It cleaned windows"], answer: 0, why: "Mia made the Sock Finder, a robot with a good nose for lost socks." },
          { q: "What went wrong during the show?", choices: ["It popped and threw socks everywhere", "It would not turn on", "It rolled out the door"], answer: 0, why: "There was a loud pop, and socks flew everywhere. One landed on the reporter's head!" },
          { q: "What sound does tion make at the end of station?", choices: ["shun", "tee-on", "ton"], answer: 0, why: "T i o n at the end of a word says shun: sta-shun." },
          { q: "Why did Mia win a prize?", choices: ["She kept a good attitude and her invention surprised everyone", "Her robot was the biggest", "She was the only kid there"], answer: 0, why: "The judges loved her good attitude, and she won Most Surprising Invention." }
        ],
        write: [
          { emoji: "🧦", p: "How did Mia handle her invention's mistake? Answer in a complete sentence.", model: "Mia laughed and made a joke, so everyone laughed with her.", need: { min: 7 } },
          { emoji: "💡", p: "Describe an invention you would make. Use a -tion or -sion word, like invention, station or decision.", ideas: ["My invention", "is a machine that", "station", "attention", "television"], model: "My invention is a homework station that does math with me.", need: { min: 8, ends: ["tion", "sion", "tions", "sions"], teamHint: "Use a word that ends in -tion or -sion, like invention, station or decision." } }
        ],
        sticker: { emoji: "🧦", name: "Sock Finder" }
      }
    ],
    check: {
      title: "The Museum Sleepover",
      passage: [
        "Our class won a contest, and the prize was fantastic: a sleepover at the natural history museum! We brought sleeping bags, flashlights, and enormous bags of popcorn. Our teacher, Mr. Ortiz, announced the rules. “Stay with your buddy, and do not touch the dinosaurs.”",
        "We set up our sleeping bags right under a giant dinosaur skeleton. When the lights went out, the museum felt different. Shadows stretched across the walls. My buddy Jada whispered, “Did that dinosaur just move?” I giggled, but my heart was thumping.",
        "Suddenly, we heard a strange tapping sound. Tap, tap, tap. Everyone sat up. Mr. Ortiz pointed his flashlight down the hall. The tapping got closer and closer. Jada grabbed my arm. Then, around the corner came a small robot vacuum, bumping into the wall.",
        "The whole class burst out laughing. The museum guard explained that the robot cleans every night. “It always gets everyone's attention,” he said with a wink. We finally fell asleep under the dinosaur. In the morning, I made a decision: museums are even better at night."
      ],
      quiz: [
        { q: "Why did the class get to sleep at the museum?", choices: ["They won a contest", "Their school was closed", "It was a birthday party"], answer: 0, why: "The class won a contest, and the prize was a museum sleepover." },
        { q: "Where did they put their sleeping bags?", choices: ["under a giant dinosaur skeleton", "in the gift shop", "outside on the lawn"], answer: 0, why: "They set up right under a giant dinosaur skeleton." },
        { q: "How should you read Jada's line, “Did that dinosaur just move?”", choices: ["in a quiet, scared whisper", "in a big happy shout", "in a bored voice"], answer: 0, why: "Jada whispered, and the room was dark and spooky." },
        { q: "What was making the tapping sound?", choices: ["a robot vacuum", "a real dinosaur", "Mr. Ortiz"], answer: 0, why: "A small robot vacuum came around the corner, bumping into the wall." },
        { q: "How many syllables are in the word decision?", choices: ["three", "two", "four"], answer: 0, why: "De · ci · sion. Three chunks!" },
        { q: "What does the narrator decide at the end?", choices: ["Museums are even better at night", "Museums are too scary", "Dinosaurs are boring"], answer: 0, why: "In the morning the narrator decided museums are even better at night." }
      ]
    }
  },
  {
    id: "p5", n: 5, title: "Root Planet", sub: "Word roots & vocabulary (4th-grade words)", goal: 110,
    color: "#f06595", accent: "#c2255c", badge: { emoji: "🌍", name: "Root Planet Badge" },
    lessons: [
      {
        id: "p5l1", title: "Grandma's Pizza Rocket", skill: "Root port = carry",
        tip: "A root is the heart of a word. Port means carry. A porter carries bags. Portable means easy to carry. Transport means carry across. Find the root, and you can guess what the word means!",
        focus: ["portable", "transport", "airport", "porter", "report", "imported"],
        chunks: { portable: "port·a·ble", transport: "trans·port", airport: "air·port", porter: "port·er", report: "re·port", imported: "im·port·ed" },
        passage: [
          "Grandma Rosa loves pizza more than anything in the world. So for her birthday, our family bought her a portable pizza oven. It was small enough to carry in one hand, but it could bake a pizza in ninety seconds. Grandma called it her pizza rocket.",
          "That summer, we flew to visit Uncle Teo. Grandma refused to leave her oven at home. She carried it through the whole airport like a baby. A porter offered to help with her bags. “Thank you,” said Grandma, “but nobody carries the pizza rocket except me.”",
          "At security, the oven went through the scanner, and a guard frowned at the screen. “Ma'am, what is this?” he asked. “It is my portable pizza oven,” Grandma said proudly. “I transport it everywhere. Would you like a slice when we land?” The guard tried very hard not to smile.",
          "When we arrived, Uncle Teo had a surprise. He had imported fancy cheese from Italy just for her. Grandma baked twelve pizzas in the backyard. Later, I wrote a report for school called “How to Transport a Pizza Oven.” My teacher gave me an A and asked for Grandma's recipe."
        ],
        vocab: [{ w: "portable", def: "easy to carry from place to place" }, { w: "import", def: "to bring something in from another country" }],
        quiz: [
          { q: "What does the root port mean?", choices: ["carry", "see", "write"], answer: 0, why: "Port means carry. Portable means easy to carry, and a porter carries bags." },
          { q: "Why did Grandma carry the oven through the airport herself?", choices: ["Nobody carries the pizza rocket except her", "It was too big for the plane", "She was trying to sell it"], answer: 0, why: "Grandma said, “Nobody carries the pizza rocket except me.”" },
          { q: "What does transport mean in “I transport it everywhere”?", choices: ["carry it from place to place", "bake it", "hide it"], answer: 0, why: "Trans means across and port means carry. She carries it everywhere she goes." },
          { q: "What did Uncle Teo import for Grandma?", choices: ["fancy cheese from Italy", "a new oven", "a pizza box"], answer: 0, why: "He imported fancy cheese from Italy just for her." }
        ],
        write: [
          { emoji: "🍕", p: "Why did the guard frown at the screen? Answer in a complete sentence.", model: "The guard saw a strange machine in Grandma's bag and did not know it was a pizza oven.", need: { min: 8 } },
          { emoji: "🧳", p: "What would you love to have a portable one of? Use a port word, like portable, transport or airport.", ideas: ["I wish I had a portable", "because", "transport", "carry"], model: "I wish I had a portable swimming pool so I could transport it to school.", need: { min: 8, team: ["port"], teamHint: "Use a word with the root port in it, like portable, transport or airport." } }
        ],
        sticker: { emoji: "🍕", name: "Pizza Rocket" }
      },
      {
        id: "p5l2", title: "The Telescope Mix-Up", skill: "Roots tele = far, scope = look",
        tip: "Tele means far away. Scope means a tool for looking. So a telescope is a tool for looking at things far away! A microscope looks at tiny things, and a telephone sends your voice far away. Roots fit together like puzzle pieces.",
        focus: ["telescope", "microscope", "telephone", "periscope"],
        chunks: { telescope: "tel·e·scope", microscope: "mi·cro·scope", telephone: "tel·e·phone", periscope: "per·i·scope" },
        passage: [
          "Maya got a telescope for her birthday. It was long and shiny, and it could see things very far away. On the first clear night, she pointed it out her bedroom window. She was hoping to spot the rings of Saturn, or maybe even an alien waving hello.",
          "Instead, she saw something strange. A huge, hairy eyeball was staring right back at her! Maya screamed and dropped the telescope on her bed. She grabbed the telephone and called her best friend Leo. “There is a giant eyeball in the sky!” she whispered.",
          "Leo came over with his periscope, the one he made from a cereal box and two mirrors. They peeked out the window together. Leo looked. Maya looked. Then they both started laughing so hard they fell off the bed. The giant eyeball belonged to Mr. Patel's cat.",
          "The cat was sitting on the fence, pressing its face against the end of the telescope. Through the lens, its eye had looked enormous. “Next time,” said Leo, “point it at the sky. For cat hair up close, use a microscope!” That night Maya found the Moon, and it was even better than an alien."
        ],
        vocab: [{ w: "lens", def: "a curved piece of glass that makes things look bigger or clearer" }, { w: "periscope", def: "a tube with mirrors that lets you see over or around things" }],
        quiz: [
          { q: "Tele means far. What does a telescope help you do?", choices: ["see things far away", "hear tiny sounds", "write faster"], answer: 0, why: "Tele means far and scope means a tool for looking." },
          { q: "What was the giant eyeball, really?", choices: ["Mr. Patel's cat", "an alien", "the Moon"], answer: 0, why: "The giant eyeball belonged to Mr. Patel's cat, sitting on the fence." },
          { q: "Why did the cat's eye look so huge?", choices: ["It was pressed against the end of the telescope", "The cat was a giant", "Maya was dreaming"], answer: 0, why: "Through the lens, the cat's eye looked enormous." },
          { q: "A microscope helps you look at things that are…", choices: ["very tiny", "very far away", "very loud"], answer: 0, why: "Micro means small and scope means a tool for looking." }
        ],
        write: [
          { emoji: "🔭", p: "What did Maya find when she finally pointed the telescope at the sky? Answer in a complete sentence.", model: "Maya found the Moon, and it was even better than an alien.", need: { min: 7 } },
          { emoji: "🔬", p: "If you had a microscope or a telescope, what would you look at? Use a tele or scope word.", ideas: ["I would use my", "telescope", "microscope", "to look at", "because"], model: "I would use my microscope to look at a drop of pond water.", need: { min: 8, team: ["tele", "scope"], teamHint: "Use a word with tele or scope in it, like telescope, microscope or telephone." } }
        ],
        sticker: { emoji: "🔭", name: "Star Spotter" }
      },
      {
        id: "p5l3", title: "The Autograph Oops", skill: "Root graph = write or draw",
        tip: "Graph means write or draw. An autograph is your own name, written by you. A photograph is a picture drawn with light. A paragraph is a group of written sentences. When you spot graph, think: writing or drawing!",
        focus: ["autograph", "photograph", "photographer", "paragraph", "biography", "autobiography"],
        chunks: { autograph: "au·to·graph", photograph: "pho·to·graph", photographer: "pho·tog·ra·pher", paragraph: "par·a·graph", biography: "bi·og·ra·phy", autobiography: "au·to·bi·og·ra·phy" },
        passage: [
          "Famous soccer star Zoe Ramos was coming to our library to sign her new book, a biography about her life. I had read every paragraph of it twice. I practised what I would say to her in the mirror. “Hello, Ms. Ramos. You are my hero. May I please have your autograph?”",
          "The line was long, and I was so nervous my knees wobbled like jelly. A photographer was snapping pictures of every kid. When it was finally my turn, I opened my mouth, and out came, “Hello, Ms. Hero. You are my autograph.” Everyone heard. My face turned the color of ketchup.",
          "Zoe Ramos laughed, but it was a kind laugh. “That is the best thing anyone has said all day,” she said. She signed my book with a big, swoopy autograph. Then she drew a tiny soccer ball next to it and wrote, “To my number one fan. Keep kicking!”",
          "The photographer took a photograph of us together, both making silly faces. Now it hangs on my bedroom wall. For class, I wrote a paragraph about that day. My teacher said it was so funny that someday I should write my own autobiography. I already know the first line."
        ],
        vocab: [{ w: "biography", def: "a true story about someone's life, written by another person" }, { w: "autograph", def: "a person's name, signed in their own handwriting" }],
        quiz: [
          { q: "What does the root graph mean?", choices: ["write or draw", "carry", "look"], answer: 0, why: "Graph means write or draw: autograph, photograph, paragraph." },
          { q: "What did the narrator say by accident?", choices: ["“Hello, Ms. Hero. You are my autograph.”", "“I do not like soccer.”", "“Can I have your shoes?”"], answer: 0, why: "Nervous words got mixed up: “Hello, Ms. Hero. You are my autograph.”" },
          { q: "How did Zoe Ramos make the narrator feel better?", choices: ["She laughed kindly and said it was the best thing anyone said", "She left quickly", "She took the book back"], answer: 0, why: "It was a kind laugh, and she said it was the best thing anyone had said all day." },
          { q: "An autobiography is a life story written by…", choices: ["the person themselves", "a teacher", "a photographer"], answer: 0, why: "Auto means self, bio means life, and graph means write: your own life, written by you!" }
        ],
        write: [
          { emoji: "⚽", p: "What did Zoe Ramos write in the book? Answer in a complete sentence.", model: "She wrote, To my number one fan, keep kicking!", need: { min: 7 } },
          { emoji: "📸", p: "Whose autograph would you want, and why? Use a graph word like autograph, photograph or paragraph.", ideas: ["I would want the autograph of", "because", "photograph", "famous"], model: "I would want the autograph of a real astronaut because I want to fly to space.", need: { min: 9, team: ["graph"], teamHint: "Use a word with graph in it, like autograph, photograph or paragraph." } }
        ],
        sticker: { emoji: "✍️", name: "Super Fan" }
      },
      {
        id: "p5l4", title: "Bookshelf Chaos", skill: "Root struct = build",
        tip: "Struct means build. To construct something is to build it. A structure is something that was built, like a bridge or a fort. Instructions tell you how to build it. And destruction? That is when it all falls down!",
        focus: ["construct", "structure", "instructions", "destruction", "instructor", "reconstructed"],
        chunks: { construct: "con·struct", structure: "struc·ture", instructions: "in·struc·tions", destruction: "de·struc·tion", instructor: "in·struc·tor", reconstructed: "re·con·struct·ed" },
        passage: [
          "Dad and I decided to construct a bookshelf for my room. The box said, “Easy to build! Only thirty minutes!” We spread all the pieces across the floor. There were boards, screws, little wooden pegs, and one tiny metal key that looked very important.",
          "Dad said, “Who needs instructions?” and tossed the paper over his shoulder. Two hours later, our structure looked less like a bookshelf and more like a strange sculpture. One shelf was upside down. Another pointed at the ceiling. The cat crawled inside and refused to come out.",
          "Then I put one book on the top shelf. Creak. Wobble. Crash! The whole thing collapsed into a pile of boards, with the cat sitting on top like a king. Mom peeked in the door. “Wow,” she said. “I have never seen such fast destruction.”",
          "So I picked up the instructions and read them out loud, step by step. Dad followed along, and this time we read every word. Together, we reconstructed the bookshelf in twenty minutes. It was strong and straight. Dad looked at me and said, “From now on, you are the instructor.”"
        ],
        vocab: [{ w: "collapsed", def: "fell down all at once" }, { w: "sculpture", def: "art made by shaping clay, wood, metal or stone" }],
        quiz: [
          { q: "What does the root struct mean?", choices: ["build", "break", "see"], answer: 0, why: "Struct means build: construct, structure, instructions." },
          { q: "Why did the first bookshelf fall apart?", choices: ["Dad did not follow the instructions", "The cat chewed it", "The books were too light"], answer: 0, why: "Dad tossed the instructions over his shoulder, so the shelves went in wrong." },
          { q: "What does reconstruct mean?", choices: ["build it again", "break it", "paint it"], answer: 0, why: "Re means again and struct means build, so reconstruct means build it again." },
          { q: "Who became the instructor at the end?", choices: ["the narrator", "Dad", "the cat"], answer: 0, why: "Dad said, “From now on, you are the instructor.”" }
        ],
        write: [
          { emoji: "📚", p: "How did they finally build a strong bookshelf? Answer in a complete sentence.", model: "They read the instructions step by step and built it again.", need: { min: 8 } },
          { emoji: "🏰", p: "What structure would you love to construct? Use a struct word like construct, structure or instructions.", ideas: ["I would construct", "a giant", "structure", "with", "instructions"], model: "I would construct a giant pillow fort with a secret tunnel.", need: { min: 8, team: ["struct"], teamHint: "Use a word with struct in it, like construct, structure or instructions." } }
        ],
        sticker: { emoji: "🛠️", name: "Master Builder" }
      }
    ],
    check: {
      title: "The Space Camp Report",
      passage: [
        "This summer, I went to Space Camp, and my teacher asked me to write a report about it. Here it is. On the first day, a bus transported us to a building shaped like a rocket. Our instructor, Captain Lee, gave each of us a portable radio and a name tag.",
        "Our first mission was to construct a model rocket from cardboard, tape and straws. My team read the instructions carefully, but our rocket still had a strange structure. It leaned to one side like it was tired. Captain Lee said, “Leaning rockets are very fashionable this year.”",
        "That night, we looked through a giant telescope. I saw the craters on the Moon so clearly that I gasped. A photographer took a photograph of me with my mouth wide open. It looks like I am trying to eat the Moon. Captain Lee says it is my best picture.",
        "On the last day, we launched our rockets. Ours wobbled, spun in a circle, and landed in a bush, but it flew! Captain Lee signed my certificate with a big autograph. I learned that word roots are like rocket parts. Put them together the right way, and your reading takes off."
      ],
      quiz: [
        { q: "How did the campers get to the building?", choices: ["A bus transported them", "They walked", "They flew in a rocket"], answer: 0, why: "On the first day, a bus transported them to a building shaped like a rocket." },
        { q: "What was strange about the team's rocket?", choices: ["It leaned to one side", "It was invisible", "It was made of cheese"], answer: 0, why: "It leaned to one side like it was tired." },
        { q: "What does the root scope tell you about a telescope?", choices: ["It is a tool for looking", "It is for carrying", "It is for writing"], answer: 0, why: "Scope means a tool for looking. Tele means far." },
        { q: "Why does the photograph look funny?", choices: ["The narrator's mouth was wide open, like eating the Moon", "Captain Lee was upside down", "The camera was broken"], answer: 0, why: "It looks like the narrator is trying to eat the Moon!" },
        { q: "Which word means “to build”?", choices: ["construct", "transport", "autograph"], answer: 0, why: "Struct means build, so construct means to build." },
        { q: "What did the narrator learn about word roots?", choices: ["They fit together like rocket parts to help you read", "They are only for science", "They are too hard to learn"], answer: 0, why: "Put roots together the right way, and your reading takes off." }
      ]
    }
  },
  {
    id: "p6", n: 6, title: "Robot Academy", sub: "Main idea & inference, with robots and AI", goal: 120,
    color: "#fcc419", accent: "#e67700", badge: { emoji: "🤖", name: "Robot Academy Badge" },
    lessons: [
      {
        id: "p6l1", title: "Bolt Gets a Name", skill: "Main idea: what is it mostly about?",
        tip: "The main idea is what a story is mostly about. Details are the small facts that hold it up, like the legs of a table. Scan like a robot! Ask: who is this mostly about, and what is the big thing that happens?",
        focus: ["robot", "computer", "sensors", "election", "program", "important"],
        chunks: { robot: "ro·bot", computer: "com·pu·ter", sensors: "sen·sors", election: "e·lec·tion", program: "pro·gram", important: "im·por·tant" },
        passage: [
          "On Monday, a big box arrived in Room Twelve. Inside was a shiny robot with wheels, two long arms and a screen for a face. A note on the box said, “Classroom Helper, Model Seven.” Ms. Ortiz smiled at the class. “It needs a name,” she said. “And I think you should choose it.”",
          "The robot had sensors that let it see and hear. It rolled around the room, passing out papers and watering the plants. When Ruby dropped her pencils, it picked up every single one. Its computer screen showed a happy face each time someone said thank you. Everyone wanted to give it a name.",
          "So the class held an election. Jamal wanted Sparky. Lily wanted Professor Beep. Ben wanted Pizza, because pizza was his favorite thing in the whole world. The class made posters and gave speeches. Ms. Ortiz even helped them program the robot to count the votes on its screen.",
          "The vote ended in a tie between three names! Nobody knew what to do. Then the robot rolled to the front of the room. Its screen blinked and showed a new word: BOLT. “I choose Bolt,” it beeped, “because I am fast and I love to help.” The whole class cheered. Sometimes the most important vote is your own."
        ],
        vocab: [{ w: "sensors", def: "parts of a machine that notice light, sound or touch" }, { w: "election", def: "a way for a group to choose something by voting" }],
        quiz: [
          { q: "What is this story mostly about? (That's the main idea!)", choices: ["A class choosing a name for their new robot helper", "Ben's favorite food", "How to water plants"], answer: 0, why: "Almost every paragraph is about naming the robot. That is the big idea; the rest are details." },
          { q: "Which detail shows the robot was helpful?", choices: ["It picked up every one of Ruby's pencils", "It arrived in a box", "Ben wanted to call it Pizza"], answer: 0, why: "Picking up Ruby's pencils is a detail that shows the robot helping." },
          { q: "Why do you think the screen showed a happy face when someone said thank you?", choices: ["It was programmed to show it liked being thanked", "It was broken", "It was hungry"], answer: 0, why: "Robots do what they are programmed to do. Someone made it smile when people were kind." },
          { q: "🤖 Robot glitch! Nova's memory chip mixed up the story. Which sentence is TRUE?", choices: ["The vote ended in a tie", "The class named the robot Pizza", "Ms. Ortiz chose the name"], answer: 0, why: "The vote ended in a tie, so the robot chose its own name: Bolt." }
        ],
        write: [
          { emoji: "🤖", p: "What is the main idea of this story? Answer in one complete sentence.", ideas: ["This story is mostly about", "a class", "robot", "name"], model: "This story is mostly about a class choosing a name for their robot helper.", need: { min: 8 } },
          { emoji: "🏷️", p: "If your class got a robot helper, what would you name it, and why?", ideas: ["I would name it", "because", "robot", "helper"], model: "I would name our robot Zippy because it would zoom around the room helping everyone.", need: { min: 9 } }
        ],
        sticker: { emoji: "🤖", name: "Robot Namer" }
      },
      {
        id: "p6l2", title: "Shelly the Beach Robot", skill: "Inference: clues + what I know",
        tip: "Authors do not tell you everything, so you have to be a detective! An inference is a smart guess. Take a clue from the story and add what you already know. If someone shakes a wet umbrella, you can infer it is raining outside.",
        focus: ["solar", "battery", "plastic", "recycle", "turtle", "ocean"],
        chunks: { solar: "so·lar", battery: "bat·ter·y", plastic: "plas·tic", recycle: "re·cy·cle", turtle: "tur·tle", ocean: "o·cean" },
        passage: [
          "Every morning at sunrise, a small robot crawled out of a shed on Pelican Beach. Her name was Shelly. She had six legs like a crab and a solar panel on her back, so the sunshine filled her battery. Her job was to search the sand for plastic and carry it to the recycle bin.",
          "One day, a girl named Kai sat watching her. Shelly picked up a bottle cap, a straw and a broken toy shovel. Kai frowned. “Why does a robot have to do this?” she asked her dad. Her dad pointed at a sign near the dunes. It showed a sea turtle tangled in a plastic bag.",
          "That afternoon, dark clouds rolled over the ocean. Shelly moved slower and slower. Her lights flickered. Then she stopped completely, right in the middle of the sand, with a straw still in her claw. The waves were creeping closer. Kai looked at the gray sky, then at the little robot, and jumped up.",
          "Kai and her dad carried Shelly back to her shed. Then Kai grabbed a bucket and finished the job herself. By sunset, the bucket was full. The next morning, the sun came out, and Shelly crawled out again. Taped to her shed was a new sign in Kai's handwriting: “Shelly's Helper. Reporting for duty.”"
        ],
        vocab: [{ w: "solar panel", def: "a flat part that turns sunlight into power" }, { w: "tangled", def: "twisted up and stuck" }],
        quiz: [
          { q: "Why did Shelly slow down and stop? Make an inference!", choices: ["Clouds blocked the sun, so her solar battery ran low", "She was tired of picking up plastic", "Kai turned her off"], answer: 0, why: "Clue: dark clouds rolled in. What you know: solar panels need sunshine. Inference: her battery ran low!" },
          { q: "What can you infer from the sign with the turtle?", choices: ["Plastic on the beach can hurt sea animals", "Turtles love plastic bags", "The beach is closed"], answer: 0, why: "The turtle was tangled in a bag. That tells you why the plastic must be cleaned up." },
          { q: "Why did Kai jump up when the waves crept closer?", choices: ["She was worried the waves would wash Shelly away", "She wanted to go swimming", "She saw a shark"], answer: 0, why: "Shelly was stuck on the sand and the waves were coming. Kai wanted to save her." },
          { q: "🤖 Robot glitch! Nova's memory chip mixed up the story. Which sentence is TRUE?", choices: ["Shelly has six legs like a crab", "Shelly runs on gasoline", "Kai's dad finished the job by himself"], answer: 0, why: "Shelly has six legs like a crab and runs on sunshine. Kai finished the job herself." }
        ],
        write: [
          { emoji: "☁️", p: "Why did Shelly stop working? Use a clue from the story.", ideas: ["Shelly stopped because", "clouds", "sun", "battery"], model: "Shelly stopped because the clouds blocked the sun and her solar battery ran low.", need: { min: 9 } },
          { emoji: "🐢", p: "Kai became Shelly's helper. How could you help keep a beach or a park clean?", ideas: ["I could", "pick up", "plastic", "recycle", "so that"], model: "I could pick up plastic at the park so that animals stay safe.", need: { min: 8 } }
        ],
        sticker: { emoji: "🦀", name: "Beach Guardian" }
      },
      {
        id: "p6l3", title: "The Robot Chef Disaster", skill: "Cause and effect",
        tip: "A cause is why something happens. An effect is what happens because of it. Words like because and so are clue words. Robots follow their program exactly, so one tiny mistake can cause a giant effect!",
        focus: ["chef", "recipe", "kitchen", "teaspoon", "measured", "exactly"],
        chunks: { chef: "chef", recipe: "rec·i·pe", kitchen: "kitch·en", teaspoon: "tea·spoon", measured: "meas·ured", exactly: "ex·act·ly" },
        passage: [
          "Uncle Ray loves gadgets, so for his birthday he bought a robot chef named Chef Clank. It had four arms, a mixing bowl for a belly and a tiny white chef hat. “Chef Clank can follow any recipe exactly,” Uncle Ray told me. “Tonight, it will bake your mom's birthday cake.”",
          "I typed in the recipe while Uncle Ray went to buy candles. But my finger slipped. Instead of one teaspoon of salt, I typed one hundred teaspoons. Chef Clank did not ask any questions. It measured every single teaspoon, spinning its arms so fast that salt flew all over the kitchen like snow.",
          "When the cake came out of the oven, it looked perfect. Mom took one big bite. Her eyes went wide. Her cheeks turned pink. She drank three glasses of water without stopping. “It is very… interesting,” she said politely, and then she ran back to the sink for a fourth glass.",
          "Uncle Ray checked the screen and saw my mistake. I felt terrible, but he just laughed. “Robots do exactly what we tell them,” he said, “so we have to tell them carefully.” Together we fixed the recipe and baked a second cake. This time, Chef Clank even wrote Happy Birthday in perfect blue letters."
        ],
        vocab: [{ w: "gadgets", def: "small, clever machines or tools" }, { w: "politely", def: "in a kind way, with good manners" }],
        quiz: [
          { q: "What caused the cake to taste so salty?", choices: ["The narrator typed one hundred teaspoons of salt by mistake", "Chef Clank was broken", "Mom added the salt"], answer: 0, why: "Cause: a slipped finger typed one hundred teaspoons. Effect: a very salty cake!" },
          { q: "What was one effect of the salty cake?", choices: ["Mom drank glass after glass of water", "Mom asked for a second slice", "Mom fell asleep"], answer: 0, why: "She drank three glasses of water, then ran back for a fourth." },
          { q: "Why didn't Chef Clank notice the mistake?", choices: ["Robots do exactly what they are told", "It was asleep", "It wanted to play a joke"], answer: 0, why: "Uncle Ray said, “Robots do exactly what we tell them.”" },
          { q: "🤖 Robot glitch! Nova's memory chip mixed up the story. Which sentence is TRUE?", choices: ["Uncle Ray laughed instead of getting angry", "The second cake was salty too", "Chef Clank had two arms"], answer: 0, why: "Uncle Ray just laughed. Chef Clank had four arms, and the second cake was perfect." }
        ],
        write: [
          { emoji: "🧂", p: "What caused the cake disaster? Use the word because.", ideas: ["The cake was salty because", "typed", "one hundred", "mistake"], model: "The cake was too salty because the narrator typed one hundred teaspoons of salt by mistake.", need: { min: 9, team: ["because"], teamHint: "Use the clue word because to show the cause." } },
          { emoji: "🎂", p: "If you had a robot chef, what would you ask it to cook? What could go wrong?", ideas: ["I would ask my robot to cook", "but", "so", "might"], model: "I would ask my robot to cook pancakes, but it might flip them onto the ceiling.", need: { min: 10 } }
        ],
        sticker: { emoji: "🎂", name: "Robot Chef" }
      },
      {
        id: "p6l4", title: "Grandpa Meets the Talking Egg", skill: "Infer feelings from actions",
        tip: "Authors often show feelings instead of telling them. If a character slams a door, you can infer they are angry. If they tap their foot to music, they are starting to enjoy it. Watch what characters do and say, and you can read their feelings.",
        focus: ["assistant", "artificial", "intelligence", "intelligent", "learning", "mistakes", "patient"],
        chunks: { assistant: "as·sis·tant", artificial: "ar·ti·fi·cial", intelligence: "in·tel·li·gence", intelligent: "in·tel·li·gent", learning: "learn·ing", mistakes: "mis·takes", patient: "pa·tient" },
        passage: [
          "Grandpa Joe is eighty years old, and he does not trust computers. So when my cousin gave him a smart assistant named Ada, he crossed his arms and grumbled. Ada was a small speaker shaped like an egg. “Artificial intelligence,” Grandpa muttered. “Next they will want my toaster to talk.”",
          "The first day was a disaster. Grandpa asked Ada to play some jazz, and she ordered him a pair of jeans. He asked about the weather, and she told him a joke about a cow. Grandpa threw his hat on the floor. “This egg is not intelligent at all!” he shouted at the ceiling.",
          "I sat down next to him. “Ada is still learning, Grandpa,” I explained. “She learns from lots of examples, and from her mistakes, just like we do. Try speaking slowly and clearly.” Grandpa sighed, picked up his hat and leaned close to the egg. “Ada,” he said very slowly, “please play some jazz.”",
          "Soft trumpet music filled the room. The corner of Grandpa's mouth twitched. Then he tapped his foot. By dinner he was asking Ada about baseball scores, soup recipes and the names of stars. When I left, he waved and whispered, “Ada, remind me to call my patient grandkid tomorrow.” I smiled all the way home."
        ],
        vocab: [{ w: "artificial intelligence", def: "computer programs that learn from examples so they can answer, sort or help" }, { w: "muttered", def: "said quietly in a grumpy way" }],
        quiz: [
          { q: "How did Grandpa feel about Ada at first? How do you know?", choices: ["Grumpy, because he crossed his arms and grumbled", "Excited, because he jumped for joy", "Sleepy, because he yawned"], answer: 0, why: "Crossing your arms and grumbling are actions that show a grumpy feeling." },
          { q: "How does artificial intelligence like Ada learn, according to the story?", choices: ["From lots of examples and from mistakes", "By eating batteries", "By sleeping all night"], answer: 0, why: "“She learns from lots of examples, and from her mistakes, just like we do.”" },
          { q: "Grandpa tapped his foot to the music. What can you infer?", choices: ["He was starting to enjoy Ada", "His foot hurt", "He wanted Ada to stop"], answer: 0, why: "Tapping your foot to music shows you like it. His feelings were changing!" },
          { q: "🤖 Robot glitch! Nova's memory chip mixed up the story. Which sentence is TRUE?", choices: ["Ada ordered jeans when Grandpa asked for jazz", "Ada is shaped like a banana", "Grandpa gave Ada away"], answer: 0, why: "Jazz and jeans sound a bit alike, so Ada got mixed up. She was still learning." }
        ],
        write: [
          { emoji: "🥚", p: "How did Grandpa's feelings change from the beginning to the end?", ideas: ["At first Grandpa was", "but at the end", "grumpy", "happy"], model: "At first Grandpa was grumpy, but at the end he enjoyed talking to Ada.", need: { min: 10 } },
          { emoji: "🧠", p: "If you could teach an AI helper one thing, what would you teach it, and why?", ideas: ["I would teach my helper", "because", "examples", "learn"], model: "I would teach my helper to tell good jokes because laughing makes everyone happy.", need: { min: 10 } }
        ],
        sticker: { emoji: "🧠", name: "AI Coach" }
      }
    ],
    check: {
      title: "The Rover That Would Not Quit",
      passage: [
        "Far away on Mars, a robot rover named Dash rolled across the red dust. Scientists on Earth had built Dash to look for clues about water. Every day, they sent instructions across millions of miles of space. Each message took about twenty minutes to arrive, so Dash had to make some choices on its own.",
        "One morning, a dust storm swept over the plain. The sky turned orange, then brown, then almost black. Dash's solar panels were covered in dust, and its battery dropped lower and lower. Back on Earth, the team stared at their screens. Nobody talked. Someone quietly put down a cup of coffee and never picked it up again.",
        "Dash had been programmed to protect itself. It turned off its camera, its arm and its heater. It sent one last tiny message: “Sleeping. Battery low.” Then everything went silent. For thirty days, the scientists listened every night. Many of them believed they would never hear from the brave little rover again.",
        "Then one night, a strong wind blew across Mars and swept the dust off the solar panels. The sun poured in, and the battery slowly filled. A message arrived on Earth: “Awake. Ready to explore.” The control room burst into cheers and hugs. A week later, Dash rolled up to a rock that had been shaped by ancient water."
      ],
      quiz: [
        { q: "What is the main idea of this story?", choices: ["A Mars rover survives a dust storm and keeps exploring", "How to make a cup of coffee", "Why Mars is red"], answer: 0, why: "Every paragraph is about Dash, the storm, and how it came back to explore." },
        { q: "Why did Dash have to make some choices on its own?", choices: ["Messages from Earth took about twenty minutes to arrive", "The scientists were asleep", "It did not like following orders"], answer: 0, why: "Each message took about twenty minutes, so Dash could not wait for every instruction." },
        { q: "Nobody talked, and someone put down their coffee. What can you infer about the team?", choices: ["They were very worried about Dash", "They were bored", "They were on a lunch break"], answer: 0, why: "Silence and a forgotten coffee are clues that show they were worried." },
        { q: "Why did Dash turn off its camera, arm and heater?", choices: ["To save its battery during the storm", "Because its job was finished", "Because the scientists were angry"], answer: 0, why: "Dash was programmed to protect itself, so it saved every bit of power." },
        { q: "What caused Dash to wake up?", choices: ["Wind blew the dust off its solar panels", "A scientist flew to Mars", "It started to rain"], answer: 0, why: "Cause: wind cleaned the panels. Effect: sunlight filled the battery." },
        { q: "🤖 Robot glitch! Nova's memory chip mixed up the story. Which sentence is TRUE?", choices: ["Dash found a rock shaped by ancient water", "Dash was built to look for gold", "Dash slept for only two days"], answer: 0, why: "Dash was built to look for clues about water, slept for thirty days, and then found the rock." }
      ]
    }
  },
  /* Planned AI & robotics phases (coming soon): one phase per request. */
  { id: "p7", n: 7, title: "AI Explorer Lab", sub: "True articles: how AI learns, fact vs. opinion", goal: 125, color: "#22b8cf", accent: "#0c8599", badge: { emoji: "🧠", name: "AI Explorer Badge" } },
  { id: "p8", n: 8, title: "Robot Engineers", sub: "How-to texts, sequence & problem-solution", goal: 130, color: "#cc5de8", accent: "#9c36b5", badge: { emoji: "🦾", name: "Robot Engineer Badge" } },
  { id: "p9", n: 9, title: "4th-Grade Star", sub: "Compare & contrast, author's purpose, summarize", goal: 135, color: "#ff6b6b", accent: "#e03131", badge: { emoji: "⭐", name: "4th-Grade Star Badge" } }
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
  { id: "rocket-writer", icon: "✏️", name: "Rocket Writer", desc: "Finish 3 Write It missions" },
  { id: "brave-heart", icon: "💪", name: "Brave Heart", desc: "Win a Brave badge for trying hard words" },
  { id: "lv-explorer", icon: "🧭", name: "Word Explorer", desc: "Reach the Medium reading level" },
  { id: "lv-super", icon: "⭐", name: "Super Reader", desc: "Reach the Hard reading level" },
  { id: "lv-expert", icon: "🏆", name: "Expert Reader", desc: "Reach Expert: grade-level reading" }
];
