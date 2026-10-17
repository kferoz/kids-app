/* ============================================================
   Kids Learning Hub — controller
   ------------------------------------------------------------
   • Kid login: pick a learner (or make one) and choose a grade.
   • Personalizes the Hub: greeting + shows ONLY the kid's own grade
     (filter chips are hidden while a learner is logged in).
   • Tracks actions (which app a kid opens) into KidsDB (hub_events).
   • Filter chips work only when nobody is logged in.
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
    var chips = document.querySelectorAll(".filter-chip");
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
    document.querySelectorAll(".filter-chip").forEach(function (chip) {
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

  /* ---------- action tracking ---------- */
  // Log an "open app" event when a kid taps any app / feature card.
  function wireTracking() {
    document.querySelectorAll("[data-app]").forEach(function (a) {
      a.addEventListener("click", function () {
        DB.log(a.dataset.app, "open_app", { name: a.dataset.appName || a.dataset.app });
      });
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
        DB.removeKid(b.dataset.del);
        renderPicker();
        renderGreeting();
        showKidGrade();
      });
    });
    $("addKidBtn").addEventListener("click", renderNewForm);
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
      '<div class="grade-grid">' +
        '<button class="grade-btn" data-grade="kg"><span>🐣</span>Kindergartener</button>' +
        '<button class="grade-btn" data-grade="g3"><span>🎒</span>3rd Grader</button>' +
      '</div>' +
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
    showKidGrade();
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
    showKidGrade();
    if (kid) renderGreeting();
    else openLogin();
  });
})();
