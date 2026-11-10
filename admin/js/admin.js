/* ============================================================
   Admin — one control room for every app in the Learning Hub
   ------------------------------------------------------------
   Reads the ActivityDB (IndexedDB) event history written by the
   Hub and by js/tracker.js inside each app, plus each learner's
   saved progress (localStorage, namespaced k<id>::key).

   Tabs:  Overview · Students · Progress · Suggestions · Forecast ·
          Activity Log (audit) · Money (settings + who is owed) · Data
   Every grown-up action here is itself logged (type "admin").
   ============================================================ */
(function () {
  "use strict";

  var DB = window.KidsDB, ADB = window.ActivityDB, C = window.Charts;
  var $ = function (id) { return document.getElementById(id); };
  var DAY = 864e5;

  /* ---------- app registry: subject, grades, and how to read progress ---------- */
  // progress(r, kid) → { done, total, label } using reader r for the learner's namespace.
  var APPS = [
    { id: "kinder", name: "Little Learners", emoji: "🐣", grades: ["kg"], subject: "Early Skills",
      progress: function (r) { var t = r.arr("ll_trophies").filter(function (x) { return /^game:/.test(x); }).length; return { done: t, total: 15, label: t + " of 15 games won · " + r.num("ll_stars") + " ⭐" }; } },
    { id: "speedway", name: "Learning Speedway", emoji: "🏎️", grades: ["kg"], subject: "Math & English",
      progress: function (r) { var d = Object.keys(r.obj("sw_stars")).length; return { done: d, total: 16, label: d + " of 16 roads · " + r.arr("sw_cars").length + " cars" }; } },
    { id: "phonics", name: "Phonics Pals", emoji: "🦜", grades: ["kg"], subject: "Reading",
      // Step 1 = 4 letter lessons + Step 3 = 4 sight-word lessons + Step 4 sh/ch/th + Step 5 blends + Step 6 magic e, 4 lessons each (ph_lessons), Step 2 = 5 books (ph_books); raise the totals as phases are added
      progress: function (r) { var b = r.obj("ph_books"), d = Object.keys(b).filter(function (k) { return b[k] && b[k].done; }).length;
        var l = r.obj("ph_lessons"), ld = Object.keys(l).filter(function (k) { return /^ls/.test(k) && l[k] && l[k].done; }).length;
        var sd = Object.keys(l).filter(function (k) { return /^sw/.test(k) && l[k] && l[k].done; }).length;
        var td = Object.keys(l).filter(function (k) { return /^dg/.test(k) && l[k] && l[k].done; }).length;
        var bd = Object.keys(l).filter(function (k) { return /^bl/.test(k) && l[k] && l[k].done; }).length;
        var md = Object.keys(l).filter(function (k) { return /^me/.test(k) && l[k] && l[k].done; }).length;
        return { done: d + ld + sd + td + bd + md, total: 25, label: ld + " of 4 letter lessons · " + d + " of 5 books · " + sd + " of 4 sight-word lessons · " + td + " of 4 sh/ch/th lessons · " + bd + " of 4 blend lessons · " + md + " of 4 magic e lessons · " + r.num("ph_perfect") + " perfect pages · " + r.num("ph_fixed") + " tricky words fixed" + rlLabel(r, "phonics") }; } },
    { id: "homeschool", name: "Homeschool Academy", emoji: "🎓", grades: ["kg", "g3"], subject: "Math & English",
      progress: function (r, kid) { var d = r.obj("hs_done"), m = (d[DB.band(kid.grade) + "-math"] || []).length, e = (d[DB.band(kid.grade) + "-english"] || []).length;
        return { done: m + e, total: 40, label: (m + e) + " of 40 lessons (Math " + m + ", English " + e + ")" }; } },
    { id: "quiz", name: "Quiz Corner", emoji: "🧠", grades: ["kg", "g3"], subject: "Discovery",
      // one save per pack (qk_<pack id>); add a pack here when quiz/packs/ gains one
      progress: function (r) {
        var out = [];
        [["senses", "Five Senses"], ["tamil", "Tamil"], ["helpers", "Community Helpers"], ["numbers", "Number Fun"], ["living", "Plants & Animals"], ["words", "Word Wizards"], ["mathlab", "Math Lab"], ["sciencelab", "Science Explorers"], ["readinglab", "Reading Rangers"], ["worldlab", "World Explorers"], ["community", "My Community"]].forEach(function (p) {
          var rs = r.obj("qk_" + p[0]).rounds || [], best = rs.reduce(function (m, x) { return Math.max(m, x.stars || 0); }, 0);
          if (rs.length) out.push(p[1] + ": " + rs.length + (rs.length === 1 ? " round" : " rounds") + " · best " + "⭐".repeat(best));
        });
        return { label: out.length ? out.join(" · ") : "No quizzes yet" }; } },
    { id: "academy", name: "Academy", emoji: "🎓", grades: ["kg", "g3"], subject: "All subjects",
      // academy/js/lessons.js: acad_progress {unitId | "adhoc:<id>": {r, best, m}}
      progress: function (r, kid) {
        var p = r.obj("acad_progress"), ids = Object.keys(p), Y = window.Syllabus;
        var units = ids.filter(function (k) { return k.indexOf("adhoc:") !== 0; }), m = units.filter(function (k) { return p[k].m; }).length;
        var mine = Y ? Y.SUBJECTS.reduce(function (n, sj) { return n + Y.units(kid.grade, sj.id).length; }, 0) : 0;
        var own = units.filter(function (k) { return k.indexOf(kid.grade + "-") === 0 && p[k].m; }).length, ad = ids.length - units.length;
        return { done: own, total: mine || undefined, label: m + " units mastered (" + own + " of " + mine + " in their grade) · " + units.length + " started" + (ad ? " · " + ad + " AdHoc topics tried" : "") }; } },
    { id: "funfacts", name: "Fun Facts Explorer", emoji: "🔍", grades: ["kg", "g3"], subject: "Discovery",
      progress: function (r) { return { label: r.num("ff_stars") + " ⭐ · " + r.arr("ff_trophies").length + " trophies" }; } },
    { id: "grammar", name: "Grammar Galaxy", emoji: "🪐", grades: ["g3"], subject: "Grammar & Writing",
      progress: function (r) { return { label: r.num("gg_stars") + " ⭐ · " + r.arr("gg_trophies").length + " trophies" }; } },
    { id: "treasure", name: "Grammar Treasure Hunt", emoji: "🗺️", grades: ["g3"], subject: "Grammar & Writing",
      progress: function (r) { var d = r.arr("th_trophies").filter(function (x) { return /^map:/.test(x); }).length; return { done: d, total: 5, label: d + " of 5 maps · " + r.num("th_coins") + " 🪙" }; } },
    { id: "reading", name: "Reading Trail", emoji: "🦉", grades: ["g3"], subject: "Reading",
      progress: function (r) { var d = r.arr("rd_done").length; return { done: d, total: 10, label: d + " of 10 stages" }; } },
    { id: "multiply", name: "Times Table Takeoff", emoji: "✖️", grades: ["g3"], subject: "Math",
      progress: function (r) { var d = r.arr("tt_mastered").length; return { done: d, total: 11, label: d + " of 11 tables mastered" }; } },
    { id: "clueisland", name: "Clue Island", emoji: "🧭", grades: ["g3"], subject: "Reading",
      progress: function (r) { var d = r.arr("ci_chests").length; return { done: d, total: 5, label: d + " of 5 islands" }; } },
    { id: "grandprix", name: "Turbo Grand Prix", emoji: "🏁", grades: ["g3"], subject: "Math & English",
      progress: function (r) { var d = Object.keys(r.obj("gp_season")).length; return { done: d, total: 8, label: d + " of 8 races" }; } },
    { id: "readrocket", name: "Read-Aloud Rocket", emoji: "🚀", grades: ["g3"], subject: "Reading",
      progress: function (r) { var l = r.obj("rr_lessons"), c = r.obj("rr_checks"), d = Object.keys(l).filter(function (k) { return l[k] && l[k].done; }).length;
        var ph = Object.keys(c).filter(function (k) { return c[k] && c[k].passed; }).length, best = r.num("rr_bestWcpm");
        var wr = r.arr("rr_writing").length;
        return { done: d, total: 24, label: d + " of 24 lessons · " + ph + " of 6 phases passed" + (best ? " · best " + best + " words/min" : "") + (wr ? " · " + wr + " written answers" : "") + rlLabel(r, "readrocket") }; } },
    { id: "worksheets", name: "Printable Worksheets", emoji: "📄", grades: ["pk", "kg", "g1", "g2", "g3", "g4", "g5"], subject: "All subjects",
      progress: function (r) { var l = r.arr("ws_log"), sc = l.filter(function (x) { return x && x.total; }), ids = {}; l.forEach(function (x) { if (x && x.id) ids[x.id] = 1; });
        var n = Object.keys(ids).length, pct = sc.length ? Math.round(100 * sc.reduce(function (a, x) { return a + x.score / x.total; }, 0) / sc.length) : 0;
        return { done: Math.min(n, 50), total: 50, label: n + " worksheets printed" + (sc.length ? " · " + sc.length + " scored, average " + pct + "%" : "") }; } },
    { id: "readgym", name: "Koa's Reading Gym", emoji: "🐨", grades: ["g3"], subject: "Reading comprehension",
      progress: function (r) { var l = r.obj("rg_lessons"), ks = Object.keys(l).filter(function (k) { return l[k] && l[k].done; }), st = r.obj("rg_stats");
        var stars = ks.reduce(function (a, k) { return a + (l[k].stars || 0); }, 0), pct = st.answered ? Math.round(100 * (st.first || 0) / st.answered) : 0;
        return { done: ks.length, total: 15, label: ks.length + " of 15 lessons · " + stars + " of 45 stars" + (st.answered ? " · " + pct + "% first try on their own" : "") + " · " + (st.proofs || 0) + " proofs found" }; } },
    { id: "spellingbee", name: "Spelling Bee", emoji: "🐝", grades: ["g3"], subject: "Spelling",
      progress: function (r) { var w = r.obj("sb_words"), m = Object.keys(w).filter(function (k) { return w[k] && w[k].m >= 2; }).length;
        var t = r.obj("sb_tests"), tn = Object.keys(t).length, jar = r.arr("sb_jar").length;
        return { done: Math.min(m, 250), total: 250, label: m + " words mastered · " + r.arr("sb_stickers").length + " stickers" + (tn ? " · " + tn + " practice tests" : "") + (jar ? " · " + jar + " in the Tricky Jar" : "") }; } },
    { id: "writestudio", name: "Sentence Studio", emoji: "✏️", grades: ["g3"], subject: "Grammar & Writing",
      progress: function (r) { var l = r.obj("ws_lessons"), d = Object.keys(l).filter(function (k) { return l[k] && l[k].done; }).length, j = r.arr("ws_journal").length;
        return { done: d, total: 10, label: d + " of 10 writing lessons · " + j + " pieces in the Writing Book · " + r.num("ws_selfFix") + " self-fixes" }; } },
    { id: "tracewrite", name: "Write & Trace", emoji: "🖍️", grades: ["kg"], subject: "Grammar & Writing",
      // Phases 1–3 = 12 lessons (tw_lessons); raise the total as phases are added
      progress: function (r) { var l = r.obj("tw_lessons"), d = Object.keys(l).filter(function (k) { return l[k] && l[k].done; }).length;
        return { done: d, total: 12, label: d + " of 12 handwriting lessons · " + r.num("tw_clean") + " perfect traces · " + r.num("tw_built") + " words spelled" }; } },
    { id: "arabic", name: "Arabic Oasis", emoji: "🐪", grades: ["kg", "g3"], subject: "Arabic",
      // lessons ak* = KG path, ag* = 3rd-grade path (ar_lessons); Phases 1–3 = 12 lessons each, raise as phases are added
      progress: function (r, kid) { var l = r.obj("ar_lessons"), pre = DB.band(kid.grade) === "kg" ? /^ak/ : /^ag/;
        var d = Object.keys(l).filter(function (k) { return pre.test(k) && l[k] && l[k].done; }).length;
        return { done: d, total: 12, label: d + " of 12 lessons · " + r.arr("ar_met").length + " of 28 letters met · " + r.num("ar_traced") + " letters traced · " + r.num("ar_said") + " words said" }; } },
    { id: "detectives", name: "Reading Detectives", emoji: "🦝", grades: ["g3"], subject: "Reading",
      progress: function (r) { var d = r.num("rc_solved"); return { done: d, total: 15, label: d + " of 15 cases solved" }; } },
    { id: "readingadventures", name: "Reading Adventures", emoji: "📖", grades: ["kg", "g3"], subject: "Reading",
      progress: function (r, kid) { var p = r.obj("readingAdventuresProgress_v2"), g = p[DB.band(kid.grade) === "kg" ? "kinder" : "grade3"] || {};
        var d = Object.keys(g).filter(function (k) { return g[k] && g[k].completed; }).length, label = d + " of 15 stories";
        if (DB.band(kid.grade) !== "kg") { var sp = r.obj("readingAdventuresScience_v1"), ss = sp.stories || {};
          var sd = Object.keys(ss).filter(function (k) { return ss[k] && ss[k].done; }).length, tb = (sp.test || {}).best || 0;
          if (sd || tb) label += " · science " + sd + "/10 stories" + (tb ? ", test best " + tb + "%" : ""); }
        return { done: d, total: 15, label: label }; } },
    { id: "piratemath", name: "Pirate Math Quest", emoji: "🏴‍☠️", grades: ["g3"], subject: "Math", progress: null },
    { id: "subtraction", name: "Subtraction Notebook Quest", emoji: "📓", grades: ["g3"], subject: "Math",
      progress: function (r) { var d = Object.keys(r.obj("numberExplorersProgress_v1").completed || {}).length; return { done: d, total: 40, label: d + " of 40 problems" }; } },
    { id: "timesquest", name: "Times Table Quest", emoji: "🦉", grades: ["g3"], subject: "Math",
      // 17 badges (5 + a Table Champ for each of 1–12) in timesTableQuest_v2
      progress: function (r) { var s = r.obj("timesTableQuest_v2"), b = (s.badges || []).length;
        return { done: b, total: 17, label: b + " of 17 badges · " + (s.points || 0) + " points · exam best " + (s.examBest || 0) + "/20" }; } },
    { id: "stickerquest", name: "Sticker Quest", emoji: "🧩", grades: ["g3"], subject: "Math & English",
      // 8 fact families + 6 equal-groups problems (3 ways each) + the reading quiz
      progress: function (r) { var s = r.obj("stickerQuest_v1"), c = s.completed || {}, g = c.groups || {};
        var f = (c.facts || []).length, gd = Object.keys(g).filter(function (k) { return (g[k] || []).length >= 3; }).length, d = f + gd + (c.reading ? 1 : 0);
        var best = (s.fluency || []).reduce(function (m, x) { return Math.max(m, x.score || 0); }, 0);
        return { done: d, total: 15, label: f + "/8 fact families · " + gd + "/6 equal groups · reading " + (c.reading ? "✅" : "—") + (best ? " · best read " + best + " words" : "") }; } },
    { id: "billofrights", name: "Bill of Rights Adventure", emoji: "📜", grades: ["g3"], subject: "History", progress: null },
    { id: "arcade", name: "Free Games Arcade", emoji: "🎮", grades: ["kg", "g3"], subject: "Games", progress: null },
    { id: "rewards", name: "Rewards Center", emoji: "🎁", grades: ["kg", "g3"], subject: "Rewards", progress: null },
    { id: "hub", name: "Learning Hub", emoji: "🎒", grades: ["kg", "g3"], subject: "Hub", progress: null, internal: true },
    { id: "admin", name: "Admin", emoji: "🛡️", grades: [], subject: "Hub", progress: null, internal: true }
  ];
  function gradeOptions() {
    return DB.GRADE_ORDER.map(function (c) { var g = DB.GRADES[c]; return '<option value="' + c + '"' + (c === "kg" ? " selected" : "") + ">" + g.emoji + " " + g.short + "</option>"; }).join("");
  }
  function appById(id) { for (var i = 0; i < APPS.length; i++) if (APPS[i].id === id) return APPS[i]; return { id: id, name: id, emoji: "📦", subject: "Other", grades: [] }; }

  // Categorical slots, assigned in a FIXED order to subjects (colour follows the entity).
  var SUBJECTS = ["Reading", "Math", "Grammar & Writing", "Math & English", "Early Skills", "Discovery", "Games", "History", "Arabic"];
  function subjectColor(s) { var i = SUBJECTS.indexOf(s); return i < 0 ? "var(--ink-muted)" : "var(--s" + (i + 1) + ")"; }

  /* ---------- state ---------- */
  var S = { tab: "overview", kid: "all", days: 30, events: [], allEvents: null, logPage: 0 };
  try { var saved = JSON.parse(sessionStorage.getItem("adm_view") || "{}"); if (saved.tab) S.tab = saved.tab; if (saved.days) S.days = saved.days; if (saved.kid) S.kid = saved.kid; } catch (e) {}
  function remember() { try { sessionStorage.setItem("adm_view", JSON.stringify({ tab: S.tab, days: S.days, kid: S.kid })); } catch (e) {} }

  /* ---------- small utils ---------- */
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function dayKey(ts) { var d = new Date(ts); return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }
  function startOfDay(ts) { var d = new Date(ts); d.setHours(0, 0, 0, 0); return d.getTime(); }
  function shortDate(ts) { return new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric" }); }
  function fullTime(ts) { return new Date(ts).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }); }
  function mins(ms) { return ms / 60000; }
  function fmtMin(m) { if (m < 1) return Math.round(m * 60) + "s"; if (m < 60) return Math.round(m) + " min"; return (m / 60).toFixed(1).replace(/\.0$/, "") + " h"; }
  function pct(a, b) { return b ? Math.round(100 * a / b) : null; }
  function timeAgo(ts) {
    if (!ts) return "never"; var s = (Date.now() - ts) / 1000;
    if (s < 60) return "just now"; if (s < 3600) return Math.floor(s / 60) + " min ago";
    if (s < 86400) return Math.floor(s / 3600) + " h ago"; var d = Math.floor(s / 86400); return d === 1 ? "yesterday" : d + " days ago";
  }
  function kidById(id) { var k = null; DB.kids().forEach(function (x) { if (x.id === id) k = x; }); return k; }
  function kidName(id) { var k = kidById(id); return k ? k.avatar + " " + k.name : (id ? "Removed learner" : "Guest"); }
  function audit(action, meta) { ADB.add({ type: "admin", action: action, app: "admin", meta: meta || null }); }

  // progress reader for a learner's localStorage namespace
  function reader(id) {
    var ns = id ? "k" + id + "::" : "";
    function raw(k) { return localStorage.getItem(ns + k); }
    return {
      num: function (k) { var v = parseFloat(raw(k)); return isNaN(v) ? 0 : v; },
      arr: function (k) { try { var v = JSON.parse(raw(k)); return Array.isArray(v) ? v : []; } catch (e) { return []; } },
      obj: function (k) { try { var v = JSON.parse(raw(k)); return v && typeof v === "object" ? v : {}; } catch (e) { return {}; } }
    };
  }

  /* ============================================================
     Analysis — everything the tabs need, from one pass over events
     ============================================================ */
  function analyze(events, since, until) {
    var A = { timeMs: 0, sessions: 0, answers: 0, correct: 0, completes: 0, opens: 0,
              days: {}, perDay: {}, apps: {}, skills: {}, subjects: {}, heat: [], hourAcc: {}, sessionLens: [] , last: 0 };
    for (var r = 0; r < 7; r++) { A.heat.push([]); for (var h = 0; h < 24; h++) A.heat[r].push(0); }
    var sessionHasAnswer = {}, sessionApp = {};
    events.forEach(function (e) {
      if (e.ts < since || e.ts > until) return;
      if (e.type === "admin") return;
      var app = A.apps[e.app] || (A.apps[e.app] = { id: e.app, timeMs: 0, sessions: 0, answers: 0, correct: 0, completes: 0, opens: 0, last: 0 });
      var dk = dayKey(e.ts), day = A.perDay[dk] || (A.perDay[dk] = { timeMs: 0, answers: 0, correct: 0, completes: 0 });
      app.last = Math.max(app.last, e.ts); A.last = Math.max(A.last, e.ts);
      if (e.app !== "hub") A.days[dk] = 1;
      var d = new Date(e.ts), wd = (d.getDay() + 6) % 7, hr = d.getHours();
      if (e.type === "session" && e.action === "time" && e.ms) {
        A.timeMs += e.ms; app.timeMs += e.ms; day.timeMs += e.ms; A.heat[wd][hr] += mins(e.ms);
        var subj = appById(e.app).subject; A.subjects[subj] = (A.subjects[subj] || 0) + e.ms;
      } else if (e.type === "session" && e.action === "start") {
        A.sessions++; app.sessions++; sessionApp[e.session] = e.app;
      } else if (e.type === "session" && e.action === "end") {
        if (e.ms) A.sessionLens.push({ app: e.app, ms: e.ms, session: e.session });
      } else if (e.type === "answer") {
        A.answers++; app.answers++; day.answers++;
        if (e.ok) { A.correct++; app.correct++; day.correct++; }
        sessionHasAnswer[e.session] = 1;
        var sk = e.app + "|" + (e.skill || "General");
        var s = A.skills[sk] || (A.skills[sk] = { app: e.app, skill: e.skill || "General", answers: 0, correct: 0, first: e.ts, last: e.ts, recent: [] });
        s.answers++; if (e.ok) s.correct++; s.last = Math.max(s.last, e.ts); s.recent.push(e.ok ? 1 : 0);
        var hb = A.hourAcc[hr] || (A.hourAcc[hr] = { answers: 0, correct: 0 }); hb.answers++; if (e.ok) hb.correct++;
      } else if (e.type === "complete") {
        A.completes++; app.completes++; day.completes++;
      } else if (e.type === "open") {
        A.opens++; app.opens++;
      }
    });
    // sessions that never answered anything (only meaningful for quiz-style apps)
    A.idleSessions = {};
    Object.keys(sessionApp).forEach(function (sid) {
      var a = sessionApp[sid]; if (!sessionHasAnswer[sid]) A.idleSessions[a] = (A.idleSessions[a] || 0) + 1;
    });
    A.activeDays = Object.keys(A.days).length;
    A.accuracy = pct(A.correct, A.answers);
    return A;
  }

  function filteredEvents() {
    return S.kid === "all" ? S.events : S.events.filter(function (e) { return e.kid === S.kid; });
  }
  function rangeBounds() { var until = Date.now(); return { since: startOfDay(until - (S.days - 1) * DAY), until: until }; }
  function dayLabels(since, n) { var out = []; for (var i = 0; i < n; i++) out.push(since + i * DAY); return out; }
  function streak(daysObj) {
    var n = 0, t = startOfDay(Date.now());
    if (!daysObj[dayKey(t)]) t -= DAY; // today not played yet still keeps yesterday's streak
    while (daysObj[dayKey(t)]) { n++; t -= DAY; }
    return n;
  }

  /* ============================================================
     Rendering — shell, filters and tabs
     ============================================================ */
  var TABS = [
    { id: "overview", label: "📊 Overview" }, { id: "students", label: "👧 Students" },
    { id: "progress", label: "📈 Progress" }, { id: "suggest", label: "💡 Suggestions" },
    { id: "forecast", label: "🔮 Forecast" }, { id: "log", label: "🧾 Activity Log" }, { id: "dollars", label: "💰 Money" }, { id: "academy", label: "🎓 Academy" }, { id: "spelling", label: "🐝 Spelling Bee" }, { id: "readlevels", label: "🎤 Reading Levels" }, { id: "data", label: "💾 Data" }
  ];
  function renderTabs() {
    var nav = $("tabs"); nav.innerHTML = "";
    TABS.forEach(function (t) {
      var b = document.createElement("button");
      b.className = "tab" + (S.tab === t.id ? " active" : ""); b.textContent = t.label;
      b.setAttribute("role", "tab"); b.setAttribute("aria-selected", S.tab === t.id);
      b.addEventListener("click", function () { S.tab = t.id; S.logPage = 0; remember(); renderTabs(); renderTab(); });
      nav.appendChild(b);
    });
  }
  function renderFilters() {
    var sel = $("kidSel"); sel.innerHTML = '<option value="all">All students</option>';
    DB.kids().forEach(function (k) {
      var o = document.createElement("option"); o.value = k.id; o.textContent = k.avatar + " " + k.name + " (" + (DB.GRADES[k.grade] || {}).short + ")";
      sel.appendChild(o);
    });
    if (S.kid !== "all" && !kidById(S.kid)) S.kid = "all";
    sel.value = S.kid;
    document.querySelectorAll(".range-btn").forEach(function (b) { b.classList.toggle("active", +b.dataset.days === S.days); });
  }
  function renderTab() {
    C.hideTip();
    var host = $("panel");
    $("filters").hidden = S.tab === "data" || S.tab === "students" || S.tab === "dollars" || S.tab === "academy" || S.tab === "spelling" || S.tab === "readlevels";
    var fn = { overview: renderOverview, students: renderStudents, progress: renderProgress, suggest: renderSuggest,
               forecast: renderForecast, log: renderLog, dollars: renderDollars, academy: renderAcademy, spelling: renderSpelling, readlevels: renderReadLevels, data: renderData }[S.tab];
    host.innerHTML = "";
    fn(host);
  }
  function section(host, title, sub, cls) {
    var s = document.createElement("section"); s.className = "card " + (cls || "");
    s.innerHTML = '<h3 class="card-h">' + title + "</h3>" + (sub ? '<p class="card-sub">' + sub + "</p>" : "");
    host.appendChild(s); return s;
  }
  function chartBox(sec) { var d = document.createElement("div"); d.className = "chart"; sec.appendChild(d); return d; }
  function statTile(label, value, note, tone) {
    return '<div class="stat' + (tone ? " " + tone : "") + '"><div class="stat-label">' + label + '</div><div class="stat-value">' + value +
      '</div>' + (note ? '<div class="stat-note">' + note + "</div>" : "") + "</div>";
  }
  function scopeName() { return S.kid === "all" ? "all students" : esc(kidName(S.kid)); }

  /* ---------- Overview ---------- */
  function renderOverview(host) {
    var b = rangeBounds(), evs = filteredEvents(), A = analyze(evs, b.since, b.until);
    var prev = analyze(evs, b.since - S.days * DAY, b.since - 1);
    function delta(cur, old, unit) {
      if (!old) return "";
      var d = cur - old, sign = d > 0 ? "▲ +" : d < 0 ? "▼ " : "";
      return '<span class="' + (d > 0 ? "up" : d < 0 ? "down" : "") + '">' + sign + unit(d) + "</span> vs previous " + S.days + " days";
    }
    var tiles = document.createElement("div"); tiles.className = "stats";
    tiles.innerHTML =
      statTile("Learning time", fmtMin(mins(A.timeMs)), delta(mins(A.timeMs), mins(prev.timeMs), function (d) { return fmtMin(Math.abs(d)); })) +
      statTile("Questions answered", A.answers.toLocaleString(), delta(A.answers, prev.answers, function (d) { return Math.abs(d); })) +
      statTile("Accuracy", A.accuracy == null ? "—" : A.accuracy + "%", A.answers ? A.correct + " right of " + A.answers : "no answers yet") +
      statTile("Lessons & stories finished", A.completes, delta(A.completes, prev.completes, function (d) { return Math.abs(d); })) +
      statTile("Active days", A.activeDays + " / " + S.days, "current streak " + streak(analyze(evs, 0, Date.now()).days) + " days") +
      statTile("Sessions", A.sessions, A.sessions ? "avg " + fmtMin(mins(A.timeMs) / A.sessions) + " each" : "");
    host.appendChild(tiles);

    var grid = document.createElement("div"); grid.className = "grid2"; host.appendChild(grid);

    // 1. daily learning time, stacked by subject
    var labels = dayLabels(b.since, S.days);
    var bySubjDay = {};
    evs.forEach(function (e) {
      if (e.type !== "session" || e.action !== "time" || e.ts < b.since) return;
      var subj = appById(e.app).subject, dk = dayKey(e.ts);
      (bySubjDay[subj] || (bySubjDay[subj] = {}))[dk] = ((bySubjDay[subj] || {})[dk] || 0) + mins(e.ms);
    });
    var subs = SUBJECTS.filter(function (s) { return bySubjDay[s]; });
    if (Object.keys(bySubjDay).some(function (s) { return SUBJECTS.indexOf(s) < 0; })) subs.push("Other");
    var sec1 = section(grid, "Learning time per day", "Minutes of active time, by subject — " + scopeName(), "wide");
    C.columns(chartBox(sec1), {
      labels: labels.map(shortDate), xName: "Day", fmt: function (v) { return v < 10 ? (Math.round(v * 10) / 10) + "" : Math.round(v) + ""; },
      series: subs.map(function (s) {
        return { name: s, color: subjectColor(s), values: labels.map(function (t) {
          var dk = dayKey(t);
          if (s === "Other") { var o = 0; Object.keys(bySubjDay).forEach(function (k) { if (SUBJECTS.indexOf(k) < 0) o += bySubjDay[k][dk] || 0; }); return o; }
          return bySubjDay[s][dk] || 0; }) };
      }),
      empty: "No learning time recorded in this period yet. Time is counted while an app is open and being used."
    });

    // 2. accuracy per day (line)
    var sec2 = section(grid, "Accuracy per day", "Share of questions answered correctly");
    C.line(chartBox(sec2), {
      labels: labels.map(shortDate), yMax: 100, fmt: function (v) { return Math.round(v) + "%"; },
      series: [{ name: "Accuracy", color: "var(--s1)", values: labels.map(function (t) { var d = A.perDay[dayKey(t)]; return d && d.answers ? 100 * d.correct / d.answers : null; }) }],
      empty: "No answered questions in this period yet."
    });

    // 3. time by app (ranked)
    var sec3 = section(grid, "Most-used apps", "Active minutes per app");
    C.hbars(chartBox(sec3), Object.keys(A.apps).filter(function (k) { return k !== "hub"; }).map(function (k) {
      var a = A.apps[k], m = appById(k);
      return { label: m.emoji + " " + m.name, value: mins(a.timeMs), color: subjectColor(m.subject), note: a.answers ? pct(a.correct, a.answers) + "% accuracy over " + a.answers + " answers" : "" };
    }).sort(function (x, y) { return y.value - x.value; }).slice(0, 10), { fmt: function (v) { return fmtMin(v); }, labelName: "App", valueName: "Time", unit: "", empty: "No app time yet." });

    // 4. when they learn (heatmap)
    var sec4 = section(grid, "When learning happens", "Minutes by weekday and hour of day");
    C.heatmap(chartBox(sec4), {
      rows: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      cols: Array.apply(null, Array(24)).map(function (_, h) { return h === 0 ? "12a" : h < 12 ? h + "a" : h === 12 ? "12p" : (h - 12) + "p"; }),
      colTitle: function (h) { return (h % 12 || 12) + (h < 12 ? " am" : " pm"); },
      values: A.heat, fmt: function (v) { return fmtMin(v); }, unit: "learning time", empty: "No learning time yet."
    });

    // 5. subject balance
    var sec5 = section(grid, "Subject balance", "Share of learning time by subject");
    var totalT = A.timeMs || 1;
    C.hbars(chartBox(sec5), Object.keys(A.subjects).filter(function (s) { return s !== "Hub"; }).map(function (s) {
      return { label: s, value: 100 * A.subjects[s] / totalT, color: subjectColor(s), note: fmtMin(mins(A.subjects[s])) };
    }).sort(function (x, y) { return y.value - x.value; }), { fmt: function (v) { return Math.round(v) + "%"; }, max: 100, labelName: "Subject", valueName: "Share" });

    // 6. weakest skills
    var sec6 = section(grid, "Skills that need practice", "Lowest accuracy (at least 3 answers)");
    var weak = Object.keys(A.skills).map(function (k) { return A.skills[k]; }).filter(function (s) { return s.answers >= 3; })
      .sort(function (x, y) { return x.correct / x.answers - y.correct / y.answers; }).slice(0, 8);
    C.hbars(chartBox(sec6), weak.map(function (s) {
      return { label: s.skill, value: 100 * s.correct / s.answers, color: subjectColor(appById(s.app).subject), note: appById(s.app).name + " · " + s.correct + "/" + s.answers + " right" };
    }), { fmt: function (v) { return Math.round(v) + "%"; }, max: 100, keepZero: true, labelName: "Skill", valueName: "Accuracy", empty: "Not enough answers yet to spot weak skills." });
  }

  /* ---------- Students ---------- */
  /* ---------- 💰 Money: settings (js/settings.js) + the Dollar Bank ledgers (js/dollars.js) ---------- */
  function renderDollars(host) {
    var B = window.DollarBank, H = window.HubSettings; if (!B) return;
    if (H) renderMoneySettings(host, B, H);
    var who = DB.kids().map(function (k) { return { id: k.id, label: k.avatar + " " + k.name }; });
    var guest = B.forKid("");
    if (B.ledger(guest.g).length || B.earnedNow(guest.g).length) who.push({ id: "", label: "👤 Guest (nobody logged in)" });
    if (!who.length) section(host, "💵 Money earned", '<span class="muted">No students yet.</span>');
    who.forEach(function (w) {
      var io = B.forKid(w.id); B.sync(io.g, io.s);
      var t = B.totals(io.g), L = B.ledger(io.g).slice().reverse(), off = H && !H.moneyFor(w.id).enabled;
      var sec = section(host, esc(w.label) + " · " + t.text.earned + " earned" + (off ? ' <span class="pill">money off</span>' : ""),
        "<b>" + t.text.owed + "</b> still to hand over · " + t.text.paid + " already paid");
      if (!L.length) { sec.insertAdjacentHTML("beforeend", '<p class="muted">Nothing earned yet. The challenges are listed below.</p>'); return; }
      var rows = L.map(function (e) {
        var a = appById(e.app);
        return "<tr" + (e.off ? ' class="muted"' : "") + "><td>" + shortDate(e.ts) + "</td><td>" + a.emoji + " " + esc(a.name) + "</td><td>" + esc(e.title) + "</td><td><b>" +
          (e.off ? "—" : esc(B.sumText([e]))) + "</b></td><td>" +
          (e.off ? "money was off" : e.paid ? '✅ paid ' + shortDate(e.paid) + ' <button class="btn small" data-unpay="' + esc(e.id) + '">undo</button>'
                  : '<button class="btn small primary" data-pay="' + esc(e.id) + '">Mark paid</button>') + "</td></tr>";
      }).join("");
      sec.insertAdjacentHTML("beforeend", (t.owedCount ? '<p><button class="btn primary" data-payall="1">✅ Mark all ' + esc(t.text.owed) + ' as paid</button></p>' : "") +
        '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Date</th><th>App</th><th>Challenge</th><th>Amount</th><th>Paid?</th></tr></thead><tbody>' + rows + "</tbody></table></div>");
      sec.addEventListener("click", function (ev) {
        var b = ev.target.closest("button"); if (!b) return;
        var id = b.getAttribute("data-pay") || b.getAttribute("data-unpay") || (b.getAttribute("data-payall") ? "*" : null);
        if (id == null) return;
        B.setPaid(id, !b.hasAttribute("data-unpay"), io.g, io.s);
        audit("dollar_paid", { kid: w.id, id: id, paid: !b.hasAttribute("data-unpay") });
        renderTab();
      });
    });
    renderChallengeLevels(host, B, H);
  }

  // Device switch, currency, the three reward levels, per-learner overrides and surprise gifts per day.
  function renderMoneySettings(host, B, H) {
    var st = H.get(), m = st.money, CUR = H.CURRENCIES;
    var sec = section(host, "💰 Money settings",
      "Real money is only for big, hard wins. Every challenge pays one of three levels. Changes save at once and apply to wins from now on; money already earned keeps its amount.");
    var curOpts = function (sel, withDefault) {
      return (withDefault ? '<option value=""' + (!sel ? " selected" : "") + ">Same as device</option>" : "") +
        Object.keys(CUR).map(function (c) { return '<option value="' + c + '"' + (sel === c ? " selected" : "") + ">" + CUR[c].symbol + " " + CUR[c].name + "</option>"; }).join("");
    };
    var html =
      '<div class="money-row"><label class="switch-row"><input type="checkbox" id="mOn"' + (m.enabled ? " checked" : "") + "> Money rewards on this device</label>" +
      '<label class="sel">Currency <select id="mCur">' + curOpts(m.currency) + "</select></label></div>" +
      '<div class="tbl-wrap"><table class="tbl money-levels"><thead><tr><th>Level</th><th>Meant for</th><th>US $</th><th>Rupees ₹</th></tr></thead><tbody>' +
      m.levels.map(function (l, i) {
        return "<tr><td>" + l.emoji + " <b>" + esc(l.name) + "</b></td><td>" + esc(l.when) + "</td>" +
          '<td><input class="num" type="number" min="0" max="1000" step="0.25" data-lv="' + i + '" data-cur="USD" value="' + l.amounts.USD + '" aria-label="' + esc(l.name) + ' in US dollars"></td>' +
          '<td><input class="num" type="number" min="0" max="100000" step="1" data-lv="' + i + '" data-cur="INR" value="' + l.amounts.INR + '" aria-label="' + esc(l.name) + ' in rupees"></td></tr>';
      }).join("") + "</tbody></table></div>";
    var kids = DB.kids();
    if (kids.length) {
      html += '<h4 class="money-h">Each learner</h4><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Learner</th><th>Money</th><th>Currency</th></tr></thead><tbody>' +
        kids.map(function (k) {
          var own = m.perKid[k.id] || {}, en = own.enabled === false ? "off" : own.enabled === true ? "on" : "";
          return "<tr><td>" + k.avatar + " " + esc(k.name) + "</td>" +
            '<td><select data-kid="' + k.id + '" data-f="enabled"><option value=""' + (en === "" ? " selected" : "") + ">Same as device</option>" +
              '<option value="on"' + (en === "on" ? " selected" : "") + '>On</option><option value="off"' + (en === "off" ? " selected" : "") + ">Off</option></select></td>" +
            '<td><select data-kid="' + k.id + '" data-f="currency">' + curOpts(own.currency || "", true) + "</select></td></tr>";
        }).join("") + "</tbody></table></div>" +
        '<p class="muted small-note">A learner is paid only when the device switch AND their own setting are on.</p>';
    }
    html += '<h4 class="money-h">🎁 Surprise gifts</h4><label class="sel">Surprise gifts per day <input class="num" type="number" min="0" max="10" step="1" id="gPerDay" value="' + st.gifts.perDay + '"></label>' +
      '<p class="muted small-note">Gifts are always virtual: stickers, critters, dress-up items and Prize Wheel tickets. Level-ups and streaks give one too.</p>' +
      '<p><button class="btn" id="mReset">↺ Reset money settings to defaults</button></p>';
    sec.insertAdjacentHTML("beforeend", html);

    function saved(what, patch) { H.set(patch); audit("money_settings", { what: what, patch: patch }); toast("Saved"); }
    sec.querySelector("#mOn").addEventListener("change", function (e) { saved("enabled", { money: { enabled: e.target.checked } }); renderTab(); });
    sec.querySelector("#mCur").addEventListener("change", function (e) { saved("currency", { money: { currency: e.target.value } }); renderTab(); });
    sec.querySelectorAll("input[data-lv]").forEach(function (inp) {
      inp.addEventListener("change", function () {
        var v = Math.round(Math.max(0, Math.min(+inp.max, parseFloat(inp.value) || 0)) * 100) / 100, levels = H.get().money.levels;
        inp.value = v;
        levels[+inp.getAttribute("data-lv")].amounts[inp.getAttribute("data-cur")] = v;
        saved("levels", { money: { levels: levels } });
      });
    });
    sec.querySelectorAll("select[data-kid]").forEach(function (sel) {
      sel.addEventListener("change", function () {
        var f = sel.getAttribute("data-f"), v = sel.value, one = {};
        one[f] = f === "enabled" ? (v === "on" ? true : v === "off" ? false : null) : v;   // null / "" = same as device
        var pk = {}; pk[sel.getAttribute("data-kid")] = one;
        saved("perKid", { money: { perKid: pk } }); renderTab();
      });
    });
    sec.querySelector("#gPerDay").addEventListener("change", function (e) {
      var v = Math.max(0, Math.min(10, Math.round(+e.target.value || 0))); e.target.value = v;
      saved("gifts", { gifts: { perDay: v } });
    });
    sec.querySelector("#mReset").addEventListener("click", function () {
      if (!confirm("Reset currency, amounts, learner switches and challenge levels to the defaults?")) return;
      var cur = H.get();
      H.reset(); H.set({ gifts: cur.gifts, adhoc: cur.adhoc });   // reset clears the whole key: keep gifts and AdHoc
      audit("money_settings", { what: "reset" }); toast("Money settings reset"); renderTab();
    });
  }

  /* ---------- 🎓 Academy: the syllabus (js/syllabus.js) and the AdHoc subject switch ---------- */
  function renderAcademy(host) {
    var Y = window.Syllabus, H = window.HubSettings;
    if (Y) {
      var sec = section(host, "🎓 Academy syllabus",
        "The Hub opens on the Academy: six subjects for every grade from Pre-K to Grade 5, in numbered units with \"I can\" goals. It is built from the US, UK (England) and Swedish national curricula; every unit lists where it sits in all three.");
      var NAMES = { pk: "Pre-K", kg: "KG", g1: "Grade 1", g2: "Grade 2", g3: "Grade 3", g4: "Grade 4", g5: "Grade 5" }, total = 0;
      var rows = Y.GRADES.map(function (g) {
        return "<tr><td><b>" + NAMES[g] + "</b></td>" + Y.SUBJECTS.map(function (sj) { var n = Y.units(g, sj.id).length; total += n; return "<td>" + n + "</td>"; }).join("") + "</tr>";
      }).join("");
      sec.insertAdjacentHTML("beforeend", '<p><a class="btn primary" href="../academy/syllabus.html">📚 Open the full syllabus</a></p>' +
        '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Units</th>' + Y.SUBJECTS.map(function (sj) { return "<th>" + sj.emoji + " " + esc(sj.name) + "</th>"; }).join("") +
        "</tr></thead><tbody>" + rows + "</tbody></table></div>" +
        '<p class="muted small-note">' + total + " units in all. Lessons are being added unit by unit; until then each unit shows the apps that already practise it.</p>");
    }
    if (!H) return;
    var on = H.get().adhoc.enabled;
    var ad = section(host, "🧪 AdHoc subject",
      "A subject of your own for one-off topics and practice tests, like \"Volcano test on Friday\". Learners see it on the Hub only while it is switched on.");
    ad.insertAdjacentHTML("beforeend", '<label class="switch-row"><input type="checkbox" id="adhocOn"' + (on ? " checked" : "") + "> Show the AdHoc subject on the Hub</label>");
    ad.querySelector("#adhocOn").addEventListener("change", function (e) {
      H.set({ adhoc: { enabled: e.target.checked } });
      audit("academy_settings", { adhoc: e.target.checked });
      toast(e.target.checked ? "AdHoc is on the Hub" : "AdHoc is hidden");
      renderTab();
    });
    if (window.AdhocStore) { if (S.adhocDraft) renderAdhocEditor(ad); else renderAdhocList(ad, on); }
  }

  /* AdHoc topics (js/adhoc.js): a list with on/off, edit, remove (hide) and restore, plus export/import */
  var GRADE_SHORT = { pk: "Pre-K", kg: "KG", g1: "G1", g2: "G2", g3: "G3", g4: "G4", g5: "G5" };
  function renderAdhocList(sec, on) {
    var A = window.AdhocStore, all = A.list(true), live = all.filter(function (t) { return !t.hid; }), gone = all.filter(function (t) { return t.hid; });
    var html = '<h4 class="money-h">Your topics</h4>' + (live.length
      ? '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Topic</th><th>Grades</th><th>Questions</th><th>Shown</th><th></th></tr></thead><tbody>' +
        live.map(function (t) {
          return "<tr><td>" + esc(t.emoji) + " <b>" + esc(t.title) + "</b></td><td>" + (t.grades.length ? t.grades.map(function (g) { return GRADE_SHORT[g]; }).join(", ") : "All") + "</td>" +
            "<td>" + t.questions.length + '</td><td><label class="switch-row"><input type="checkbox" data-on="' + esc(t.id) + '"' + (t.on !== false ? " checked" : "") + '> <span class="sr-only">Show ' + esc(t.title) + "</span></label></td>" +
            '<td><button class="btn small" data-edit="' + esc(t.id) + '">✏️ Edit</button> <button class="btn small" data-rm="' + esc(t.id) + '">🙈 Remove</button></td></tr>';
        }).join("") + "</tbody></table></div>"
      : '<p class="muted">No topics yet. Make one for a test coming up, a trip, or anything your learners need.</p>') +
      (on || !live.length ? "" : '<p class="muted small-note">The AdHoc switch is off, so learners don\'t see these yet.</p>') +
      '<div class="row-actions"><button class="btn primary" id="ahNew">＋ New topic</button>' +
      (live.length ? '<button class="btn" id="ahExport">⬇️ Export topics</button>' : "") +
      '<label class="btn">⬆️ Import topics<input type="file" id="ahImport" accept="application/json,.json" hidden></label></div>' +
      (gone.length ? '<details class="ah-gone"><summary>Removed topics (' + gone.length + ")</summary><ul>" + gone.map(function (t) {
        return "<li>" + esc(t.emoji) + " " + esc(t.title) + ' <button class="btn small" data-back="' + esc(t.id) + '">↩️ Restore</button></li>';
      }).join("") + "</ul></details>" : "");
    sec.insertAdjacentHTML("beforeend", html);
    sec.querySelectorAll("[data-on]").forEach(function (c) {
      c.addEventListener("change", function () { A.setOn(c.getAttribute("data-on"), c.checked); audit("adhoc_topic", { id: c.getAttribute("data-on"), on: c.checked }); toast(c.checked ? "Topic shown" : "Topic hidden"); });
    });
    sec.querySelectorAll("[data-edit]").forEach(function (b) {
      b.addEventListener("click", function () { S.adhocDraft = JSON.parse(JSON.stringify(A.get(b.getAttribute("data-edit")))); renderTab(); });
    });
    sec.querySelectorAll("[data-rm]").forEach(function (b) {
      b.addEventListener("click", function () {
        var t = A.get(b.getAttribute("data-rm"));
        if (!confirm("Remove \"" + t.title + "\"? Learners stop seeing it. You can restore it from Removed topics.")) return;
        A.remove(t.id); audit("adhoc_topic", { id: t.id, removed: true }); toast("Topic removed"); renderTab();
      });
    });
    sec.querySelectorAll("[data-back]").forEach(function (b) {
      b.addEventListener("click", function () { A.restore(b.getAttribute("data-back")); audit("adhoc_topic", { id: b.getAttribute("data-back"), restored: true }); toast("Topic restored"); renderTab(); });
    });
    sec.querySelector("#ahNew").addEventListener("click", function () {
      S.adhocDraft = { title: "", emoji: "🧪", grades: [], on: true, notes: "", questions: [{ type: "mc", prompt: "", choices: ["", "", ""], answer: 0, explain: "" }, { type: "tf", prompt: "", answer: true, explain: "" }] };
      renderTab();
    });
    var ex = sec.querySelector("#ahExport");
    if (ex) ex.addEventListener("click", function () { download("adhoc-topics-" + dayKey(Date.now()) + ".json", A.exportJSON(), "application/json"); audit("adhoc_export", {}); });
    sec.querySelector("#ahImport").addEventListener("change", function (e) {
      var f = e.target.files && e.target.files[0]; if (!f) return;
      var rd = new FileReader();
      rd.onload = function () {
        var r = A.importJSON(String(rd.result));
        if (r.error) { toast(r.error); return; }
        audit("adhoc_import", r); toast(r.added + " topics added" + (r.skipped ? ", " + r.skipped + " skipped" : "")); renderTab();
      };
      rd.readAsText(f);
    });
  }

  // The editor works on S.adhocDraft; typing updates it in place, and only adding/removing/changing a kind redraws.
  function renderAdhocEditor(sec) {
    var A = window.AdhocStore, d = S.adhocDraft;
    function qHtml(q, i) {
      var body = q.type === "tf"
        ? '<div class="ah-tf" role="radiogroup" aria-label="Right answer"><label><input type="radio" name="tf' + i + '" data-q="' + i + '" data-f="tf" value="1"' + (q.answer ? " checked" : "") + "> True</label>" +
          '<label><input type="radio" name="tf' + i + '" data-q="' + i + '" data-f="tf" value="0"' + (!q.answer ? " checked" : "") + "> False</label></div>"
        : '<div class="ah-choices">' + q.choices.map(function (c, k) {
            return '<div class="ah-choice"><input type="radio" name="mc' + i + '" data-q="' + i + '" data-f="answer" value="' + k + '"' + (q.answer === k ? " checked" : "") + ' aria-label="Answer ' + (k + 1) + ' is right">' +
              '<input type="text" maxlength="' + A.MAX.choice + '" data-q="' + i + '" data-f="choice" data-k="' + k + '" value="' + esc(c) + '" placeholder="Answer ' + (k + 1) + '"></div>';
          }).join("") + (q.choices.length < 4 ? '<button class="btn small" data-addch="' + i + '">＋ Answer</button>' : "") +
          (q.choices.length > 2 ? '<button class="btn small" data-rmch="' + i + '">− Answer</button>' : "") +
          '<p class="muted small-note">Tick the right answer. Choices are shuffled for learners.</p></div>';
      return '<fieldset class="ah-q"><legend>Question ' + (i + 1) + "</legend>" +
        '<div class="ah-row"><select data-q="' + i + '" data-f="type" aria-label="Kind of question"><option value="mc"' + (q.type === "mc" ? " selected" : "") + '>Multiple choice</option><option value="tf"' + (q.type === "tf" ? " selected" : "") + ">True or false</option></select>" +
        '<button class="btn small" data-rmq="' + i + '"' + (d.questions.length <= 2 ? " disabled" : "") + ">🗑️ Remove question</button></div>" +
        '<label class="ah-field">' + (q.type === "tf" ? "Sentence (true or false)" : "Question") + '<input type="text" maxlength="' + A.MAX.prompt + '" data-q="' + i + '" data-f="prompt" value="' + esc(q.prompt) + '"></label>' +
        body + '<label class="ah-field">Explanation shown after answering (optional)<input type="text" maxlength="' + A.MAX.explain + '" data-q="' + i + '" data-f="explain" value="' + esc(q.explain || "") + '"></label></fieldset>';
    }
    var html = '<div class="ah-edit"><h4 class="money-h">' + (d.id ? "Edit topic" : "New topic") + "</h4>" +
      '<div class="ah-row"><label class="ah-field grow">Title<input type="text" id="ahTitle" maxlength="' + A.MAX.title + '" value="' + esc(d.title) + '" placeholder="e.g. Volcano test on Friday"></label>' +
      '<label class="ah-field">Emoji<input type="text" id="ahEmoji" maxlength="8" value="' + esc(d.emoji) + '" style="width:5em"></label></div>' +
      '<fieldset class="ah-grades"><legend>Grades (none ticked = everyone)</legend>' + A.GRADES.map(function (g) {
        return '<label><input type="checkbox" data-grade="' + g + '"' + (d.grades.indexOf(g) >= 0 ? " checked" : "") + "> " + GRADE_SHORT[g] + "</label>";
      }).join("") + "</fieldset>" +
      '<label class="ah-field">Learn first: one fact per line (shown as a Learn card)<textarea id="ahNotes" rows="4" maxlength="' + A.MAX.notes + '">' + esc(d.notes) + "</textarea></label>" +
      d.questions.map(qHtml).join("") +
      '<div class="row-actions"><button class="btn" id="ahAddMc">＋ Multiple choice</button><button class="btn" id="ahAddTf">＋ True or false</button></div>' +
      '<p class="gate-msg" id="ahErr" role="alert"></p>' +
      '<div class="row-actions"><button class="btn primary" id="ahSave">💾 Save topic</button><button class="btn" id="ahCancel">Cancel</button></div></div>';
    sec.insertAdjacentHTML("beforeend", html);
    var box = sec.querySelector(".ah-edit");
    box.querySelector("#ahTitle").addEventListener("input", function (e) { d.title = e.target.value; });
    box.querySelector("#ahEmoji").addEventListener("input", function (e) { d.emoji = e.target.value; });
    box.querySelector("#ahNotes").addEventListener("input", function (e) { d.notes = e.target.value; });
    box.querySelectorAll("[data-grade]").forEach(function (c) {
      c.addEventListener("change", function () { d.grades = A.GRADES.filter(function (g) { var x = box.querySelector('[data-grade="' + g + '"]'); return x && x.checked; }); });
    });
    box.addEventListener("input", function (e) {
      var el = e.target, i = el.getAttribute("data-q"), f = el.getAttribute("data-f"); if (i == null) return;
      var q = d.questions[+i];
      if (f === "prompt") q.prompt = el.value; else if (f === "explain") q.explain = el.value; else if (f === "choice") q.choices[+el.getAttribute("data-k")] = el.value;
    });
    box.addEventListener("change", function (e) {
      var el = e.target, i = el.getAttribute("data-q"), f = el.getAttribute("data-f"); if (i == null) return;
      var q = d.questions[+i];
      if (f === "answer") q.answer = +el.value;
      else if (f === "tf") q.answer = el.value === "1";
      else if (f === "type") {
        d.questions[+i] = el.value === "tf" ? { type: "tf", prompt: q.prompt, answer: true, explain: q.explain } : { type: "mc", prompt: q.prompt, choices: ["", "", ""], answer: 0, explain: q.explain };
        renderTab();
      }
    });
    box.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      var i;
      if ((i = b.getAttribute("data-rmq")) != null) { d.questions.splice(+i, 1); renderTab(); }
      else if ((i = b.getAttribute("data-addch")) != null) { d.questions[+i].choices.push(""); renderTab(); }
      else if ((i = b.getAttribute("data-rmch")) != null) { var q = d.questions[+i]; q.choices.pop(); if (q.answer >= q.choices.length) q.answer = 0; renderTab(); }
    });
    box.querySelector("#ahAddMc").addEventListener("click", function () { d.questions.push({ type: "mc", prompt: "", choices: ["", "", ""], answer: 0, explain: "" }); renderTab(); });
    box.querySelector("#ahAddTf").addEventListener("click", function () { d.questions.push({ type: "tf", prompt: "", answer: true, explain: "" }); renderTab(); });
    box.querySelector("#ahCancel").addEventListener("click", function () { S.adhocDraft = null; renderTab(); });
    box.querySelector("#ahSave").addEventListener("click", function () {
      var r = A.save(d);
      if (r.error) { box.querySelector("#ahErr").textContent = r.error; return; }
      audit("adhoc_topic", { id: r.topic.id, saved: true, questions: r.topic.questions.length });
      S.adhocDraft = null; toast("Topic saved"); renderTab();
    });
  }

  /* ---------- 🐝 Spelling Bee: grown-ups' word sets (js/spellbee-store.js) + each learner's results ---------- */
  /* ---------------- 🎤 Reading Levels (../js/readlevel.js) ---------------- */
  // rl_<app> lives in each learner's namespace; Admin has no profile-store, so it reads/writes k<id>::rl_<app>
  var RL_APPS = [{ id: "phonics", name: "🦜 Phonics Pals", grades: ["kg"] }, { id: "readrocket", name: "🚀 Read-Aloud Rocket", grades: ["g3"] }];
  // " · 🧭 Medium reading level" for the progress cards
  function rlLabel(r, app) { var v = r.obj("rl_" + app), RL = window.ReadLevel; if (!RL || !v.lv) return ""; var L = RL.LEVELS[Math.max(1, Math.min(4, v.lv)) - 1]; return " · " + L.emoji + " " + L.tag + " reading level"; }
  function rlKey(kid, app) { return "k" + kid + "::rl_" + app; }
  function rlGet(kid, app) {
    var v = null; try { v = JSON.parse(localStorage.getItem(rlKey(kid, app)) || "null"); } catch (e) {}
    v = v && typeof v === "object" ? v : {};
    v.lv = Math.max(1, Math.min(4, +v.lv || 1)); v.max = Math.max(v.lv, Math.min(4, +v.max || 1));
    v.fuel = +v.fuel || 0; v.brave = +v.brave || 0; v.badges = Array.isArray(v.badges) ? v.badges : []; v.ups = Array.isArray(v.ups) ? v.ups : [];
    return v;
  }
  function renderReadLevels(host) {
    var RL = window.ReadLevel;
    var intro = section(host, "🎤 Reading Levels",
      "When a learner reads aloud to Echo (Phonics Pals) or Nova (Read-Aloud Rocket), the reading level decides how close a word must sound to count. Everyone starts on Easy so reading feels like winning, and moves up by reading well. Expert is the grade-level standard: every word said just right.");
    if (!RL) return;
    intro.insertAdjacentHTML("beforeend", '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Level</th><th>What counts as read</th><th>3 stars at</th></tr></thead><tbody>' +
      RL.LEVELS.map(function (L) {
        return "<tr><td>" + L.emoji + " <b>" + esc(L.tag) + "</b> · " + esc(L.name) + "</td><td>" + esc(L.say) + "</td><td>" + (L.acc ? Math.round(L.acc[0] * 100) + "% of words" : "every word") + "</td></tr>";
      }).join("") + "</tbody></table></div>" +
      '<p class="muted small-note">Moving up: reading a page as well as the next level wants, or saying a word right first time, earns ⚡ power; ' + RL.NEED + ' ⚡ unlocks the next level. Levels never drop by themselves. Brave badges (and Prize Wheel tickets) reward kids for trying hard words, even when they miss.</p>');
    var kids = DB.kids();
    var sec = section(host, "👧 Each learner", "Pick a level to change it. Choosing a higher level unlocks it for the learner too.");
    if (!kids.length) { sec.insertAdjacentHTML("beforeend", '<p class="muted">No learners yet.</p>'); return; }
    var rows = [];
    kids.forEach(function (k) {
      RL_APPS.forEach(function (a) {
        var v = rlGet(k.id, a.id), L = RL.LEVELS[v.lv - 1], fit = a.grades.indexOf(k.grade) >= 0;
        var badges = RL.BADGES.filter(function (b) { return v.badges.indexOf(b.id) >= 0; }).map(function (b) { return b.emoji; }).join(" ");
        rows.push("<tr" + (fit ? "" : ' class="muted"') + "><td>" + esc(k.avatar + " " + k.name) + "</td><td>" + a.name + (fit ? "" : " <small>(other grade)</small>") + "</td>" +
          '<td><select data-rlkid="' + esc(k.id) + '" data-rlapp="' + a.id + '" aria-label="Reading level">' + RL.LEVELS.map(function (x) {
            return '<option value="' + x.n + '"' + (x.n === v.lv ? " selected" : "") + ">" + x.emoji + " " + esc(x.tag) + (x.n > v.max ? " (locked)" : "") + "</option>";
          }).join("") + "</select></td>" +
          "<td>" + (v.max >= 4 ? "🏆 top level" : "⚡ " + v.fuel + "/" + RL.NEED) + "</td><td>💪 " + v.brave + (badges ? " · " + badges : "") + "</td></tr>");
      });
    });
    sec.insertAdjacentHTML("beforeend", '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Learner</th><th>App</th><th>Level</th><th>Next level</th><th>Brave tries</th></tr></thead><tbody>' + rows.join("") + "</tbody></table></div>");
    sec.querySelectorAll("[data-rlkid]").forEach(function (sel) {
      sel.addEventListener("change", function () {
        var kid = sel.dataset.rlkid, app = sel.dataset.rlapp, v = rlGet(kid, app), n = +sel.value;
        v.lv = n; v.max = Math.max(v.max, n);
        try { localStorage.setItem(rlKey(kid, app), JSON.stringify(v)); } catch (e) {}
        audit("reading_level", { kid: kid, app: app, level: n });
        renderTab();
      });
    });
  }
  function renderSpelling(host) {
    var P = window.SpellStore;
    var intro = section(host, "🐝 Spelling Bee",
      "Buzzy's Spelling Bee (3rd grade) comes with the 2026–27 school study words for grades 1–5 (250 words). Add your own word sets here for one-off practice tests, like this week's class list or the words for the school bee. They show up in the app under 🧪 Practice tests.");
    intro.insertAdjacentHTML("beforeend", '<p><a class="btn" href="../spellingbee/index.html">🐝 Open the Spelling Bee app</a></p>');
    if (!P) return;
    var sec = section(host, "📝 Word sets for practice tests", "Learners can Learn the words, unscramble them, take a scored test or play a Bee Contest with 3 hearts.");
    if (S.spellDraft) renderSpellEditor(sec); else renderSpellList(sec);
    renderSpellResults(host);
  }
  function renderSpellList(sec) {
    var P = window.SpellStore, all = P.list(true), live = all.filter(function (t) { return !t.hid; }), gone = all.filter(function (t) { return t.hid; });
    var html = (live.length
      ? '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Word set</th><th>Grades</th><th>Words</th><th>Shown</th><th></th></tr></thead><tbody>' +
        live.map(function (t) {
          return "<tr><td>" + esc(t.emoji) + " <b>" + esc(t.title) + '</b><br><small class="muted">' + esc(t.words.slice(0, 6).map(function (w) { return w.w; }).join(", ")) + (t.words.length > 6 ? "…" : "") + "</small></td>" +
            "<td>" + (t.grades.length ? t.grades.map(function (g) { return GRADE_SHORT[g]; }).join(", ") : "All") + "</td><td>" + t.words.length + "</td>" +
            '<td><label class="switch-row"><input type="checkbox" data-son="' + esc(t.id) + '"' + (t.on !== false ? " checked" : "") + '> <span class="sr-only">Show ' + esc(t.title) + "</span></label></td>" +
            '<td><button class="btn small" data-sedit="' + esc(t.id) + '">✏️ Edit</button> <button class="btn small" data-srm="' + esc(t.id) + '">🙈 Remove</button></td></tr>';
        }).join("") + "</tbody></table></div>"
      : '<p class="muted">No word sets yet. Make one for a spelling test coming up, or the words your learner keeps missing.</p>') +
      '<div class="row-actions"><button class="btn primary" id="sbNew">＋ New word set</button>' +
      (live.length ? '<button class="btn" id="sbExport">⬇️ Export sets</button>' : "") +
      '<label class="btn">⬆️ Import sets<input type="file" id="sbImport" accept="application/json,.json" hidden></label></div>' +
      (gone.length ? '<details class="ah-gone"><summary>Removed sets (' + gone.length + ")</summary><ul>" + gone.map(function (t) {
        return "<li>" + esc(t.emoji) + " " + esc(t.title) + ' <button class="btn small" data-sback="' + esc(t.id) + '">↩️ Restore</button></li>';
      }).join("") + "</ul></details>" : "");
    sec.insertAdjacentHTML("beforeend", html);
    sec.querySelectorAll("[data-son]").forEach(function (c) {
      c.addEventListener("change", function () { P.setOn(c.getAttribute("data-son"), c.checked); audit("spellbee_set", { id: c.getAttribute("data-son"), on: c.checked }); toast(c.checked ? "Word set shown" : "Word set hidden"); });
    });
    sec.querySelectorAll("[data-sedit]").forEach(function (b) {
      b.addEventListener("click", function () { var t = P.get(b.getAttribute("data-sedit")); S.spellDraft = { id: t.id, title: t.title, emoji: t.emoji, grades: t.grades.slice(), on: t.on, text: P.toLines(t.words) }; renderTab(); });
    });
    sec.querySelectorAll("[data-srm]").forEach(function (b) {
      b.addEventListener("click", function () {
        var t = P.get(b.getAttribute("data-srm"));
        if (!confirm("Remove \"" + t.title + "\"? Learners stop seeing it. You can restore it from Removed sets.")) return;
        P.remove(t.id); audit("spellbee_set", { id: t.id, removed: true }); toast("Word set removed"); renderTab();
      });
    });
    sec.querySelectorAll("[data-sback]").forEach(function (b) {
      b.addEventListener("click", function () { P.restore(b.getAttribute("data-sback")); audit("spellbee_set", { id: b.getAttribute("data-sback"), restored: true }); toast("Word set restored"); renderTab(); });
    });
    sec.querySelector("#sbNew").addEventListener("click", function () { S.spellDraft = { title: "", emoji: "🐝", grades: ["g3"], on: true, text: "" }; renderTab(); });
    var ex = sec.querySelector("#sbExport");
    if (ex) ex.addEventListener("click", function () { download("spelling-bee-sets-" + dayKey(Date.now()) + ".json", P.exportJSON(), "application/json"); audit("spellbee_export", {}); });
    sec.querySelector("#sbImport").addEventListener("change", function (e) {
      var f = e.target.files && e.target.files[0]; if (!f) return;
      var rd = new FileReader();
      rd.onload = function () {
        var r = P.importJSON(String(rd.result));
        if (r.error) { toast(r.error); return; }
        audit("spellbee_import", r); toast(r.added + " word sets added" + (r.skipped ? ", " + r.skipped + " skipped" : "")); renderTab();
      };
      rd.readAsText(f);
    });
  }
  // One word per line: "word | meaning | sentence". Meaning and sentence are optional but make the test feel like a real bee.
  function renderSpellEditor(sec) {
    var P = window.SpellStore, d = S.spellDraft;
    var html = '<div class="ah-edit"><h4 class="money-h">' + (d.id ? "Edit word set" : "New word set") + "</h4>" +
      '<div class="ah-row"><label class="ah-field grow">Title<input type="text" id="sbTitle" maxlength="' + P.MAX.title + '" value="' + esc(d.title) + '" placeholder="e.g. Friday spelling test, week 9"></label>' +
      '<label class="ah-field">Emoji<input type="text" id="sbEmoji" maxlength="8" value="' + esc(d.emoji) + '" style="width:5em"></label></div>' +
      '<fieldset class="ah-grades"><legend>Grades (none ticked = everyone)</legend>' + P.GRADES.map(function (g) {
        return '<label><input type="checkbox" data-sgrade="' + g + '"' + (d.grades.indexOf(g) >= 0 ? " checked" : "") + "> " + GRADE_SHORT[g] + "</label>";
      }).join("") + "</fieldset>" +
      '<label class="ah-field">Words: one per line, as <code>word | meaning | sentence</code>' +
        '<textarea id="sbText" rows="12" spellcheck="false" placeholder="necessary | needed; must have | Water is necessary for plants to grow.&#10;rhythm | a regular beat | Clap to the rhythm of the song.&#10;colour (or color) | how something looks: red, blue… | My favourite colour is green.&#10;beautiful">' + esc(d.text) + "</textarea></label>" +
      '<p class="muted small-note">Meaning and sentence are optional, but Buzzy reads them aloud when your learner asks, like a real pronouncer. Add another accepted spelling with <code>(or …)</code>. Up to ' + P.MAX.words + " words.</p>" +
      '<p class="muted small-note" id="sbCount"></p>' +
      '<p class="gate-msg" id="sbErr" role="alert"></p>' +
      '<div class="row-actions"><button class="btn primary" id="sbSave">💾 Save word set</button><button class="btn" id="sbCancel">Cancel</button></div></div>';
    sec.insertAdjacentHTML("beforeend", html);
    var box = sec.querySelector(".ah-edit");
    function count() {
      var ws = P.parseLines(d.text), withDef = ws.filter(function (w) { return w.d; }).length;
      box.querySelector("#sbCount").textContent = ws.length + (ws.length === 1 ? " word" : " words") + (ws.length ? " · " + withDef + " with a meaning" : "");
    }
    count();
    box.querySelector("#sbTitle").addEventListener("input", function (e) { d.title = e.target.value; });
    box.querySelector("#sbEmoji").addEventListener("input", function (e) { d.emoji = e.target.value; });
    box.querySelector("#sbText").addEventListener("input", function (e) { d.text = e.target.value; count(); });
    box.querySelectorAll("[data-sgrade]").forEach(function (c) {
      c.addEventListener("change", function () { d.grades = P.GRADES.filter(function (g) { var x = box.querySelector('[data-sgrade="' + g + '"]'); return x && x.checked; }); });
    });
    box.querySelector("#sbCancel").addEventListener("click", function () { S.spellDraft = null; renderTab(); });
    box.querySelector("#sbSave").addEventListener("click", function () {
      var r = P.save({ id: d.id, title: d.title, emoji: d.emoji, grades: d.grades, on: d.on, text: d.text });
      if (r.error) { box.querySelector("#sbErr").textContent = r.error; return; }
      audit("spellbee_set", { id: r.set.id, saved: true, words: r.set.words.length });
      S.spellDraft = null; toast("Word set saved"); renderTab();
    });
  }
  // Every learner's Spelling Bee: words mastered, Tricky Jar, and their practice-test scores.
  function renderSpellResults(host) {
    var kids = DB.kids(), P = window.SpellStore, sets = P ? P.list(true) : [];
    var sec = section(host, "📊 Results", "Saved on this device for each learner. A word is mastered after it is spelled right on the first try twice.");
    if (!kids.length) { sec.insertAdjacentHTML("beforeend", '<p class="muted">No learners yet.</p>'); return; }
    var rows = kids.map(function (k) {
      var r = reader(k.id), w = r.obj("sb_words"), t = r.obj("sb_tests"), jar = r.arr("sb_jar");
      var m = Object.keys(w).filter(function (x) { return w[x] && w[x].m >= 2; }).length;
      var tests = Object.keys(t).map(function (id) {
        var s = sets.filter(function (x) { return x.id === id; })[0], v = t[id];
        return "<div>" + esc(s ? s.emoji + " " + s.title : "Removed set") + ": best <b>" + v.best + "%</b>, last " + v.last + "% (" + v.tries + (v.tries === 1 ? " try" : " tries") + ")" +
          (v.missed && v.missed.length ? '<br><small class="muted">Missed last time: ' + esc(v.missed.join(", ")) + "</small>" : "") + "</div>";
      }).join("");
      return "<tr><td>" + esc(k.avatar + " " + k.name) + "</td><td>" + m + "</td><td>" + (jar.length ? esc(jar.slice(0, 12).join(", ")) + (jar.length > 12 ? "…" : "") : "—") + "</td><td>" + (tests || '<span class="muted">none yet</span>') + "</td></tr>";
    }).join("");
    sec.insertAdjacentHTML("beforeend", '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Learner</th><th>Mastered</th><th>Tricky Jar</th><th>Practice tests</th></tr></thead><tbody>' + rows + "</tbody></table></div>");
  }

  // Which level each challenge pays (Silver unless changed here).
  function renderChallengeLevels(host, B, H) {
    var rules = section(host, "Which challenges pay what",
      "Only big, hard wins pay: a whole phase, a Phase Check, a no-mistake run. Everyday wins still earn stars and stickers. Reading Adventures keeps its own PIN-protected rule (its count × the Silver amount).");
    var m = H ? H.get().money : null, byApp = {};
    B.CHALLENGES.forEach(function (c) { (byApp[c.app] = byApp[c.app] || []).push(c); });
    function lvSelect(c) {
      if (!m) return "$1";
      var cur = B.levelOf(c);
      return '<select data-ch="' + esc(c.id) + '" aria-label="Level for ' + esc(c.title) + '">' + m.levels.map(function (l) {
        return '<option value="' + l.id + '"' + (l.id === cur ? " selected" : "") + ">" + l.emoji + " " + esc(l.name) + " · " + H.format(l.amounts[m.currency], m.currency) + "</option>";
      }).join("") + "</select>";
    }
    rules.insertAdjacentHTML("beforeend", '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>App</th><th>Challenge</th><th>Pays</th></tr></thead><tbody>' +
      Object.keys(byApp).map(function (a) {
        var ap = appById(a);
        return byApp[a].map(function (c, i) {
          return "<tr><td>" + (i ? "" : ap.emoji + " " + esc(ap.name)) + "</td><td>" + esc(c.title) + (c.every ? " <span class=\"pill\">each time</span>" : "") + "</td><td>" + lvSelect(c) + "</td></tr>";
        }).join("");
      }).join("") + "</tbody></table></div>");
    rules.querySelectorAll("select[data-ch]").forEach(function (sel) {
      sel.addEventListener("change", function () {
        var lv = {}; lv[sel.getAttribute("data-ch")] = sel.value;
        H.set({ money: { levelOf: lv } });
        audit("money_settings", { what: "challenge_level", id: sel.getAttribute("data-ch"), level: sel.value });
        toast("Saved");
      });
    });
  }

  function renderStudents(host) {
    var kids = DB.kids();
    var addSec = section(host, "➕ Add a new student", "New students appear on the Hub's “Who's learning today?” screen straight away.");
    var form = document.createElement("form"); form.className = "add-form";
    form.innerHTML =
      '<label>Name<input id="nsName" maxlength="24" required placeholder="e.g. Maya"></label>' +
      '<label>Grade<select id="nsGrade">' + gradeOptions() + '</select></label>' +
      '<div class="ava-pick" id="nsAva" role="radiogroup" aria-label="Avatar"></div>' +
      '<button class="btn primary" type="submit">Add student</button>';
    addSec.appendChild(form);
    var chosen = DB.AVATARS[Math.floor(Math.random() * DB.AVATARS.length)];
    DB.AVATARS.forEach(function (a) {
      var b = document.createElement("button"); b.type = "button"; b.className = "ava" + (a === chosen ? " sel" : ""); b.textContent = a;
      b.setAttribute("aria-label", "Avatar " + a);
      b.addEventListener("click", function () { chosen = a; form.querySelectorAll(".ava").forEach(function (x) { x.classList.toggle("sel", x === b); }); });
      $("nsAva").appendChild(b);
    });
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var name = $("nsName").value.trim(); if (!name) return;
      var k = DB.addKid(name, chosen, $("nsGrade").value, { activate: false, by: "admin" });
      audit("student_add", { id: k.id, name: k.name, grade: k.grade });
      toast("Added " + k.name + " " + k.avatar);
      renderFilters(); renderTab();
    });

    var listSec = section(host, "👧 Students (" + kids.length + ")", "Click a student's numbers to open their Overview.");
    if (!kids.length) { listSec.insertAdjacentHTML("beforeend", '<p class="muted">No students yet — add one above.</p>'); return; }
    var grid = document.createElement("div"); grid.className = "students"; listSec.appendChild(grid);
    var activeId = DB.activeId();
    kids.forEach(function (k) {
      var evs = S.events.filter(function (e) { return e.kid === k.id; });
      var A = analyze(evs, 0, Date.now()), g = DB.GRADES[k.grade] || DB.GRADES.kg;
      var card = document.createElement("div"); card.className = "student";
      card.innerHTML =
        '<div class="st-head"><span class="st-ava">' + k.avatar + '</span><div><div class="st-name">' + esc(k.name) +
        (k.id === activeId ? ' <span class="pill">logged in</span>' : "") + '</div><div class="st-grade">' + g.emoji + " " + g.label +
        " · joined " + shortDate(k.created) + '</div></div></div>' +
        '<div class="st-stats"><span><b>' + fmtMin(mins(A.timeMs)) + '</b> learning</span><span><b>' + (A.accuracy == null ? "—" : A.accuracy + "%") +
        '</b> accuracy</span><span><b>' + A.completes + '</b> finished</span><span>last active <b>' + timeAgo(A.last) + '</b></span></div>' +
        '<label class="st-notes">Notes<textarea rows="2" placeholder="Private notes for grown-ups"></textarea></label>' +
        '<div class="st-actions"><button class="btn small" data-act="view">📊 Overview</button><button class="btn small" data-act="edit">✏️ Edit</button>' +
        '<button class="btn small" data-act="login">🔑 Log in on Hub</button><button class="btn small danger" data-act="remove">🗑️ Remove</button></div>';
      var notes = card.querySelector("textarea");
      ADB.students().then(function (rows) { rows.forEach(function (r) { if (r.id === k.id && r.notes) notes.value = r.notes; }); });
      notes.addEventListener("change", function () {
        ADB.students().then(function (rows) {
          var row = null; rows.forEach(function (r) { if (r.id === k.id) row = r; });
          row = Object.assign({}, k, row || {}, { notes: notes.value });
          return ADB.putStudent(row);
        }).then(function () { audit("student_notes", { id: k.id }); toast("Notes saved"); });
      });
      card.querySelector('[data-act="view"]').addEventListener("click", function () { S.kid = k.id; S.tab = "overview"; remember(); renderFilters(); renderTabs(); renderTab(); });
      card.querySelector('[data-act="login"]').addEventListener("click", function () { DB.setActive(k.id); audit("student_login_set", { id: k.id }); toast(k.name + " is now logged in on the Hub"); renderTab(); });
      card.querySelector('[data-act="edit"]').addEventListener("click", function () { editStudent(k); });
      card.querySelector('[data-act="remove"]').addEventListener("click", function () {
        if (!confirm("Remove " + k.name + "?\n\nTheir activity history stays in the database (marked as removed) and can still be exported. Their saved app progress stays on this device.")) return;
        DB.removeKid(k.id); audit("student_remove", { id: k.id, name: k.name });
        toast("Removed " + k.name); renderFilters(); renderTab();
      });
      grid.appendChild(card);
    });
  }
  function editStudent(k) {
    var dlg = $("dialog");
    dlg.innerHTML = '<form method="dialog" class="dlg"><h3>Edit ' + esc(k.name) + '</h3>' +
      '<label>Name<input id="edName" maxlength="24" value="' + esc(k.name) + '"></label>' +
      '<label>Grade<select id="edGrade">' + gradeOptions() + '</select></label>' +
      '<div class="ava-pick" id="edAva"></div>' +
      '<div class="dlg-actions"><button class="btn" value="cancel">Cancel</button><button class="btn primary" id="edSave" value="ok">Save</button></div></form>';
    $("edGrade").value = k.grade;
    var ava = k.avatar;
    DB.AVATARS.forEach(function (a) {
      var b = document.createElement("button"); b.type = "button"; b.className = "ava" + (a === ava ? " sel" : ""); b.textContent = a;
      b.addEventListener("click", function () { ava = a; dlg.querySelectorAll(".ava").forEach(function (x) { x.classList.toggle("sel", x === b); }); });
      $("edAva").appendChild(b);
    });
    $("edSave").addEventListener("click", function () {
      var patch = { name: $("edName").value, grade: $("edGrade").value, avatar: ava };
      DB.updateKid(k.id, patch); audit("student_edit", { id: k.id, from: { name: k.name, grade: k.grade }, to: patch });
      setTimeout(function () { renderFilters(); renderTab(); toast("Saved"); }, 0);
    });
    dlg.showModal();
  }

  /* ---------- Progress ---------- */
  function renderProgress(host) {
    var kids = S.kid === "all" ? DB.kids() : [kidById(S.kid)].filter(Boolean);
    if (!kids.length) { section(host, "No students yet", "Add a student in the Students tab to see progress."); return; }
    var b = rangeBounds();
    kids.forEach(function (k) {
      var r = reader(k.id), A = analyze(S.events.filter(function (e) { return e.kid === k.id; }), b.since, b.until);
      var sec = section(host, k.avatar + " " + esc(k.name) + " — app by app",
        "Completion comes from each app's saved progress; time, answers and accuracy from the last " + S.days + " days.");
      var rows = APPS.filter(function (a) { return !a.internal && a.grades.indexOf(DB.band(k.grade)) >= 0; }).map(function (a) {
        var p = a.progress ? a.progress(r, k) : null, s = A.apps[a.id] || {};
        return { a: a, p: p, s: s };
      });
      var t = '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>App</th><th>Completion</th><th class="num">Time</th><th class="num">Answers</th><th class="num">Accuracy</th><th class="num">Finished</th><th>Last used</th></tr></thead><tbody>';
      rows.forEach(function (x) {
        var share = x.p && x.p.total ? Math.min(100, Math.round(100 * x.p.done / x.p.total)) : null;
        var acc = x.s.answers ? pct(x.s.correct, x.s.answers) : null;
        t += "<tr><td>" + x.a.emoji + " " + esc(x.a.name) + "</td><td>" +
          (share != null ? '<div class="meter" title="' + share + '%"><span style="width:' + share + '%"></span></div>' : "") +
          '<span class="muted small">' + esc(x.p ? x.p.label : "—") + "</span></td>" +
          '<td class="num">' + (x.s.timeMs ? fmtMin(mins(x.s.timeMs)) : "—") + '</td><td class="num">' + (x.s.answers || "—") +
          '</td><td class="num">' + (acc == null ? "—" : statusBadge(acc)) + '</td><td class="num">' + (x.s.completes || "—") +
          "</td><td>" + (x.s.last ? timeAgo(x.s.last) : '<span class="muted">not in range</span>') + "</td></tr>";
      });
      t += "</tbody></table></div>";
      sec.insertAdjacentHTML("beforeend", t);

      var skills = Object.keys(A.skills).map(function (key) { return A.skills[key]; }).sort(function (x, y) { return y.answers - x.answers; });
      if (skills.length) {
        var st = '<details class="skills"><summary>Skill breakdown (' + skills.length + " skills)</summary>" +
          '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Skill</th><th>App</th><th class="num">Answers</th><th class="num">Accuracy</th><th class="num">Last 5</th></tr></thead><tbody>';
        skills.forEach(function (s) {
          var last5 = s.recent.slice(-5);
          st += "<tr><td>" + esc(s.skill) + "</td><td>" + esc(appById(s.app).name) + '</td><td class="num">' + s.answers + '</td><td class="num">' +
            statusBadge(pct(s.correct, s.answers)) + '</td><td class="num">' + last5.map(function (v) { return v ? "✅" : "❌"; }).join("") + "</td></tr>";
        });
        sec.insertAdjacentHTML("beforeend", st + "</tbody></table></div></details>");
      }
    });
  }
  // status = icon + label + colour (never colour alone)
  function statusBadge(p) {
    if (p == null) return "—";
    var cls = p >= 85 ? "good" : p >= 70 ? "warning" : "critical", icon = p >= 85 ? "●" : p >= 70 ? "▲" : "■";
    return '<span class="status ' + cls + '">' + icon + " " + p + "%</span>";
  }

  /* ---------- Suggestions & improvements ---------- */
  function buildSuggestions(kid, evs) {
    var out = [], all = analyze(evs, 0, Date.now()), b = rangeBounds(), A = analyze(evs, b.since, b.until), r = reader(kid.id), name = esc(kid.name);
    var skills = Object.keys(A.skills).map(function (k) { return A.skills[k]; });
    skills.filter(function (s) { return s.answers >= 5 && s.correct / s.answers < 0.7; })
      .sort(function (x, y) { return x.correct / x.answers - y.correct / y.answers; }).slice(0, 3).forEach(function (s) {
        out.push({ icon: "🎯", tone: "critical", title: "Practise “" + esc(s.skill) + "”",
          text: name + " got " + s.correct + " of " + s.answers + " right (" + pct(s.correct, s.answers) + "%) in " + esc(appById(s.app).name) + ". A short daily round here will help most." });
      });
    skills.filter(function (s) { return s.answers >= 10 && s.correct / s.answers >= 0.92; }).slice(0, 2).forEach(function (s) {
      out.push({ icon: "🚀", tone: "good", title: "Ready for a challenge in “" + esc(s.skill) + "”",
        text: pct(s.correct, s.answers) + "% accuracy over " + s.answers + " answers — move on to the next level or a harder app." });
    });
    var used = {}; Object.keys(all.apps).forEach(function (k) { used[k] = 1; });
    var untried = APPS.filter(function (a) { return !a.internal && a.id !== "rewards" && a.grades.indexOf(DB.band(kid.grade)) >= 0 && !used[a.id]; });
    if (untried.length) out.push({ icon: "🧭", tone: "", title: "Apps " + name + " hasn't tried",
      text: untried.slice(0, 5).map(function (a) { return a.emoji + " " + esc(a.name); }).join(", ") + (untried.length > 5 ? " and " + (untried.length - 5) + " more" : "") + "." });
    if (all.last && Date.now() - all.last > 3 * DAY) out.push({ icon: "⏰", tone: "warning", title: "It's been " + timeAgo(all.last).replace(" ago", ""),
      text: "No learning since " + fullTime(all.last) + ". A 10-minute session today keeps the habit going." });
    APPS.forEach(function (a) {
      if (!a.progress || a.grades.indexOf(DB.band(kid.grade)) < 0) return;
      var p = a.progress(r, kid);
      if (p.total && p.done / p.total >= 0.75 && p.done < p.total) out.push({ icon: "🏁", tone: "good", title: "Almost done with " + esc(a.name),
        text: p.label + " — just " + (p.total - p.done) + " to go. Great moment for a finishing push!" });
    });
    var subj = Object.keys(A.subjects).filter(function (s) { return s !== "Hub"; });
    var tot = subj.reduce(function (s, k) { return s + A.subjects[k]; }, 0);
    subj.forEach(function (s) {
      if (tot > 20 * 60000 && A.subjects[s] / tot > 0.7) out.push({ icon: "⚖️", tone: "warning", title: "Mostly " + s,
        text: Math.round(100 * A.subjects[s] / tot) + "% of learning time went to " + s + ". Mixing in another subject builds balance." });
    });
    var bestH = null; Object.keys(A.hourAcc).forEach(function (h) { var x = A.hourAcc[h]; if (x.answers >= 10 && (!bestH || x.correct / x.answers > bestH.acc)) bestH = { h: +h, acc: x.correct / x.answers }; });
    if (bestH) out.push({ icon: "🌞", tone: "", title: "Best time to learn: around " + ((bestH.h % 12) || 12) + (bestH.h < 12 ? " am" : " pm"),
      text: name + " is most accurate at this hour (" + Math.round(100 * bestH.acc) + "%). Schedule tricky practice then." });
    if (A.sessions >= 4 && A.timeMs / A.sessions < 2 * 60000) out.push({ icon: "⌛", tone: "warning", title: "Very short sessions",
      text: "Average session is " + fmtMin(mins(A.timeMs / A.sessions)) + ". Sitting with " + name + " for the first few minutes can help them settle in." });
    if (!out.length) out.push({ icon: "🌱", tone: "", title: "Keep going!", text: "Not enough activity yet for specific advice — suggestions appear as " + name + " plays." });
    return out;
  }
  function buildImprovements(evs) {
    var out = [], b = rangeBounds(), A = analyze(evs, b.since, b.until), all = analyze(evs, 0, Date.now());
    Object.keys(A.apps).forEach(function (id) {
      var a = A.apps[id], m = appById(id); if (m.internal) return;
      if (a.answers >= 15 && a.correct / a.answers < 0.6) out.push({ icon: "🧗", tone: "critical", title: m.name + " may be too hard",
        text: "Only " + pct(a.correct, a.answers) + "% correct over " + a.answers + " answers. Add hints, an easier warm-up level, or a teach step before questions." });
      if (a.answers >= 25 && a.correct / a.answers > 0.95) out.push({ icon: "📈", tone: "good", title: m.name + " may be too easy",
        text: pct(a.correct, a.answers) + "% correct over " + a.answers + " answers. Add a harder tier or timed challenge." });
      var idle = A.idleSessions[id] || 0;
      if (a.sessions >= 4 && idle / a.sessions > 0.5 && ["arcade", "rewards", "billofrights"].indexOf(id) < 0) out.push({ icon: "🚪", tone: "warning", title: "Kids leave " + m.name + " quickly",
        text: idle + " of " + a.sessions + " sessions ended without a single answer. The start screen may be confusing — make the first step one big obvious button." });
    });
    var ranked = Object.keys(A.apps).filter(function (k) { return !appById(k).internal; }).sort(function (x, y) { return A.apps[y].timeMs - A.apps[x].timeMs; });
    if (ranked.length && A.apps[ranked[0]].timeMs > 15 * 60000) {
      var fav = appById(ranked[0]);
      out.push({ icon: "❤️", tone: "good", title: "Grow the favourite: " + fav.name, text: "Most-used app (" + fmtMin(mins(A.apps[ranked[0]].timeMs)) + "). More levels, stories or rewards here is the safest investment." });
    }
    DB.kids().forEach(function (k) {
      var r = reader(k.id);
      APPS.forEach(function (a) {
        if (!a.progress || a.grades.indexOf(DB.band(k.grade)) < 0) return;
        var p = a.progress(r, k);
        if (p.total && p.done >= p.total) out.push({ icon: "📚", tone: "", title: esc(k.name) + " finished all of " + a.name, text: "Add new content (" + p.label + ") so there's something fresh to do." });
      });
    });
    var never = APPS.filter(function (a) { return !a.internal && !all.apps[a.id] && a.id !== "rewards"; });
    if (never.length && DB.kids().length) out.push({ icon: "👻", tone: "warning", title: "Apps nobody has opened yet",
      text: never.map(function (a) { return a.emoji + " " + a.name; }).join(", ") + ". Feature them on the Hub, or check they still fit the kids' grades." });
    var skills = Object.keys(A.skills).map(function (k) { return A.skills[k]; }).filter(function (s) { return s.answers - s.correct >= 5; })
      .sort(function (x, y) { return (y.answers - y.correct) - (x.answers - x.correct); }).slice(0, 3);
    skills.forEach(function (s) {
      out.push({ icon: "🛠️", tone: "", title: "Build extra practice for “" + esc(s.skill) + "”", text: (s.answers - s.correct) + " wrong answers in " + appById(s.app).name + " — the most-missed skill. A dedicated mini-game or worked example would help." });
    });
    if (!out.length) out.push({ icon: "🌱", tone: "", title: "Collecting data", text: "Improvement ideas appear once the kids have used the apps for a while." });
    return out;
  }
  function cards(sec, items) {
    var wrap = document.createElement("div"); wrap.className = "ideas"; sec.appendChild(wrap);
    items.forEach(function (it) {
      var d = document.createElement("div"); d.className = "idea " + (it.tone || "");
      d.innerHTML = '<span class="idea-icon">' + it.icon + '</span><div><div class="idea-title">' + it.title + '</div><div class="idea-text">' + it.text + "</div></div>";
      wrap.appendChild(d);
    });
  }
  function renderSuggest(host) {
    var kids = S.kid === "all" ? DB.kids() : [kidById(S.kid)].filter(Boolean);
    kids.forEach(function (k) {
      var sec = section(host, "💡 For " + k.avatar + " " + esc(k.name), "What to practise next — based on the last " + S.days + " days of answers, time and progress.");
      cards(sec, buildSuggestions(k, S.events.filter(function (e) { return e.kid === k.id; })));
    });
    var imp = section(host, "🛠️ Ideas to improve the apps", "For the grown-up who builds the apps — spotted from " + scopeName() + ".");
    cards(imp, buildImprovements(filteredEvents()));
  }

  /* ---------- Forecast ---------- */
  function linreg(ys) { // least squares over the non-null points → {m, b}
    var pts = []; ys.forEach(function (y, x) { if (y != null) pts.push([x, y]); });
    if (pts.length < 2) return null;
    var n = pts.length, sx = 0, sy = 0, sxy = 0, sxx = 0;
    pts.forEach(function (p) { sx += p[0]; sy += p[1]; sxy += p[0] * p[1]; sxx += p[0] * p[0]; });
    var den = n * sxx - sx * sx; if (!den) return null;
    var m = (n * sxy - sx * sy) / den; return { m: m, b: (sy - m * sx) / n };
  }
  function renderForecast(host) {
    var evs = filteredEvents(), WEEKS = 8, AHEAD = 4, now = Date.now();
    var weekStart = startOfDay(now - ((new Date(now).getDay() + 6) % 7) * DAY); // this Monday
    var starts = []; for (var i = WEEKS - 1; i >= 0; i--) starts.push(weekStart - i * 7 * DAY);
    var weekly = starts.map(function (s) { return analyze(evs, s, s + 7 * DAY - 1); });
    var minutes = weekly.map(function (w) { return mins(w.timeMs); });
    var acc = weekly.map(function (w) { return w.answers ? 100 * w.correct / w.answers : null; });
    // project this (partial) week to a full week before fitting
    var dayIntoWeek = Math.max(1, (now - weekStart) / DAY);
    var minutesAdj = minutes.slice(); minutesAdj[WEEKS - 1] = minutes[WEEKS - 1] * 7 / dayIntoWeek;
    var lm = linreg(minutesAdj.map(function (v, i) { return weekly.slice(0, i + 1).some(function (w) { return w.timeMs; }) ? v : null; }));
    var la = linreg(acc);
    var labels = starts.map(function (s) { return "Wk of " + shortDate(s); });
    for (var j = 1; j <= AHEAD; j++) labels.push("Wk of " + shortDate(weekStart + j * 7 * DAY));
    var mSeries = minutes.concat(Array(AHEAD).fill(null)), aSeries = acc.concat(Array(AHEAD).fill(null));
    if (lm) for (var k = 0; k < AHEAD; k++) mSeries[WEEKS + k] = Math.max(0, lm.m * (WEEKS + k) + lm.b);
    if (la) for (var k2 = 0; k2 < AHEAD; k2++) aSeries[WEEKS + k2] = Math.max(0, Math.min(100, la.m * (WEEKS + k2) + la.b));
    if (lm) mSeries[WEEKS - 1] = minutes[WEEKS - 1];

    var tiles = document.createElement("div"); tiles.className = "stats";
    var nextWeek = lm ? Math.max(0, lm.m * WEEKS + lm.b) : null;
    var acc4 = la ? Math.max(0, Math.min(100, la.m * (WEEKS + 3) + la.b)) : null;
    var hasAcc = acc.some(function (v) { return v != null; });
    tiles.innerHTML =
      statTile("Expected time next week", nextWeek == null ? "—" : fmtMin(nextWeek), lm ? (lm.m >= 0 ? "▲ trending up " : "▼ trending down ") + fmtMin(Math.abs(lm.m)) + "/week" : "needs 2+ weeks of data") +
      statTile("Expected accuracy in 4 weeks", acc4 == null ? "—" : Math.round(acc4) + "%", la ? (la.m >= 0 ? "▲ +" : "▼ ") + (Math.round(la.m * 10) / 10) + " pts/week" : (hasAcc ? "needs 2+ weeks of answers" : "no answers yet")) +
      statTile("Projected this month", fmtMin(mins(analyze(evs, startOfDay(now - 29 * DAY), now).timeMs) / 30 * 30), "at the last 30 days' pace");
    host.appendChild(tiles);

    var grid = document.createElement("div"); grid.className = "grid2"; host.appendChild(grid);
    var s1 = section(grid, "Weekly learning time — actual and forecast", "Solid = actual minutes per week; dashed = straight-line forecast for the next 4 weeks.");
    C.line(chartBox(s1), { labels: labels, xName: "Week", fmt: function (v) { return Math.round(v) + ""; },
      series: [{ name: "Minutes per week", color: "var(--s1)", values: mSeries, forecastFrom: lm ? WEEKS - 1 : null }], empty: "No learning time recorded yet." });
    var s2 = section(grid, "Weekly accuracy — actual and forecast", "Where accuracy is heading if the current trend holds.");
    C.line(chartBox(s2), { labels: labels, xName: "Week", yMax: 100, fmt: function (v) { return Math.round(v) + "%"; },
      series: [{ name: "Accuracy", color: "var(--s3)", values: aSeries, forecastFrom: la ? WEEKS - 1 : null }], empty: "No answered questions yet." });

    // completion ETAs
    var kids = S.kid === "all" ? DB.kids() : [kidById(S.kid)].filter(Boolean);
    var s3 = section(host, "🏁 When will they finish?", "Estimated from how many lessons/stories/levels each student finished in the last 28 days.");
    var t = '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Student</th><th>App</th><th>Now</th><th class="num">Pace</th><th>Estimated finish</th></tr></thead><tbody>', rows = 0;
    kids.forEach(function (k) {
      var r = reader(k.id), recent = analyze(S.events.filter(function (e) { return e.kid === k.id; }), now - 28 * DAY, now);
      APPS.forEach(function (a) {
        if (!a.progress || a.grades.indexOf(DB.band(k.grade)) < 0) return;
        var p = a.progress(r, k); if (!p.total) return;
        var rate = ((recent.apps[a.id] || {}).completes || 0) / 4; // per week
        if (!p.done && !rate) return;
        var left = p.total - p.done, eta;
        if (left <= 0) eta = '<span class="status good">● finished</span>';
        else if (!rate) eta = '<span class="muted">no recent progress</span>';
        else { var wks = left / rate; eta = shortDate(now + wks * 7 * DAY) + ' <span class="muted small">(~' + (wks < 1 ? Math.ceil(wks * 7) + " days" : Math.ceil(wks) + " weeks") + ")</span>"; }
        t += "<tr><td>" + k.avatar + " " + esc(k.name) + "</td><td>" + a.emoji + " " + esc(a.name) + "</td><td>" + esc(p.label) + '</td><td class="num">' +
          (rate ? (Math.round(rate * 10) / 10) + "/week" : "—") + "</td><td>" + eta + "</td></tr>"; rows++;
      });
    });
    t += "</tbody></table></div>";
    s3.insertAdjacentHTML("beforeend", rows ? t : '<p class="muted">No progress yet to project from.</p>');
    s3.insertAdjacentHTML("beforeend", '<p class="muted small">Forecasts are simple straight-line estimates — useful for spotting direction, not promises.</p>');
  }

  /* ---------- Activity log (audit) ---------- */
  var LOG_TYPES = { session: "⏱️ Session", answer: "✏️ Answer", complete: "🏁 Finished", progress: "⭐ Progress", open: "👆 Opened", account: "👤 Account", admin: "🛡️ Admin" };
  function describe(e) {
    var m = e.meta || {};
    switch (e.type) {
      case "session": return e.action === "time" ? "Active for " + fmtMin(mins(e.ms || 0)) : e.action === "start" ? "Opened app" : "Closed app (" + fmtMin(mins(e.ms || 0)) + " active)";
      case "answer": return (e.ok ? "✅ Correct" : "❌ Wrong") + (e.skill ? " · " + e.skill : "");
      case "complete": return "Finished " + (m.what || e.action) + (m.item ? ": " + m.item : "") + (e.value != null ? " · score " + e.value + (m.total ? "/" + m.total : "") : "");
      case "progress": return (m.key || "") + " " + (e.value > 0 ? "+" : "") + (e.value == null ? "updated" : e.value) + (m.to != null ? " → " + m.to : "") + " (" + e.action + ")";
      case "open": return "Opened from Hub" + (m.name ? ": " + m.name : "");
      case "account": return e.action.replace(/_/g, " ") + (m.name ? " · " + m.name : "");
      case "admin": return e.action.replace(/_/g, " ") + (m.name ? " · " + m.name : "") + (m.count != null ? " · " + m.count : "");
      default: return e.action || "";
    }
  }
  function logRows() {
    var b = rangeBounds(), f = { app: $("lgApp") ? $("lgApp").value : "", type: $("lgType") ? $("lgType").value : "", q: $("lgQ") ? $("lgQ").value.toLowerCase() : "" };
    return filteredEvents().filter(function (e) {
      if (e.ts < b.since) return false;
      if (f.app && e.app !== f.app) return false;
      if (f.type && e.type !== f.type) return false;
      if (!f.type && e.type === "session" && e.action === "time") return false; // too chatty by default
      if (f.q && (describe(e) + " " + appById(e.app).name + " " + kidName(e.kid)).toLowerCase().indexOf(f.q) < 0) return false;
      return true;
    }).sort(function (a, b2) { return b2.ts - a.ts; });
  }
  function renderLog(host) {
    var sec = section(host, "🧾 Activity log", "Every recorded event for " + scopeName() + " in the last " + S.days + " days — newest first. Admin changes are logged too.");
    var apps = {}; S.events.forEach(function (e) { apps[e.app] = 1; });
    var bar = document.createElement("div"); bar.className = "log-filters";
    bar.innerHTML = '<select id="lgType"><option value="">All event types (minus time ticks)</option>' + Object.keys(LOG_TYPES).map(function (k) { return '<option value="' + k + '">' + LOG_TYPES[k] + "</option>"; }).join("") + "</select>" +
      '<select id="lgApp"><option value="">All apps</option>' + Object.keys(apps).sort().map(function (a) { return '<option value="' + esc(a) + '">' + esc(appById(a).emoji + " " + appById(a).name) + "</option>"; }).join("") + "</select>" +
      '<input id="lgQ" type="search" placeholder="Search…">' +
      '<button class="btn small" id="lgCsv">⬇️ Export CSV</button>';
    sec.appendChild(bar);
    var out = document.createElement("div"); sec.appendChild(out);
    function draw() {
      var rows = logRows(), per = 50, pages = Math.max(1, Math.ceil(rows.length / per));
      S.logPage = Math.min(S.logPage, pages - 1);
      var slice = rows.slice(S.logPage * per, S.logPage * per + per);
      var t = '<p class="muted small">' + rows.length.toLocaleString() + " events</p>" +
        '<div class="tbl-wrap"><table class="tbl log"><thead><tr><th>When</th><th>Student</th><th>App</th><th>Type</th><th>Details</th></tr></thead><tbody>';
      slice.forEach(function (e) {
        t += "<tr><td class=\"nowrap\">" + fullTime(e.ts) + "</td><td>" + esc(e.type === "admin" ? "🧑 Grown-up" : kidName(e.kid)) + "</td><td>" + esc(appById(e.app).emoji + " " + appById(e.app).name) +
          "</td><td class=\"nowrap\">" + (LOG_TYPES[e.type] || esc(e.type)) + "</td><td>" + esc(describe(e)) + "</td></tr>";
      });
      t += "</tbody></table></div>";
      if (pages > 1) t += '<div class="pager"><button class="btn small" id="pgPrev"' + (S.logPage ? "" : " disabled") + '>‹ Newer</button><span>Page ' + (S.logPage + 1) + " of " + pages +
        '</span><button class="btn small" id="pgNext"' + (S.logPage < pages - 1 ? "" : " disabled") + ">Older ›</button></div>";
      out.innerHTML = rows.length ? t : '<p class="muted">No events match.</p>';
      if ($("pgPrev")) $("pgPrev").onclick = function () { S.logPage--; draw(); };
      if ($("pgNext")) $("pgNext").onclick = function () { S.logPage++; draw(); };
    }
    ["lgType", "lgApp"].forEach(function (id) { $(id).addEventListener("change", function () { S.logPage = 0; draw(); }); });
    $("lgQ").addEventListener("input", function () { S.logPage = 0; draw(); });
    $("lgCsv").addEventListener("click", function () {
      var rows = logRows();
      var csv = [["timestamp", "student", "grade", "app", "type", "action", "correct", "skill", "value", "ms", "details"]].concat(rows.map(function (e) {
        return [new Date(e.ts).toISOString(), kidName(e.kid).replace(/^\S+\s/, ""), e.grade, e.app, e.type, e.action, e.ok == null ? "" : e.ok, e.skill, e.value == null ? "" : e.value, e.ms == null ? "" : e.ms, describe(e)];
      })).map(function (r) { return r.map(function (c) { c = String(c == null ? "" : c); return /[",\n]/.test(c) ? '"' + c.replace(/"/g, '""') + '"' : c; }).join(","); }).join("\n");
      download("learning-activity-" + dayKey(Date.now()) + ".csv", csv, "text/csv");
      audit("export_csv", { count: rows.length });
    });
    draw();
  }

  /* ---------- Data & settings ---------- */
  function renderData(host) {
    var sec = section(host, "💾 The database", "Everything is stored on this device in the browser's built-in database (IndexedDB) — nothing is uploaded.");
    var info = document.createElement("div"); info.className = "stats"; sec.appendChild(info);
    Promise.all([ADB.count(), navigator.storage && navigator.storage.estimate ? navigator.storage.estimate() : Promise.resolve(null), ADB.students()]).then(function (r) {
      var oldest = S.events.length ? S.events.reduce(function (m, e) { return Math.min(m, e.ts); }, Infinity) : null;
      info.innerHTML = statTile("Events stored", r[0].toLocaleString(), oldest ? "since " + shortDate(oldest) : "") +
        statTile("Students", DB.kids().length, (r[2].filter(function (s) { return s.archived; }).length) + " removed (history kept)") +
        statTile("Storage used", r[1] ? (r[1].usage / 1048576).toFixed(1) + " MB" : "—", r[1] && r[1].quota ? "of " + Math.round(r[1].quota / 1073741824) + " GB available" : "");
    });

    var bk = section(host, "📦 Backup & restore", "A backup holds the full activity history, students and every app's saved progress.");
    bk.insertAdjacentHTML("beforeend",
      '<div class="row-actions"><button class="btn primary" id="bkExport">⬇️ Download backup (.json)</button>' +
      '<label class="btn">⬆️ Restore from backup<input type="file" id="bkImport" accept="application/json,.json" hidden></label>' +
      '<label class="check"><input type="checkbox" id="bkProgress" checked> also restore app progress</label></div>');
    $("bkExport").addEventListener("click", function () {
      ADB.exportAll().then(function (data) {
        download("learning-hub-backup-" + dayKey(Date.now()) + ".json", JSON.stringify(data), "application/json");
        audit("backup_export", { count: data.events.length });
      });
    });
    $("bkImport").addEventListener("change", function (ev) {
      var f = ev.target.files[0]; if (!f) return;
      var rd = new FileReader();
      rd.onload = function () {
        var data; try { data = JSON.parse(rd.result); } catch (e) { toast("That file isn't valid JSON"); return; }
        if (!confirm("Restore " + ((data.events || []).length) + " events and " + ((data.students || []).length) + " students from this backup?\n\nCurrent activity history will be REPLACED.")) return;
        ADB.importAll(data, { replace: true, restoreProgress: $("bkProgress").checked }).then(function () {
          audit("backup_restore", { count: (data.events || []).length }); toast("Backup restored"); load();
        }).catch(function (e) { toast(e.message); });
      };
      rd.readAsText(f);
    });

    var cl = section(host, "🧹 Clean up", "Old detail can be trimmed to keep things quick. Student profiles and app progress are not affected.");
    cl.insertAdjacentHTML("beforeend",
      '<div class="row-actions"><select id="trimDays"><option value="90">older than 90 days</option><option value="180">older than 6 months</option><option value="365" selected>older than 1 year</option></select>' +
      '<button class="btn" id="trimBtn">Delete old events</button><button class="btn danger" id="wipeBtn">Delete ALL activity history…</button></div>');
    $("trimBtn").addEventListener("click", function () {
      var d = +$("trimDays").value, cut = Date.now() - d * DAY;
      if (!confirm("Delete every event older than " + d + " days?")) return;
      ADB.deleteWhere(function (e) { return e.ts < cut && e.type !== "admin"; }).then(function (n) { audit("trim_events", { days: d, count: n }); toast("Deleted " + n + " events"); load(); });
    });
    $("wipeBtn").addEventListener("click", function () {
      var typed = prompt("This permanently deletes ALL activity history (charts, log, forecasts).\nDownload a backup first if you might need it.\n\nType DELETE to confirm:");
      if (typed !== "DELETE") return;
      ADB.clearEvents().then(function () { audit("wipe_events", {}); toast("Activity history cleared"); load(); });
    });

    var rs = section(host, "🔄 Start fresh", "Removes every student, all app progress, rewards and the whole activity history on THIS device. A backup file is saved first, so you can undo it with Restore. The admin PIN is kept.");
    rs.insertAdjacentHTML("beforeend", '<div class="row-actions"><button class="btn danger" id="resetAllBtn">Reset everything…</button></div>');
    $("resetAllBtn").addEventListener("click", function () {
      var typed = prompt("Reset EVERYTHING on this device?\n\nAll students, progress, rewards and activity history will be removed.\nA backup file is saved first.\n\nType RESET to confirm:");
      if (typed !== "RESET") return;
      ADB.exportAll().then(function (data) {
        if (download("learning-hub-backup-before-reset-" + dayKey(Date.now()) + ".json", JSON.stringify(data), "application/json") === false) {
          throw new Error("Backup could not be saved, so nothing was reset");
        }
        return new Promise(function (r) { setTimeout(r, 800); });   // let the download start before clearing
      }).then(function () {
        return ADB.resetAll(["hub_adminPin"]);
      }).then(function () {
        audit("reset_all", {});
        toast("Everything was reset");
        setTimeout(function () { location.href = "../index.html"; }, 1200);
      }).catch(function (e) { toast(e.message); });
    });

    var pin = section(host, "🔒 Admin lock", "By default a grown-up math question guards this page. Set a PIN for a stronger lock.");
    var hasPin = !!localStorage.getItem("hub_adminPin");
    pin.insertAdjacentHTML("beforeend", '<div class="row-actions"><input id="pinNew" type="password" inputmode="numeric" maxlength="8" placeholder="New PIN (4–8 digits)">' +
      '<button class="btn" id="pinSet">Set PIN</button>' + (hasPin ? '<button class="btn" id="pinClear">Remove PIN</button>' : "") +
      '<span class="muted small">' + (hasPin ? "A PIN is set." : "No PIN set.") + "</span></div>");
    $("pinSet").addEventListener("click", function () {
      var v = $("pinNew").value; if (!/^\d{4,8}$/.test(v)) { toast("Use 4–8 digits"); return; }
      localStorage.setItem("hub_adminPin", hash(v)); audit("pin_set", {}); toast("PIN set"); renderTab();
    });
    if ($("pinClear")) $("pinClear").addEventListener("click", function () { localStorage.removeItem("hub_adminPin"); audit("pin_clear", {}); toast("PIN removed"); renderTab(); });

    var apps = section(host, "🧩 App settings", "Some apps keep their own extra settings.");
    apps.insertAdjacentHTML("beforeend", '<ul class="plain"><li>📖 <b>Reading Adventures</b> — money-reward milestones and student names: open the app, then its 🛠️ Admin button. <a href="../adventurepack/readingadventures/index.html">Open Reading Adventures →</a></li></ul>');
  }

  /* ---------- helpers: download, toast, hash ---------- */
  function download(name, text, type) {
    // Android APK: WebView ignores <a download>, so save through the native bridge
    if (window.AndroidBridge && AndroidBridge.saveFile) {
      var where = AndroidBridge.saveFile(name, text, type);
      toast(where ? "Saved to " + where : "Could not save the file");
      return !!where;
    }
    var a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([text], { type: type })); a.download = name;
    document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  var toastT = null;
  function toast(msg) { var t = $("toast"); t.textContent = msg; t.classList.add("show"); clearTimeout(toastT); toastT = setTimeout(function () { t.classList.remove("show"); }, 2400); }
  function hash(s) { var h = 5381; for (var i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return "h" + (h >>> 0).toString(36); }

  /* ---------- grown-up gate ---------- */
  function gate(done) {
    if (sessionStorage.getItem("adm_ok") === "1") { done(); return; }
    var g = $("gate"), pinHash = localStorage.getItem("hub_adminPin");
    g.hidden = false;
    var a = 6 + Math.floor(Math.random() * 7), b = 7 + Math.floor(Math.random() * 6);
    $("gateQ").textContent = pinHash ? "Enter the admin PIN" : "Grown-ups only: what is " + a + " × " + b + "?";
    $("gateIn").setAttribute("inputmode", "numeric");
    $("gateForm").onsubmit = function (ev) {
      ev.preventDefault();
      var v = $("gateIn").value.trim();
      var ok = pinHash ? hash(v) === pinHash : +v === a * b;
      if (ok) { sessionStorage.setItem("adm_ok", "1"); g.hidden = true; audit("admin_open", {}); done(); }
      else { $("gateMsg").textContent = "Not quite — try again."; $("gateIn").value = ""; ADB.add({ type: "admin", action: "gate_failed", app: "admin" }); }
    };
    $("gateIn").focus();
  }

  /* ---------- load ---------- */
  function load() {
    $("panel").innerHTML = '<p class="muted">Loading…</p>';
    DB.syncStudents();
    return ADB.flushQueue().catch(function () {}).then(function () { return ADB.migrateLegacy(); }).catch(function () {})
      .then(function () { return ADB.query({}); })
      .then(function (evs) { S.events = evs; renderFilters(); renderTabs(); renderTab(); })
      .catch(function (e) { $("panel").innerHTML = '<p class="error">Could not open the database: ' + esc(e && e.message) + "</p>"; });
  }

  document.addEventListener("DOMContentLoaded", function () {
    gate(function () {
      $("app").hidden = false;
      $("kidSel").addEventListener("change", function () { S.kid = this.value; remember(); renderTab(); });
      document.querySelectorAll(".range-btn").forEach(function (b) {
        b.addEventListener("click", function () { S.days = +b.dataset.days; remember(); renderFilters(); renderTab(); });
      });
      $("refresh").addEventListener("click", load);
      var rt = null;
      window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(function () { if (["overview", "forecast"].indexOf(S.tab) >= 0) renderTab(); }, 200); });
      load();
    });
  });
})();
