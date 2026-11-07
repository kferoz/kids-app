/* ============================================================
   Kids Learning Hub — controller
   ------------------------------------------------------------
   • Kid login: pick a learner (or make one) and choose a grade.
   • Personalizes the Hub: greeting + shows ONLY the kid's own grade
     (filter chips are hidden while a learner is logged in).
   • Tracks actions (which app a kid opens) into KidsDB (hub_events).
   • Filter chips work only when nobody is logged in.
   • Academy: a logged-in learner starts on the Academy's subjects
     (js/syllabus.js: Math, English, Science, Social Studies,
     Computing, Health & Life Skills), then World Languages, the
     grown-ups' AdHoc subject when Admin switches it on, and the
     Fun Zone. A subject page is its numbered units for the
     learner's grade, each with "I can" goals and the apps
     (js/catalog.js) that practise it; apps not on a unit follow
     under "More practice" by Learn / Stories / Practice / Tests /
     Games. "All My Apps" (#apps) is the old grade grid.
     Routes live in the hash so Back works: "" home, #apps,
     #s=math, #s=languages&l=arabic. Old #s=language links still
     work (English, or World Languages for Tamil and Arabic).
     A subject page loads academy/lessons/<grade>-<subject>.js and
     gives each unit with a lesson a Start button and the learner's
     progress (acad_progress, read raw like RewardKit does).
   ============================================================ */
(function () {
  "use strict";

  var DB = window.KidsDB;
  var $ = function (id) { return document.getElementById(id); };
  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }

  /* ---------- category filter ---------- */
  function applyFilter(cat) {
    var chips = document.querySelectorAll("#filterBar .filter-chip");
    var sections = document.querySelectorAll(".cat-section");
    chips.forEach(function (c) { c.classList.toggle("active", c.dataset.filter === cat); });
    sections.forEach(function (s) { s.hidden = !(cat === "all" || s.dataset.cat === cat); });
    /* Adventure Pack tiles are tagged by grade (data-grades="kg g3") instead of section */
    var grade = { kinder: "kg", elementary: "g3" }[cat];
    document.querySelectorAll(".pack-section .tile").forEach(function (c) {
      c.hidden = !!grade && (" " + c.dataset.grades + " ").indexOf(" " + grade + " ") < 0;
    });
    // a pack with nothing for this grade disappears instead of showing an empty box
    document.querySelectorAll(".pack-section").forEach(function (s) {
      s.hidden = !s.querySelector(".tile:not([hidden])");
    });
  }
  function wireFilter() {
    document.querySelectorAll("#filterBar .filter-chip").forEach(function (chip) {
      chip.addEventListener("click", function () { if (!DB.active()) applyFilter(chip.dataset.filter); });
    });
  }
  // One class at a time: a logged-in learner sees only their grade's apps.
  function showKidGrade() {
    var kid = DB.active();
    var g = kid && DB.GRADES[kid.grade];
    $("filterBar").hidden = !!g;
    applyFilter(g ? g.cat : "all");
  }

  /* ---------- subject Hub ---------- */
  function route() {
    var h = location.hash.replace(/^#/, ""), r = { view: h === "apps" ? "apps" : "subjects" };
    h.split("&").forEach(function (p) { var kv = p.split("="); if (kv[1]) r[kv[0]] = decodeURIComponent(kv[1]); });
    return r;
  }
  function render() {
    var kid = DB.active(), C = window.Catalog, r = route();
    var subjects = !!(kid && C) && r.view === "subjects";
    $("viewBar").hidden = !(kid && C);
    document.querySelectorAll("#viewBar .filter-chip").forEach(function (c) { c.classList.toggle("active", c.dataset.view === r.view); });
    $("allApps").hidden = subjects;
    $("subjectHub").hidden = !subjects;
    showKidGrade();
    if (!subjects) return;
    var Y = window.Syllabus, id = r.s;
    if (id === "language") id = r.l && r.l !== "english" ? "languages" : "english";   // links from before the Academy
    var subj = Y && id && Y.subject(id);
    if (subj && subj.setting && !adhocOn()) subj = null;
    if (!subj) renderSubjectHome(kid);
    else if (subj.id === "languages") renderLanguages(kid, subj, r.l);
    else if (subj.id === "adhoc") renderAdhoc(subj);
    else renderAcademySubject(kid, subj);
  }
  function adhocOn() { return !!(window.HubSettings && HubSettings.get().adhoc.enabled); }
  // The learner's lesson progress (academy/js/lessons.js), read from their namespaced key.
  function progressOf(kid) {
    var s = null; try { s = JSON.parse(localStorage.getItem("k" + kid.id + "::acad_progress")); } catch (e) {}
    return s && typeof s === "object" ? s : {};
  }
  // Load one lesson file (once); done runs either way.
  var lessonFiles = {};
  function loadLessons(key, done) {
    if (!window.AcademyLessons || lessonFiles[key] === "done") { done(); return; }
    var waiting = lessonFiles[key] || (lessonFiles[key] = []);
    waiting.push(done);
    if (waiting.length > 1) return;
    var sc = document.createElement("script");
    sc.src = "academy/lessons/" + key + ".js";
    sc.onload = sc.onerror = function () { lessonFiles[key] = "done"; waiting.forEach(function (f) { f(); }); };
    document.head.appendChild(sc);
  }
  // The learner's catalog apps for an Academy subject (own grade or band).
  function appsFor(kid, subj, lang) {
    var Y = window.Syllabus;
    return mine(kid).filter(function (it) { return Y.catalogMatch(subj, it) && (!lang || it.lang === lang); });
  }
  function mine(kid, subject, lang) {
    return window.Catalog.forLearner(kid.grade, DB.band(kid.grade), subject, lang);
  }

  // Each activity borrows its colours and tip from its tile in the app grid (same href first, then same app).
  function lookFor(it) {
    var tiles = $("allApps").querySelectorAll(".tile[data-app]"), byApp = null;
    for (var i = 0; i < tiles.length; i++) {
      if (tiles[i].getAttribute("href") === it.href) return tiles[i];
      if (!byApp && tiles[i].dataset.app === it.app) byApp = tiles[i];
    }
    return byApp;
  }
  function actCard(it) {
    var look = lookFor(it), tip = look ? look.querySelector(".tile-tip").textContent : "";
    return '<a class="act-card" href="' + escapeHtml(it.href) + '" data-app="' + it.app + '" data-app-name="' + escapeHtml(it.title) + '"' +
      (look ? ' style="' + escapeHtml(look.getAttribute("style") || "") + '"' : "") + ">" +
      '<span class="act-icon"><span>' + it.icon + "</span></span>" +
      '<span class="act-text"><span class="act-name">' + escapeHtml(it.title) + "</span>" +
        (tip ? '<span class="act-tip">' + escapeHtml(tip) + "</span>" : "") + "</span></a>";
  }

  // Home: the Academy's subjects, World Languages, AdHoc (when on), then the Fun Zone.
  function renderSubjectHome(kid) {
    var Y = window.Syllabus, g = DB.GRADES[kid.grade] || DB.GRADES.kg;
    var html = '<section class="icon-section"><h2 class="zone-title"><span class="zone-emoji">🎓</span> My Academy <span class="zone-age">' + g.short + "</span></h2>" +
      '<div class="subject-grid">';
    Y.SUBJECTS.forEach(function (s) {
      var n = Y.units(kid.grade, s.id).length, apps = appsFor(kid, s).length, pre = kid.grade + "-" + s.id + "-", prog = progressOf(kid);
      var got = Object.keys(prog).filter(function (k) { return k.indexOf(pre) === 0 && prog[k].m; }).length;
      html += '<a class="subj-card" href="#s=' + s.id + '" style="--sc:' + s.color + '">' +
        '<span class="subj-emoji">' + s.emoji + "</span>" +
        '<span class="subj-name">' + s.name + "</span>" +
        '<span class="subj-count">' + n + " units" + (apps ? " · " + apps + (apps === 1 ? " app" : " apps") : "") + "</span>" +
        (got ? '<span class="subj-done">🏅 ' + got + " mastered</span>" : "") + "</a>";
    });
    Y.EXTRAS.forEach(function (s) {
      if (s.setting && !adhocOn()) return;
      if (s.grades && s.grades.indexOf(kid.grade) < 0) return;
      if (s.href) {
        html += '<a class="subj-card" href="' + s.href + '" data-app="' + s.id + '" data-app-name="' + escapeHtml(s.name) + '" style="--sc:' + s.color + '">' +
          '<span class="subj-emoji">' + s.emoji + "</span>" + '<span class="subj-name">' + s.name + "</span>" +
          '<span class="subj-count">' + escapeHtml(s.note || "") + "</span></a>";
        return;
      }
      var body = '<span class="subj-emoji">' + s.emoji + "</span>" + '<span class="subj-name">' + s.name + "</span>";
      if (s.langs) {
        var langs = window.Catalog.SUBJECTS.filter(function (c) { return c.id === "language"; })[0].langs.filter(function (l) { return s.langs.indexOf(l.id) >= 0; });
        body += '<span class="subj-count">' + appsFor(kid, s).length + " apps</span>" +
          '<span class="subj-langs">' + langs.map(function (l) { return "<span>" + l.emoji + " " + l.name + "</span>"; }).join("") + "</span>";
      } else body += '<span class="subj-count">Tests and topics from your grown-up</span>';
      html += '<a class="subj-card extra" href="#s=' + s.id + '" style="--sc:' + s.color + '">' + body + "</a>";
    });
    html += "</div></section>";
    var fun = mine(kid, "fun");
    if (fun.length) {
      html += '<section class="icon-section funzone"><h2 class="zone-title"><span class="zone-emoji">🎉</span> Fun Zone</h2><div class="act-grid">' +
        fun.map(actCard).join("") + "</div></section>";
    }
    $("subjectHub").innerHTML = html;
  }

  function subjHead(s, sub) {
    return '<div class="subj-head" style="--sc:' + s.color + '">' +
      '<a class="kid-btn" href="#">← Academy</a>' +
      '<h2 class="subj-title"><span>' + s.emoji + "</span> " + s.name + "</h2>" + (sub || "") + "</div>";
  }
  // Apps grouped by Learn / Stories / Practice / Tests / Games.
  function bySection(items, h) {
    var html = "";
    window.Catalog.SECTIONS.forEach(function (sec) {
      var list = items.filter(function (it) { return it.section === sec.id; });
      if (!list.length) return;
      html += '<section class="icon-section subj-section"><' + h + ' class="sec-title"><span>' + sec.emoji + "</span> " + sec.name + "</" + h + ">" +
        '<div class="act-grid">' + list.map(actCard).join("") + "</div></section>";
    });
    return html;
  }

  // One Academy subject: the grade's numbered units, then apps that are on no unit.
  function renderAcademySubject(kid, s) {
    var Y = window.Syllabus, g = DB.GRADES[kid.grade] || DB.GRADES.kg, units = Y.units(kid.grade, s.id);
    var apps = appsFor(kid, s), byId = {}, used = {};
    apps.forEach(function (it) { byId[it.id] = it; });
    var html = '<p class="unit-intro">' + escapeHtml(s.about) + "</p>" + '<ol class="unit-path">' + units.map(function (u) {
      var acts = u.acts.filter(function (id) { return byId[id]; }).map(function (id) { used[id] = 1; return byId[id]; });
      return '<li class="unit-card" id="' + u.id + '" style="--sc:' + s.color + '">' +
        '<div class="unit-top"><span class="unit-emoji" aria-hidden="true">' + u.emoji + '</span>' +
          '<div><span class="unit-num">Unit ' + u.n + "</span><h3 class=\"unit-title\">" + escapeHtml(u.title) + "</h3></div></div>" +
        '<ul class="unit-goals">' + u.goals.map(function (q) { return "<li>" + escapeHtml(q) + "</li>"; }).join("") + "</ul>" +
        '<div class="unit-go" data-unit="' + u.id + '" hidden></div>' +
        (acts.length ? '<div class="unit-acts"><span class="unit-label">Practise with</span><div class="act-grid">' + acts.map(actCard).join("") + "</div></div>"
          : '<p class="unit-soon">📘 Lessons for this unit are coming soon.</p>') +
        '<details class="unit-std"><summary>For grown-ups: curriculum links</summary><dl>' +
          "<dt>US</dt><dd>" + escapeHtml(u.us) + "</dd><dt>UK</dt><dd>" + escapeHtml(u.uk) + "</dd><dt>Sweden</dt><dd>" + escapeHtml(u.se) + "</dd></dl></details>" +
        "</li>";
    }).join("") + "</ol>";
    var rest = apps.filter(function (it) { return !used[it.id]; });
    if (rest.length) html += '<h3 class="more-title">✨ More practice</h3>' + bySection(rest, "h4");
    $("subjectHub").innerHTML = subjHead(s, '<span class="subj-sub">' + g.short + " · " + units.length + " units</span>") + html;
    var shown = location.hash;
    loadLessons(kid.grade + "-" + s.id, function () { if (location.hash === shown) fillLessons(kid); });
  }
  // Units that have a lesson: a Start / Practise-again button and the learner's best Mixed Test.
  function fillLessons(kid) {
    var AL = window.AcademyLessons, prog = progressOf(kid);
    document.querySelectorAll(".unit-go[data-unit]").forEach(function (box) {
      var id = box.getAttribute("data-unit"), card = box.parentNode;
      if (!AL.get(id)) return;
      var r = prog[id], title = card.querySelector(".unit-title").textContent;
      box.hidden = false;
      box.innerHTML = '<a class="unit-start' + (r && r.m ? " done" : "") + '" href="academy/lesson.html#u=' + id + '" data-app="academy" data-app-name="' + escapeHtml(title) + '">' +
        (r && r.m ? "🔁 Practise again" : r ? "▶️ Keep going" : "▶️ Start lesson") + "</a>" +
        '<a class="unit-sheet" href="worksheets/index.html#u=' + id + '" data-app="worksheets" data-app-name="Worksheet" title="Printable worksheet with answer key">📄 Worksheet</a>' +
        (r && r.m ? '<span class="unit-badge">🏅 Mastered ' + "⭐".repeat(r.best || 0) + "</span>" : r && r.best ? '<span class="unit-badge try">Best test ' + "⭐".repeat(r.best) + "</span>" : "");
      var soon = card.querySelector(".unit-soon"); if (soon) soon.hidden = true;
    });
  }

  // World Languages: language chips (Tamil, Arabic), then that language's apps by section.
  function renderLanguages(kid, s, langId) {
    var langs = window.Catalog.SUBJECTS.filter(function (c) { return c.id === "language"; })[0].langs.filter(function (l) { return s.langs.indexOf(l.id) >= 0; });
    var lang = langs.filter(function (l) { return l.id === langId; })[0] ||
               langs.filter(function (l) { return appsFor(kid, s, l.id).length; })[0] || langs[0];
    var html = '<nav class="filter-bar lang-bar" aria-label="Choose a language">' + langs.map(function (l) {
      return '<a class="filter-chip' + (l === lang ? " active" : "") + '" href="#s=languages&l=' + l.id + '">' +
        l.emoji + " " + l.name + ' <span class="native" lang="' + (l.id === "tamil" ? "ta" : "ar") + '">' + l.native + "</span></a>";
    }).join("") + "</nav>";
    var items = appsFor(kid, s, lang.id);
    html += items.length ? bySection(items, "h3")
      : '<section class="icon-section subj-empty"><div class="subj-empty-emoji">' + lang.emoji + "</div><p><b>" + lang.name + " is coming soon!</b></p>" +
        "<p>New lessons are on the way. Try another subject for now.</p></section>";
    $("subjectHub").innerHTML = subjHead(s) + html;
  }

  // AdHoc: topics and practice tests a grown-up writes in Admin → 🎓 Academy (js/adhoc.js).
  function renderAdhoc(s) {
    var kid = DB.active(), list = window.AdhocStore ? AdhocStore.forGrade(kid.grade) : [], prog = progressOf(kid);
    $("subjectHub").innerHTML = subjHead(s) + (list.length
      ? '<div class="act-grid adhoc-list">' + list.map(function (t) {
          var r = prog["adhoc:" + t.id];
          return '<a class="act-card adhoc-card" href="academy/lesson.html#adhoc=' + encodeURIComponent(t.id) + '" data-app="academy" data-app-name="' + escapeHtml(t.title) + '">' +
            '<span class="act-icon"><span>' + escapeHtml(t.emoji) + '</span></span><span class="act-text"><span class="act-name">' + escapeHtml(t.title) + "</span>" +
            '<span class="act-tip">' + t.questions.length + " questions" + (r && r.m ? " · 🏅 " + "⭐".repeat(r.best || 0) : r ? " · started" : "") + "</span></span></a>";
        }).join("") + "</div>"
      : '<section class="icon-section subj-empty"><div class="subj-empty-emoji">🧪</div>' +
        "<p><b>No topics yet.</b></p><p>Your grown-up can add special topics and practice tests here.</p></section>");
  }

  /* ---------- action tracking ---------- */
  // Log an "open app" event when a kid taps any app / feature card (subject cards are drawn later, so delegate).
  function wireTracking() {
    document.addEventListener("click", function (e) {
      var a = e.target.closest && e.target.closest("[data-app]");
      if (a) DB.log(a.dataset.app, "open_app", { name: a.dataset.appName || a.dataset.app });
    });
  }

  /* ---------- greeting bar ---------- */
  function renderGreeting() {
    var bar = $("kidBar");
    var kid = DB.active();
    if (!kid) { bar.hidden = true; return; }
    var g = DB.GRADES[kid.grade] || DB.GRADES.kg;
    // Stars, level and streak from RewardKit (js/rewardkit.js), read from this learner's raw keys.
    var rk = window.RewardKit ? RewardKit.forKid(kid.id) : null;
    bar.hidden = false;
    bar.innerHTML =
      '<span class="kid-hello">' +
        '<span class="kid-ava">' + kid.avatar + (rk && rk.wear ? '<span class="kid-wear" title="' + escapeHtml(rk.wear.n) + '">' + rk.wear.e + "</span>" : "") + '</span>' +
        '<span class="kid-text"><span>Hi, <b>' + escapeHtml(kid.name) + '</b>!</span>' +
          '<span class="kid-pills"><span class="kid-grade">' + g.emoji + " " + g.short + '</span>' +
          (rk ? '<span class="kid-grade rk-pill" title="Stars">⭐ ' + rk.stars + '</span>' +
                '<span class="kid-grade rk-pill" title="' + escapeHtml(rk.level.name) + '">' + rk.level.emoji + " Level " + rk.level.n + '</span>' +
                (rk.streak ? '<span class="kid-grade rk-pill" title="Days in a row">🔥 ' + rk.streak + '</span>' : "") : "") +
          '</span>' +
        '</span>' +
      '</span>' +
      '<span class="kid-actions">' +
        '<button class="kid-btn" id="voiceBtn">🗣️ Voice</button>' +
        '<button class="kid-btn" id="switchKid">🔄 Switch Learner</button>' +
      '</span>';
    $("switchKid").addEventListener("click", openLogin);
    $("voiceBtn").addEventListener("click", openVoice);
  }

  /* ---------- read-aloud voice, speed & pitch (per learner, js/voice.js) ---------- */
  function openVoice() {
    var kid = DB.active(), HV = window.HubVoice;
    if (!kid || !HV) return;
    var cur = HV.get(kid.id) || { voice: "", rate: 1, pitch: 1 };
    var ov = el("div", "login-overlay voice-overlay");
    var card = el("div", "login-card voice-card");
    ov.appendChild(card); document.body.appendChild(ov);
    function close() { if (window.speechSynthesis) speechSynthesis.cancel(); ov.remove(); }
    function draw() {
      var vs = HV.voices();
      card.innerHTML =
        '<div class="login-mascot">🗣️</div>' +
        '<h2 class="login-h">' + escapeHtml(kid.name) + "'s reading voice</h2>" +
        '<p class="login-sub">Pick how the apps sound when they read to you.</p>' +
        '<label class="new-label" for="vVoice">Voice</label>' +
        '<select id="vVoice" class="new-name voice-select"><option value="">App\'s own voice</option>' +
          vs.map(function (v) { var id = v.voiceURI || v.name; return '<option value="' + escapeHtml(id) + '"' + (id === cur.voice ? " selected" : "") + ">" + escapeHtml(v.name) + (v.localService === false ? " ☁️" : "") + "</option>"; }).join("") +
        "</select>" +
        (vs.length ? "" : '<p class="voice-note">Voices are still loading. Tap Try it in a moment.</p>') +
        '<label class="new-label" for="vRate">Speed <b id="vRateTxt"></b></label>' +
        '<div class="voice-range"><span>🐢</span><input id="vRate" type="range" min="0.6" max="1.5" step="0.05" value="' + cur.rate + '"><span>🐇</span></div>' +
        '<label class="new-label" for="vPitch">Pitch <b id="vPitchTxt"></b></label>' +
        '<div class="voice-range"><span>🐻</span><input id="vPitch" type="range" min="0.6" max="1.5" step="0.05" value="' + cur.pitch + '"><span>🐭</span></div>' +
        '<div class="new-actions voice-actions">' +
          '<button class="kid-btn ghost" id="vReset">↺ Normal</button>' +
          '<button class="kid-btn" id="vTry">▶ Try it</button>' +
          '<button class="big-start" id="vSave">Save 👍</button>' +
        "</div>";
      function words(v, lo, hi) { return v < 0.9 ? lo : v > 1.1 ? hi : "normal"; }
      function label() {
        $("vRateTxt").textContent = "· " + words(+$("vRate").value, "slower", "faster");
        $("vPitchTxt").textContent = "· " + words(+$("vPitch").value, "lower", "higher");
      }
      function chosen() { return { voice: $("vVoice").value, rate: +$("vRate").value, pitch: +$("vPitch").value }; }
      label();
      $("vRate").addEventListener("input", label);
      $("vPitch").addEventListener("input", label);
      $("vTry").addEventListener("click", function () { HV.preview("Hi " + kid.name + "! This is how I will read to you. Let's read a story together!", chosen()); });
      $("vReset").addEventListener("click", function () { cur = { voice: "", rate: 1, pitch: 1 }; draw(); });
      $("vSave").addEventListener("click", function () {
        var c = chosen();
        if (!c.voice && c.rate === 1 && c.pitch === 1) HV.reset(kid.id); else HV.set(c, kid.id);
        DB.log("hub", "voice_settings", c);
        close();
      });
    }
    draw();
    // voices can arrive after the page loads (Chrome, Android): redraw once they do
    if (window.speechSynthesis && !HV.voices().length && speechSynthesis.addEventListener) {
      speechSynthesis.addEventListener("voiceschanged", function again() {
        speechSynthesis.removeEventListener("voiceschanged", again);
        if (document.body.contains(ov)) { cur = { voice: $("vVoice").value, rate: +$("vRate").value, pitch: +$("vPitch").value }; draw(); }
      });
    }
    ov.addEventListener("click", function (e) { if (e.target === ov) close(); });
  }

  /* ---------- login overlay ---------- */
  function openLogin() {
    var ov = $("loginOverlay");
    ov.hidden = false;
    renderPicker();
  }
  function closeLogin() { $("loginOverlay").hidden = true; }

  // Screen 1: choose an existing learner or add a new one.
  function renderPicker() {
    var card = $("loginCard");
    var list = DB.kids();
    var html =
      '<div class="login-mascot">🎒</div>' +
      '<h2 class="login-h">Who\'s learning today?</h2>' +
      '<p class="login-sub">Tap your picture, or make a new one.</p>' +
      '<div class="kid-picker">';
    list.forEach(function (k) {
      var g = DB.GRADES[k.grade] || DB.GRADES.kg;
      html +=
        '<div class="kid-choice-wrap">' +
          '<button class="kid-choice" data-id="' + k.id + '">' +
            '<span class="kc-ava">' + k.avatar + '</span>' +
            '<span class="kc-name">' + escapeHtml(k.name) + '</span>' +
            '<span class="kc-grade">' + g.emoji + " " + g.short + '</span>' +
          '</button>' +
          '<button class="kid-del" data-del="' + k.id + '" title="Remove">✕</button>' +
        '</div>';
    });
    html +=
        '<button class="kid-choice add" id="addKidBtn">' +
          '<span class="kc-ava">➕</span>' +
          '<span class="kc-name">New Learner</span>' +
        '</button>' +
      '</div>';
    card.innerHTML = html;

    card.querySelectorAll(".kid-choice[data-id]").forEach(function (b) {
      b.addEventListener("click", function () { chooseKid(b.dataset.id); });
    });
    card.querySelectorAll(".kid-del").forEach(function (b) {
      b.addEventListener("click", function (e) {
        e.stopPropagation();
        confirmRemove(b.dataset.del);
      });
    });
    $("addKidBtn").addEventListener("click", renderNewForm);
  }

  // One tap on ✕ used to remove a learner at once. Now it asks first, with Keep as the easy choice.
  function confirmRemove(id) {
    var kid = DB.kids().filter(function (k) { return k.id === id; })[0];
    if (!kid) return renderPicker();
    var name = escapeHtml(kid.name), card = $("loginCard");
    card.innerHTML =
      '<div class="login-mascot">' + kid.avatar + '</div>' +
      '<h2 class="login-h">Remove ' + name + '?</h2>' +
      '<p class="login-sub">Ask a grown-up first. ' + name + ' will leave this list.</p>' +
      '<div class="new-actions">' +
        '<button class="big-start" id="keepKid">Keep ' + name + ' 💛</button>' +
        '<button class="kid-btn ghost remove-kid" id="removeKid">Remove</button>' +
      '</div>';
    $("keepKid").addEventListener("click", renderPicker);
    $("removeKid").addEventListener("click", function () {
      DB.removeKid(id);
      renderPicker();
      renderGreeting();
      render();
    });
    $("keepKid").focus();
  }

  // Screen 2: name + avatar + grade for a brand-new learner.
  function renderNewForm() {
    var card = $("loginCard");
    var chosenAva = DB.AVATARS[0];
    var chosenGrade = "";

    var html =
      '<div class="login-mascot">✨</div>' +
      '<h2 class="login-h">Make Your Learner</h2>' +
      '<label class="new-label">My name is…</label>' +
      '<input id="newName" class="new-name" type="text" maxlength="16" autocomplete="off" placeholder="Type your name" />' +
      '<label class="new-label">Pick a buddy</label>' +
      '<div class="ava-grid" id="avaGrid"></div>' +
      '<label class="new-label">I am a…</label>' +
      '<div class="grade-grid">' + DB.GRADE_ORDER.map(function (code) {
        var g = DB.GRADES[code];
        return '<button class="grade-btn" data-grade="' + code + '" aria-label="' + g.label + '"><span>' + g.emoji + '</span>' + g.short + '</button>';
      }).join("") + '</div>' +
      '<div class="new-actions">' +
        '<button class="kid-btn ghost" id="backPick">← Back</button>' +
        '<button class="big-start" id="startBtn" disabled>Start Learning! 🚀</button>' +
      '</div>';
    card.innerHTML = html;

    // avatar grid
    var grid = $("avaGrid");
    DB.AVATARS.forEach(function (a, i) {
      var b = el("button", "ava-cell" + (i === 0 ? " sel" : ""), a);
      b.addEventListener("click", function () {
        chosenAva = a;
        grid.querySelectorAll(".ava-cell").forEach(function (c) { c.classList.remove("sel"); });
        b.classList.add("sel");
      });
      grid.appendChild(b);
    });

    // grade buttons
    card.querySelectorAll(".grade-btn").forEach(function (b) {
      b.addEventListener("click", function () {
        chosenGrade = b.dataset.grade;
        card.querySelectorAll(".grade-btn").forEach(function (c) { c.classList.remove("sel"); });
        b.classList.add("sel");
        $("startBtn").disabled = false;
      });
    });

    $("backPick").addEventListener("click", renderPicker);
    $("startBtn").addEventListener("click", function () {
      if (!chosenGrade) return;
      var name = ($("newName").value || "").trim();
      DB.addKid(name, chosenAva, chosenGrade); // also sets active + logs
      finishLogin();
    });
  }

  function chooseKid(id) {
    DB.setActive(id);
    DB.log("hub", "login", null);
    finishLogin();
  }

  function finishLogin() {
    closeLogin();
    renderGreeting();
    render();
  }

  /* ---------- utils ---------- */
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* ---------- boot ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    wireFilter();
    wireTracking();
    // Android APK builds stamp window.APP_VERSION (see android/build-apk.mjs)
    var v = window.APP_VERSION, foot = document.querySelector(".hub-footer");
    if (v && foot) foot.appendChild(el("p", "app-version", "📱 App v" + v.name + " · built " + escapeHtml(v.built)));
    // Bring the activity database up to date (profiles + any old localStorage log).
    try {
      if (window.ActivityDB && DB.syncStudents) { DB.syncStudents(); ActivityDB.migrateLegacy().catch(function () {}); }
    } catch (e) { /* never block the Hub over the activity database */ }
    var kid = DB.active();
    render();
    window.addEventListener("hashchange", function () { render(); window.scrollTo(0, 0); });
    if (kid) renderGreeting();
    else openLogin();
  });
})();
