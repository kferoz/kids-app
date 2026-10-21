/* ============================================================
   Write & Trace — data (KG handwriting with Scribbles the Crayon)
   ------------------------------------------------------------
   Every shape is drawn on 4 handwriting lines (viewBox height 140):
     top 20 · middle (dashed) 60 · base (red) 100 · tail 130
   A shape = { w: width, strokes: [{ d: SVG path } | { dot: [x, y] }] }
   in the order a child should write them. Strokes start at their
   first point: that is where the green start dot appears.
   Phases follow Phonics Pals' letter order (s a t p i n first), so
   the letters a child can SAY are the letters they learn to WRITE.
   A phase with no `lessons` shows as "coming soon".
   ============================================================ */

const LINES = { top: 20, mid: 60, base: 100, desc: 130 };
const SHEET_H = 140;

const SHAPES = {
  // warm-up strokes
  down:   { w: 50,  name: "Slide down", e: "🛝", strokes: [{ d: "M25,24 L25,100" }] },
  across: { w: 100, name: "Walk across", e: "🚶", strokes: [{ d: "M12,62 L88,62" }] },
  slant:  { w: 72,  name: "Ski slope", e: "⛷️", strokes: [{ d: "M14,24 L58,100" }] },
  circle: { w: 92,  name: "Round donut", e: "🍩", strokes: [{ d: "M46,24 A38,38 0 0 0 46,100 A38,38 0 0 0 46,24" }] },
  zigzag: { w: 108, name: "Zig-zag mountains", e: "⛰️", strokes: [{ d: "M10,40 L31,96 L54,40 L77,96 L98,40" }] },
  humps:  { w: 108, name: "Bunny hops", e: "🐰", strokes: [{ d: "M10,100 C10,48 54,48 54,100 C54,48 98,48 98,100" }] },
  // letters
  s: { w: 60, strokes: [{ d: "M48,66 C43,58 24,56 19,65 C14,75 27,78 35,80 C45,82 52,87 48,95 C44,104 22,104 15,95" }] },
  a: { w: 64, strokes: [{ d: "M50,68 C44,58 30,57 22,63 C12,71 12,93 22,99 C33,105 46,98 50,86" }, { d: "M50,60 L50,100" }] },
  t: { w: 52, strokes: [{ d: "M24,24 L24,92 C24,100 32,103 40,97" }, { d: "M10,58 L40,58" }] },
  p: { w: 62, strokes: [{ d: "M14,60 L14,132" }, { d: "M14,74 C20,58 46,56 50,78 C53,100 28,105 14,92" }] },
  i: { w: 32, strokes: [{ d: "M16,60 L16,100" }, { dot: [16, 42] }] },
  n: { w: 60, strokes: [{ d: "M12,60 L12,100" }, { d: "M12,77 C16,63 26,59 34,59 C44,59 48,67 48,77 L48,100" }] },
  // Phase 2: round letters start like a "magic c"
  c: { w: 56, strokes: [{ d: "M46,68 C40,58 24,57 17,66 C9,77 11,94 20,99 C29,104 41,100 46,92" }] },
  o: { w: 60, strokes: [{ d: "M38,60 C20,58 12,72 12,81 C12,94 22,101 31,100 C44,99 50,88 49,79 C48,67 42,60 36,60" }] },
  d: { w: 64, strokes: [{ d: "M50,68 C44,58 30,57 22,63 C12,71 12,93 22,99 C33,105 46,98 50,86" }, { d: "M50,22 L50,100" }] },
  g: { w: 62, strokes: [{ d: "M48,68 C42,58 28,57 20,63 C10,71 10,93 20,99 C31,105 44,98 48,86" }, { d: "M48,60 L48,120 C48,134 26,136 16,126" }] },
  m: { w: 84, strokes: [{ d: "M12,60 L12,100" }, { d: "M12,76 C15,63 22,59 29,59 C37,59 41,66 41,76 L41,100" }, { d: "M41,76 C44,63 51,59 58,59 C66,59 70,66 70,76 L70,100" }] },
  k: { w: 58, strokes: [{ d: "M14,22 L14,100" }, { d: "M46,60 L15,82 L48,100" }] },
  // Phase 3: tall letters (and their short friends e u r)
  e: { w: 60, strokes: [{ d: "M14,80 L48,80 C48,66 40,59 31,59 C18,59 12,70 12,80 C12,93 20,101 31,101 C39,101 45,97 48,92" }] },
  u: { w: 58, strokes: [{ d: "M12,60 L12,86 C12,97 20,101 29,101 C39,101 46,94 46,82" }, { d: "M46,60 L46,100" }] },
  r: { w: 52, strokes: [{ d: "M14,60 L14,100" }, { d: "M14,76 C18,64 27,59 36,59 C40,59 44,60 46,63" }] },
  h: { w: 60, strokes: [{ d: "M12,22 L12,100" }, { d: "M12,77 C16,63 26,59 34,59 C44,59 48,67 48,77 L48,100" }] },
  b: { w: 62, strokes: [{ d: "M14,22 L14,100" }, { d: "M14,74 C20,58 46,56 50,78 C53,100 28,105 14,92" }] },
  f: { w: 52, strokes: [{ d: "M44,30 C40,21 26,20 24,32 L24,100" }, { d: "M10,60 L40,60" }] }
};

/* letter → a sound speech can say (TTS reads letter NAMES otherwise) */
const LETTER_SAY = { s: "sss", a: "ah", t: "tuh", p: "puh", i: "ih", n: "nnn", c: "kuh", o: "aw", d: "duh", g: "guh", m: "mmm", k: "kuh",
  e: "eh", u: "uh", r: "rrr", h: "huh", b: "buh", f: "fff" };

/* how Scribbles talks about each shape while tracing */
const SHAPE_TALK = {
  down: "Start at the top, and zoom down the slide!",
  across: "Walk across, from left to right, like reading a book!",
  slant: "Ski down the slope! Whoosh!",
  circle: "Start at the top and go round, the way a c goes. Round and round, like a donut!",
  zigzag: "Down, up, down, up! Climb the mountains!",
  humps: "Hop, hop! Make two bunny hops!",
  s: "s says sss, like a snake! Curve back, then curve the other way. Sss!",
  a: "a says ah, like apple! First a round c shape, then a line straight down.",
  t: "t says tuh! Big line down from the top, then cross it on the middle line.",
  p: "p says puh! Line down below the floor, then back up and around.",
  i: "i says ih, like insect! A little line down, then a dot on top. Plop!",
  n: "n says nnn, like nose! Line down, back up, and over the hill.",
  c: "c says kuh, like cat! This is the magic c. Start near the top, curve back and around, like a big open mouth. Chomp!",
  o: "o says aw, like octopus! Start like a magic c, then keep going all the way around. Close the door!",
  d: "d says duh, like dog! First a magic c, then a TALL line from the very top, all the way down.",
  g: "g says guh, like goat! A magic c, then a line down below the floor, with a little hook like a fishing rod.",
  m: "m says mmm, like moon! Line down, then two hills: up and over, up and over. Mmm, yummy!",
  k: "k says kuh, like key! A tall line down, then a little arrow: in, and out. Like a kick!",
  e: "e says eh, like egg! Start in the middle, slide across, then curve up and around like a magic c. Crack!",
  u: "u says uh, like up! Down, round the bottom like a cup, up again, then a little line down. Slurp!",
  r: "r says rrr, like a growly robot! Line down, then pop back up and make a little arm. Rrr!",
  h: "h says huh, like hat! A TALL line from the very top, then back up and over the hill. A chair to sit on!",
  b: "b says buh, like ball! First the bat: a TALL line down. Then the ball at the bottom. Bat, then ball!",
  f: "f says fff, like fish! A hook at the top like a candy cane, all the way down, then a line across. Fff!"
};

const PHASES = [
  {
    id: "w1", n: 1, title: "Warm-up & First Letters", sub: "Lines, curves, s a t p i n", emoji: "🖍️", color: "#ffd8a8", accent: "#f08c00",
    lessons: [
      { id: "wl1", kind: "warmup", title: "Wiggle Warm-up", items: ["down", "across", "slant", "circle", "zigzag", "humps"], sticker: { emoji: "🐰", name: "Bunny Hopper" } },
      { id: "wl2", kind: "letters", title: "s · a · t", items: ["s", "a", "t"],
        words: [{ w: "at", e: "👉", say: "at. Look at that!" }, { w: "sat", e: "🪑", say: "sat. The cat sat on a chair." }, { w: "tat", e: "🥁", say: "tat. Tat, tat, tat goes the drum!" }],
        sticker: { emoji: "🐍", name: "Sss Snake" } },
      { id: "wl3", kind: "letters", title: "p · i · n", items: ["p", "i", "n"],
        words: [{ w: "pin", e: "📌", say: "pin. Ouch, a pin is pointy!" }, { w: "nap", e: "😴", say: "nap. Time for a nap!" }, { w: "ant", e: "🐜", say: "ant. A tiny ant!" }],
        sticker: { emoji: "📌", name: "Pin Pal" } },
      { id: "wl4", kind: "words", title: "My First Words", items: ["sat", "tip", "pan"],
        words: [{ w: "tap", e: "🚰", say: "tap. Turn on the tap!" }, { w: "sit", e: "🧘", say: "sit. Sit down, please." }, { w: "pit", e: "🍑", say: "pit. A peach has a pit inside." }],
        sticker: { emoji: "📝", name: "Word Writer" } }
    ]
  },
  {
    id: "w2", n: 2, title: "Round Letters", sub: "c o d g m k", emoji: "🍩", color: "#d0bfff", accent: "#7048e8",
    lessons: [
      { id: "wl5", kind: "letters", title: "c · o · d", items: ["c", "o", "d"],
        words: [{ w: "cod", e: "🐟", say: "cod. A cod is a fish!" }, { w: "dot", e: "⚫", say: "dot. A little dot!" }, { w: "cot", e: "🛏️", say: "cot. A cot is a little bed." }],
        sticker: { emoji: "🍩", name: "Magic c Donut" } },
      { id: "wl6", kind: "letters", title: "g · m · k", items: ["g", "m", "k"],
        words: [{ w: "mom", e: "👩", say: "mom. I love my mom!" }, { w: "kid", e: "🧒", say: "kid. A happy kid!" }, { w: "dig", e: "⛏️", say: "dig. Dig in the sand!" }],
        sticker: { emoji: "🔑", name: "Kicky Key" } },
      { id: "wl7", kind: "words", title: "Round Words", items: ["dog", "cat", "map"],
        words: [{ w: "pig", e: "🐷", say: "pig. Oink, oink!" }, { w: "mop", e: "🧹", say: "mop. Mop the floor!" }, { w: "cap", e: "🧢", say: "cap. A cool cap!" }],
        sticker: { emoji: "🐶", name: "Dotty Dog" } },
      { id: "wl8", kind: "words", title: "Silly Words", items: ["pod", "cog", "mat"],
        words: [{ w: "pot", e: "🍲", say: "pot. Soup in a pot!" }, { w: "kit", e: "🧰", say: "kit. A tool kit!" }, { w: "pad", e: "📒", say: "pad. A note pad!" }],
        sticker: { emoji: "🤪", name: "Silly Speller" } }
    ]
  },
  {
    id: "w3", n: 3, title: "Tall Letters", sub: "e u r h b f", emoji: "🦒", color: "#b2f2bb", accent: "#2f9e44",
    lessons: [
      { id: "wl9", kind: "letters", title: "e · u · r", items: ["e", "u", "r"],
        words: [{ w: "run", e: "🏃", say: "run. Run, run, as fast as you can!" }, { w: "nut", e: "🥜", say: "nut. A crunchy nut!" }, { w: "red", e: "🔴", say: "red. A red, red ball!" }],
        sticker: { emoji: "🤖", name: "Rrr Robot" } },
      { id: "wl10", kind: "letters", title: "h · b · f", items: ["h", "b", "f"],
        words: [{ w: "hat", e: "🎩", say: "hat. A fancy hat!" }, { w: "bed", e: "🛏️", say: "bed. Time for bed!" }, { w: "fun", e: "🎉", say: "fun. This is so much fun!" }],
        sticker: { emoji: "🦒", name: "Tall Giraffe" } },
      { id: "wl11", kind: "words", title: "Tall Words", items: ["bug", "hen", "hut"],
        words: [{ w: "bat", e: "🦇", say: "bat. A bat flies at night!" }, { w: "cub", e: "🐻", say: "cub. A bear cub!" }, { w: "egg", e: "🥚", say: "egg. Crack the egg!" }],
        sticker: { emoji: "🐞", name: "Bug Buddy" } },
      { id: "wl12", kind: "words", title: "Funny Words", items: ["fun", "rug", "hum"],
        words: [{ w: "bun", e: "🥯", say: "bun. A yummy bun!" }, { w: "tub", e: "🛁", say: "tub. Splash in the tub!" }, { w: "hug", e: "🤗", say: "hug. A big warm hug!" }],
        sticker: { emoji: "🤗", name: "Big Hug" } }
    ]
  },
  { id: "w4", n: 4, title: "Tricky Letters", sub: "l j v w x y z q", emoji: "🦓", color: "#a5d8ff", accent: "#1c7ed6" },
  { id: "w5", n: 5, title: "Capitals & My Name", sub: "Big letters and writing your name", emoji: "👑", color: "#ffc9c9", accent: "#e03131" },
  { id: "w6", n: 6, title: "My First Sentences", sub: "Capital, finger spaces, period", emoji: "📖", color: "#fff3bf", accent: "#f59f00" }
];

const PRAISE = {
  win: ["Scribble-tastic! Right on the dots!", "Wow! That's smoother than a buttered slide!", "You're a writing wizard!", "Perfect! Even my wax is impressed!", "Beautiful! Can I hang that on the fridge?", "Woo-hoo! Your hand is getting so strong!"],
  stroke: ["Nice line!", "Yes! Keep going!", "Great! Now the next one!", "Super stroke!"],
  start: "Nice! Next time, start at the green dot, like the start of a race!",
  reversed: "Ooh, you went the other way! Letters like to start at the green dot.",
  off: ["Oopsie, that wandered off! Follow the dots, like a trail of cookie crumbs.", "Wiggly! Let's go slow, like a snail. 🐌", "Whoops! Let's stay on the road this time."],
  short: ["Almost! Keep going all the way to the end.", "So close! Go a little farther."],
  tiny: ["That was a tiny tap! Press your finger down and slide it."],
  helped: ["Here, watch me first!", "Let me show you. Watch my crayon!"],
  free: ["All by yourself! You're a real writer!", "No dots at all, and you did it! Wow!"],
  build: ["You spelled it!", "Yes! Letter by letter!", "Super spelling!"],
  buildOops: ["Hmm, listen to the sounds again.", "Oops! Say it slowly with me."]
};

const JOKES = [
  "Why did the crayon go to school? To get a little sharper!",
  "What's a crayon's favorite dance? The scribble shuffle!",
  "I tried to draw a circle, but I just went round and round in circles!",
  "Why was the pencil so tired? It had too many points to make!",
  "What did one crayon say to the other? Let's color outside the lines… just kidding, let's stay ON the lines!",
  "Why did the letter i bring a hat? Because it always wears a dot!"
];

const TW_TROPHIES = [
  { id: "first-trace", icon: "🖍️", name: "First Scribble", desc: "Trace your first shape" },
  { id: "first-lesson", icon: "🎉", name: "Lesson Done", desc: "Finish your first lesson" },
  { id: "free-hand", icon: "🦸", name: "All By Myself", desc: "Write a letter with no dots to help" },
  { id: "speller", icon: "🧩", name: "Little Speller", desc: "Build 5 words" },
  { id: "artist", icon: "🎨", name: "Super Artist", desc: "Make a Magic Drawing" },
  { id: "perfect-5", icon: "💯", name: "Perfect Five", desc: "Trace 5 shapes with no oopsies" },
  { id: "phase-1", icon: "🏅", name: "Writing Star", desc: "Finish all of Phase 1" },
  { id: "phase-2", icon: "🍩", name: "Round Letter Champ", desc: "Finish all of Phase 2" },
  { id: "phase-3", icon: "🦒", name: "Tall Letter Champ", desc: "Finish all of Phase 3" }
];
