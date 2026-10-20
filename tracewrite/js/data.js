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
  n: { w: 60, strokes: [{ d: "M12,60 L12,100" }, { d: "M12,77 C16,63 26,59 34,59 C44,59 48,67 48,77 L48,100" }] }
};

/* letter → a sound speech can say (TTS reads letter NAMES otherwise) */
const LETTER_SAY = { s: "sss", a: "ah", t: "tuh", p: "puh", i: "ih", n: "nnn" };

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
  n: "n says nnn, like nose! Line down, back up, and over the hill."
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
  { id: "w2", n: 2, title: "Round Letters", sub: "m d g o c k", emoji: "🍩", color: "#d0bfff", accent: "#7048e8" },
  { id: "w3", n: 3, title: "Tall Letters", sub: "e u r h b f", emoji: "🦒", color: "#b2f2bb", accent: "#2f9e44" },
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
  { id: "phase-1", icon: "🏅", name: "Writing Star", desc: "Finish all of Phase 1" }
];
