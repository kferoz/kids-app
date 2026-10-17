/* ============================================================
   Reading Detectives — App Engine
   Roco the Raccoon 🦝 guides a Grade-3 reader through 12
   comprehension "cases" that unlock in order. Screens:
   Home → Cases → Case player → Reward, plus a Detective Kit
   (gadget room) and a Clue Hunt bonus game.
   Data lives in CASES / CLUE_HUNT / RANKS / RC_TROPHIES.
   Saves to localStorage (rc_); shares rw_tickets with the hub.
   ============================================================ */
(function () {
  "use strict";

  /* ---------- helpers ---------- */
  var $ = function (id) { return document.getElementById(id); };
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function stripHtml(s) { var d = el("div", null, s); return d.textContent || d.innerText || ""; }
  function byId(arr, id) { for (var i = 0; i < arr.length; i++) if (arr[i].id === id) return arr[i]; return null; }

  /* ---------- storage ---------- */
  function gNum(k) { var v = parseInt(localStorage.getItem(k), 10); return isNaN(v) ? 0 : v; }
  function sNum(k, n) { localStorage.setItem(k, String(n)); }
  function gArr(k) { try { return JSON.parse(localStorage.getItem(k)) || []; } catch (e) { return []; } }
  function sArr(k, a) { localStorage.setItem(k, JSON.stringify(a)); }

  var K = {
    points: "rc_points", trophies: "rc_trophies", stickers: "rc_stickers",
    solved: "rc_solved", streak: "rc_beststreak", clue: "rc_cluebest",
    tickets: "rw_tickets", muted: "rc_muted"
  };

  function points() { return gNum(K.points); }
  function addPoints(n) { sNum(K.points, points() + n); }
  function solvedList() { return gArr(K.solved); }
  function isSolved(n) { return solvedList().indexOf(n) !== -1; }
  function unlocked(n) { return n === 1 || isSolved(n - 1); }
  function solvedCount() { return solvedList().length; }
  function markSolved(n) { var s = solvedList(); if (s.indexOf(n) === -1) { s.push(n); sArr(K.solved, s); } }
  function addSticker(e) { var s = gArr(K.stickers); s.push(e); sArr(K.stickers, s); }
  function addTicket() { sNum(K.tickets, gNum(K.tickets) + 1); }
  function grantTrophy(id) { var a = gArr(K.trophies); if (a.indexOf(id) !== -1) return false; a.push(id); sArr(K.trophies, a); return true; }
  function hasTrophy(id) { return gArr(K.trophies).indexOf(id) !== -1; }
  function rankFor(count) { var r = RANKS[0]; for (var i = 0; i < RANKS.length; i++) if (count >= RANKS[i].need) r = RANKS[i]; return r; }

  /* ---------- speech ---------- */
  var canSpeak = "speechSynthesis" in window;
  var muted = localStorage.getItem(K.muted) === "1";
  function speak(text) {
    if (!canSpeak || !text || muted) return;
    try { window.speechSynthesis.cancel(); var u = new SpeechSynthesisUtterance(String(text)); u.rate = 0.95; u.pitch = 1.05; u.lang = "en-US"; window.speechSynthesis.speak(u); } catch (e) {}
  }
  function stopSpeak() { if (canSpeak) try { window.speechSynthesis.cancel(); } catch (e) {} }

  /* ---------- confetti ---------- */
  function confetti() {
    var box = $("confetti"); if (!box) return;
    var emo = ["🎉", "⭐", "🔍", "🏅", "✨", "🕵️", "🎊"];
    for (var i = 0; i < 26; i++) {
      var p = el("span", "confetti-bit", pick(emo));
      p.style.left = Math.random() * 100 + "%"; p.style.animationDelay = (Math.random() * 0.5) + "s";
      p.style.fontSize = (16 + Math.random() * 22) + "px"; box.appendChild(p);
      (function (n) { setTimeout(function () { n.remove(); }, 2200); })(p);
    }
  }

  /* ---------- screens ---------- */
  var screens = ["homeScreen", "casesScreen", "caseScreen", "rewardScreen", "kitScreen", "clueScreen"];
  function show(id) { screens.forEach(function (s) { var e = $(s); if (e) e.classList.toggle("active", s === id); }); window.scrollTo(0, 0); }

  /* =========================================================
     HOME
     ========================================================= */
  function renderHome() {
    var count = solvedCount(), rank = rankFor(count);
    $("rankBadge").textContent = rank.icon;
    $("rankName").textContent = rank.name;
    var pct = Math.round(count / CASES.length * 100);
    $("powerFill").style.width = pct + "%";
    $("powerLabel").textContent = count + " / " + CASES.length + " cases solved";
    $("homePoints").textContent = "⭐ " + points();
    $("muteBtn").textContent = muted ? "🔇" : "🔊";
    var next = CASES.length && count < CASES.length ? (count + 1) : CASES.length;
    $("startBtn").textContent = count === 0 ? "🔍 Start Case 1" : (count >= CASES.length ? "🏅 All Cases Solved — Review" : "🔍 Continue: Case " + next);
  }

  /* =========================================================
     CASES — the numbered journey
     ========================================================= */
  function renderCases() {
    var list = $("caseList"); list.innerHTML = "";
    CASES.forEach(function (c) {
      var done = isSolved(c.n), open = unlocked(c.n);
      var node = el("button", "case-node" + (done ? " done" : "") + (open ? "" : " locked"));
      node.innerHTML =
        '<span class="case-num">' + (done ? "✅" : (open ? c.n : "🔒")) + '</span>' +
        '<span class="case-info"><b>Case ' + c.n + ': ' + c.title + '</b><span>' + c.emoji + " " + c.skill + '</span></span>' +
        '<span class="case-sticker">' + (done ? c.sticker : "") + '</span>';
      if (open) node.addEventListener("click", function () { startCase(c); });
      else node.addEventListener("click", function () { speak("Solve the case before this one first."); });
      list.appendChild(node);
    });
    var rank = rankFor(solvedCount());
    $("casesRank").innerHTML = rank.icon + " " + rank.name;
    show("casesScreen");
  }

  /* =========================================================
     CASE PLAYER — step engine
     ========================================================= */
  var curCase = null, stepIdx = 0, answered = false, caseScore = 0, caseMistakes = 0, combo = 0;

  function startCase(c) {
    curCase = c; stepIdx = 0; caseScore = 0; caseMistakes = 0;
    renderStep(); show("caseScreen");
  }

  function scoredSteps(c) { var n = 0; c.steps.forEach(function (s) { if (s.k === "pick" || s.k === "order") n++; }); return n; }

  function renderStep() {
    answered = false;
    var step = curCase.steps[stepIdx];
    $("caseTitle").textContent = "Case " + curCase.n + ": " + curCase.title;

    var dots = $("stepDots"); dots.innerHTML = "";
    for (var i = 0; i < curCase.steps.length; i++) dots.appendChild(el("span", "dot" + (i < stepIdx ? " past" : i === stepIdx ? " now" : "")));

    var body = $("caseBody"); body.innerHTML = "";
    var fb = $("caseFeedback"); fb.innerHTML = ""; fb.className = "case-feedback";

    if (step.k === "teach") return renderTeach(step, body);
    if (step.k === "read") return renderRead(step, body);
    if (step.k === "pick") return renderPick(step, body);
    if (step.k === "order") return renderOrder(step, body);
  }

  function renderTeach(step, body) {
    var card = el("div", "teach-card");
    card.innerHTML = '<div class="teach-emoji">' + step.emoji + '</div><h3>' + step.title + '</h3><p>' + step.text.replace(/\n/g, "<br>") + '</p>';
    body.appendChild(card);
    speak(step.say || (step.title + ". " + step.text));
    var b = el("button", "big-btn go", "Got it — let's read! 🔎");
    b.addEventListener("click", nextStep); body.appendChild(b);
  }

  function renderRead(step, body) {
    var file = el("div", "case-file");
    file.innerHTML =
      '<div class="file-tab">📁 CASE FILE</div>' +
      '<div class="file-emoji">' + step.emoji + '</div>' +
      '<h3 class="file-title">' + step.title + '</h3>' +
      '<p class="file-text">' + step.text.replace(/\n\n/g, "</p><p class=\"file-text\">") + '</p>';
    body.appendChild(file);
    speak(step.say || step.text);
    var row = el("div", "read-actions");
    var listen = el("button", "big-btn ghost", "🔊 Read it to me");
    listen.addEventListener("click", function () { speak(step.say || step.text); });
    var go = el("button", "big-btn go", "I found the clues! 🕵️");
    go.addEventListener("click", nextStep);
    row.appendChild(listen); row.appendChild(go); body.appendChild(row);
  }

  function renderPick(step, body) {
    body.appendChild(el("div", "q-text", step.q));
    speak(step.say || step.q);
    var wrap = el("div", "choices");
    step.choices.forEach(function (c, i) {
      var b = el("button", "choice", c);
      b.addEventListener("click", function () { answerPick(b, i === step.answer); });
      wrap.appendChild(b);
    });
    body.appendChild(wrap);
  }

  function answerPick(btn, correct) {
    if (answered) return;
    if (window.Tracker) Tracker.answer(!!correct, (curCase && (curCase.name || curCase.title || curCase.id)) );
    if (correct) {
      answered = true; btn.classList.add("right");
      onCorrect();
      setTimeout(nextStep, 950);
    } else {
      btn.classList.add("wrong"); btn.disabled = true;
      onWrong("🤔 Look again, detective!");
    }
  }

  /* -- ORDER: tap events into sequence -- */
  function renderOrder(step, body) {
    body.appendChild(el("div", "q-text", step.prompt));
    speak(step.say || step.prompt);
    var correct = step.items.slice();
    var pool = correct.slice(); shuffle(pool);
    // avoid an already-correct scramble
    if (pool.join("|") === correct.join("|")) pool.reverse();

    var slots = el("div", "order-slots");
    var poolBox = el("div", "order-pool");
    var placed = []; // texts in placed order

    function refresh() {
      slots.innerHTML = "";
      for (var i = 0; i < correct.length; i++) {
        var s = el("div", "order-slot" + (placed[i] != null ? " filled" : ""));
        s.innerHTML = '<span class="slot-num">' + (i + 1) + '</span>' + (placed[i] != null ? '<span class="slot-text">' + placed[i] + '</span>' : '<span class="slot-hint">tap a clue below</span>');
        if (placed[i] != null) {
          (function (idx) { s.addEventListener("click", function () { if (answered) return; var t = placed[idx]; placed[idx] = null; addChip(t); refresh(); }); })(i);
        }
        slots.appendChild(s);
      }
    }
    function addChip(text) {
      var chip = el("button", "order-chip", text);
      chip.addEventListener("click", function () {
        if (answered) return;
        var slot = placed.indexOf(null); var firstEmpty = -1;
        for (var i = 0; i < correct.length; i++) { if (placed[i] == null) { firstEmpty = i; break; } }
        if (firstEmpty === -1) return;
        placed[firstEmpty] = text; chip.remove(); refresh();
        if (placed.indexOf(null) === -1 && placed.length === correct.length && placed.every(function (x) { return x != null; })) checkOrder();
      });
      poolBox.appendChild(chip);
    }

    for (var i = 0; i < correct.length; i++) placed.push(null);
    pool.forEach(addChip);
    refresh();
    body.appendChild(slots);
    body.appendChild(el("div", "order-or", "— clues —"));
    body.appendChild(poolBox);

    function checkOrder() {
      var ok = placed.join("|") === correct.join("|");
      if (window.Tracker) Tracker.answer(ok, ((curCase && (curCase.name || curCase.title || curCase.id))) + " (order)");
      if (ok) {
        answered = true;
        [].forEach.call(slots.querySelectorAll(".order-slot"), function (s) { s.classList.add("right"); });
        onCorrect();
        setTimeout(nextStep, 1100);
      } else {
        onWrong("🤔 Not quite the right order — try again!");
        slots.classList.add("shake");
        setTimeout(function () {
          slots.classList.remove("shake");
          // return everything to the pool to retry
          for (var i = 0; i < placed.length; i++) { if (placed[i] != null) { addChip(placed[i]); placed[i] = null; } }
          shuffleChips(poolBox); refresh();
        }, 650);
      }
    }
  }
  function shuffleChips(box) { var kids = [].slice.call(box.children); shuffle(kids); kids.forEach(function (k) { box.appendChild(k); }); }

  function onCorrect() {
    caseScore += 1; addPoints(10); combo += 1;
    if (combo > gNum(K.streak)) sNum(K.streak, combo);
    var fb = $("caseFeedback"); fb.className = "case-feedback yay";
    fb.innerHTML = "⭐ +10 " + pick(["Case clue solved!", "Sharp eyes!", "Nailed it!", "Great detective work!"]) + (combo >= 2 ? '  <span class="combo">🔥 ' + combo + ' in a row</span>' : "");
    speak(pick(["Yes!", "Correct!", "Great detective work!", "Sharp eyes!"]));
    if (combo >= 5 && !hasTrophy("streak5")) { grantTrophy("streak5"); pendingStreakTrophy = true; }
    $("homePoints") && ($("homePoints").textContent = "⭐ " + points());
  }
  function onWrong(msg) {
    combo = 0; caseMistakes += 1;
    var fb = $("caseFeedback"); fb.className = "case-feedback try"; fb.innerHTML = msg;
    speak("Good try. Look again.");
  }

  var pendingStreakTrophy = false;

  function nextStep() {
    stopSpeak();
    stepIdx++;
    if (stepIdx >= curCase.steps.length) return finishCase();
    renderStep();
  }

  /* =========================================================
     REWARD
     ========================================================= */
  function finishCase() {
    if (window.Tracker) Tracker.complete("case", caseScore, null, { item: (curCase && (curCase.name || curCase.title || curCase.id)), mistakes: caseMistakes });
    var first = !isSolved(curCase.n);
    markSolved(curCase.n);
    var newTrophies = [], newRank = null;

    var beforeRank = rankFor(first ? solvedCount() - 1 : solvedCount());
    var afterRank = rankFor(solvedCount());
    if (afterRank.name !== beforeRank.name) newRank = afterRank;

    if (first) {
      addSticker(curCase.sticker); addTicket();
      if (grantTrophy("first")) newTrophies.push(byId(RC_TROPHIES, "first"));
      if (solvedCount() >= 6 && grantTrophy("halfway")) newTrophies.push(byId(RC_TROPHIES, "halfway"));
      if (solvedCount() >= CASES.length && grantTrophy("chief")) newTrophies.push(byId(RC_TROPHIES, "chief"));
    }
    if (caseMistakes === 0 && grantTrophy("perfect")) newTrophies.push(byId(RC_TROPHIES, "perfect"));
    if (pendingStreakTrophy) { newTrophies.push(byId(RC_TROPHIES, "streak5")); pendingStreakTrophy = false; }

    var perfect = caseMistakes === 0;
    var html =
      '<div class="reward-badge">' + curCase.sticker + '</div>' +
      '<h2>Case ' + curCase.n + ' Solved!</h2>' +
      '<p class="reward-sub">' + (perfect ? "Flawless detective work! 🌟" : "Case closed — nice work, detective! 🕵️") + '</p>' +
      '<div class="reward-stats"><span>⭐ +' + (caseScore * 10) + ' points</span>' +
        (first ? '<span>🎟️ Sticker: ' + curCase.sticker + '</span>' : '<span>↺ Reviewed</span>') + '</div>';
    if (newRank) html += '<div class="reward-new rank"><h3>🎖️ Rank Up!</h3><div class="new-item">' + newRank.icon + ' You are now a <b>' + newRank.name + '</b>!</div></div>';
    if (newTrophies.length) {
      html += '<div class="reward-new"><h3>🏆 New Trophy!</h3>';
      newTrophies.forEach(function (t) { html += '<div class="new-item">' + t.icon + ' <b>' + t.name + '</b> — ' + t.desc + '</div>'; });
      html += '</div>';
    }
    $("rewardBox").innerHTML = html;
    speak("Case solved! " + (newRank ? "You ranked up to " + newRank.name + "." : "") + (perfect ? " Flawless work." : ""));

    var nb = $("nextCaseBtn"), idx = CASES.indexOf(curCase);
    if (idx < CASES.length - 1) { nb.style.display = ""; nb.textContent = "Next Case →"; nb.onclick = function () { startCase(CASES[idx + 1]); }; }
    else { nb.style.display = ""; nb.textContent = "🏅 All Cases Solved!"; nb.onclick = renderCases; }

    show("rewardScreen"); confetti();
  }

  /* =========================================================
     DETECTIVE KIT — gadget room
     ========================================================= */
  function renderKit() {
    var count = solvedCount(), rank = rankFor(count);
    $("kitTotals").innerHTML =
      '<div class="stat"><b>' + rank.icon + '</b><span>' + rank.name + '</span></div>' +
      '<div class="stat"><b>⭐ ' + points() + '</b><span>points</span></div>' +
      '<div class="stat"><b>🔦 ' + gNum(K.streak) + '</b><span>best streak</span></div>' +
      '<div class="stat"><b>🏆 ' + gArr(K.trophies).length + '</b><span>trophies</span></div>';

    // rank ladder
    var rl = $("rankLadder"); rl.innerHTML = "";
    RANKS.forEach(function (r) {
      var have = count >= r.need;
      var cur = rank.name === r.name;
      var d = el("div", "wall-item" + (have ? " have" : "") + (cur ? " current" : ""));
      d.innerHTML = '<span class="wi-icon">' + (have ? r.icon : "🔒") + '</span><b>' + r.name + '</b><span class="wi-desc">' + r.need + "+ cases</span>";
      rl.appendChild(d);
    });

    // sticker book
    var sb = $("stickerBook"); sb.innerHTML = "";
    var st = gArr(K.stickers);
    if (!st.length) sb.appendChild(el("p", "empty", "Solve cases to collect detective stickers! 🎟️"));
    else st.forEach(function (s) { sb.appendChild(el("span", "sticker-slot", s)); });

    // trophies
    var tw = $("trophyWall"); tw.innerHTML = "";
    var gt = gArr(K.trophies);
    RC_TROPHIES.forEach(function (t) {
      var have = gt.indexOf(t.id) !== -1;
      var d = el("div", "wall-item" + (have ? " have" : ""));
      d.innerHTML = '<span class="wi-icon">' + (have ? t.icon : "🔒") + '</span><b>' + t.name + '</b><span class="wi-desc">' + t.desc + "</span>";
      tw.appendChild(d);
    });

    // case-file bookshelf
    var bs = $("bookshelf"); bs.innerHTML = "";
    CASES.forEach(function (c) {
      var done = isSolved(c.n);
      var b = el("div", "book" + (done ? " read" : ""));
      b.innerHTML = '<span class="book-emoji">' + (done ? c.emoji.charAt(0) || "📖" : "📕") + '</span><span class="book-title">' + (done ? c.steps.filter(function (s) { return s.k === "read"; })[0].title : "Case " + c.n) + '</span>';
      bs.appendChild(b);
    });
    var best = gNum(K.clue);
    $("clueBest").textContent = best > 0 ? ("🔦 Clue Hunt best: " + best + " / 10") : "🔦 Clue Hunt: not played yet";

    show("kitScreen");
  }

  /* =========================================================
     CLUE HUNT — bonus vocabulary game
     ========================================================= */
  var clueRounds = [], clueIdx = 0, clueScore = 0, clueAnswered = false;
  function startClue() {
    clueRounds = shuffle(CLUE_HUNT.slice()).slice(0, 10);
    clueIdx = 0; clueScore = 0;
    renderClue(); show("clueScreen");
  }
  function renderClue() {
    clueAnswered = false;
    if (clueIdx >= clueRounds.length) return finishClue();
    $("clueProgress").textContent = "Clue " + (clueIdx + 1) + " / " + clueRounds.length;
    $("clueScore").textContent = "⭐ " + clueScore;
    var r = clueRounds[clueIdx];
    $("clueQ").innerHTML = r.q;
    speak("What does the mystery word mean?");
    var opts = [r.answer].concat(r.wrong); shuffle(opts);
    var wrap = $("clueChoices"); wrap.innerHTML = "";
    opts.forEach(function (o) {
      var b = el("button", "choice", o);
      b.addEventListener("click", function () { answerClue(b, o === r.answer); });
      wrap.appendChild(b);
    });
    $("clueFeedback").className = "case-feedback"; $("clueFeedback").innerHTML = "";
  }
  function answerClue(btn, correct) {
    if (clueAnswered) return; clueAnswered = true;
    if (window.Tracker) Tracker.answer(!!correct, "Clue Hunt vocabulary");
    if (correct) { btn.classList.add("right"); clueScore++; $("clueFeedback").className = "case-feedback yay"; $("clueFeedback").innerHTML = "✅ Solved!"; speak("Correct!"); }
    else { btn.classList.add("wrong"); $("clueFeedback").className = "case-feedback try"; $("clueFeedback").innerHTML = "The word means: <b>" + clueRounds[clueIdx].answer + "</b>"; speak("The answer was " + clueRounds[clueIdx].answer); }
    [].forEach.call($("clueChoices").children, function (c) { c.disabled = true; });
    setTimeout(function () { clueIdx++; renderClue(); }, 1050);
  }
  function finishClue() {
    if (clueScore > gNum(K.clue)) sNum(K.clue, clueScore);
    for (var i = 0; i < clueScore; i++) addTicket(); // reward tickets to the hub wheel
    var newT = null;
    if (clueScore === clueRounds.length && grantTrophy("cluewiz")) newT = byId(RC_TROPHIES, "cluewiz");
    $("clueQ").innerHTML = "🔦 Clue Hunt Complete!";
    $("clueChoices").innerHTML =
      '<div class="clue-result"><div class="reward-badge">' + (clueScore >= 8 ? "🏆" : clueScore >= 5 ? "🔍" : "📖") + '</div>' +
      '<h2>' + clueScore + ' / ' + clueRounds.length + '</h2>' +
      '<p class="reward-sub">' + (clueScore === clueRounds.length ? "Perfect! Word Wizard! 🌟" : clueScore >= 5 ? "Great detective vocabulary!" : "Keep hunting those clues!") + '</p>' +
      '<p class="reward-stats"><span>🎟️ +' + clueScore + ' tickets</span></p>' +
      (newT ? '<div class="reward-new"><h3>🏆 New Trophy!</h3><div class="new-item">' + newT.icon + ' <b>' + newT.name + '</b></div></div>' : "") +
      '</div>';
    $("clueProgress").textContent = "Done!"; $("clueScore").textContent = "⭐ " + clueScore;
    $("clueFeedback").innerHTML = "";
    speak("Clue Hunt complete! You scored " + clueScore + " out of " + clueRounds.length + ".");
    confetti();
  }

  /* ---------- wiring ---------- */
  function wire() {
    $("startBtn").addEventListener("click", renderCases);
    $("kitBtn").addEventListener("click", renderKit);
    $("clueBtn").addEventListener("click", startClue);
    $("casesBack").addEventListener("click", function () { renderHome(); show("homeScreen"); });
    $("caseBack").addEventListener("click", function () { stopSpeak(); renderCases(); });
    $("rewardToCases").addEventListener("click", function () { renderCases(); });
    $("kitBack").addEventListener("click", function () { renderHome(); show("homeScreen"); });
    $("clueBack").addEventListener("click", function () { stopSpeak(); renderHome(); show("homeScreen"); });
    $("clueAgain").addEventListener("click", startClue);
    $("muteBtn").addEventListener("click", function () {
      muted = !muted; localStorage.setItem(K.muted, muted ? "1" : "0"); if (muted) stopSpeak(); renderHome();
    });
    document.addEventListener("keydown", function (e) {
      var onCase = $("caseScreen").classList.contains("active");
      var onClue = $("clueScreen").classList.contains("active");
      if (!onCase && !onClue) return;
      if (e.key >= "1" && e.key <= "9") {
        var sel = onCase ? "#caseBody .choice:not(.wrong)" : "#clueChoices .choice:not(.wrong)";
        var ch = document.querySelectorAll(sel); var i = parseInt(e.key, 10) - 1; if (ch[i]) ch[i].click();
      } else if (e.key === "Enter" && onCase) {
        var go = document.querySelector("#caseBody .big-btn.go"); if (go) go.click();
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () { wire(); renderHome(); show("homeScreen"); });
})();
