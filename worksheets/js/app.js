/* ============================================================
   Printable Worksheets — app
   ------------------------------------------------------------
   Library (grade × subject) → one printable sheet → Print / Save
   as PDF (browser print; the Android app uses AndroidBridge.printPage,
   which opens the system print dialog with "Save as PDF").

   Sheets come from content the hub already has, so every sheet
   matches the Academy syllabus (US Common Core / NGSS / C3 spine,
   UK National Curriculum, Sweden Lgr22 — js/syllabus.js):
     #u=<unitId>      unit worksheet from academy/lessons/<g>-<s>.js
     #book=<g>-<s>    whole subject workbook (every unit)
     #d=<drillId>     math drill, new numbers per version (drills.js)
     #sp=<g1..g5>&p=  spelling list part (spellingbee/js/words.js)
     #sps=<setId>     a grown-up's Spelling Bee word set
     #ah=<topicId>    a grown-up's AdHoc topic (Admin → 🎓 Academy)
     #hw=<n>          handwriting letters (Pre-K – Grade 1)
   &v=<n> = version: shuffles choices / makes new numbers; the
   answer key always matches. &nokey=1 leaves the key page out.

   Saved per learner: ws_log [{id, title, t, score?, total?}].
   ============================================================ */
(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var view = $("view");
  var Y = window.Syllabus, AL = window.AcademyLessons, DR = window.WS_DRILLS;
  var GRADES = [
    { id: "pk", short: "Pre-K" }, { id: "kg", short: "Kindergarten" }, { id: "g1", short: "Grade 1" }, { id: "g2", short: "Grade 2" },
    { id: "g3", short: "Grade 3" }, { id: "g4", short: "Grade 4" }, { id: "g5", short: "Grade 5" }
  ];
  var YOUNG = { pk: 1, kg: 1 };
  var HW = ["Aa Bb Cc Dd", "Ee Ff Gg Hh", "Ii Jj Kk Ll", "Mm Nn Oo Pp", "Qq Rr Ss Tt", "Uu Vv Ww Xx", "Yy Zz"];
  var HW_GRADES = { pk: 1, kg: 1, g1: 1 };
  var SPELL_GRADES = { g1: 1, g2: 1, g3: 1, g4: 1, g5: 1 };

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function gradeShort(g) { for (var i = 0; i < GRADES.length; i++) if (GRADES[i].id === g) return GRADES[i].short; return g; }
  function subj(id) { return Y.SUBJECTS.filter(function (s) { return s.id === id; })[0] || Y.SUBJECTS[0]; }
  function kidGrade() {
    try {
      var id = localStorage.getItem("hub_activeKid"), kids = JSON.parse(localStorage.getItem("hub_kids") || "[]");
      for (var i = 0; i < kids.length; i++) if (kids[i].id === id && kids[i].grade) return kids[i].grade;
    } catch (e) {}
    return "kg";
  }
  function parseHash() {
    var o = {}; location.hash.replace(/^#/, "").split("&").forEach(function (p) { if (!p) return; var kv = p.split("="); o[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1] || ""); });
    return o;
  }
  function hashOf(o) { return "#" + Object.keys(o).filter(function (k) { return o[k] != null && o[k] !== ""; }).map(function (k) { return k + "=" + encodeURIComponent(o[k]); }).join("&"); }
  var toastT = null;
  function toast(m) { var t = $("toast"); t.textContent = m; t.classList.add("show"); clearTimeout(toastT); toastT = setTimeout(function () { t.classList.remove("show"); }, 2600); }
  function load(k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } }
  function store(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }

  // load a script once (lesson files, spelling words)
  var loaded = {};
  function need(src, cb) {
    if (loaded[src] === true) return cb(true);
    if (loaded[src]) { loaded[src].push(cb); return; }
    loaded[src] = [cb];
    var s = document.createElement("script");
    s.src = src;
    s.onload = function () { var q = loaded[src]; loaded[src] = true; q.forEach(function (f) { f(true); }); };
    s.onerror = function () { var q = loaded[src]; loaded[src] = false; delete loaded[src]; q.forEach(function (f) { f(false); }); };
    document.head.appendChild(s);
  }
  function needLessons(key, cb) { need("../academy/lessons/" + key + ".js", cb); }
  function needWords(cb) { need("../spellingbee/js/words.js", cb); }

  /* ============================================================
     LIBRARY
     ============================================================ */
  function renderLibrary(h) {
    var g = h.g || kidGrade(), s = h.s || "math", isExtra = s === "extra";
    $("topTitle").textContent = "📄 Printable Worksheets";
    var extras = extraSheets(g);
    var html = '<section class="intro"><p><b>Print and practise!</b> Every worksheet follows the Academy syllabus (US Common Core, UK National Curriculum and Sweden\'s Lgr22) and comes with an <b>answer key</b>. ' +
      'Tap a worksheet, then <b>🖨️ Print / Save PDF</b>. Choose "Save as PDF" to download it.</p></section>' +
      '<nav class="chips" aria-label="Grade">' + GRADES.map(function (x) {
        return '<a class="chip' + (x.id === g ? " on" : "") + '" href="' + hashOf({ g: x.id, s: s }) + '">' + esc(x.short) + "</a>";
      }).join("") + "</nav>" +
      '<nav class="tabs" aria-label="Subject">' + Y.SUBJECTS.map(function (x) {
        return '<a class="tab' + (x.id === s ? " on" : "") + '" style="--sc:' + x.color + '" href="' + hashOf({ g: g, s: x.id }) + '">' + x.emoji + " " + esc(x.name) + "</a>";
      }).join("") + (extras.length ? '<a class="tab' + (isExtra ? " on" : "") + '" style="--sc:#868e96" href="' + hashOf({ g: g, s: "extra" }) + '">🧪 From your grown-up</a>' : "") + "</nav>";

    if (isExtra) {
      html += section("🧪 From your grown-up", "Practice tests and word lists made in Admin.", extras.map(card).join(""));
      view.innerHTML = html; return;
    }
    var S = subj(s), units = Y.units(g, s);
    if (s === "math") {
      html += section("🧮 Math drills", "New numbers every time: tap 🔀 New numbers for another sheet. Great for fact fluency.",
        DR.forGrade(g).map(function (d) {
          return card({ href: hashOf({ d: d.id, v: 1 }), emoji: d.emoji, title: d.title, meta: d.n + " problems · " + d.std });
        }).join(""));
    }
    if (s === "english") {
      if (SPELL_GRADES[g]) {
        var cards = [];
        for (var p = 1; p <= 5; p++) cards.push(card({ href: hashOf({ sp: g, p: p, v: 1 }), emoji: "🐝", title: "Spelling words " + ((p - 1) * 10 + 1) + "–" + p * 10, meta: "School Spelling Bee list 2026–27 · " + gradeShort(g) }));
        html += section("🐝 Spelling practice", "Look, say, cover, write, check; fill the sentence; unscramble.", cards.join(""));
      }
      if (HW_GRADES[g]) {
        html += section("✏️ Handwriting", "Trace the gray letters, then write your own.", HW.map(function (grp, i) {
          return card({ href: hashOf({ hw: i, g: g }), emoji: "✏️", title: "Letters " + grp.split(" ")[0] + "–" + grp.split(" ").slice(-1)[0], meta: "Letter formation · " + (g === "pk" ? "ELOF / EYFS" : g === "kg" ? "K.L.1a" : "1.L.1a") });
        }).join(""));
      }
    }
    html += section(S.emoji + " " + esc(S.name) + " unit worksheets", "One worksheet per Academy unit: key ideas, practice questions, a think-and-write task and an answer key.",
      units.map(function (u) {
        return card({ href: hashOf({ u: u.id, v: 1 }), emoji: u.emoji, title: "Unit " + u.n + ": " + u.title, meta: shortStd(u.us) });
      }).join("") +
      (units.length ? card({ href: hashOf({ book: g + "-" + s }), emoji: "📚", title: "Whole " + S.name + " workbook", meta: "All " + units.length + " units in one print, keys at the back", wide: true }) : ""));
    if (!units.length) html += '<p class="muted">No units for this grade yet.</p>';
    view.innerHTML = html;
  }
  function shortStd(us) { us = String(us || ""); return us.length > 70 ? us.slice(0, 68) + "…" : us; }
  function section(title, sub, inner) {
    return '<section class="lib-sec"><h2>' + title + "</h2>" + (sub ? '<p class="muted">' + sub + "</p>" : "") + '<div class="cards">' + inner + "</div></section>";
  }
  function card(c) {
    return '<a class="ws-card' + (c.wide ? " wide" : "") + '" href="' + c.href + '"><span class="ws-emoji">' + c.emoji + '</span><span class="ws-txt"><b>' + esc(c.title) + "</b><small>" + esc(c.meta || "") + '</small></span><span class="ws-go">📄</span></a>';
  }
  // AdHoc topics + Spelling Bee word sets a grown-up made, for this grade
  function extraSheets(g) {
    var out = [];
    if (window.AdhocStore) AdhocStore.forGrade(g).forEach(function (t) {
      out.push({ href: hashOf({ ah: t.id, v: 1 }), emoji: t.emoji || "🧪", title: t.title, meta: t.questions.length + " questions · practice test" });
    });
    if (window.SpellStore) SpellStore.forGrade(g).forEach(function (t) {
      out.push({ href: hashOf({ sps: t.id, v: 1 }), emoji: t.emoji || "🐝", title: t.title, meta: t.words.length + " spelling words" });
    });
    return out;
  }

  /* ============================================================
     SHEET PARTS
     ============================================================ */
  function head(o) {
    return '<header class="ws-head">' +
      '<div class="ws-brand">' + esc(o.brand || "Kids Learning Hub") + " · " + esc(o.grade) + (o.subject ? " · " + esc(o.subject) : "") + "</div>" +
      '<div class="ws-name"><span>Name: <i class="line"></i></span><span>Date: <i class="line short"></i></span>' + (o.score ? "<span>Score: <i class=\"line tiny\"></i> / " + o.score + "</span>" : "") + "</div>" +
      '<h1 class="ws-title"><span>' + o.emoji + "</span> " + esc(o.title) + "</h1>" +
      (o.std ? '<p class="ws-std">' + o.std + "</p>" : "") +
      (o.how ? '<p class="ws-how">' + o.how + "</p>" : "") + "</header>";
  }
  function foot(label, v) { return '<footer class="ws-foot"><span>' + esc(label) + "</span><span>" + (v ? "Version " + v + " · " : "") + "Kids Learning Hub</span></footer>"; }
  function paper(inner, cls) { return '<article class="paper' + (cls ? " " + cls : "") + '">' + inner + "</article>"; }
  function keyPage(title, items, v) {
    return paper('<header class="ws-head"><div class="ws-brand">Answer key · for grown-ups</div><h1 class="ws-title"><span>🔑</span> ' + esc(title) + "</h1></header>" +
      '<ol class="key">' + items.map(function (k) { return "<li><b>" + k.a + "</b>" + (k.why ? " <span>" + esc(k.why) + "</span>" : "") + "</li>"; }).join("") + "</ol>" + foot("Answer key", v), "key-page");
  }
  var LET = "ABCDEFGH";

  /* Academy questions → printable parts. qs = lesson question arrays (lessons.js format). */
  function questionParts(qs, r, young) {
    var mc = [], tf = [], c2 = [], mt = [], keys = [], n = 0;
    qs.forEach(function (q) {
      var type = q[1], pic = q[2], prompt = q[3];
      if (type === "mc") {
        var opts = r.shuffle(q[4].map(function (t, i) { return { t: t, ok: i === 0 }; }));
        mc.push({ pic: pic, prompt: prompt, opts: opts }); mc[mc.length - 1].why = q[5];
      } else if (type === "tf") tf.push({ pic: pic, prompt: prompt, ok: !!q[4], why: q[5] });
      else if (type === "c2") c2.push({ pic: pic, prompt: prompt, opts: r.shuffle(q[4].map(function (t) { return { t: t, ok: true }; }).concat(q[5].map(function (t) { return { t: t, ok: false }; }))), why: q[6] });
      else if (type === "match") { var right = r.shuffle(q[4].map(function (p, i) { return { t: p[1], i: i }; })); mt.push({ pic: pic, prompt: prompt, left: q[4].map(function (p) { return p[0]; }), right: right, why: q[5] }); }
    });
    var html = "";
    if (mc.length) html += part("A", young ? "Circle the right answer." : "Circle the letter of the best answer.", mc.map(function (q) {
      n++; var ans = LET[q.opts.map(function (o) { return o.ok; }).indexOf(true)];
      keys.push({ a: n + ". " + ans + " (" + esc(q.opts.filter(function (o) { return o.ok; })[0].t) + ")", why: q.why });
      return qBox(n, q.pic, q.prompt, '<ul class="opts">' + q.opts.map(function (o, i) { return '<li><span class="bubble">' + LET[i] + "</span> " + esc(o.t) + "</li>"; }).join("") + "</ul>");
    }).join(""));
    if (tf.length) html += part("B", young ? "Is it true? Circle T for true or F for false." : "Circle T for true or F for false." + (young ? "" : " If it is false, fix it on the line."), tf.map(function (q) {
      n++; keys.push({ a: n + ". " + (q.ok ? "True" : "False"), why: q.why });
      return qBox(n, q.pic, q.prompt, '<div class="tf"><span class="bubble">T</span><span class="bubble">F</span></div>' + (young || q.ok === undefined ? "" : '<i class="line full"></i>'));
    }).join(""));
    if (c2.length) html += part("C", "Tick TWO right answers.", c2.map(function (q) {
      n++; var oks = []; q.opts.forEach(function (o, i) { if (o.ok) oks.push(LET[i]); });
      keys.push({ a: n + ". " + oks.join(" and "), why: q.why });
      return qBox(n, q.pic, q.prompt, '<ul class="opts boxes">' + q.opts.map(function (o, i) { return '<li><span class="tick"></span> ' + LET[i] + ". " + esc(o.t) + "</li>"; }).join("") + "</ul>");
    }).join(""));
    if (mt.length) html += part("D", "Draw a line to match, or write the letter.", mt.map(function (q) {
      n++; keys.push({ a: n + ". " + q.left.map(function (_, i) { return (i + 1) + "–" + LET[q.right.map(function (x) { return x.i; }).indexOf(i)]; }).join(", "), why: q.why });
      return qBox(n, q.pic, q.prompt, '<div class="match"><ol>' + q.left.map(function (t) { return "<li>" + esc(t) + ' <i class="line tiny"></i> <span class="dot">●</span></li>'; }).join("") + "</ol>" +
        '<ul>' + q.right.map(function (x, i) { return '<li><span class="dot">●</span> ' + LET[i] + ". " + esc(x.t) + "</li>"; }).join("") + "</ul></div>");
    }).join(""));
    return { html: html, keys: keys, n: n };
  }
  function part(letter, how, inner) { return '<section class="part"><h2><span class="pl">Part ' + letter + "</span> " + how + "</h2>" + inner + "</section>"; }
  function qBox(n, pic, prompt, body) { return '<div class="q"><div class="qp"><b>' + n + ".</b> " + (pic ? '<span class="qpic">' + pic + "</span> " : "") + esc(prompt) + "</div>" + body + "</div>"; }
  function lines(n) { var s = ""; for (var i = 0; i < n; i++) s += '<i class="line full"></i>'; return s; }

  /* ---------------- unit worksheet ---------------- */
  function unitById(id) {
    var m = /^(\w+)-(\w+)-(\d+)$/.exec(id || ""); if (!m) return null;
    var u = Y.units(m[1], m[2]).filter(function (x) { return x.id === id; })[0];
    return u ? { u: u, g: m[1], s: m[2] } : null;
  }
  function unitSheet(f, L, v) {
    var u = f.u, S = subj(f.s), young = !!YOUNG[f.g], r = DR.rng(hashCode(u.id) + v * 7919);
    var qp = questionParts(L.q || [], r, young);
    var facts = (L.learn || []).map(function (c) {
      return '<div class="fact"><b>' + (c[1] ? c[1] + " " : "") + esc(c[0]) + "</b><ul>" + (c[2] || []).map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + "</ul></div>";
    }).join("");
    var story = (L.learn || []).map(function (c) { return c[3]; }).filter(Boolean)[0];
    var think = young
      ? part("E", "Draw it!", '<div class="q"><div class="qp">' + esc("Draw a picture about " + (L.learn && L.learn[0] ? L.learn[0][0] : u.title).toLowerCase() + ". Tell a grown-up about it.") + '</div><div class="draw"></div></div>')
      : part("E", "Think and write.", (story ? '<div class="q"><div class="qp"><b>Read:</b> ' + esc(story) + "</div></div>" : "") +
          '<div class="q"><div class="qp">In your own words, explain one thing you learned about <b>' + esc(u.title) + "</b>. Give an example.</div>" + lines(f.g === "g1" ? 2 : 3) + "</div>");
    var goals = '<section class="goals"><h2>⭐ I can…</h2><ul>' + u.goals.map(function (q) { return '<li><span class="star">☆</span> ' + esc(q) + "</li>"; }).join("") + '</ul><p class="muted">Colour a star for each thing you can do.</p></section>';
    var page = paper(head({ grade: gradeShort(f.g), subject: S.name, emoji: u.emoji, title: "Unit " + u.n + ": " + u.title, score: qp.n,
        std: "<b>Standards</b> US: " + esc(u.us) + " · UK: " + esc(u.uk) + " · Sweden: " + esc(u.se),
        how: young ? "Grown-up: please read each question aloud." : "" }) +
      '<section class="remember"><h2>💡 Remember</h2><div class="facts">' + facts + "</div></section>" +
      qp.html + think + goals + foot(gradeShort(f.g) + " " + S.name + " · Unit " + u.n, v), young ? "young" : "");
    return { html: page, keys: qp.keys, title: gradeShort(f.g) + " " + S.name + " – Unit " + u.n + " " + u.title, total: qp.n };
  }
  function hashCode(s) { var h = 0; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return h >>> 0; }

  /* ---------------- math drill ---------------- */
  function drillSheet(d, v) {
    var probs = DR.build(d, hashCode(d.id) + v * 104729), keys = [];
    var body = '<div class="grid k-' + (probs[0] && probs[0].k) + '" style="--cols:' + d.cols + '">' + probs.map(function (p, i) {
      var a = p.k === "more" ? (p.a === "left" ? "the first group (" + p.l + ")" : "the second group (" + p.r + ")") : p.a;
      if (a !== "") keys.push({ a: (i + 1) + ". " + esc(a) });
      return '<div class="prob"><span class="pn">' + (i + 1) + "</span>" + probHtml(p) + "</div>";
    }).join("") + "</div>";
    var time = d.grade === "pk" ? "" : '<p class="ws-time">⏱️ Time: <i class="line short"></i> &nbsp; Beat it next time: <i class="line short"></i></p>';
    var page = paper(head({ grade: gradeShort(d.grade), subject: "Math drill", emoji: d.emoji, title: d.title, score: keys.length ? probs.length : 0,
      std: "<b>Standard</b> US Common Core " + esc(d.std), how: esc(d.how) }) + time + body + foot(gradeShort(d.grade) + " Math · " + d.title, v), YOUNG[d.grade] ? "young" : "");
    return { html: page, keys: keys, title: gradeShort(d.grade) + " Math – " + d.title, total: probs.length };
  }
  function probHtml(p) {
    if (p.k === "h") return '<span class="ph">' + esc(p.t).replace(/_{3,}/g, '<i class="blank"></i>') + (/=\s*$/.test(p.t) ? ' <i class="blank"></i>' : "") + "</span>";
    if (p.k === "v") return '<span class="pv"><span>' + esc(p.top) + '</span><span><em>' + p.op + "</em>" + esc(p.bot) + '</span><span class="rule"></span></span>';
    if (p.k === "cmp") return '<span class="ph">' + esc(p.l) + ' <span class="circle"></span> ' + esc(p.r) + "</span>";
    if (p.k === "count") return '<span class="pc"><span class="pics">' + rep(p.e, p.n) + '</span> = <i class="blank"></i></span>';
    if (p.k === "pic") return '<span class="pc"><span class="pics">' + rep(p.e, p.x) + "</span> " + p.op + ' <span class="pics">' + rep(p.e, p.y) + '</span> = <i class="blank"></i></span>';
    if (p.k === "more") return '<span class="pm"><span class="grp">' + rep(p.e, p.l) + '</span><span class="grp">' + rep(p.e, p.r) + "</span></span>";
    if (p.k === "bar") { var s = ""; for (var i = 0; i < p.parts; i++) s += '<i class="' + (i < p.shade ? "on" : "") + '"></i>'; return '<span class="pc"><span class="fbar">' + s + '</span> = <i class="blank"></i></span>'; }
    if (p.k === "trace") return traceRow(p.t);
    return '<span class="ph">' + esc(p.t || "") + "</span>";
  }
  function rep(e, n) { var s = ""; for (var i = 0; i < n; i++) s += "<span>" + e + "</span>"; return s; }
  // handwriting guide row: one dark model, gray copies to trace, space to write
  function traceRow(t) {
    var gray = ""; for (var i = 0; i < 4; i++) gray += '<span class="tr">' + esc(t) + "</span>";
    return '<span class="hw"><span class="model">' + esc(t) + "</span>" + gray + '<span class="free"></span></span>';
  }

  /* ---------------- spelling ---------------- */
  function spellSheet(title, sub, words, v, label) {
    var r = DR.rng(hashCode(title) + v * 31337), keys = [];
    var order = r.shuffle(words);
    var t1 = '<table class="lscwc"><thead><tr><th>Look &amp; say</th><th>Cover &amp; write</th><th>Write again</th><th>Check ✓</th></tr></thead><tbody>' +
      words.map(function (w) { return "<tr><td><b>" + esc(w.w) + "</b></td><td></td><td></td><td></td></tr>"; }).join("") + "</tbody></table>";
    var bank = '<div class="bank">' + r.shuffle(words).map(function (w) { return "<span>" + esc(w.w) + "</span>"; }).join("") + "</div>";
    var n = 0;
    var t2 = order.map(function (w) {
      n++; var s = w.s || "", re = new RegExp("\\b" + w.w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b", "i");
      var line = s && re.test(s) ? esc(s.replace(re, "@@")).replace("@@", '<i class="blank wide"></i>') : (w.d ? "Meaning: " + esc(w.d) + ' → <i class="blank wide"></i>' : '<i class="blank wide"></i>');
      keys.push({ a: n + ". " + esc(w.w) });
      return '<div class="q"><div class="qp"><b>' + n + ".</b> " + line + "</div></div>";
    }).join("");
    var t3 = r.shuffle(words).slice(0, Math.min(6, words.length)).map(function (w) {
      n++; keys.push({ a: n + ". " + esc(w.w) });
      var letters = w.w.split(""), mix = letters.join(""), tries = 0;
      while ((mix === w.w) && tries++ < 20 && letters.length > 1) mix = r.shuffle(letters).join("");
      return '<div class="q"><div class="qp"><b>' + n + '.</b> <span class="scram">' + esc(mix.split("").join(" ")) + '</span> → <i class="blank wide"></i></div></div>';
    }).join("");
    var page = paper(head({ grade: sub, subject: "Spelling", emoji: "🐝", title: title, score: n, how: "Learn each word, then use it." }) +
      part("A", "Look, say, cover, write, check.", t1) + part("B", "Write the missing word. Use the word bank.", bank + t2) +
      part("C", "Unscramble the letters.", t3) + foot(label, v));
    return { html: page, keys: keys, title: title, total: n };
  }

  /* ---------------- handwriting ---------------- */
  function hwSheet(i, g) {
    var grp = HW[i] || HW[0], rows = grp.split(" ");
    var body = rows.map(function (pair) { return '<div class="hw-row">' + traceRow(pair[0]) + "</div>" + '<div class="hw-row">' + traceRow(pair[1]) + "</div>"; }).join("");
    var words = { a: "ant", b: "bat", c: "cat", d: "dog", e: "egg", f: "fox", g: "gum", h: "hat", i: "ink", j: "jam", k: "kit", l: "log", m: "map", n: "net", o: "ox", p: "pig", q: "quiz", r: "rat", s: "sun", t: "top", u: "up", v: "van", w: "web", x: "box", y: "yak", z: "zip" };
    var ws = rows.map(function (pair) { return words[pair[1]]; }).filter(Boolean);
    body += '<h2 class="hw-sub">Now trace some words</h2>' + ws.map(function (w) { return '<div class="hw-row">' + traceRow(w) + "</div>"; }).join("");
    var page = paper(head({ grade: gradeShort(g || "kg"), subject: "Handwriting", emoji: "✏️", title: "Letters " + rows[0] + " to " + rows[rows.length - 1],
      std: "<b>Standard</b> US " + (g === "g1" ? "1.L.1a" : "K.L.1a") + " (print upper- and lowercase letters) · UK EYFS / Year 1 handwriting",
      how: "Start at the top. Trace the gray letters, then write your own in the space." }) + body + foot("Handwriting", 0), "young");
    return { html: page, keys: [], title: "Handwriting " + grp, total: 0 };
  }

  /* ============================================================
     SHEET SCREEN
     ============================================================ */
  var cur = null;   // { id, title, total, h }
  function showSheet(sheet, h, back, opts) {
    opts = opts || {};
    var v = +h.v || 1, key = h.nokey !== "1";
    cur = { id: opts.id, title: sheet.title, total: sheet.total, h: h };
    $("topTitle").textContent = "📄 " + sheet.title;
    document.title = sheet.title;
    var bar = '<div class="sheet-bar no-print">' +
      '<a class="btn" href="' + back + '">⬅ Back</a>' +
      '<button class="btn go" id="printBtn">🖨️ Print / Save PDF</button>' +
      (opts.versions ? '<button class="btn" id="newBtn">' + (opts.versions === "numbers" ? "🔀 New numbers" : "🔀 New version") + "</button>" : "") +
      (sheet.keys.length ? '<label class="btn soft"><input type="checkbox" id="keyBox"' + (key ? " checked" : "") + "> 🔑 Answer key</label>" : "") +
      (sheet.total ? '<span class="score-box">Checked it? Score <input type="number" id="scoreIn" min="0" max="' + sheet.total + '" inputmode="numeric"> / ' + sheet.total + ' <button class="btn small" id="scoreBtn">✅ Save</button></span>' : "") +
      '</div><p class="tip no-print">💡 To download: tap Print, then choose <b>Save as PDF</b>. ' + (sheet.keys.length ? ' The answer key prints on its own last page.' : '') + '</p>';
    view.innerHTML = bar + '<div class="sheets">' + sheet.html + (key && sheet.keys.length ? keyPage(sheet.title, sheet.keys, opts.versions ? v : 0) : "") + "</div>";
    $("printBtn").onclick = doPrint;
    if ($("newBtn")) $("newBtn").onclick = function () { var o = Object.assign({}, h); o.v = v + 1; location.hash = hashOf(o); };
    if ($("keyBox")) $("keyBox").onchange = function () { var o = Object.assign({}, h); if (this.checked) delete o.nokey; else o.nokey = "1"; location.hash = hashOf(o); };
    if ($("scoreBtn")) $("scoreBtn").onclick = saveScore;
    window.scrollTo(0, 0);
  }
  function doPrint() {
    var log = load("ws_log", []);
    log.push({ id: cur.id, title: cur.title, t: Date.now() }); if (log.length > 300) log = log.slice(-300);
    store("ws_log", log);
    if (window.Tracker && Tracker.log) Tracker.log("worksheet", "print", { item: cur.title, id: cur.id });
    if (window.AndroidBridge && AndroidBridge.printPage) AndroidBridge.printPage(cur.title);
    else window.print();
  }
  function saveScore() {
    var n = parseInt($("scoreIn").value, 10);
    if (isNaN(n) || n < 0 || n > cur.total) { toast("Type a score from 0 to " + cur.total); return; }
    var log = load("ws_log", []);
    log.push({ id: cur.id, title: cur.title, t: Date.now(), score: n, total: cur.total }); if (log.length > 300) log = log.slice(-300);
    store("ws_log", log);
    if (window.Tracker) Tracker.complete("worksheet", n, cur.total, { item: cur.title, id: cur.id });
    toast(n === cur.total ? "🌟 Perfect worksheet! Amazing work!" : n >= cur.total * 0.8 ? "🎉 Great work! Score saved." : "💪 Score saved. Practice makes progress!");
    $("scoreIn").value = "";
  }
  function fail(msg, back) { view.innerHTML = '<div class="sheet-bar no-print"><a class="btn" href="' + back + '">⬅ Back</a></div><p class="muted">' + esc(msg) + "</p>"; }

  /* ============================================================
     ROUTER
     ============================================================ */
  function route() {
    var h = parseHash();
    if (h.u) {
      var f = unitById(h.u), backU = f ? hashOf({ g: f.g, s: f.s }) : "#";
      if (!f) return fail("That worksheet was not found.", "#");
      return needLessons(f.g + "-" + f.s, function () {
        var L = AL.get(h.u); if (!L) return fail("This unit's worksheet is coming soon.", backU);
        showSheet(unitSheet(f, L, +h.v || 1), h, backU, { id: h.u, versions: "shuffle" });
      });
    }
    if (h.book) {
      var m = /^(\w+)-(\w+)$/.exec(h.book); if (!m) return fail("Workbook not found.", "#");
      return needLessons(h.book, function () {
        var S = subj(m[2]), parts = [], keys = [], back = hashOf({ g: m[1], s: m[2] });
        Y.units(m[1], m[2]).forEach(function (u) {
          var L = AL.get(u.id); if (!L) return;
          var sh = unitSheet({ u: u, g: m[1], s: m[2] }, L, 1);
          parts.push(sh.html); keys.push({ a: "<u>Unit " + u.n + ": " + esc(u.title) + "</u>" }); keys = keys.concat(sh.keys);
        });
        if (!parts.length) return fail("No units yet.", back);
        var cover = paper('<div class="cover"><div class="cover-emoji">' + S.emoji + "</div><h1>" + esc(gradeShort(m[1])) + " " + esc(S.name) + " Workbook</h1><p>" + parts.length +
          ' worksheets, one for every unit, with answer keys at the back.</p><p class="cover-name">This workbook belongs to:<i class="line"></i></p><p class="muted">Kids Learning Hub · follows US, UK and Sweden curricula</p></div>');
        showSheet({ html: cover + parts.join(""), keys: keys, title: gradeShort(m[1]) + " " + S.name + " Workbook", total: 0 }, h, back, { id: "book:" + h.book });
      });
    }
    if (h.d) {
      var d = DR.get(h.d); if (!d) return fail("That drill was not found.", "#");
      return showSheet(drillSheet(d, +h.v || 1), h, hashOf({ g: d.grade, s: "math" }), { id: "drill:" + d.id, versions: "numbers" });
    }
    if (h.sp) {
      return needWords(function () {
        var list = (window.SB_LISTS || []).filter(function (l) { return l.id === h.sp; })[0], p = Math.max(1, Math.min(5, +h.p || 1)), back = hashOf({ g: h.sp, s: "english" });
        if (!list) return fail("Spelling list not found.", back);
        var words = list.words.slice((p - 1) * 10, p * 10).map(function (w) { return { w: w[0], d: w[1], s: w[2] }; });
        showSheet(spellSheet("Spelling words " + ((p - 1) * 10 + 1) + "–" + p * 10 + " (" + list.grade + ")", gradeShort(h.sp), words, +h.v || 1, "Spelling · " + list.grade + " list"), h, back, { id: "spell:" + h.sp + ":" + p, versions: "shuffle" });
      });
    }
    if (h.sps) {
      var set = window.SpellStore && SpellStore.get(h.sps), backS = hashOf({ g: kidGrade(), s: "extra" });
      if (!set) return fail("That word set was not found.", backS);
      return showSheet(spellSheet(set.title, "Spelling test practice", set.words.map(function (w) { return { w: w.w, d: w.d, s: w.s }; }), +h.v || 1, "Spelling · " + set.title), h, backS, { id: "spellset:" + set.id, versions: "shuffle" });
    }
    if (h.ah) {
      var t = window.AdhocStore && AdhocStore.get(h.ah), backA = hashOf({ g: kidGrade(), s: "extra" });
      if (!t) return fail("That topic was not found.", backA);
      var qs = t.questions.map(function (x, i) {
        var dd = i % 2 ? "m" : "e";
        if (x.type === "tf") return [dd, "tf", t.emoji || "🧪", x.prompt, !!x.answer, x.explain || ""];
        var ch = x.choices.slice(), right = ch.splice(x.answer, 1);
        return [dd, "mc", t.emoji || "🧪", x.prompt, right.concat(ch), x.explain || ""];
      });
      var notes = String(t.notes || "").split(/\n+/).map(function (s) { return s.trim(); }).filter(Boolean);
      var g = (t.grades && t.grades[0]) || kidGrade(), qp = questionParts(qs, DR.rng(hashCode(t.id) + (+h.v || 1) * 7919), !!YOUNG[g]);
      var page = paper(head({ grade: "Practice test", emoji: t.emoji || "🧪", title: t.title, score: qp.n }) +
        (notes.length ? '<section class="remember"><h2>💡 Remember</h2><div class="facts"><div class="fact"><ul>' + notes.map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("") + "</ul></div></div></section>" : "") +
        qp.html + foot(t.title, +h.v || 1));
      return showSheet({ html: page, keys: qp.keys, title: t.title, total: qp.n }, h, backA, { id: "adhoc:" + t.id, versions: "shuffle" });
    }
    if (h.hw != null && h.hw !== "") {
      var hg = h.g || kidGrade();
      return showSheet(hwSheet(+h.hw, hg), h, hashOf({ g: hg, s: "english" }), { id: "hw:" + h.hw });
    }
    document.title = "📄 Printable Worksheets";
    renderLibrary(h);
  }
  window.addEventListener("hashchange", route);
  route();

  // test hook
  window.WorksheetsApp = { unitSheet: unitSheet, drillSheet: drillSheet, spellSheet: spellSheet, hwSheet: hwSheet, route: route };
})();
