/* ============================================================
   Kids Learning Hub — controller
   ------------------------------------------------------------
   • Kid login: pick a learner (or make one) and choose a grade.
   • Personalizes the Hub: greeting + shows ONLY the kid's own grade
     (filter chips are hidden while a learner is logged in).
   • Tracks actions (which app a kid opens) into KidsDB (hub_events).
   • Filter chips work only when nobody is logged in.
   • Subject Hub: a logged-in learner starts on subject cards
     (Science, Math, Social Studies, Language, from js/catalog.js);
     each subject lists its activities by Learn / Stories / Practice /
     Tests / Games. "All My Apps" (#apps) is the old grade grid.
     Routes live in the hash so Back works: "" home, #apps,
     #s=math, #s=language&l=arabic.
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
    var subj = r.s && C.subject(r.s);
    if (subj && subj.id !== "fun") renderSubject(kid, subj, r.l); else renderSubjectHome(kid);
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

  // Home: one big card per subject, then the Fun Zone.
  function renderSubjectHome(kid) {
    var C = window.Catalog, g = DB.GRADES[kid.grade] || DB.GRADES.kg;
    var html = '<section class="icon-section"><h2 class="zone-title"><span class="zone-emoji">📚</span> My Subjects <span class="zone-age">' + g.short + "</span></h2>" +
      '<div class="subject-grid">';
    C.SUBJECTS.forEach(function (s) {
      if (s.id === "fun") return;
      var n = mine(kid, s.id).length;
      var langs = s.langs ? '<span class="subj-langs">' + s.langs.map(function (l) { return "<span>" + l.emoji + " " + l.name + "</span>"; }).join("") + "</span>" : "";
      var body = '<span class="subj-emoji">' + s.emoji + "</span>" +
        '<span class="subj-name">' + s.name + "</span>" +
        '<span class="subj-count">' + (n ? n + (n === 1 ? " activity" : " activities") : "Coming soon ✨") + "</span>" + langs;
      html += n
        ? '<a class="subj-card" href="#s=' + s.id + '" style="--sc:' + s.color + '">' + body + "</a>"
        : '<div class="subj-card soon" style="--sc:' + s.color + '" aria-disabled="true">' + body + "</div>";
    });
    html += "</div></section>";
    var fun = mine(kid, "fun");
    if (fun.length) {
      html += '<section class="icon-section funzone"><h2 class="zone-title"><span class="zone-emoji">🎉</span> Fun Zone</h2><div class="act-grid">' +
        fun.map(actCard).join("") + "</div></section>";
    }
    $("subjectHub").innerHTML = html;
  }

  // One subject: language chips (Language only), then its activities by section.
  function renderSubject(kid, s, langId) {
    var C = window.Catalog, html = "", items, lang = null;
    if (s.langs) {
      lang = s.langs.filter(function (l) { return l.id === langId; })[0] ||
             s.langs.filter(function (l) { return mine(kid, s.id, l.id).length; })[0] || s.langs[0];
      html += '<nav class="filter-bar lang-bar" aria-label="Choose a language">' + s.langs.map(function (l) {
        return '<a class="filter-chip' + (l === lang ? " active" : "") + '" href="#s=' + s.id + "&l=" + l.id + '">' +
          l.emoji + " " + l.name + (l.native !== l.name ? ' <span class="native" lang="' + (l.id === "tamil" ? "ta" : "ar") + '">' + l.native + "</span>" : "") + "</a>";
      }).join("") + "</nav>";
    }
    items = mine(kid, s.id, lang && lang.id);
    C.SECTIONS.forEach(function (sec) {
      var list = items.filter(function (it) { return it.section === sec.id; });
      if (!list.length) return;
      html += '<section class="icon-section subj-section"><h3 class="sec-title"><span>' + sec.emoji + "</span> " + sec.name + "</h3>" +
        '<div class="act-grid">' + list.map(actCard).join("") + "</div></section>";
    });
    if (!items.length) {
      html += '<section class="icon-section subj-empty"><div class="subj-empty-emoji">' + (lang ? lang.emoji : s.emoji) + "</div>" +
        "<p><b>" + (lang ? lang.name : s.name) + " is coming soon!</b></p>" +
        (lang && lang.id === "tamil" ? '<p lang="ta" class="native-big">வணக்கம்!</p>' : "") +
        "<p>New lessons are on the way. Try another subject for now.</p></section>";
    }
    $("subjectHub").innerHTML =
      '<div class="subj-head" style="--sc:' + s.color + '">' +
        '<a class="kid-btn" href="#">← Subjects</a>' +
        '<h2 class="subj-title"><span>' + s.emoji + "</span> " + s.name + "</h2>" +
      "</div>" + html;
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
    bar.hidden = false;
    bar.innerHTML =
      '<span class="kid-hello">' +
        '<span class="kid-ava">' + kid.avatar + '</span>' +
        '<span class="kid-text"><span>Hi, <b>' + escapeHtml(kid.name) + '</b>!</span>' +
          '<span class="kid-grade">' + g.emoji + " " + g.short + '</span>' +
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
