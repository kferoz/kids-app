/* ============================================================
   Homeschool Academy — App Engine
   Ziggy the robot 🤖 walks kids through numbered lessons.
   Screens: Home → Path → Lesson → Reward, plus a Trophy Room.
   Data-driven by TRACKS in data.js. Saves to localStorage (hs_).
   ============================================================ */
(function () {
  "use strict";

  /* ---------- tiny helpers ---------- */
  var $ = function (id) { return document.getElementById(id); };
  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  function trackById(id) {
    for (var i = 0; i < TRACKS.length; i++) if (TRACKS[i].id === id) return TRACKS[i];
    return null;
  }

  /* ---------- storage ---------- */
  function getNum(k) { var v = parseInt(localStorage.getItem(k), 10); return isNaN(v) ? 0 : v; }
  function setNum(k, n) { localStorage.setItem(k, String(n)); }
  function getArr(k) { try { return JSON.parse(localStorage.getItem(k)) || []; } catch (e) { return []; } }
  function setArr(k, a) { localStorage.setItem(k, JSON.stringify(a)); }
  function getObj(k) { try { return JSON.parse(localStorage.getItem(k)) || {}; } catch (e) { return {}; } }
  function setObj(k, o) { localStorage.setItem(k, JSON.stringify(o)); }

  var K = {
    points: "hs_points",     // ⭐ points (also read by Rewards Center)
    trophies: "hs_trophies", // grand trophies (array of ids)
    badges: "hs_badges",     // milestone badges (array of ids)
    stickers: "hs_stickers", // collected sticker emojis (array)
    done: "hs_done",         // { trackId: [completed lesson numbers] }
    tickets: "rw_tickets"    // SHARED with Arcade / Prize Wheel
  };

  function points() { return getNum(K.points); }
  function addPoints(n) { setNum(K.points, points() + n); }
  function doneMap() { return getObj(K.done); }
  function doneList(tid) { var m = doneMap(); return m[tid] || []; }
  function isDone(tid, n) { return doneList(tid).indexOf(n) !== -1; }
  function totalDone() {
    var m = doneMap(), t = 0;
    for (var k in m) if (m.hasOwnProperty(k)) t += m[k].length;
    return t;
  }
  function totalLessons() {
    var t = 0; for (var i = 0; i < TRACKS.length; i++) t += TRACKS[i].lessons.length; return t;
  }
  function unlocked(tid, n) { return n === 1 || isDone(tid, n - 1); }
  function hasTrophy(id) { return getArr(K.trophies).indexOf(id) !== -1; }

  function markDone(tid, n) {
    var m = doneMap();
    if (!m[tid]) m[tid] = [];
    if (m[tid].indexOf(n) === -1) m[tid].push(n);
    setObj(K.done, m);
  }
  function addSticker(emoji) {
    var s = getArr(K.stickers); s.push(emoji); setArr(K.stickers, s);
  }
  function addTicket() { setNum(K.tickets, getNum(K.tickets) + 1); }

  /* award a grand trophy once; returns true if newly earned */
  function grantTrophy(id) {
    var a = getArr(K.trophies);
    if (a.indexOf(id) !== -1) return false;
    a.push(id); setArr(K.trophies, a); return true;
  }
  function grantBadge(id) {
    var a = getArr(K.badges);
    if (a.indexOf(id) !== -1) return false;
    a.push(id); setArr(K.badges, a); return true;
  }

  /* ---------- speech (read-aloud) ---------- */
  var canSpeak = "speechSynthesis" in window;
  function speak(text) {
    if (!canSpeak || !text || muted) return;
    try {
      window.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(String(text));
      u.rate = 0.95; u.pitch = 1.1; u.lang = "en-US";
      window.speechSynthesis.speak(u);
    } catch (e) { /* ignore */ }
  }
  var muted = localStorage.getItem("hs_muted") === "1";
  function stripHtml(s) { var d = el("div", null, s); return d.textContent || d.innerText || ""; }

  /* ---------- confetti ---------- */
  function confetti() {
    var box = $("confetti"); if (!box) return;
    var emo = ["🎉", "⭐", "🌟", "🎈", "✨", "🏅", "🎊"];
    for (var i = 0; i < 26; i++) {
      var p = el("span", "confetti-bit", emo[Math.floor(Math.random() * emo.length)]);
      p.style.left = Math.random() * 100 + "%";
      p.style.animationDelay = (Math.random() * 0.5) + "s";
      p.style.fontSize = (16 + Math.random() * 22) + "px";
      box.appendChild(p);
      (function (node) { setTimeout(function () { node.remove(); }, 2200); })(p);
    }
  }

  /* ---------- screen switching ---------- */
  var screens = ["homeScreen", "pathScreen", "lessonScreen", "rewardScreen", "trophyScreen"];
  function show(id) {
    for (var i = 0; i < screens.length; i++) {
      var s = $(screens[i]); if (s) s.classList.toggle("active", screens[i] === id);
    }
    window.scrollTo(0, 0);
  }

  /* =========================================================
     HOME — track selection
     ========================================================= */
  function renderHome() {
    var grid = $("trackGrid"); grid.innerHTML = "";
    TRACKS.forEach(function (t) {
      var dn = doneList(t.id).length, total = t.lessons.length;
      var card = el("button", "track-card theme-" + t.theme);
      card.innerHTML =
        '<span class="track-grade">' + t.emoji + " " + t.grade + '</span>' +
        '<div class="track-emoji">' + (t.subject === "Math" ? "🔢" : "📖") + '</div>' +
        '<h3 class="track-name">' + t.subject + '</h3>' +
        '<p class="track-blurb">' + t.blurb + '</p>' +
        '<div class="track-progress"><div class="track-bar"><i style="width:' +
          (total ? Math.round(dn / total * 100) : 0) + '%"></i></div>' +
        '<span>' + dn + " / " + total + " lessons</span></div>" +
        '<span class="track-go">' + (dn === 0 ? "Start Lesson 1 →" : (dn === total ? "All done! Review ↺" : "Continue →")) + '</span>';
      card.addEventListener("click", function () { openPath(t.id); });
      grid.appendChild(card);
    });
    updateHud();
  }

  function updateHud() {
    var p = $("hudPoints"); if (p) p.textContent = "⭐ " + points();
    var d = $("hudDone"); if (d) d.textContent = "📚 " + totalDone() + "/" + totalLessons();
    var m = $("muteBtn"); if (m) m.textContent = muted ? "🔇" : "🔊";
  }

  /* =========================================================
     PATH — numbered lessons for a track
     ========================================================= */
  var curTrack = null;
  function openPath(tid) {
    curTrack = trackById(tid);
    $("pathTitle").innerHTML = curTrack.emoji + " " + curTrack.grade + " · " + curTrack.subject;
    $("pathScreen").className = "screen theme-" + curTrack.theme + " active";
    var list = $("pathList"); list.innerHTML = "";

    curTrack.lessons.forEach(function (ls) {
      var done = isDone(curTrack.id, ls.n);
      var open = unlocked(curTrack.id, ls.n);
      var node = el("button", "lesson-node" + (done ? " done" : "") + (open ? "" : " locked"));
      node.innerHTML =
        '<span class="lesson-num">' + (done ? "✅" : (open ? ls.n : "🔒")) + '</span>' +
        '<span class="lesson-info"><b>Lesson ' + ls.n + '</b><span>' + ls.emoji + " " + ls.title + '</span></span>' +
        '<span class="lesson-sticker">' + (done ? ls.sticker : "") + '</span>';
      if (open) {
        node.addEventListener("click", function () { startLesson(ls); });
      } else {
        node.addEventListener("click", function () { speak("Finish the lesson before this one first."); });
      }
      list.appendChild(node);
    });

    // track badge status
    var allDone = doneList(curTrack.id).length === curTrack.lessons.length;
    var bt = $("pathBadge");
    bt.innerHTML = curTrack.badge.icon + " " + curTrack.badge.name + (allDone ? " — earned!" : " — finish all lessons");
    bt.classList.toggle("earned", allDone);

    show("pathScreen");
  }

  /* =========================================================
     LESSON — step engine
     ========================================================= */
  var lesson = null, stepIdx = 0, answered = false, lessonStars = 0;

  function startLesson(ls) {
    lesson = ls; stepIdx = 0; lessonStars = 0;
    $("lessonScreen").className = "screen theme-" + curTrack.theme + " active";
    renderStep();
    show("lessonScreen");
  }

  function renderStep() {
    answered = false;
    var step = lesson.steps[stepIdx];
    $("lessonTitle").innerHTML = "Lesson " + lesson.n + ": " + lesson.title;

    // progress dots
    var dots = $("stepDots"); dots.innerHTML = "";
    for (var i = 0; i < lesson.steps.length; i++) {
      dots.appendChild(el("span", "dot" + (i < stepIdx ? " past" : i === stepIdx ? " now" : "")));
    }

    var body = $("lessonBody"); body.innerHTML = "";
    $("lessonFeedback").innerHTML = "";
    $("lessonFeedback").className = "lesson-feedback";

    if (step.k === "teach") return renderTeach(step, body);
    if (step.k === "count") return renderCount(step, body);
    if (step.k === "pick") return renderPick(step, body);
    if (step.k === "type") return renderType(step, body);
  }

  function speakStep(step, fallback) { speak(step.say || stripHtml(fallback)); }

  /* -- teach card -- */
  function renderTeach(step, body) {
    var card = el("div", "teach-card");
    card.innerHTML =
      '<div class="teach-emoji">' + step.emoji + '</div>' +
      '<h3>' + step.title + '</h3>' +
      '<p>' + step.text.replace(/\n/g, "<br>") + '</p>';
    body.appendChild(card);
    speakStep(step, step.title + ". " + step.text);
    var next = el("button", "big-btn go", "Got it! 👍");
    next.addEventListener("click", nextStep);
    body.appendChild(next);
  }

  /* -- counting -- */
  function renderCount(step, body) {
    var q = el("div", "q-text", step.say ? stripHtml(step.say) : "How many?");
    body.appendChild(q);
    var pool = el("div", "count-pool");
    for (var i = 0; i < step.n; i++) pool.appendChild(el("span", "count-emoji", step.emoji));
    body.appendChild(pool);
    speakStep(step, "How many?");

    // build numeric choices around n
    var opts = [step.n];
    while (opts.length < 3) {
      var d = step.n + (Math.floor(Math.random() * 5) - 2);
      if (d >= 1 && d <= 12 && opts.indexOf(d) === -1) opts.push(d);
    }
    shuffle(opts);
    buildChoices(body, opts.map(function (v) { return String(v); }), opts.indexOf(step.n), step);
  }

  /* -- multiple choice -- */
  function renderPick(step, body) {
    body.appendChild(el("div", "q-text", step.q));
    speakStep(step, step.q);
    buildChoices(body, step.choices, step.answer, step);
  }

  function buildChoices(body, choices, answer, step) {
    var wrap = el("div", "choices");
    choices.forEach(function (c, i) {
      var b = el("button", "choice", c);
      b.addEventListener("click", function () { pickAnswer(b, i === answer, step); });
      wrap.appendChild(b);
    });
    body.appendChild(wrap);
  }

  function pickAnswer(btn, correct, step) {
    if (answered) return;
    if (window.Tracker) Tracker.answer(!!correct, curTrack.grade + " " + curTrack.subject + ": " + lesson.title);
    if (correct) {
      answered = true;
      btn.classList.add("right");
      feedbackRight();
      addPoints(5); lessonStars += 1; updateHud();
      speak(pick(["Yes!", "Great job!", "Correct!", "Awesome!", "You got it!"]));
      setTimeout(nextStep, 950);
    } else {
      btn.classList.add("wrong");
      btn.disabled = true;
      var fb = $("lessonFeedback");
      fb.className = "lesson-feedback try";
      fb.innerHTML = "🤔 Good try — pick another!";
      speak("Good try. Try again.");
    }
  }

  /* -- typed answer -- */
  function renderType(step, body) {
    body.appendChild(el("div", "q-text", step.q));
    speakStep(step, step.q);
    var form = el("form", "type-form");
    var input = el("input", "type-input");
    input.type = "text"; input.autocomplete = "off"; input.setAttribute("aria-label", "Your answer");
    input.placeholder = step.hint || "Type here…";
    form.appendChild(input);
    var submit = el("button", "big-btn go", "Check ✓");
    submit.type = "submit";
    form.appendChild(submit);
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (answered) return;
      var val = (input.value || "").trim().toLowerCase();
      if (!val) { input.focus(); return; }
      var ok = step.answer === "*" ? val.length > 0 : val === String(step.answer).toLowerCase();
      if (ok) {
        answered = true;
        input.classList.add("right"); input.disabled = true; submit.disabled = true;
        feedbackRight();
        addPoints(5); lessonStars += 1; updateHud();
        speak(pick(["Correct!", "Nice work!", "That's right!", "Brilliant!"]));
        setTimeout(nextStep, 950);
      } else {
        input.classList.add("shake");
        setTimeout(function () { input.classList.remove("shake"); }, 500);
        var fb = $("lessonFeedback");
        fb.className = "lesson-feedback try";
        fb.innerHTML = "🤔 Not quite — try again!" + (step.answer !== "*" ? "" : "");
        speak("Not quite. Try again.");
        input.select();
      }
    });
    body.appendChild(form);
    setTimeout(function () { input.focus(); }, 60);
  }

  function feedbackRight() {
    var fb = $("lessonFeedback");
    fb.className = "lesson-feedback yay";
    fb.innerHTML = "⭐ +5  " + pick(["Yes!", "Great!", "Correct!", "Awesome!"]);
  }

  function nextStep() {
    stepIdx++;
    if (stepIdx >= lesson.steps.length) return finishLesson();
    renderStep();
  }

  /* =========================================================
     REWARD — lesson complete
     ========================================================= */
  function finishLesson() {
    if (window.Tracker) Tracker.complete("lesson", lessonStars, null, { item: curTrack.id + " #" + lesson.n + " " + lesson.title });
    var firstTime = !isDone(curTrack.id, lesson.n);
    markDone(curTrack.id, lesson.n);

    var earnedTrophies = [], earnedBadges = [];

    if (firstTime) {
      addSticker(lesson.sticker);
      addTicket(); // feed the shared Prize Wheel

      // trophies
      if (grantTrophy("first-lesson")) earnedTrophies.push(byId(HS_TROPHIES, "first-lesson"));
      if (totalDone() >= 10 && grantTrophy("ten-lessons")) earnedTrophies.push(byId(HS_TROPHIES, "ten-lessons"));
      if (points() >= 150 && grantTrophy("half-star")) earnedTrophies.push(byId(HS_TROPHIES, "half-star"));
      if (doneList(curTrack.id).length === curTrack.lessons.length && grantTrophy("graduate"))
        earnedTrophies.push(byId(HS_TROPHIES, "graduate"));
      if (allTracksDone() && grantTrophy("valedictorian")) earnedTrophies.push(byId(HS_TROPHIES, "valedictorian"));

      // milestone badges
      HS_BADGES.forEach(function (b) {
        if (totalDone() >= b.need && grantBadge(b.id)) earnedBadges.push(b);
      });
    }

    renderReward(firstTime, earnedTrophies, earnedBadges);
    show("rewardScreen");
    confetti();
    updateHud();
  }

  function renderReward(firstTime, trophies, badges) {
    var box = $("rewardBox");
    var perfect = lessonStars === countScored(lesson);
    var msg = perfect ? "Perfect! You got them all! 🌟" : "Lesson complete — well done! 🎉";
    var html =
      '<div class="reward-badge">' + lesson.sticker + '</div>' +
      '<h2>Lesson ' + lesson.n + ' Complete!</h2>' +
      '<p class="reward-sub">' + msg + '</p>' +
      '<div class="reward-stats">' +
        '<span>⭐ +' + (lessonStars * 5) + ' points</span>' +
        (firstTime ? '<span>🎟️ New sticker: ' + lesson.sticker + '</span>' : '<span>↺ Review — nice!</span>') +
      '</div>';

    if (trophies.length) {
      html += '<div class="reward-new"><h3>🏆 New Trophy!</h3>';
      trophies.forEach(function (t) { html += '<div class="new-item">' + t.icon + ' <b>' + t.name + '</b> — ' + t.desc + '</div>'; });
      html += '</div>';
    }
    if (badges.length) {
      html += '<div class="reward-new"><h3>🎖️ New Badge!</h3>';
      badges.forEach(function (b) { html += '<div class="new-item">' + b.icon + ' <b>' + b.name + '</b> — ' + b.desc + '</div>'; });
      html += '</div>';
    }
    box.innerHTML = html;
    speak("Lesson complete! " + (firstTime ? "You earned a " + lesson.sticker + " sticker." : "Great review."));

    // next-lesson button
    var nextBtn = $("nextLessonBtn");
    var idx = curTrack.lessons.indexOf(lesson);
    if (idx < curTrack.lessons.length - 1) {
      nextBtn.style.display = "";
      nextBtn.textContent = "Next Lesson →";
      nextBtn.onclick = function () { startLesson(curTrack.lessons[idx + 1]); };
    } else {
      nextBtn.style.display = "";
      nextBtn.textContent = "🎓 Track Finished!";
      nextBtn.onclick = function () { openPath(curTrack.id); };
    }
  }

  function countScored(ls) {
    var c = 0; ls.steps.forEach(function (s) { if (s.k !== "teach") c++; }); return c;
  }
  function allTracksDone() {
    for (var i = 0; i < TRACKS.length; i++)
      if (doneList(TRACKS[i].id).length !== TRACKS[i].lessons.length) return false;
    return true;
  }
  function byId(arr, id) { for (var i = 0; i < arr.length; i++) if (arr[i].id === id) return arr[i]; return null; }

  /* =========================================================
     TROPHY ROOM — gadget wall
     ========================================================= */
  function renderTrophyRoom() {
    // totals
    $("trTotals").innerHTML =
      '<div class="stat"><b>⭐ ' + points() + '</b><span>points</span></div>' +
      '<div class="stat"><b>📚 ' + totalDone() + '</b><span>lessons</span></div>' +
      '<div class="stat"><b>🎟️ ' + getArr(K.stickers).length + '</b><span>stickers</span></div>' +
      '<div class="stat"><b>🏆 ' + getArr(K.trophies).length + '</b><span>trophies</span></div>';

    // sticker book
    var sb = $("stickerBook"); sb.innerHTML = "";
    var stickers = getArr(K.stickers);
    if (!stickers.length) {
      sb.appendChild(el("p", "empty", "Finish lessons to collect stickers! 🎟️"));
    } else {
      stickers.forEach(function (s) { sb.appendChild(el("span", "sticker-slot", s)); });
    }

    // badges
    var bg = $("badgeWall"); bg.innerHTML = "";
    var got = getArr(K.badges);
    HS_BADGES.forEach(function (b) {
      var have = got.indexOf(b.id) !== -1;
      var d = el("div", "wall-item" + (have ? " have" : ""));
      d.innerHTML = '<span class="wi-icon">' + (have ? b.icon : "🔒") + '</span><b>' + b.name + '</b><span class="wi-desc">' + b.desc + '</span>';
      bg.appendChild(d);
    });

    // trophies
    var tw = $("trophyWall"); tw.innerHTML = "";
    var gt = getArr(K.trophies);
    HS_TROPHIES.forEach(function (t) {
      var have = gt.indexOf(t.id) !== -1;
      var d = el("div", "wall-item" + (have ? " have" : ""));
      d.innerHTML = '<span class="wi-icon">' + (have ? t.icon : "🔒") + '</span><b>' + t.name + '</b><span class="wi-desc">' + t.desc + '</span>';
      tw.appendChild(d);
    });

    show("trophyScreen");
  }

  /* ---------- utils ---------- */
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  /* ---------- wiring ---------- */
  function wire() {
    $("toPathBack").addEventListener("click", function () { renderHome(); show("homeScreen"); });
    $("toLessonBack").addEventListener("click", function () { window.speechSynthesis && window.speechSynthesis.cancel(); openPath(curTrack.id); });
    $("rewardToPath").addEventListener("click", function () { openPath(curTrack.id); });
    $("trophyBtn").addEventListener("click", renderTrophyRoom);
    $("trophyBack").addEventListener("click", function () { renderHome(); show("homeScreen"); });
    $("muteBtn").addEventListener("click", function () {
      muted = !muted; localStorage.setItem("hs_muted", muted ? "1" : "0");
      if (muted && canSpeak) window.speechSynthesis.cancel();
      updateHud();
    });
    // keyboard: number keys pick choices, Enter advances teach
    document.addEventListener("keydown", function (e) {
      if (!$("lessonScreen").classList.contains("active")) return;
      var choices = document.querySelectorAll("#lessonBody .choice:not(.wrong)");
      if (e.key >= "1" && e.key <= "9") {
        var i = parseInt(e.key, 10) - 1;
        if (choices[i]) choices[i].click();
      } else if (e.key === "Enter") {
        var go = document.querySelector("#lessonBody .big-btn.go");
        if (go && go.tagName === "BUTTON" && go.type !== "submit") go.click();
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    wire();
    renderHome();
    show("homeScreen");
  });
})();
