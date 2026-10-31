/* ============================================================
   academy/js/lessons.js — AcademyLessons: unit lessons → Quiz Kit packs
   ------------------------------------------------------------
   Each file academy/lessons/<grade>-<subject>.js calls
     AcademyLessons.add("g3-math", { 1: lesson, 2: lesson, ... })
   keyed by unit number (js/syllabus.js). A lesson is short to write:
     learn  [[title, art emoji, ["fact", "Term: meaning"], "story"], ...]
     q      questions as arrays, first field "e" (easy) or "m" (medium):
       ["e", "mc",    pic, prompt, [right, wrong, wrong], explanation, spoken prompt?]
       ["e", "tf",    pic, sentence, true|false, explanation, spoken sentence?]
       ["m", "c2",    pic, prompt, [right, right], [wrong, ...], explanation, spoken prompt?]
       ["m", "match", pic, prompt, [[item, its match], ...], explanation, spoken text?]
   A spoken version replaces text that read-aloud would garble
   (symbols like × or ÷, fractions like 3/4). Choices are always read
   after the prompt, in the order shown.
   The right answer is written first; the Quiz Kit shuffles choices.
   build() turns a lesson into a Quiz Kit pack (Learn cards, Easy and
   Medium practice, a Mixed Test). fromAdhoc() does the same for a
   grown-up's AdHoc topic (Admin → 🎓 Academy).

   Progress per learner (profile-store.js namespaces it):
     acad_progress = {unitId | "adhoc:<id>": {r: rounds, best: best
     Mixed Test stars 1–3, m: mastered (Mixed Test with 2+ stars), t}}
   ============================================================ */
(function (root) {
  "use strict";
  var files = {};
  var MASCOTS = {
    math:      { name: "Pip",   emoji: "🦔", hello: "Hi, I'm Pip! Let's think like mathematicians." },
    english:   { name: "Quill", emoji: "🦜", hello: "Hello! I'm Quill. Words are my favourite thing!" },
    science:   { name: "Fizz",  emoji: "🐸", hello: "Hi! I'm Fizz. Let's ask questions and find out!" },
    social:    { name: "Marco", emoji: "🐧", hello: "Hi, I'm Marco! Let's explore our world." },
    computing: { name: "Bit",   emoji: "👾", hello: "Beep! I'm Bit. Let's think step by step." },
    health:    { name: "Hugo",  emoji: "🐻", hello: "Hi, I'm Hugo. Let's take care of ourselves and each other." },
    adhoc:     { name: "Zip",   emoji: "🦊", hello: "Hi! I'm Zip. Let's practise for your special topic!" }
  };
  var TF = [{ id: "T", text: "True" }, { id: "F", text: "False" }];
  function opts(texts) { return texts.map(function (t, i) { return { id: "ABCDEF"[i], text: String(t) }; }); }

  function add(key, lessons) { files[key] = Object.assign(files[key] || {}, lessons); }
  function get(unitId) {
    var m = /^(\w+)-(\w+)-(\d+)$/.exec(unitId || "");
    return m && files[m[1] + "-" + m[2]] ? files[m[1] + "-" + m[2]][+m[3]] || null : null;
  }
  function has(key) { return !!files[key]; }
  function numbers(key) { return Object.keys(files[key] || {}).map(Number).sort(function (a, b) { return a - b; }); }

  // One question array → a Quiz Kit question.
  function question(a, i, idBase, nTopics, nQs) {
    var d = a[0] === "m" ? "medium" : "easy", type = a[1], pic = a[2], prompt = a[3];
    var q = { id: idBase + "q" + (i + 1), difficulty: d, picture: pic, prompt: prompt,
              topic: Math.min(nTopics, 1 + Math.floor(i * nTopics / nQs)) || 1 };
    if (type === "mc") {
      q.type = "multiple_choice"; q.options = opts(a[4]); q.correctAnswer = "A"; q.explanation = a[5];
      if (a[6]) q.audioPrompt = a[6];
    } else if (type === "tf") {
      q.type = "true_false_sentence"; q.options = TF; q.correctAnswer = a[4] ? "T" : "F"; q.explanation = a[5];
      q.audioText = (a[6] || prompt) + " True or false?";
    } else if (type === "c2") {
      q.type = "choose_two"; q.options = opts(a[4].concat(a[5])); q.correctAnswers = ["A", "B"]; q.explanation = a[6];
      if (a[7]) q.audioPrompt = a[7];
    } else if (type === "match") {
      var pairs = a[4];
      q.type = "matching";
      q.items = pairs.map(function (p, k) { return { id: "i" + (k + 1), text: p[0] }; });
      q.options = opts(pairs.map(function (p) { return p[1]; }));
      q.correctAnswers = {}; pairs.forEach(function (p, k) { q.correctAnswers["i" + (k + 1)] = "ABCDEF"[k]; });
      q.explanation = a[5];
      q.audioText = a[6] || prompt + " " + pairs.map(function (p) { return p[0]; }).join(", ") + ".";
    } else throw new Error("Unknown question type " + type + " in " + idBase);
    return q;
  }
  function sizes(qs) {
    var e = qs.filter(function (q) { return q.difficulty === "easy"; }).length, m = qs.length - e;
    return { easy: Math.max(1, Math.min(5, e)), medium: Math.max(1, Math.min(5, m)), mixed: Math.min(8, qs.length) };
  }
  var EARLY = { pk: 1, kg: 1, g1: 1 };

  // A unit (from js/syllabus.js) and its lesson → a Quiz Kit pack.
  function build(unit, lesson) {
    var topics = (lesson.learn || []).map(function (c, k) { return { n: k + 1, title: c[0], art: c[1], facts: c[2], story: c[3] || "" }; });
    var qs = lesson.q.map(function (a, i) { return question(a, i, unit.id + "-", topics.length, lesson.q.length); });
    return {
      id: "ac_" + unit.id, title: unit.title, icon: unit.emoji, skill: "Unit " + unit.n,
      subject: unit.subject, grades: [unit.grade], readToMe: !!EARLY[unit.grade],
      sizes: sizes(qs), mascot: lesson.mascot || MASCOTS[unit.subject] || MASCOTS.math,
      topics: topics.length ? topics : [{ n: 1, title: unit.title, art: unit.emoji, facts: unit.goals, story: "" }],
      questions: qs
    };
  }

  // A grown-up's AdHoc topic → a pack. Questions alternate easy/medium so every practice round has some.
  // topic: {id, title, emoji, notes, questions: [{type: "mc"|"tf", prompt, choices[], answer, explain}]}
  function fromAdhoc(t) {
    var facts = String(t.notes || "").split(/\n+/).map(function (s) { return s.trim(); }).filter(Boolean);
    var qs = (t.questions || []).map(function (x, i) {
      var d = i % 2 ? "m" : "e";
      if (x.type === "tf") return question([d, "tf", t.emoji || "🧪", x.prompt, !!x.answer, x.explain || ""], i, "ah_" + t.id + "-", 1, 1);
      var ch = x.choices.slice(), right = ch.splice(x.answer, 1);
      return question([d, "mc", t.emoji || "🧪", x.prompt, right.concat(ch), x.explain || ""], i, "ah_" + t.id + "-", 1, 1);
    });
    return {
      id: "ah_" + t.id, title: t.title, icon: t.emoji || "🧪", skill: "AdHoc", subject: "adhoc", grades: t.grades || [],
      readToMe: false, sizes: sizes(qs), mascot: MASCOTS.adhoc,
      topics: [{ n: 1, title: t.title, art: t.emoji || "🧪", facts: facts.length ? facts : ["Let's practise " + t.title + "!"], story: "" }],
      questions: qs
    };
  }

  /* progress, per learner */
  var KEY = "acad_progress";
  function progress(getRaw) {
    var s = null; try { s = JSON.parse((getRaw || function (k) { return root.localStorage.getItem(k); })(KEY)); } catch (e) {}
    return s && typeof s === "object" ? s : {};
  }
  // After a finished round: mode "easy" | "medium" | "mixed", stars 1–3. Returns true when this round mastered the unit.
  function record(id, mode, stars) {
    var p = progress(), r = p[id] || { r: 0, best: 0, m: false };
    r.r++; r.t = Date.now();
    var newly = false;
    if (mode === "mixed") { r.best = Math.max(r.best || 0, stars || 0); if (stars >= 2 && !r.m) { r.m = true; newly = true; } }
    p[id] = r;
    try { root.localStorage.setItem(KEY, JSON.stringify(p)); } catch (e) {}
    return newly;
  }

  var AcademyLessons = { MASCOTS: MASCOTS, KEY: KEY, add: add, get: get, has: has, numbers: numbers, build: build, fromAdhoc: fromAdhoc,
                         progress: progress, record: record, files: files };
  root.AcademyLessons = AcademyLessons;
  if (typeof module !== "undefined" && module.exports) module.exports = AcademyLessons;
})(typeof window !== "undefined" ? window : globalThis);
