/* ============================================================
   Times Table Takeoff — App Logic
   Vanilla JS. Four phases build multiplication fluency to 12×12:
   Skip Counting → Learn a Table → Fact Practice → Fluency Blast-off.
   Facts are generated. Progress saved under the "tt_" prefix.
   Practice/fluency are graded (one attempt, correct answer shown)
   to build real fluency; every question read aloud on request.
   ============================================================ */

(function () {
  "use strict";

  var state = {
    points: loadInt("tt_points"),
    mastered: loadSet("tt_mastered"),   // numbers whose table is mastered
    skipDone: loadSet("tt_skip"),       // numbers whose skip-count is done
    trophies: loadSet("tt_trophies"),
    fluencyBest: loadInt("tt_fluencyBest"),
    quiz: null,
    pickPhase: null
  };

  var $ = function (id) { return document.getElementById(id); };
  var el = {
    screens: {
      home: $("homeScreen"),
      pick: $("pickScreen"),
      learn: $("learnScreen"),
      quiz: $("quizScreen"),
      result: $("resultScreen"),
      trophy: $("trophyScreen")
    },
    backBtn: $("backBtn"),
    pointCount: $("pointCount"),
    pointsBadge: $("pointsBadge"),
    phaseGrid: $("phaseGrid"),
    masteryBoard: $("masteryBoard"),
    trophyBtn: $("trophyBtn"),
    pickTitle: $("pickTitle"),
    numberGrid: $("numberGrid"),
    learnTitle: $("learnTitle"),
    skipStrip: $("skipStrip"),
    tableList: $("tableList"),
    readTableBtn: $("readTableBtn"),
    learnPracticeBtn: $("learnPracticeBtn"),
    quizTitle: $("quizTitle"),
    quizNow: $("quizNow"),
    quizTotal: $("quizTotal"),
    quizProgress: $("quizProgress"),
    quizQuestion: $("quizQuestion"),
    quizReadBtn: $("quizReadBtn"),
    quizOptions: $("quizOptions"),
    quizFeedback: $("quizFeedback"),
    resEmoji: $("resEmoji"),
    resHeadline: $("resHeadline"),
    resScore: $("resScore"),
    resStars: $("resStars"),
    resMsg: $("resMsg"),
    resUnlock: $("resUnlock"),
    againBtn: $("againBtn"),
    resHomeBtn: $("resHomeBtn"),
    trophyEarned: $("trophyEarned"),
    trophyTotalCount: $("trophyTotalCount"),
    trophyGrid: $("trophyGrid")
  };

  // ---------- Persistence ----------
  function loadInt(k) { return parseInt(localStorage.getItem(k) || "0", 10); }
  function loadSet(k) { try { return new Set(JSON.parse(localStorage.getItem(k) || "[]")); } catch (e) { return new Set(); } }
  function saveInt(k, v) { localStorage.setItem(k, String(v)); }
  function saveSet(k, s) { localStorage.setItem(k, JSON.stringify(Array.from(s))); }

  // ---------- Helpers ----------
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function speak(text) {
    if (!("speechSynthesis" in window) || !text) return;
    window.speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(text);
    u.rate = 0.95; u.pitch = 1.0;
    window.speechSynthesis.speak(u);
  }
  function stopSpeaking() { if ("speechSynthesis" in window) window.speechSynthesis.cancel(); }

  function showScreen(name) {
    stopSpeaking();
    Object.keys(el.screens).forEach(function (k) { el.screens[k].classList.remove("active"); });
    el.screens[name].classList.add("active");
    el.backBtn.hidden = (name === "home");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function updatePointsBadge() {
    el.pointCount.textContent = state.points;
    var icon = el.pointsBadge.querySelector(".pt-icon");
    icon.style.animation = "none"; void icon.offsetWidth; icon.style.animation = "pop 0.4s ease";
  }
  function addPoints(n) { state.points += n; saveInt("tt_points", state.points); updatePointsBadge(); }

  // options: correct answer + 3 plausible distractors
  function makeOptions(correct, candidates) {
    var opts = [correct];
    var pool = shuffle(candidates.filter(function (x) { return x > 0 && x !== correct; }));
    for (var i = 0; i < pool.length && opts.length < 4; i++) if (opts.indexOf(pool[i]) === -1) opts.push(pool[i]);
    var extra = 1;
    while (opts.length < 4) { var c = correct + extra; if (opts.indexOf(c) === -1) opts.push(c); extra++; }
    return shuffle(opts);
  }

  // ---------- Question generators ----------
  function factOptions(a, b) {
    var p = a * b;
    return makeOptions(p, [a * (b + 1), a * (b - 1), (a + 1) * b, (a - 1) * b, p + 1, p - 1, p + a, p + b]);
  }
  function basicFact(a, b) {
    return { q: a + " × " + b + " = ?", answer: a * b, options: factOptions(a, b), say: "What is " + a + " times " + b + "?" };
  }
  function missingFactor(a, b) {
    var p = a * b;
    var cand = shuffle([b + 1, b - 1, b + 2, b - 2, b + 3, b - 3].filter(function (x) { return x >= 1 && x <= 12 && x !== b; }));
    var opts = [b];
    for (var i = 0; i < cand.length && opts.length < 4; i++) opts.push(cand[i]);
    var f = 1;
    while (opts.length < 4) { if (opts.indexOf(f) === -1) opts.push(f); f++; }
    return { q: a + " × ⬚ = " + p, answer: b, options: shuffle(opts), say: a + " times what equals " + p + "?" };
  }

  function skipQuestions(n) {
    var qs = [];
    for (var r = 0; r < 6; r++) {
      var seq = [];
      for (var k = 1; k <= 7; k++) seq.push(n * k);
      var bi = 1 + Math.floor(Math.random() * 5);   // blank at position 1..5 (not first/last)
      var answer = seq[bi];
      var shown = seq.map(function (v, i) { return i === bi ? "⬚" : v; }).join("   ");
      qs.push({
        q: shown,
        answer: answer,
        options: makeOptions(answer, [answer + n, answer - n, answer + 1, answer - 1, answer + 2 * n]),
        say: "Count by " + n + ". What number is missing?"
      });
    }
    return qs;
  }

  function practiceQuestions(n) {
    var factors = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]).slice(0, 10);
    return factors.map(function (m, i) {
      return (i >= 8) ? missingFactor(n, m) : basicFact(n, m);
    });
  }

  function fluencyQuestions() {
    var qs = [];
    for (var i = 0; i < 12; i++) {
      var a = pick(TABLES), b = 2 + Math.floor(Math.random() * 11);
      qs.push(basicFact(a, b));
    }
    return qs;
  }

  // ---------- Home ----------
  function buildHome() {
    el.phaseGrid.innerHTML = "";
    PHASES.forEach(function (ph) {
      var card = document.createElement("button");
      card.className = "phase-card phase-" + ph.id;
      card.innerHTML =
        '<span class="phase-emoji">' + ph.emoji + "</span>" +
        '<span class="phase-name">' + ph.name + "</span>" +
        '<span class="phase-blurb">' + ph.blurb + "</span>";
      card.addEventListener("click", function () { startPhase(ph.id); });
      el.phaseGrid.appendChild(card);
    });

    el.masteryBoard.innerHTML = "";
    TABLES.forEach(function (n) {
      var mastered = state.mastered.has(n);
      var tile = document.createElement("button");
      tile.className = "table-tile" + (mastered ? " mastered" : "");
      tile.innerHTML = '<span class="tt-x">×' + n + "</span><span class=\"tt-star\">" + (mastered ? "⭐" : "☆") + "</span>";
      tile.addEventListener("click", function () { showLearn(n); });
      el.masteryBoard.appendChild(tile);
    });
  }

  function startPhase(id) {
    if (id === "fluency") { startFluency(); return; }
    state.pickPhase = id;
    el.pickTitle.textContent = id === "skip" ? "Pick a number to skip-count by:" :
      id === "learn" ? "Pick a table to learn:" : "Pick a table to practice:";
    buildNumberGrid();
    showScreen("pick");
  }

  function buildNumberGrid() {
    el.numberGrid.innerHTML = "";
    TABLES.forEach(function (n) {
      var b = document.createElement("button");
      b.className = "num-tile" + (state.mastered.has(n) ? " mastered" : "");
      b.textContent = (state.pickPhase === "skip") ? n + "s" : "×" + n;
      b.addEventListener("click", function () {
        if (state.pickPhase === "skip") startSkip(n);
        else showLearn(n);
      });
      el.numberGrid.appendChild(b);
    });
  }

  // ---------- Learn a table ----------
  function showLearn(n) {
    el.learnTitle.textContent = "The " + n + " Times Table";
    el.skipStrip.innerHTML = "";
    for (var k = 1; k <= 12; k++) {
      var chip = document.createElement("span");
      chip.className = "skip-chip";
      chip.textContent = n * k;
      el.skipStrip.appendChild(chip);
    }
    el.tableList.innerHTML = "";
    for (var m = 1; m <= 12; m++) {
      var row = document.createElement("div");
      row.className = "fact-row";
      row.innerHTML = '<span class="fx">' + n + " × " + m + "</span><span class=\"eq\">=</span><span class=\"fp\">" + (n * m) + "</span>";
      el.tableList.appendChild(row);
    }
    el.learnPracticeBtn.onclick = function () { startPractice(n); };
    el.readTableBtn.onclick = function () { readTable(n); };
    showScreen("learn");
  }
  function readTable(n) {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    for (var m = 1; m <= 12; m++) {
      var u = new SpeechSynthesisUtterance(n + " times " + m + " is " + (n * m));
      u.rate = 1.0; u.pitch = 1.0;
      window.speechSynthesis.speak(u);
    }
  }

  // ---------- Quiz engine ----------
  function startQuiz(kind, table, qs, title) {
    state.quiz = { kind: kind, table: table, qs: qs, index: 0, score: 0, locked: false };
    el.quizTitle.textContent = title;
    el.quizTotal.textContent = qs.length;
    renderQuestion();
    showScreen("quiz");
  }
  function startSkip(n) { startQuiz("skip", n, skipQuestions(n), "🪜 Skip Count by " + n); }
  function startPractice(n) { startQuiz("practice", n, practiceQuestions(n), "✍️ Practice ×" + n); }
  function startFluency() { startQuiz("fluency", null, fluencyQuestions(), "🚀 Fluency Blast-off"); }

  function renderQuestion() {
    var Q = state.quiz;
    var q = Q.qs[Q.index];
    Q.locked = false;
    el.quizNow.textContent = Q.index + 1;
    el.quizProgress.style.width = (Q.index / Q.qs.length * 100) + "%";
    el.quizQuestion.textContent = q.q;
    el.quizQuestion.classList.toggle("seq", Q.kind === "skip");
    el.quizFeedback.textContent = "";
    el.quizFeedback.className = "quiz-feedback";
    el.quizReadBtn.onclick = function () { speak(q.say); };
    el.quizOptions.innerHTML = "";
    q.options.forEach(function (opt) {
      var b = document.createElement("button");
      b.className = "opt-btn";
      b.textContent = opt;
      b.addEventListener("click", function () { answer(opt, b); });
      el.quizOptions.appendChild(b);
    });
    speak(q.say);
  }

  function answer(choice, btn) {
    var Q = state.quiz;
    if (Q.locked) return;
    Q.locked = true;
    var q = Q.qs[Q.index];
    var buttons = Array.prototype.slice.call(el.quizOptions.children);
    if (window.Tracker) Tracker.answer(choice === q.answer, "×" + Q.table + " " + Q.kind, { q: q.text || null });
    buttons.forEach(function (b) { b.disabled = true; });
    if (choice === q.answer) {
      btn.classList.add("right");
      Q.score++;
      addPoints(1);
      el.quizFeedback.textContent = pick(TT_CHEERS);
      el.quizFeedback.className = "quiz-feedback good";
      burstConfetti(10);
    } else {
      btn.classList.add("wrong");
      buttons.forEach(function (b) { if (b.textContent === String(q.answer)) b.classList.add("right"); });
      el.quizFeedback.textContent = "The answer is " + q.answer + ". You'll get the next one! 💪";
      el.quizFeedback.className = "quiz-feedback bad";
    }
    setTimeout(function () {
      Q.index++;
      if (Q.index < Q.qs.length) renderQuestion();
      else finishQuiz();
    }, 1300);
  }

  function finishQuiz() {
    var Q = state.quiz;
    var total = Q.qs.length, score = Q.score;
    if (window.Tracker) Tracker.complete(Q.kind, score, total, { item: "×" + Q.table });
    var ratio = score / total;
    var newT = [];
    var mastered = false;

    if (Q.kind === "skip") {
      if (!state.skipDone.has(Q.table)) { state.skipDone.add(Q.table); saveSet("tt_skip", state.skipDone); }
      if (TABLES.every(function (n) { return state.skipDone.has(n); }) && awardTrophy("skip-star")) newT.push("skip-star");
    } else if (Q.kind === "practice") {
      if (score >= Math.ceil(total * 0.9)) {
        mastered = true;
        if (!state.mastered.has(Q.table)) { state.mastered.add(Q.table); saveSet("tt_mastered", state.mastered); }
        if (awardTrophy("blastoff")) newT.push("blastoff");
        if (state.mastered.size >= 6 && awardTrophy("halfway")) newT.push("halfway");
        if (TABLES.every(function (n) { return state.mastered.has(n); }) && awardTrophy("champion")) newT.push("champion");
      }
    } else if (Q.kind === "fluency") {
      if (score > state.fluencyBest) { state.fluencyBest = score; saveInt("tt_fluencyBest", score); }
      if (score >= 10 && awardTrophy("fluent")) newT.push("fluent");
    }

    // stars
    var stars = ratio === 1 ? 3 : ratio >= 0.7 ? 2 : 1;
    el.resStars.innerHTML = "";
    for (var s = 0; s < 3; s++) {
      var span = document.createElement("span");
      span.className = "res-star" + (s < stars ? "" : " dim");
      span.textContent = s < stars ? "⭐" : "☆";
      span.style.animationDelay = (s * 0.12) + "s";
      el.resStars.appendChild(span);
    }
    el.resScore.textContent = "You got " + score + " out of " + total + "!";

    if (Q.kind === "skip") {
      el.resEmoji.textContent = "🪜";
      el.resHeadline.textContent = "Skip counting done!";
      el.resMsg.textContent = "Skip counting by " + Q.table + " makes the ×" + Q.table + " table easy. Try it now!";
    } else if (Q.kind === "practice") {
      el.resEmoji.textContent = mastered ? "🏅" : "💪";
      el.resHeadline.textContent = mastered ? "Table Mastered!" : "Good practice!";
      el.resMsg.textContent = mastered
        ? "You earned the ×" + Q.table + " gold star! On to the next table."
        : "So close! Read the table again, then try once more to master it.";
    } else {
      el.resEmoji.textContent = ratio === 1 ? "🚀" : "⚡";
      el.resHeadline.textContent = ratio === 1 ? "Perfect Blast-off!" : "Nice flying!";
      el.resMsg.textContent = "Your best fluency score is " + state.fluencyBest + " out of 12. Keep blasting off to beat it!";
    }

    if (newT.length) {
      var t = TT_TROPHIES.find(function (x) { return x.id === newT[newT.length - 1]; });
      el.resUnlock.hidden = false;
      el.resUnlock.textContent = "🏆 New trophy: " + t.icon + " " + t.name + "!";
    } else { el.resUnlock.hidden = true; }

    // "Try Again" repeats the same phase/table
    el.againBtn.onclick = function () {
      if (Q.kind === "skip") startSkip(Q.table);
      else if (Q.kind === "practice") startPractice(Q.table);
      else startFluency();
    };

    showScreen("result");
    if (ratio >= 0.7) burstConfetti(60);
  }

  // ---------- Trophies ----------
  function awardTrophy(id) {
    if (state.trophies.has(id)) return false;
    state.trophies.add(id); saveSet("tt_trophies", state.trophies);
    var t = TT_TROPHIES.find(function (x) { return x.id === id; });
    if (t) showTrophyToast(t);
    return true;
  }
  function showTrophyToast(trophy) {
    var toast = document.createElement("div");
    toast.className = "trophy-toast";
    toast.innerHTML = '<span class="toast-icon">' + trophy.icon + "</span><span>New trophy: <b>" + trophy.name + "</b>!</span>";
    document.body.appendChild(toast);
    requestAnimationFrame(function () { toast.classList.add("show"); });
    setTimeout(function () { toast.classList.remove("show"); setTimeout(function () { toast.remove(); }, 500); }, 2600);
  }
  function buildTrophies() {
    el.trophyGrid.innerHTML = "";
    var earned = 0;
    TT_TROPHIES.forEach(function (t) {
      var has = state.trophies.has(t.id);
      if (has) earned++;
      var card = document.createElement("div");
      card.className = "trophy-card " + (has ? "earned" : "locked");
      card.innerHTML = '<span class="trophy-icon">' + (has ? t.icon : "🔒") + "</span>" +
        '<span class="trophy-name">' + t.name + "</span><span class=\"trophy-desc\">" + t.desc + "</span>";
      el.trophyGrid.appendChild(card);
    });
    el.trophyEarned.textContent = earned;
    el.trophyTotalCount.textContent = TT_TROPHIES.length;
  }

  // ---------- Confetti ----------
  function burstConfetti(count) {
    var colors = ["#4ab3f4", "#ff8a3d", "#ffc23d", "#ff5d73", "#37d0a8"];
    for (var i = 0; i < count; i++) {
      var c = document.createElement("div");
      c.className = "confetti";
      c.style.left = Math.random() * 100 + "vw";
      c.style.background = pick(colors);
      c.style.animationDuration = 1.6 + Math.random() * 1.4 + "s";
      c.style.transform = "rotate(" + Math.random() * 360 + "deg)";
      document.body.appendChild(c);
      setTimeout(function (node) { return function () { node.remove(); }; }(c), 3200);
    }
  }

  // ---------- Init ----------
  function init() {
    buildHome();
    updatePointsBadge();
    el.backBtn.addEventListener("click", function () { buildHome(); showScreen("home"); });
    el.trophyBtn.addEventListener("click", function () { buildTrophies(); showScreen("trophy"); });
    el.resHomeBtn.addEventListener("click", function () { buildHome(); showScreen("home"); });

    document.addEventListener("keydown", function (e) {
      if (!el.screens.quiz.classList.contains("active") || (state.quiz && state.quiz.locked)) return;
      var n = parseInt(e.key, 10);
      var opts = el.quizOptions.children;
      if (n >= 1 && n <= opts.length) opts[n - 1].click();
    });
  }
  document.addEventListener("DOMContentLoaded", init);
})();
