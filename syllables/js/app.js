/* ============================================================
   Bongo's Syllable Beats — app
   ------------------------------------------------------------
   Track: #kg or #g3, else the learner's grade (Pre-K–G2 → kg,
   G3+ → g3). A logged-in learner sees only their own track.

   Lesson = 1 Learn (clap-along word cards with a fun note, then a
   memory trick and a joke) → 2 Quiz (mixed games, 2 tries each)
   → 3 Read to Bongo (mic, graded by ../js/readlevel.js; helper
   buttons when there is no mic) → 4 Party (stars, sticker, joke
   saved in the Joke Box). Lessons open in order, easy → grade
   level; the last one is the Beat Master Challenge (8 of 10 first
   try → trophy, a $1 challenge in js/dollars.js).

   Storage (per learner via profile-store):
     sy_points  number          sy_lessons {id:{done,stars,best}}
     sy_stickers [lesson id]    sy_trophies [kg-master|g3-master|kg-allstars|g3-allstars]
     sy_jokes   [lesson id]     sy_stats {answered, first, reads}
     sy_mute    "1"|"0"         rl_syllables (ReadLevel)
   ============================================================ */
(function () {
  "use strict";

  var D = window.SY_DATA, APP = "syllables";
  var K = { pts: "sy_points", les: "sy_lessons", stk: "sy_stickers", tro: "sy_trophies", jokes: "sy_jokes", stats: "sy_stats", mute: "sy_mute" };
  var $ = function (id) { return document.getElementById(id); };
  var view = $("view");

  function get(k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } }
  function put(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  /* ---------------- learner & track ---------------- */
  function kid() {
    try {
      var id = localStorage.getItem("hub_activeKid"), kids = JSON.parse(localStorage.getItem("hub_kids") || "[]");
      for (var i = 0; i < kids.length; i++) if (String(kids[i].id) === String(id)) return kids[i];
    } catch (e) {}
    return null;
  }
  var ME = kid();
  function trackFor() {
    var h = (/^#?(kg|g3)\b/.exec(location.hash) || [])[1];
    if (h) return h;
    var g = ME && ME.grade;
    return !g || ["pk", "kg", "g1", "g2"].indexOf(g) >= 0 ? (g ? "kg" : "g3") : "g3";
  }
  var TRACK = trackFor(), T = D.tracks[TRACK], KGT = TRACK === "kg";
  // all the words of this track (the challenge and distractors use them)
  var ALLW = [];
  T.lessons.forEach(function (L) { L.words.forEach(function (w) { ALLW.push(w); }); });
  function parts(w) { return w.w.split("-"); }
  function plain(w) { return w.w.replace(/-/g, ""); }
  function wordsOf(L) { return L.master ? ALLW : L.words; }

  var S = {
    points: +get(K.pts, 0) || 0, lessons: get(K.les, {}) || {}, stickers: get(K.stk, []) || [],
    trophies: get(K.tro, []) || [], jokes: get(K.jokes, []) || [], stats: get(K.stats, {}) || {},
    mute: localStorage.getItem(K.mute) === "1"
  };
  function save() {
    put(K.pts, S.points); put(K.les, S.lessons); put(K.stk, S.stickers); put(K.tro, S.trophies); put(K.jokes, S.jokes); put(K.stats, S.stats);
  }
  function addPoints(n) { S.points += n; put(K.pts, S.points); hud(); }
  function stat(k, n) { S.stats[k] = (S.stats[k] || 0) + (n || 1); put(K.stats, S.stats); }

  /* ---------------- voice & sound ---------------- */
  var speakToken = 0;
  function say(text, rate) {
    if (S.mute || !window.speechSynthesis || !text) return Promise.resolve(true);
    var my = ++speakToken;
    speechSynthesis.cancel();
    return new Promise(function (res) {
      var t = String(text).replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}]/gu, "");
      var u = new SpeechSynthesisUtterance(t), done = false;
      u.lang = "en-US"; u.rate = rate || (KGT ? 0.88 : 0.95); u.pitch = 1.1;
      function fin() { if (!done) { done = true; res(my === speakToken); } }
      u.onend = fin; u.onerror = fin;
      setTimeout(fin, 1500 + t.length * 90);
      speechSynthesis.speak(u);
    });
  }
  function hush() { speakToken++; if (window.speechSynthesis) speechSynthesis.cancel(); }
  var actx = null;
  function tone(freqs, dur, type, gap, vol) {
    if (S.mute) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      freqs.forEach(function (f, i) {
        var o = actx.createOscillator(), g = actx.createGain(), t = actx.currentTime + i * (gap || 0.1);
        o.type = type || "sine"; o.frequency.setValueAtTime(f, t);
        if (type === "drum") { o.type = "sine"; o.frequency.exponentialRampToValueAtTime(f * 0.45, t + dur); }
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol || 0.16, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        o.connect(g); g.connect(actx.destination); o.start(t); o.stop(t + dur + 0.05);
      });
    } catch (e) {}
  }
  var sfx = {
    drum: function () { tone([180], 0.22, "drum", 0, 0.35); },
    ding: function () { tone([880, 1320], 0.22, "triangle", 0.09); },
    tap: function () { tone([660], 0.05); },
    boop: function () { tone([320, 250], 0.18, "sine", 0.12); },
    fanfare: function () { tone([523, 659, 784, 1047], 0.3, "triangle", 0.13); }
  };
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  /* Clap a word: light each syllable chip with a drum beat and say it,
     then say the whole word. Chips are [data-i] inside `box`. */
  var clapping = 0;
  function clapWord(w, box, opt) {
    opt = opt || {};
    var my = ++clapping, P = parts(w), sayP = w.say || P, chips = box ? box.querySelectorAll("[data-i]") : [];
    hush();
    var chain = Promise.resolve(true);
    P.forEach(function (p, i) {
      chain = chain.then(function (go) {
        if (!go || my !== clapping) return false;
        chips.forEach(function (c) { c.classList.toggle("lit", +c.getAttribute("data-i") === i); });
        sfx.drum(); bongo("clap");
        return opt.silent ? wait(520).then(function () { return my === clapping; }) :
          wait(120).then(function () { return say(sayP[i], 0.8); }).then(function (r) { return wait(140).then(function () { return r && my === clapping; }); });
      });
    });
    return chain.then(function (go) {
      chips.forEach(function (c) { c.classList.remove("lit"); });
      if (!go || my !== clapping) return false;
      if (box) { box.classList.add("whole"); setTimeout(function () { box.classList.remove("whole"); }, 900); }
      return opt.noWhole ? true : say(plain(w), 0.9);
    });
  }

  /* ---------------- Bongo ---------------- */
  function bongoRow(msg) {
    return '<div class="bongo-row"><div class="bongo" id="bongo" aria-hidden="true"><span>🐒</span><i>🥁</i></div>' +
      '<div class="bubble" id="bongoSay" role="status" aria-live="polite">' + esc(msg || "") + "</div></div>";
  }
  function bongo(mood) {
    var b = $("bongo"); if (!b) return;
    b.className = "bongo " + (mood || ""); void b.offsetWidth; b.classList.add("bop");
  }
  function talk(msg, mood, speak) {
    var b = $("bongoSay"); if (b) b.textContent = msg;
    bongo(mood);
    return speak === false ? Promise.resolve(true) : say(msg);
  }

  /* ---------------- top bar, toast, confetti ---------------- */
  function hud() {
    $("ptsPill").textContent = "⭐ " + S.points;
    $("stkPill").textContent = "🎟️ " + S.stickers.length;
    $("muteBtn").textContent = S.mute ? "🔇" : "🔊";
  }
  var toastT = 0;
  function toast(msg) { var t = $("toast"); t.textContent = msg; t.classList.add("show"); clearTimeout(toastT); toastT = setTimeout(function () { t.classList.remove("show"); }, 2400); }
  function confetti(n) {
    var box = $("confetti"), bits = ["⭐", "🥁", "👏", "✨", "🎵", "🍌", "💛"];
    for (var i = 0; i < n; i++) {
      var s = document.createElement("span"); s.textContent = pick(bits);
      s.style.left = Math.random() * 100 + "vw"; s.style.animationDelay = Math.random() * 0.6 + "s"; s.style.fontSize = 14 + Math.random() * 20 + "px";
      box.appendChild(s); setTimeout(function (x) { x.remove(); }.bind(null, s), 2900);
    }
  }
  function popup(html, onClose) {
    var d = document.createElement("div");
    d.className = "veil"; d.innerHTML = '<div class="pop">' + html + '<button class="btn go big" data-close>OK!</button></div>';
    document.body.appendChild(d);
    d.addEventListener("click", function (e) {
      if (e.target === d || e.target.hasAttribute("data-close")) { d.remove(); if (onClose) onClose(); }
    });
    return d;
  }

  /* ---------------- word pieces (HTML) ---------------- */
  var COLORS = ["c0", "c1", "c2", "c3"];
  function chips(w, opt) {
    opt = opt || {};
    return '<div class="chips' + (opt.big ? " big" : "") + '" data-word="' + esc(w.w) + '">' + parts(w).map(function (p, i) {
      return '<button class="chip ' + COLORS[i % 4] + '" data-i="' + i + '" title="Hear this beat">' + esc(p) + "</button>";
    }).join('<span class="dot" aria-hidden="true">•</span>') + "</div>";
  }
  function claps(n) { return new Array(n + 1).join("👏"); }
  // tapping one chip says just that beat
  function bindChips(box, w) {
    box.querySelectorAll("[data-i]").forEach(function (c) {
      c.onclick = function () { var i = +c.getAttribute("data-i"); sfx.drum(); bongo("clap"); c.classList.add("lit"); setTimeout(function () { c.classList.remove("lit"); }, 400); say((w.say || parts(w))[i], 0.8); };
    });
  }

  /* ============================================================
     HOME
     ============================================================ */
  function unlocked(i) { return i === 0 || !!(S.lessons[T.lessons[i - 1].id] || {}).done || !!(S.lessons[T.lessons[i].id] || {}).done; }
  function home() {
    hush(); clapping++; Listener && Listener.stop && Listener.stop();
    setTop(T.name, false);
    var name = ME ? ME.name : "", done = T.lessons.filter(function (L) { return (S.lessons[L.id] || {}).done; }).length;
    var hello = (name ? "Hi " + name + "! " : "Hi! ") + (KGT ? "I'm Bongo! Words have beats, like my drum. Let's clap them!" : "I'm Bongo! Let's chop big words into beats so they are easy to read!");
    var html = bongoRow(hello) +
      '<div class="home-top"><div class="meter"><b>' + done + " of " + T.lessons.length + ' lessons</b><div class="bar"><i style="width:' + Math.round(100 * done / T.lessons.length) + '%"></i></div></div>' +
        '<div class="home-btns">' + ReadLevel.chip(APP) + '<button class="btn" id="jokeBox">😂 Joke Box <span class="badge">' + jokesHere().length + "</span></button></div></div>" +
      (ME ? "" : '<nav class="track-bar" aria-label="Choose a grade"><a class="track' + (KGT ? " on" : "") + '" href="#kg">🐣 Kindergarten</a><a class="track' + (!KGT ? " on" : "") + '" href="#g3">🎒 Grade 3</a></nav>') +
      '<ol class="path">' + T.lessons.map(function (L, i) {
        var r = S.lessons[L.id] || {}, open = unlocked(i);
        return '<li><button class="lesson' + (r.done ? " done" : "") + (L.master ? " master" : "") + '" data-l="' + i + '"' + (open ? "" : " disabled") + ">" +
          '<span class="l-num">' + (open ? (i + 1) : "🔒") + '</span><span class="l-emoji">' + L.emoji + "</span>" +
          '<span class="l-text"><b>' + esc(L.title) + "</b><small>" + (L.master ? "The big challenge!" : levelTag(i)) + "</small></span>" +
          '<span class="l-stars">' + (r.done ? "⭐".repeat(r.stars || 1) + "☆".repeat(3 - (r.stars || 1)) : open ? "▶️" : "") + "</span></button></li>";
      }).join("") + "</ol>";
    view.innerHTML = html;
    talk(hello, "", true);
    ReadLevel.bind(view, APP, function (L) { toast(L.emoji + " " + L.name + " level"); home(); });
    $("jokeBox").onclick = jokeBox;
    view.querySelectorAll("[data-l]").forEach(function (b) { b.onclick = function () { sfx.tap(); startLesson(+b.getAttribute("data-l")); }; });
  }
  function levelTag(i) {
    var n = T.lessons.length - 1, f = i / Math.max(1, n - 1);
    return f < 0.3 ? "🐣 Easy" : f < 0.6 ? "🧭 Medium" : f < 0.9 ? "⭐ Hard" : "🏆 Grade level";
  }
  function setTop(title, back) {
    $("topTitle").textContent = title;
    $("backBtn").hidden = !back;
  }

  /* ---------------- Joke Box ---------------- */
  function jokesHere() { return T.lessons.filter(function (L) { return S.jokes.indexOf(L.id) >= 0; }); }
  function jokeBox() {
    var list = jokesHere();
    var html = "<h2>😂 Bongo's Joke Box</h2>" + (list.length ? "<p>Tap a joke to see the funny part!</p>" + list.map(function (L) {
      return '<button class="joke" data-j="' + L.id + '"><span class="j-q">' + L.emoji + " " + esc(L.joke.q) + '</span><span class="j-a" hidden>' + esc(L.joke.a) + "</span></button>";
    }).join("") : "<p>Finish a lesson to put its joke in the box! 🎁</p>") +
      '<p class="small">' + list.length + " of " + T.lessons.length + " jokes collected</p>";
    var d = popup(html);
    d.querySelectorAll("[data-j]").forEach(function (b) {
      b.onclick = function () {
        var a = b.querySelector(".j-a"), q = b.querySelector(".j-q").textContent;
        if (a.hidden) { a.hidden = false; say(q).then(function (ok) { if (ok) { tone([500, 700, 600, 900], 0.12, "square", 0.09, 0.05); say(a.textContent); } }); }
        else say(a.textContent);
      };
    });
  }

  /* ============================================================
     LESSON
     ============================================================ */
  var R = null;     // the running lesson
  var STEPS = ["👀 Learn", "🎯 Quiz", "🎤 Read", "🎉 Party"];
  function stepper(n) {
    return '<div class="steps">' + STEPS.map(function (s, i) { return '<span class="' + (i < n ? "done" : i === n ? "now" : "") + '">' + s + "</span>"; }).join("") + "</div>";
  }
  function startLesson(i) {
    var L = T.lessons[i];
    R = { i: i, L: L, k: 0, q: 0, first: 0, total: 0, qs: [], reads: [], ri: 0, readOK: 0 };
    setTop(L.emoji + " " + L.title, true);
    if (window.Tracker && Tracker.log) Tracker.log("lesson", "start", { item: L.title, track: TRACK });
    if (L.master) { masterIntro(); return; }
    learn();
  }

  /* ---------- 1 Learn ---------- */
  function learn() {
    var L = R.L, w = L.words[R.k], last = R.k === L.words.length - 1;
    view.innerHTML = stepper(0) + bongoRow(R.k === 0 ? L.intro : "Listen and clap with me: " + plain(w) + "!") +
      '<div class="card word-card">' +
        '<div class="w-count">Word ' + (R.k + 1) + " of " + L.words.length + "</div>" +
        '<div class="w-pic" aria-hidden="true">' + w.e + "</div>" +
        chips(w, { big: true }) +
        '<div class="w-beats" id="beats">' + claps(parts(w).length) + " <b>" + parts(w).length + (parts(w).length === 1 ? " beat" : " beats") + "</b></div>" +
        '<div class="fun-note"><span>💡</span> ' + esc(w.fun) + "</div>" +
        '<div class="row"><button class="btn go big" id="clapIt">👏 Clap it with me</button></div>' +
      "</div>" +
      '<div class="row nav"><button class="btn ghost" id="prevW"' + (R.k ? "" : " disabled") + '>⬅ Back</button>' +
        '<button class="btn go big" id="nextW">' + (last ? "Memory trick ➜" : "Next word ➜") + "</button></div>";
    var box = view.querySelector(".chips");
    bindChips(box, w);
    $("clapIt").onclick = function () { clapWord(w, box); };
    $("prevW").onclick = function () { R.k--; learn(); };
    $("nextW").onclick = function () { clapping++; if (last) trick(); else { R.k++; learn(); } };
    var intro = R.k === 0 ? say(L.intro) : Promise.resolve(true);
    intro.then(function (ok) { if (ok && document.body.contains(box)) clapWord(w, box); });
  }
  function trick() {
    var L = R.L;
    view.innerHTML = stepper(0) + bongoRow("Here's a trick to remember it!") +
      '<div class="card trick-card"><h3>🧠 Memory Trick</h3><p>' + esc(L.trick) + "</p>" +
        (L.rule ? '<p class="rule"><b>The rule:</b> ' + esc(L.rule) + "</p>" : "") + "</div>" +
      '<div class="card joke-card"><h3>😂 Bongo\'s Joke Drum</h3><p class="j-q">' + esc(L.joke.q) + '</p>' +
        '<button class="btn" id="punch">🥁 Tap the drum for the answer!</button><p class="j-a" id="jA" hidden>' + esc(L.joke.a) + "</p></div>" +
      '<div class="row nav"><button class="btn ghost" id="backW">⬅ Words</button><button class="btn go big" id="toQuiz">🎯 Start the quiz!</button></div>';
    say("Memory trick! " + L.trick);
    $("punch").onclick = function () {
      sfx.drum(); setTimeout(sfx.drum, 160); setTimeout(function () { tone([500, 700, 600, 900], 0.12, "square", 0.09, 0.05); }, 320);
      $("jA").hidden = false; $("punch").hidden = true; bongo("laugh");
      say(L.joke.q).then(function (ok) { if (ok) say(L.joke.a); });
    };
    $("backW").onclick = function () { R.k = L.words.length - 1; learn(); };
    $("toQuiz").onclick = startQuiz;
  }
  function masterIntro() {
    var L = R.L;
    view.innerHTML = stepper(1) + bongoRow(L.intro) +
      '<div class="card trick-card"><h3>🏆 ' + esc(L.title) + "</h3><p>" + L.quiz.length + " questions with words from every lesson. Get " + passMark(L) + " right on the first try to win the trophy!</p>" +
        '<p class="rule"><b>Remember:</b> ' + esc(L.trick) + "</p></div>" +
      '<div class="row nav"><button class="btn go big" id="toQuiz">🥁 I\'m ready!</button></div>';
    say(L.intro);
    $("toQuiz").onclick = startQuiz;
  }
  function passMark(L) { return Math.ceil(L.quiz.length * 0.8); }

  /* ---------- 2 Quiz ---------- */
  function multi(list) { return list.filter(function (w) { return parts(w).length > 1; }); }
  function makeQuestion(kind, used) {
    var pool = wordsOf(R.L);
    function fresh(list) { var f = list.filter(function (w) { return used.indexOf(w.w) < 0; }); return f.length ? f : list; }
    var w;
    if (kind === "jumble" || kind === "missing" || kind === "chop" || kind === "rule") {
      var m = multi(pool); if (!m.length) kind = "count"; else w = pick(fresh(m));
    }
    if (kind === "pick") {
      // the target has a beat count no other option has
      var cand = shuffle(fresh(pool));
      for (var c = 0; c < cand.length; c++) {
        var n = parts(cand[c]).length, others = shuffle(ALLW.filter(function (x) { return parts(x).length !== n; }));
        var o2 = [], seen = {};
        others.forEach(function (x) { var k = parts(x).length; if (o2.length < 2 && !seen[k]) { seen[k] = 1; o2.push(x); } });
        if (o2.length < 2) o2 = others.slice(0, 2);
        if (o2.length === 2) return { kind: "pick", w: cand[c], n: n, opts: shuffle([cand[c]].concat(o2)) };
      }
      kind = "count";
    }
    if (kind === "build") {
      var two = shuffle(fresh(multi(pool))), sel = [], firsts = {}, lasts = {};
      two.concat(shuffle(multi(ALLW))).forEach(function (x) {
        var P = parts(x), f = P.slice(0, -1).join(""), l = P[P.length - 1];
        if (sel.length < 3 && !firsts[f] && !lasts[l]) { firsts[f] = lasts[l] = 1; sel.push(x); }
      });
      if (sel.length === 3) return { kind: "build", ws: sel, w: sel[0] };
      kind = "count";
    }
    if (!w) w = pick(fresh(pool));
    var q = { kind: kind, w: w };
    if (kind === "count") q.n = parts(w).length;
    if (kind === "missing") {
      var P = parts(w), at = Math.floor(Math.random() * P.length), wrong = [];
      shuffle(ALLW).forEach(function (x) { parts(x).forEach(function (p) { if (wrong.length < 2 && p !== P[at] && wrong.indexOf(p) < 0 && P.indexOf(p) < 0 && p.length > 1) wrong.push(p); }); });
      q.at = at; q.opts = shuffle([P[at]].concat(wrong));
    }
    if (kind === "rule") q.opts = shuffle([w.w].concat(wrongSplits(w)));
    return q;
  }
  // two believable wrong chops: move one cut a letter left or right
  function wrongSplits(w) {
    var s = plain(w), cuts = cutsOf(w), out = [];
    shuffle(cuts.map(function (c, i) { return i; })).forEach(function (i) {
      [-1, 1].forEach(function (d) {
        var c2 = cuts.slice(); c2[i] += d;
        var ok = c2[i] > 0 && c2[i] < s.length && c2.every(function (x, j) { return j === 0 || x > c2[j - 1]; });
        var str = ok ? splitAt(s, c2) : null;
        if (ok && str !== w.w && out.indexOf(str) < 0 && out.length < 2) out.push(str);
      });
    });
    return out;
  }
  function cutsOf(w) { var P = parts(w), at = 0, c = []; for (var i = 0; i < P.length - 1; i++) { at += P[i].length; c.push(at); } return c; }
  function splitAt(s, cuts) { var out = [], a = 0; cuts.forEach(function (c) { out.push(s.slice(a, c)); a = c; }); out.push(s.slice(a)); return out.join("-"); }

  function startQuiz() {
    hush(); clapping++;
    var used = [];
    R.qs = R.L.quiz.map(function (kind) { var q = makeQuestion(kind, used); used.push(q.w.w); return q; });
    R.q = 0; R.first = 0; R.total = R.qs.length;
    ask();
  }
  function quizFrame(prompt, body) {
    var q = R.qs[R.q];
    view.innerHTML = stepper(1) + '<div class="q-top"><span>Question ' + (R.q + 1) + " of " + R.total + '</span><div class="bar"><i style="width:' + Math.round(100 * R.q / R.total) + '%"></i></div></div>' +
      bongoRow(prompt) + '<div class="card q-card q-' + q.kind + '">' + body + "</div>" + '<div class="row nav" id="qNav"></div>';
  }
  function hearBtn() { return '<button class="btn hear" id="hearW">🔊 Hear it</button>'; }
  function ask() {
    var q = R.qs[R.q]; q.tries = 0;
    var w = q.w, word = plain(w), pic = '<div class="w-pic sm" aria-hidden="true">' + w.e + "</div>";
    if (q.kind === "count") {
      var max = Math.max(3, Math.min(4, q.n + 1));
      quizFrame("How many claps in " + word + "?", pic + '<div class="q-word">' + esc(word) + "</div>" + hearBtn() +
        '<div class="opts count-opts">' + [1, 2, 3, 4].slice(0, max).map(function (n) {
          return '<button class="opt" data-a="' + n + '"><span class="claps">' + claps(n) + "</span><b>" + n + "</b></button>";
        }).join("") + "</div>");
      say("How many claps in " + word + "?").then(function (ok) { if (ok) say(word, 0.8); });
      $("hearW").onclick = function () { say(word, 0.75); };
      bindOpts(function (a) { return +a === q.n; }, function () { return q.n + (q.n === 1 ? " clap: " : " claps: ") + w.w.replace(/-/g, " - "); });
    }
    else if (q.kind === "pick") {
      quizFrame("Which one has " + q.n + (q.n === 1 ? " clap?" : " claps?"),
        '<div class="q-word">' + claps(q.n) + "</div>" + '<div class="opts pick-opts">' + q.opts.map(function (o) {
          return '<div class="pick"><button class="opt" data-a="' + esc(o.w) + '"><span class="w-pic sm">' + o.e + "</span><b>" + esc(plain(o)) + '</b></button><button class="mini" data-say="' + esc(plain(o)) + '" title="Hear it">🔊</button></div>';
        }).join("") + "</div>");
      var line = "Which one has " + q.n + (q.n === 1 ? " clap? " : " claps? ") + q.opts.map(plain).join(", ") + "?";
      say(line);
      view.querySelectorAll("[data-say]").forEach(function (b) { b.onclick = function () { say(b.getAttribute("data-say"), 0.8); }; });
      bindOpts(function (a) { return a === w.w; }, function () { return word + " has " + q.n + (q.n === 1 ? " clap." : " claps: ") + (q.n > 1 ? w.w.replace(/-/g, " - ") : ""); });
    }
    else if (q.kind === "missing") {
      var P = parts(w);
      quizFrame("Which beat is missing?", pic + '<div class="chips big">' + P.map(function (p, i) {
          return i === q.at ? '<span class="chip blank" id="blank">?</span>' : '<span class="chip ' + COLORS[i % 4] + '">' + esc(p) + "</span>";
        }).join('<span class="dot">•</span>') + "</div>" + hearBtn() +
        '<div class="opts">' + q.opts.map(function (o) { return '<button class="opt syl" data-a="' + esc(o) + '"><b>' + esc(o) + "</b></button>"; }).join("") + "</div>");
      say("Which beat is missing in " + word + "?").then(function (ok) { if (ok) say(word, 0.8); });
      $("hearW").onclick = function () { clapWord(w, null); };
      bindOpts(function (a) { return a === P[q.at]; }, function () { $("blank").textContent = P[q.at]; $("blank").className = "chip " + COLORS[q.at % 4]; return word + ": " + w.w.replace(/-/g, " - "); });
    }
    else if (q.kind === "jumble") jumble(q);
    else if (q.kind === "chop") chop(q);
    else if (q.kind === "rule") {
      quizFrame("Which chop is right for " + word + "?", pic + '<div class="q-word">' + esc(word) + "</div>" + hearBtn() +
        '<div class="opts rule-opts">' + q.opts.map(function (o) {
          return '<button class="opt syl" data-a="' + esc(o) + '"><b>' + o.split("-").map(esc).join('<span class="cut">|</span>') + "</b></button>";
        }).join("") + "</div>" + (R.L.rule ? '<p class="rule-tip">💡 ' + esc(R.L.rule) + "</p>" : ""));
      say("Which chop is right for " + word + "?");
      $("hearW").onclick = function () { say(word, 0.75); };
      bindOpts(function (a) { return a === w.w; }, function () { return "It's " + w.w.replace(/-/g, " - ") + ". " + (ruleFor(w) || ""); });
    }
    else if (q.kind === "build") build(q);
  }
  function ruleFor(w) {
    for (var i = 0; i < T.lessons.length; i++) if (T.lessons[i].rule && T.lessons[i].words.indexOf(w) >= 0) return T.lessons[i].rule;
    return "";
  }

  // Multiple-choice options: right → praise; wrong → kind words + 1 more try, then show the answer.
  function bindOpts(isRight, explain) {
    var q = R.qs[R.q], btns = view.querySelectorAll(".opt[data-a]");
    btns.forEach(function (b) {
      b.onclick = function () {
        if (q.over) return;
        var a = b.getAttribute("data-a");
        if (isRight(a)) {
          b.classList.add("right"); btns.forEach(function (x) { x.disabled = true; });
          var msg = explain();
          right(msg);
        } else {
          b.classList.add("wrong"); b.disabled = true;
          wrong(function () { btns.forEach(function (x) { if (isRight(x.getAttribute("data-a"))) x.classList.add("right"); x.disabled = true; }); return explain(); });
        }
      };
    });
  }
  function right(msg) {
    var q = R.qs[R.q]; q.over = true;
    var first = q.tries === 0;
    if (first) { R.first++; stat("first"); }
    stat("answered");
    addPoints(first ? 3 : 1); sfx.ding(); confetti(first ? 16 : 8);
    if (window.Tracker) Tracker.answer(first, "Syllables: " + R.L.title, { word: plain(q.w), kind: q.kind });
    var p = pick(D.praise);
    talk(p + (msg ? " " + msg : ""), "happy", false);
    say(p + (msg ? " " + msg.replace(/ - /g, ", ") : ""));
    nextBtn();
  }
  // first miss: try again; second miss: show the answer kindly
  function wrong(reveal) {
    var q = R.qs[R.q];
    q.tries++; sfx.boop();
    if (q.tries < 2) {
      var k = D.kind[q.tries === 1 ? Math.floor(Math.random() * 3) : 3];
      talk(k + (q.kind === "count" || q.kind === "pick" ? " Clap along with me." : " Try one more time!"), "think");
      if (q.kind === "count" || q.kind === "missing") setTimeout(function () { clapWord(q.w, null, { noWhole: false }); }, 1400);
      return;
    }
    q.over = true; stat("answered");
    if (window.Tracker) Tracker.answer(false, "Syllables: " + R.L.title, { word: plain(q.w), kind: q.kind });
    var msg = reveal();
    talk(D.kind[3] + " " + msg, "think", false);
    say("Here's how it goes. " + msg.replace(/ - /g, ", "));
    nextBtn();
  }
  function nextBtn() {
    var last = R.q === R.total - 1;
    $("qNav").innerHTML = '<button class="btn go big" id="nextQ">' + (last ? (R.L.master ? "🏆 See my score" : "🎤 Read to Bongo ➜") : "Next ➜") + "</button>";
    $("nextQ").onclick = function () { hush(); clapping++; if (last) { if (R.L.master) finish(); else startRead(); } else { R.q++; ask(); } };
    $("nextQ").focus();
  }

  /* ---------- jumble cards ---------- */
  function jumble(q) {
    var w = q.w, P = parts(w), order = shuffle(P.map(function (p, i) { return i; }));
    if (order.every(function (x, i) { return x === i; })) order.reverse();
    var slots = [];
    quizFrame("Put the jumbled cards in order to make " + plain(w) + "!",
      '<div class="w-pic sm" aria-hidden="true">' + w.e + "</div>" + hearBtn() +
      '<div class="slots" id="slots">' + P.map(function (p, i) { return '<span class="slot" data-s="' + i + '"></span>'; }).join("") + "</div>" +
      '<div class="cards" id="cards">' + order.map(function (i) { return '<button class="jcard ' + COLORS[i % 4] + '" data-c="' + i + '">' + esc(P[i]) + "</button>"; }).join("") + "</div>" +
      '<p class="small">Tap the cards in order. Tap a card in a box to take it back.</p>');
    say("Put the cards in order to make " + plain(w) + "!");
    $("hearW").onclick = function () { clapWord(w, null); };
    function draw() {
      view.querySelectorAll(".slot").forEach(function (s, i) {
        var c = slots[i];
        s.innerHTML = c == null ? "" : '<button class="jcard ' + COLORS[c % 4] + '" data-back="' + i + '">' + esc(P[c]) + "</button>";
      });
      view.querySelectorAll("#cards .jcard").forEach(function (b) { b.classList.toggle("gone", slots.indexOf(+b.getAttribute("data-c")) >= 0); });
      view.querySelectorAll("[data-back]").forEach(function (b) { b.onclick = function () { if (q.over) return; slots[+b.getAttribute("data-back")] = null; compact(); draw(); }; });
    }
    function compact() { slots = slots.filter(function (x) { return x != null; }); }
    view.querySelectorAll("#cards .jcard").forEach(function (b) {
      b.onclick = function () {
        if (q.over || b.classList.contains("gone")) return;
        var c = +b.getAttribute("data-c");
        sfx.drum(); say(P[c], 0.8);
        slots.push(c); draw();
        if (slots.length === P.length) setTimeout(check, 350);
      };
    });
    function check() {
      var ok = slots.every(function (c, i) { return P[c] === P[i]; });
      if (ok) { $("slots").classList.add("right"); right(plain(w) + "! " + w.w.replace(/-/g, " - ")); setTimeout(function () { clapWord(w, $("slots")); }, 1600); }
      else {
        $("slots").classList.add("shake"); setTimeout(function () { var s = $("slots"); if (s) s.classList.remove("shake"); }, 500);
        wrong(function () { slots = P.map(function (p, i) { return i; }); draw(); $("slots").classList.add("right"); return plain(w) + " goes " + w.w.replace(/-/g, " - "); });
        if (!q.over) setTimeout(function () { slots = []; draw(); }, 700);
      }
    }
    draw();
  }

  /* ---------- chop the word (G3) ---------- */
  function chop(q) {
    var w = q.w, s = plain(w), need = cutsOf(w), mine = {};
    quizFrame("Chop " + s + " into " + parts(w).length + " beats! Tap between the letters.",
      '<div class="w-pic sm" aria-hidden="true">' + w.e + "</div>" + hearBtn() +
      '<div class="chop" id="chopRow">' + s.split("").map(function (ch, i) {
        return (i ? '<button class="gap" data-g="' + i + '" title="Chop here">✂️</button>' : "") + '<span class="let">' + esc(ch) + "</span>";
      }).join("") + "</div>" +
      '<p class="small">This word has <b>' + parts(w).length + " beats</b>, so make " + need.length + (need.length === 1 ? " chop." : " chops.") + "</p>" +
      (R.L.rule ? '<p class="rule-tip">💡 ' + esc(R.L.rule) + "</p>" : "") +
      '<div class="row"><button class="btn go big" id="chopCheck">✅ Check my chop</button></div>');
    say("Chop " + s + " into " + parts(w).length + " beats!");
    $("hearW").onclick = function () { say(s, 0.75); };
    view.querySelectorAll(".gap").forEach(function (g) {
      g.onclick = function () {
        if (q.over) return;
        var i = +g.getAttribute("data-g");
        if (mine[i]) delete mine[i]; else { mine[i] = 1; sfx.drum(); }
        g.classList.toggle("on", !!mine[i]);
      };
    });
    $("chopCheck").onclick = function () {
      if (q.over) return;
      var got = Object.keys(mine).map(Number).sort(function (a, b) { return a - b; });
      if (got.join() === need.join()) {
        $("chopCheck").hidden = true; $("chopRow").classList.add("right");
        right(w.w.replace(/-/g, " - "));
        setTimeout(function () { clapWord(w, null); }, 1600);
      } else {
        $("chopRow").classList.add("shake"); setTimeout(function () { var r = $("chopRow"); if (r) r.classList.remove("shake"); }, 500);
        var hint = got.length !== need.length ? " Count the chops: you need " + need.length + "." : "";
        if (q.tries === 0 && hint) { q.tries++; sfx.boop(); talk(pick(D.kind.slice(0, 3)) + hint, "think"); return; }
        wrong(function () {
          mine = {}; need.forEach(function (i) { mine[i] = 1; });
          view.querySelectorAll(".gap").forEach(function (g) { g.classList.toggle("on", !!mine[+g.getAttribute("data-g")]); });
          $("chopCheck").hidden = true; $("chopRow").classList.add("right");
          return "We chop it " + w.w.replace(/-/g, " - ") + ". " + (ruleFor(w) || "");
        });
      }
    };
  }

  /* ---------- match the halves (G3 build) ---------- */
  function build(q) {
    var ws = q.ws, L = ws.map(function (w, i) { var P = parts(w); return { i: i, t: P.slice(0, -1).join("-") }; }),
        Rt = shuffle(ws.map(function (w, i) { var P = parts(w); return { i: i, t: P[P.length - 1] }; })), sel = null, made = 0;
    quizFrame("Build 3 words! Tap a front chunk, then the chunk that finishes it.",
      '<div class="match"><div class="m-col" id="mL">' + L.map(function (x) {
        return '<button class="mcard c0" data-ml="' + x.i + '"><span>' + ws[x.i].e + "</span> " + esc(x.t) + "</button>";
      }).join("") + '</div><div class="m-col" id="mR">' + Rt.map(function (x) {
        return '<button class="mcard c2" data-mr="' + x.i + '">' + esc(x.t) + "</button>";
      }).join("") + '</div></div><div class="made" id="made"></div>');
    say("Build three words! Tap a front chunk, then the chunk that finishes it.");
    var bad = 0;
    view.querySelectorAll("[data-ml]").forEach(function (b) {
      b.onclick = function () {
        if (q.over || b.disabled) return;
        view.querySelectorAll("[data-ml]").forEach(function (x) { x.classList.remove("sel"); });
        b.classList.add("sel"); sel = +b.getAttribute("data-ml"); sfx.tap(); say(plain(ws[sel]), 0.85);
      };
    });
    view.querySelectorAll("[data-mr]").forEach(function (b) {
      b.onclick = function () {
        if (q.over || b.disabled) return;
        if (sel == null) { talk("First tap a front chunk on the left!", "think"); return; }
        var r = +b.getAttribute("data-mr");
        if (r === sel) {
          var lb = view.querySelector('[data-ml="' + sel + '"]');
          lb.disabled = b.disabled = true; lb.classList.remove("sel"); lb.classList.add("right"); b.classList.add("right");
          $("made").innerHTML += '<span class="made-w">' + ws[sel].e + " " + esc(ws[sel].w) + "</span>";
          made++; sfx.drum(); say(plain(ws[sel]));
          sel = null;
          if (made === ws.length) { q.tries = bad ? 1 : 0; right("You built " + ws.map(plain).join(", ") + "!"); }
        } else {
          bad++; b.classList.add("wrong"); setTimeout(function () { b.classList.remove("wrong"); }, 500); sfx.boop();
          talk(pick(D.kind.slice(0, 3)) + " " + plain(ws[sel]) + " needs a different ending.", "think");
        }
      };
    });
  }

  /* ---------- 3 Read to Bongo ---------- */
  function startRead() {
    hush(); clapping++;
    var pool = shuffle(R.L.words).slice(0, R.L.read);
    R.reads = pool.map(function (w) { return { w: w }; });
    if (R.L.sentence && !KGT) R.reads.push({ sentence: R.L.sentence });
    R.ri = 0; R.readOK = 0;
    readOne();
  }
  var helper = !(window.Listener && Listener.supported());
  function readOne() {
    var it = R.reads[R.ri], tries = 0;
    if (!it) { finish(); return; }
    var head = stepper(2) + '<div class="q-top"><span>Read ' + (R.ri + 1) + " of " + R.reads.length + "</span>" + ReadLevel.chip(APP) + "</div>";
    if (it.sentence) { readSentence(it, head); return; }
    var w = it.w;
    var msg = KGT ? "Your turn! Read the beats, then the whole word: " : "Read it to me! Chunk by chunk, then the whole word.";
    view.innerHTML = head + bongoRow(msg) +
      '<div class="card word-card read-card"><div class="w-pic" aria-hidden="true">' + w.e + "</div>" + chips(w, { big: true }) +
        '<div class="say-big" id="sayBig">' + esc(plain(w)) + "</div><p class=\"heard\" id=\"heard\"></p></div>" +
      '<div class="row">' + (helper
        ? '<button class="btn go big" id="iRead">✅ I read it!</button><button class="btn" id="helpMe">🔊 Help me</button>'
        : '<button class="mic" id="mic" title="Tap and read"><span>🎤</span></button><button class="btn" id="helpMe">🔊 Help me</button>') + "</div>" +
      '<div class="row nav"><button class="btn ghost" id="skipR">Skip ➜</button></div>' +
      (helper ? '<p class="small">No microphone here, so a grown-up can listen and tap ✅.</p>' : "");
    var box = view.querySelector(".chips");
    bindChips(box, w);
    ReadLevel.bind(view, APP, function (L) { toast(L.emoji + " " + L.name + " level"); readOne(); });
    say(KGT ? "Your turn! Read the beats, then the whole word." : "Read it to me!");
    $("helpMe").onclick = function () { clapWord(w, box); };
    $("skipR").onclick = function () { hush(); Listener && Listener.stop && Listener.stop(); R.ri++; readOne(); };
    if (helper) { $("iRead").onclick = function () { this.disabled = true; readWin(w, box, 2, true); }; return; }
    $("mic").onclick = function () {
      var btn = $("mic"); if (btn.classList.contains("live")) return;
      hush(); clapping++; btn.classList.add("live"); tone([600, 900], 0.08, "sine", 0.06);
      $("heard").textContent = "👂 Listening...";
      setTimeout(function () {
        Listener.start({ target: Listener.tokens(plain(w)), single: true, level: ReadLevel.level(APP).n,
          onUpdate: function (h, txt) { var e = $("heard"); if (e) e.textContent = "👂 " + txt; },
          onError: function () { btn.classList.remove("live"); var e = $("heard"); if (e) e.textContent = "I couldn't hear. Tap the mic and try again!"; },
          onDone: function (res) {
            btn.classList.remove("live");
            if (!document.body.contains(btn)) return;
            var v = ReadLevel.judge(APP, res, tries);
            if (v !== "retry") setTimeout(function () { rlEvents(ReadLevel.word(APP, res, v, tries)); }, 1400);
            $("heard").textContent = "";
            if (v === "yes") readWin(w, box, tries ? 2 : 3, !tries);
            else if (v === "close") readWin(w, box, 1, false, ReadLevel.praise("close") + " " + plain(w) + "!");
            else if (v === "retry") {
              tries++;
              talk(res.heardAny ? "So close! Let's clap the beats, then try again." : "I couldn't hear you. Let's clap it, then tap the mic!", "think")
                .then(function (ok) { if (ok) clapWord(w, box); });
            } else {
              if (window.Tracker) Tracker.answer(false, "Syllables reading: " + R.L.title, { word: plain(w), said: true, level: ReadLevel.level(APP).n });
              talk(ReadLevel.praise("brave") + " It says " + plain(w) + ".", "happy").then(function () { R.ri++; readOne(); });
            }
          } });
      }, 250);
    };
  }
  function readWin(w, box, pts, first, msg) {
    box.classList.add("whole"); sfx.ding(); confetti(18); addPoints(pts); stat("reads"); R.readOK++;
    $("sayBig").classList.add("right");
    if (window.Tracker) Tracker.answer(!!first, "Syllables reading: " + R.L.title, { word: plain(w), said: !helper, level: ReadLevel.level(APP).n });
    var t = talk(msg || pick(D.praise) + " You read " + plain(w) + "!", "happy");
    t.then(function () { setTimeout(function () { if (document.body.contains(box)) { R.ri++; readOne(); } }, 400); });
  }
  function readSentence(it, head) {
    var toks = it.sentence.split(/\s+/), tries = 0;
    view.innerHTML = head + bongoRow("Now a whole sentence! Chunk the big words, then read it all.") +
      '<div class="card sent-card"><p class="sent" id="sent">' + toks.map(function (t, i) { return '<span data-t="' + i + '">' + esc(t) + "</span>"; }).join(" ") + "</p>" +
        '<p class="heard" id="heard"></p></div>' +
      '<div class="row">' + (helper ? '<button class="btn go big" id="iRead">✅ I read it!</button>' : '<button class="mic" id="mic"><span>🎤</span></button>') +
        '<button class="btn" id="helpMe">🔊 Read it to me</button></div>' +
      '<div class="row nav"><button class="btn ghost" id="skipR">Skip ➜</button></div>';
    ReadLevel.bind(view, APP, function (L) { toast(L.emoji + " " + L.name + " level"); readOne(); });
    say("Now a whole sentence!");
    var spans = view.querySelectorAll("[data-t]");
    $("helpMe").onclick = function () { say(it.sentence, 0.8); };
    $("skipR").onclick = function () { hush(); Listener && Listener.stop && Listener.stop(); R.ri++; readOne(); };
    function win(stars) {
      sfx.fanfare(); confetti(30); addPoints(stars * 2); stat("reads"); R.readOK++;
      var p = stars === 3 ? pick(D.praise) : ReadLevel.praise(stars === 2 ? "close" : "brave");
      talk(p + " " + "⭐".repeat(stars), "happy").then(function () { setTimeout(function () { R.ri++; readOne(); }, 400); });
    }
    if (helper) { $("iRead").onclick = function () { spans.forEach(function (s) { s.className = "ok"; }); win(3); }; return; }
    $("mic").onclick = function () {
      var btn = $("mic"); if (btn.classList.contains("live")) return;
      hush(); btn.classList.add("live"); $("heard").textContent = "👂 Listening...";
      var target = Listener.tokens(it.sentence);
      Listener.start({ target: target, level: ReadLevel.level(APP).n,
        onUpdate: function (h) { spans.forEach(function (s, i) { if (h[i]) s.className = "ok"; }); },
        onError: function () { btn.classList.remove("live"); $("heard").textContent = "I couldn't hear. Tap the mic and try again!"; },
        onDone: function (res) {
          btn.classList.remove("live");
          if (!document.body.contains(btn)) return;
          var ev = ReadLevel.read(APP, res, [1, 0.8]);
          spans.forEach(function (s, i) { s.className = res.hits[i] ? (ev.close.indexOf(i) >= 0 ? "close" : "ok") : "miss"; });
          $("heard").textContent = "";
          if (window.Tracker) Tracker.answer(ev.stars === 3, "Syllables reading: " + R.L.title, { sentence: true, stars: ev.stars, level: ev.level.n });
          setTimeout(function () { rlEvents(ev); }, 1400);
          if (ev.stars === 0 && tries < 1) { tries++; talk("I couldn't hear it all. Let's try again! Tap the mic.", "think"); return; }
          win(Math.max(1, ev.stars));
        } });
    };
  }
  // level-ups and Brave badges from ReadLevel
  function rlEvents(ev) { if (ev && (ev.up || ev.badge)) ReadLevel.celebrate(ev, "Bongo"); }

  /* ---------- 4 Party ---------- */
  function finish() {
    hush(); clapping++;
    var L = R.L, ratio = R.first / R.total;
    var stars = L.master ? (R.first >= R.total ? 3 : R.first >= passMark(L) ? 2 : 1) : ratio >= 0.83 ? 3 : ratio >= 0.5 ? 2 : 1;
    var passed = !L.master || R.first >= passMark(L);
    var prev = S.lessons[L.id] || {}, newSticker = passed && S.stickers.indexOf(L.id) < 0, newJoke = S.jokes.indexOf(L.id) < 0;
    if (passed) S.lessons[L.id] = { done: true, stars: Math.max(stars, prev.stars || 0), best: Math.max(R.first, prev.best || 0), last: Date.now() };
    else S.lessons[L.id] = { done: !!prev.done, stars: prev.stars || 0, best: Math.max(R.first, prev.best || 0), last: Date.now() };
    if (newSticker) S.stickers.push(L.id);
    if (newJoke) S.jokes.push(L.id);
    var trophies = [];
    if (L.master && passed && S.trophies.indexOf(TRACK + "-master") < 0) { S.trophies.push(TRACK + "-master"); trophies.push("🏆 Beat Master trophy!"); }
    var all3 = T.lessons.every(function (x) { return (S.lessons[x.id] || {}).stars === 3; });
    if (all3 && S.trophies.indexOf(TRACK + "-allstars") < 0) { S.trophies.push(TRACK + "-allstars"); trophies.push("🌟 All-Stars trophy: 3 stars on every lesson!"); }
    if (passed) addPoints(10);
    save(); hud();
    if (window.Tracker) Tracker.complete(L.id, R.first, R.total, { item: L.title, stars: stars, track: TRACK, reads: R.readOK, passed: passed });
    var next = T.lessons[R.i + 1];
    var head = passed ? (stars === 3 ? "WOW! Perfect beats!" : stars === 2 ? "Great job, beat buddy!" : "You did it! Every try makes you stronger!")
      : "So close! You got " + R.first + " of " + R.total + ". Try again to win the trophy!";
    view.innerHTML = stepper(3) + bongoRow(head) +
      '<div class="card party">' +
        '<div class="stars-big">' + "⭐".repeat(stars) + '<span class="off">' + "⭐".repeat(3 - stars) + "</span></div>" +
        "<p><b>" + R.first + " of " + R.total + "</b> right on the first try" + (R.readOK ? " · <b>" + R.readOK + "</b> read to Bongo 🎤" : "") + "</p>" +
        (newSticker ? '<div class="new-stk"><span>' + L.sticker.emoji + "</span><b>New sticker: " + esc(L.sticker.name) + "</b></div>" : "") +
        trophies.map(function (t) { return '<div class="new-stk gold"><b>' + esc(t) + "</b></div>"; }).join("") +
        '<div class="joke-card inline"><h3>😂 ' + (newJoke ? "New joke for your Joke Box!" : "Joke time!") + '</h3><p class="j-q">' + esc(L.joke.q) + '</p><p class="j-a">' + esc(L.joke.a) + "</p></div>" +
      "</div>" +
      '<div class="row nav"><button class="btn ghost" id="again">🔁 Play again</button>' +
        (next && passed ? '<button class="btn go big" id="nextL">Next: ' + next.emoji + " " + esc(next.title) + " ➜</button>" : '<button class="btn go big" id="homeB">🏠 All lessons</button>') + "</div>";
    sfx.fanfare(); confetti(stars * 25);
    say(head).then(function (ok) { if (ok) say(L.joke.q).then(function (k) { if (k) say(L.joke.a); }); });
    $("again").onclick = function () { startLesson(R.i); };
    if ($("nextL")) $("nextL").onclick = function () { startLesson(R.i + 1); };
    if ($("homeB")) $("homeB").onclick = home;
  }

  /* ---------------- trophies & wiring ---------------- */
  var TROPHIES = {
    "kg-master": ["🏆", "Beat Master (Kindergarten)", "Win the Kindergarten Beat Master Challenge"],
    "kg-allstars": ["🌟", "All-Stars (Kindergarten)", "3 stars on every Kindergarten lesson"],
    "g3-master": ["🥇", "Syllable Master (Grade 3)", "Win the Grade 3 Syllable Master Challenge"],
    "g3-allstars": ["🌟", "All-Stars (Grade 3)", "3 stars on every Grade 3 lesson"]
  };
  function trophyBox() {
    var ids = Object.keys(TROPHIES).filter(function (id) { return id.indexOf(TRACK) === 0; });
    popup("<h2>🏆 My Trophies</h2>" + ids.map(function (id) {
      var t = TROPHIES[id], has = S.trophies.indexOf(id) >= 0;
      return '<div class="trophy' + (has ? "" : " off") + '"><span>' + (has ? t[0] : "🔒") + "</span><div><b>" + esc(t[1]) + "</b><small>" + esc(t[2]) + "</small></div></div>";
    }).join("") + "<h3>🎟️ My Stickers</h3><div class=\"stk-grid\">" + T.lessons.map(function (L) {
      var has = S.stickers.indexOf(L.id) >= 0;
      return '<span class="stk' + (has ? "" : " off") + '" title="' + esc(L.sticker.name) + '">' + (has ? L.sticker.emoji : "❔") + "</span>";
    }).join("") + "</div>");
  }

  $("backBtn").onclick = function () { home(); };
  $("trophyBtn").onclick = trophyBox;
  $("stkPill").onclick = trophyBox;
  $("muteBtn").onclick = function () { S.mute = !S.mute; localStorage.setItem(K.mute, S.mute ? "1" : "0"); if (S.mute) hush(); hud(); };
  window.addEventListener("hashchange", function () {
    var t = trackFor();
    if (t !== TRACK) { TRACK = t; T = D.tracks[t]; KGT = t === "kg"; ALLW = []; T.lessons.forEach(function (L) { L.words.forEach(function (w) { ALLW.push(w); }); }); }
    home();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") {
      var n = $("nextQ") || $("nextW") || $("toQuiz");
      if (n && document.activeElement === document.body) { e.preventDefault(); n.click(); }
    }
  });
  // for the headless test: the question on screen
  window.__sy = { q: function () { return R && R.qs[R.q]; } };
  hud();
  home();
})();
