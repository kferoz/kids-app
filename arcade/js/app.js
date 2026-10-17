/* ============================================================
   Free Games Arcade — App Logic
   Four quick mini-games. Tickets 🎟️ earned are saved to the shared
   "rw_tickets" key so the Rewards Center's Prize Wheel can use them.
   ============================================================ */

(function () {
  "use strict";

  var el = {};
  var quiz = null, scr = null, mem = null;

  function $(id) { return document.getElementById(id); }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function rand(lo, hi) { return lo + Math.floor(Math.random() * (hi - lo + 1)); }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function getNum(k) { return parseInt(localStorage.getItem(k) || "0", 10) || 0; }
  function tickets() { return getNum("rw_tickets"); }
  function addTickets(n) { localStorage.setItem("rw_tickets", String(tickets() + n)); updateBadge(); }
  function updateBadge() {
    el.ticketCount.textContent = tickets();
    var i = el.ticketBadge.querySelector(".tk-icon"); i.style.animation = "none"; void i.offsetWidth; i.style.animation = "pop 0.4s ease";
  }
  function showScreen(name) {
    ["home", "quiz", "scramble", "memory", "result"].forEach(function (s) { el.screens[s].classList.remove("active"); });
    el.screens[name].classList.add("active");
    el.backBtn.hidden = (name === "home");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function burstConfetti(n) {
    var colors = ["#33c9dc", "#ff8a3d", "#a56bff", "#7ed957", "#ff6f91"];
    for (var i = 0; i < n; i++) { var c = document.createElement("div"); c.className = "confetti"; c.style.left = Math.random() * 100 + "vw"; c.style.background = pick(colors); c.style.animationDuration = 1.6 + Math.random() * 1.4 + "s"; c.style.transform = "rotate(" + Math.random() * 360 + "deg)"; document.body.appendChild(c); setTimeout(function (x) { return function () { x.remove(); }; }(c), 3200); }
  }

  // ---------- Home ----------
  function buildHome() {
    el.gameGrid.innerHTML = "";
    ARCADE_GAMES.forEach(function (g) {
      var card = document.createElement("button");
      card.className = "game-card"; card.style.setProperty("--accent", g.color);
      card.innerHTML = '<span class="game-emoji">' + g.emoji + '</span><span class="game-title">' + g.name + '</span><span class="game-tag">' + g.tagline + '</span><span class="game-play">Play →</span>';
      card.addEventListener("click", function () { startGame(g.id); });
      el.gameGrid.appendChild(card);
    });
  }
  function startGame(id) {
    lastGame = id;
    if (id === "math") startQuiz("Quick Math", mathQuestions());
    else if (id === "oddone") startQuiz("Odd One Out", oddQuestions());
    else if (id === "scramble") startScramble();
    else if (id === "memory") startMemory();
  }

  // ---------- Quiz (math / oddone) ----------
  function numOptions(ans) {
    var opts = [ans], cand = shuffle([ans + 1, ans - 1, ans + 2, ans - 2, ans + 10, ans - 10, ans + 3]).filter(function (x) { return x > 0 && x !== ans; });
    for (var i = 0; i < cand.length && opts.length < 4; i++) if (opts.indexOf(cand[i]) === -1) opts.push(cand[i]);
    var e = 4; while (opts.length < 4) { if (opts.indexOf(ans + e) === -1) opts.push(ans + e); e++; }
    return shuffle(opts);
  }
  function mathQuestions() {
    var qs = [];
    for (var i = 0; i < 8; i++) {
      var t = pick(["+", "-", "x"]), a, b, ans, q;
      if (t === "+") { a = rand(2, 20); b = rand(2, 20); ans = a + b; q = a + " + " + b; }
      else if (t === "-") { a = rand(6, 20); b = rand(1, a - 1); ans = a - b; q = a + " − " + b; }
      else { a = rand(2, 9); b = rand(2, 9); ans = a * b; q = a + " × " + b; }
      qs.push({ q: q + " = ?", answer: ans, options: numOptions(ans) });
    }
    return qs;
  }
  function oddQuestions() {
    return shuffle(ARCADE_ODD).slice(0, 6).map(function (s) {
      return { q: s.q, answer: s.odd, options: shuffle(s.items.slice()) };
    });
  }
  function startQuiz(title, qs) {
    quiz = { qs: qs, index: 0, score: 0, locked: false };
    el.quizTitle.textContent = title; el.quizTotal.textContent = qs.length; el.quizScore.textContent = 0;
    renderQuestion(); showScreen("quiz");
  }
  function renderQuestion() {
    var q = quiz.qs[quiz.index]; quiz.locked = false;
    el.quizNow.textContent = quiz.index + 1;
    el.quizProgress.style.width = (quiz.index / quiz.qs.length * 100) + "%";
    el.quizQuestion.textContent = q.q;
    el.quizFeedback.textContent = ""; el.quizFeedback.className = "quiz-feedback";
    el.quizOptions.innerHTML = "";
    q.options.forEach(function (opt) {
      var b = document.createElement("button"); b.className = "opt-btn"; b.textContent = opt;
      b.addEventListener("click", function () { answerQ(opt, b); });
      el.quizOptions.appendChild(b);
    });
  }
  function answerQ(choice, btn) {
    if (quiz.locked) return; quiz.locked = true;
    var q = quiz.qs[quiz.index];
    Array.prototype.forEach.call(el.quizOptions.children, function (b) { b.disabled = true; });
    if (window.Tracker) Tracker.answer(String(choice) === String(q.answer), el.quizTitle.textContent);
    if (String(choice) === String(q.answer)) {
      btn.classList.add("right"); quiz.score++; addTickets(1); el.quizScore.textContent = quiz.score;
      el.quizFeedback.textContent = pick(["Nice! 🎟️", "Yes! ⭐", "Correct! 🎉"]); el.quizFeedback.className = "quiz-feedback good"; burstConfetti(8);
    } else {
      btn.classList.add("wrong");
      Array.prototype.forEach.call(el.quizOptions.children, function (b) { if (b.textContent === String(q.answer)) b.classList.add("right"); });
      el.quizFeedback.textContent = "The answer is " + q.answer + "."; el.quizFeedback.className = "quiz-feedback bad";
    }
    setTimeout(function () { quiz.index++; if (quiz.index < quiz.qs.length) renderQuestion(); else finish("🧮", "Great math!", quiz.score); }, 1150);
  }

  // ---------- Word Scramble ----------
  function startScramble() {
    scr = { words: shuffle(SCRAMBLE_WORDS).slice(0, 6), index: 0, score: 0 };
    el.scrTotal.textContent = scr.words.length; el.scrScore.textContent = 0;
    renderScramble(); showScreen("scramble");
  }
  function renderScramble() {
    var w = scr.words[scr.index];
    scr.built = "";
    el.scrNow.textContent = scr.index + 1;
    el.scrProgress.style.width = (scr.index / scr.words.length * 100) + "%";
    el.scrHint.textContent = w.emoji;
    el.scrFeedback.textContent = ""; el.scrFeedback.className = "quiz-feedback";
    el.scrSlots.innerHTML = "";
    for (var i = 0; i < w.word.length; i++) { var s = document.createElement("span"); s.className = "scr-slot"; el.scrSlots.appendChild(s); }
    el.scrLetters.innerHTML = "";
    var letters = shuffle(w.word.split(""));
    if (letters.join("") === w.word) letters = shuffle(letters);   // avoid already-solved
    letters.forEach(function (ch) {
      var b = document.createElement("button"); b.className = "scr-letter"; b.textContent = ch;
      b.addEventListener("click", function () { tapLetter(ch, b, w); });
      el.scrLetters.appendChild(b);
    });
  }
  function tapLetter(ch, btn, w) {
    if (btn.disabled) return;
    btn.disabled = true; btn.classList.add("used");
    scr.built += ch;
    var slots = el.scrSlots.children;
    slots[scr.built.length - 1].textContent = ch;
    slots[scr.built.length - 1].classList.add("filled");
    if (scr.built.length === w.word.length) {
      if (scr.built === w.word) {
        scr.score++; addTickets(1); el.scrScore.textContent = scr.score;
        el.scrFeedback.textContent = "Yes! 🎟️ " + w.word; el.scrFeedback.className = "quiz-feedback good"; burstConfetti(10);
        setTimeout(function () { scr.index++; if (scr.index < scr.words.length) renderScramble(); else finish("🔤", "Word wizard!", scr.score); }, 1050);
      } else {
        el.scrFeedback.textContent = "Not quite — try again!"; el.scrFeedback.className = "quiz-feedback bad";
        setTimeout(clearScramble, 800);
      }
    }
  }
  function clearScramble() {
    scr.built = "";
    Array.prototype.forEach.call(el.scrSlots.children, function (s) { s.textContent = ""; s.classList.remove("filled"); });
    Array.prototype.forEach.call(el.scrLetters.children, function (b) { b.disabled = false; b.classList.remove("used"); });
    el.scrFeedback.textContent = "";
  }

  // ---------- Memory Match ----------
  function startMemory() {
    var pairs = 5;
    var chosen = shuffle(ARCADE_MEMORY).slice(0, pairs);
    mem = { deck: shuffle(chosen.concat(chosen)), first: null, found: 0, lock: false, pairs: pairs };
    el.memPairs.textContent = pairs; el.memFound.textContent = 0;
    el.memBoard.innerHTML = "";
    el.memBoard.style.setProperty("--cols", 5);
    mem.deck.forEach(function (emoji) {
      var card = document.createElement("button"); card.className = "mem-card"; card.dataset.emoji = emoji;
      card.innerHTML = '<span class="mc-inner"><span class="mc-front">❓</span><span class="mc-back">' + emoji + '</span></span>';
      card.addEventListener("click", function () { flipMem(card); });
      el.memBoard.appendChild(card);
    });
    showScreen("memory");
  }
  function flipMem(card) {
    if (mem.lock || card.classList.contains("flipped") || card.classList.contains("matched")) return;
    card.classList.add("flipped");
    if (!mem.first) { mem.first = card; return; }
    if (mem.first.dataset.emoji === card.dataset.emoji) {
      card.classList.add("matched"); mem.first.classList.add("matched"); mem.first = null; mem.found++;
      el.memFound.textContent = mem.found; addTickets(1); burstConfetti(8);
      if (mem.found === mem.pairs) setTimeout(function () { finish("🧠", "Memory master!", mem.pairs); }, 600);
    } else {
      mem.lock = true; var a = mem.first, b = card;
      setTimeout(function () { a.classList.remove("flipped"); b.classList.remove("flipped"); mem.first = null; mem.lock = false; }, 800);
    }
  }

  // ---------- Result ----------
  var lastGame = null;
  function finish(emoji, headline, earned) {
    if (window.Tracker) Tracker.complete("arcade-round", earned, null, { headline: headline });
    el.resEmoji.textContent = emoji; el.resHeadline.textContent = headline;
    el.resTickets.textContent = "You earned " + earned + " 🎟️";
    el.resTotal.textContent = "You now have " + tickets() + " 🎟️ in all!";
    showScreen("result"); burstConfetti(50);
  }

  function init() {
    el = {
      screens: { home: $("homeScreen"), quiz: $("quizScreen"), scramble: $("scrambleScreen"), memory: $("memoryScreen"), result: $("resultScreen") },
      backBtn: $("backBtn"), ticketBadge: $("ticketBadge"), ticketCount: $("ticketCount"), gameGrid: $("gameGrid"),
      quizTitle: $("quizTitle"), quizNow: $("quizNow"), quizTotal: $("quizTotal"), quizScore: $("quizScore"), quizProgress: $("quizProgress"), quizQuestion: $("quizQuestion"), quizOptions: $("quizOptions"), quizFeedback: $("quizFeedback"),
      scrNow: $("scrNow"), scrTotal: $("scrTotal"), scrScore: $("scrScore"), scrProgress: $("scrProgress"), scrHint: $("scrHint"), scrSlots: $("scrSlots"), scrLetters: $("scrLetters"), scrClear: $("scrClear"), scrFeedback: $("scrFeedback"),
      memFound: $("memFound"), memPairs: $("memPairs"), memBoard: $("memBoard"),
      resEmoji: $("resEmoji"), resHeadline: $("resHeadline"), resTickets: $("resTickets"), resTotal: $("resTotal"), againBtn: $("againBtn"), moreBtn: $("moreBtn")
    };
    updateBadge(); buildHome();
    el.backBtn.addEventListener("click", function () { buildHome(); showScreen("home"); });
    el.moreBtn.addEventListener("click", function () { buildHome(); showScreen("home"); });
    el.scrClear.addEventListener("click", clearScramble);
    el.againBtn.addEventListener("click", function () { if (lastGame) startGame(lastGame); else { buildHome(); showScreen("home"); } });
  }
  document.addEventListener("DOMContentLoaded", init);
})();
