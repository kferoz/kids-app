/* ============================================================
   Phonics Pals — data
   ------------------------------------------------------------
   Five decodable storybooks for a Kindergartener.
   Books 1, 2 and 5 follow the child's school phonics readers
   ("Al" short o, "Tim" short u, "The Jet" short e).
   Books 3 and 4 are original stand-ins written in the same
   style (short a, short i) — their photo zips arrived empty, so
   swap in the real text here once they're re-sent.

   A page = { text, art }. `art` is drawn by js/art.js:
     { bg, items: [ [type, x, y, scale, opts], ... ] }
   ============================================================ */

const VOWELS = {
  a: { key: "apple", emoji: "🍎", sound: "ah" },
  e: { key: "egg", emoji: "🥚", sound: "eh" },
  i: { key: "insect", emoji: "🐜", sound: "ih" },
  o: { key: "octopus", emoji: "🐙", sound: "aw" },
  u: { key: "umbrella", emoji: "☂️", sound: "uh" }
};

/* letter → a sound TTS can say (TTS reads letter NAMES otherwise) */
const LETTER_SOUNDS = {
  b: "buh", c: "kuh", d: "duh", f: "fff", g: "guh", h: "huh", j: "juh", k: "kuh", l: "lll",
  m: "mmm", n: "nnn", p: "puh", r: "rrr", s: "sss", t: "tuh", v: "vvv", w: "wuh", x: "ks",
  y: "yuh", z: "zzz", q: "kwuh", a: "ah", e: "eh", i: "ih", o: "aw", u: "uh",
  sh: "shhh", ch: "chuh", th: "thhh", ck: "kuh", ee: "eee"
};

/* two letters, one sound (Step 4) — how Echo teaches each team */
const DIGRAPHS = {
  sh: { say: "shhh", e: "🤫", how: "Put your finger on your lips, like a baby is sleeping. Shhh!", joke: "Shhh! Even my feathers are tiptoeing!" },
  ch: { say: "chuh", e: "🚂", how: "Like a little train! Ch, ch, ch, choo choo!", joke: "Ch, ch, choo choo! All aboard the word train!" },
  th: { say: "thhh", e: "👅", how: "Stick your tongue out just a tiny bit and blow. Th, th. It's a silly face!", joke: "Th, th! Don't worry, sticking out your tongue is allowed today!" },
  // Step 5 blends: two sounds that slide together (each letter still says its own sound)
  st: { say: "stuh", e: "⭐", how: "S and t slide together: sss, tuh, st! Like star!", joke: "St, st! Stop! I'm laughing so hard my tail feathers fell off!" },
  sp: { say: "spuh", e: "🥄", how: "S and p slide together: sss, puh, sp! Like spoon!", joke: "Sp, sp! A spider in a spoon? Spooky!" },
  sn: { say: "snuh", e: "🐌", how: "S and n slide together: sss, nnn, sn! Like a slow snail.", joke: "Sn, sn! A snail sneezed. Bless you, snail!" },
  fl: { say: "fluh", e: "🚩", how: "F and l slide together: fff, lll, fl! Flap like a flag in the wind!", joke: "Fl, fl! I can fly, but I can't fly a flag!" },
  cl: { say: "kluh", e: "👏", how: "C and l slide together: kuh, lll, cl! Clap, clap!", joke: "Cl, cl! Clap for yourself, you clever reader!" },
  bl: { say: "bluh", e: "🫧", how: "B and l slide together: buh, lll, bl! Blow a big bubble!", joke: "Bl, bl, bl! That's the sound of a fish blowing bubbles!" },
  gr: { say: "gruh", e: "🐻", how: "G and r slide together: guh, rrr, gr! Growl like a bear!", joke: "Grrr! Don't worry, it's a friendly growl!" },
  tr: { say: "truh", e: "🚚", how: "T and r slide together: tuh, rrr, tr! Like a truck!", joke: "Tr, tr! The truck is tooting its horn for you!" },
  cr: { say: "kruh", e: "🦀", how: "C and r slide together: kuh, rrr, cr! Like a crab!", joke: "Cr, cr! A crab is clapping its claws for you!" },
  nd: { say: "nnd", e: "✋", how: "At the END of a word, n and d slide together: nnn, duh, nd! Like hand!", joke: "Nd, nd! Give me a high five with your hand!" },
  mp: { say: "mmp", e: "🦘", how: "At the end, m and p slide together: mmm, puh, mp! Like jump!", joke: "Mp, mp! Jump, jump, like a kangaroo on a trampoline!" }
};

const BOOKS = [
  {
    id: "al", n: 1, title: "Al", vowel: "o", color: "#7bd389", accent: "#2f9e55",
    sticker: { emoji: "🦕", name: "Al the Dino" },
    blurb: "A big dino who loves hot dogs!",
    focus: ["dog", "Dot", "got", "hot", "not", "pop", "Tom", "top"],
    sight: ["a", "and", "bus", "of", "the", "to", "was"],
    pages: [
      { text: "Al is big. Al ran and ran.",
        art: { bg: "beach", items: [["palm", 330, 200, 1], ["al", 170, 228, 0.9, { m: "happy", a: "run" }]] } },
      { text: "Dot has a hot dog. Al hid.",
        art: { bg: "park", items: [["al", 70, 222, 0.72, { m: "wow" }], ["bush", 118, 230, 1.5], ["dot", 290, 228, 1, { hold: "hotdog" }]] } },
      { text: "Al ran to Dot. Dot and Al had a bit of hot dog.",
        art: { bg: "park", items: [["al", 140, 228, 0.8, { m: "happy" }], ["dot", 285, 228, 1, { hold: "hotdog" }], ["heart", 220, 80, 1.2, { a: "float" }]] } },
      { text: "Al is not sad. Al got a bit of hot dog.",
        art: { bg: "beach", items: [["palm", 340, 200, 1], ["al", 170, 228, 0.85, { m: "happy", a: "bounce" }], ["hotdog", 262, 112, 0.9], ["sparkle", 300, 70, 1, { a: "spin" }]] } },
      { text: "Tom has a pop. Al hid.",
        art: { bg: "park", items: [["al", 76, 222, 0.72, { m: "wow" }], ["bush", 122, 230, 1.5], ["tom", 290, 228, 1, { hold: "pop" }]] } },
      { text: "Al ran to Tom. Tom ran and ran.",
        art: { bg: "beach", items: [["al", 110, 228, 0.78, { m: "happy", a: "run" }], ["pop", 228, 226, 1, { r: -80 }], ["tom", 320, 228, 1, { p: "run", m: "wow", a: "run" }]] } },
      { text: "Al was sad. The pop was hot.",
        art: { bg: "beach", items: [["sun", 340, 52, 1, { hot: true }], ["al", 160, 228, 0.85, { m: "sad" }], ["meltpop", 280, 226, 1.4]] } },
      { text: "The man had a hot dog. Al hid.",
        art: { bg: "park", items: [["al", 76, 222, 0.72, { m: "wow" }], ["bush", 124, 230, 1.5], ["man", 292, 228, 1.15, { hold: "hotdog", hat: true }]] } },
      { text: "The man ran. Al got mad at the man. The man had the hot dog.",
        art: { bg: "road", items: [["al", 110, 236, 0.75, { m: "mad" }], ["man", 300, 232, 1.1, { p: "run", hold: "hotdog", m: "wow", a: "run" }]] } },
      { text: "The man got on the bus.",
        art: { bg: "road", items: [["bus", 36, 236, 1.15], ["man", 238, 232, 1, { p: "run", f: true, hold: "hotdog" }], ["al", 350, 236, 0.55, { m: "wow", f: true }]] } },
      { text: "Al ran to the bus. The man was on the bus.",
        art: { bg: "road", items: [["al", 96, 236, 0.72, { m: "wow", a: "run" }], ["bus", 190, 236, 1.1, { rider: true, a: "run" }]] } },
      { text: "Al ran and hid. Al was sad.",
        art: { bg: "park", items: [["palm", 340, 205, 0.9], ["al", 170, 224, 0.75, { m: "sad" }], ["bush", 232, 232, 1.6]] } },
      { text: "Dot and Tom ran to Al.",
        art: { bg: "park", items: [["dot", 130, 228, 1, { p: "run", a: "run" }], ["tom", 225, 228, 1, { p: "run", a: "run" }], ["al", 380, 226, 0.6, { m: "sad", f: true }]] } },
      { text: "Tom was not mad at Al. Dot was not mad at Al. Al was not sad.",
        art: { bg: "beach", items: [["tom", 80, 228, 1, { p: "up" }], ["dot", 150, 228, 1, { p: "up" }], ["al", 300, 228, 0.82, { m: "happy", f: true }], ["heart", 230, 60, 1.2, { a: "float" }]] } },
      { text: "Dot got on top of Al. Al ran.",
        art: { bg: "beach", items: [["palm", 345, 200, 0.95], ["al", 170, 228, 0.85, { m: "happy", a: "run" }], ["dot", 156, 152, 0.85, { p: "sit", a: "run" }]] } },
      { text: "Tom got Al a pop. Dot got him a hot dog. Al was not sad.",
        art: { bg: "park", items: [["tom", 80, 228, 1, { hold: "pop" }], ["al", 200, 228, 0.82, { m: "happy", a: "bounce" }], ["dot", 340, 228, 1, { hold: "hotdog", f: true }], ["heart", 120, 70, 1, { a: "float" }], ["sparkle", 300, 60, 1, { a: "spin" }]] } }
    ],
    quiz: [
      { q: "Who is big?", say: "Who is big?", choices: [{ t: "Al", e: "🦕" }, { t: "Tom", e: "👦" }, { t: "Dot", e: "👧" }], answer: 0 },
      { q: "What did Dot have?", say: "What did Dot have?", choices: [{ t: "a bus", e: "🚌" }, { t: "a hot dog", e: "🌭" }, { t: "a hat", e: "🎩" }], answer: 1 },
      { q: "Where did the man go?", say: "Where did the man go?", choices: [{ t: "in the mud", e: "🟤" }, { t: "up a tree", e: "🌴" }, { t: "on the bus", e: "🚌" }], answer: 2 },
      { q: "Was Al sad at the end?", say: "At the end, was Al sad?", choices: [{ t: "No, Al was not sad!", e: "😄" }, { t: "Yes, Al was sad.", e: "😢" }], answer: 0 }
    ]
  },

  {
    id: "tim", n: 2, title: "Tim", vowel: "u", color: "#a5d66b", accent: "#4f8a2b",
    sticker: { emoji: "🐢", name: "Tim the Turtle" },
    blurb: "A turtle, a bug and a big tug!",
    focus: ["bug", "fun", "mud", "pup", "run", "runs", "sun", "tug", "up"],
    sight: ["a", "and", "of", "the", "to", "was"],
    pages: [
      { text: "Tim has a nap. Tim is in the mud.",
        art: { bg: "beach", items: [["palm", 340, 198, 1], ["bush", 70, 214, 1], ["mud", 190, 228, 1, { w: 100 }], ["tim", 190, 224, 1.1, { m: "sleep" }]] } },
      { text: "A big bug sat on top of Tim. The bug did tug on Tim.",
        art: { bg: "beach", items: [["palm", 340, 198, 1], ["mud", 190, 228, 1, { w: 100 }], ["tim", 190, 224, 1.1, { m: "sleep" }], ["bug", 196, 150, 1.5, { a: "wiggle" }]] } },
      { text: "Tim was mad at the bug. The bug got him up.",
        art: { bg: "beach", items: [["palm", 340, 198, 1], ["mud", 170, 228, 1, { w: 100 }], ["tim", 170, 224, 1.1, { m: "mad" }], ["bug", 290, 110, 1.5, { a: "fly" }]] } },
      { text: "Tim ran to nip the bug.",
        art: { bg: "park", items: [["tim", 140, 224, 1.1, { m: "mad", a: "run" }], ["trail", 0, 0, 1, { d: "M230,180 Q260,120 300,118" }], ["bug", 300, 118, 1.5, { a: "fly" }]] } },
      { text: "The bug was on the big log. Tim ran to it.",
        art: { bg: "park", items: [["log", 240, 226, 1.1, { hollow: true }], ["bug", 226, 166, 1.4, { a: "wiggle" }], ["tim", 74, 224, 0.95, { a: "run" }]] } },
      { text: "The bug hid in the log. Tim got up, but Tim did not fit in it.",
        art: { bg: "park", items: [["log", 180, 226, 1.2, { hollow: true }], ["tim", 340, 224, 0.95, { m: "wow", f: true }]] } },
      { text: "Tim got up on the log. The bug was not in the log.",
        art: { bg: "park", items: [["log", 190, 228, 1.2, { hollow: true }], ["tim", 180, 174, 0.85, { m: "wow" }], ["bug", 336, 84, 1.3, { a: "fly" }]] } },
      { text: "The log is big, but it did tip. Tim can not sit on it.",
        art: { bg: "park", items: [["log", 200, 228, 1.2, { r: -10, hollow: true }], ["tim", 168, 176, 0.85, { m: "wow", r: -25, a: "shake" }]] } },
      { text: "Tim can not sit up.",
        art: { bg: "park", items: [["log", 330, 228, 0.9, { r: -8 }], ["tim", 170, 222, 1.25, { stuck: true, m: "sad", a: "wiggle" }]] } },
      { text: "Tag runs up to Tim. Tag can not tip him up. The pup runs on.",
        art: { bg: "park", items: [["tim", 130, 222, 1.1, { stuck: true, m: "sad" }], ["tag", 280, 226, 1.25, { f: true, a: "bounce" }]] } },
      { text: "It is hot in the sun. Tim is hot and sad.",
        art: { bg: "beach", items: [["sun", 330, 56, 1.25, { hot: true }], ["tim", 180, 222, 1.15, { stuck: true, m: "sad", a: "wiggle" }]] } },
      { text: "Al runs up to Tim. Al is big. Al can tip him up.",
        art: { bg: "beach", items: [["sun", 360, 46, 0.8, { hot: true }], ["tim", 100, 222, 1, { stuck: true, m: "sad" }], ["al", 290, 228, 0.8, { m: "happy", f: true, a: "run" }]] } },
      { text: "Al has to tug on Tim.",
        art: { bg: "beach", items: [["tim", 150, 222, 1, { stuck: true, m: "wow", r: -25 }], ["al", 280, 228, 0.8, { m: "happy", f: true, a: "shake" }]] } },
      { text: "Tim got a big tug. Al got him up.",
        art: { bg: "beach", items: [["tim", 140, 224, 1, { m: "happy", a: "bounce" }], ["al", 290, 228, 0.8, { m: "happy", f: true }], ["sparkle", 140, 120, 1.2, { a: "spin" }], ["sparkle", 90, 150, 0.8, { a: "spin" }]] } },
      { text: "Tim has a pal. His pal is Al. Tim and Al run to the mud.",
        art: { bg: "beach", items: [["mud", 330, 230, 1, { w: 70 }], ["tim", 110, 224, 0.95, { a: "run" }], ["al", 210, 228, 0.75, { m: "happy", a: "run" }], ["heart", 120, 70, 1.1, { a: "float" }]] } },
      { text: "Tim and Al sat in the mud. Tim and Al had a lot of fun.",
        art: { bg: "beach", items: [["palm", 360, 198, 0.9], ["mud", 200, 234, 1, { w: 150 }], ["tim", 110, 230, 1, { m: "happy" }], ["al", 250, 234, 0.8, { m: "happy", a: "bounce" }], ["heart", 170, 70, 1, { a: "float" }], ["sparkle", 60, 90, 1, { a: "spin" }]] } }
    ],
    quiz: [
      { q: "What is Tim?", say: "What is Tim?", choices: [{ t: "a pup", e: "🐶" }, { t: "a turtle", e: "🐢" }, { t: "a bug", e: "🐞" }], answer: 1 },
      { q: "Where did the bug hide?", say: "Where did the bug hide?", choices: [{ t: "in the log", e: "🪵" }, { t: "on the bus", e: "🚌" }, { t: "in a hat", e: "🎩" }], answer: 0 },
      { q: "Who got Tim up?", say: "Who got Tim up?", choices: [{ t: "Tag the pup", e: "🐶" }, { t: "the bug", e: "🐞" }, { t: "Al", e: "🦕" }], answer: 2 },
      { q: "Where did Tim and Al have fun?", say: "Where did Tim and Al have fun?", choices: [{ t: "in the sun", e: "☀️" }, { t: "in the mud", e: "🟤" }, { t: "on a log", e: "🪵" }], answer: 1 }
    ]
  },

  {
    id: "sam", n: 3, title: "Sam and the Hat", vowel: "a", color: "#ffa94d", accent: "#d9480f", bonus: true,
    sticker: { emoji: "🐱", name: "Sam the Cat" },
    blurb: "A cat who naps in funny spots!",
    focus: ["bag", "cat", "had", "hat", "mat", "nap", "pat", "ran", "Sam", "sat", "can"],
    sight: ["a", "and", "is", "the", "to"],
    pages: [
      { text: "Sam is a cat. Sam has a nap on a mat.",
        art: { bg: "room", items: [["mat", 190, 238, 1.3], ["sam", 190, 232, 1.25, { m: "sleep" }]] } },
      { text: "Dot has a hat. It is a red hat.",
        art: { bg: "room", items: [["dot", 200, 236, 1.15, { p: "hold", hold: "hat", holdC: "#e63946" }], ["sam", 330, 234, 0.9, { m: "happy" }]] } },
      { text: "Dot sat the hat on the mat.",
        art: { bg: "room", items: [["mat", 230, 238, 1.3], ["hat", 230, 230, 1.4, { c: "#e63946" }], ["dot", 100, 236, 1.1, { p: "reach" }]] } },
      { text: "Sam ran to the hat. Sam sat in the hat!",
        art: { bg: "room", items: [["mat", 200, 238, 1.3], ["sam", 200, 216, 1.05, { m: "wow" }], ["hat", 200, 236, 2.1, { c: "#e63946" }]] } },
      { text: "Dot can not get the hat. Dot is sad.",
        art: { bg: "room", items: [["dot", 100, 236, 1.1, { m: "sad" }], ["mat", 250, 238, 1.3], ["sam", 250, 216, 1.05, { m: "happy" }], ["hat", 250, 236, 2.1, { c: "#e63946" }]] } },
      { text: "Tom has a bag. Tom ran to Sam.",
        art: { bg: "room", items: [["tom", 120, 236, 1.1, { p: "run", hold: "bag", a: "run" }], ["sam", 310, 234, 1, { m: "wow" }]] } },
      { text: "Sam ran to the bag. Sam hid in the bag.",
        art: { bg: "room", items: [["tom", 90, 236, 1.1, { m: "wow" }], ["bagcat", 220, 238, 1.6, { m: "happy", a: "wiggle" }], ["hat", 330, 234, 1.4, { c: "#e63946" }]] } },
      { text: "Dot got the hat. Dot is not sad.",
        art: { bg: "room", items: [["dot", 200, 236, 1.15, { p: "up", hat: true, hatC: "#e63946", a: "bounce" }], ["sparkle", 130, 90, 1, { a: "spin" }], ["sparkle", 280, 70, 1.2, { a: "spin" }]] } },
      { text: "Tom and Dot sat. Sam had a nap in the bag.",
        art: { bg: "room", items: [["tom", 80, 236, 1.05, { p: "sit" }], ["dot", 160, 236, 1.05, { p: "sit", hat: true, hatC: "#e63946" }], ["bagcat", 300, 238, 1.6, { m: "sleep" }]] } },
      { text: "Sam is a fun cat. Dot and Tom pat Sam.",
        art: { bg: "room", items: [["mat", 200, 238, 1.4], ["dot", 110, 236, 1.1, { p: "reach" }], ["sam", 200, 234, 1.25, { m: "happy", a: "bounce" }], ["tom", 300, 236, 1.1, { p: "reach", f: true }], ["heart", 200, 64, 1.2, { a: "float" }]] } }
    ],
    quiz: [
      { q: "What is Sam?", say: "What is Sam?", choices: [{ t: "a cat", e: "🐱" }, { t: "a pig", e: "🐷" }, { t: "a dog", e: "🐶" }], answer: 0 },
      { q: "Where did Sam sit?", say: "Where did Sam sit?", choices: [{ t: "on the bus", e: "🚌" }, { t: "in the hat", e: "🎩" }, { t: "in the mud", e: "🟤" }], answer: 1 },
      { q: "Where did Sam nap at the end?", say: "Where did Sam nap at the end?", choices: [{ t: "in the bag", e: "👜" }, { t: "on a log", e: "🪵" }, { t: "in the sun", e: "☀️" }], answer: 0 }
    ]
  },

  {
    id: "pip", n: 4, title: "Pip the Pig", vowel: "i", color: "#ffb3c7", accent: "#d6336c", bonus: true,
    sticker: { emoji: "🐷", name: "Pip the Pig" },
    blurb: "A pig who can dig, dig, dig!",
    focus: ["big", "did", "dig", "digs", "his", "is", "it", "mitt", "pig", "Pip", "pit", "sit", "in"],
    sight: ["a", "and", "the", "was"],
    pages: [
      { text: "Pip is a pig. Pip is big.",
        art: { bg: "farm", items: [["pip", 180, 230, 1.6, { m: "happy", a: "bounce" }]] } },
      { text: "Pip can dig. Pip digs and digs.",
        art: { bg: "farm", items: [["mud", 190, 234, 1, { w: 90 }], ["pip", 170, 226, 1.4, { r: 15, a: "shake" }], ["dirt", 262, 200, 1.5]] } },
      { text: "Tom lost his mitt. Tom is sad.",
        art: { bg: "farm", items: [["tom", 180, 232, 1.15, { m: "sad" }], ["pip", 320, 232, 0.9, { m: "wow", f: true }]] } },
      { text: "Pip did dig in the mud. Dig, Pip, dig!",
        art: { bg: "farm", items: [["mud", 180, 234, 1, { w: 90 }], ["pip", 160, 226, 1.3, { r: 15, a: "shake" }], ["dirt", 244, 202, 1.5], ["tom", 330, 232, 1, { p: "up", f: true }]] } },
      { text: "Pip did not get the mitt. Pip did get a lid.",
        art: { bg: "farm", items: [["pit", 150, 238, 1], ["lid", 150, 214, 1.4, { a: "float" }], ["pip", 270, 230, 1.25, { m: "wow", f: true }]] } },
      { text: "Pip dug a big pit. It is a big, big pit.",
        art: { bg: "farm", items: [["pit", 170, 240, 1.4], ["pip", 196, 214, 1.15, { r: 30, a: "shake" }], ["dirt", 300, 210, 1.4]] } },
      { text: "Pip got the mitt! It was in the pit.",
        art: { bg: "farm", items: [["pit", 120, 240, 1], ["pip", 230, 230, 1.3, { m: "happy", a: "bounce" }], ["mitt", 302, 196, 1.1], ["sparkle", 330, 120, 1, { a: "spin" }]] } },
      { text: "Tom has his mitt. Tom is not sad.",
        art: { bg: "farm", items: [["tom", 160, 232, 1.15, { hold: "mitt", a: "bounce" }], ["pip", 290, 230, 1.2, { m: "happy", f: true }]] } },
      { text: "Tom and Pip sit in the sun.",
        art: { bg: "farm", items: [["sun", 200, 52, 1], ["tom", 130, 232, 1.1, { p: "sit" }], ["pip", 270, 230, 1.2, { m: "sleep" }]] } },
      { text: "Pip is a big pig. Pip is a big pal.",
        art: { bg: "farm", items: [["tom", 80, 232, 1.05, { p: "up" }], ["pip", 210, 232, 1.5, { m: "happy", a: "bounce" }], ["heart", 210, 64, 1.2, { a: "float" }], ["sparkle", 120, 80, 1, { a: "spin" }]] } }
    ],
    quiz: [
      { q: "Who is Pip?", say: "Who is Pip?", choices: [{ t: "a cat", e: "🐱" }, { t: "a pup", e: "🐶" }, { t: "a pig", e: "🐷" }], answer: 2 },
      { q: "What did Tom lose?", say: "What did Tom lose?", choices: [{ t: "his mitt", e: "🧤" }, { t: "his jet", e: "✈️" }, { t: "his hat", e: "🎩" }], answer: 0 },
      { q: "Where was the mitt?", say: "Where was the mitt?", choices: [{ t: "on the bus", e: "🚌" }, { t: "in the pit", e: "🕳️" }, { t: "in a bag", e: "👜" }], answer: 1 }
    ]
  },

  {
    id: "jet", n: 5, title: "The Jet", vowel: "e", color: "#ff8a8a", accent: "#c92a2a",
    sticker: { emoji: "✈️", name: "Bob's Tin Jet" },
    blurb: "Bob's tin jet has a lot of pep!",
    focus: ["get", "jet", "pep"],
    sight: ["a", "go", "no", "of", "the", "to"],
    pages: [
      { text: "Bob has a jet. It is a tin jet. The tin jet is big.",
        art: { bg: "field", items: [["bob", 120, 224, 1.1, { p: "reach" }], ["jet", 270, 150, 1.7, { a: "float" }]] } },
      { text: "Bob can get the jet to go.",
        art: { bg: "field", items: [["bob", 120, 224, 1.1, { p: "up" }], ["string", 0, 0, 1, { d: "M147,123 Q210,110 240,132" }], ["jet", 266, 132, 1.3, { a: "fly" }]] } },
      { text: "The tin jet is up. Bob got it to go. Bob had to run.",
        art: { bg: "field", items: [["bob", 140, 224, 1.1, { p: "run", a: "run" }], ["string", 0, 0, 1, { d: "M169,140 Q240,140 280,80" }], ["jet", 300, 74, 1.1, { a: "fly" }]] } },
      { text: "The big jet is up. It has a lot of pep.",
        art: { bg: "sky", items: [["trail", 0, 0, 1, { d: "M10,210 Q90,120 140,140" }], ["jet", 210, 130, 2.1, { a: "fly" }]] } },
      { text: "Bob got the jet to dip. A jet is a lot of fun.",
        art: { bg: "field", items: [["bob", 110, 224, 1.1, { p: "up", m: "happy" }], ["string", 0, 0, 1, { d: "M136,123 Q220,90 262,148" }], ["jet", 284, 156, 1.2, { r: 25, a: "fly" }]] } },
      { text: "The jet is up. Bob can not get it.",
        art: { bg: "field", items: [["bob", 120, 224, 1.1, { p: "reach", m: "wow" }], ["string", 0, 0, 1, { d: "M157,165 Q250,150 300,60" }], ["jet", 320, 52, 0.9, { a: "fly" }]] } },
      { text: "The jet did a big dip.",
        art: { bg: "sky", items: [["trail", 0, 0, 1, { d: "M30,40 Q150,20 170,120" }], ["jet", 205, 150, 1.9, { r: 30, a: "fly" }]] } },
      { text: "The jet did not hit the man.",
        art: { bg: "field", items: [["man", 160, 226, 1.3, { m: "wow" }], ["trail", 0, 0, 1, { d: "M390,60 Q330,80 330,110" }], ["jet", 290, 114, 1.1, { f: true, r: -15, a: "fly" }]] } },
      { text: "The man did not get the jet.",
        art: { bg: "field", items: [["man", 220, 226, 1.3, { p: "up", m: "wow" }], ["jet", 80, 70, 1, { f: true, a: "fly" }], ["bob", 350, 224, 0.85, { p: "run", f: true }]] } },
      { text: "Bob can not get his jet. It has a lot of pep.",
        art: { bg: "field", items: [["bob", 110, 224, 1.1, { p: "run", m: "wow", a: "run" }], ["trail", 0, 0, 1, { d: "M200,190 Q240,180 270,150" }], ["jet", 300, 138, 1.1, { r: -20, a: "fly" }]] } },
      { text: "The jet did a big dip.",
        art: { bg: "sky", items: [["trail", 0, 0, 1, { d: "M380,40 Q260,30 250,100" }], ["jet", 200, 120, 1.9, { f: true, r: -25, a: "fly" }]] } },
      { text: "The jet did not hit the man. It hit his hat.",
        art: { bg: "field", items: [["man", 150, 226, 1.3, { m: "wow" }], ["hat", 222, 130, 1.4, { r: -30, a: "spin" }], ["jet", 290, 120, 1, { f: true, a: "fly" }]] } },
      { text: "The man can get his hat.",
        art: { bg: "field", items: [["man", 160, 226, 1.3, { p: "bend", m: "happy" }], ["hat", 210, 224, 1.3], ["bob", 320, 224, 1, { m: "happy" }], ["jet", 330, 60, 0.7, { a: "fly" }]] } },
      { text: "The jet can not get up. It has no pep.",
        art: { bg: "field", items: [["trail", 0, 0, 1, { d: "M60,60 Q140,80 170,170" }], ["jet", 210, 196, 1.6, { r: 22, a: "shake" }]] } },
      { text: "The jet hit the mud. Bob ran to get it.",
        art: { bg: "field", items: [["mud", 120, 234, 1, { w: 90 }], ["jet", 120, 214, 1.2, { r: 30 }], ["bob", 300, 224, 1.1, { p: "run", f: true, m: "wow", a: "run" }]] } },
      { text: "Bob got his jet. His big, tin jet is a lot of fun.",
        art: { bg: "field", items: [["mud", 320, 234, 1, { w: 60 }], ["bob", 180, 224, 1.1, { p: "up", m: "happy", a: "bounce" }], ["jet", 230, 100, 1.2, { a: "float" }], ["sparkle", 110, 70, 1, { a: "spin" }], ["heart", 310, 80, 1, { a: "float" }]] } }
    ],
    quiz: [
      { q: "What does Bob have?", say: "What does Bob have?", choices: [{ t: "a bus", e: "🚌" }, { t: "a jet", e: "✈️" }, { t: "a pup", e: "🐶" }], answer: 1 },
      { q: "What did the jet hit?", say: "What did the jet hit?", choices: [{ t: "the man's hat", e: "🎩" }, { t: "the man", e: "👨" }, { t: "a log", e: "🪵" }], answer: 0 },
      { q: "Where did the jet land?", say: "Where did the jet land at the end?", choices: [{ t: "on the bus", e: "🚌" }, { t: "in a bag", e: "👜" }, { t: "in the mud", e: "🟤" }], answer: 2 },
      { q: "Is the tin jet fun?", say: "Is the tin jet fun?", choices: [{ t: "Yes, a lot of fun!", e: "🎉" }, { t: "No, it is not fun.", e: "😐" }], answer: 0 }
    ]
  }
];

/* Encouragement — picked at random, spoken by Echo */
const PRAISE = {
  perfect: [
    "Wow! You read every word! You are a reading superstar!",
    "Amazing reading! Every single word was right!",
    "Ka-boom! Perfect reading! I am so proud of you!",
    "You read that like a real book reader!",
    "Fantastic! Your reading is out of this world!",
    "Perfect! Give yourself a big high five!"
  ],
  good: [
    "Great reading! You got almost all of them!",
    "Super job! You are getting so good at this!",
    "Nice reading! Let's polish one or two words.",
    "Woo-hoo! That was strong reading!"
  ],
  tryAgain: [
    "Good try! Reading takes practice, and you are practising!",
    "That was brave reading! Let's do it together.",
    "You are learning so fast! Let's look at some words."
  ],
  fixed: ["Yes! You got it!", "That's it! Perfect!", "You fixed it! Hooray!", "Super! Now you know that word!", "Yes, yes, yes! Great job!"],
  right: ["Yes! That's right!", "You got it!", "Correct! Smart thinking!", "Great job!", "Woo-hoo! Right answer!"],
  oops: ["Good try! Look again.", "Ooh, so close! Try another one.", "Nice thinking! Try again."]
};

/* Fun stickers unlocked by perfect reading (one every 3 perfect pages) */
const FUN_STICKERS = [
  { id: "f-star", emoji: "🌟", name: "Shining Star" }, { id: "f-rocket", emoji: "🚀", name: "Rocket Reader" },
  { id: "f-rainbow", emoji: "🌈", name: "Rainbow" }, { id: "f-unicorn", emoji: "🦄", name: "Unicorn" },
  { id: "f-donut", emoji: "🍩", name: "Sprinkle Donut" }, { id: "f-balloon", emoji: "🎈", name: "Balloon" },
  { id: "f-lion", emoji: "🦁", name: "Brave Lion" }, { id: "f-car", emoji: "🏎️", name: "Race Car" },
  { id: "f-octo", emoji: "🐙", name: "Octopus" }, { id: "f-cake", emoji: "🎂", name: "Party Cake" },
  { id: "f-crown", emoji: "👑", name: "Reading Crown" }, { id: "f-dragon", emoji: "🐉", name: "Friendly Dragon" },
  { id: "f-pizza", emoji: "🍕", name: "Pizza Party" }, { id: "f-whale", emoji: "🐳", name: "Big Whale" },
  { id: "f-robot", emoji: "🤖", name: "Robot Pal" }, { id: "f-trophy", emoji: "🏆", name: "Champion Cup" }
];

const PH_TROPHIES = [
  { id: "first-read", icon: "🎤", name: "First Read-Aloud", desc: "Read a page out loud to Echo" },
  { id: "first-book", icon: "📗", name: "Book Finisher", desc: "Finish your first book" },
  { id: "word-fixer", icon: "🔧", name: "Word Fixer", desc: "Practise 5 tricky words" },
  { id: "quiz-whiz", icon: "🧠", name: "Quiz Whiz", desc: "Get every quiz answer right on the first try" },
  { id: "perfect-10", icon: "💯", name: "Perfect Ten", desc: "Read 10 pages perfectly" },
  { id: "sound-star", icon: "🔤", name: "Sound Star", desc: "Finish 3 Sound Warm-ups" },
  { id: "all-books", icon: "👑", name: "Super Reader", desc: "Finish all 5 books" },
  { id: "letter-pro", icon: "🔠", name: "Letter Pro", desc: "Finish all 4 Letter Sounds lessons" },
  { id: "sight-star", icon: "👀", name: "Sight Word Star", desc: "Finish all 4 Sight Words lessons" },
  { id: "builder", icon: "🧩", name: "Sentence Builder", desc: "Build 6 sentences" },
  { id: "team-champ", icon: "🤫", name: "Sound Team Champ", desc: "Finish all 4 Sh, Ch, Th lessons" },
  { id: "blend-champ", icon: "🌊", name: "Blend Champ", desc: "Finish all 4 Blends lessons" }
];

/* ============================================================
   PHASES — Phonics Pals as a step-by-step path (added 2026-10-16)
   ------------------------------------------------------------
   Phase 1 Letter Sounds  → letter lessons below (kind "letters")
   Phase 2 Story Books    → the 5 BOOKS above (ids unchanged, so
                            saved progress in ph_books is kept)
   Phase 3 Sight Words    → sight-word lessons (kind "sight"): meet the
                            words, a word game, then build sentences
                            from word tiles (first writing practice)
   Phase 4 Sh, Ch, Th     → digraph lessons (kind "digraph"): meet the
                            sound team, a sound game, then build sentences
   Phase 5 Blends         → blend lessons (kind "blend"): same 3 steps as Phase 4,
                            but each letter keeps its own sound and they slide together
   Phase 6                → no lessons yet = "coming soon"
   A phase opens when the one before it is finished; phases 1–3 are
   open from the start.
   ============================================================ */
const LETTER_PICS = {
  s: { w: "sun", e: "🌞" }, a: { w: "apple", e: "🍎" }, t: { w: "turtle", e: "🐢" }, p: { w: "pig", e: "🐷" },
  i: { w: "insect", e: "🐜" }, n: { w: "nose", e: "👃" }, m: { w: "moon", e: "🌙" }, d: { w: "dog", e: "🐶" },
  g: { w: "goat", e: "🐐" }, o: { w: "octopus", e: "🐙" }, c: { w: "cat", e: "🐱" }, k: { w: "key", e: "🔑" },
  e: { w: "egg", e: "🥚" }, u: { w: "umbrella", e: "☂️" }, r: { w: "rabbit", e: "🐰" }, h: { w: "hat", e: "🎩" },
  b: { w: "ball", e: "⚽" }, f: { w: "fish", e: "🐟" }, l: { w: "lion", e: "🦁" }, j: { w: "jet", e: "✈️" },
  v: { w: "van", e: "🚐" }, w: { w: "web", e: "🕸️" }, x: { w: "box", e: "📦", end: true }, y: { w: "yarn", e: "🧶" },
  z: { w: "zebra", e: "🦓" }, q: { w: "queen", e: "👸" }
};

const PHASES = [
  { id: "k1", n: 1, title: "Letter Sounds", sub: "Every letter and the sound it makes", emoji: "🔤", color: "#ffd8a8", accent: "#f08c00",
    lessons: [
      { id: "ls1", kind: "letters", title: "s a t p i n", letters: ["s", "a", "t", "p", "i", "n"], sticker: { emoji: "🌞", name: "Sunny Sounds" } },
      { id: "ls2", kind: "letters", title: "m d g o c k", letters: ["m", "d", "g", "o", "c", "k"], sticker: { emoji: "🐙", name: "Octopus Pal" } },
      { id: "ls3", kind: "letters", title: "e u r h b f", letters: ["e", "u", "r", "h", "b", "f"], sticker: { emoji: "🐰", name: "Hoppy Rabbit" } },
      { id: "ls4", kind: "letters", title: "l j v w x y z q", letters: ["l", "j", "v", "w", "x", "y", "z", "q"], sticker: { emoji: "🦓", name: "Zippy Zebra" } }
    ] },
  { id: "k2", n: 2, title: "Story Books", sub: "Short vowel stories to read to Echo", emoji: "📚", color: "#b2f2bb", accent: "#2f9e44",
    books: ["al", "tim", "sam", "pip", "jet"] },
  { id: "k3", n: 3, title: "Sight Words", sub: "Words to know by heart: the, is, said, you", emoji: "👀", color: "#d0bfff", accent: "#7048e8",
    lessons: [
      { id: "sw1", kind: "sight", title: "I · a · the · see · is", words: ["I", "a", "the", "see", "is"],
        sentences: [{ s: "I see a cat.", e: "🐱" }, { s: "The sun is hot.", e: "🌞" }, { s: "I see the bus.", e: "🚌" }],
        sticker: { emoji: "👀", name: "Super Spotter" } },
      { id: "sw2", kind: "sight", title: "and · my · like · go · to", words: ["and", "my", "like", "go", "to"],
        sentences: [{ s: "I like my dog.", e: "🐶" }, { s: "Mom and Dad sit.", e: "🛋️" }, { s: "I go to bed.", e: "🛏️" }],
        sticker: { emoji: "🐶", name: "Puppy Pal" } },
      { id: "sw3", kind: "sight", title: "we · can · you · look · up", words: ["we", "can", "you", "look", "up"],
        sentences: [{ s: "We can run.", e: "🏃" }, { s: "Can you hop?", e: "🐸" }, { s: "Look up at the jet!", e: "✈️" }],
        sticker: { emoji: "🐸", name: "Hoppy Frog" } },
      { id: "sw4", kind: "sight", title: "said · here · play · come · me", words: ["said", "here", "play", "come", "me"],
        sentences: [{ s: "Come and play.", e: "🤸" }, { s: "Here is my hat.", e: "🎩" }, { s: "Dad said hi to me.", e: "👋" }],
        sticker: { emoji: "🎈", name: "Play Day Balloon" } }
    ] },
  { id: "k4", n: 4, title: "Sh, Ch, Th", sub: "Two letters that make one sound", emoji: "🤫", color: "#a5d8ff", accent: "#1c7ed6",
    lessons: [
      { id: "dg1", kind: "digraph", title: "sh", teams: ["sh"],
        words: [{ w: "ship", e: "🚢" }, { w: "shell", e: "🐚" }, { w: "shop", e: "🏪" }, { w: "fish", e: "🐟" }, { w: "dish", e: "🍽️" }, { w: "brush", e: "🪥" }],
        sentences: [{ s: "The fish is in the dish.", e: "🐟" }, { s: "I see a big ship.", e: "🚢" }, { s: "The cat is on the shelf.", e: "🐱" }],
        sticker: { emoji: "🐚", name: "Shiny Shell" } },
      { id: "dg2", kind: "digraph", title: "ch", teams: ["ch"],
        words: [{ w: "chip", e: "🍟" }, { w: "chick", e: "🐥" }, { w: "chin", e: "🧔" }, { w: "chop", e: "🪓" }, { w: "lunch", e: "🍱" }, { w: "bench", e: "🪑" }],
        sentences: [{ s: "The chick can chirp.", e: "🐥" }, { s: "I had chips for lunch.", e: "🍟" }, { s: "Mom sat on the bench.", e: "🪑" }],
        sticker: { emoji: "🐥", name: "Chirpy Chick" } },
      { id: "dg3", kind: "digraph", title: "th", teams: ["th"],
        words: [{ w: "thumb", e: "👍" }, { w: "three", e: "3️⃣" }, { w: "thin", e: "🥢" }, { w: "bath", e: "🛁" }, { w: "moth", e: "🦋" }, { w: "teeth", e: "🦷" }],
        sentences: [{ s: "I have three cats.", e: "🐱" }, { s: "The duck is in the bath.", e: "🛁" }, { s: "Thumbs up for me!", e: "👍" }],
        sticker: { emoji: "👍", name: "Thumbs Up" } },
      { id: "dg4", kind: "digraph", title: "sh · ch · th", teams: ["sh", "ch", "th"], mix: true,
        words: [{ w: "shed", e: "🛖" }, { w: "cheese", e: "🧀" }, { w: "path", e: "🛤️" }, { w: "wash", e: "🧼" }, { w: "much", e: "💯" }, { w: "with", e: "🤝" }],
        sentences: [{ s: "The rat ate the cheese.", e: "🧀" }, { s: "Wash the dish with me.", e: "🧼" }, { s: "The shed is on the path.", e: "🛖" }],
        sticker: { emoji: "🧀", name: "Cheesy Champ" } }
    ] },
  { id: "k5", n: 5, title: "Blends", sub: "Sounds that slide together: st, fl, gr", emoji: "🌊", color: "#ffc9c9", accent: "#e03131",
    lessons: [
      { id: "bl1", kind: "blend", title: "st · sp · sn", teams: ["st", "sp", "sn"],
        words: [{ w: "star", e: "⭐" }, { w: "stop", e: "🛑" }, { w: "spoon", e: "🥄" }, { w: "spider", e: "🕷️" }, { w: "snail", e: "🐌" }, { w: "snake", e: "🐍" }],
        sentences: [{ s: "I see a star.", e: "⭐" }, { s: "The snail is slow.", e: "🐌" }, { s: "Stop, big snake!", e: "🐍" }],
        sticker: { emoji: "🐌", name: "Speedy Snail" } },
      { id: "bl2", kind: "blend", title: "fl · cl · bl", teams: ["fl", "cl", "bl"],
        words: [{ w: "flag", e: "🚩" }, { w: "flower", e: "🌸" }, { w: "clock", e: "🕰️" }, { w: "cloud", e: "☁️" }, { w: "blue", e: "🔵" }, { w: "block", e: "🧱" }],
        sentences: [{ s: "The flag is red.", e: "🚩" }, { s: "I like the blue block.", e: "🧱" }, { s: "Clap for me!", e: "👏" }],
        sticker: { emoji: "🌸", name: "Flower Power" } },
      { id: "bl3", kind: "blend", title: "gr · tr · cr", teams: ["gr", "tr", "cr"],
        words: [{ w: "grapes", e: "🍇" }, { w: "grass", e: "🌱" }, { w: "tree", e: "🌳" }, { w: "truck", e: "🚚" }, { w: "crab", e: "🦀" }, { w: "crown", e: "👑" }],
        sentences: [{ s: "The crab is red.", e: "🦀" }, { s: "I see a big tree.", e: "🌳" }, { s: "The truck is on the grass.", e: "🚚" }],
        sticker: { emoji: "👑", name: "Crab King" } },
      { id: "bl4", kind: "blend", title: "-st · -nd · -mp", teams: ["st", "nd", "mp"], mix: true,
        words: [{ w: "nest", e: "🪺" }, { w: "fist", e: "✊" }, { w: "hand", e: "✋" }, { w: "sand", e: "🏖️" }, { w: "lamp", e: "💡" }, { w: "jump", e: "🦘" }],
        sentences: [{ s: "Jump in the sand.", e: "🏖️" }, { s: "The bird is in the nest.", e: "🪺" }, { s: "Hold my hand.", e: "✋" }],
        sticker: { emoji: "🦘", name: "Jumpy Roo" } }
    ] },
  { id: "k6", n: 6, title: "Magic e", sub: "cake, bike, home: the e makes the vowel say its name", emoji: "✨", color: "#fff3bf", accent: "#f59f00" }
];
