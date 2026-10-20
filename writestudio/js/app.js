/* ============================================================
   Sentence Studio — app engine
   Screens: home (levels) → lesson → 💡 Learn / 🎮 Practice / ✏️ Write
            → done · ✨ Free Write · 📓 My Writing Book · stickers · trophies
   Writing is graded by WriteCheck and shown by WritePad (shared with
   Read-Aloud Rocket). Built like the other kidsapp apps: no build step.
   ============================================================ */
(function () {
  "use strict";

  /* ---------------- storage ---------------- */
  var K = { pts: "ws_points", stk: "ws_stickers", tro: "ws_trophies", les: "ws_lessons", jour: "ws_journal",
            free: "ws_free", selfFix: "ws_selfFix", clean: "ws_clean", mute: "ws_mute", tickets: "rw_tickets" };
  function load(k, d) { try { var v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }
  function store(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }

  var S = {
    points: load(K.pts, 0), stickers: load(K.stk, []), trophies: load(K.tro, []), lessons: load(K.les, {}),
    journal: load(K.jour, []), free: load(K.free, 0), selfFix: load(K.selfFix, 0), clean: load(K.clean, 0), mute: load(K.mute, false)
  };
  function lrec(id) {
    if (!S.lessons[id]) S.lessons[id] = { learn: false, practice: false, write: false, done: false, pstars: 0, wstars: 0, wrote: 0 };
    return S.lessons[id];
  }
  function save() { store(K.les, S.lessons); }
  function lessonById(id) { for (var i = 0; i < LESSONS.length; i++) if (LESSONS[i].id === id) return LESSONS[i]; return LESSONS[0]; }
  function levelById(id) { for (var i = 0; i < LEVELS.length; i++) if (LEVELS[i].id === id) return LEVELS[i]; return LEVELS[0]; }
  function levelLessons(lv) { return LESSONS.filter(function (l) { return l.level === lv.id; }); }
  function levelDone(lv) { return levelLessons(lv).every(function (l) { return lrec(l.id).done; }); }
  function levelOpen(lv) { return lv.n === 1 || levelDone(LEVELS[lv.n - 2]); }

  /* ---------------- dom helpers ---------------- */
  var $ = function (id) { return document.getElementById(id); };
  var view = $("view");
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function starsHtml(n, max) { var s = ""; for (var i = 0; i < (max || 3); i++) s += '<span class="st' + (i < n ? " on" : "") + '">★</span>'; return s; }
  function themeVars(lv) { return "--bk:" + lv.color + ";--bk2:" + lv.accent; }

  /* ---------------- sound ---------------- */
  var voice = null, speakToken = 0;
  function chooseVoice() {
    if (!window.speechSynthesis) return;
    var vs = speechSynthesis.getVoices().filter(function (v) { return /^en[-_]/i.test(v.lang); });
    var prefs = [/Aria/i, /Jenny/i, /Samantha/i, /Google US English/i, /Zira/i, /en-US/i];
    for (var p = 0; p < prefs.length && !voice; p++)
      for (var i = 0; i < vs.length; i++) if (prefs[p].test(vs[i].name + " " + vs[i].lang)) { voice = vs[i]; break; }
    if (!voice && vs.length) voice = vs[0];
  }
  if (window.speechSynthesis) { chooseVoice(); speechSynthesis.onvoiceschanged = chooseVoice; }
  function speak(text, opt) {
    opt = opt || {};
    var my = ++speakToken;
    return new Promise(function (resolve) {
      var finished = false;
      function done() { if (!finished) { finished = true; resolve(); } }
      if (S.mute || !window.speechSynthesis) { setTimeout(done, Math.min(2500, 300 + text.length * 40)); return; }
      var u = new SpeechSynthesisUtterance(text);
      if (voice) u.voice = voice;
      u.lang = "en-US"; u.rate = opt.rate || 0.95; u.pitch = opt.pitch || 1.05;
      u.onend = done; u.onerror = done;
      speechSynthesis.cancel();
      speechSynthesis.speak(u);
      setTimeout(done, 3000 + text.length * 110);
    }).then(function () { return my === speakToken; });
  }
  function hush() { speakToken++; if (window.speechSynthesis) speechSynthesis.cancel(); }
  var actx = null;
  function tone(freqs, dur, type, gap) {
    if (S.mute) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      freqs.forEach(function (f, i) {
        var o = actx.createOscillator(), g = actx.createGain(), t = actx.currentTime + i * (gap || 0.1);
        o.type = type || "sine"; o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.16, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        o.connect(g); g.connect(actx.destination); o.start(t); o.stop(t + dur + 0.05);
      });
    } catch (e) {}
  }
  var sfx = {
    ding: function () { tone([880, 1320], 0.22, "triangle", 0.09); },
    pop: function () { tone([520], 0.12, "sine"); },
    boop: function () { tone([300, 240], 0.18, "sine", 0.12); },
    fanfare: function () { tone([523, 659, 784, 1047], 0.3, "triangle", 0.13); },
    scribble: function () { tone([700, 900, 760, 1000], 0.06, "square", 0.05); }
  };

  /* ---------------- Penny the Pencil ---------------- */
  function pennyRow(msg, mood) {
    return '<div class="echo-row"><div class="echo-bird" id="pennyBot">' + Art.penny(mood) + '</div><div class="echo-bubble" id="pennySay">' + esc(msg || "") + "</div></div>";
  }
  function penny(msg, mood, noVoice) {
    var b = $("pennySay"), bot = $("pennyBot");
    if (b) { b.textContent = msg; b.classList.remove("pop"); void b.offsetWidth; b.classList.add("pop"); }
    if (bot) bot.innerHTML = Art.penny(mood || "happy");
    return noVoice ? Promise.resolve(true) : speak(msg);
  }

  /* ---------------- rewards ---------------- */
  function addPoints(n) {
    if (!n) return;
    S.points += n; store(K.pts, S.points); hud();
    var f = document.createElement("div");
    f.className = "float-pts"; f.textContent = "+" + n + " ⭐";
    document.body.appendChild(f);
    setTimeout(function () { f.remove(); }, 1300);
  }
  function giveTicket() { var t = parseInt(localStorage.getItem(K.tickets) || "0", 10) || 0; localStorage.setItem(K.tickets, String(t + 1)); }
  function giveSticker(id) { if (S.stickers.indexOf(id) >= 0) return false; S.stickers.push(id); store(K.stk, S.stickers); return true; }
  function trophy(id) {
    if (S.trophies.indexOf(id) >= 0) return;
    var t = WS_TROPHIES.filter(function (x) { return x.id === id; })[0]; if (!t) return;
    S.trophies.push(id); store(K.tro, S.trophies);
    toast(t.icon + " Trophy: " + t.name + "!"); sfx.fanfare();
  }
  function checkTrophies() {
    var done = LESSONS.filter(function (l) { return lrec(l.id).done; }).length;
    if (S.journal.length) trophy("first-write");
    if (done >= 1) trophy("first-lesson");
    if (done >= LESSONS.length) trophy("all-levels");
    if (S.selfFix >= 5) trophy("self-fix");
    if (S.clean >= 5) trophy("perfect-5");
    if (S.free >= 3) trophy("free-3");
  }
  var toastTimer = null;
  function toast(msg) {
    var t = $("toast"); t.textContent = msg; t.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.classList.remove("show"); }, 2800);
  }
  function confetti(n) {
    var box = $("confetti"), colors = ["#ffd43b", "#ff8fab", "#69db7c", "#74c0fc", "#ffa94d", "#b197fc"];
    for (var i = 0; i < (n || 40); i++) {
      var c = document.createElement("i");
      c.style.left = Math.random() * 100 + "vw"; c.style.background = pick(colors);
      c.style.animationDelay = Math.random() * 0.4 + "s"; c.style.transform = "rotate(" + Math.random() * 360 + "deg)";
      box.appendChild(c);
      (function (el) { setTimeout(function () { el.remove(); }, 2600); })(c);
    }
  }
  function hud() {
    $("ptsPill").textContent = "⭐ " + S.points;
    $("stkPill").textContent = "🎟️ " + S.stickers.length;
    $("muteBtn").textContent = S.mute ? "🔇" : "🔊";
  }

  // a saved piece of writing goes into the Writing Book
  function journal(title, text, stars, from) {
    S.journal.push({ ts: Date.now(), title: title, text: text, stars: stars, from: from });
    if (S.journal.length > 300) S.journal = S.journal.slice(-300);
    store(K.jour, S.journal);
    if (stars >= 3) { S.clean++; store(K.clean, S.clean); }
  }
  function micListen() {
    if (!window.Listener || !Listener.supported()) return null;
    return function (o) { Listener.start({ target: o.target, vocab: o.vocab, single: o.single, onDone: onNav(o.onDone), onError: onNav(o.onError) }); };
  }
  var nav = 0;
  function onNav(fn) { var my = nav; return function (x) { if (my === nav && fn) return fn(x); }; }
  function pad(host, prompt, onDone, saveLabel) {
    return WritePad.mount(host, {
      prompt: prompt, buddy: "Penny", speak: speak, sfx: sfx, listen: micListen(), saveLabel: saveLabel,
      say: function (m, mood) { return penny(m, mood === "wow" ? "wow" : mood); },
      onDone: function (res) {
        if (res.fixedByMe && res.tries > 1) { S.selfFix++; store(K.selfFix, S.selfFix); }
        onDone(res);
      }
    });
  }

  /* ============================================================
     SCREENS
     ============================================================ */
  var current = { screen: "home" };
  function go(screen, arg) {
    hush(); if (window.Listener) Listener.stop(); nav++;
    current = { screen: screen, arg: arg };
    $("backBtn").hidden = screen === "home";
    document.body.dataset.screen = screen;
    window.scrollTo(0, 0);
    ({ home: renderHome, lesson: renderLesson, learn: renderLearn, practice: renderPractice, write: renderWrite,
       free: renderFree, book: renderBook, stickers: renderStickers, trophies: renderTrophies })[screen](arg);
  }
  function back() {
    var c = current;
    if ((c.screen === "learn" || c.screen === "practice" || c.screen === "write" || c.screen === "done") && c.arg && c.arg.id) go("lesson", c.arg.id);
    else go("home");
  }

  /* ---------------- home ---------------- */
  function renderHome() {
    $("topTitle").textContent = "Sentence Studio";
    var html = LEVELS.map(function (lv) {
      var open = levelOpen(lv), ls = levelLessons(lv), done = ls.filter(function (l) { return lrec(l.id).done; }).length;
      return '<section class="level' + (open ? "" : " locked") + '" style="' + themeVars(lv) + '">' +
        '<div class="level-head"><span class="lv-emo">' + (levelDone(lv) ? "⭐" : lv.emoji) + '</span><div><small>Level ' + lv.n + "</small><b>" + esc(lv.title) + "</b><em>" + esc(lv.sub) + "</em></div>" +
        '<span class="lv-status">' + (open ? done + " / " + ls.length : "🔒 Finish Level " + (lv.n - 1)) + "</span></div>" +
        '<div class="lesson-grid">' + ls.map(function (l) {
          var r = lrec(l.id);
          return '<button class="lesson-card' + (r.done ? " done" : "") + '" data-lesson="' + l.id + '"' + (open ? "" : " disabled") + ">" +
            '<span class="lc-n">' + (r.done ? l.sticker.emoji : l.emoji) + '</span><span class="lc-txt"><b>' + esc(l.title) + "</b><small>" + esc(l.skill) + "</small>" +
            '<span class="steps-mini"><i class="' + (r.learn ? "ok" : "") + '">💡</i><i class="' + (r.practice ? "ok" : "") + '">🎮</i><i class="' + (r.write ? "ok" : "") + '">✏️</i>' +
            (r.done ? '<span class="stars">' + starsHtml(r.wstars) + "</span>" : "") + "</span></span>" +
            '<span class="step-go">' + (r.done ? "✅" : open ? "▶" : "🔒") + "</span></button>";
        }).join("") + "</div></section>";
    }).join("");
    view.innerHTML = pennyRow("Hi! I'm Penny the Pencil! Let's turn YOUR ideas into sentences, then paragraphs, then whole stories!") +
      '<div class="home-actions top"><button class="big-btn go" data-go="free">✨ Free Write</button><button class="big-btn alt" data-go="book">📓 My Writing Book <span class="badge">' + S.journal.length + "</span></button></div>" +
      html +
      '<div class="home-actions"><button class="big-btn alt" data-go="stickers">🎟️ My Stickers</button><button class="big-btn alt" data-go="trophies">🏆 My Trophies</button></div>';
    view.querySelectorAll("[data-lesson]").forEach(function (el) { el.onclick = function () { sfx.pop(); go("lesson", el.dataset.lesson); }; });
    view.querySelectorAll("[data-go]").forEach(function (el) { el.onclick = function () { sfx.pop(); go(el.dataset.go); }; });
    penny($("pennySay").textContent, "happy");
  }

  /* ---------------- lesson menu ---------------- */
  function renderLesson(id) {
    var l = lessonById(id), r = lrec(id), lv = levelById(l.level);
    $("topTitle").textContent = l.title;
    view.innerHTML = '<div class="phase-head" style="' + themeVars(lv) + '"><span class="ph-badge">' + (r.done ? l.sticker.emoji : l.emoji) + "</span><div><small>Level " + lv.n + " · " + esc(l.skill) + "</small><h2>" + esc(l.title) + "</h2></div></div>" +
      pennyRow(r.done ? "You finished this lesson! Write more any time. Every sentence makes you stronger!" : !r.learn ? "First, let's learn the secret!" : !r.practice ? "Now let's practise with a game!" : "Your turn to write!") +
      '<div class="steps">' +
        stepCard(1, "💡", "Learn It", r.learn ? "Done! ✔" : "The writing secret, with examples", r.learn, "learn") +
        stepCard(2, "🎮", "Practice", r.practice ? "Done! ✔ " + starsHtml(r.pstars) : "6 quick rounds", r.practice, "practice") +
        stepCard(3, "✏️", "Write It", r.write ? "Done! ✔ " + starsHtml(r.wstars) : l.write[0].plan ? "Plan and write a paragraph" : "Write " + l.write.length + " of your own sentences", r.write, "write") +
      "</div>";
    view.querySelectorAll("[data-step]").forEach(function (el) { el.onclick = function () { sfx.pop(); go(el.dataset.step, { id: id }); }; });
    penny($("pennySay").textContent, "happy");
  }
  function stepCard(n, icon, name, sub, ok, step) {
    return '<button class="step-card' + (ok ? " ok" : "") + '" data-step="' + step + '"><span class="step-n">' + n + '</span><span class="step-ic">' + icon + "</span>" +
      '<span class="step-txt"><b>' + name + "</b><small>" + sub + '</small></span><span class="step-go">' + (ok ? "✅" : "▶") + "</span></button>";
  }

  /* ---------------- 💡 Learn It ---------------- */
  function renderLearn(arg) {
    var l = lessonById(arg.id), lv = levelById(l.level), L = l.learn;
    $("topTitle").textContent = "Learn It";
    view.innerHTML = pennyRow("", "think") +
      '<div class="learn-card" style="' + themeVars(lv) + '"><h2>' + l.emoji + " " + esc(l.title) + "</h2>" +
        '<ol class="learn-points">' + L.points.map(function (p, i) { return '<li><button class="lp" data-i="' + i + '">' + esc(p) + "</button></li>"; }).join("") + "</ol>" +
        '<div class="examples">' +
          '<button class="ex good" id="exGood"><span>👍 Like this</span><b>' + esc(L.good) + "</b></button>" +
          (L.bad ? '<button class="ex bad" id="exBad"><span>🤔 Not quite</span><b>' + esc(L.bad) + "</b></button>" : "") +
        "</div>" +
        '<button class="joke" id="joke">😂 <span>' + esc(L.joke) + "</span></button>" +
      "</div>" +
      '<div class="home-actions"><button class="big-btn go" id="learnDone">🎮 I got it! Let\'s practise</button></div>';
    view.querySelectorAll(".lp").forEach(function (el) { el.onclick = function () { speak(el.textContent); }; });
    $("exGood").onclick = function () { speak("Like this: " + L.good.replace("|", "")); };
    if ($("exBad")) $("exBad").onclick = function () { speak("Not quite: " + L.bad); };
    $("joke").onclick = function () { penny(L.joke, "wow"); };
    $("learnDone").onclick = function () {
      var r = lrec(l.id); if (!r.learn) { r.learn = true; save(); addPoints(3); }
      go("practice", { id: l.id });
    };
    // read the points one after another
    var chain = penny("Here's the secret. " + L.points[0], "think");
    L.points.slice(1).forEach(function (p) { chain = chain.then(onNav(function (ok) { return ok ? speak(p) : false; })); });
  }

  /* ---------------- 🎮 Practice ---------------- */
  function renderPractice(arg) {
    var l = lessonById(arg.id), lv = levelById(l.level), rounds = l.practice, ri = 0, score = 0;
    $("topTitle").textContent = "Practice";
    function frame(inner, msg, mood) {
      view.innerHTML = pennyRow(msg, mood) + '<div class="game-box" style="' + themeVars(lv) + '">' +
        '<div class="round-dots">' + rounds.map(function (_, i) { return '<i class="' + (i < ri ? "done" : i === ri ? "now" : "") + '"></i>'; }).join("") + "</div>" + inner +
        '<div class="why" id="why" hidden></div><div class="quiz-next" id="nextRow" hidden><button class="big-btn go" id="nextBtn">Next ▶</button></div></div>';
    }
    function result(ok, firstTry, why, say) {
      if (ok) { sfx.ding(); confetti(14); if (firstTry) { score++; addPoints(3); } else addPoints(1); }
      if (window.Tracker) Tracker.answer(ok && firstTry, "Writing: " + l.skill);
      var w = $("why"); w.hidden = false; w.innerHTML = (ok ? "✅ " : "💡 ") + esc(why || "");
      $("nextRow").hidden = false;
      $("nextBtn").onclick = function () { ri++; next(); };
      penny((ok ? pick(PRAISE.right) + " " : "") + (say || why || ""), ok ? "wow" : "happy");
    }
    function next() {
      if (ri >= rounds.length) return finish();
      var R = rounds[ri];
      ({ yesno: yesno, punct: punct, pick: pickQ, build: build, join: join, order: order })[R.t](R);
    }
    function yesno(R) {
      var tries = 0;
      frame('<p class="game-q">Is this a complete sentence?</p><div class="sent-show">' + esc(R.s) + '</div><div class="choice-row">' +
        '<button class="choice yn" data-v="1">✅ Yes, it is!</button><button class="choice yn" data-v="0">🧩 Not yet</button></div>', "Is this a complete sentence? " + R.s, "think");
      speak("Is this a complete sentence? " + R.s);
      view.querySelectorAll(".yn").forEach(function (b) {
        b.onclick = function () {
          var ok = (b.dataset.v === "1") === R.yes;
          if (ok) { b.classList.add("right"); view.querySelectorAll(".yn").forEach(function (x) { x.disabled = true; }); result(true, !tries, R.why); }
          else { tries++; b.classList.add("nope"); b.disabled = true; sfx.boop(); view.querySelectorAll(".yn").forEach(function (x) { x.disabled = true; }); view.querySelector('.yn[data-v="' + (R.yes ? 1 : 0) + '"]').classList.add("right"); result(false, false, R.why); }
        };
      });
    }
    function punct(R) {
      var tries = 0;
      frame('<p class="game-q">Which stop sign goes at the end?</p><div class="sent-show">' + esc(R.s) + '<span class="blank" id="blank">?</span></div><div class="choice-row">' +
        [".", "?", "!"].map(function (m) { return '<button class="choice mark" data-m="' + m + '">' + m + "<small>" + (m === "." ? "telling" : m === "?" ? "asking" : "WOW") + "</small></button>"; }).join("") + "</div>", "Which mark goes at the end? " + R.s, "think");
      speak("Which mark goes at the end? " + R.s);
      view.querySelectorAll(".mark").forEach(function (b) {
        b.onclick = function () {
          if (b.dataset.m === R.a) {
            b.classList.add("right"); $("blank").textContent = R.a; $("blank").classList.add("filled");
            view.querySelectorAll(".mark").forEach(function (x) { x.disabled = true; });
            result(true, !tries, R.why);
          } else { tries++; b.classList.add("nope"); b.disabled = true; sfx.boop(); penny(pick(PRAISE.oops) + " Read it out loud. Is it telling, asking, or WOW?", "happy"); }
        };
      });
    }
    function pickQ(R) {
      var tries = 0, ord = shuffle(R.choices.map(function (_, k) { return k; }));
      frame('<p class="game-q">' + esc(R.q) + ' <button class="mini-btn" id="qSay">🔊</button></p><div class="choice-col">' +
        ord.map(function (k) { return '<button class="choice qa" data-k="' + k + '">' + esc(R.choices[k]) + "</button>"; }).join("") + "</div>", R.q, "think");
      speak(R.q);
      $("qSay").onclick = function () { speak(R.q + ". " + ord.map(function (k) { return R.choices[k]; }).join(". ")); };
      view.querySelectorAll(".qa").forEach(function (b) {
        b.onclick = function () {
          if (+b.dataset.k === R.answer) { b.classList.add("right"); view.querySelectorAll(".qa").forEach(function (x) { x.disabled = true; }); result(true, !tries, R.why); }
          else {
            tries++; b.classList.add("nope"); b.disabled = true; sfx.boop();
            if (tries >= 2) { view.querySelectorAll(".qa").forEach(function (x) { x.disabled = true; if (+x.dataset.k === R.answer) x.classList.add("right"); }); result(false, false, R.why); }
            else penny(pick(PRAISE.oops), "happy");
          }
        };
      });
    }
    // tap word tiles in order to build the sentence
    function build(R) {
      var tries = 0, placed = [], tiles = shuffle(R.words.map(function (w, i) { return { w: w, i: i }; }));
      var target = R.words.join(" ") + R.end;
      frame('<p class="game-q">Build the sentence! Tap the words in order.</p><div class="build-line" id="line"><span class="ph">Tap words below…</span></div>' +
        '<div class="tile-bank" id="bank">' + tiles.map(function (t, k) { return '<button class="wtile" data-k="' + k + '">' + esc(t.w) + "</button>"; }).join("") + "</div>" +
        '<div class="build-tools"><button class="mini-btn" id="undo">↩ Undo</button><button class="mini-btn" id="hint">💡 Hint</button></div>', "Build the sentence! Start with the capital letter.", "think");
      speak("Build the sentence! Hint: the word with a capital letter goes first.");
      function draw() {
        $("line").innerHTML = placed.length ? placed.map(function (k) { return '<span class="ltile">' + esc(tiles[k].w) + "</span>"; }).join(" ") + (placed.length === tiles.length ? '<span class="ltile end">' + esc(R.end) + "</span>" : "") : '<span class="ph">Tap words below…</span>';
        view.querySelectorAll(".wtile").forEach(function (b) { b.disabled = placed.indexOf(+b.dataset.k) >= 0; });
      }
      view.querySelectorAll(".wtile").forEach(function (b) {
        b.onclick = function () {
          sfx.pop(); placed.push(+b.dataset.k); draw();
          if (placed.length < tiles.length) return;
          var said = placed.map(function (k) { return tiles[k].w; }).join(" ") + R.end;
          if (said === target) {
            $("line").classList.add("right"); view.querySelectorAll(".build-tools button").forEach(function (x) { x.disabled = true; });
            result(true, !tries, "“" + target + "”", "Listen: " + target);
          } else {
            tries++; sfx.boop(); $("line").classList.add("shake");
            setTimeout(function () { $("line").classList.remove("shake"); }, 500);
            penny("Hmm, read it out loud. Does it sound right? Tap Undo and try again!", "happy");
            speak(said);
          }
        };
      });
      $("undo").onclick = function () { placed.pop(); draw(); };
      $("hint").onclick = function () {
        tries++;
        placed = []; var first = tiles.map(function (t, k) { return k; }).filter(function (k) { return tiles[k].i === 0; })[0];
        placed.push(first); draw();
        penny("The sentence starts with " + tiles[first].w + ". What comes next?", "happy");
      };
    }
    function join(R) {
      var tries = 0;
      function combine(g) {
        var a = R.a.replace(/[.!?]$/, ""), b = R.b.replace(/^(\w)/, function (c) { return /^I\b/.test(R.b) ? c : c.toLowerCase(); });
        return a + (g === "because" ? " " : ", ") + g + " " + b;
      }
      frame('<p class="game-q">Glue them together! Which glue word fits best?</p><div class="join-box"><span class="sent-show sm">' + esc(R.a) + '</span><span class="glue" id="glue">🧴 ___</span><span class="sent-show sm">' + esc(R.b) + "</span></div>" +
        '<div class="choice-row">' + shuffle(R.choices).map(function (g) { return '<button class="choice glueb" data-g="' + g + '">' + g + "</button>"; }).join("") + "</div>", "Which glue word joins these sentences? " + R.a + " " + R.b, "think");
      speak("Which glue word joins these? " + R.a + " " + R.b);
      view.querySelectorAll(".glueb").forEach(function (b) {
        b.onclick = function () {
          var g = b.dataset.g;
          if (g === R.glue) {
            b.classList.add("right"); view.querySelectorAll(".glueb").forEach(function (x) { x.disabled = true; });
            var s = combine(g);
            view.querySelector(".join-box").innerHTML = '<span class="sent-show joined">' + esc(s) + "</span>";
            result(true, !tries, R.why, s + ". " + R.why);
          } else {
            tries++; b.classList.add("nope"); b.disabled = true; sfx.boop();
            penny("Listen: " + combine(g) + ". Hmm, does that make sense? Try another!", "happy");
          }
        };
      });
    }
    function order(R) {
      var tries = 0, placed = [], idx = shuffle(R.items.map(function (_, i) { return i; }));
      frame('<p class="game-q">' + esc(R.q) + '</p><ol class="order-line" id="line"></ol><div class="order-bank">' +
        idx.map(function (i) { return '<button class="otile" data-i="' + i + '">' + esc(R.items[i]) + "</button>"; }).join("") + "</div>" +
        '<div class="build-tools"><button class="mini-btn" id="undo">↩ Undo</button></div>', R.q, "think");
      speak(R.q);
      function draw() {
        $("line").innerHTML = placed.map(function (i) { return "<li>" + esc(R.items[i]) + "</li>"; }).join("");
        view.querySelectorAll(".otile").forEach(function (b) { b.hidden = placed.indexOf(+b.dataset.i) >= 0; });
      }
      view.querySelectorAll(".otile").forEach(function (b) {
        b.onclick = function () {
          sfx.pop(); speak(b.textContent, { rate: 1 });
          placed.push(+b.dataset.i); draw();
          if (placed.length < R.items.length) return;
          var ok = placed.every(function (v, k) { return v === k; });
          if (ok) { $("line").classList.add("right"); $("undo").disabled = true; result(true, !tries, R.why); }
          else {
            tries++; sfx.boop(); $("line").classList.add("shake");
            setTimeout(function () { $("line").classList.remove("shake"); placed = placed.filter(function (v, k) { return v === k && placed.slice(0, k).every(function (x, j) { return x === j; }); }); draw(); }, 700);
            penny("Close! I kept the ones in the right spot. What comes next?", "happy");
          }
        };
      });
      $("undo").onclick = function () { placed.pop(); draw(); };
    }
    function finish() {
      var r = lrec(l.id), first = !r.practice, stars = score >= rounds.length ? 3 : score >= rounds.length - 2 ? 2 : 1;
      r.practice = true; r.pstars = Math.max(r.pstars || 0, stars); save();
      if (first) addPoints(5);
      if (window.Tracker) Tracker.complete("writingpractice", score, rounds.length, { item: l.title });
      sfx.fanfare(); confetti(40);
      current = { screen: "done", arg: { id: l.id } };
      view.innerHTML = pennyRow(score + " of " + rounds.length + " on the first try! Now the best part: writing YOUR own sentences!", "wow") +
        '<div class="celebrate"><div class="big-emoji">🎮✨</div><h2>' + score + " of " + rounds.length + "</h2><p class=\"done-stars\">" + starsHtml(stars) + "</p>" +
        '<button class="big-btn go" id="toWrite">✏️ Write It</button><button class="big-btn alt" id="toLesson">⬅ Back</button></div>';
      penny($("pennySay").textContent, "wow");
      $("toWrite").onclick = function () { go("write", { id: l.id }); };
      $("toLesson").onclick = function () { go("lesson", l.id); };
    }
    next();
  }

  /* ---------------- ✏️ Write It ---------------- */
  function renderWrite(arg) {
    var l = lessonById(arg.id), lv = levelById(l.level), wi = arg.w || 0, P = l.write[wi], got = arg.got || [];
    $("topTitle").textContent = "Write It" + (l.write.length > 1 ? " · " + (wi + 1) + "/" + l.write.length : "");
    function after(stars) {
      got = got.concat([stars]);
      if (wi + 1 < l.write.length) go("write", { id: l.id, w: wi + 1, got: got });
      else finishLesson(l, got);
    }
    if (P.plan) return renderPlan(l, lv, P, function (text, stars) { journal(l.title + (P.sparkText ? ": " + P.sparkText : ""), text, stars, l.id); after(stars); });
    view.innerHTML = pennyRow("", "happy") +
      '<div class="round-dots">' + l.write.map(function (_, k) { return '<i class="' + (k < wi ? "done" : k === wi ? "now" : "") + '"></i>'; }).join("") + "</div>" +
      '<div class="write-box" style="' + themeVars(lv) + '" id="padHost"></div>';
    pad($("padHost"), P, function (res) {
      journal(P.p, res.text, res.stars, l.id);
      addPoints(res.stars * 3);
      if (window.Tracker) Tracker.answer(res.stars >= 2, "Writing: " + l.skill, { text: res.text.slice(0, 200), stars: res.stars, tries: res.tries });
      checkTrophies();
      after(res.stars);
    }, wi + 1 < l.write.length ? "Save it & next ▶" : "Save it ▶");
    penny(P.p + (P.show ? " " + P.show : ""), "happy");
  }

  /* hamburger / how-to / story planner: one part at a time, then the whole paragraph */
  function renderPlan(l, lv, P, onDone) {
    var parts = [], k = 0, spark = null;
    function stack() {
      return '<div class="burger">' + P.parts.map(function (pt, i) {
        return '<div class="layer' + (i < parts.length ? " filled" : i === k ? " now" : "") + '"><span class="ly-label">' + esc(pt.label) + "</span>" +
          (i < parts.length ? '<span class="ly-text">' + esc(parts[i]) + "</span>" : '<span class="ly-hint">' + esc(pt.hint) + "</span>") + "</div>";
      }).join("") + "</div>";
    }
    function sparkScreen() {
      spark = spark || pick(SPARKS);
      view.innerHTML = pennyRow("", "wow") +
        '<div class="write-box" style="' + themeVars(lv) + '"><div class="spark-card"><small>Your Story Spark</small><b id="sparkTxt">' + esc(spark) + "</b></div>" +
        '<div class="home-actions"><button class="big-btn alt" id="reSpark">🎲 Spin again</button><button class="big-btn go" id="useSpark">✏️ Use this idea!</button><button class="mini-btn" id="ownIdea">💭 I have my own idea</button></div></div>';
      penny("Your story spark is: " + spark + ". Spin again, or use it!", "wow");
      $("reSpark").onclick = function () { sfx.scribble(); spark = pick(SPARKS.filter(function (s) { return s !== spark; })); $("sparkTxt").textContent = spark; speak(spark); };
      $("useSpark").onclick = function () { P.sparkText = spark; part(); };
      $("ownIdea").onclick = function () { P.sparkText = ""; part(); };
    }
    function part() {
      if (k >= P.parts.length) return whole();
      var pt = P.parts[k];
      view.innerHTML = pennyRow("", "happy") + '<div class="write-box" style="' + themeVars(lv) + '">' +
        '<h3 class="plan-title">' + P.emoji + " " + esc(P.p) + (P.sparkText ? '<small>Spark: ' + esc(P.sparkText) + "</small>" : "") + "</h3>" +
        stack() + '<div id="padHost"></div></div>';
      pad($("padHost"), { p: pt.label.replace(/^\S+\s/, "") + ": " + pt.hint, emoji: pt.label.split(" ")[0], starter: pt.starter, model: pt.model, need: pt.need, ideas: pt.ideas }, function (res) {
        parts.push(res.text); k++; addPoints(res.stars);
        sfx.scribble(); part();
      }, k + 1 < P.parts.length ? "Add it ▶" : "Add the last part ▶");
      penny(pt.label.replace(/^\S+\s/, "") + ". " + pt.hint, "happy");
    }
    function whole() {
      var text = parts.join(" ");
      view.innerHTML = pennyRow("", "wow") + '<div class="write-box" style="' + themeVars(lv) + '">' +
        '<h3 class="plan-title">🎉 Look! You wrote a whole ' + (P.spark ? "story" : "paragraph") + "!</h3>" +
        stack() + '<div id="padHost"></div></div>';
      pad($("padHost"), { p: "Read it all together. Fix anything that sounds funny, then check it!", emoji: "📖", starter: text, need: P.need }, function (res) {
        addPoints(res.stars * 5);
        trophy(P.spark ? "story" : "paragraph");
        if (window.Tracker) Tracker.answer(res.stars >= 2, "Writing: " + l.skill, { text: res.text.slice(0, 400), stars: res.stars, paragraph: true });
        onDone(res.text, res.stars);
      }, "Save to my Writing Book ▶");
      var ta = view.querySelector(".wp-text"); if (ta) { ta.value = text; ta.rows = 7; }
      penny("Wow! You wrote a whole " + (P.spark ? "story" : "paragraph") + "! Tap Read my writing to hear it, then check it.", "wow");
    }
    if (P.spark) sparkScreen(); else part();
  }

  function finishLesson(l, got) {
    var r = lrec(l.id), wasDone = r.done, avg = Math.round(got.reduce(function (a, b) { return a + b; }, 0) / got.length);
    r.write = true; r.wstars = Math.max(r.wstars || 0, avg); r.wrote = (r.wrote || 0) + got.length; save();
    current = { screen: "done", arg: { id: l.id } };
    $("topTitle").textContent = l.title;
    if (!r.learn || !r.practice) {
      var need = !r.learn ? "learn" : "practice";
      view.innerHTML = pennyRow("Great writing! Finish the " + (need === "learn" ? "Learn It" : "Practice") + " step to win the sticker!", "happy") +
        '<div class="celebrate"><button class="big-btn go" id="dGo">' + (need === "learn" ? "💡 Learn It" : "🎮 Practice") + "</button></div>";
      penny($("pennySay").textContent, "happy");
      $("dGo").onclick = function () { go(need, { id: l.id }); };
      return;
    }
    r.done = true; save();
    var newSticker = giveSticker("l:" + l.id);
    if (!wasDone) { giveTicket(); addPoints(10); }
    if (window.Tracker) Tracker.complete("writinglesson", avg, 3, { item: l.title, firstTime: !wasDone });
    checkTrophies(); hud(); sfx.fanfare(); confetti(90);
    var nextL = LESSONS.filter(function (x) { return !lrec(x.id).done && levelOpen(levelById(x.level)); })[0];
    view.innerHTML = pennyRow("", "wow") +
      '<div class="celebrate"><div class="sticker-reveal' + (newSticker ? " new" : "") + '"><span>' + l.sticker.emoji + "</span></div>" +
      "<h2>You finished “" + esc(l.title) + "”!</h2><p class=\"done-stars\">" + starsHtml(avg) + "</p>" +
      (wasDone ? "" : '<p class="done-loot">🎟️ +1 Prize Wheel ticket · ⭐ +10 bonus</p>') +
      '<div class="done-actions">' + (nextL ? '<button class="big-btn go" id="dNext">✏️ Next: ' + esc(nextL.title) + "</button>" : "") +
        '<button class="big-btn alt" id="dBook">📓 See my Writing Book</button><button class="big-btn alt" id="dHome">🏠 All lessons</button></div></div>';
    penny(newSticker ? "You earned the " + l.sticker.name + " sticker! Your writing is growing like a beanstalk!" : "More writing, more practice. That's how authors are made!", "wow");
    if ($("dNext")) $("dNext").onclick = function () { go("lesson", nextL.id); };
    $("dBook").onclick = function () { go("book"); };
    $("dHome").onclick = function () { go("home"); };
  }

  /* ---------------- ✨ Free Write ---------------- */
  function renderFree() {
    var spark = pick(SPARKS);
    $("topTitle").textContent = "Free Write";
    view.innerHTML = pennyRow("", "wow") +
      '<div class="write-box" style="--bk:#b197fc;--bk2:#7048e8"><div class="spark-card"><small>Story Spark</small><b id="sparkTxt">' + esc(spark) + "</b>" +
      '<button class="mini-btn" id="reSpark">🎲 New spark</button></div><div id="padHost"></div></div>';
    function mount() {
      pad($("padHost"), { p: "Write at least 3 sentences about: " + spark + ". Or write about anything you like!", emoji: "✨", model: null, need: { min: 15, sentences: 3 } }, function (res) {
        journal("Free Write: " + spark, res.text, res.stars, "free");
        S.free++; store(K.free, S.free);
        addPoints(res.stars * 4);
        if (window.Tracker) Tracker.complete("freewrite", res.stars, 3, { item: spark, text: res.text.slice(0, 400) });
        checkTrophies(); confetti(60);
        go("book");
      }, "Save to my Writing Book ▶");
    }
    $("reSpark").onclick = function () { sfx.scribble(); spark = pick(SPARKS.filter(function (s) { return s !== spark; })); $("sparkTxt").textContent = spark; speak(spark); mount(); };
    mount();
    penny("Free Write time! Your spark is: " + spark + ". Or write about anything you like!", "wow");
  }

  /* ---------------- 📓 My Writing Book ---------------- */
  function renderBook() {
    $("topTitle").textContent = "My Writing Book";
    var items = S.journal.slice().reverse();
    view.innerHTML = pennyRow(items.length ? "Look at everything you wrote! Tap a page to hear it." : "Your Writing Book is empty. Every sentence you save shows up here!", "happy") +
      (items.length ? '<div class="book-list">' + items.map(function (j, i) {
        var d = new Date(j.ts);
        return '<button class="page" data-i="' + i + '"><span class="pg-top"><small>' + d.toLocaleDateString() + "</small><span class=\"stars\">" + starsHtml(j.stars) + "</span></span>" +
          '<b class="pg-title">' + esc(j.title) + '</b><span class="pg-text">' + esc(j.text) + "</span></button>";
      }).join("") + "</div>" : '<div class="home-actions"><button class="big-btn go" id="startFree">✨ Free Write</button></div>');
    view.querySelectorAll(".page").forEach(function (el) { el.onclick = function () { speak(items[+el.dataset.i].text); }; });
    if ($("startFree")) $("startFree").onclick = function () { go("free"); };
    penny($("pennySay").textContent, "happy");
  }

  /* ---------------- stickers & trophies ---------------- */
  function renderStickers() {
    $("topTitle").textContent = "My Stickers";
    view.innerHTML = pennyRow("Every lesson you finish adds a sticker!", "happy") + LEVELS.map(function (lv) {
      return '<section class="album"><h3>' + lv.emoji + " Level " + lv.n + ": " + esc(lv.title) + '</h3><div class="stk-grid">' + levelLessons(lv).map(function (l) {
        var got = S.stickers.indexOf("l:" + l.id) >= 0;
        return '<div class="stk' + (got ? " got" : "") + '" style="--bk:' + lv.color + '"><span class="se">' + (got ? l.sticker.emoji : "❔") + "</span><small>" + esc(got ? l.sticker.name : l.title) + "</small></div>";
      }).join("") + "</div></section>";
    }).join("");
    penny($("pennySay").textContent, "happy");
  }
  function renderTrophies() {
    $("topTitle").textContent = "My Trophies";
    view.innerHTML = pennyRow("Every trophy shows how hard you worked!", "happy") +
      '<div class="trophy-list">' + WS_TROPHIES.map(function (t) {
        var got = S.trophies.indexOf(t.id) >= 0;
        return '<div class="trophy' + (got ? " got" : "") + '"><span class="ti">' + (got ? t.icon : "🔒") + "</span><span><b>" + esc(t.name) + "</b><small>" + esc(t.desc) + "</small></span></div>";
      }).join("") + "</div>" +
      '<div class="stat-row"><span>⭐ ' + S.points + " points</span><span>📓 " + S.journal.length + " pieces written</span><span>🩺 " + S.selfFix + " self-fixes</span><span>🌟 " + S.clean + " three-star pieces</span></div>";
    penny($("pennySay").textContent, "happy");
  }

  /* ---------------- wiring ---------------- */
  $("backBtn").onclick = back;
  $("muteBtn").onclick = function () { S.mute = !S.mute; store(K.mute, S.mute); if (S.mute) hush(); hud(); };
  $("stkPill").onclick = function () { go("stickers"); };
  $("trophyBtn").onclick = function () { go("trophies"); };

  hud();
  go(/^#free/.test(location.hash) ? "free" : "home");
  window.StudioApp = { go: go, state: S };
})();
