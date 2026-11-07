/* ============================================================
   spellbee-store.js — SpellStore: grown-ups' own Spelling Bee word sets
   ------------------------------------------------------------
   One localStorage key, hub_spellbee (hub_* keys are shared by every
   learner; profile-store.js passes them through, Admin backups keep
   them). A set is
     {id, title, emoji, grades: [] (none = every grade), on,
      words: [{w, d?: meaning, s?: sentence, alt?: other spelling}],
      t, hid?}
   Removing a set hides it (hid), so it can be brought back.
   Admin → 🐝 Spelling Bee edits them; spellingbee/ plays them as
   practice tests (Hear & Spell test, Bee Contest, Learn cards).
   Words are typed one per line:  word | meaning | sentence
   ============================================================ */
(function (root) {
  "use strict";
  var KEY = "hub_spellbee", GRADES = ["pk", "kg", "g1", "g2", "g3", "g4", "g5"];
  var MAX = { title: 60, word: 40, def: 160, sent: 200, words: 150 };

  function store() { return root.localStorage; }
  function load() {
    var d = null; try { d = JSON.parse(store().getItem(KEY)); } catch (e) {}
    if (!d || !Array.isArray(d.sets)) d = { v: 1, sets: [] };
    return d;
  }
  function write(d) { try { store().setItem(KEY, JSON.stringify(d)); return true; } catch (e) { return false; } }
  function uid() { return "s" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function str(v) { return String(v == null ? "" : v).replace(/\s+/g, " ").trim(); }
  // Letters (any alphabet, accents ok), plus space, hyphen and apostrophe inside a word.
  var WORD_RE = /^[\p{L}][\p{L}' \-’.]*[\p{L}.]$|^[\p{L}]$/u;

  function list(all) { return load().sets.filter(function (t) { return all || !t.hid; }); }
  function get(id) { return load().sets.filter(function (t) { return t.id === id; })[0] || null; }
  function visible(t) { return !!t && t.on !== false && !t.hid; }
  function forGrade(grade) {
    return list().filter(function (t) { return visible(t) && (!grade || !t.grades || !t.grades.length || t.grades.indexOf(grade) >= 0); });
  }

  // "word | meaning | sentence" lines → word objects (or an error string).
  function parseLines(text) {
    var out = [], lines = String(text || "").split(/\r?\n/);
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].trim(); if (!line) continue;
      var p = line.split("|").map(str), w = p[0], alt = "";
      var m = /^(.*?)\s*\((?:or|also)\s+([^)]+)\)$/i.exec(w);        // "color (or colour)"
      if (m) { w = str(m[1]); alt = str(m[2]); }
      out.push({ w: w, d: p[1] || "", s: p.slice(2).join(" | "), alt: alt, line: i + 1 });
    }
    return out;
  }
  function toLines(words) {
    return (words || []).map(function (x) {
      return x.w + (x.alt ? " (or " + x.alt + ")" : "") + (x.d || x.s ? " | " + (x.d || "") : "") + (x.s ? " | " + x.s : "");
    }).join("\n");
  }

  // A clean copy of a set, or an error message (string) saying what to fix.
  function check(t) {
    t = t || {};
    var out = { id: t.id || uid(), title: str(t.title), emoji: str(t.emoji).slice(0, 8) || "🐝", on: t.on !== false,
                grades: (t.grades || []).filter(function (g) { return GRADES.indexOf(g) >= 0; }), words: [] };
    if (!out.title) return "Give the word set a title.";
    if (out.title.length > MAX.title) return "The title is too long.";
    var ws = Array.isArray(t.words) ? t.words : parseLines(t.text);
    if (ws.length < 2) return "Add at least 2 words.";
    if (ws.length > MAX.words) return "Use " + MAX.words + " words or fewer in one set.";
    var seen = {};
    for (var i = 0; i < ws.length; i++) {
      var x = ws[i], n = "Word " + (x.line || i + 1) + ": ", w = str(x.w), alt = str(x.alt), d = str(x.d), s = str(x.s);
      if (!w) return n + "write the word first.";
      if (w.length > MAX.word || alt.length > MAX.word) return n + "\"" + w + "\" is too long.";
      if (!WORD_RE.test(w) || (alt && !WORD_RE.test(alt))) return n + "\"" + w + "\" can only use letters, spaces, hyphens and apostrophes.";
      if (d.length > MAX.def) return n + "the meaning is too long.";
      if (s.length > MAX.sent) return n + "the sentence is too long.";
      var k = w.toLowerCase();
      if (seen[k]) return n + "\"" + w + "\" is in the list twice.";
      seen[k] = 1;
      var o = { w: w }; if (d) o.d = d; if (s) o.s = s; if (alt) o.alt = alt;
      out.words.push(o);
    }
    return out;
  }
  // Insert or update. Returns {set} or {error}.
  function save(t) {
    var c = check(t);
    if (typeof c === "string") return { error: c };
    var d = load(), i = -1;
    d.sets.forEach(function (x, k) { if (x.id === c.id) i = k; });
    c.t = Date.now();
    if (i >= 0) { c.hid = d.sets[i].hid; d.sets[i] = c; } else d.sets.push(c);
    return write(d) ? { set: c } : { error: "This device is out of room." };
  }
  function patch(id, fields) {
    var d = load(), t = d.sets.filter(function (x) { return x.id === id; })[0];
    if (!t) return false;
    Object.keys(fields).forEach(function (k) { if (fields[k] === undefined) delete t[k]; else t[k] = fields[k]; });
    return write(d);
  }
  function setOn(id, on) { return patch(id, { on: !!on }); }
  function remove(id) { return patch(id, { hid: Date.now() }); }
  function restore(id) { return patch(id, { hid: undefined }); }

  // Sets from a file another grown-up exported: added alongside, never replacing.
  function exportJSON() { return JSON.stringify({ kind: "spellbee-sets", v: 1, sets: list() }, null, 1); }
  function importJSON(text) {
    var o; try { o = JSON.parse(text); } catch (e) { return { error: "That file is not readable." }; }
    var ts = o && o.kind === "spellbee-sets" && Array.isArray(o.sets) ? o.sets : null;
    if (!ts) return { error: "That is not a Spelling Bee word-set file." };
    var added = 0, skipped = 0, have = list(true).map(function (t) { return t.id; });
    ts.forEach(function (t) {
      var c = check(Object.assign({}, t, { id: have.indexOf(t.id) >= 0 ? null : t.id }));
      if (typeof c === "string") { skipped++; return; }
      var r = save(c); if (r.set) added++; else skipped++;
    });
    return { added: added, skipped: skipped };
  }

  var SpellStore = { KEY: KEY, GRADES: GRADES, MAX: MAX, list: list, get: get, visible: visible, forGrade: forGrade, check: check,
                     parseLines: parseLines, toLines: toLines, save: save, setOn: setOn, remove: remove, restore: restore,
                     exportJSON: exportJSON, importJSON: importJSON };
  root.SpellStore = SpellStore;
  if (typeof module !== "undefined" && module.exports) module.exports = SpellStore;
})(typeof window !== "undefined" ? window : globalThis);
