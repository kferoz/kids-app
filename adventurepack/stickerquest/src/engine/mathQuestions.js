/* ============================================================
   src/engine/mathQuestions.js — Chapter 5 multiplication question engine
   ------------------------------------------------------------
   Makes Grade 3 multiplication questions for the Ad-hoc Math Tests.
   No DOM, so Node tests load it too. Plain script (not an ES module):
   index.html runs from file:// and the APK, where modules don't load.
   Defines one global, MathQuestions, and exports it for Node.

     MathQuestions.createSession({seed, count, difficulty, types})
       → {seed, difficulty, questions}
       seed: number or text (same seed = same test, so it can be
       replayed); leave it out for a new random test.
       difficulty: "easy" | "medium" | "hard" | "mixed" (default).
       types: any of TYPES (default: all).
     MathQuestions.generate(type, difficulty, rngOrSeed) → one question
     MathQuestions.check(q, response) → true when all right
       response: [option ids] for "choice", {fieldId: value} for "input"
     MathQuestions.checkField(q, fieldId, value) → one box right?
     MathQuestions.areaSvg(model, values) → area model picture (SVG text)

   Every question has: id (from its numbers, so the same math gets the
   same id), type, difficulty, prompt, hint, steps (step-by-step),
   explanation (the steps as one string), audioText (no symbols, ready
   for read-aloud), mathKey (the core multiplication, to stop repeats)
   and answerKind:
     "choice": options [{id, text}], correctAnswers [ids],
               selectCount 2 | "all"
     "input":  template [text | {field}], fields [{id, label, answer}],
               correctAnswers {fieldId: number}, answer (final product)
   Extras: area_model has model + svg; word_multiply has picture.
   No number anywhere in a question is above 9,999.
   ============================================================ */
(function (root) {
  "use strict";

  var MAX = 9999;
  var DIFFICULTIES = ["easy", "medium", "hard"];
  var TYPES = ["single_multiply", "true_false_equations", "choose_correct_ways",
    "fill_blanks_decompose", "area_model", "word_multiply"];
  // Types that only make sense at some levels.
  var LEVELS = { word_multiply: ["easy"] };
  var UNITS = ["ones", "tens", "hundreds", "thousands"];
  var LETTERS = "ABCDE";

  /* ---------- random numbers (seeded, replayable) ---------- */
  function mulberry32(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function hash(text) { // FNV-1a, 32 bit
    var h = 0x811C9DC5;
    for (var i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 0x01000193); }
    return h >>> 0;
  }
  function seedFrom(seed) {
    if (typeof seed === "number" && isFinite(seed)) return Math.floor(Math.abs(seed)) >>> 0;
    return hash(String(seed));
  }
  function newSeed() {
    try {
      var c = (typeof crypto !== "undefined" && crypto.getRandomValues) ? crypto : null;
      if (c) return c.getRandomValues(new Uint32Array(1))[0];
    } catch (e) { /* fall through */ }
    return Math.floor(Math.random() * 4294967296);
  }
  function toRng(r) { return typeof r === "function" ? r : mulberry32(r == null ? newSeed() : seedFrom(r)); }
  function int(rng, min, max) { return min + Math.floor(rng() * (max - min + 1)); }
  function pick(rng, arr) { return arr[Math.floor(rng() * arr.length)]; }
  function shuffle(rng, arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }

  /* ---------- text helpers ---------- */
  function fmt(n) { return n >= 1000 ? String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : String(n); }
  function times(a, b) { return fmt(a) + " × " + fmt(b); }
  // Read-aloud text: symbols become words, blanks become "blank".
  function speak(text) {
    return String(text).replace(/×/g, "times").replace(/=/g, "equals").replace(/\+/g, "plus")
      .replace(/[()]/g, "").replace(/_+/g, "blank").replace(/\s+/g, " ").trim();
  }
  function templateText(template, blank) {
    return template.map(function (t) { return typeof t === "string" ? t : (blank || "___"); }).join("");
  }
  function sortedKey(a, b) { return Math.min(a, b) + "x" + Math.max(a, b); }

  // 157 → [100, 50, 7] (place-value parts, zeros dropped)
  function placeParts(n) {
    var s = String(n), out = [];
    for (var i = 0; i < s.length; i++) {
      var d = +s[i];
      if (d) out.push(d * Math.pow(10, s.length - 1 - i));
    }
    return out;
  }

  // Step-by-step for a × b: break the bigger number by place value.
  function multiplySteps(a, b) {
    var p = a * b;
    if (a < 10 && b < 10) return [times(a, b) + " is a times-table fact.", times(a, b) + " = " + fmt(p) + "."];
    var splitA = a >= 10 && b < 10;               // 157 × 6: break 157
    var big = splitA ? a : b, other = splitA ? b : a;
    var parts = placeParts(big);
    if (parts.length === 1) return ["Use the basic fact and the zeros.", times(a, b) + " = " + fmt(p) + "."];
    var steps = ["Break " + fmt(big) + " into " + parts.map(fmt).join(" + ") + "."];
    parts.forEach(function (pt) {
      steps.push((splitA ? times(pt, other) : times(other, pt)) + " = " + fmt(pt * other) + ".");
    });
    steps.push("Add: " + parts.map(function (pt) { return fmt(pt * other); }).join(" + ") + " = " + fmt(p) + ".");
    return steps;
  }
  function multiplyHint(a, b) {
    if (a < 10 && b < 10) return "Use your times tables. Skip count by " + b + "s!";
    var splitA = a >= 10 && b < 10;
    var big = splitA ? a : b, other = splitA ? b : a;
    var parts = placeParts(big);
    if (parts.length === 1) return "Start with the basic fact. Then add the zeros.";
    return "Break " + fmt(big) + " into " + parts.map(fmt).join(" + ") + ". Multiply each part by " + other + ".";
  }

  /* ---------- numbers for each level ---------- */
  function noZeroOnes(rng, min, max) { var n; do { n = int(rng, min, max); } while (n % 10 === 0); return n; }
  // easy: 1-digit × 1-digit or 2-digit × 1-digit; medium: 3-digit × 1-digit; hard: 2-digit × 2-digit
  function factorsFor(rng, difficulty) {
    if (difficulty === "easy") {
      return rng() < 0.5 ? [int(rng, 2, 9), int(rng, 2, 9)] : [noZeroOnes(rng, 11, 99), int(rng, 2, 9)];
    }
    if (difficulty === "medium") return [noZeroOnes(rng, 101, 999), int(rng, 2, 9)];
    return [noZeroOnes(rng, 11, 99), noZeroOnes(rng, 11, 99)];
  }

  function inputQuestion(base, template, fields) {
    var correct = {};
    fields.forEach(function (f) { correct[f.id] = f.answer; });
    base.answerKind = "input";
    base.template = template;
    base.fields = fields;
    base.correctAnswers = correct;
    base.answer = fields[fields.length - 1].answer;
    return base;
  }
  function finish(q) {
    q.explanation = q.steps.join(" ");
    return q;
  }

  /* ---------- 1. single_multiply ---------- */
  function singleMultiply(rng, difficulty) {
    var f = factorsFor(rng, difficulty), a = f[0], b = f[1], p = a * b;
    return finish(inputQuestion({
      id: "mul-" + a + "x" + b, type: "single_multiply", difficulty: difficulty, mathKey: sortedKey(a, b),
      prompt: "What is " + times(a, b) + "?",
      hint: multiplyHint(a, b),
      steps: multiplySteps(a, b),
      audioText: speak("What is " + times(a, b) + "?")
    }, [times(a, b) + " = ", { field: "answer" }], [{ id: "answer", label: "Answer", answer: p }]));
  }

  /* ---------- 2. true_false_equations ---------- */
  // A wrong product that looks close: one digit nudged by 1–3, same length.
  function nearMiss(rng, p) {
    var s = String(p);
    for (var tries = 0; tries < 40; tries++) {
      var pos = int(rng, 0, s.length - 1), nd = +s[pos] + pick(rng, [-3, -2, -1, 1, 2, 3]);
      if (nd < 0 || nd > 9 || (pos === 0 && nd === 0)) continue;
      var v = +(s.slice(0, pos) + nd + s.slice(pos + 1));
      if (v !== p && v > 0 && v <= MAX) return v;
    }
    return p % 10 === 9 ? p - 1 : p + 1;
  }
  function trueFalse(rng, difficulty) {
    var n = int(rng, 3, 5), nTrue = int(rng, 1, n - 1), used = {}, eqs = [];
    while (eqs.length < n) {
      var f = factorsFor(rng, difficulty), k = sortedKey(f[0], f[1]);
      if (used[k]) continue;
      used[k] = 1;
      var p = f[0] * f[1], isTrue = eqs.length < nTrue;
      eqs.push({ a: f[0], b: f[1], p: p, shown: isTrue ? p : nearMiss(rng, p), isTrue: isTrue });
    }
    eqs = shuffle(rng, eqs);
    var options = eqs.map(function (e, i) { return { id: LETTERS[i], text: times(e.a, e.b) + " = " + fmt(e.shown) }; });
    var sig = options.map(function (o) { return o.text; }).join("|");
    return finish({
      id: "tf-" + hash(sig).toString(36), type: "true_false_equations", difficulty: difficulty,
      mathKey: "tf:" + Object.keys(used).sort().join(","),
      prompt: "Which equations are true? Tap ALL the true ones.",
      hint: "Solve each one. Then check every digit!",
      steps: eqs.map(function (e) {
        return e.isTrue ? times(e.a, e.b) + " = " + fmt(e.p) + ". True!"
          : times(e.a, e.b) + " = " + fmt(e.p) + ", not " + fmt(e.shown) + ". False.";
      }),
      audioText: speak("Which equations are true? " + options.map(function (o) { return o.text + "."; }).join(" ")),
      answerKind: "choice", selectCount: "all", options: options,
      correctAnswers: eqs.map(function (e, i) { return e.isTrue ? LETTERS[i] : null; }).filter(Boolean)
    });
  }

  /* ---------- 3. choose_correct_ways (choose two) ---------- */
  // easy 6 × 40, medium 8 × 300, hard 40 × 60
  function chooseWays(rng, difficulty) {
    var i = difficulty === "hard" ? 1 : 0, j = difficulty === "medium" ? 2 : 1, k = i + j;
    var a = int(rng, 2, 9), b = int(rng, 2, 9), ab = a * b;
    var x = a * Math.pow(10, i), y = b * Math.pow(10, j), P = x * y, U = Math.pow(10, k);
    var right = [
      { text: a + " × " + b + " × " + fmt(U), value: ab * U },
      { text: x + " groups of " + b + " " + UNITS[j], value: x * b * Math.pow(10, j) },
      { text: "Find " + a + " × " + b + " = " + ab + ", then make it " + ab + " " + UNITS[k], value: ab * U }
    ];
    var wrongU = k === 1 ? 100 : 10;
    var wrong = [
      { text: a + " × " + b + " × " + wrongU, value: ab * wrongU },
      { text: fmt(x) + " + " + fmt(y), value: x + y },
      { text: a + " × " + b + " + " + fmt(U), value: ab + U },
      { text: x + " groups of " + b + " " + UNITS[j - 1], value: x * b * Math.pow(10, j - 1) }
    ];
    if (i > 0) wrong.push({ text: a + " groups of " + b + " " + UNITS[j], value: a * b * Math.pow(10, j) });
    wrong = wrong.filter(function (w) { return w.value !== P; });
    var chosen = shuffle(rng, right).slice(0, 2).map(function (o) { o.ok = true; return o; })
      .concat(shuffle(rng, wrong).slice(0, int(rng, 2, 3)));
    chosen = shuffle(rng, chosen);
    var options = chosen.map(function (o, n) { return { id: LETTERS[n], text: o.text }; });
    var rightTexts = chosen.filter(function (o) { return o.ok; }).map(function (o) { return "“" + o.text + "”"; });
    var steps = ["Basic fact: " + a + " × " + b + " = " + ab + "."];
    steps.push(i ? fmt(x) + " is " + a + " tens. " + fmt(y) + " is " + b + " tens. Tens × tens makes hundreds."
      : fmt(y) + " is " + b + " " + UNITS[j] + ".");
    steps.push("So " + times(x, y) + " = " + ab + " " + UNITS[k] + " = " + fmt(P) + ".");
    steps.push("The two right ways: " + rightTexts.join(" and ") + ".");
    var prompt = "Which TWO ways show how to find " + times(x, y) + "?";
    return finish({
      id: "ways-" + x + "x" + y + "-" + hash(options.map(function (o) { return o.text; }).join("|")).toString(36),
      type: "choose_correct_ways", difficulty: difficulty, mathKey: sortedKey(x, y),
      prompt: prompt,
      hint: "Start with " + a + " × " + b + ". Then think about the zeros.",
      steps: steps,
      audioText: speak(prompt + " " + options.map(function (o, n) { return (n ? "Or, " : "") + o.text + "."; }).join(" ")),
      answerKind: "choice", selectCount: 2, options: options,
      correctAnswers: chosen.map(function (o, n) { return o.ok ? LETTERS[n] : null; }).filter(Boolean)
    });
  }

  /* ---------- shared by 4 and 5: (part × m) + (part × m) = __ + __ = __ ---------- */
  function partsTemplate(a, b, pieces) { // pieces [{x, y}] in order
    var t = [times(a, b) + " = " + pieces.map(function (pc) { return "(" + times(pc.x, pc.y) + ")"; }).join(" + ") + " = "];
    var fields = [];
    pieces.forEach(function (pc, n) {
      if (n) t.push(" + ");
      t.push({ field: "p" + (n + 1) });
      fields.push({ id: "p" + (n + 1), label: times(pc.x, pc.y), answer: pc.x * pc.y });
    });
    t.push(" = ", { field: "total" });
    fields.push({ id: "total", label: "Total", answer: a * b });
    return { template: t, fields: fields };
  }
  function partsSteps(a, b, pieces, split) {
    var steps = ["Break " + fmt(split) + " into " + placeParts(split).map(fmt).join(" + ") + "."];
    pieces.forEach(function (pc) { steps.push(times(pc.x, pc.y) + " = " + fmt(pc.x * pc.y) + "."); });
    steps.push("Add: " + pieces.map(function (pc) { return fmt(pc.x * pc.y); }).join(" + ") + " = " + fmt(a * b) + ".");
    return steps;
  }

  /* ---------- 4. fill_blanks_decompose ---------- */
  // easy: tens and ones (15 × 4); medium: hundreds and ones (306 × 3); hard: hundreds, tens and ones (472 × 6)
  function decompose(rng, difficulty) {
    var a, words;
    if (difficulty === "easy") { a = noZeroOnes(rng, 11, 99); words = "tens and ones"; }
    else if (difficulty === "medium") { a = int(rng, 1, 9) * 100 + int(rng, 1, 9); words = "hundreds and ones"; }
    else { a = int(rng, 1, 9) * 100 + int(rng, 1, 9) * 10 + int(rng, 1, 9); words = "hundreds, tens, and ones"; }
    var b = int(rng, 2, 9);
    var pieces = placeParts(a).map(function (pt) { return { x: pt, y: b }; });
    var tf = partsTemplate(a, b, pieces);
    var prompt = "Break " + fmt(a) + " into " + words + ". Fill in the missing numbers.";
    return finish(inputQuestion({
      id: "dec-" + a + "x" + b, type: "fill_blanks_decompose", difficulty: difficulty, mathKey: sortedKey(a, b),
      prompt: prompt,
      hint: fmt(a) + " = " + placeParts(a).map(fmt).join(" + ") + ". Multiply each part by " + b + ".",
      steps: partsSteps(a, b, pieces, a),
      audioText: speak(prompt + " " + templateText(tf.template, " blank "))
    }, tf.template, tf.fields));
  }

  /* ---------- 5. area_model ---------- */
  // easy: teens × 1-digit (14 × 8); medium: 2-digit × 1-digit (36 × 7); hard: 2-digit × 2-digit, split the second (23 × 14)
  function areaModel(rng, difficulty) {
    var a, b, pieces, model;
    if (difficulty === "hard") {
      a = noZeroOnes(rng, 11, 99); b = noZeroOnes(rng, 11, 99);
      pieces = placeParts(b).map(function (pt) { return { x: a, y: pt }; });
      model = { side: a, parts: placeParts(b) };
    } else {
      a = difficulty === "easy" ? int(rng, 11, 19) : noZeroOnes(rng, 21, 99);
      b = int(rng, difficulty === "easy" ? 2 : 3, 9);
      pieces = placeParts(a).map(function (pt) { return { x: pt, y: b }; });
      model = { side: b, parts: placeParts(a) };
    }
    model.labels = pieces.map(function (pc) { return times(pc.x, pc.y); });
    model.fields = pieces.map(function (pc, n) { return "p" + (n + 1); });
    model.title = times(a, b);
    var tf = partsTemplate(a, b, pieces);
    var split = difficulty === "hard" ? b : a;
    var q = inputQuestion({
      id: "area-" + a + "x" + b, type: "area_model", difficulty: difficulty, mathKey: sortedKey(a, b),
      prompt: "Use the area model to find " + times(a, b) + ". Fill in each part.",
      hint: "Find the area of each small box. Then add them.",
      steps: partsSteps(a, b, pieces, split),
      audioText: speak("Use the area model to find " + times(a, b) + ". " +
        model.labels.map(function (l) { return "One box is " + l + "."; }).join(" ") + " Fill in each part, then add.")
    }, tf.template, tf.fields);
    q.model = model;
    q.svg = areaSvg(model);
    return finish(q);
  }

  // Rectangle split into parts; "?" in each box until values {p1, p2} are given.
  function areaSvg(model, values) {
    var W = 300, H = 120, x0 = 46, y0 = 34;
    var total = model.parts.reduce(function (s, n) { return s + n; }, 0);
    var shares = model.parts.map(function (n) { return Math.max(n / total, 0.3); });
    var sum = shares.reduce(function (s, n) { return s + n; }, 0);
    var fills = ["#FFE3A3", "#CDEFEA", "#E4DCFF"];
    var out = [], x = x0;
    shares.forEach(function (sh, n) {
      var w = Math.round(W * sh / sum), cx = x + w / 2;
      var v = values && values[model.fields[n]] != null && values[model.fields[n]] !== "" ? fmt(+values[model.fields[n]]) : "?";
      out.push('<rect x="' + x + '" y="' + y0 + '" width="' + w + '" height="' + H + '" fill="' + fills[n % 3] +
        '" stroke="#2E2650" stroke-width="3"/>');
      out.push('<text x="' + cx + '" y="' + (y0 - 10) + '" text-anchor="middle" font-size="18" font-weight="700" fill="#2E2650">' + fmt(model.parts[n]) + "</text>");
      out.push('<text x="' + cx + '" y="' + (y0 + 46) + '" text-anchor="middle" font-size="16" fill="#2E2650">' + model.labels[n] + "</text>");
      out.push('<text x="' + cx + '" y="' + (y0 + 84) + '" text-anchor="middle" font-size="26" font-weight="700" fill="#6C4CF1">' + v + "</text>");
      x += w;
    });
    out.push('<text x="' + (x0 - 10) + '" y="' + (y0 + H / 2 + 6) + '" text-anchor="end" font-size="18" font-weight="700" fill="#2E2650">' + fmt(model.side) + "</text>");
    var label = "Area model for " + model.title + ". " + model.labels.map(function (l) { return "One box is " + l + "."; }).join(" ");
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + (x0 + W + 10) + " " + (y0 + H + 10) +
      '" role="img" aria-label="' + speak(label) + '" class="mq-area" font-family="inherit">' + out.join("") + "</svg>";
  }

  /* ---------- 6. word_multiply (easy) ---------- */
  var NAMES = ["Sam", "Mia", "Leo", "Ava", "Raj", "Zoe", "Omar", "Lily", "Ken", "Nia"];
  var THINGS = [
    { many: "bags", item: "apples", group: "🛍️", icon: "🍎" },
    { many: "boxes", item: "crayons", group: "📦", icon: "🖍️" },
    { many: "plates", item: "cookies", group: "🍽️", icon: "🍪" },
    { many: "vases", item: "flowers", group: "🏺", icon: "🌸" },
    { many: "baskets", item: "eggs", group: "🧺", icon: "🥚" },
    { many: "pages", item: "stickers", group: "📄", icon: "⭐" }
  ];
  function wordMultiply(rng, difficulty) {
    var g = int(rng, 2, 9), e = int(rng, 2, 12), p = g * e;
    var who = pick(rng, NAMES), th = pick(rng, THINGS);
    var prompt = who + " has " + g + " " + th.many + " with " + e + " " + th.item + " each. How many " + th.item + " in all?";
    return finish(inputQuestion({
      id: "word-" + g + "x" + e + "-" + hash(who + th.item).toString(36), type: "word_multiply", difficulty: difficulty,
      mathKey: sortedKey(g, e),
      prompt: prompt,
      hint: "How many groups? How many in each? Multiply!",
      steps: ["There are " + g + " " + th.many + ".", "Each one has " + e + " " + th.item + ".",
        times(g, e) + " = " + fmt(p) + ".", who + " has " + fmt(p) + " " + th.item + "."],
      audioText: speak(prompt),
      picture: { groups: g, each: e, group: th.group, item: th.icon }
    }, [times(g, e) + " = ", { field: "answer" }], [{ id: "answer", label: th.item, answer: p }]));
  }

  var MAKERS = {
    single_multiply: singleMultiply, true_false_equations: trueFalse, choose_correct_ways: chooseWays,
    fill_blanks_decompose: decompose, area_model: areaModel, word_multiply: wordMultiply
  };
  function supports(type, difficulty) { return MAKERS[type] && (LEVELS[type] || DIFFICULTIES).indexOf(difficulty) >= 0; }

  function generate(type, difficulty, rngOrSeed) {
    if (!MAKERS[type]) throw new Error("Unknown question type: " + type);
    if (!supports(type, difficulty)) throw new Error(type + " has no " + difficulty + " level");
    return MAKERS[type](toRng(rngOrSeed), difficulty);
  }

  /* ---------- a whole test ---------- */
  function createSession(opts) {
    opts = opts || {};
    var seed = opts.seed == null || opts.seed === "" ? newSeed() : seedFrom(opts.seed);
    var rng = mulberry32(seed), count = Math.max(1, opts.count || 10);
    var level = opts.difficulty || "mixed";
    var types = (opts.types && opts.types.length ? opts.types : TYPES).filter(function (t) { return MAKERS[t]; });
    if (!types.length) throw new Error("No known question types");
    if (level !== "mixed" && DIFFICULTIES.indexOf(level) < 0) throw new Error("Unknown difficulty: " + level);

    // Mixed: split evenly over the levels these types have, easy first as a warm-up.
    var levels = DIFFICULTIES.filter(function (d) { return types.some(function (t) { return supports(t, d); }); });
    var plan = [];
    for (var n = 0; n < count; n++) {
      plan.push(level === "mixed" ? levels[Math.min(levels.length - 1, Math.floor(n * levels.length / count))] : level);
    }
    var bag = [];
    var nextType = function (difficulty) {
      for (var tries = 0; tries < 2; tries++) {
        for (var b = 0; b < bag.length; b++) {
          if (supports(bag[b], difficulty)) return bag.splice(b, 1)[0];
        }
        bag = bag.concat(shuffle(rng, types)); // refill so every type shows up before any repeats
      }
      return null;
    };

    var questions = [], ids = {}, keys = {};
    plan.forEach(function (difficulty) {
      var type = nextType(difficulty);
      if (!type) {
        var any = types.filter(function (t) { return supports(t, difficulty); });
        if (!any.length) throw new Error("None of these types has a " + difficulty + " level: " + types.join(", "));
        type = pick(rng, any);
      }
      var order = [type].concat(shuffle(rng, types.filter(function (t) { return t !== type && supports(t, difficulty); })));
      for (var o = 0; o < order.length; o++) {
        for (var tries = 0; tries < 60; tries++) {
          var q = MAKERS[order[o]](rng, difficulty);
          if (ids[q.id] || keys[q.mathKey]) continue;
          ids[q.id] = keys[q.mathKey] = 1;
          q.number = questions.length + 1;
          questions.push(q);
          return;
        }
      }
      // Ran out of new questions for this level: the test is just shorter.
    });
    return { seed: seed, difficulty: level, questions: questions };
  }

  /* ---------- checking ---------- */
  function toNumber(v) {
    var s = String(v == null ? "" : v).replace(/[,\s]/g, "");
    return /^\d+$/.test(s) ? Number(s) : NaN;
  }
  function checkField(q, fieldId, value) {
    return q.correctAnswers && toNumber(value) === q.correctAnswers[fieldId];
  }
  function check(q, response) {
    if (q.answerKind === "input") {
      return q.fields.every(function (f) { return checkField(q, f.id, response && response[f.id]); });
    }
    var picked = (response || []).slice().sort().join(",");
    return picked === q.correctAnswers.slice().sort().join(",");
  }

  var api = {
    TYPES: TYPES, DIFFICULTIES: DIFFICULTIES, MAX: MAX,
    createSession: createSession, generate: generate, supports: supports,
    check: check, checkField: checkField, areaSvg: areaSvg,
    newSeed: newSeed, seedFrom: seedFrom, rng: mulberry32, format: fmt, speak: speak
  };
  root.MathQuestions = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
