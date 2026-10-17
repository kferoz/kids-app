/* ============================================================
   Learning Speedway — Data
   A car-racing learning game for Kindergarten (ages 4-6).
   Rev the Race Car drives a 3-lane road; every "gate" on the
   road is an answer. Steer into the right gate to zoom ahead.

   Everything here is DATA + ROUND MAKERS, so growing the app is
   additive:
     - new subject  -> add a ZONE + its COURSES (+ makers)
     - new activity -> add a COURSE with a `gen` name, and a
                       matching function in ROUND_MAKERS
     - new car      -> append to CAR_GARAGE
   A round maker returns:
     { q, say, visual?, choices:[{html,key}], answerKey, hint? }
   ============================================================ */

/* ---------- tiny shared helpers ---------- */
function swPick(a) { return a[Math.floor(Math.random() * a.length)]; }
function swRnd(min, max) { return min + Math.floor(Math.random() * (max - min + 1)); }
function swShuffle(a) {
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}
/* Build 3 unique lane choices: the correct one + 2 from make(). */
function swOptions(correct, make, n) {
  var out = [correct], guard = 0, want = n || 3;
  while (out.length < want && guard++ < 300) {
    var c = make();
    if (!c) continue;
    var dup = false;
    for (var i = 0; i < out.length; i++) if (out[i].key === c.key) { dup = true; break; }
    if (!dup) out.push(c);
  }
  return swShuffle(out);
}
function swRepeat(emoji, n) {
  var s = "";
  for (var i = 0; i < n; i++) s += '<span class="pip">' + emoji + '</span>';
  return s;
}

/* ============================================================
   POOLS
   ============================================================ */
var SW_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

/* picture words - `s` is the beginning letter */
var SW_PIC_WORDS = [
  { w: "apple", e: "🍎", s: "A" }, { w: "ball", e: "⚽", s: "B" },
  { w: "cat", e: "🐱", s: "C" },   { w: "dog", e: "🐶", s: "D" },
  { w: "egg", e: "🥚", s: "E" },   { w: "fish", e: "🐟", s: "F" },
  { w: "goat", e: "🐐", s: "G" },  { w: "hat", e: "🎩", s: "H" },
  { w: "ice cream", e: "🍦", s: "I" }, { w: "jet", e: "✈️", s: "J" },
  { w: "kite", e: "🪁", s: "K" },  { w: "leaf", e: "🍃", s: "L" },
  { w: "moon", e: "🌙", s: "M" },  { w: "nest", e: "🪺", s: "N" },
  { w: "owl", e: "🦉", s: "O" },   { w: "pig", e: "🐷", s: "P" },
  { w: "queen", e: "👑", s: "Q" }, { w: "rain", e: "🌧️", s: "R" },
  { w: "sun", e: "☀️", s: "S" },   { w: "tree", e: "🌳", s: "T" },
  { w: "umbrella", e: "☂️", s: "U" }, { w: "van", e: "🚐", s: "V" },
  { w: "web", e: "🕸️", s: "W" },   { w: "yarn", e: "🧶", s: "Y" },
  { w: "zebra", e: "🦓", s: "Z" }
];

/* rhyming families - every word in a group rhymes with the others */
var SW_RHYMES = [
  [{ w: "cat", e: "🐱" }, { w: "hat", e: "🎩" }, { w: "bat", e: "🦇" }],
  [{ w: "dog", e: "🐶" }, { w: "log", e: "🪵" }, { w: "frog", e: "🐸" }],
  [{ w: "sun", e: "☀️" }, { w: "bun", e: "🥯" }, { w: "run", e: "🏃" }],
  [{ w: "car", e: "🚗" }, { w: "star", e: "⭐" }, { w: "jar", e: "🫙" }],
  [{ w: "bee", e: "🐝" }, { w: "tree", e: "🌳" }, { w: "key", e: "🔑" }],
  [{ w: "cake", e: "🍰" }, { w: "snake", e: "🐍" }, { w: "rake", e: "🍂" }],
  [{ w: "moon", e: "🌙" }, { w: "spoon", e: "🥄" }, { w: "balloon", e: "🎈" }],
  [{ w: "pig", e: "🐷" }, { w: "wig", e: "💇" }, { w: "twig", e: "🌿" }],
  [{ w: "bear", e: "🐻" }, { w: "pear", e: "🍐" }, { w: "chair", e: "🪑" }],
  [{ w: "mouse", e: "🐭" }, { w: "house", e: "🏠" }, { w: "blouse", e: "👚" }]
];

var SW_SIGHT_WORDS = [
  "the", "and", "see", "look", "go", "to", "a", "I", "is", "my",
  "like", "you", "we", "can", "come", "play", "run", "big", "little",
  "red", "blue", "here", "said", "up", "down", "in", "on", "it", "me", "he", "she", "at"
];

/* short vowel (CVC) words with a picture */
var SW_CVC = [
  { w: "cat", e: "🐱" }, { w: "sun", e: "☀️" }, { w: "bus", e: "🚌" },
  { w: "dog", e: "🐶" }, { w: "pig", e: "🐷" }, { w: "bed", e: "🛏️" },
  { w: "cup", e: "☕" },  { w: "hat", e: "🎩" }, { w: "bat", e: "🦇" },
  { w: "fox", e: "🦊" }, { w: "box", e: "📦" }, { w: "pen", e: "🖊️" },
  { w: "jet", e: "✈️" }, { w: "map", e: "🗺️" }, { w: "bug", e: "🐛" },
  { w: "log", e: "🪵" }, { w: "hen", e: "🐔" }, { w: "van", e: "🚐" },
  { w: "nut", e: "🌰" }, { w: "web", e: "🕸️" }
];

var SW_SHAPES = [
  { name: "circle", e: "🔵" }, { name: "square", e: "🟦" },
  { name: "triangle", e: "🔺" }, { name: "star", e: "⭐" },
  { name: "heart", e: "❤️" }, { name: "diamond", e: "🔶" }
];

var SW_COLORS = [
  { name: "red", c: "#ff4d4d" }, { name: "blue", c: "#3aa0ff" },
  { name: "green", c: "#46c95e" }, { name: "yellow", c: "#ffd93d" },
  { name: "orange", c: "#ff9640" }, { name: "purple", c: "#a56bff" },
  { name: "pink", c: "#ff7ec2" }, { name: "brown", c: "#a9714b" },
  { name: "black", c: "#3a3f4b" }, { name: "white", c: "#f7f9ff" }
];

var SW_COUNTERS = ["🍎", "🚗", "⭐", "🐟", "🎈", "🍪", "🐞", "🌼", "🧁", "🐝", "🚦", "🏁"];

var SW_PATTERN_SETS = [
  ["🔴", "🔵"], ["⭐", "🌙"], ["🚗", "🚌"], ["🍎", "🍌"],
  ["🔺", "🟦"], ["🐱", "🐶"], ["☀️", "☁️"], ["🟢", "🟡"]
];

/* number words for read-aloud */
var SW_NUM_WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven",
  "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen",
  "sixteen", "seventeen", "eighteen", "nineteen", "twenty"];

/* ============================================================
   CHOICE BUILDERS (how a lane gate looks)
   ============================================================ */
function swBig(text) { return '<span class="gate-big">' + text + '</span>'; }
function swPicChoice(item) {
  return {
    key: item.w,
    html: '<span class="gate-pic">' + item.e + '</span><span class="gate-word">' + item.w + '</span>'
  };
}
function swWordChoice(w) { return { key: w, html: '<span class="gate-word big">' + w + '</span>' }; }
function swCarSwatch(color) {
  return '<span class="car-swatch" style="--c:' + color.c + '"><b></b><i></i><u></u><u></u></span>';
}

/* ============================================================
   ROUND MAKERS - one per course `gen`
   ============================================================ */
var ROUND_MAKERS = {

  /* ---------- English Street ---------- */

  /* Uppercase letter recognition */
  letterUpper: function () {
    var t = swPick(SW_LETTERS);
    var choices = swOptions({ key: t, html: swBig(t) }, function () {
      var l = swPick(SW_LETTERS); return { key: l, html: swBig(l) };
    });
    return {
      q: 'Drive to the letter <b>' + t + '</b>',
      say: "Find the letter " + t,
      choices: choices, answerKey: t
    };
  },

  /* Uppercase -> lowercase matching */
  letterMatch: function () {
    var t = swPick(SW_LETTERS), lower = t.toLowerCase();
    var choices = swOptions({ key: lower, html: swBig(lower) }, function () {
      var l = swPick(SW_LETTERS).toLowerCase(); return { key: l, html: swBig(l) };
    });
    return {
      q: 'Big letter <b>' + t + '</b> &mdash; drive to its little letter!',
      say: "Which one is little " + t + "?",
      visual: '<div class="show-big">' + t + '</div>',
      choices: choices, answerKey: lower
    };
  },

  /* Beginning sounds (letter-NAME framing - TTS cannot say phonemes) */
  firstSound: function () {
    var t = swPick(SW_PIC_WORDS);
    var choices = swOptions(swPicChoice(t), function () {
      var o = swPick(SW_PIC_WORDS);
      return o.s === t.s ? null : swPicChoice(o);
    });
    return {
      q: 'Which one starts with <b>' + t.s + '</b>?',
      say: "Which one starts with the letter " + t.s + "? Like " + t.w + ".",
      choices: choices, answerKey: t.w,
      hint: "Say each word out loud &mdash; listen to the very first sound."
    };
  },

  /* Rhyming words */
  rhyme: function () {
    var g = swPick(SW_RHYMES), pair = swShuffle(g.slice());
    var target = pair[0], correct = pair[1];
    var choices = swOptions(swPicChoice(correct), function () {
      var og = swPick(SW_RHYMES);
      if (og === g) return null;
      return swPicChoice(swPick(og));
    });
    return {
      q: 'Which word rhymes with <b>' + target.w + '</b> ' + target.e + '?',
      say: "Which word rhymes with " + target.w + "?",
      choices: choices, answerKey: correct.w,
      hint: "Rhyming words end with the same sound."
    };
  },

  /* Sight words - hear it, drive to it */
  sightWord: function () {
    var t = swPick(SW_SIGHT_WORDS);
    var choices = swOptions(swWordChoice(t), function () {
      return swWordChoice(swPick(SW_SIGHT_WORDS));
    });
    return {
      q: '🔊 Drive to the word you hear!',
      say: t + ". " + t + ".",
      choices: choices, answerKey: t,
      hint: "Tap 🔊 to hear the word again."
    };
  },

  /* Read a CVC word for a picture */
  cvcRead: function () {
    var t = swPick(SW_CVC);
    var choices = swOptions(swWordChoice(t.w), function () {
      return swWordChoice(swPick(SW_CVC).w);
    });
    return {
      q: 'Which word goes with the picture?',
      say: "Read the words. Which one goes with the picture?",
      visual: '<div class="show-big">' + t.e + '</div>',
      choices: choices, answerKey: t.w,
      hint: "Sound out each letter, then blend them together."
    };
  },

  /* Alphabet order */
  alphaOrder: function () {
    var i = swRnd(0, 24), t = SW_LETTERS[i], ans = SW_LETTERS[i + 1];
    var choices = swOptions({ key: ans, html: swBig(ans) }, function () {
      var l = swPick(SW_LETTERS); return { key: l, html: swBig(l) };
    });
    return {
      q: 'Which letter comes <b>after ' + t + '</b>?',
      say: "Which letter comes after " + t + "?",
      visual: '<div class="show-strip">' + (i > 0 ? SW_LETTERS[i - 1] : "&middot;&middot;&middot;") +
        ' ' + t + ' <span class="blank">?</span></div>',
      choices: choices, answerKey: ans
    };
  },

  /* ---------- Math Motorway ---------- */

  /* Numeral recognition (hear the number, drive to the digit) */
  numeral: function () {
    var t = swRnd(0, 20);
    var choices = swOptions({ key: String(t), html: swBig(String(t)) }, function () {
      var n = swRnd(0, 20); return { key: String(n), html: swBig(String(n)) };
    });
    return {
      q: '🔊 Drive to the number you hear!',
      say: SW_NUM_WORDS[t] + ". " + SW_NUM_WORDS[t] + ".",
      choices: choices, answerKey: String(t),
      hint: "Tap 🔊 to hear the number again."
    };
  },

  /* Counting objects */
  counting: function () {
    var n = swRnd(1, 12), emo = swPick(SW_COUNTERS);
    var choices = swOptions({ key: String(n), html: swBig(String(n)) }, function () {
      var d = n + swRnd(-3, 3);
      if (d < 1 || d > 15) return null;
      return { key: String(d), html: swBig(String(d)) };
    });
    return {
      q: 'How many ' + emo + ' do you see?',
      say: "How many do you see? Count them.",
      visual: '<div class="pip-row">' + swRepeat(emo, n) + '</div>',
      choices: choices, answerKey: String(n),
      hint: "Touch each one as you count: 1, 2, 3&hellip;"
    };
  },

  /* Shapes */
  shapes: function () {
    var t = swPick(SW_SHAPES);
    var choices = swOptions({ key: t.name, html: swBig(t.e) }, function () {
      var o = swPick(SW_SHAPES); return { key: o.name, html: swBig(o.e) };
    });
    return {
      q: 'Drive to the <b>' + t.name + '</b>',
      say: "Find the " + t.name + ".",
      choices: choices, answerKey: t.name
    };
  },

  /* Colors (drawn cars, because emoji cannot be recolored) */
  colors: function () {
    var t = swPick(SW_COLORS);
    var choices = swOptions({ key: t.name, html: swCarSwatch(t) }, function () {
      var o = swPick(SW_COLORS); return { key: o.name, html: swCarSwatch(o) };
    });
    return {
      q: 'Drive the <b>' + t.name + '</b> car!',
      say: "Which car is " + t.name + "?",
      choices: choices, answerKey: t.name
    };
  },

  /* Adding within 10 */
  addition: function () {
    var a = swRnd(1, 5), b = swRnd(1, 5), sum = a + b, emo = swPick(SW_COUNTERS);
    var choices = swOptions({ key: String(sum), html: swBig(String(sum)) }, function () {
      var d = sum + swRnd(-3, 3);
      if (d < 0 || d > 14) return null;
      return { key: String(d), html: swBig(String(d)) };
    });
    return {
      q: '<b>' + a + ' + ' + b + ' = ?</b>',
      say: "What is " + a + " plus " + b + "?",
      visual: '<div class="pip-row">' + swRepeat(emo, a) +
        '<span class="op">+</span>' + swRepeat(emo, b) + '</div>',
      choices: choices, answerKey: String(sum),
      hint: "Count all of them together."
    };
  },

  /* Taking away within 10 */
  subtraction: function () {
    var a = swRnd(3, 10), b = swRnd(1, a - 1), diff = a - b, emo = swPick(SW_COUNTERS);
    var vis = "";
    for (var i = 0; i < a; i++) {
      vis += '<span class="pip' + (i >= a - b ? " gone" : "") + '">' + emo + '</span>';
    }
    var choices = swOptions({ key: String(diff), html: swBig(String(diff)) }, function () {
      var d = diff + swRnd(-3, 3);
      if (d < 0 || d > 12) return null;
      return { key: String(d), html: swBig(String(d)) };
    });
    return {
      q: '<b>' + a + ' &minus; ' + b + ' = ?</b>',
      say: "What is " + a + " take away " + b + "?",
      visual: '<div class="pip-row">' + vis + '</div>',
      choices: choices, answerKey: String(diff),
      hint: "Count only the ones that are NOT crossed out."
    };
  },

  /* Bigger / smaller */
  compare: function () {
    var big = Math.random() < 0.5;
    var nums = [];
    while (nums.length < 3) {
      var n = swRnd(1, 20);
      if (nums.indexOf(n) === -1) nums.push(n);
    }
    var ans = big ? Math.max.apply(null, nums) : Math.min.apply(null, nums);
    return {
      q: 'Drive to the <b>' + (big ? "BIGGEST" : "SMALLEST") + '</b> number',
      say: "Which number is " + (big ? "the biggest" : "the smallest") + "?",
      choices: nums.map(function (n) { return { key: String(n), html: swBig(String(n)) }; }),
      answerKey: String(ans)
    };
  },

  /* What comes next / before */
  numOrder: function () {
    var after = Math.random() < 0.6;
    var t = after ? swRnd(0, 19) : swRnd(1, 20);
    var ans = after ? t + 1 : t - 1;
    var choices = swOptions({ key: String(ans), html: swBig(String(ans)) }, function () {
      var d = swRnd(0, 20);
      return { key: String(d), html: swBig(String(d)) };
    });
    return {
      q: 'Which number comes <b>' + (after ? "after" : "before") + ' ' + t + '</b>?',
      say: "Which number comes " + (after ? "after " : "before ") + SW_NUM_WORDS[t] + "?",
      visual: '<div class="show-strip">' +
        (after ? t + ' <span class="blank">?</span>' : '<span class="blank">?</span> ' + t) + '</div>',
      choices: choices, answerKey: String(ans)
    };
  },

  /* Repeating patterns */
  patterns: function () {
    var set = swPick(SW_PATTERN_SETS);
    var len = 6, seq = [];
    for (var i = 0; i < len; i++) seq.push(set[i % set.length]);
    var ans = set[len % set.length];
    var choices = swOptions({ key: ans, html: swBig(ans) }, function () {
      var other = swPick(swPick(SW_PATTERN_SETS));
      return other === ans ? null : { key: other, html: swBig(other) };
    });
    return {
      q: 'What comes <b>next</b> in the pattern?',
      say: "What comes next in the pattern?",
      visual: '<div class="pip-row">' + seq.map(function (s) {
        return '<span class="pip">' + s + '</span>';
      }).join("") + '<span class="pip blank">❓</span></div>',
      choices: choices, answerKey: ans,
      hint: "Say the pattern out loud &mdash; it repeats!"
    };
  }
};

/* ============================================================
   ZONES & COURSES
   Adding a new subject later = one ZONE + its COURSES.
   ============================================================ */
var ZONES = [
  { id: "english", name: "English Street", emoji: "🔤", theme: "z-english",
    blurb: "Letters, sounds, rhymes & first words" },
  { id: "math", name: "Math Motorway", emoji: "🔢", theme: "z-math",
    blurb: "Numbers, counting, shapes & adding" }
];

var COURSES = [
  /* --- English Street --- */
  { id: "letters", zone: "english", name: "Letter Lane", emoji: "🔤",
    blurb: "Find each big letter on the road signs.", laps: 8, gen: "letterUpper", car: "suv" },
  { id: "lowercase", zone: "english", name: "Little Letter Loop", emoji: "🔡",
    blurb: "Match BIG letters to their little partners.", laps: 8, gen: "letterMatch", car: "taxi" },
  { id: "sounds", zone: "english", name: "Sound Street", emoji: "🔊",
    blurb: "Which picture starts with that letter?", laps: 8, gen: "firstSound", car: "police" },
  { id: "rhymes", zone: "english", name: "Rhyme Road", emoji: "🎵",
    blurb: "Drive to the word that rhymes.", laps: 8, gen: "rhyme", car: "ambulance" },
  { id: "sight", zone: "english", name: "Sight Word Speedway", emoji: "👀",
    blurb: "Hear a word, then drive to it.", laps: 8, gen: "sightWord", car: "fire" },
  { id: "words", zone: "english", name: "Word Builder Bend", emoji: "🧩",
    blurb: "Read the word that matches the picture.", laps: 8, gen: "cvcRead", car: "bus" },
  { id: "alphabet", zone: "english", name: "Alphabet Avenue", emoji: "🔠",
    blurb: "Which letter comes next? A, B, C...", laps: 8, gen: "alphaOrder", car: "van" },

  /* --- Math Motorway --- */
  { id: "numbers", zone: "math", name: "Number Lane", emoji: "🔢",
    blurb: "Hear a number, then drive to it.", laps: 8, gen: "numeral", car: "pickup" },
  { id: "counting", zone: "math", name: "Counting Curve", emoji: "🍎",
    blurb: "Count the things and pick how many.", laps: 8, gen: "counting", car: "tractor" },
  { id: "shapes", zone: "math", name: "Shape Circuit", emoji: "🔺",
    blurb: "Circles, squares, triangles & more.", laps: 8, gen: "shapes", car: "truck" },
  { id: "colors", zone: "math", name: "Color Crossing", emoji: "🌈",
    blurb: "Drive the car of the right color.", laps: 8, gen: "colors", car: "moto" },
  { id: "adding", zone: "math", name: "Adding Alley", emoji: "➕",
    blurb: "Put the groups together and count.", laps: 8, gen: "addition", car: "bike" },
  { id: "taking", zone: "math", name: "Take-Away Track", emoji: "➖",
    blurb: "Some drive away — how many are left?", laps: 8, gen: "subtraction", car: "scooter" },
  { id: "compare", zone: "math", name: "Bigger-Smaller Bridge", emoji: "⚖️",
    blurb: "Which number is biggest? Smallest?", laps: 8, gen: "compare", car: "monster" },
  { id: "order", zone: "math", name: "Number Order Highway", emoji: "🔟",
    blurb: "What comes next? What came before?", laps: 8, gen: "numOrder", car: "helicopter" },
  { id: "patterns", zone: "math", name: "Pattern Parkway", emoji: "🔁",
    blurb: "Spot the repeat and finish the pattern.", laps: 8, gen: "patterns", car: "rocket" }
];

/* ============================================================
   THE GARAGE - a new car for every course you finish
   ============================================================ */
var CAR_GARAGE = [
  { id: "racer", emoji: "🚗", name: "Speedy", how: "Your starter car" },
  { id: "suv", emoji: "🚙", name: "Rocky", how: "Finish Letter Lane" },
  { id: "taxi", emoji: "🚕", name: "Taxi Tom", how: "Finish Little Letter Loop" },
  { id: "police", emoji: "🚓", name: "Officer Blue", how: "Finish Sound Street" },
  { id: "ambulance", emoji: "🚑", name: "Doc Dash", how: "Finish Rhyme Road" },
  { id: "fire", emoji: "🚒", name: "Big Red", how: "Finish Sight Word Speedway" },
  { id: "bus", emoji: "🚌", name: "Buster", how: "Finish Word Builder Bend" },
  { id: "van", emoji: "🚐", name: "Vanny", how: "Finish Alphabet Avenue" },
  { id: "pickup", emoji: "🛻", name: "Pete", how: "Finish Number Lane" },
  { id: "tractor", emoji: "🚜", name: "Mac", how: "Finish Counting Curve" },
  { id: "truck", emoji: "🚚", name: "Tank", how: "Finish Shape Circuit" },
  { id: "moto", emoji: "🏍️", name: "Zippy", how: "Finish Color Crossing" },
  { id: "bike", emoji: "🚲", name: "Pedal Pal", how: "Finish Adding Alley" },
  { id: "scooter", emoji: "🛵", name: "Scooty", how: "Finish Take-Away Track" },
  { id: "monster", emoji: "🏎️", name: "Flash", how: "Finish Bigger-Smaller Bridge" },
  { id: "helicopter", emoji: "🚁", name: "Whirly", how: "Finish Number Order Highway" },
  { id: "rocket", emoji: "🚀", name: "Rocket Rex", how: "Finish Pattern Parkway" }
];

/* ============================================================
   TROPHIES
   ============================================================ */
var SW_TROPHIES = [
  { id: "first-race", icon: "🏁", name: "First Finish", desc: "Finish your first race" },
  { id: "perfect-lap", icon: "💯", name: "Perfect Driver", desc: "Finish a race with 3 stars" },
  { id: "english-ace", icon: "🔤", name: "English Ace", desc: "Finish every English Street race" },
  { id: "math-ace", icon: "🔢", name: "Math Ace", desc: "Finish every Math Motorway race" },
  { id: "garage-hero", icon: "🚗", name: "Garage Hero", desc: "Collect 8 cars" },
  { id: "dash-star", icon: "🌈", name: "Dash Star", desc: "Pass 20 gates in one Highway Dash" },
  { id: "point-pro", icon: "⭐", name: "Point Pro", desc: "Earn 200 points" },
  { id: "grand-prix", icon: "👑", name: "Grand Prix Champion", desc: "Finish every race in the game" }
];

/* cheer lines Rev says when you pass a gate */
var SW_CHEERS = ["Zoom!", "Nice driving!", "Yes!", "Great job!", "You got it!", "Vroom vroom!", "Awesome!"];
