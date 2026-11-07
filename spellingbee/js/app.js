/* ============================================================
   Buzzy's Spelling Bee — app engine
   Screens: home (hive) → comb → Learn / Missing Letters / Unscramble
            / Hear & Spell / Bee Contest → done · Daily Buzz · Tricky Jar
            · Grand Bee · grown-up practice tests · stickers · trophies
   Data: js/words.js (SB_LISTS), grown-up sets from ../js/spellbee-store.js
   ============================================================ */
(function () {
  "use strict";

  /* ---------------- storage (per learner via profile-store) ---------------- */
  var K = { pts: "sb_points", words: "sb_words", jar: "sb_jar", stk: "sb_stickers", tro: "sb_trophies", daily: "sb_daily",
            tests: "sb_tests", stats: "sb_stats", mute: "sb_mute", list: "sb_list", tickets: "rw_tickets" };
  function load(k, d) { try { var v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }
  function store(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  var S = {
    points: load(K.pts, 0), words: load(K.words, {}), jar: load(K.jar, []), stickers: load(K.stk, []), trophies: load(K.tro, []),
    daily: load(K.daily, []), tests: load(K.tests, {}), stats: load(K.stats, {}), mute: load(K.mute, false), list: load(K.list, "g3")
  };
  S.stats.streak = S.stats.streak || 0; S.stats.best = S.stats.best || 0; S.stats.unscr = S.stats.unscr || 0;

  var $ = function (id) { return document.getElementById(id); };
  var view = $("view");
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function dayKey(t) { var d = new Date(t || Date.now()); return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate(); }
  function norm(s) { return String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[’]/g, "'").replace(/\s+/g, " ").trim(); }
  function keyOf(w) { return norm(w); }

  /* ---------------- words ---------------- */
  function mk(a) { return { w: a[0], d: a[1] || "", s: a[2] || "", alt: a[3] || "", k: keyOf(a[0]) }; }
  var LISTS = SB_LISTS.map(function (L, li) {
    var ws = L.words.map(mk), combs = [];
    for (var i = 0; i < ws.length; i += 10) combs.push(ws.slice(i, i + 10));
    return Object.assign({}, L, { words: ws, combs: combs, li: li });
  });
  function listById(id) { for (var i = 0; i < LISTS.length; i++) if (LISTS[i].id === id) return LISTS[i]; return LISTS[2]; }
  var MINE = LISTS.filter(function (L) { return L.mine; })[0];
  function rec(w) { return S.words[w.k] || { m: 0, ok: 0, bad: 0 }; }
  function mastered(w) { return rec(w).m >= 2; }
  function countMastered(ws) { return ws.filter(mastered).length; }
  function combStickerIdx(L, ci) { return (L.li * 5 + ci) % SB_STICKERS.length; }

  // The learner's grade from the Hub login (hub_* keys are shared, so this reads straight through).
  function kidGrade() {
    try {
      var id = localStorage.getItem("hub_activeKid"), kids = JSON.parse(localStorage.getItem("hub_kids") || "[]");
      for (var i = 0; i < kids.length; i++) if (String(kids[i].id) === String(id)) return kids[i].grade;
    } catch (e) {}
    return null;
  }
  function testSets() { return window.SpellStore ? SpellStore.forGrade(kidGrade()) : []; }
  function setWords(t) { return t.words.map(function (x) { return { w: x.w, d: x.d || "", s: x.s || "", alt: x.alt || "", k: keyOf(x.w) }; }); }

  /* ---------------- voice & sound ---------------- */
  var speakToken = 0;
  function say(text, rate) {
    if (S.mute || !window.speechSynthesis || !text) return Promise.resolve();
    var my = ++speakToken;
    speechSynthesis.cancel();
    return new Promise(function (res) {
      var u = new SpeechSynthesisUtterance(text), done = false;
      u.lang = "en-US"; u.rate = rate || 0.9; u.pitch = 1.05;
      function fin() { if (!done) { done = true; res(); } }
      u.onend = fin; u.onerror = fin;
      setTimeout(fin, 1500 + text.length * 110);
      speechSynthesis.speak(u);
    }).then(function () { return my === speakToken; });
  }
  function hush() { speakToken++; if (window.speechSynthesis) speechSynthesis.cancel(); }
  function letterName(c) { return c === " " ? "space" : c === "-" ? "hyphen" : c === "'" || c === "’" ? "apostrophe" : c.toUpperCase(); }
  function spellOut(w) { return say(w + ". " + w.split("").map(letterName).join(", ") + ". " + w + ".", 0.75); }

  var actx = null;
  function tone(freqs, dur, type, gap) {
    if (S.mute) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      freqs.forEach(function (f, i) {
        var o = actx.createOscillator(), g = actx.createGain(), t = actx.currentTime + i * (gap || 0.1);
        o.type = type || "sine"; o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.15, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        o.connect(g); g.connect(actx.destination); o.start(t); o.stop(t + dur + 0.05);
      });
    } catch (e) {}
  }
  var sfx = {
    ding: function () { tone([880, 1320], 0.22, "triangle", 0.09); },
    pop: function () { tone([520], 0.1, "sine"); },
    tap: function () { tone([700], 0.05, "sine"); },
    boop: function () { tone([300, 240], 0.18, "sine", 0.12); },
    bell: function () { tone([1568, 1568], 0.35, "sine", 0.18); },
    fanfare: function () { tone([523, 659, 784, 1047], 0.3, "triangle", 0.13); },
    buzz: function () { tone([180, 200, 180], 0.12, "sawtooth", 0.08); }
  };

  /* ---------------- Buzzy the bee ---------------- */
  function buzzyRow(msg, mood) {
    return '<div class="buzzy-row"><div class="buzzy ' + (mood || "") + '" id="buzzy" aria-hidden="true"><span class="b-body">🐝</span><span class="b-trail"></span></div>' +
      '<div class="bubble" id="buzzSay">' + esc(msg || "") + "</div></div>";
  }
  function buzz(msg, mood, speak) {
    var b = $("buzzSay"); if (b) b.textContent = msg;
    var z = $("buzzy"); if (z) { z.className = "buzzy " + (mood || ""); void z.offsetWidth; z.classList.add("hop"); }
    if (speak !== false) say(msg);
  }

  /* ---------------- rewards ---------------- */
  function hud() {
    $("ptsPill").textContent = "🍯 " + S.points;
    $("stkPill").textContent = "🎟️ " + S.stickers.length;
    $("muteBtn").textContent = S.mute ? "🔇" : "🔊";
  }
  function addPoints(n) { S.points += n; store(K.pts, S.points); hud(); }
  function giveTicket() { var t = parseInt(localStorage.getItem(K.tickets) || "0", 10) || 0; localStorage.setItem(K.tickets, String(t + 1)); }
  function giveSticker(id, e, n) {
    if (S.stickers.some(function (s) { return s.id === id; })) return false;
    S.stickers.push({ id: id, e: e, n: n, t: Date.now() }); store(K.stk, S.stickers); hud();
    popup(e, "New sticker!", n + " · 🎟️ +1 Prize Wheel ticket"); giveTicket(); return true;
  }
  function trophy(id) {
    if (S.trophies.indexOf(id) >= 0) return;
    var t = SB_TROPHIES.filter(function (x) { return x.id === id; })[0]; if (!t) return;
    S.trophies.push(id); store(K.tro, S.trophies);
    toast("🏆 New trophy: " + t.icon + " " + t.name + "!"); sfx.fanfare(); confetti(40);
  }
  var popQueue = [];
  function popup(emoji, title, sub) {
    popQueue.push([emoji, title, sub]); if (popQueue.length === 1) showPop();
  }
  function showPop() {
    var p = popQueue[0]; if (!p) return;
    var el = document.createElement("div"); el.className = "pop-veil";
    el.innerHTML = '<div class="pop"><div class="pop-e">' + p[0] + "</div><h2>" + esc(p[1]) + "</h2><p>" + esc(p[2]) + '</p><button class="big-btn go">Yay! 🎉</button></div>';
    document.body.appendChild(el); sfx.fanfare(); confetti(60);
    el.querySelector("button").onclick = function () { el.remove(); popQueue.shift(); showPop(); };
  }
  function toast(msg) {
    var t = $("toast"); t.textContent = msg; t.classList.add("show");
    clearTimeout(toast.h); toast.h = setTimeout(function () { t.classList.remove("show"); }, 2600);
  }
  function confetti(n) {
    var box = $("confetti"), bits = ["🍯", "🐝", "⭐", "🌼", "✨", "💛"];
    for (var i = 0; i < n; i++) {
      var s = document.createElement("span"); s.textContent = pick(bits);
      s.style.left = Math.random() * 100 + "vw"; s.style.animationDelay = Math.random() * 0.6 + "s"; s.style.fontSize = 14 + Math.random() * 18 + "px";
      box.appendChild(s); setTimeout(function (x) { x.remove(); }.bind(null, s), 2800);
    }
  }

  // A spelling result. Mastery moves only in the "real" spelling modes.
  var REAL = { spell: 1, contest: 1, test: 1, daily: 1, jar: 1 };
  function record(w, ok, mode, firstTry) {
    if (window.Tracker) Tracker.answer(ok, "Spelling: " + MODE_NAME[mode], { word: w.w, first: !!firstTry });
    var r = S.words[w.k] || (S.words[w.k] = { m: 0, ok: 0, bad: 0 }), before = r.m;
    r.t = Date.now();
    if (ok) {
      r.ok++;
      S.stats.streak++; if (S.stats.streak > S.stats.best) S.stats.best = S.stats.streak;
      if (S.stats.streak === 10) trophy("streak-10");
      trophy("first-buzz");
      if (REAL[mode] && firstTry) r.m = Math.min(3, r.m + 1);
    } else {
      r.bad++; S.stats.streak = 0;
      if (REAL[mode]) { r.m = Math.max(0, r.m - 1); if (S.jar.indexOf(w.k) < 0) { S.jar.push(w.k); store(K.jar, S.jar); } }
    }
    store(K.words, S.words); store(K.stats, S.stats);
    if (before < 2 && r.m >= 2) checkCombs();
  }
  function checkCombs() {
    LISTS.forEach(function (L) {
      L.combs.forEach(function (c, ci) {
        if (countMastered(c) === c.length) {
          var e = SB_STICKERS[combStickerIdx(L, ci)];
          if (giveSticker("comb:" + L.id + ":" + ci, e, L.grade + " Honeycomb " + (ci + 1))) { trophy("comb-keeper"); addPoints(10); }
        }
      });
    });
    if (countMastered(MINE.words) === MINE.words.length) trophy("hive-hero");
  }

  /* ---------------- navigation ---------------- */
  var current = { screen: "home" }, run = null, nav = 0;
  function go(screen, arg) {
    hush(); nav++; KB.target = null;
    current = { screen: screen, arg: arg };
    $("backBtn").hidden = screen === "home";
    document.body.dataset.screen = screen;
    window.scrollTo(0, 0);
    ({ home: renderHome, comb: renderComb, learn: renderLearn, missing: renderMissing, scramble: renderScramble, spell: renderSpell,
       contest: renderContest, done: renderDone, stickers: renderStickers, trophies: renderTrophies, testset: renderTestSet })[screen](arg);
  }
  function back() {
    var c = current;
    if (c.screen === "comb" || c.screen === "stickers" || c.screen === "trophies" || c.screen === "testset") go("home");
    else if (run && run.src.kind === "comb") go("comb", { list: run.src.list, comb: run.src.comb });
    else if (run && run.src.kind === "test") go("testset", run.src.id);
    else go("home");
  }
  var MODE_NAME = { learn: "Learn", missing: "Missing Letters", scramble: "Unscramble", spell: "Hear & Spell", contest: "Bee Contest",
                    test: "Practice Test", daily: "Daily Buzz", jar: "Tricky Jar" };

  /* ---------------- home: the hive ---------------- */
  function hexComb(L, ci) {
    var c = L.combs[ci], m = countMastered(c), done = m === c.length;
    var cells = c.map(function (w) { var r = rec(w).m; return '<i class="cell m' + Math.min(r, 2) + '"></i>'; }).join("");
    return '<button class="comb-card' + (done ? " full" : "") + '" data-comb="' + ci + '" style="--hc:' + L.color + ";--hc2:" + L.accent + '">' +
      '<span class="hex"><span class="hex-in">' + (done ? SB_STICKERS[combStickerIdx(L, ci)] : ci + 1) + "</span></span>" +
      '<span class="comb-txt"><b>Honeycomb ' + (ci + 1) + "</b><small>" + c.slice(0, 3).map(function (w) { return esc(w.w); }).join(", ") + "…</small>" +
      '<span class="cells">' + cells + "</span><small>" + m + " of " + c.length + " mastered</small></span></button>";
  }
  function renderHome() {
    $("topTitle").textContent = "Buzzy's Spelling Bee";
    var L = S.list === "tests" ? null : listById(S.list), sets = testSets();
    if (S.list === "tests" && !sets.length) { S.list = MINE.id; L = MINE; }
    var allW = [].concat.apply([], LISTS.map(function (x) { return x.words; }));
    var today = S.daily.indexOf(dayKey()) >= 0, jarN = S.jar.length;
    var tabs = LISTS.map(function (x) {
      return '<button class="ltab' + (S.list === x.id ? " on" : "") + '" data-list="' + x.id + '" style="--hc:' + x.color + ";--hc2:" + x.accent + '">' +
        x.emoji + " " + x.grade + "<small>" + x.tag + "</small></button>";
    }).join("") + (sets.length ? '<button class="ltab tests' + (S.list === "tests" ? " on" : "") + '" data-list="tests">🧪 Practice tests<small>From your grown-up</small></button>' : "");
    var body;
    if (L) {
      body = '<div class="list-head" style="--hc:' + L.color + ";--hc2:" + L.accent + '"><div><small>' + L.level + " · " + L.tag + "</small><h2>" + L.emoji + " " + L.grade + " words</h2>" +
        "<p>" + countMastered(L.words) + " of " + L.words.length + " words mastered</p></div>" +
        '<div class="lh-actions"><button class="big-btn go" id="grandBtn">🎤 Grand Bee<small>All ' + L.words.length + " words · 3 hearts</small></button></div></div>" +
        '<div class="hive">' + L.combs.map(function (_, ci) { return hexComb(L, ci); }).join("") + "</div>";
    } else {
      body = '<div class="list-head tests"><div><small>Made by your grown-up</small><h2>🧪 Practice tests</h2><p>Special word lists to get ready for your spelling bee.</p></div></div>' +
        '<div class="set-grid">' + sets.map(function (t) {
          var r = S.tests[t.id];
          return '<button class="set-card" data-set="' + esc(t.id) + '"><span class="set-e">' + esc(t.emoji) + "</span><span><b>" + esc(t.title) + "</b><small>" + t.words.length + " words" +
            (r ? " · best " + r.best + "%" : " · new!") + "</small></span></button>";
        }).join("") + "</div>";
    }
    view.innerHTML = buzzyRow(greet()) +
      '<div class="stat-row"><span>🍯 <b>' + S.points + "</b> honey</span><span>✅ <b>" + countMastered(allW) + "</b> words mastered</span><span>🔥 best streak <b>" + S.stats.best + "</b></span></div>" +
      '<div class="quick">' +
        '<button class="quick-card daily' + (today ? " done" : "") + '" id="dailyBtn"><span class="qe">☀️</span><b>Daily Buzz</b><small>' + (today ? "Done today! Come back tomorrow ✔" : "5 words a day · 🎟️ ticket") + "</small></button>" +
        '<button class="quick-card jar" id="jarBtn"' + (jarN ? "" : " disabled") + '><span class="qe">🫙</span><b>Tricky Jar</b><small>' + (jarN ? jarN + " word" + (jarN === 1 ? "" : "s") + " to practise" : "Empty! Words you miss go here") + "</small></button>" +
        '<button class="quick-card how" id="howBtn"><span class="qe">🏅</span><b>How a bee works</b><small>Ask, think, spell, win!</small></button>' +
      "</div>" +
      '<div class="ltabs" role="tablist">' + tabs + "</div>" + body +
      '<div class="home-actions"><button class="big-btn alt" data-go="stickers">🎟️ My Stickers</button><button class="big-btn alt" data-go="trophies">🏆 My Trophies</button></div>';
    view.querySelectorAll("[data-list]").forEach(function (b) { b.onclick = function () { sfx.pop(); S.list = b.dataset.list; store(K.list, S.list); renderHome(); }; });
    view.querySelectorAll("[data-comb]").forEach(function (b) { b.onclick = function () { sfx.pop(); go("comb", { list: L.id, comb: +b.dataset.comb }); }; });
    view.querySelectorAll("[data-set]").forEach(function (b) { b.onclick = function () { sfx.pop(); go("testset", b.dataset.set); }; });
    view.querySelectorAll("[data-go]").forEach(function (b) { b.onclick = function () { go(b.dataset.go); }; });
    if ($("grandBtn")) $("grandBtn").onclick = function () { start("contest", shuffle(L.words), { kind: "grand", list: L.id }, L.grade + " Grand Bee"); };
    $("dailyBtn").onclick = function () { start("daily", dailyWords(), { kind: "daily" }, "Daily Buzz"); };
    $("jarBtn").onclick = function () {
      var ws = S.jar.map(findWord).filter(Boolean);
      start("jar", shuffle(ws).slice(0, 10), { kind: "jar", startN: S.jar.length }, "Tricky Jar");
    };
    $("howBtn").onclick = howTo;
    buzz($("buzzSay").textContent, "happy");
  }
  function greet() {
    var n = S.jar.length;
    if (!S.points) return "Hi, I'm Buzzy! Let's get you ready for the spelling bee. Pick a honeycomb to start!";
    if (S.daily.indexOf(dayKey()) < 0) return "Buzz buzz! Your Daily Buzz is waiting: just five words!";
    if (n >= 3) return "You have " + n + " words in your Tricky Jar. Let's empty it!";
    return pick(["Ready to fill more honeycombs?", "Every word you master is a drop of honey!", "Champions practise a little every day. You're doing it!"]);
  }
  function findWord(k) {
    for (var i = 0; i < LISTS.length; i++) for (var j = 0; j < LISTS[i].words.length; j++) if (LISTS[i].words[j].k === k) return LISTS[i].words[j];
    var sets = window.SpellStore ? SpellStore.list() : [];
    for (i = 0; i < sets.length; i++) { var ws = setWords(sets[i]); for (j = 0; j < ws.length; j++) if (ws[j].k === k) return ws[j]; }
    return null;
  }
  // Five words a day from the learner's grade list, not-yet-mastered first; the same five all day.
  function dailyWords() {
    var seed = 0, d = dayKey(); for (var i = 0; i < d.length; i++) seed = (seed * 31 + d.charCodeAt(i)) % 100003;
    function rnd() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
    var pool = MINE.words.filter(function (w) { return !mastered(w); }); if (pool.length < 5) pool = MINE.words.slice();
    var out = []; while (out.length < 5 && pool.length) out.push(pool.splice(Math.floor(rnd() * pool.length), 1)[0]);
    return out;
  }
  function howTo() {
    var el = document.createElement("div"); el.className = "pop-veil";
    el.innerHTML = '<div class="pop how-pop"><div class="pop-e">🎤</div><h2>How a spelling bee works</h2><ol>' +
      "<li>The <b>pronouncer</b> says your word.</li>" +
      "<li>You may ask: <b>Say it again</b>, <b>What does it mean?</b>, <b>Use it in a sentence</b>.</li>" +
      "<li>Say the word, spell it letter by letter, then say it again.</li>" +
      "<li>A bell <b>ding!</b> means you got it right. Champions keep calm and take their time.</li></ol>" +
      "<p>In Buzzy's Bee Contest you get <b>3 hearts</b> ❤️❤️❤️. Spell to the end with a heart left to win!</p>" +
      '<button class="big-btn go">Got it! 🐝</button></div>';
    document.body.appendChild(el);
    el.querySelector("button").onclick = function () { el.remove(); };
  }

  /* ---------------- one honeycomb: its words and the 5 ways to practise ---------------- */
  function renderComb(a) {
    var L = listById(a.list), c = L.combs[a.comb];
    $("topTitle").textContent = L.grade + " · Honeycomb " + (a.comb + 1);
    var src = { kind: "comb", list: L.id, comb: a.comb };
    var MODES = [
      ["learn", "📖", "Learn", "Hear each word, its meaning and its spelling"],
      ["missing", "🧩", "Missing Letters", "Fill in the letters that ran away"],
      ["scramble", "🔀", "Unscramble", "Put the jumbled letters in order"],
      ["spell", "🎧", "Hear & Spell", "Listen, then type the whole word · fills your honeycomb"],
      ["contest", "🎤", "Bee Contest", "On stage with 3 hearts, like a real bee!"]
    ];
    view.innerHTML = '<div class="list-head" style="--hc:' + L.color + ";--hc2:" + L.accent + '"><div><small>' + L.level + " · " + L.grade + "</small><h2>Honeycomb " + (a.comb + 1) + "</h2><p>" +
      countMastered(c) + " of " + c.length + " mastered. Spell a word right on the first try twice to master it.</p></div></div>" +
      buzzyRow(countMastered(c) === c.length ? "This honeycomb is full of honey! Try a Bee Contest to keep it sweet." : "Start with Learn, then play the games. Hear & Spell fills your honeycomb!", "happy") +
      '<div class="word-chips">' + c.map(function (w) {
        var m = rec(w).m;
        return '<button class="wchip m' + Math.min(m, 2) + '" data-say="' + esc(w.w) + '">' + esc(w.w) + '<span class="pips">' + (m >= 2 ? "🍯" : m === 1 ? "💧" : "") + "</span></button>";
      }).join("") + "</div>" +
      '<div class="modes">' + MODES.map(function (m, i) {
        return '<button class="mode-card" data-mode="' + m[0] + '"><span class="mode-n">' + m[1] + "</span><span><b>" + (i + 1) + ". " + m[2] + "</b><small>" + m[3] + "</small></span><span class=\"go-arrow\">▶</span></button>";
      }).join("") + "</div>";
    view.querySelectorAll("[data-say]").forEach(function (b) { b.onclick = function () { say(b.dataset.say); }; });
    view.querySelectorAll("[data-mode]").forEach(function (b) {
      b.onclick = function () { sfx.pop(); var m = b.dataset.mode; start(m, m === "learn" ? c.slice() : shuffle(c), src, L.grade + " · Honeycomb " + (a.comb + 1)); };
    });
    buzz($("buzzSay").textContent, "happy");
  }

  /* ---------------- a test set made by a grown-up ---------------- */
  function renderTestSet(id) {
    var t = window.SpellStore && SpellStore.get(id);
    if (!t || !SpellStore.visible(t)) { go("home"); return; }
    var ws = setWords(t), r = S.tests[t.id], src = { kind: "test", id: t.id };
    $("topTitle").textContent = t.title;
    view.innerHTML = '<div class="list-head tests"><div><small>Practice test from your grown-up</small><h2>' + esc(t.emoji) + " " + esc(t.title) + "</h2><p>" + ws.length + " words" +
      (r ? " · best score " + r.best + "% · tried " + r.tries + (r.tries === 1 ? " time" : " times") : "") + "</p></div></div>" +
      buzzyRow("Learn the words first, then take the test. Get them all right to win a trophy!", "happy") +
      '<div class="word-chips">' + ws.map(function (w) { return '<button class="wchip m' + Math.min(rec(w).m, 2) + '" data-say="' + esc(w.w) + '">' + esc(w.w) + "</button>"; }).join("") + "</div>" +
      '<div class="modes">' +
        '<button class="mode-card" data-mode="learn"><span class="mode-n">📖</span><span><b>Learn the words</b><small>Hear, see and spell each one</small></span><span class="go-arrow">▶</span></button>' +
        '<button class="mode-card" data-mode="scramble"><span class="mode-n">🔀</span><span><b>Unscramble warm-up</b><small>Jumbled letters</small></span><span class="go-arrow">▶</span></button>' +
        '<button class="mode-card star" data-mode="test"><span class="mode-n">📝</span><span><b>Take the test</b><small>Hear each word and spell it · your score is saved</small></span><span class="go-arrow">▶</span></button>' +
        '<button class="mode-card" data-mode="contest"><span class="mode-n">🎤</span><span><b>Bee Contest</b><small>On stage with 3 hearts</small></span><span class="go-arrow">▶</span></button>' +
      "</div>";
    view.querySelectorAll("[data-say]").forEach(function (b) { b.onclick = function () { say(b.dataset.say); }; });
    view.querySelectorAll("[data-mode]").forEach(function (b) {
      b.onclick = function () { sfx.pop(); var m = b.dataset.mode; start(m, m === "learn" ? ws.slice() : shuffle(ws), src, t.title); };
    });
    buzz($("buzzSay").textContent, "happy");
  }

  /* ---------------- a run of words ---------------- */
  function start(mode, words, src, title) {
    if (!words.length) return;
    run = { mode: mode, words: words, src: src, title: title, i: 0, right: 0, first: 0, hearts: 3, results: [], t0: Date.now() };
    var scr = { learn: "learn", missing: "missing", scramble: "scramble", spell: "spell", test: "spell", daily: "spell", jar: "spell", contest: "contest" }[mode];
    go(scr);
  }
  function progressDots() {
    return '<div class="round-dots">' + run.words.map(function (_, k) {
      var r = run.results[k];
      return '<i class="' + (r ? (r.first ? "ok" : r.ok ? "meh" : "bad") : k === run.i ? "now" : "") + '"></i>';
    }).join("") + "</div>";
  }
  function runHead() {
    $("topTitle").textContent = MODE_NAME[run.mode] + " · " + run.title;
    return '<div class="run-head"><span class="run-mode">' + MODE_NAME[run.mode] + '</span><span class="run-n">Word ' + (run.i + 1) + " of " + run.words.length + "</span></div>" + progressDots();
  }
  function hideWord(sentence, w) {
    var re = new RegExp(w.w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "ig");
    return esc(sentence).replace(re, "_____");
  }
  function nextWord() {
    run.i++;
    if (run.i >= run.words.length) finish(); else go(current.screen);
  }

  /* ---------------- 1. Learn ---------------- */
  function renderLearn() {
    var w = run.words[run.i];
    view.innerHTML = runHead() +
      '<div class="flash">' +
        '<div class="big-word">' + w.w.split("").map(function (ch, i) {
          return '<span class="lt' + (/[aeiou]/i.test(ch) ? " v" : "") + '" style="animation-delay:' + i * 0.05 + 's">' + esc(ch) + "</span>";
        }).join("") + "</div>" +
        (w.alt ? '<p class="alt">Also spelled: <b>' + esc(w.alt) + "</b></p>" : "") +
        (w.d ? '<p class="def"><b>Meaning:</b> ' + esc(w.d) + "</p>" : "") +
        (w.s ? '<p class="sent"><b>Sentence:</b> “' + esc(w.s) + "”</p>" : "") +
        '<div class="tool-row"><button class="tool" id="lSay">🔊 Say it</button><button class="tool" id="lSlow">🐌 Slowly</button><button class="tool" id="lSpell">🔤 Spell it to me</button>' +
          (w.s ? '<button class="tool" id="lSent">💬 Sentence</button>' : "") + "</div>" +
        '<p class="tip">💡 Look, say, cover, write: look at the word, say it, close your eyes and picture the letters!</p>' +
      "</div>" +
      '<div class="nav-row"><button class="big-btn alt" id="lPrev"' + (run.i ? "" : " disabled") + '>◀ Back</button><button class="big-btn go" id="lNext">' + (run.i + 1 < run.words.length ? "Next word ▶" : "I'm ready! ✔") + "</button></div>";
    $("lSay").onclick = function () { say(w.w); };
    $("lSlow").onclick = function () { say(w.w, 0.45); };
    $("lSpell").onclick = function () { spellOut(w.w); };
    if ($("lSent")) $("lSent").onclick = function () { say(w.s); };
    $("lPrev").onclick = function () { run.i--; renderLearn(); };
    $("lNext").onclick = function () { sfx.pop(); run.results[run.i] = { ok: true, first: true, w: w }; nextWord(); };
    say(w.w + (w.d ? ". " + w.d + "." : "")).then(function (still) { if (still) spellOut(w.w); });
  }

  /* ---------------- on-screen keyboard (+ the real keyboard) ---------------- */
  var KB = { target: null };
  function keyboardHtml(extra) {
    var rows = ["qwertyuiop", "asdfghjkl", "zxcvbnm"];
    var x = (extra || []).map(function (c) { return '<button class="key x" data-key="' + esc(c) + '">' + (c === " " ? "space" : esc(c)) + "</button>"; }).join("");
    return '<div class="kbd">' + rows.map(function (r, i) {
      return '<div class="krow">' + (i === 2 ? '<button class="key wide" data-key="⌫" aria-label="Delete">⌫</button>' : "") +
        r.split("").map(function (c) { return '<button class="key" data-key="' + c + '">' + c + "</button>"; }).join("") +
        (i === 2 ? '<button class="key wide go" data-key="⏎" aria-label="Check">✔</button>' : "") + "</div>";
    }).join("") + (x ? '<div class="krow">' + x + "</div>" : "") + "</div>";
  }
  function extrasFor(words) {
    var out = [];
    ["'", "-", " "].forEach(function (c) { if (words.some(function (w) { return w.w.indexOf(c) >= 0 || w.w.indexOf("’") >= 0 && c === "'"; })) out.push(c); });
    return out;
  }
  function wireKeyboard(onKey) {
    KB.target = onKey;
    view.querySelectorAll("[data-key]").forEach(function (b) {
      b.onclick = function () { sfx.tap(); if (KB.target) KB.target(b.dataset.key); };
    });
  }
  document.addEventListener("keydown", function (e) {
    if (!KB.target || e.ctrlKey || e.metaKey || e.altKey) return;
    if (document.querySelector(".pop-veil, .kb-veil")) return;
    var k = e.key;
    if (k === "Backspace") { e.preventDefault(); KB.target("⌫"); }
    else if (k === "Enter") { e.preventDefault(); KB.target("⏎"); }
    else if (k.length === 1 && /[a-zA-Z'\- ]/.test(k)) { e.preventDefault(); KB.target(k === " " ? " " : k.toLowerCase()); }
  });

  /* ---------------- 2. Missing Letters ---------------- */
  function blanksFor(w) {
    var letters = w.w.split(""), idx = [];
    letters.forEach(function (c, i) { if (/[a-z]/i.test(c)) idx.push(i); });
    var n = Math.max(1, Math.min(4, Math.round(idx.length * 0.35)));
    // vowels and double letters are the usual traps, so blank those first
    var trap = idx.filter(function (i) { return /[aeiouy]/i.test(letters[i]) || letters[i] === letters[i - 1] || letters[i] === letters[i + 1]; });
    var pickFrom = shuffle(trap).concat(shuffle(idx.filter(function (i) { return trap.indexOf(i) < 0; })));
    return pickFrom.slice(0, n).sort(function (a, b) { return a - b; });
  }
  function renderMissing() {
    var w = run.words[run.i], blanks = blanksFor(w), fill = [], tries = 0;
    function draw(state) {
      var j = 0;
      $("mWord").innerHTML = w.w.split("").map(function (ch, i) {
        if (blanks.indexOf(i) < 0) return '<span class="lt">' + esc(ch) + "</span>";
        var v = fill[j], cur = j === fill.length; j++;
        return '<span class="lt blank' + (cur && !state ? " cur" : "") + (state ? " " + state : "") + '">' + esc(v || "") + "</span>";
      }).join("");
    }
    view.innerHTML = runHead() + buzzyRow("Some letters flew away! Which ones are missing?", "happy") +
      '<div class="flash small"><div class="big-word" id="mWord"></div>' + (w.d ? '<p class="def">' + esc(w.d) + "</p>" : "") +
      '<div class="tool-row"><button class="tool" id="mSay">🔊 Say it</button><button class="tool" id="mSlow">🐌 Slowly</button></div></div>' +
      '<div class="feedback" id="fb"></div>' + keyboardHtml(extrasFor([w]));
    draw();
    $("mSay").onclick = function () { say(w.w); };
    $("mSlow").onclick = function () { say(w.w, 0.45); };
    say(w.w);
    wireKeyboard(function (k) {
      if (k === "⌫") { fill.pop(); draw(); return; }
      if (k === "⏎") return;
      if (fill.length >= blanks.length) return;
      fill.push(k); draw();
      if (fill.length < blanks.length) return;
      var ok = blanks.every(function (bi, j) { return norm(w.w[bi]) === norm(fill[j]); });
      KB.target = null;
      if (ok) {
        draw("good"); sfx.ding(); addPoints(1); record(w, true, "missing", !tries);
        run.results[run.i] = { ok: true, first: !tries, w: w }; if (!tries) run.first++; run.right++;
        $("fb").innerHTML = '<span class="yay">' + pick(SB_PRAISE.right) + "</span>";
        say(w.w).then(function () { setTimeout(onNav(nextWord), 400); });
      } else if (!tries) {
        tries++; draw("bad"); sfx.boop(); $("fb").innerHTML = '<span class="hmm">' + pick(SB_PRAISE.oops) + " Try again!</span>";
        setTimeout(onNav(function () { fill = []; draw(); wireKeyboard(KB.last); }), 1100);
      } else {
        record(w, false, "missing"); run.results[run.i] = { ok: false, first: false, w: w };
        fill = blanks.map(function (bi) { return w.w[bi]; }); draw("show"); sfx.boop();
        $("fb").innerHTML = '<span class="hmm">It\'s spelled <b>' + esc(w.w) + "</b>.</span>" + '<button class="big-btn go" id="mNext">Next ▶</button>';
        spellOut(w.w); $("mNext").onclick = nextWord;
      }
    });
    KB.last = KB.target;
  }
  // Wrap a delayed step so it does nothing if the child already moved on.
  function onNav(fn) { var my = nav; return function () { if (my === nav) fn(); }; }

  /* ---------------- 3. Unscramble ---------------- */
  function renderScramble() {
    var w = run.words[run.i], chars = w.w.split(""), order = shuffle(chars.map(function (_, i) { return i; })), tries = 0;
    if (chars.length > 1) { var guard = 0; while (order.map(function (i) { return chars[i]; }).join("") === w.w && guard++ < 10) order = shuffle(order); }
    var placed = [];   // indexes into order
    function draw(state) {
      $("slots").innerHTML = chars.map(function (_, k) {
        var p = placed[k];
        return '<button class="slot' + (p != null ? " full" : "") + (state ? " " + state : "") + '" data-slot="' + k + '">' + (p != null ? esc(chars[order[p]]) : "") + "</button>";
      }).join("");
      $("tiles").innerHTML = order.map(function (ci, p) {
        return '<button class="tile' + (placed.indexOf(p) >= 0 ? " used" : "") + '" data-tile="' + p + '"' + (placed.indexOf(p) >= 0 ? " disabled" : "") + ">" + esc(chars[ci]) + "</button>";
      }).join("");
      view.querySelectorAll("[data-tile]").forEach(function (b) { b.onclick = function () { sfx.tap(); placed.push(+b.dataset.tile); draw(); check(); }; });
      view.querySelectorAll("[data-slot]").forEach(function (b) {
        b.onclick = function () { var k = +b.dataset.slot; if (placed[k] == null) return; placed = placed.slice(0, k); draw(); };
      });
    }
    function check() {
      if (placed.length < chars.length) return;
      var guess = placed.map(function (p) { return chars[order[p]]; }).join("");
      if (guess === w.w) {
        draw("good"); sfx.ding(); addPoints(1); record(w, true, "scramble", !tries);
        S.stats.unscr++; store(K.stats, S.stats); if (S.stats.unscr >= 25) trophy("scrambler");
        run.results[run.i] = { ok: true, first: !tries, w: w }; if (!tries) run.first++; run.right++;
        $("fb").innerHTML = '<span class="yay">' + pick(SB_PRAISE.right) + "</span>";
        say(w.w).then(function () { setTimeout(onNav(nextWord), 400); });
      } else if (tries < 1) {
        tries++; draw("bad"); sfx.boop(); $("fb").innerHTML = '<span class="hmm">Not quite! The first letter is <b>' + esc(w.w[0]) + "</b>. Try again!</span>";
        setTimeout(onNav(function () { placed = [order.indexOf(0)]; draw(); }), 1000);
      } else {
        record(w, false, "scramble"); run.results[run.i] = { ok: false, first: false, w: w };
        placed = chars.map(function (_, k) { return order.indexOf(k); }); draw("show"); sfx.boop();
        $("fb").innerHTML = '<span class="hmm">Here it is: <b>' + esc(w.w) + '</b></span><button class="big-btn go" id="sNext">Next ▶</button>';
        spellOut(w.w); $("sNext").onclick = nextWord;
      }
    }
    view.innerHTML = runHead() + buzzyRow("Oh no, the letters got jumbled! Tap them in the right order.", "happy") +
      '<div class="flash small">' + (w.d ? '<p class="def"><b>Clue:</b> ' + esc(w.d) + "</p>" : "") +
      '<div class="slots" id="slots"></div><div class="tiles" id="tiles"></div>' +
      '<div class="tool-row"><button class="tool" id="sSay">🔊 Say it</button><button class="tool" id="sClear">↺ Start over</button></div></div>' +
      '<div class="feedback" id="fb"></div>';
    draw();
    $("sSay").onclick = function () { say(w.w); };
    $("sClear").onclick = function () { placed = []; draw(); };
    say(w.w);
  }

  /* ---------------- 4. Hear & Spell (also Daily Buzz, Tricky Jar, Practice Test) ---------------- */
  function renderSpell() {
    var w = run.words[run.i], typed = "", tries = 0, helped = false, copying = false, isTest = run.mode === "test";
    var maxTries = isTest ? 1 : 2;
    function boxes(state) {
      var n = Math.max(w.w.length, typed.length);
      var out = "";
      for (var i = 0; i < n; i++) {
        var c = typed[i] || "", cls = "box";
        if (state === "diff" && c) cls += norm(c) === norm(w.w[i] || "") ? " good" : " bad";
        else if (state) cls += " " + state;
        if (i === typed.length && !state) cls += " cur";
        out += '<span class="' + cls + '">' + esc(c === " " ? "␣" : c) + "</span>";
      }
      $("boxes").innerHTML = out;
    }
    view.innerHTML = runHead() +
      buzzyRow(run.mode === "jar" ? "These are your tricky words. You can do it!" : run.mode === "daily" ? "Daily Buzz! Five words, here we go." : "Listen carefully, then spell the word.", "happy") +
      '<div class="flash small">' +
        '<button class="ear" id="hSay" aria-label="Hear the word">🔊<small>Hear the word</small></button>' +
        '<div class="hint-row"><button class="tool" id="hSlow">🐌 Slowly</button>' +
          (w.d ? '<button class="tool" id="hDef">📖 Meaning</button>' : "") +
          (w.s ? '<button class="tool" id="hSent">💬 Sentence</button>' : "") +
          (isTest ? "" : '<button class="tool" id="hFirst">💡 First letter</button>') + "</div>" +
        '<p class="hint-text" id="hint"></p>' +
        '<div class="boxes" id="boxes"></div>' +
      "</div>" +
      '<div class="feedback" id="fb"></div>' + keyboardHtml(extrasFor(run.words));
    boxes();
    $("hSay").onclick = function () { say(w.w); };
    $("hSlow").onclick = function () { say(w.w, 0.45); };
    if ($("hDef")) $("hDef").onclick = function () { $("hint").innerHTML = "📖 " + esc(w.d); say(w.d); };
    if ($("hSent")) $("hSent").onclick = function () { $("hint").innerHTML = "💬 " + hideWord(w.s, w); say(w.s); };
    if ($("hFirst")) $("hFirst").onclick = function () { helped = true; $("hint").innerHTML = "💡 It starts with <b>" + esc(w.w[0]) + "</b>"; say("It starts with " + letterName(w.w[0])); };
    say(w.w);
    function done(ok) {
      KB.target = null;
      var first = ok && !tries && !helped;
      run.results[run.i] = { ok: ok, first: first, w: w, typed: typed };
      if (ok) run.right++; if (first) run.first++;
      if (run.mode === "jar" && ok) { S.jar = S.jar.filter(function (k) { return k !== w.k; }); store(K.jar, S.jar); }
    }
    function onKey(k) {
      if (k === "⌫") { typed = typed.slice(0, -1); boxes(); return; }
      if (k === "⏎") { if (typed.trim()) submit(); return; }
      if (typed.length >= 40) return;
      typed += k; boxes();
      if (copying && norm(typed) === norm(w.w)) submit();
    }
    function submit() {
      var ok = norm(typed) === norm(w.w) || (w.alt && norm(typed) === norm(w.alt));
      if (copying) {
        if (!ok) { sfx.boop(); $("fb").innerHTML = '<span class="hmm">Copy it carefully: <b>' + esc(w.w) + "</b></span>"; typed = ""; boxes(); return; }
        sfx.pop(); $("fb").innerHTML = '<span class="yay">Now your brain remembers it! 🧠</span>'; KB.target = null;
        setTimeout(onNav(nextWord), 900); return;
      }
      if (ok) {
        boxes("good"); sfx.ding();
        var first = !tries && !helped;
        addPoints(first ? 2 : 1); record(w, true, run.mode, first); done(true);
        var praise = pick(SB_PRAISE.right) + (S.stats.streak >= 3 && S.stats.streak % 5 === 0 ? " " + S.stats.streak + " " + pick(SB_PRAISE.streak) : "");
        $("fb").innerHTML = '<span class="yay">' + praise + "</span>";
        buzz(praise, "wow", false);
        say(praise).then(function () { setTimeout(onNav(nextWord), 300); });
        return;
      }
      tries++;
      boxes("diff"); sfx.boop();
      if (tries < maxTries) {
        var close = typed.length === w.w.length && w.w.split("").filter(function (c, i) { return norm(c) !== norm(typed[i]); }).length === 1;
        $("fb").innerHTML = '<span class="hmm">' + (close ? pick(SB_PRAISE.close) : "Not quite! Green letters are right.") + " Try again!</span>";
        say(close ? "So close! Try again." : "Not quite. Try again.");
        setTimeout(onNav(function () { typed = ""; boxes(); }), 1600);
        return;
      }
      record(w, false, run.mode); done(false);
      if (isTest) {
        $("fb").innerHTML = '<span class="hmm">The right spelling is <b>' + esc(w.w) + '</b>.</span><button class="big-btn go" id="hNext">Next ▶</button>';
        $("hNext").onclick = nextWord; spellOut(w.w); return;
      }
      // Show the word, spell it out loud, then the child types it once to lock it in.
      $("fb").innerHTML = '<span class="hmm">' + pick(SB_PRAISE.oops) + ' It\'s spelled <b class="reveal">' + esc(w.w) + "</b>. Type it once to remember it!</span>";
      spellOut(w.w);
      copying = true; typed = ""; setTimeout(onNav(function () { boxes(); KB.target = onKey; }), 600);
    }
    wireKeyboard(onKey);
  }

  /* ---------------- 5. Bee Contest (stage, 3 hearts) ---------------- */
  function renderContest() {
    var w = run.words[run.i], typed = "", asked = 0;
    $("topTitle").textContent = "Bee Contest · " + run.title;
    view.innerHTML = '<div class="stage">' +
        '<div class="lights" aria-hidden="true"><i></i><i></i><i></i></div>' +
        '<div class="stage-top"><span class="hearts">' + [0, 1, 2].map(function (h) { return h < run.hearts ? "❤️" : "🤍"; }).join("") + "</span>" +
          '<span class="round">Round ' + (run.i + 1) + " of " + run.words.length + "</span></div>" +
        '<div class="judges" aria-hidden="true"><span>🦉</span><span>🐞</span><span>🐢</span></div>' +
        '<div class="podium"><div class="pronouncer">🐝<small>Buzzy, the pronouncer</small></div><div class="bubble stage-bubble" id="buzzSay">Your word is…</div></div>' +
        '<div class="ask-row"><button class="tool" id="cAgain">🔁 Say it again</button><button class="tool" id="cSlow">🐌 Slowly</button>' +
          (w.d ? '<button class="tool" id="cDef">📖 Definition</button>' : "") + (w.s ? '<button class="tool" id="cSent">💬 Sentence</button>' : "") + "</div>" +
        '<div class="mic-line"><span class="mic">🎤</span><span class="typed" id="typed"></span></div>' +
      "</div>" + '<div class="feedback" id="fb"></div>' + keyboardHtml(extrasFor(run.words));
    function draw() { $("typed").innerHTML = typed ? typed.split("").map(function (c) { return "<b>" + esc(c === " " ? "␣" : c.toUpperCase()) + "</b>"; }).join("") : '<span class="ph">Type your spelling, then ✔</span>'; }
    draw();
    function line(t, speak) { $("buzzSay").textContent = t; if (speak !== false) return say(t); return Promise.resolve(true); }
    line("Your word is: " + w.w + ".");
    $("cAgain").onclick = function () { asked++; line(w.w + "."); };
    $("cSlow").onclick = function () { asked++; say(w.w, 0.45); };
    if ($("cDef")) $("cDef").onclick = function () { asked++; line("Definition: " + w.d); };
    if ($("cSent")) $("cSent").onclick = function () { asked++; $("buzzSay").innerHTML = "“" + hideWord(w.s, w) + "”"; say(w.s); };
    wireKeyboard(function (k) {
      if (k === "⌫") { typed = typed.slice(0, -1); draw(); return; }
      if (k === "⏎") { if (typed.trim()) judge(); return; }
      if (typed.length < 40) { typed += k; draw(); }
    });
    function judge() {
      KB.target = null;
      var ok = norm(typed) === norm(w.w) || (w.alt && norm(typed) === norm(w.alt));
      run.results[run.i] = { ok: ok, first: ok, w: w, typed: typed };
      record(w, ok, "contest", ok);
      view.querySelectorAll(".ask-row button").forEach(function (b) { b.disabled = true; });
      if (ok) {
        run.right++; run.first++; addPoints(3); sfx.bell(); confetti(14);
        var p = pick(SB_PRAISE.right);
        $("fb").innerHTML = '<span class="yay">🔔 Ding! That is correct! ' + p + "</span>";
        line("That is correct! " + p).then(function () { setTimeout(onNav(nextWord), 300); });
      } else {
        run.hearts--; sfx.buzz();
        $("fb").innerHTML = '<span class="hmm">The correct spelling is <b class="reveal">' + esc(w.w) + "</b>." + (run.hearts ? " You still have " + run.hearts + (run.hearts === 1 ? " heart" : " hearts") + "!" : "") + "</span>" +
          '<button class="big-btn go" id="cNext">' + (run.hearts ? "Next word ▶" : "See my results") + "</button>";
        view.querySelector(".hearts").innerHTML = [0, 1, 2].map(function (h) { return h < run.hearts ? "❤️" : "🤍"; }).join("");
        line("I'm sorry, that is not correct.", true).then(function (still) { if (still) spellOut(w.w); });
        $("cNext").onclick = function () { if (!run.hearts) finish(); else nextWord(); };
      }
    }
  }

  /* ---------------- results ---------------- */
  function finish() {
    var n = run.results.filter(Boolean).length, total = run.mode === "contest" ? n : run.words.length;
    var score = run.mode === "learn" ? total : run.first, pct = total ? Math.round(100 * score / total) : 0;
    var loot = [], win = false;
    if (window.Tracker) Tracker.complete(run.mode, score, total, { item: run.title, right: run.right });
    if (run.mode === "contest") {
      win = run.hearts > 0 && n === run.words.length;
      if (win) { trophy("bee-winner"); addPoints(10); loot.push("🍯 +10 honey"); }
      if (win && run.src.kind === "grand") {
        var L = listById(run.src.list);
        if (giveSticker("grand:" + L.id, "🏆", L.grade + " Grand Bee champion")) loot.push("🏆 Grand Bee sticker");
        if (L.mine) trophy("bee-champion");
      }
    }
    if (run.mode === "daily" && S.daily.indexOf(dayKey()) < 0) {
      S.daily.push(dayKey()); store(K.daily, S.daily); giveTicket(); addPoints(5); loot.push("🎟️ +1 Prize Wheel ticket", "🍯 +5 honey");
      if (S.daily.length >= 3) trophy("daily-3");
    }
    if (run.mode === "jar" && run.src.startN >= 5 && !S.jar.length) trophy("jar-empty");
    if (run.mode === "test") {
      var t = S.tests[run.src.id] || { best: 0, tries: 0 };
      var firstAce = pct === 100 && t.best < 100;
      t.tries++; t.last = pct; t.best = Math.max(t.best, pct); t.t = Date.now();
      t.missed = run.results.filter(function (r) { return r && !r.first; }).map(function (r) { return r.w.w; });
      S.tests[run.src.id] = t; store(K.tests, S.tests);
      if (pct === 100) trophy("test-ace");
      if (firstAce) { giveTicket(); addPoints(10); loot.push("🎟️ +1 Prize Wheel ticket", "🍯 +10 honey"); }
    }
    current = { screen: "done" };
    go("done", { pct: pct, score: score, total: total, loot: loot, win: win });
  }
  function renderDone(a) {
    var stars = run.mode === "learn" ? 3 : a.pct >= 90 ? 3 : a.pct >= 70 ? 2 : a.pct > 0 ? 1 : 0;
    var contest = run.mode === "contest", head, emoji;
    if (contest) { emoji = a.win ? "👑" : "🎤"; head = a.win ? "You won the Bee Contest!" : "What a brave speller!"; }
    else if (run.mode === "learn") { emoji = "📖"; head = "You learned " + a.total + " words!"; }
    else { emoji = stars === 3 ? "🏆" : stars === 2 ? "🌟" : "💪"; head = stars === 3 ? "Bee-autiful spelling!" : stars === 2 ? "Great buzzing!" : "Good practice!"; }
    var list = run.mode === "learn" ? "" : '<div class="result-list">' + run.results.map(function (r) {
      if (!r) return "";
      return '<button class="res ' + (r.first ? "ok" : r.ok ? "meh" : "bad") + '" data-say="' + esc(r.w.w) + '"><span>' + (r.first ? "✅" : r.ok ? "🟡" : "❌") + "</span><b>" + esc(r.w.w) + "</b>" +
        (r.typed && !r.ok ? "<small>you wrote “" + esc(r.typed) + "”</small>" : "") + "</button>";
    }).join("") + "</div>";
    view.innerHTML = '<div class="celebrate">' + '<div class="big-emoji">' + emoji + "</div><h2>" + head + "</h2>" +
      (run.mode === "learn" ? "" : '<p class="score">' + a.score + " of " + a.total + (contest ? " words spelled" : " right on the first try") + "</p>") +
      '<div class="stars">' + [1, 2, 3].map(function (s) { return '<span class="' + (s <= stars ? "on" : "") + '">★</span>'; }).join("") + "</div>" +
      (a.loot.length ? '<p class="loot">' + a.loot.join(" · ") + "</p>" : "") +
      list +
      '<div class="done-actions"><button class="big-btn go" id="dAgain">🔁 Play again</button>' + nextModeBtn() + '<button class="big-btn alt" id="dBack">🐝 Back</button></div></div>';
    view.querySelectorAll("[data-say]").forEach(function (b) { b.onclick = function () { spellOut(b.dataset.say); }; });
    $("dAgain").onclick = function () { start(run.mode, run.mode === "learn" ? run.words : shuffle(run.words), run.src, run.title); };
    $("dBack").onclick = back;
    if ($("dNext")) $("dNext").onclick = function () { var m = $("dNext").dataset.next; start(m, m === "learn" ? run.words : shuffle(run.words), run.src, run.title); };
    if (stars === 3 || a.win) { sfx.fanfare(); confetti(80); } else sfx.ding();
    var msg = contest ? (a.win ? "Ding ding ding! You are the champion of this bee!" : "You spelled " + a.score + " words on stage. Champions keep practising!")
      : run.mode === "learn" ? "Great studying! Now try the games to lock the words in." : head + " You got " + a.score + " of " + a.total + " on the first try.";
    say(msg);
  }
  function nextModeBtn() {
    var order = run.src.kind === "test" ? ["learn", "scramble", "test", "contest"] : ["learn", "missing", "scramble", "spell", "contest"];
    var i = order.indexOf(run.mode);
    if (i < 0 || i + 1 >= order.length || run.src.kind === "daily" || run.src.kind === "jar" || run.src.kind === "grand") return "";
    var m = order[i + 1];
    return '<button class="big-btn go2" id="dNext" data-next="' + m + '">Next: ' + MODE_NAME[m] + " ▶</button>";
  }

  /* ---------------- stickers & trophies ---------------- */
  function renderStickers() {
    $("topTitle").textContent = "My Stickers";
    var html = LISTS.map(function (L) {
      return '<h3 class="stk-h">' + L.emoji + " " + L.grade + "</h3><div class=\"stk-grid\">" + L.combs.map(function (_, ci) {
        var got = S.stickers.some(function (s) { return s.id === "comb:" + L.id + ":" + ci; });
        return '<div class="stk' + (got ? " got" : "") + '"><span>' + (got ? SB_STICKERS[combStickerIdx(L, ci)] : "⬡") + "</span><small>Comb " + (ci + 1) + "</small></div>";
      }).join("") + (function () {
        var got = S.stickers.some(function (s) { return s.id === "grand:" + L.id; });
        return '<div class="stk badge' + (got ? " got" : "") + '"><span>' + (got ? "🏆" : "🎤") + "</span><small>Grand Bee</small></div>";
      })() + "</div>";
    }).join("");
    view.innerHTML = buzzyRow("Fill a honeycomb to win its sticker. Win a Grand Bee for a golden trophy sticker!", "happy") + html;
    buzz($("buzzSay").textContent, "happy");
  }
  function renderTrophies() {
    $("topTitle").textContent = "My Trophies";
    view.innerHTML = buzzyRow("You have " + S.trophies.length + " of " + SB_TROPHIES.length + " trophies. Keep buzzing!", "happy") +
      '<div class="trophy-grid">' + SB_TROPHIES.map(function (t) {
        var got = S.trophies.indexOf(t.id) >= 0;
        return '<div class="trophy' + (got ? " got" : "") + '"><span class="te">' + (got ? t.icon : "🔒") + "</span><b>" + esc(t.name) + "</b><small>" + esc(t.desc) + "</small></div>";
      }).join("") + "</div>";
    buzz($("buzzSay").textContent, "happy");
  }

  /* ---------------- boot ---------------- */
  $("backBtn").onclick = back;
  $("stkPill").onclick = function () { go("stickers"); };
  $("trophyBtn").onclick = function () { go("trophies"); };
  $("muteBtn").onclick = function () { S.mute = !S.mute; store(K.mute, S.mute); hush(); hud(); };
  window.addEventListener("storage", function (e) { if (e.key && e.key.indexOf("hub_spellbee") >= 0 && current.screen === "home") renderHome(); });
  hud();
  go("home");
  window.SpellBeeApp = { lists: LISTS, state: S, start: start, go: go, run: function () { return run; } };   // for tests
})();
