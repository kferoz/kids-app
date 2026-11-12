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
     MathQuestions.build(spec) → a question from {type, difficulty, params}
       (every question carries its spec; saved tests store specs only)
       BUILD_TYPES adds "multiple_choice" and "word_match" (sight words)
     MathQuestions.wordOptions(word, list, n, rng) → n look-alike choices

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

  /* ============================================================
     Builders: numbers in → question out. Generators below pick the
     numbers; the Admin's "type it by hand" form calls the same
     builders through build(spec). Every question keeps its spec
     {type, difficulty, params}, so a saved test stores only specs
     and is rebuilt (and re-checked) when a child plays it.
     ============================================================ */
  function need(ok, msg) { if (!ok) throw new Error(msg); }
  function whole(n, min, max) { return typeof n === "number" && n % 1 === 0 && n >= min && n <= max; }
  function capped(a, b) { need(a * b <= MAX, "Keep answers at 9,999 or less."); }
  function withSpec(q, type, difficulty, params) { q.spec = { type: type, difficulty: difficulty, params: params }; return finish(q); }
  // Level from the sizes, like the generator's ranges.
  function levelFor(a, b) {
    var d = [String(a).length, String(b).length].sort().join("");
    return d === "11" || d === "12" ? "easy" : d === "13" ? "medium" : d === "22" ? "hard" : "medium";
  }
  var PLACE = ["ones", "tens", "hundreds", "thousands"];
  function partsWords(n) {
    var w = placeParts(n).map(function (p) { return PLACE[String(p).length - 1]; });
    return w.length < 3 ? w.join(" and ") : w.slice(0, -1).join(", ") + ", and " + w[w.length - 1];
  }

  /* ---------- 1. single_multiply {a, b} ---------- */
  function buildSingle(p, difficulty) {
    var a = p.a, b = p.b;
    need(whole(a, 1, MAX) && whole(b, 1, MAX), "Use whole numbers.");
    capped(a, b);
    var prod = a * b;
    return withSpec(inputQuestion({
      id: "mul-" + a + "x" + b, type: "single_multiply", difficulty: difficulty, mathKey: sortedKey(a, b),
      prompt: "What is " + times(a, b) + "?",
      hint: multiplyHint(a, b),
      steps: multiplySteps(a, b),
      audioText: speak("What is " + times(a, b) + "?")
    }, [times(a, b) + " = ", { field: "answer" }], [{ id: "answer", label: "Answer", answer: prod }]), "single_multiply", difficulty, { a: a, b: b });
  }
  function singleMultiply(rng, difficulty) {
    var f = factorsFor(rng, difficulty);
    return buildSingle({ a: f[0], b: f[1] }, difficulty);
  }

  /* ---------- 2. true_false_equations {eqs: [[a, b, shown], ...]} ---------- */
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
  function buildTF(p, difficulty) {
    var list = p.eqs;
    need(Array.isArray(list) && list.length >= 2 && list.length <= 5, "Use 2 to 5 equations.");
    var used = {};
    var eqs = list.map(function (e) {
      need(Array.isArray(e) && whole(e[0], 1, MAX) && whole(e[1], 1, MAX) && whole(e[2], 0, MAX), "Write each equation like 62 × 4 = 248.");
      capped(e[0], e[1]);
      var k = sortedKey(e[0], e[1]);
      need(!used[k], "Each equation needs different numbers.");
      used[k] = 1;
      return { a: e[0], b: e[1], p: e[0] * e[1], shown: e[2], isTrue: e[0] * e[1] === e[2] };
    });
    need(eqs.some(function (e) { return e.isTrue; }), "Make at least one equation true.");
    var options = eqs.map(function (e, i) { return { id: LETTERS[i], text: times(e.a, e.b) + " = " + fmt(e.shown) }; });
    var sig = options.map(function (o) { return o.text; }).join("|");
    return withSpec({
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
    }, "true_false_equations", difficulty, { eqs: eqs.map(function (e) { return [e.a, e.b, e.shown]; }) });
  }
  function trueFalse(rng, difficulty) {
    var n = int(rng, 3, 5), nTrue = int(rng, 1, n - 1), used = {}, eqs = [];
    while (eqs.length < n) {
      var f = factorsFor(rng, difficulty), k = sortedKey(f[0], f[1]);
      if (used[k]) continue;
      used[k] = 1;
      var p = f[0] * f[1];
      eqs.push([f[0], f[1], eqs.length < nTrue ? p : nearMiss(rng, p)]);
    }
    return buildTF({ eqs: shuffle(rng, eqs) }, difficulty);
  }

  /* ---------- 3. choose_correct_ways {x, y, seed} (x like 8 or 40, y like 300) ---------- */
  function buildWays(p, difficulty) {
    var x = p.x, y = p.y;
    need(whole(x, 2, MAX) && whole(y, 2, MAX) && /^[1-9]0*$/.test(String(x)) && /^[1-9]0+$/.test(String(y)),
      "Use a one-digit number or tens (like 8 or 40) times tens, hundreds or thousands (like 300).");
    capped(x, y);
    var a = +String(x)[0], b = +String(y)[0], i = String(x).length - 1, j = String(y).length - 1, k = i + j;
    need(a >= 2 && b >= 2 && k <= 3, "Use digits 2 to 9, like 8 × 300.");
    var rng = mulberry32(seedFrom(p.seed == null ? x * 100003 + y : p.seed));
    var ab = a * b, P = x * y, U = Math.pow(10, k);
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
    return withSpec({
      id: "ways-" + x + "x" + y + "-" + hash(options.map(function (o) { return o.text; }).join("|")).toString(36),
      type: "choose_correct_ways", difficulty: difficulty, mathKey: sortedKey(x, y),
      prompt: prompt,
      hint: "Start with " + a + " × " + b + ". Then think about the zeros.",
      steps: steps,
      audioText: speak(prompt + " " + options.map(function (o, n) { return (n ? "Or, " : "") + o.text + "."; }).join(" ")),
      answerKind: "choice", selectCount: 2, options: options,
      correctAnswers: chosen.map(function (o, n) { return o.ok ? LETTERS[n] : null; }).filter(Boolean)
    }, "choose_correct_ways", difficulty, { x: x, y: y, seed: p.seed == null ? null : p.seed });
  }
  // easy 6 × 40, medium 8 × 300, hard 40 × 60
  function chooseWays(rng, difficulty) {
    var i = difficulty === "hard" ? 1 : 0, j = difficulty === "medium" ? 2 : 1;
    var x = int(rng, 2, 9) * Math.pow(10, i), y = int(rng, 2, 9) * Math.pow(10, j);
    return buildWays({ x: x, y: y, seed: int(rng, 1, 2147483646) }, difficulty);
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

  /* ---------- 4. fill_blanks_decompose {a, b} ---------- */
  function buildDecompose(p, difficulty) {
    var a = p.a, b = p.b;
    need(whole(a, 10, MAX) && whole(b, 2, MAX), "Use a number 10 or more, times a number 2 or more.");
    need(placeParts(a).length >= 2, "Pick a first number with 2 or more non-zero digits, like 15 or 306.");
    capped(a, b);
    var pieces = placeParts(a).map(function (pt) { return { x: pt, y: b }; });
    var tf = partsTemplate(a, b, pieces);
    var prompt = "Break " + fmt(a) + " into " + partsWords(a) + ". Fill in the missing numbers.";
    return withSpec(inputQuestion({
      id: "dec-" + a + "x" + b, type: "fill_blanks_decompose", difficulty: difficulty, mathKey: sortedKey(a, b),
      prompt: prompt,
      hint: fmt(a) + " = " + placeParts(a).map(fmt).join(" + ") + ". Multiply each part by " + b + ".",
      steps: partsSteps(a, b, pieces, a),
      audioText: speak(prompt + " " + templateText(tf.template, " blank "))
    }, tf.template, tf.fields), "fill_blanks_decompose", difficulty, { a: a, b: b });
  }
  // easy: tens and ones (15 × 4); medium: hundreds and ones (306 × 3); hard: hundreds, tens and ones (472 × 6)
  function decompose(rng, difficulty) {
    var a;
    if (difficulty === "easy") a = noZeroOnes(rng, 11, 99);
    else if (difficulty === "medium") a = int(rng, 1, 9) * 100 + int(rng, 1, 9);
    else a = int(rng, 1, 9) * 100 + int(rng, 1, 9) * 10 + int(rng, 1, 9);
    return buildDecompose({ a: a, b: int(rng, 2, 9) }, difficulty);
  }

  /* ---------- 5. area_model {a, b, split: "first" | "second"} ---------- */
  function buildArea(p, difficulty) {
    var a = p.a, b = p.b, second = p.split === "second";
    need(whole(a, 2, MAX) && whole(b, 2, MAX), "Use whole numbers 2 or more.");
    capped(a, b);
    var split = second ? b : a, side = second ? a : b, parts = placeParts(split);
    need(parts.length >= 2 && parts.length <= 3, "The number you split needs 2 or 3 non-zero digits, like 14 or 36.");
    var pieces = parts.map(function (pt) { return second ? { x: a, y: pt } : { x: pt, y: b }; });
    var model = { side: side, parts: parts };
    model.labels = pieces.map(function (pc) { return times(pc.x, pc.y); });
    model.fields = pieces.map(function (pc, n) { return "p" + (n + 1); });
    model.title = times(a, b);
    var tf = partsTemplate(a, b, pieces);
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
    return withSpec(q, "area_model", difficulty, { a: a, b: b, split: second ? "second" : "first" });
  }
  // easy: teens × 1-digit (14 × 8); medium: 2-digit × 1-digit (36 × 7); hard: 2-digit × 2-digit, split the second (23 × 14)
  function areaModel(rng, difficulty) {
    if (difficulty === "hard") return buildArea({ a: noZeroOnes(rng, 11, 99), b: noZeroOnes(rng, 11, 99), split: "second" }, difficulty);
    var a = difficulty === "easy" ? int(rng, 11, 19) : noZeroOnes(rng, 21, 99);
    return buildArea({ a: a, b: int(rng, difficulty === "easy" ? 2 : 3, 9), split: "first" }, difficulty);
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
      var raw = values && values[model.fields[n]], v = raw != null && raw !== "" && isFinite(+raw) ? fmt(+raw) : "?";
      out.push('<rect x="' + x + '" y="' + y0 + '" width="' + w + '" height="' + H + '" fill="' + fills[n % 3] +
        '" stroke="#2E2650" stroke-width="3"/>');
      out.push('<text x="' + cx + '" y="' + (y0 - 10) + '" text-anchor="middle" font-size="22" font-weight="700" fill="#2E2650">' + fmt(+model.parts[n]) + "</text>");
      out.push('<text x="' + cx + '" y="' + (y0 + 44) + '" text-anchor="middle" font-size="21" font-weight="600" fill="#2E2650">' + esc(model.labels[n]) + "</text>");
      out.push('<text x="' + cx + '" y="' + (y0 + 88) + '" text-anchor="middle" font-size="28" font-weight="700" fill="#6C4CF1">' + v + "</text>");
      x += w;
    });
    out.push('<text x="' + (x0 - 10) + '" y="' + (y0 + H / 2 + 7) + '" text-anchor="end" font-size="22" font-weight="700" fill="#2E2650">' + fmt(+model.side) + "</text>");
    var label = "Area model for " + model.title + ". " + model.labels.map(function (l) { return "One box is " + l + "."; }).join(" ");
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + (x0 + W + 10) + " " + (y0 + H + 10) +
      '" role="img" aria-label="' + esc(speak(label)) + '" class="mq-area" font-family="inherit">' + out.join("") + "</svg>";
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  /* ---------- 6. word_multiply {g, e, who, thing} ---------- */
  var NAMES = ["Sam", "Mia", "Leo", "Ava", "Raj", "Zoe", "Omar", "Lily", "Ken", "Nia"];
  var THINGS = [
    { many: "bags", item: "apples", group: "🛍️", icon: "🍎" },
    { many: "boxes", item: "crayons", group: "📦", icon: "🖍️" },
    { many: "plates", item: "cookies", group: "🍽️", icon: "🍪" },
    { many: "vases", item: "flowers", group: "🏺", icon: "🌸" },
    { many: "baskets", item: "eggs", group: "🧺", icon: "🥚" },
    { many: "pages", item: "stickers", group: "📄", icon: "⭐" }
  ];
  function buildWord(p, difficulty) {
    var g = p.g, e = p.e, who = String(p.who || "Sam").trim(), th = THINGS[p.thing | 0];
    need(whole(g, 2, 12) && whole(e, 2, 12), "Use 2 to 12 groups with 2 to 12 in each.");
    need(/^[A-Za-z][A-Za-z' -]{0,19}$/.test(who), "Use a first name with letters only.");
    need(!!th, "Pick what is in the groups.");
    var prod = g * e;
    var prompt = who + " has " + g + " " + th.many + " with " + e + " " + th.item + " each. How many " + th.item + " in all?";
    return withSpec(inputQuestion({
      id: "word-" + g + "x" + e + "-" + hash(who + th.item).toString(36), type: "word_multiply", difficulty: difficulty,
      mathKey: sortedKey(g, e),
      prompt: prompt,
      hint: "How many groups? How many in each? Multiply!",
      steps: ["There are " + g + " " + th.many + ".", "Each one has " + e + " " + th.item + ".",
        times(g, e) + " = " + fmt(prod) + ".", who + " has " + fmt(prod) + " " + th.item + "."],
      audioText: speak(prompt),
      picture: { groups: g, each: e, group: th.group, item: th.icon }
    }, [times(g, e) + " = ", { field: "answer" }], [{ id: "answer", label: th.item, answer: prod }]),
      "word_multiply", difficulty, { g: g, e: e, who: who, thing: p.thing | 0 });
  }
  function wordMultiply(rng, difficulty) {
    return buildWord({ g: int(rng, 2, 9), e: int(rng, 2, 12), who: pick(rng, NAMES), thing: int(rng, 0, THINGS.length - 1) }, difficulty);
  }

  /* ---------- hand-made only: multiple_choice {prompt, options[], answer, hint, explain} ---------- */
  function cleanText(s, max) { return String(s == null ? "" : s).replace(/\s+/g, " ").trim().slice(0, max); }
  function buildMC(p, difficulty) {
    var prompt = cleanText(p.prompt, 200), opts = (p.options || []).map(function (o) { return cleanText(o, 120); }).filter(Boolean);
    need(prompt, "Type the question.");
    need(opts.length >= 2 && opts.length <= 4, "Give 2 to 4 answer choices.");
    need(whole(p.answer, 0, opts.length - 1), "Pick the right answer.");
    var options = opts.map(function (t, i) { return { id: LETTERS[i], text: t }; });
    var right = opts[p.answer], hint = cleanText(p.hint, 160), explain = cleanText(p.explain, 300);
    return withSpec({
      id: "mc-" + hash(prompt + "|" + opts.join("|")).toString(36), type: "multiple_choice", difficulty: difficulty,
      mathKey: "mc:" + hash(prompt).toString(36),
      prompt: prompt, hint: hint || "Read every choice before you pick.",
      steps: ["Read the question again.", explain || "The answer is “" + right + "”."],
      audioText: speak(prompt + " " + opts.map(function (o, n) { return (n ? "Or, " : "") + o + "."; }).join(" ")),
      answerKind: "choice", selectCount: 1, options: options, correctAnswers: [LETTERS[p.answer]]
    }, "multiple_choice", difficulty, { prompt: prompt, options: opts, answer: p.answer, hint: hint, explain: explain });
  }

  /* ---------- sight words: word_match {word, options[]} ---------- */
  var SIGHT = ["the", "and", "said", "was", "you", "they", "have", "what", "where", "there", "their", "were", "come", "some",
    "want", "went", "when", "then", "them", "this", "that", "with", "from", "four", "for", "our", "out", "saw", "was", "who",
    "how", "now", "here", "her", "help", "look", "like", "make", "made", "play", "pretty", "please", "put", "ran", "run"];
  var WORD_RE = /^[A-Za-z][A-Za-z'-]{0,23}$/;
  function buildWordMatch(p, difficulty) {
    var word = cleanText(p.word, 24), opts = (p.options || []).map(function (o) { return cleanText(o, 24); });
    need(WORD_RE.test(word), "Words use letters only (one word per line).");
    need(opts.length >= 3 && opts.length <= 4 && opts.every(function (o) { return WORD_RE.test(o); }), "Each word needs 3 or 4 choices.");
    need(opts.indexOf(word) >= 0, "The word must be one of the choices.");
    need(new Set(opts.map(function (o) { return o.toLowerCase(); })).size === opts.length, "The choices must all be different.");
    var options = opts.map(function (t, i) { return { id: LETTERS[i], text: t }; });
    return withSpec({
      id: "wm-" + word.toLowerCase() + "-" + hash(opts.join("|")).toString(36), type: "word_match", difficulty: difficulty,
      mathKey: "wm:" + word.toLowerCase(), word: word,
      prompt: "Find this word: " + word,
      hint: "Look at the first letter. It is “" + word[0] + "”.",
      steps: ["The word is “" + word + "”.", "It starts with “" + word[0] + "” and has " + word.length + " letters."],
      audioText: "Find the word " + word + ". " + word + ".",
      answerKind: "choice", selectCount: 1, options: options, correctAnswers: [LETTERS[opts.indexOf(word)]]
    }, "word_match", difficulty, { word: word, options: opts });
  }
  // Pick n-1 look-alike words from the list (same first letter or length first), padded from common sight words.
  function wordOptions(word, list, n, rngOrSeed) {
    var rng = toRng(rngOrSeed), lw = word.toLowerCase();
    var pool = [], seen = {};
    seen[lw] = 1;
    list.concat(SIGHT).forEach(function (w) {
      var k = String(w).toLowerCase();
      if (!seen[k] && WORD_RE.test(w)) { seen[k] = 1; pool.push(w); }
    });
    var score = function (w) {
      var s = 0, k = w.toLowerCase();
      if (k[0] === lw[0]) s += 2;
      if (Math.abs(k.length - lw.length) <= 1) s += 1;
      if (k.slice(-2) === lw.slice(-2)) s += 1;
      return s + rng();
    };
    var picks = shuffle(rng, pool).sort(function (x, y) { return score(y) - score(x); }).slice(0, n - 1);
    return shuffle(rng, picks.concat([word]));
  }

  var BUILDERS = {
    single_multiply: buildSingle, true_false_equations: buildTF, choose_correct_ways: buildWays,
    fill_blanks_decompose: buildDecompose, area_model: buildArea, word_multiply: buildWord,
    multiple_choice: buildMC, word_match: buildWordMatch
  };
  // Rebuild (and so re-check) a saved question. Difficulty "auto" picks it from the numbers.
  function build(spec) {
    need(spec && BUILDERS[spec.type], "Unknown question type.");
    var p = spec.params || {}, d = spec.difficulty;
    if (DIFFICULTIES.indexOf(d) < 0) {
      d = spec.type === "single_multiply" || spec.type === "fill_blanks_decompose" || spec.type === "area_model" ? levelFor(p.a, p.b)
        : spec.type === "choose_correct_ways" ? (String(p.x).length > 1 ? "hard" : String(p.y).length > 2 ? "medium" : "easy")
        : spec.type === "true_false_equations" && Array.isArray(p.eqs) && p.eqs[0] ? levelFor(p.eqs[0][0], p.eqs[0][1])
        : "easy";
    }
    return BUILDERS[spec.type](p, d);
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
    build: build, BUILD_TYPES: Object.keys(BUILDERS), wordOptions: wordOptions, THINGS: THINGS, NAMES: NAMES,
    newSeed: newSeed, seedFrom: seedFrom, rng: mulberry32, format: fmt, speak: speak
  };
  root.MathQuestions = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
