/* ============================================================
   Academy lesson page
   ------------------------------------------------------------
   lesson.html#u=g3-math-2   a unit lesson: loads lessons/g3-math.js
                             (one file per grade and subject)
   lesson.html#adhoc=<id>    a grown-up's AdHoc topic (js/adhoc.js)
   Both run on the Quiz Kit. A finished round is saved to
   acad_progress (lessons.js); a Mixed Test with 2+ stars masters
   the unit and offers the next one.
   ============================================================ */
(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var Y = window.Syllabus, AL = window.AcademyLessons;
  var NAMES = { pk: "Pre-K", kg: "Kindergarten", g1: "Grade 1", g2: "Grade 2", g3: "Grade 3", g4: "Grade 4", g5: "Grade 5" };
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  var toastT;
  function toast(t) { var el = $("toast"); el.textContent = t; el.classList.remove("off"); clearTimeout(toastT); toastT = setTimeout(function () { el.classList.add("off"); }, 2400); }
  function stars(n) { return n ? "⭐".repeat(n) : ""; }

  function findUnit(id) {
    var m = /^(\w+)-(\w+)-(\d+)$/.exec(id || "");
    return m ? Y.units(m[1], m[2])[+m[3] - 1] || null : null;
  }
  function loadFile(key, done) {
    if (AL.has(key)) { done(); return; }
    var s = document.createElement("script");
    s.src = "lessons/" + key + ".js";
    s.onload = done; s.onerror = done;          // a missing file just means "no lesson yet"
    document.head.appendChild(s);
  }
  function empty(html) { $("stage").innerHTML = '<section class="quiz-card empty"><div class="big">📘</div>' + html + "</section>"; }

  // Watch the Quiz Kit's finished rounds (it reports them to Tracker.complete as "<pack id>-<mode>").
  var progressId = null, onMastered = null;
  function watch() {
    var T = window.Tracker; if (!T || T.__acad) return;
    var orig = T.complete;
    T.complete = function (what, score, total, meta) {
      var m = /^(ac_|ah_)(.+)-(easy|medium|mixed)$/.exec(what || "");
      if (m && progressId) {
        if (AL.record(progressId, m[3], meta && meta.stars)) { toast("🏅 Unit mastered!"); if (onMastered) onMastered(); }
        drawBadge();
      }
      return orig.apply(this, arguments);
    };
    T.__acad = true;
  }
  function drawBadge() {
    var b = $("badge"); if (!b || !progressId) return;
    var r = AL.progress()[progressId];
    b.hidden = !r; if (!r) return;
    b.textContent = r.m ? "🏅 Mastered " + stars(r.best) : r.best ? "Best test: " + stars(r.best) + " · 2 stars masters it" : "Started · take the Mixed Test to master it";
  }
  function mount(pack, head) {
    $("stage").innerHTML = head + '<section class="quiz-card" id="card"></section><div id="after"></div>';
    QuizKit.mount($("card"), pack, {});
    drawBadge();
  }

  function openUnit(id) {
    var u = findUnit(id), s = u && Y.subject(u.subject);
    if (!u) { $("title").textContent = "Academy"; empty("<p><b>That unit is not in the syllabus.</b></p>"); return; }
    $("back").href = "../index.html#s=" + u.subject;
    $("title").innerHTML = "<small>" + esc(s.name) + " · " + NAMES[u.grade] + " · Unit " + u.n + "</small>" + u.emoji + " " + esc(u.title);
    document.title = u.title + " " + u.emoji;
    loadFile(u.grade + "-" + u.subject, function () {
      var lesson = AL.get(u.id);
      if (!lesson) { empty("<p><b>This lesson is coming soon.</b></p><p>Try the apps on the unit card for now.</p>"); return; }
      progressId = u.id;
      var next = Y.units(u.grade, u.subject)[u.n];
      onMastered = function () {
        if (next && AL.get(next.id)) $("after").innerHTML = '<a class="next" href="#u=' + next.id + '">Next: Unit ' + next.n + " " + next.emoji + " " + esc(next.title) + " ▶</a>";
      };
      mount(AL.build(u, lesson), '<div class="goals"><b>🎯 In this unit</b><ul>' + u.goals.map(function (g) { return "<li>" + esc(g) + "</li>"; }).join("") +
        '</ul><span class="badge" id="badge" hidden></span></div>');
      var r = AL.progress()[u.id]; if (r && r.m) onMastered();
    });
  }
  function openAdhoc(id) {
    var A = window.AdhocStore, t = A && A.get(id);
    $("back").href = "../index.html#s=adhoc";
    if (!t || !A.visible(t)) { $("title").textContent = "🧪 AdHoc"; empty("<p><b>That topic is not available.</b></p>"); return; }
    $("title").innerHTML = "<small>AdHoc</small>" + esc(t.emoji || "🧪") + " " + esc(t.title);
    document.title = t.title;
    progressId = "adhoc:" + t.id; onMastered = null;
    mount(AL.fromAdhoc(t), '<div class="goals"><b>🧪 A topic from your grown-up</b><span class="badge" id="badge" hidden></span></div>');
  }

  function route() {
    try { speechSynthesis.cancel(); } catch (e) {}
    watch();
    var h = location.hash.replace(/^#/, ""), kv = h.split("=");
    if (kv[0] === "u") openUnit(decodeURIComponent(kv[1] || ""));
    else if (kv[0] === "adhoc") openAdhoc(decodeURIComponent(kv[1] || ""));
    else location.replace("../index.html");
    window.scrollTo(0, 0);
  }
  addEventListener("hashchange", route);
  document.addEventListener("DOMContentLoaded", route);
})();
