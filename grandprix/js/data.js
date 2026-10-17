/* ============================================================
   Turbo Grand Prix — Data
   A championship racing game for Grade 3.
   You race 3 rival drivers over 8 Grands Prix. Every question
   answered correctly pushes your car further down the track;
   answer FAST and keep a streak alive for a turbo boost.

   Everything is DATA + QUESTION MAKERS:
     - new topic  -> add a maker to QMAKERS, list its name in a
                     GRANDS_PRIX entry's `gens`
     - new event  -> add a GRANDS_PRIX entry (season scales itself)
   A maker returns:
     { q, k:"pick", choices:[{label,key}], answerKey, why }
     { q, k:"type", answer:"42", accept?:[…], why }
   ============================================================ */

/* ---------- helpers ---------- */
function gpPick(a) { return a[Math.floor(Math.random() * a.length)]; }
function gpRnd(min, max) { return min + Math.floor(Math.random() * (max - min + 1)); }
function gpShuffle(a) {
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}
/* Build 4 unique options from a correct value + a distractor factory. */
function gpOptions(correct, make, n) {
  var out = [String(correct)], guard = 0, want = n || 4;
  while (out.length < want && guard++ < 400) {
    var c = make();
    if (c === null || c === undefined) continue;
    c = String(c);
    if (out.indexOf(c) === -1) out.push(c);
  }
  return gpShuffle(out).map(function (v) { return { label: v, key: v }; });
}
/* Build options from an explicit correct + wrong list. */
function gpFixed(correct, wrong) {
  var all = [String(correct)];
  wrong.forEach(function (w) { if (all.indexOf(String(w)) === -1) all.push(String(w)); });
  return gpShuffle(all).map(function (v) { return { label: v, key: v }; });
}
function gpComma(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ","); }

/* ============================================================
   ENGLISH POOLS
   Each row carries its OWN wrong answers, so a distractor can
   never accidentally be a second correct answer.
   ============================================================ */

var SYN_ANT = [
  { w: "happy",  syn: "glad",    ant: "sad",      wrong: ["round", "early", "green"] },
  { w: "begin",  syn: "start",   ant: "finish",   wrong: ["carry", "paint", "listen"] },
  { w: "shout",  syn: "yell",    ant: "whisper",  wrong: ["fold", "borrow", "climb"] },
  { w: "brave",  syn: "bold",    ant: "afraid",   wrong: ["purple", "hourly", "wooden"] },
  { w: "tidy",   syn: "neat",    ant: "messy",    wrong: ["salty", "hollow", "rapid"] },
  { w: "damp",   syn: "moist",   ant: "dry",      wrong: ["noisy", "lucky", "steep"] },
  { w: "clever", syn: "smart",   ant: "foolish",  wrong: ["hungry", "distant", "golden"] },
  { w: "repair", syn: "fix",     ant: "break",    wrong: ["sing", "float", "gather"] },
  { w: "gigantic", syn: "huge",  ant: "tiny",     wrong: ["sticky", "polite", "silver"] },
  { w: "chilly", syn: "cool",    ant: "warm",     wrong: ["crisp", "plain", "swift"] },
  { w: "rapid",  syn: "quick",   ant: "slow",     wrong: ["wide", "sour", "cloudy"] },
  { w: "sturdy", syn: "strong",  ant: "weak",     wrong: ["spotted", "monthly", "curious"] }
];

/* sentence → the word for each part of speech (all four appear in the sentence) */
var POS_SENTENCES = [
  { s: "The brown dog barked loudly.",            noun: "dog",     verb: "barked",  adj: "brown",   adv: "loudly" },
  { s: "A tiny bird sang sweetly.",               noun: "bird",    verb: "sang",    adj: "tiny",    adv: "sweetly" },
  { s: "The clever fox escaped quickly.",         noun: "fox",     verb: "escaped", adj: "clever",  adv: "quickly" },
  { s: "Our new teacher spoke softly.",           noun: "teacher", verb: "spoke",   adj: "new",     adv: "softly" },
  { s: "The hungry baby ate hungrily.",           noun: "baby",    verb: "ate",     adj: "hungry",  adv: "hungrily" },
  { s: "A yellow bus arrived early.",             noun: "bus",     verb: "arrived", adj: "yellow",  adv: "early" },
  { s: "The tall runner finished first.",         noun: "runner",  verb: "finished",adj: "tall",    adv: "first" },
  { s: "My older sister writes neatly.",          noun: "sister",  verb: "writes",  adj: "older",   adv: "neatly" },
  { s: "The rusty gate opened slowly.",           noun: "gate",    verb: "opened",  adj: "rusty",   adv: "slowly" },
  { s: "A brave driver waited patiently.",        noun: "driver",  verb: "waited",  adj: "brave",   adv: "patiently" }
];

var VERB_TENSE = [
  { q: "Yesterday we ___ to the park.",            a: "walked",  wrong: ["walk", "walking", "walks"] },
  { q: "Tomorrow she ___ her bike to school.",     a: "will ride", wrong: ["rode", "riding", "rides yesterday"] },
  { q: "Right now the team ___ on the track.",     a: "is racing", wrong: ["raced", "will race", "races tomorrow"] },
  { q: "Last week they ___ a new song.",           a: "sang",    wrong: ["sing", "singing", "will sing"] },
  { q: "Every morning he ___ his room.",           a: "cleans",  wrong: ["cleaned", "will clean", "cleaning"] },
  { q: "An hour ago the rain ___ .",               a: "stopped", wrong: ["stops", "will stop", "stopping"] },
  { q: "Next summer I ___ my cousins.",            a: "will visit", wrong: ["visited", "visiting", "visits last year"] },
  { q: "She ___ her lunch a minute ago.",          a: "ate",     wrong: ["eats", "eating", "will eat"] }
];

var CONTRACTIONS = [
  { full: "they are",   short: "they're",  wrong: ["their", "there", "theyre"] },
  { full: "do not",     short: "don't",    wrong: ["dont", "do'nt", "donot"] },
  { full: "it is",      short: "it's",     wrong: ["its", "its'", "itis"] },
  { full: "we will",    short: "we'll",    wrong: ["well", "we'ill", "wel'l"] },
  { full: "you have",   short: "you've",   wrong: ["youve", "you'ave", "youv"] },
  { full: "could not",  short: "couldn't", wrong: ["couldnt", "could'nt", "couldnot"] },
  { full: "I am",       short: "I'm",      wrong: ["Im", "I'am", "am'I"] },
  { full: "she would",  short: "she'd",    wrong: ["shed", "she'ould", "she'wd"] },
  { full: "has not",    short: "hasn't",   wrong: ["hasnt", "has'nt", "hasnot"] }
];

var PLURALS = [
  { sing: "baby",   plural: "babies",   wrong: ["babys", "babyes", "babie"] },
  { sing: "box",    plural: "boxes",    wrong: ["boxs", "boxies", "boxen"] },
  { sing: "leaf",   plural: "leaves",   wrong: ["leafs", "leafes", "leaf's"] },
  { sing: "child",  plural: "children", wrong: ["childs", "childes", "childrens"] },
  { sing: "mouse",  plural: "mice",     wrong: ["mouses", "mices", "mouse's"] },
  { sing: "city",   plural: "cities",   wrong: ["citys", "cityes", "citie"] },
  { sing: "wolf",   plural: "wolves",   wrong: ["wolfs", "wolfes", "wolvs"] },
  { sing: "brush",  plural: "brushes",  wrong: ["brushs", "brushies", "brushen"] },
  { sing: "foot",   plural: "feet",     wrong: ["foots", "feets", "footes"] },
  { sing: "penny",  plural: "pennies",  wrong: ["pennys", "penny's", "pennyes"] }
];

var HOMOPHONES = [
  { q: "The dog wagged ___ tail.",              a: "its",    wrong: ["it's", "its'", "it is"] },
  { q: "___ going to be a great race!",         a: "It's",   wrong: ["Its", "Its'", "It"] },
  { q: "We left ___ helmets in the pit.",       a: "our",    wrong: ["hour", "are", "ours'"] },
  { q: "Put the trophy over ___ .",             a: "there",  wrong: ["their", "they're", "thier"] },
  { q: "___ car crossed the line first.",       a: "Their",  wrong: ["There", "They're", "Thier"] },
  { q: "I could hear the engine ___ here.",     a: "from",   wrong: ["form", "fromm", "for"] },
  { q: "She ___ the fastest lap of the day.",   a: "drove",  wrong: ["drive", "droven", "drived"] },
  { q: "The wind blew ___ the flags.",          a: "through", wrong: ["threw", "thru", "thorough"] },
  { q: "He ___ the ball to first base.",        a: "threw",  wrong: ["through", "thru", "throw"] },
  { q: "Do you know ___ won the race?",         a: "who",    wrong: ["whom is", "whose", "who's car"] }
];

var PREFIXES = [
  { pre: "un-",   means: "not",        ex: "unhappy",   exMeans: "not happy",        wrong: ["very happy", "happy again", "happy before"] },
  { pre: "re-",   means: "again",      ex: "rebuild",   exMeans: "build again",      wrong: ["build badly", "not build", "build before"] },
  { pre: "pre-",  means: "before",     ex: "preheat",   exMeans: "heat before",      wrong: ["heat again", "not heat", "heat slowly"] },
  { pre: "dis-",  means: "not or opposite", ex: "disagree", exMeans: "not agree",    wrong: ["agree again", "agree loudly", "agree before"] },
  { pre: "mis-",  means: "wrongly",    ex: "misplace",  exMeans: "place wrongly",    wrong: ["place again", "place first", "not place ever"] },
  { pre: "over-", means: "too much",   ex: "overcook",  exMeans: "cook too much",    wrong: ["cook again", "cook before", "not cook"] }
];

var SUFFIXES = [
  { suf: "-ful",  means: "full of",       ex: "joyful",   exMeans: "full of joy",       wrong: ["without joy", "joy again", "the most joy"] },
  { suf: "-less", means: "without",       ex: "fearless", exMeans: "without fear",      wrong: ["full of fear", "fear again", "a little fear"] },
  { suf: "-er",   means: "one who does",  ex: "teacher",  exMeans: "one who teaches",   wrong: ["able to teach", "without teaching", "teach again"] },
  { suf: "-able", means: "able to be",    ex: "washable", exMeans: "able to be washed", wrong: ["without washing", "one who washes", "wash again"] },
  { suf: "-ly",   means: "in that way",   ex: "quickly",  exMeans: "in a quick way",    wrong: ["not quick", "one who is quick", "most quick"] },
  { suf: "-est",  means: "the most",      ex: "fastest",  exMeans: "the most fast",     wrong: ["not fast", "fast again", "able to be fast"] }
];

var PUNCT = [
  { right: "Where are you going?",                wrong: ["Where are you going.", "where are you going?", "Where are you going"] },
  { right: "Wow, that was a fast lap!",           wrong: ["Wow that was a fast lap!", "wow, that was a fast lap!", "Wow, that was a fast lap"] },
  { right: "We packed helmets, gloves, and fuel.",wrong: ["We packed helmets gloves and fuel.", "We packed, helmets, gloves and fuel.", "we packed helmets, gloves, and fuel"] },
  { right: "My sister said, “Let's race.”",  wrong: ["My sister said Let's race.", "my sister said, “Let's race”", "My sister said, let's race"] },
  { right: "The race starts on Friday.",          wrong: ["The race starts on friday.", "the race starts on Friday.", "The race starts on Friday"] },
  { right: "Do you have my toolbox?",             wrong: ["Do you have my toolbox.", "do you have my toolbox?", "Do you have my toolbox!"] }
];

var CONTEXT_CLUES = [
  { s: "The track was <b>parched</b> after weeks with no rain at all.", a: "very dry", wrong: ["slightly wet", "freshly painted", "newly built"] },
  { s: "Her <b>enormous</b> trophy was taller than she was.",           a: "very large", wrong: ["very small", "very old", "very shiny"] },
  { s: "The crowd was <b>ecstatic</b>, cheering and jumping for joy.",  a: "extremely happy", wrong: ["a little bored", "very angry", "deeply asleep"] },
  { s: "He drove <b>cautiously</b>, slowing down at every corner.",     a: "carefully", wrong: ["carelessly", "angrily", "loudly"] },
  { s: "The engine let out a <b>feeble</b> cough and went quiet.",      a: "weak", wrong: ["powerful", "cheerful", "sudden"] },
  { s: "The mechanic was <b>baffled</b> and could not explain it.",     a: "confused", wrong: ["delighted", "certain", "exhausted"] },
  { s: "They <b>assembled</b> the whole car from separate parts.",      a: "put together", wrong: ["took apart", "painted over", "drove away"] },
  { s: "The rules were <b>identical</b> — exactly the same as last year.", a: "the same", wrong: ["different", "difficult", "missing"] }
];

var FIG_TYPES = ["simile", "metaphor", "personification", "alliteration"];
var FIGURATIVE = [
  { s: "The wind whispered through the trees.",        a: "personification" },
  { s: "Her car was as fast as lightning.",            a: "simile" },
  { s: "The pit crew were busy bees all afternoon.",   a: "metaphor" },
  { s: "Ben's blue bike bounced badly.",               a: "alliteration" },
  { s: "The tired engine groaned and complained.",     a: "personification" },
  { s: "He ran like the wind down the straight.",      a: "simile" },
  { s: "That track is a giant snake of asphalt.",      a: "metaphor" },
  { s: "Silly Sallyspun slowly sideways.",             a: "alliteration" },
  { s: "The sun smiled down on the finish line.",      a: "personification" },
  { s: "The tyres were as hot as an oven.",            a: "simile" }
];

/* word-problem flavour */
var GP_NAMES = ["Maya", "Leo", "Ava", "Noah", "Zara", "Eli", "Priya", "Sam", "Nina", "Omar"];
var GP_ITEMS = [
  { one: "sticker", many: "stickers" }, { one: "marble", many: "marbles" },
  { one: "trading card", many: "trading cards" }, { one: "cookie", many: "cookies" },
  { one: "pencil", many: "pencils" }, { one: "toy car", many: "toy cars" },
  { one: "seashell", many: "seashells" }, { one: "balloon", many: "balloons" }
];

/* ============================================================
   QUESTION MAKERS
   ============================================================ */
var QMAKERS = {

  /* ---------- MATH ---------- */

  /* multiplication facts to 12 x 12 */
  mulFact: function () {
    var a = gpRnd(2, 12), b = gpRnd(2, 12), p = a * b;
    return {
      k: "pick",
      q: a + " × " + b + " = ?",
      choices: gpOptions(p, function () {
        var d = p + gpPick([-b, b, -a, a, gpRnd(-9, 9)]);
        return (d > 0 && d !== p) ? d : null;
      }),
      answerKey: String(p),
      why: a + " × " + b + " = " + p + " (that's " + a + " groups of " + b + ")."
    };
  },

  /* missing factor — typed */
  mulMissing: function () {
    var a = gpRnd(2, 12), b = gpRnd(2, 12), p = a * b;
    return {
      k: "type",
      q: a + " × <span class=\"box\">?</span> = " + p,
      answer: String(b),
      why: p + " ÷ " + a + " = " + b + ", so the missing factor is " + b + "."
    };
  },

  /* division facts */
  divFact: function () {
    var b = gpRnd(2, 12), q = gpRnd(2, 12), p = b * q;
    return {
      k: "pick",
      q: p + " ÷ " + b + " = ?",
      choices: gpOptions(q, function () {
        var d = q + gpRnd(-5, 5);
        return (d > 0 && d !== q) ? d : null;
      }),
      answerKey: String(q),
      why: p + " ÷ " + b + " = " + q + " because " + b + " × " + q + " = " + p + "."
    };
  },

  /* division with a remainder */
  divRemainder: function () {
    var b = gpRnd(3, 9), q = gpRnd(2, 9), r = gpRnd(1, b - 1), p = b * q + r;
    var ans = q + " r " + r;
    return {
      k: "pick",
      q: p + " ÷ " + b + " = ?",
      choices: gpFixed(ans, [
        (q + 1) + " r " + r,
        q + " r " + (r + 1 < b ? r + 1 : r - 1),
        (q - 1) + " r " + (r === 1 ? 2 : r - 1)
      ]),
      answerKey: ans,
      why: b + " × " + q + " = " + (b * q) + ", and " + p + " − " + (b * q) + " = " + r + " left over."
    };
  },

  /* place value — the VALUE of a digit */
  placeValue: function () {
    var digits, num, spot, guard = 0;
    do {
      digits = [gpRnd(1, 9), gpRnd(0, 9), gpRnd(0, 9), gpRnd(0, 9)];
      spot = gpRnd(0, 3);
      // the asked-about digit must be non-zero AND appear only once, or
      // "the value of the 9" would have two right answers.
      var once = digits.filter(function (d) { return d === digits[spot]; }).length === 1;
    } while ((digits[spot] === 0 || !once) && guard++ < 200);
    num = digits[0] * 1000 + digits[1] * 100 + digits[2] * 10 + digits[3];
    var names = ["thousands", "hundreds", "tens", "ones"];
    var mult = [1000, 100, 10, 1];
    var val = digits[spot] * mult[spot];
    return {
      k: "pick",
      q: "In " + gpComma(num) + ", what is the value of the " + digits[spot] + "?",
      choices: gpOptions(val, function () {
        var m = gpPick([1, 10, 100, 1000]);
        var d = digits[spot] * m;
        return d !== val ? d : null;
      }),
      answerKey: String(val),
      why: "The " + digits[spot] + " sits in the " + names[spot] + " place, so it is worth " + gpComma(val) + "."
    };
  },

  /* rounding to the nearest 10 or 100 */
  rounding: function () {
    var to = gpPick([10, 100]);
    var num = to === 10 ? gpRnd(21, 989) : gpRnd(121, 9849);
    var ans = Math.round(num / to) * to;
    return {
      k: "pick",
      q: "Round " + gpComma(num) + " to the nearest " + to + ".",
      choices: gpOptions(ans, function () {
        var d = gpPick([
          ans + to, ans - to, ans + to * 2, ans - to * 2, ans + to * 3,
          Math.floor(num / to) * to,                       // rounded down
          Math.round(num / (to * 10)) * (to * 10),         // rounded to the wrong place
          num - (num % to) + to
        ]);
        return (d > 0 && d !== ans) ? d : null;
      }),
      answerKey: String(ans),
      why: "Look at the digit to the right of the " + (to === 10 ? "tens" : "hundreds") +
        " place. " + gpComma(num) + " rounds to " + gpComma(ans) + "."
    };
  },

  /* 3-digit addition / subtraction with regrouping — typed */
  bigAddSub: function () {
    if (Math.random() < 0.5) {
      var a = gpRnd(147, 799), b = gpRnd(118, 399);
      return {
        k: "type", q: a + " + " + b + " = ?", answer: String(a + b),
        why: a + " + " + b + " = " + (a + b) + ". Add the ones, then tens, then hundreds — regrouping as you go."
      };
    }
    var c = gpRnd(320, 950), d = gpRnd(118, 299);
    return {
      k: "type", q: c + " − " + d + " = ?", answer: String(c - d),
      why: c + " − " + d + " = " + (c - d) + ". Borrow from the next column when the top digit is smaller."
    };
  },

  /* comparing fractions (same denominator OR same numerator) */
  fracCompare: function () {
    var biggest = Math.random() < 0.5;
    var parts = [], den, nums;
    if (Math.random() < 0.5) {
      den = gpRnd(5, 12);
      nums = [];
      while (nums.length < 4) { var n = gpRnd(1, den - 1); if (nums.indexOf(n) === -1) nums.push(n); }
      parts = nums.map(function (n) { return { label: n + "/" + den, v: n / den }; });
    } else {
      var num = gpRnd(1, 3), dens = [];
      while (dens.length < 4) { var d = gpRnd(num + 1, 12); if (dens.indexOf(d) === -1) dens.push(d); }
      parts = dens.map(function (d) { return { label: num + "/" + d, v: num / d }; });
    }
    var best = parts.slice().sort(function (x, y) { return biggest ? y.v - x.v : x.v - y.v; })[0];
    return {
      k: "pick",
      q: "Which fraction is the " + (biggest ? "LARGEST" : "SMALLEST") + "?",
      choices: gpShuffle(parts.map(function (p) { return { label: p.label, key: p.label }; })),
      answerKey: best.label,
      why: parts[0].label.split("/")[1] === parts[1].label.split("/")[1]
        ? "Same denominator — so the fraction with the " + (biggest ? "biggest" : "smallest") + " numerator wins: " + best.label + "."
        : "Same numerator — the " + (biggest ? "smaller" : "larger") + " the denominator, the " +
          (biggest ? "bigger" : "smaller") + " the piece. " + best.label + " it is."
    };
  },

  /* equivalent fractions */
  fracEquiv: function () {
    var d = gpRnd(2, 6), n = gpRnd(1, d - 1), k = gpRnd(2, 4);
    var ans = (n * k) + "/" + (d * k), val = n / d;
    return {
      k: "pick",
      q: "Which fraction is equal to " + n + "/" + d + "?",
      choices: gpOptions(ans, function () {
        var dn = gpRnd(1, 11), dd = gpRnd(2, 12);
        if (dn >= dd) return null;
        if (Math.abs(dn / dd - val) < 1e-9) return null;   // must NOT be equivalent
        return dn + "/" + dd;
      }),
      answerKey: ans,
      why: "Multiply the top and the bottom by " + k + ": " + n + "×" + k + " = " + (n * k) +
        " and " + d + "×" + k + " = " + (d * k) + "."
    };
  },

  /* fraction of a set */
  fracOfSet: function () {
    var d = gpPick([2, 3, 4, 5, 6]), groups = gpRnd(2, 8), total = d * groups;
    var n = gpRnd(1, d - 1), ans = groups * n;
    return {
      k: "pick",
      q: "What is " + n + "/" + d + " of " + total + "?",
      choices: gpOptions(ans, function () {
        var x = ans + gpPick([-groups, groups, -1, 1, groups * 2]);
        return (x > 0 && x !== ans) ? x : null;
      }),
      answerKey: String(ans),
      why: "Split " + total + " into " + d + " equal groups of " + groups + ", then take " + n +
        " of them: " + ans + "."
    };
  },

  /* elapsed time */
  elapsedTime: function () {
    var h = gpRnd(1, 11), m = gpPick([0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]);
    var add = gpPick([20, 25, 30, 40, 45, 50, 60, 75, 90]);
    var total = h * 60 + m + add;
    var nh = Math.floor(total / 60) % 12, nm = total % 60;
    if (nh === 0) nh = 12;
    var fmt = function (a, b) { return a + ":" + (b < 10 ? "0" + b : b); };
    var ans = fmt(nh, nm);
    return {
      k: "pick",
      q: "It is " + fmt(h, m) + ". What time will it be in " + add + " minutes?",
      choices: gpOptions(ans, function () {
        var t = total + gpPick([-60, -30, -15, 15, 30, 60]);
        var xh = Math.floor(((t % 720) + 720) % 720 / 60), xm = ((t % 60) + 60) % 60;
        if (xh === 0) xh = 12;
        var s = fmt(xh, xm);
        return s !== ans ? s : null;
      }),
      answerKey: ans,
      why: "Count on " + add + " minutes from " + fmt(h, m) + " to reach " + ans + "."
    };
  },

  /* area & perimeter of a rectangle */
  areaPerimeter: function () {
    var w = gpRnd(2, 12), h = gpRnd(2, 12), area = Math.random() < 0.5;
    var ans = area ? w * h : 2 * (w + h);
    return {
      k: "pick",
      q: "A rectangle is " + w + " units wide and " + h + " units tall. What is its " +
        (area ? "AREA" : "PERIMETER") + "?",
      choices: gpOptions(ans, function () {
        var d = gpPick([w * h, 2 * (w + h), w + h, w * h + w, 2 * w + h, gpRnd(4, 150)]);
        return d !== ans ? d : null;
      }),
      answerKey: String(ans),
      why: area ? "Area = width × height = " + w + " × " + h + " = " + ans + " square units."
                : "Perimeter = all four sides = " + w + " + " + h + " + " + w + " + " + h + " = " + ans + " units."
    };
  },

  /* multi-step word problems */
  wordProblem: function () {
    var name = gpPick(GP_NAMES), item = gpPick(GP_ITEMS);
    var kind = gpRnd(1, 3);
    var q, ans, why;
    if (kind === 1) {
      var packs = gpRnd(3, 9), each = gpRnd(4, 9), extra = gpRnd(2, 9);
      ans = packs * each + extra;
      q = name + " has " + packs + " packs of " + item.many + " with " + each + " in each pack, plus " +
        extra + " loose " + item.many + ". How many " + item.many + " in all?";
      why = packs + " × " + each + " = " + (packs * each) + ", then + " + extra + " = " + ans + ".";
    } else if (kind === 2) {
      var friends = gpPick([3, 4, 5, 6]);
      var total = friends * gpRnd(3, 9);
      var per = total / friends;
      ans = per;
      q = name + " shares " + total + " " + item.many + " equally among " + friends +
        " friends. How many does each friend get?";
      why = total + " ÷ " + friends + " = " + per + ".";
    } else {
      var start = gpRnd(40, 95), gave = gpRnd(8, 30), got = gpRnd(5, 25);
      ans = start - gave + got;
      q = name + " had " + start + " " + item.many + ", gave away " + gave + ", then found " +
        got + " more. How many now?";
      why = start + " − " + gave + " = " + (start - gave) + ", then + " + got + " = " + ans + ".";
    }
    return {
      k: "pick", q: q,
      choices: gpOptions(ans, function () {
        var d = ans + gpPick([-10, -5, -2, -1, 1, 2, 5, 10]);
        return (d > 0 && d !== ans) ? d : null;
      }),
      answerKey: String(ans), why: why
    };
  },

  /* ---------- ENGLISH ---------- */

  partOfSpeech: function () {
    var s = gpPick(POS_SENTENCES);
    var which = gpPick(["noun", "verb", "adjective", "adverb"]);
    var key = { noun: "noun", verb: "verb", adjective: "adj", adverb: "adv" }[which];
    var ans = s[key];
    return {
      k: "pick",
      q: "Which word is the <b>" + which + "</b>?<span class=\"sentence\">" + s.s + "</span>",
      choices: gpFixed(ans, [s.noun, s.verb, s.adj, s.adv].filter(function (w) { return w !== ans; })),
      answerKey: ans,
      why: "“" + ans + "” is the " + which + ". " +
        (which === "noun" ? "A noun names a person, place or thing."
        : which === "verb" ? "A verb shows the action."
        : which === "adjective" ? "An adjective describes a noun."
        : "An adverb tells how the action happened.")
    };
  },

  verbTense: function () {
    var t = gpPick(VERB_TENSE);
    return {
      k: "pick",
      q: "Choose the word that fits:<span class=\"sentence\">" + t.q.replace("___", "<u>___</u>") + "</span>",
      choices: gpFixed(t.a, t.wrong), answerKey: t.a,
      why: "“" + t.a + "” matches the time word in the sentence."
    };
  },

  synonym: function () {
    var r = gpPick(SYN_ANT);
    return {
      k: "pick",
      q: "Which word means the SAME as <b>" + r.w + "</b>?",
      choices: gpFixed(r.syn, [r.ant, r.wrong[0], r.wrong[1]]),
      answerKey: r.syn,
      why: "“" + r.syn + "” is a synonym of “" + r.w + "”. (Its opposite is “" + r.ant + "”.)"
    };
  },

  antonym: function () {
    var r = gpPick(SYN_ANT);
    return {
      k: "pick",
      q: "Which word means the OPPOSITE of <b>" + r.w + "</b>?",
      choices: gpFixed(r.ant, [r.syn, r.wrong[0], r.wrong[1]]),
      answerKey: r.ant,
      why: "“" + r.ant + "” is the antonym of “" + r.w + "”. (A synonym would be “" + r.syn + "”.)"
    };
  },

  prefix: function () {
    var p = gpPick(PREFIXES);
    if (Math.random() < 0.5) {
      return {
        k: "pick",
        q: "What does <b>" + p.ex + "</b> mean?",
        choices: gpFixed(p.exMeans, p.wrong), answerKey: p.exMeans,
        why: "The prefix " + p.pre + " means “" + p.means + "”, so " + p.ex + " = " + p.exMeans + "."
      };
    }
    return {
      k: "pick",
      q: "Which prefix means <b>" + p.means + "</b>?",
      choices: gpOptions(p.pre, function () {
        var o = gpPick(PREFIXES);
        return o.means !== p.means ? o.pre : null;
      }),
      answerKey: p.pre,
      why: p.pre + " means “" + p.means + "” — for example, " + p.ex + " = " + p.exMeans + "."
    };
  },

  suffix: function () {
    var s = gpPick(SUFFIXES);
    if (Math.random() < 0.5) {
      return {
        k: "pick",
        q: "What does <b>" + s.ex + "</b> mean?",
        choices: gpFixed(s.exMeans, s.wrong), answerKey: s.exMeans,
        why: "The suffix " + s.suf + " means “" + s.means + "”, so " + s.ex + " = " + s.exMeans + "."
      };
    }
    return {
      k: "pick",
      q: "Which suffix means <b>" + s.means + "</b>?",
      choices: gpOptions(s.suf, function () {
        var o = gpPick(SUFFIXES);
        return o.means !== s.means ? o.suf : null;
      }),
      answerKey: s.suf,
      why: s.suf + " means “" + s.means + "” — for example, " + s.ex + " = " + s.exMeans + "."
    };
  },

  contraction: function () {
    var c = gpPick(CONTRACTIONS);
    return {
      k: "pick",
      q: "Which is the contraction for <b>" + c.full + "</b>?",
      choices: gpFixed(c.short, c.wrong), answerKey: c.short,
      why: c.full + " → " + c.short + ". The apostrophe replaces the missing letter(s)."
    };
  },

  plural: function () {
    var p = gpPick(PLURALS);
    return {
      k: "pick",
      q: "What is the plural of <b>" + p.sing + "</b>?",
      choices: gpFixed(p.plural, p.wrong), answerKey: p.plural,
      why: "One " + p.sing + ", two " + p.plural + "."
    };
  },

  homophone: function () {
    var h = gpPick(HOMOPHONES);
    return {
      k: "pick",
      q: "Choose the word that fits:<span class=\"sentence\">" + h.q.replace("___", "<u>___</u>") + "</span>",
      choices: gpFixed(h.a, h.wrong), answerKey: h.a,
      why: "“" + h.a + "” is the right word here — the others sound similar but mean something else."
    };
  },

  punctuation: function () {
    var p = gpPick(PUNCT);
    return {
      k: "pick",
      q: "Which sentence is written correctly?",
      choices: gpFixed(p.right, p.wrong), answerKey: p.right,
      why: "Check the capital letter at the start and the mark at the end."
    };
  },

  contextClue: function () {
    var c = gpPick(CONTEXT_CLUES);
    return {
      k: "pick",
      q: "What does the bold word mean?<span class=\"sentence\">" + c.s + "</span>",
      choices: gpFixed(c.a, c.wrong), answerKey: c.a,
      why: "The rest of the sentence is the clue — it points to “" + c.a + "”."
    };
  },

  figurative: function () {
    var f = gpPick(FIGURATIVE);
    return {
      k: "pick",
      q: "What kind of figurative language is this?<span class=\"sentence\">" + f.s + "</span>",
      choices: gpShuffle(FIG_TYPES.slice()).map(function (v) { return { label: v, key: v }; }),
      answerKey: f.a,
      why: f.a === "simile" ? "It compares using “like” or “as” — that's a simile."
        : f.a === "metaphor" ? "It says one thing IS another — that's a metaphor."
        : f.a === "personification" ? "A thing is doing something only people do — that's personification."
        : "The words start with the same sound — that's alliteration."
    };
  }
};

/* ============================================================
   THE SEASON — 8 Grands Prix
   ============================================================ */
var GRANDS_PRIX = [
  { id: "opening",  n: 1, name: "Opening Circuit",   emoji: "🏁", subject: "Math",
    topic: "Times tables to 12 × 12",
    gens: ["mulFact", "mulFact", "mulMissing"] },
  { id: "forest",   n: 2, name: "Forest Sprint",     emoji: "🌲", subject: "Math",
    topic: "Division facts & remainders",
    gens: ["divFact", "divFact", "divRemainder"] },
  { id: "city",     n: 3, name: "City Street Race",  emoji: "🏙️", subject: "Math",
    topic: "Place value, rounding & big add/subtract",
    gens: ["placeValue", "rounding", "bigAddSub"] },
  { id: "flats",    n: 4, name: "Fraction Flats",    emoji: "🍕", subject: "Math",
    topic: "Comparing, equivalent & fractions of a set",
    gens: ["fracCompare", "fracEquiv", "fracOfSet"] },
  { id: "gorge",    n: 5, name: "Grammar Gorge",     emoji: "📚", subject: "English",
    topic: "Parts of speech & verb tense",
    gens: ["partOfSpeech", "partOfSpeech", "verbTense"] },
  { id: "wordworks", n: 6, name: "Word Works Raceway", emoji: "🔤", subject: "English",
    topic: "Synonyms, antonyms, prefixes & suffixes",
    gens: ["synonym", "antonym", "prefix", "suffix"] },
  { id: "pass",     n: 7, name: "Punctuation Pass",  emoji: "✍️", subject: "English",
    topic: "Punctuation, contractions, plurals & homophones",
    gens: ["punctuation", "contraction", "plural", "homophone"] },
  { id: "final",    n: 8, name: "Champion's Final",  emoji: "🏆", subject: "Mixed",
    topic: "Everything — plus word problems, time, area & reading",
    gens: ["wordProblem", "elapsedTime", "areaPerimeter", "contextClue", "figurative",
           "mulFact", "fracOfSet", "synonym", "homophone"] }
];

/* ============================================================
   RACE RULES
   ============================================================ */
var GP_LAPS = 10;            // questions per Grand Prix
var GP_ANSWER_SECONDS = 14;  // the speed bar (running out never blocks you)

/* the three rivals you are racing */
var RIVALS = [
  { id: "ace",  name: "Ace Vega", emoji: "🏎️", pace: 11.0, color: "#ff2e6d" },
  { id: "nova", name: "Nova Kim", emoji: "🚙", pace: 9.5,  color: "#35e0c8" },
  { id: "rex",  name: "Rex Bolt", emoji: "🛻", pace: 7.5,  color: "#ffb020" }
];

/* championship points & 🔧 parts by finishing position (index 0 = 1st) */
var GP_POINTS = [10, 6, 3, 1];
var GP_PARTS  = [5, 3, 2, 1];

/* garage upgrades — bought with 🔧 parts, they change the real race maths */
var UPGRADES = [
  { id: "engine", name: "Engine", icon: "⚙️", desc: "Further down the track for every correct answer.",
    levels: ["9.0 m", "9.8 m", "10.6 m", "11.4 m"] },
  { id: "tires",  name: "Tires",  icon: "🛞", desc: "Bigger speed bonus, and you keep rolling after a miss.",
    levels: ["+3.0 max", "+3.5 max", "+4.0 max", "+4.5 max"] },
  { id: "nitro",  name: "Nitro",  icon: "🔥", desc: "Turbo kicks in sooner and pushes harder.",
    levels: ["3 streak, +3", "3 streak, +4", "2 streak, +4", "2 streak, +5"] }
];
var UPGRADE_COST = [5, 10, 20];   // cost to reach level 1, 2, 3

/* rank ladder, by championship points collected across the season */
var GP_RANKS = [
  { need: 0,  title: "Rookie",     icon: "🔰" },
  { need: 12, title: "Privateer",  icon: "🚗" },
  { need: 28, title: "Pro Driver", icon: "🏎️" },
  { need: 48, title: "Ace",        icon: "⭐" },
  { need: 68, title: "Legend",     icon: "👑" }
];

var GP_TROPHIES = [
  { id: "first-points", icon: "🎯", name: "On the Board",     desc: "Score your first championship points" },
  { id: "first-win",    icon: "🥇", name: "Race Winner",       desc: "Win a Grand Prix" },
  { id: "clean-sheet",  icon: "💯", name: "Clean Sheet",       desc: "Answer all 10 questions correctly in one race" },
  { id: "turbo-master", icon: "🔥", name: "Turbo Master",      desc: "Hit a 10-answer streak" },
  { id: "gearhead",     icon: "🔧", name: "Gearhead",          desc: "Earn 50 parts in total" },
  { id: "full-tune",    icon: "🛠️", name: "Fully Tuned",       desc: "Max out every upgrade" },
  { id: "season-champ", icon: "🏆", name: "Season Champion",   desc: "Finish the season with 60+ points" },
  { id: "track-master", icon: "👑", name: "Track Master",      desc: "Win all 8 Grands Prix" }
];

/* commentary lines */
var GP_CHEERS = ["Great pace!", "Clean lap!", "You're flying!", "Perfect line!", "That's the way!", "Brilliant!"];
var GP_MISSES = ["Lost some speed there.", "Off the racing line.", "Tough corner.", "Shake it off — keep pushing."];
