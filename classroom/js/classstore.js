/* ============================================================
   classstore.js — Class Corner's data, kept on this device
   ------------------------------------------------------------
   One localStorage key, cc_data. A teacher's real class roster
   (not the Hub's learners), behavior skills, and every point
   award as its own record, so totals, "today" and undo all come
   from the records. Nothing is ever deleted: students and skills
   are archived, and undo marks an award undone. An audit log
   records every change.

   Short keys on awards keep a busy year under the ~5 MB
   localStorage limit:  {i id, c class, s student, k skill,
   v value, t time, b batch, g group?, u undone?}

   Attendance (Phase 2): att[class][day][student] = one of
   STATUSES' codes. One record per student per day, so a busy
   year stays small; every change is audited.

   Portfolio (Phase 3): sub[] = {i, c, s, type, text, media?,
   t, st: pending|approved|sent_back, rt?, note?}. Pictures live
   in IndexedDB (media.js); a submission keeps only the id.

   Feed and notes (Phase 4): feed[] = {i, c, t, text, media?,
   w? (shared work), s? (its student), likes: {student|"teacher":
   time}, hid?}. notes[] = {i, c, s, t, kind, text, hid?} are the
   teacher's private notes, never shown in the Student space.
   Posts and notes are hidden, never deleted.
   ============================================================ */
(function (root) {
  "use strict";

  var KEY = "cc_data", VERSION = 1, MAX_VALUE = 10;
  var CRITTERS = ["🦊", "🐼", "🐸", "🐙", "🦁", "🐯", "🐨", "🐵", "🦄", "🐲", "🐢", "🦉", "🐝", "🐬",
                  "🦒", "🐧", "🦔", "🐞", "🐳", "🦋", "🐰", "🦜", "🐿️", "🦩"];
  var DEFAULT_SKILLS = [
    ["🤝", "Teamwork", "pos", 1], ["🙋", "Participating", "pos", 1], ["💪", "Working hard", "pos", 1],
    ["💛", "Kindness", "pos", 1], ["⭐", "Leadership", "pos", 1], ["🎯", "On task", "pos", 1],
    ["💭", "Off task", "neg", -1], ["🎒", "Unprepared", "neg", -1],
    ["🗣️", "Talking out of turn", "neg", -1], ["🙊", "Disrespect", "neg", -1]
  ];

  var STATUSES = [
    { code: "p", name: "Present", emoji: "✅" }, { code: "a", name: "Absent", emoji: "❌" },
    { code: "t", name: "Tardy", emoji: "⏰" }, { code: "l", name: "Left early", emoji: "🚪" }
  ];
  var data = null, store = root.localStorage;

  function uid(p) { return p + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
  function now() { return Date.now(); }
  // Local calendar day, "2026-10-30"
  function dayKey(t) {
    var d = new Date(t);
    return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2);
  }
  function clean(s, max) { return String(s == null ? "" : s).replace(/\s+/g, " ").trim().slice(0, max || 40); }

  function empty() { return { v: VERSION, classes: [], tx: [], audit: [], att: {}, sub: [], feed: [], notes: [] }; }
  function load() {
    if (data) return data;
    var raw = null;
    try { raw = store.getItem(KEY); } catch (e) {}
    if (!raw) { data = empty(); return data; }
    try {
      data = JSON.parse(raw);
      if (!data || !Array.isArray(data.classes)) throw new Error("bad shape");
      data.tx = data.tx || []; data.audit = data.audit || []; data.att = data.att || {}; data.sub = data.sub || [];
      data.feed = data.feed || []; data.notes = data.notes || [];
    } catch (e) {
      // Never throw away a teacher's records: park the unreadable copy, start fresh.
      try { store.setItem(KEY + "_unreadable_" + now(), raw); } catch (e2) {}
      data = empty();
    }
    return data;
  }
  // false when the device is out of room (the app then asks for a backup)
  function save() {
    try { store.setItem(KEY, JSON.stringify(data)); return true; } catch (e) { return false; }
  }
  function audit(action, detail) {
    load().audit.push({ t: now(), a: action, d: detail || {} });
  }

  /* ---------- classes ---------- */
  function classes(all) { return load().classes.filter(function (c) { return all || !c.archived; }); }
  function getClass(id) { return load().classes.filter(function (c) { return c.id === id; })[0] || null; }
  function addClass(name) {
    name = clean(name);
    if (!name) throw new Error("A class needs a name.");
    var c = { id: uid("c"), name: name, created: now(), students: [],
      skills: DEFAULT_SKILLS.map(function (s) { return { id: uid("k"), emoji: s[0], name: s[1], type: s[2], value: s[3] }; }) };
    load().classes.push(c); audit("class_add", { c: c.id, name: name }); save();
    return c;
  }
  function renameClass(id, name) {
    var c = need(id); name = clean(name);
    if (!name) throw new Error("A class needs a name.");
    audit("class_rename", { c: id, from: c.name, to: name }); c.name = name; save(); return c;
  }
  function archiveClass(id) { var c = need(id); c.archived = now(); audit("class_archive", { c: id }); save(); }
  function need(id) { var c = getClass(id); if (!c) throw new Error("That class is not on this device."); return c; }

  /* ---------- students ---------- */
  function students(classId, all) { return need(classId).students.filter(function (s) { return all || !s.archived; }); }
  function student(c, id) { return c.students.filter(function (s) { return s.id === id; })[0] || null; }
  // Adds each new name once (names already in the class are skipped). Returns the added students.
  function addStudents(classId, names) {
    var c = need(classId), have = {}, added = [];
    c.students.forEach(function (s) { if (!s.archived) have[s.name.toLowerCase()] = 1; });
    (names || []).forEach(function (n) {
      n = clean(n, 30);
      if (!n || have[n.toLowerCase()]) return;
      have[n.toLowerCase()] = 1;
      var s = { id: uid("s"), name: n, avatar: CRITTERS[c.students.length % CRITTERS.length], created: now() };
      c.students.push(s); added.push(s);
    });
    if (added.length) { audit("student_add", { c: classId, names: added.map(function (s) { return s.name; }) }); save(); }
    return added;
  }
  function updateStudent(classId, id, patch) {
    var c = need(classId), s = student(c, id);
    if (!s) throw new Error("That student is not in this class.");
    var name = patch.name != null ? clean(patch.name, 30) : s.name;
    if (!name) throw new Error("A student needs a name.");
    var was = { name: s.name, avatar: s.avatar };
    s.name = name; if (patch.avatar) s.avatar = String(patch.avatar).slice(0, 8);
    audit("student_edit", { c: classId, s: id, from: was, to: { name: s.name, avatar: s.avatar } }); save(); return s;
  }
  // Off the board; their points history stays.
  function archiveStudent(classId, id) {
    var c = need(classId), s = student(c, id);
    if (!s) throw new Error("That student is not in this class.");
    s.archived = now(); audit("student_archive", { c: classId, s: id, name: s.name }); save();
  }

  /* ---------- skills ---------- */
  function skills(classId, type, all) {
    return need(classId).skills.filter(function (k) { return (all || !k.archived) && (!type || k.type === type); });
  }
  function skill(c, id) { return c.skills.filter(function (k) { return k.id === id; })[0] || null; }
  // Positive skills give +1…+10, needs-work skills −1…−10.
  function checkValue(type, value) {
    value = Math.round(+value);
    if (!value || Math.abs(value) > MAX_VALUE) throw new Error("Points must be 1 to " + MAX_VALUE + ".");
    return type === "neg" ? -Math.abs(value) : Math.abs(value);
  }
  function addSkill(classId, k) {
    var c = need(classId), type = k.type === "neg" ? "neg" : "pos", name = clean(k.name, 30);
    if (!name) throw new Error("A skill needs a name.");
    var s = { id: uid("k"), emoji: clean(k.emoji, 8) || (type === "pos" ? "⭐" : "💭"), name: name, type: type, value: checkValue(type, k.value || 1) };
    c.skills.push(s); audit("skill_add", { c: classId, k: s.id, name: name, v: s.value }); save(); return s;
  }
  function updateSkill(classId, id, patch) {
    var c = need(classId), k = skill(c, id);
    if (!k) throw new Error("That skill is not in this class.");
    var was = { name: k.name, emoji: k.emoji, value: k.value };
    if (patch.name != null) { var n = clean(patch.name, 30); if (!n) throw new Error("A skill needs a name."); k.name = n; }
    if (patch.emoji) k.emoji = clean(patch.emoji, 8);
    if (patch.value != null) k.value = checkValue(k.type, patch.value);
    audit("skill_edit", { c: classId, k: id, from: was, to: { name: k.name, emoji: k.emoji, value: k.value } }); save(); return k;
  }
  // Off the award list; past awards keep its name.
  function archiveSkill(classId, id) {
    var c = need(classId), k = skill(c, id);
    if (!k) throw new Error("That skill is not in this class.");
    k.archived = now(); audit("skill_archive", { c: classId, k: id, name: k.name }); save();
  }

  /* ---------- awards ---------- */
  // Gives one skill's points to each student. Every id is checked first, so a bad
  // request stores nothing. Returns {batch, tx, saved}.
  function award(classId, studentIds, skillId, opts) {
    var c = need(classId), k = skill(c, skillId);
    if (!k || k.archived) throw new Error("That skill is not available in this class.");
    var ids = [];
    (studentIds || []).forEach(function (id) { if (ids.indexOf(id) < 0) ids.push(id); });
    if (!ids.length) throw new Error("Pick at least one student.");
    ids.forEach(function (id) { var s = student(c, id); if (!s || s.archived) throw new Error("A student is not in this class."); });
    var b = uid("b"), t = now(), group = ids.length > 1, tx = ids.map(function (id) {
      var r = { i: uid("t"), c: classId, s: id, k: k.id, v: k.value, t: t, b: b };
      if (group) r.g = 1;
      return r;
    });
    Array.prototype.push.apply(load().tx, tx);
    audit("award", { c: classId, b: b, k: k.id, skill: k.name, v: k.value, n: ids.length, whole: !!(opts && opts.whole) });
    return { batch: b, tx: tx, saved: save() };
  }
  // The newest award batch in a class that is not undone, or null.
  function lastBatch(classId) {
    var tx = load().tx;
    for (var i = tx.length - 1; i >= 0; i--) if (tx[i].c === classId && !tx[i].u) return tx[i].b;
    return null;
  }
  function undo(classId, batch) {
    var n = 0, k = null;
    load().tx.forEach(function (r) { if (r.c === classId && r.b === batch && !r.u) { r.u = now(); n++; k = r.k; } });
    if (n) { audit("undo", { c: classId, b: batch, k: k, n: n }); save(); }
    return n;
  }
  function live(classId) { return load().tx.filter(function (r) { return r.c === classId && !r.u; }); }
  function totals(classId) {
    var out = {};
    live(classId).forEach(function (r) { out[r.s] = (out[r.s] || 0) + r.v; });
    return out;
  }
  // Today's numbers for the summary bar.
  function summary(classId, t) {
    var day = dayKey(t || now()), plus = 0, minus = 0, got = {};
    live(classId).forEach(function (r) {
      if (dayKey(r.t) !== day) return;
      if (r.v > 0) plus += r.v; else minus += r.v;
      got[r.s] = 1;
    });
    var roster = students(classId), active = roster.filter(function (s) { return got[s.id]; }).length;
    return { plus: plus, minus: minus, active: active, none: roster.length - active, roster: roster.length };
  }
  function auditLog(classId, limit) {
    var a = load().audit.filter(function (e) { return !classId || e.d.c === classId; });
    return a.slice(-(limit || 100)).reverse();
  }

  /* ---------- attendance ---------- */
  var DAY = /^\d{4}-\d{2}-\d{2}$/;
  function checkDay(day) {
    if (!DAY.test(day || "")) throw new Error("Pick a date.");
    if (day > dayKey(now())) throw new Error("Attendance can't be taken for a future day.");
    return day;
  }
  // {studentId: code} for one day (a copy)
  function attendance(classId, day) {
    need(classId); var a = (load().att[classId] || {})[checkDay(day)] || {}, out = {};
    for (var k in a) out[k] = a[k];
    return out;
  }
  // status: a STATUSES code, or "" to clear the mark
  function setAttendance(classId, day, studentId, status) {
    var c = need(classId), s = student(c, studentId);
    checkDay(day);
    if (!s || s.archived) throw new Error("That student is not in this class.");
    if (status && !STATUSES.some(function (x) { return x.code === status; })) throw new Error("Unknown attendance mark.");
    var att = load().att, cls = att[classId] = att[classId] || {}, d = cls[day] = cls[day] || {}, was = d[studentId] || "";
    if (was === status) return { saved: true, changed: false };
    if (status) d[studentId] = status; else delete d[studentId];
    audit("attendance", { c: classId, day: day, s: studentId, name: s.name, from: was, to: status || "" });
    return { saved: save(), changed: true };
  }
  // Marks every unmarked student present. Returns how many were marked.
  function markRestPresent(classId, day) {
    var have = attendance(classId, day), n = 0;
    var att = load().att, cls = att[classId] = att[classId] || {}, d = cls[day] = cls[day] || {};
    students(classId).forEach(function (s) { if (!have[s.id]) { d[s.id] = "p"; n++; } });
    if (n) { audit("attendance_rest", { c: classId, day: day, n: n }); save(); }
    return n;
  }
  // Counts for one day: {p, a, t, l, none, roster}
  function attendanceSummary(classId, day) {
    var a = attendance(classId, day), out = { p: 0, a: 0, t: 0, l: 0, none: 0 }, roster = students(classId);
    roster.forEach(function (s) { if (a[s.id]) out[a[s.id]]++; else out.none++; });
    out.roster = roster.length; return out;
  }
  // Days with any marks, newest first: [{day, p, a, t, l}]
  function attendanceDays(classId, limit) {
    var cls = load().att[classId] || {};
    return Object.keys(cls).sort().reverse().slice(0, limit || 14).map(function (day) {
      var o = { day: day, p: 0, a: 0, t: 0, l: 0 };
      for (var k in cls[day]) o[cls[day][k]]++;
      return o;
    }).filter(function (o) { return o.p + o.a + o.t + o.l; });
  }
  // Who is in the room for the picker and groups: everyone, unless attendance was taken
  // that day, then only present or tardy students.
  function inRoom(classId, day) {
    var a = attendance(classId, day || dayKey(now())), taken = false;
    for (var k in a) { taken = true; break; }
    return students(classId).filter(function (s) { return !taken || a[s.id] === "p" || a[s.id] === "t"; });
  }

  /* ---------- portfolio ---------- */
  var WORK = { journal: "Journal", drawing: "Drawing", photo: "Photo" }, MAX_TEXT = 2000, MAX_NOTE = 300;
  // A student hands in work: a journal entry (text), or a drawing/photo (a media id, optional caption).
  function submit(classId, studentId, w) {
    var c = need(classId), s = student(c, studentId);
    if (!s || s.archived) throw new Error("That student is not in this class.");
    w = w || {};
    if (!WORK[w.type]) throw new Error("Unknown kind of work.");
    var text = String(w.text == null ? "" : w.text).trim(), media = w.media ? String(w.media) : "";
    if (w.type === "journal" && !text) throw new Error("Write something first.");
    if (w.type !== "journal" && !media) throw new Error(w.type === "photo" ? "Choose a photo first." : "Draw something first.");
    if (text.length > (w.type === "journal" ? MAX_TEXT : MAX_NOTE)) throw new Error("That is too long.");
    var r = { i: uid("w"), c: classId, s: studentId, type: w.type, text: text, t: now(), st: "pending" };
    if (media && w.type !== "journal") r.media = media;
    load().sub.push(r);
    audit("submit", { c: classId, w: r.i, s: studentId, name: s.name, type: r.type });
    return { item: r, saved: save() };
  }
  // The teacher approves, or sends back with a note saying what to fix. Only pending work.
  function review(classId, workId, action, note) {
    need(classId);
    var r = load().sub.filter(function (x) { return x.i === workId && x.c === classId; })[0];
    if (!r) throw new Error("That work is not in this class.");
    if (r.st !== "pending") throw new Error("That work was already reviewed.");
    if (action !== "approve" && action !== "send_back") throw new Error("Approve or send back.");
    note = String(note == null ? "" : note).trim();
    if (action === "send_back" && !note) throw new Error("Say what to fix before sending it back.");
    if (note.length > MAX_NOTE) throw new Error("That note is too long.");
    r.st = action === "approve" ? "approved" : "sent_back"; r.rt = now();
    if (note) r.note = note; else delete r.note;
    audit(action === "approve" ? "work_approve" : "work_send_back", { c: classId, w: workId, s: r.s, type: r.type, note: note });
    return { item: r, saved: save() };
  }
  // Newest first. f: {st, s} filters by status and student.
  function work(classId, f) {
    need(classId); f = f || {};
    return load().sub.filter(function (r) { return r.c === classId && (!f.st || r.st === f.st) && (!f.s || r.s === f.s); })
      .sort(function (a, b) { return b.t - a.t; });
  }
  function pendingCount(classId) { return work(classId, { st: "pending" }).length; }

  /* ---------- class feed ---------- */
  var MAX_POST = 1000, TEACHER = "teacher";
  function findPost(classId, postId) {
    need(classId);
    var p = load().feed.filter(function (x) { return x.i === postId && x.c === classId; })[0];
    if (!p) throw new Error("That post is not in this class.");
    return p;
  }
  // The teacher posts a class update: words, a picture (media id), or both.
  function post(classId, p) {
    need(classId); p = p || {};
    var text = String(p.text == null ? "" : p.text).trim(), media = p.media ? String(p.media) : "";
    if (!text && !media) throw new Error("Write something or add a photo.");
    if (text.length > MAX_POST) throw new Error("That post is too long.");
    var r = { i: uid("f"), c: classId, t: now(), text: text, likes: {} };
    if (media) r.media = media;
    load().feed.push(r);
    audit("post_add", { c: classId, f: r.i, photo: !!media });
    return { item: r, saved: save() };
  }
  // Approved work goes into the feed with its student's name. Once per piece while the post is showing.
  function shareWork(classId, workId, caption) {
    var c = need(classId), w = load().sub.filter(function (x) { return x.i === workId && x.c === classId; })[0];
    if (!w) throw new Error("That work is not in this class.");
    if (w.st !== "approved") throw new Error("Only approved work can go in the feed.");
    if (sharedPost(classId, workId)) throw new Error("That work is already in the feed.");
    caption = String(caption == null ? "" : caption).trim();
    if (caption.length > MAX_NOTE) throw new Error("That caption is too long.");
    var s = student(c, w.s) || {};
    var r = { i: uid("f"), c: classId, t: now(), text: caption, w: w.i, s: w.s, likes: {} };
    if (w.media) r.media = w.media;
    load().feed.push(r);
    audit("post_share", { c: classId, f: r.i, w: w.i, s: w.s, name: s.name, type: w.type });
    return { item: r, saved: save() };
  }
  function sharedPost(classId, workId) {
    return load().feed.filter(function (x) { return x.c === classId && x.w === workId && !x.hid; })[0] || null;
  }
  function hidePost(classId, postId) {
    var p = findPost(classId, postId);
    if (p.hid) return { item: p, saved: true };
    p.hid = now();
    audit("post_hide", { c: classId, f: postId });
    return { item: p, saved: save() };
  }
  // A student (or "teacher") taps the heart: on, or off again. Returns whether it is now liked.
  function like(classId, postId, who) {
    var c = need(classId), p = findPost(classId, postId);
    if (p.hid) throw new Error("That post was taken down.");
    if (who !== TEACHER) { var s = student(c, who); if (!s || s.archived) throw new Error("That student is not in this class."); }
    var on = !p.likes[who];
    if (on) p.likes[who] = now(); else delete p.likes[who];
    audit(on ? "like" : "unlike", { c: classId, f: postId, who: who });
    return { liked: on, saved: save() };
  }
  // Newest first; hidden posts only with all = true.
  function feed(classId, all) {
    need(classId);
    return load().feed.filter(function (p) { return p.c === classId && (all || !p.hid); })
      .sort(function (a, b) { return b.t - a.t; });
  }

  /* ---------- teacher's notes about a student (private) ---------- */
  var NOTE_KINDS = [
    { code: "praise", name: "Praise", emoji: "👍" }, { code: "concern", name: "Concern", emoji: "⚠️" },
    { code: "family", name: "Family contact", emoji: "🏠" }, { code: "other", name: "Other", emoji: "📝" }
  ], MAX_NOTE_TEXT = 1000;
  function addNote(classId, studentId, kind, text) {
    var c = need(classId), s = student(c, studentId);
    if (!s) throw new Error("That student is not in this class.");
    if (!NOTE_KINDS.some(function (k) { return k.code === kind; })) throw new Error("Pick what kind of note.");
    text = String(text == null ? "" : text).trim();
    if (!text) throw new Error("Write the note first.");
    if (text.length > MAX_NOTE_TEXT) throw new Error("That note is too long.");
    var r = { i: uid("n"), c: classId, s: studentId, t: now(), kind: kind, text: text };
    load().notes.push(r);
    audit("note_add", { c: classId, n: r.i, s: studentId, name: s.name, kind: kind });
    return { item: r, saved: save() };
  }
  function hideNote(classId, noteId) {
    need(classId);
    var r = load().notes.filter(function (x) { return x.i === noteId && x.c === classId; })[0];
    if (!r) throw new Error("That note is not in this class.");
    if (!r.hid) { r.hid = now(); audit("note_hide", { c: classId, n: noteId, s: r.s }); }
    return { item: r, saved: save() };
  }
  // Newest first. f: {s, kind}
  function notes(classId, f) {
    need(classId); f = f || {};
    return load().notes.filter(function (r) { return r.c === classId && !r.hid && (!f.s || r.s === f.s) && (!f.kind || r.kind === f.kind); })
      .sort(function (a, b) { return b.t - a.t; });
  }

  var ClassStore = {
    KEY: KEY, CRITTERS: CRITTERS, MAX_VALUE: MAX_VALUE, dayKey: dayKey,
    classes: classes, getClass: getClass, addClass: addClass, renameClass: renameClass, archiveClass: archiveClass,
    students: students, addStudents: addStudents, updateStudent: updateStudent, archiveStudent: archiveStudent,
    skills: skills, addSkill: addSkill, updateSkill: updateSkill, archiveSkill: archiveSkill,
    WORK: WORK, MAX_TEXT: MAX_TEXT, MAX_NOTE: MAX_NOTE, submit: submit, review: review, work: work, pendingCount: pendingCount,
    MAX_POST: MAX_POST, TEACHER: TEACHER, post: post, shareWork: shareWork, sharedPost: sharedPost, hidePost: hidePost, like: like, feed: feed,
    NOTE_KINDS: NOTE_KINDS, MAX_NOTE_TEXT: MAX_NOTE_TEXT, addNote: addNote, hideNote: hideNote, notes: notes,
    STATUSES: STATUSES, attendance: attendance, setAttendance: setAttendance, markRestPresent: markRestPresent,
    attendanceSummary: attendanceSummary, attendanceDays: attendanceDays, inRoom: inRoom,
    award: award, lastBatch: lastBatch, undo: undo, totals: totals, summary: summary, auditLog: auditLog,
    exportJSON: function () { return JSON.stringify(load(), null, 1); },
    reload: function () { data = null; return load(); },
    save: save
  };
  root.ClassStore = ClassStore;
  if (typeof module !== "undefined" && module.exports) module.exports = ClassStore;
})(typeof window !== "undefined" ? window : globalThis);
