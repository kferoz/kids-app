/* ============================================================
   adhoc.js — AdhocStore: the grown-ups' own AdHoc topics
   ------------------------------------------------------------
   One localStorage key, hub_adhoc (hub_* keys are shared by every
   learner; profile-store.js passes them through). A topic is
     {id, title, emoji, grades: [] (none = every grade), on, notes
      (Learn card lines), questions: [{type: "mc", prompt,
      choices[2–4], answer: index, explain?} | {type: "tf", prompt,
      answer: true|false, explain?}], t, hid?}
   Removing a topic hides it (hid), so it can be brought back.
   Kids see a topic only while Admin's AdHoc switch (HubSettings
   adhoc.enabled) is on AND the topic is on. Admin → 🎓 Academy
   edits them; academy/lesson.html#adhoc=<id> plays one.
   ============================================================ */
(function (root) {
  "use strict";
  var KEY = "hub_adhoc", GRADES = ["pk", "kg", "g1", "g2", "g3", "g4", "g5"];
  var MAX = { title: 60, notes: 1500, prompt: 200, choice: 80, explain: 200, questions: 40 };

  function store() { return root.localStorage; }
  function load() {
    var d = null; try { d = JSON.parse(store().getItem(KEY)); } catch (e) {}
    if (!d || !Array.isArray(d.topics)) d = { v: 1, topics: [] };
    return d;
  }
  function write(d) { try { store().setItem(KEY, JSON.stringify(d)); return true; } catch (e) { return false; } }
  function uid() { return "t" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function str(v) { return String(v == null ? "" : v).trim(); }

  function list(all) { return load().topics.filter(function (t) { return all || !t.hid; }); }
  function get(id) { return load().topics.filter(function (t) { return t.id === id; })[0] || null; }
  function switchedOn() { return !!(root.HubSettings && root.HubSettings.get().adhoc.enabled); }
  function visible(t) { return !!t && switchedOn() && t.on !== false && !t.hid; }
  function forGrade(grade) {
    return list().filter(function (t) { return visible(t) && (!t.grades || !t.grades.length || t.grades.indexOf(grade) >= 0); });
  }

  // A clean copy of a topic, or an error message (string) saying what to fix.
  function check(t) {
    t = t || {};
    var out = { id: t.id || uid(), title: str(t.title), emoji: str(t.emoji).slice(0, 8) || "🧪", on: t.on !== false,
                grades: (t.grades || []).filter(function (g) { return GRADES.indexOf(g) >= 0; }), notes: str(t.notes), questions: [] };
    if (!out.title) return "Give the topic a title.";
    if (out.title.length > MAX.title) return "The title is too long.";
    if (out.notes.length > MAX.notes) return "The notes are too long.";
    var qs = t.questions || [];
    if (qs.length < 2) return "Add at least 2 questions.";
    if (qs.length > MAX.questions) return "Use " + MAX.questions + " questions or fewer.";
    for (var i = 0; i < qs.length; i++) {
      var q = qs[i], n = "Question " + (i + 1) + ": ", p = str(q.prompt), ex = str(q.explain);
      if (!p) return n + "write the question.";
      if (p.length > MAX.prompt || ex.length > MAX.explain) return n + "it is too long.";
      if (q.type === "tf") { out.questions.push({ type: "tf", prompt: p, answer: !!q.answer, explain: ex }); continue; }
      if (q.type !== "mc") return n + "unknown kind.";
      var ch = (q.choices || []).map(str).filter(Boolean);
      if (ch.length < 2 || ch.length > 4) return n + "give 2 to 4 answers.";
      if (ch.some(function (c) { return c.length > MAX.choice; })) return n + "an answer is too long.";
      if (ch.some(function (c, k) { return ch.indexOf(c) !== k; })) return n + "two answers are the same.";
      var a = +q.answer;
      if (!(a >= 0 && a < ch.length)) return n + "pick the right answer.";
      out.questions.push({ type: "mc", prompt: p, choices: ch, answer: a, explain: ex });
    }
    return out;
  }
  // Insert or update. Returns {topic} or {error}.
  function save(t) {
    var c = check(t);
    if (typeof c === "string") return { error: c };
    var d = load(), i = -1;
    d.topics.forEach(function (x, k) { if (x.id === c.id) i = k; });
    c.t = Date.now();
    if (i >= 0) { c.hid = d.topics[i].hid; d.topics[i] = c; } else d.topics.push(c);
    return write(d) ? { topic: c } : { error: "This device is out of room." };
  }
  function patch(id, fields) {
    var d = load(), t = d.topics.filter(function (x) { return x.id === id; })[0];
    if (!t) return false;
    Object.keys(fields).forEach(function (k) { if (fields[k] === undefined) delete t[k]; else t[k] = fields[k]; });
    return write(d);
  }
  function setOn(id, on) { return patch(id, { on: !!on }); }
  function remove(id) { return patch(id, { hid: Date.now() }); }
  function restore(id) { return patch(id, { hid: undefined }); }

  // Topics from a file another grown-up exported: added alongside, never replacing.
  function exportJSON() { return JSON.stringify({ kind: "adhoc-topics", v: 1, topics: list() }, null, 1); }
  function importJSON(text) {
    var o; try { o = JSON.parse(text); } catch (e) { return { error: "That file is not readable." }; }
    var ts = o && o.kind === "adhoc-topics" && Array.isArray(o.topics) ? o.topics : null;
    if (!ts) return { error: "That is not an AdHoc topics file." };
    var added = 0, skipped = 0, have = list(true).map(function (t) { return t.id; });
    ts.forEach(function (t) {
      var c = check(Object.assign({}, t, { id: have.indexOf(t.id) >= 0 ? null : t.id }));
      if (typeof c === "string") { skipped++; return; }
      var r = save(c); if (r.topic) added++; else skipped++;
    });
    return { added: added, skipped: skipped };
  }

  var AdhocStore = { KEY: KEY, GRADES: GRADES, MAX: MAX, list: list, get: get, visible: visible, forGrade: forGrade, check: check,
                     save: save, setOn: setOn, remove: remove, restore: restore, exportJSON: exportJSON, importJSON: importJSON };
  root.AdhocStore = AdhocStore;
  if (typeof module !== "undefined" && module.exports) module.exports = AdhocStore;
})(typeof window !== "undefined" ? window : globalThis);
