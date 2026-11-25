/* ============================================================
   Bongo's Syllable Beats — lessons
   ------------------------------------------------------------
   Two tracks, each from easy to grade level:
     SY_TRACKS.kg  Kindergarten: hear and clap the beats (1 → 4)
     SY_TRACKS.g3  Grade 3: chop words by the six syllable rules,
                   prefixes/suffixes, then big grade-level words

   Word: W("rab-bit", "🐰", "fun memory note", say?)
     • "-" marks each syllable (the chop places are checked by
       test/syllables.js against the letters of the word).
     • say = optional sounds for read-aloud when the browser voice
       would spell a chunk out ("ble" → "bul").
   Lesson:
     id, title, emoji, sticker {emoji,name}, intro (Bongo says),
     trick (memory trick), joke {q,a}, words, quiz (question kinds),
     read (how many words to read aloud), sentence (G3, read aloud),
     master: true = the track's final challenge (all words mixed).
   Quiz kinds: count, jumble, missing, pick (KG: which picture has
   N claps), chop (tap where to cut), rule (which split is right),
   build (which ending makes a real word).
   ============================================================ */
(function (root) {
  "use strict";
  function W(w, e, fun, say) { return { w: w, e: e, fun: fun, say: say || null }; }

  var KG = [
    { id: "k1", title: "One Clap Words", emoji: "👏", sticker: { emoji: "🐱", name: "Quick Cat" },
      intro: "Some words are short and quick. They have just ONE beat. Clap once: cat!",
      trick: "Put your hand under your chin and say the word. Your chin drops once? That's ONE beat!",
      joke: { q: "Why did the cat sit on the computer?", a: "To keep an eye on the mouse! 🐭" },
      words: [W("cat", "🐱", "Cat is quick like a pounce: just ONE clap!"),
              W("dog", "🐶", "Dog barks once: WOOF! One clap."),
              W("sun", "☀️", "One sun in the sky, one clap!"),
              W("fish", "🐟", "Fish goes SPLASH, one clap, and swims away!"),
              W("frog", "🐸", "Frog does one big hop: one clap!"),
              W("ball", "⚽", "Kick the ball one time: one clap!")],
      quiz: ["count", "count", "pick", "count", "pick", "count"], read: 3 },

    { id: "k2", title: "Two Little Words Together", emoji: "🌈", sticker: { emoji: "🧁", name: "Cupcake Pal" },
      intro: "Two little words can hold hands and make one big word! Cup plus cake makes cupcake. Two claps!",
      trick: "Each little word is one clap. Cup (clap) cake (clap)! Two words, two claps.",
      joke: { q: "What did one cupcake say to the other?", a: "You're looking sweet today! 🧁" },
      words: [W("cup-cake", "🧁", "A cup and a cake had a party: cup-cake! Two claps, two bites!"),
              W("rain-bow", "🌈", "Rain plus a bow? Two claps make a rainbow!"),
              W("sun-shine", "🌞", "Sun-shine: one clap for the sun, one for the shine!"),
              W("star-fish", "⭐", "A star that swims? It's a star-fish! Two claps."),
              W("pop-corn", "🍿", "POP! CORN! Two claps, like two pops in the pan!"),
              W("foot-ball", "🏈", "Use your foot on the ball: foot-ball! Two claps.")],
      quiz: ["jumble", "count", "jumble", "missing", "jumble", "count"], read: 3 },

    { id: "k3", title: "Two Clap Animals", emoji: "🐯", sticker: { emoji: "🐵", name: "Mon-key" },
      intro: "Let's go to the zoo! These animal names have TWO beats. Ti-ger!",
      trick: "Stomp like an elephant for each beat: ti (stomp) ger (stomp)!",
      joke: { q: "What is a monkey's favourite cookie?", a: "Chocolate CHIMP! 🍪🐵" },
      words: [W("ti-ger", "🐯", "Ti-ger goes ROAR, ROAR: two roars, two claps!"),
              W("mon-key", "🐵", "Mon-key swings left, then right: mon-key!"),
              W("rab-bit", "🐰", "Rab-bit has two long ears: one clap for each ear!"),
              W("pan-da", "🐼", "Pan-da has two black eye patches: two claps!"),
              W("ze-bra", "🦓", "Ze-bra: black stripe, white stripe! Two claps."),
              W("tur-tle", "🐢", "Tur-tle is slow: tuuur... tle. Two slow claps!", ["tur", "tull"])],
      quiz: ["count", "jumble", "missing", "count", "jumble", "pick"], read: 3 },

    { id: "k4", title: "Yummy Two Beats", emoji: "🍕", sticker: { emoji: "🍕", name: "Pizza Slice" },
      intro: "Time for a snack! Yummy food words with two beats. Piz-za!",
      trick: "Take a pretend bite for each beat: piz (chomp) za (chomp)!",
      joke: { q: "Why did the cookie go to the doctor?", a: "Because it felt crummy! 🍪" },
      words: [W("piz-za", "🍕", "Piz-za: one clap for the cheese, one for the sauce!"),
              W("ap-ple", "🍎", "Ap-ple: crunch, crunch! Two bites, two claps.", ["ap", "pull"]),
              W("cook-ie", "🍪", "Cook-ie: one clap to bake it, one clap to eat it!", ["cook", "ee"]),
              W("car-rot", "🥕", "Car-rot: bunnies clap twice before they munch!"),
              W("muf-fin", "🧁", "Muf-fin: muff, fin! Two puffs of a warm muffin."),
              W("ta-co", "🌮", "Ta-co: taco Tuesday is a two-clap day!")],
      quiz: ["jumble", "missing", "count", "jumble", "missing", "count"], read: 3 },

    { id: "k5", title: "One or Two?", emoji: "🤔", sticker: { emoji: "🦉", name: "Wise Owl" },
      intro: "Now you are a beat detective! Is it ONE clap or TWO claps? Listen and find out!",
      trick: "Say it slowly like a robot: rob-ot voice! Each robot chunk is one clap.",
      joke: { q: "What do you call a sleeping dinosaur?", a: "A dino-SNORE! 🦖💤" },
      words: [W("bus", "🚌", "The bus goes beep, one clap!"),
              W("bed", "🛏️", "Jump in bed: one clap and lights out!"),
              W("pen-cil", "✏️", "Pen-cil: draw a line, draw a dot! Two claps."),
              W("bas-ket", "🧺", "Bas-ket: put two apples in, two claps!"),
              W("moon", "🌙", "One moon at night, one quiet clap."),
              W("hap-py", "😊", "Hap-py: one clap for a smile, one for a giggle!")],
      quiz: ["count", "pick", "count", "jumble", "count", "pick"], read: 3 },

    { id: "k6", title: "Three Clap Words", emoji: "🍌", sticker: { emoji: "🦋", name: "But-ter-fly" },
      intro: "Wow, longer words! These have THREE beats. Ba-na-na!",
      trick: "Hop three times like a kangaroo: kan (hop) ga (hop) roo (hop)!",
      joke: { q: "Why did the banana go to the doctor?", a: "It wasn't PEEL-ing well! 🍌" },
      words: [W("ba-na-na", "🍌", "Ba-na-na: three claps, and a monkey says yum!"),
              W("but-ter-fly", "🦋", "But-ter-fly flaps three times: flap, flap, fly!"),
              W("el-e-phant", "🐘", "El-e-phant is BIG: three big stomps!", ["el", "uh", "fant"]),
              W("di-no-saur", "🦖", "Di-no-saur: STOMP, STOMP, ROAR! Three claps."),
              W("kan-ga-roo", "🦘", "Kan-ga-roo hops three times: boing, boing, boing!"),
              W("to-ma-to", "🍅", "To-ma-to: three claps, then squish!")],
      quiz: ["count", "jumble", "missing", "jumble", "count", "pick"], read: 3 },

    { id: "k7", title: "Super Four Claps", emoji: "🍉", sticker: { emoji: "🐊", name: "Al-li-ga-tor" },
      intro: "Super challenge! These words have FOUR beats. Wa-ter-mel-on!",
      trick: "Count on your fingers: one finger up for every beat. Four fingers = four claps!",
      joke: { q: "What do you call an alligator in a vest?", a: "An in-VEST-igator! 🐊🔍" },
      words: [W("wa-ter-mel-on", "🍉", "Wa-ter-mel-on is so big it needs FOUR claps!"),
              W("cat-er-pil-lar", "🐛", "Cat-er-pil-lar has lots of legs and four claps!"),
              W("al-li-ga-tor", "🐊", "Al-li-ga-tor snaps four times: snap, snap, snap, snap!"),
              W("hel-i-cop-ter", "🚁", "Hel-i-cop-ter blades spin: whir, whir, whir, whir!", ["hel", "ih", "cop", "ter"]),
              W("mac-a-ro-ni", "🧀", "Mac-a-ro-ni and cheese: four cheesy claps!", ["mack", "uh", "row", "nee"])],
      quiz: ["count", "jumble", "count", "jumble", "missing", "pick"], read: 3 },

    { id: "k8", title: "Beat Master Challenge", emoji: "🏆", sticker: { emoji: "🥁", name: "Beat Master Drum" }, master: true,
      intro: "You learned so many beats! Show Bongo all your clapping power. One, two, three and four claps!",
      trick: "Chin drop, robot voice, kangaroo hops: use any trick you like!",
      joke: { q: "What is a drummer's favourite vegetable?", a: "A BEET! 🥁🥕" },
      words: [], quiz: ["count", "jumble", "pick", "count", "missing", "jumble", "count", "pick", "jumble", "count"], read: 4 }
  ];

  var G3 = [
    { id: "g1", title: "Beat Warm-Up", emoji: "👏", sticker: { emoji: "🔥", name: "Warm-Up Flame" },
      intro: "A syllable is one beat in a word, and every syllable has one vowel sound. Let's warm up by counting beats!",
      trick: "Count the vowel SOUNDS, not the vowel letters. Boat has two vowels but one sound: one syllable!",
      joke: { q: "Why was the math book sad?", a: "It had too many problems! 📘" },
      words: [W("jump", "🦘", "Jump has one vowel sound, so one beat. Boing!"),
              W("pen-cil", "✏️", "Pen-cil: two vowel sounds, two beats. Sharpen your skills!"),
              W("ze-bra", "🦓", "Ze-bra: two stripes, two beats!"),
              W("ba-na-na", "🍌", "Ba-na-na: three a sounds, three beats!"),
              W("boat", "⛵", "Boat: o and a team up for one sound, so one beat."),
              W("wa-ter-mel-on", "🍉", "Wa-ter-mel-on: four vowel sounds, four juicy beats!")],
      quiz: ["count", "count", "jumble", "missing", "count", "jumble"], read: 3,
      sentence: "The zebra ate a banana on the boat." },

    { id: "g2", title: "Compound Words", emoji: "⛄", sticker: { emoji: "⛄", name: "Snow-man" },
      intro: "A compound word is two small words glued together. Chop it right where the two words meet!",
      trick: "Find the two small words hiding inside: snow + man. Chop in the middle of the hug!",
      joke: { q: "What do you call a snowman in summer?", a: "A puddle! 💧" },
      words: [W("snow-man", "⛄", "Snow plus man: chop between them and he won't melt!"),
              W("back-pack", "🎒", "Back-pack: a pack for your back. Easy chop!"),
              W("foot-print", "👣", "Foot-print: your foot leaves a print. Chop!"),
              W("rain-coat", "🧥", "Rain-coat: a coat for the rain. Chop between!"),
              W("base-ball", "⚾", "Base-ball: hit the ball, run to base!"),
              W("sun-flow-er", "🌻", "Sun-flow-er: sun + flower, and flower has two beats itself!")],
      quiz: ["chop", "jumble", "build", "chop", "missing", "chop"], read: 3,
      sentence: "I put my raincoat in my backpack." },

    { id: "g3", title: "Twin Consonants Split", emoji: "🐰", sticker: { emoji: "🍪", name: "Shared Cookie" },
      intro: "When two consonants stand between two vowels, chop between them: rab-bit, nap-kin. This is the VC/CV rule!",
      trick: "Two consonants in the middle? Split them like a cookie with your best friend: one for you, one for me!",
      joke: { q: "Are carrots good for your eyes?", a: "Yes! Have you ever seen a rabbit wearing glasses? 🥕👓" },
      words: [W("rab-bit", "🐰", "Rab-bit: b and b are twins, so they split up!"),
              W("nap-kin", "🧻", "Nap-kin: p and k sit in the middle, chop between!"),
              W("bas-ket", "🧺", "Bas-ket: s and k split, one in each chunk."),
              W("muf-fin", "🧁", "Muf-fin: f and f twins share the cookie!"),
              W("pic-nic", "🧺", "Pic-nic: two closed chunks, both say short i!"),
              W("hel-met", "⛑️", "Hel-met: l and m split. Safety first!")],
      quiz: ["chop", "rule", "jumble", "chop", "missing", "rule"], read: 3,
      rule: "VC/CV: two consonants in the middle, chop between them.",
      sentence: "The rabbit had a muffin at the picnic." },

    { id: "g4", title: "Open Syllables", emoji: "🤖", sticker: { emoji: "🤖", name: "Ro-bot" },
      intro: "One consonant in the middle? Try chopping BEFORE it first: ro-bot. The first chunk ends with a vowel, so the vowel says its name!",
      trick: "An open syllable is like an open door 🚪: the vowel can run out shouting its own NAME. Ro! Ti! Pa!",
      joke: { q: "Why did the robot go on vacation?", a: "To recharge its batteries! 🔋" },
      words: [W("ro-bot", "🤖", "Ro-bot: 'ro' is open, so o says its name, O!"),
              W("ti-ger", "🐯", "Ti-ger: 'ti' is open, so i says its name, I!"),
              W("pa-per", "📄", "Pa-per: 'pa' is open, a says A! Write it on paper."),
              W("mu-sic", "🎵", "Mu-sic: 'mu' is open, u says U! Turn up the music."),
              W("ba-con", "🥓", "Ba-con: 'ba' is open, a says A. Sizzle!"),
              W("si-lent", "🤫", "Si-lent: 'si' is open, i says I... shhh!")],
      quiz: ["chop", "rule", "jumble", "missing", "chop", "rule"], read: 3,
      rule: "V/CV: one consonant in the middle, try chopping before it. The vowel says its name.",
      sentence: "The robot read music on paper." },

    { id: "g5", title: "Closed Flip (VC/V)", emoji: "🐪", sticker: { emoji: "🐪", name: "Cam-el" },
      intro: "Sometimes the open chop sounds silly: ca-mel? That's not a word! Flip the chop after the consonant: cam-el. Now the vowel is short.",
      trick: "Try open first. If it sounds silly, FLIP it! Say 'ca-mel', giggle, then say 'cam-el'.",
      joke: { q: "What do you call a camel with no hump?", a: "Humphrey! 🐪" },
      words: [W("cam-el", "🐪", "Ca-mel? Silly! Flip it: cam-el. The m stays with ca."),
              W("lem-on", "🍋", "Le-mon? Sour! Flip it: lem-on."),
              W("rob-in", "🐦", "Ro-bin? Flip it: rob-in. A bird with a red chest!"),
              W("cab-in", "🛖", "Ca-bin? Flip it: cab-in, a cozy house in the woods."),
              W("wag-on", "🛒", "Wa-gon? Flip it: wag-on. Pull the wagon!"),
              W("sev-en", "7️⃣", "Se-ven? Flip it: sev-en. Seven claps for flipping!")],
      quiz: ["chop", "rule", "missing", "jumble", "chop", "rule"], read: 3,
      rule: "VC/V: if the open chop sounds silly, chop after the consonant. The vowel is short.",
      sentence: "Seven robins sat on the wagon." },

    { id: "g6", title: "Magic Silent E", emoji: "🪄", sticker: { emoji: "🪄", name: "Magic Wand" },
      intro: "A silent e at the end is MAGIC. It makes the vowel say its name, and it stays in the same chunk as that vowel: in-vite.",
      trick: "Silent e is a shy magician 🎩. It never talks, but it zaps the vowel next door: vit becomes vite!",
      joke: { q: "Why is silent e so good at hide and seek?", a: "You never hear it coming! 🤫" },
      words: [W("in-vite", "💌", "In-vite: silent e makes i say its name in 'vite'!"),
              W("mis-take", "❌", "Mis-take: silent e zaps a, take! Mistakes help us learn."),
              W("cup-cake", "🧁", "Cup-cake: 'cake' has magic e. Sprinkles on top!"),
              W("ex-plode", "💥", "Ex-plode: silent e makes o say O... BOOM!"),
              W("sun-rise", "🌅", "Sun-rise: magic e makes i say I in 'rise'. Good morning!"),
              W("trom-bone", "🎺", "Trom-bone: 'bone' has magic e. Toot toot!")],
      quiz: ["chop", "jumble", "rule", "build", "chop", "missing"], read: 3,
      rule: "VCe: the vowel, the consonant and the silent e stay together in one chunk.",
      sentence: "I invite you to eat a cupcake at sunrise." },

    { id: "g7", title: "Consonant + le", emoji: "🧩", sticker: { emoji: "🧩", name: "Puz-zle Piece" },
      intro: "Words that end in a consonant plus le, like table and puzzle: the le grabs the consonant just before it. Ta-ble!",
      trick: "Count back three from the end: t-a-B-L-E. Chop before those last three letters! ble, zle, dle.",
      joke: { q: "Why did the turtle cross the road?", a: "To get to the SHELL station! 🐢⛽" },
      words: [W("ta-ble", "🪑", "Ta-ble: ble grabs the b. Count back three!", ["tay", "bull"]),
              W("puz-zle", "🧩", "Puz-zle: zle grabs a z. Click the pieces together!", ["puz", "zull"]),
              W("can-dle", "🕯️", "Can-dle: dle grabs the d. Make a wish!", ["can", "dull"]),
              W("tur-tle", "🐢", "Tur-tle: tle grabs the t. Slow and steady!", ["tur", "tull"]),
              W("bub-ble", "🫧", "Bub-ble: ble grabs a b. POP!", ["bub", "bull"]),
              W("pur-ple", "🟣", "Pur-ple: ple grabs the p. Purple grapes!", ["pur", "pull"])],
      quiz: ["chop", "rule", "jumble", "missing", "chop", "build"], read: 3,
      rule: "C+le: the consonant before le joins it. Count back three letters and chop.",
      sentence: "A purple turtle sat by the candle on the table." },

    { id: "g8", title: "Vowel Teams & Bossy R", emoji: "🦸", sticker: { emoji: "🦃", name: "Tur-key" },
      intro: "Vowel teams like ea and ai hold hands and never split up. Bossy R sticks to its vowel: ar, or, ur. Gar-den, sea-son!",
      trick: "Best friends never split! 🤝 Keep the vowel team together, and keep Bossy R with its vowel.",
      joke: { q: "Why did the peanut call the police?", a: "Because he was a-SALT-ed! 🥜🚓" },
      words: [W("gar-den", "🌷", "Gar-den: bossy r keeps 'ar' together. Plant a seed!"),
              W("mar-ket", "🛍️", "Mar-ket: 'ar' sticks together. Let's go shopping!"),
              W("tur-key", "🦃", "Tur-key: 'ur' sticks, and 'ey' is a team. Gobble gobble!"),
              W("sea-son", "🍂", "Sea-son: 'ea' holds hands. Fall is my favourite season!"),
              W("pea-nut", "🥜", "Pea-nut: 'ea' is a team, chop after it. Crunch!"),
              W("rain-coat", "🧥", "Rain-coat: two teams, 'ai' and 'oa'! Splash.")],
      quiz: ["chop", "rule", "jumble", "missing", "chop", "rule"], read: 3,
      rule: "Vowel teams (ai, ea, oa, ey) and r-controlled vowels (ar, or, ur) stay in one chunk.",
      sentence: "We bought a turkey and peanuts at the market." },

    { id: "g9", title: "Prefix & Suffix Chunks", emoji: "🥪", sticker: { emoji: "🥪", name: "Word Sandwich" },
      intro: "Many words have a front chunk (prefix) like un or re, and a back chunk (suffix) like ful, less or ness. Peel them off first!",
      trick: "A long word is a sandwich 🥪: take off the top bread (un, re, pre), the bottom bread (ful, less, ness), and the filling is easy!",
      joke: { q: "Why was the sandwich so helpful?", a: "It was always ready to LETTUCE help! 🥬" },
      words: [W("un-lock", "🔓", "Un-lock: un means not. Peel it off: lock!"),
              W("re-play", "🔁", "Re-play: re means again. Play it again!"),
              W("pre-heat", "🔥", "Pre-heat: pre means before. Heat the oven before baking!"),
              W("help-ful", "🤝", "Help-ful: ful means full of. Full of help!", ["help", "full"]),
              W("care-less", "🙈", "Care-less: less means without. Without care, oops!"),
              W("kind-ness", "💖", "Kind-ness: ness turns kind into a thing you can give!"),
              W("un-help-ful", "🙅", "Un-help-ful: top bread un, filling help, bottom bread ful!", ["un", "help", "full"])],
      quiz: ["chop", "build", "jumble", "missing", "chop", "build"], read: 3,
      rule: "Prefixes and suffixes are their own chunks: chop them off first.",
      sentence: "It is helpful to show kindness and replay the song." },

    { id: "g10", title: "Big Grade-Level Words", emoji: "🚂", sticker: { emoji: "🚂", name: "Word Train" },
      intro: "Big words are just small chunks linked like a train. Read one car at a time, then zoom through the whole word!",
      trick: "Word train 🚂: put your finger under each car (chunk), read it, then slide and read the whole train fast!",
      joke: { q: "Why did the octopus beat the shark in a fight?", a: "Because it was well-ARMED! 🐙💪" },
      words: [W("fan-tas-tic", "🤩", "Fan-tas-tic: three closed cars on the word train. Fantastic!"),
              W("im-por-tant", "❗", "Im-por-tant: bossy r keeps 'por' together. Very important!"),
              W("ad-ven-ture", "🗺️", "Ad-ven-ture: 'ture' says cher, like in picture!", ["ad", "ven", "cher"]),
              W("re-mem-ber", "🧠", "Re-mem-ber: re in front, then mem-ber. Remember this joke!"),
              W("oc-to-pus", "🐙", "Oc-to-pus: three chunks and eight arms!"),
              W("cal-en-dar", "📅", "Cal-en-dar: three chunks, and lots of days!"),
              W("in-vis-i-ble", "👻", "In-vis-i-ble: four cars on the train, and you can't see any of them!", ["in", "viz", "ih", "bull"]),
              W("cal-cu-la-tor", "🧮", "Cal-cu-la-tor: four chunks to add them up!")],
      quiz: ["chop", "jumble", "count", "missing", "chop", "jumble"], read: 4,
      sentence: "Remember to mark the important adventure on the calendar." },

    { id: "g11", title: "Syllable Master Challenge", emoji: "🏆", sticker: { emoji: "🥁", name: "Golden Drum" }, master: true,
      intro: "Grade-level challenge! Words from every lesson, all the rules. Show Bongo you're a Syllable Master!",
      trick: "Remember the order: 1 peel prefixes and suffixes, 2 keep teams and bossy R together, 3 split twin consonants, 4 try open, flip if silly, 5 count back three for le.",
      joke: { q: "What did the drum say to the drumstick?", a: "Stop beating around the bush! 🥁" },
      words: [], quiz: ["chop", "rule", "jumble", "build", "missing", "chop", "count", "rule", "jumble", "chop"], read: 4,
      sentence: "The fantastic robot will remember to unlock the purple basket." }
  ];

  var PRAISE = [
    "Clap-tastic! 👏", "You're a syllable superstar! ⭐", "Bongo is doing a happy dance! 🐒💃", "Boom! Right on the beat! 🥁",
    "Your brain is beat-boxing! 🧠🎵", "Wow, you chopped it like a chef! 🔪🥕", "High five! ✋ That was awesome!",
    "You're on fire! 🔥", "Super ears! 👂✨", "That's the way! Bongo is so proud! 💛"
  ];
  var KIND = [
    "Ooh, nice try! Let's clap it together.", "Good thinking! Let's look again.", "Almost! Mistakes help our brains grow. 🌱",
    "Brave try! Here's how it goes:"
  ];

  var data = { tracks: { kg: { id: "kg", name: "Kindergarten Beats", lessons: KG }, g3: { id: "g3", name: "Grade 3 Syllable Chopping", lessons: G3 } },
               praise: PRAISE, kind: KIND };
  root.SY_DATA = data;
  root.SY_LESSONS = KG.concat(G3);       // kidbar.js reads stickers from here
  if (typeof module !== "undefined" && module.exports) module.exports = data;
})(typeof window !== "undefined" ? window : globalThis);
