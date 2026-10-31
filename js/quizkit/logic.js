/* ============================================================
   quizkit/logic.js — QuizLogic: picking, shuffling, checking, scoring
   ------------------------------------------------------------
   No DOM, so Node tests load it too. Grew out of Sticker Quest's
   Unit 2 Test Prep (adventurepack/stickerquest/src/unit2Logic.js
   is now a thin wrapper around this).

   Question shapes (answers are option ids, never text, so choices
   can be shuffled):
     multiple_choice      options [{id,text}], correctAnswer "B"
     true_false_sentence  options True/False,  correctAnswer "T" | "F"
     choose_two           options [{id,text}], correctAnswers ["A","B"]
     matching             items [{id,text}] → options [{id,text}],
                          correctAnswers {itemId: optionId}
   Every question also has id, difficulty "easy" | "medium",
   prompt, explanation; audioText for true/false and matching.

   rng is a () => [0,1) function: pages use Math.random, tests pass
   a seeded one.
   ============================================================ */
(function (root) {
  "use strict";

  var SIZES = { easy: 6, medium: 6, mixed: 8 };

  function shuffle(list, rng) {
    rng = rng || Math.random;
    var a = list.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(rng() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  // n questions from list. Ones not in `avoid` (the last round) go first, so back-to-back rounds differ.
  function take(list, n, avoid, rng) {
    var fresh = shuffle(list.filter(function (q) { return avoid.indexOf(q.id) < 0; }), rng);
    var old = shuffle(list.filter(function (q) { return avoid.indexOf(q.id) >= 0; }), rng);
    return fresh.concat(old).slice(0, n);
  }

  // A copy with the choices in a new order. Answers are option ids, so they still hold.
  function prepare(q, rng) {
    var c = Object.assign({}, q);
    if (q.type !== "true_false_sentence") c.options = shuffle(q.options, rng);
    if (q.items) c.items = shuffle(q.items, rng);
    return c;
  }

  // mode "easy" | "medium" | "mixed". Mixed takes about half easy (at least 1 of each) and fills the rest with medium.
  // opts: {rng, avoid: ids of the last round, n, sizes: {easy, medium, mixed}}
  function pickSession(pool, mode, opts) {
    opts = opts || {};
    var rng = opts.rng || Math.random, avoid = opts.avoid || [], sizes = opts.sizes || SIZES;
    var n = opts.n || sizes[mode] || SIZES[mode], picked;
    if (mode === "mixed") {
      var easy = pool.filter(function (q) { return q.difficulty === "easy"; });
      var med = pool.filter(function (q) { return q.difficulty === "medium"; });
      n = Math.min(n, easy.length + med.length);
      var lo = Math.max(med.length ? 1 : n, n - med.length), hi = Math.min(easy.length, med.length ? n - 1 : n);
      // Fit the split to the questions the last round didn't use, when there are enough of them.
      var freshEasy = easy.filter(function (q) { return avoid.indexOf(q.id) < 0; }).length;
      var freshMed = med.filter(function (q) { return avoid.indexOf(q.id) < 0; }).length;
      if (Math.max(lo, n - freshMed) <= Math.min(hi, freshEasy)) { lo = Math.max(lo, n - freshMed); hi = Math.min(hi, freshEasy); }
      var e = Math.min(hi, Math.max(lo, Math.round(n / 2) - 1 + Math.floor(rng() * 3)));
      picked = take(easy, e, avoid, rng).concat(take(med, n - e, avoid, rng));
    } else {
      picked = take(pool.filter(function (q) { return q.difficulty === mode; }), n, avoid, rng);
    }
    return shuffle(picked, rng).map(function (q) { return prepare(q, rng); });
  }

  // r: an option id (single choice, true/false), [id, id] (choose two) or {itemId: optionId} (matching).
  function isCorrect(q, r) {
    if (q.type === "choose_two") return Array.isArray(r) && r.length === 2 && q.correctAnswers.every(function (a) { return r.indexOf(a) >= 0; });
    if (q.type === "matching") return !!r && q.items.every(function (i) { return r[i.id] === q.correctAnswers[i.id]; });
    return r === q.correctAnswer;
  }

  // Matching items that are unmatched or matched to the wrong option.
  function wrongItems(q, r) {
    return q.items.map(function (i) { return i.id; }).filter(function (id) { return r[id] !== q.correctAnswers[id]; });
  }

  // results: [{correct, tries}]. Right on the first try = 1 point, fixed on the retry = half a point.
  function scoreSession(results) {
    var total = results.length;
    var firstTry = results.filter(function (r) { return r.correct && r.tries === 1; }).length;
    var fixed = results.filter(function (r) { return r.correct && r.tries > 1; }).length;
    var points = firstTry + fixed / 2, pct = total ? points / total : 0;
    return { total: total, firstTry: firstTry, fixed: fixed, missed: total - firstTry - fixed, points: points,
      stars: pct >= 0.85 ? 3 : pct >= 0.6 ? 2 : 1 };
  }

  // What 🔊 reads: the prompt and the choices in the order they are shown.
  // Choice questions read their choices in the shown (shuffled) order, so audioText is not used here:
  // Unit 2 fills it with the unshuffled choices. audioPrompt is a spoken stand-in for the prompt alone.
  function readText(q) {
    if (q.type !== "multiple_choice" && q.type !== "choose_two") return q.audioText;
    return (q.audioPrompt || q.prompt) + " " + q.options.map(function (o, i) { return (i ? "Or, " : "") + o.text.replace(/[.?]$/, "") + "?"; }).join(" ");
  }

  /* ---------- native-language words: {{வணக்கம்|vanakkam}} ----------
     A pack can mark a word in another script with its English spelling. Screens show both;
     read-aloud gives the native part to a native voice, or says the spelling when there is none. */
  var NATIVE = /\{\{([^|{}]+)\|([^|{}]+)\}\}/g;
  // [{text, native?: true, say}] in order; plain English parts have native false.
  function segments(s) {
    var out = [], last = 0, m;
    s = String(s == null ? "" : s);
    NATIVE.lastIndex = 0;
    while ((m = NATIVE.exec(s))) {
      if (m.index > last) out.push({ text: s.slice(last, m.index), native: false });
      out.push({ text: m[1], say: m[2], native: true });
      last = NATIVE.lastIndex;
    }
    if (last < s.length) out.push({ text: s.slice(last), native: false });
    return out;
  }
  // Text without markers: "வணக்கம் (vanakkam)" (for labels), or only the spelling when spellOnly.
  function plain(s, spellOnly) {
    return String(s == null ? "" : s).replace(NATIVE, function (_, nat, say) { return spellOnly ? say : nat + " (" + say + ")"; });
  }

  var QuizLogic = { SIZES: SIZES, shuffle: shuffle, prepare: prepare, pickSession: pickSession,
    isCorrect: isCorrect, wrongItems: wrongItems, scoreSession: scoreSession, readText: readText,
    segments: segments, plain: plain };
  root.QuizLogic = QuizLogic;
  if (typeof module !== "undefined" && module.exports) module.exports = QuizLogic;
})(typeof window !== "undefined" ? window : globalThis);
