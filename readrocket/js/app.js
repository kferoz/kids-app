/* ============================================================
   Read-Aloud Rocket — app engine
   Screens: home (phase path) → phase → lesson → Word Lab / Read Aloud
            / Check-up / Write It → done · Phase Check · stickers · trophies
   Built on the Phonics Pals engine (listening buddy, live word marking,
   practise-the-tricky-words) with a fluency meter for 3rd–4th grade.
   ============================================================ */
(function () {
  "use strict";

  /* ---------------- storage ---------------- */
  var K = { pts: "rr_points", stk: "rr_stickers", tro: "rr_trophies", les: "rr_lessons", chk: "rr_checks",
            perfect: "rr_perfect", fixed: "rr_fixed", best: "rr_bestWcpm", mute: "rr_mute", writing: "rr_writing", tickets: "rw_tickets" };
  function load(k, d) { try { var v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }
  function store(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }

  var S = {
    points: load(K.pts, 0), stickers: load(K.stk, []), trophies: load(K.tro, []),
    lessons: load(K.les, {}), checks: load(K.chk, {}),
    perfect: load(K.perfect, 0), fixed: load(K.fixed, 0), best: load(K.best, 0), mute: load(K.mute, false), writing: load(K.writing, []),
    helper: !Listener.supported(), micNote: ""
  };
  function lrec(id) {
    if (!S.lessons[id]) S.lessons[id] = { lab: false, paras: [], flu: [], seen: 0, quiz: false, write: false, done: false, wcpm: 0 };
    return S.lessons[id];
  }
  function crec(pid) {
    if (!S.checks[pid]) S.checks[pid] = { paras: [], flu: [], seen: 0, score: 0, passed: false, wcpm: 0 };
    return S.checks[pid];
  }
  function save() { store(K.les, S.lessons); store(K.chk, S.checks); }

  function phaseById(id) { for (var i = 0; i < PHASES.length; i++) if (PHASES[i].id === id) return PHASES[i]; return PHASES[0]; }
  function lessonById(id) {
    for (var i = 0; i < PHASES.length; i++) for (var j = 0; j < (PHASES[i].lessons || []).length; j++)
      if (PHASES[i].lessons[j].id === id) return { p: PHASES[i], l: PHASES[i].lessons[j], idx: j };
    return null;
  }
  function phaseOpen(p) { return !!p.lessons && (p.n === 1 || crec(PHASES[p.n - 2].id).passed); }
  function lessonsDone(p) { return (p.lessons || []).filter(function (l) { return lrec(l.id).done; }).length; }

  // a "unit" is anything with paragraphs to read: a lesson, or a Phase Check (key "c:p1")
  function unit(key) {
    if (key.indexOf("c:") === 0) {
      var p = phaseById(key.slice(2));
      return { key: key, kind: "check", p: p, title: p.check.title, passage: p.check.passage, quiz: p.check.quiz, focus: [], vocab: [], chunks: {}, rec: crec(p.id) };
    }
    var f = lessonById(key);
    return { key: key, kind: "lesson", p: f.p, l: f.l, title: f.l.title, passage: f.l.passage, quiz: f.l.quiz,
             focus: f.l.focus, vocab: f.l.vocab || [], chunks: f.l.chunks || {}, rec: lrec(key) };
  }
  function unitStars(u) {
    var sum = 0;
    for (var i = 0; i < u.passage.length; i++) sum += u.rec.paras[i] || 0;
    return Math.round(sum / u.passage.length);
  }
  // fluency for a unit = all words read correctly ÷ all reading time (latest try per paragraph)
  function unitWcpm(u) {
    var n = 0, ms = 0;
    (u.rec.flu || []).forEach(function (f) { if (f) { n += f.n; ms += f.ms; } });
    return ms > 0 ? Math.min(220, Math.round(n / (ms / 60000))) : 0;
  }

  /* ---------------- dom helpers ---------------- */
  var $ = function (id) { return document.getElementById(id); };
  var view = $("view");
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function starsHtml(n, max) { var s = ""; for (var i = 0; i < (max || 3); i++) s += '<span class="st' + (i < n ? " on" : "") + '">★</span>'; return s; }

  /* ---------------- sound ---------------- */
  var voice = null, speakToken = 0;
  function chooseVoice() {
    if (!window.speechSynthesis) return;
    var vs = speechSynthesis.getVoices().filter(function (v) { return /^en[-_]/i.test(v.lang); });
    var prefs = [/Aria/i, /Jenny/i, /Guy/i, /Samantha/i, /Google US English/i, /Zira/i, /en-US/i];
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
      u.lang = "en-US"; u.rate = opt.rate || 0.95; u.pitch = opt.pitch || 1.02;
      u.onend = done; u.onerror = done;
      if (opt.onboundary) u.onboundary = opt.onboundary;
      if (!opt.queue) speechSynthesis.cancel();
      speechSynthesis.speak(u);
      setTimeout(done, 3000 + text.length * 110);   // safety net
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
    mic: function () { tone([660, 990], 0.12, "sine", 0.08); },
    launch: function () { tone([330, 440, 660, 990, 1320], 0.22, "sawtooth", 0.07); }
  };

  /* ---------------- Nova the robot ---------------- */
  function novaRow(msg, mood) {
    return '<div class="echo-row"><div class="echo-bird" id="novaBot">' + Art.nova(mood) + '</div>' +
           '<div class="echo-bubble" id="novaSay">' + esc(msg || "") + "</div></div>";
  }
  function nova(msg, mood, noVoice) {
    var b = $("novaSay"), bot = $("novaBot");
    if (b) { b.textContent = msg; b.classList.remove("pop"); void b.offsetWidth; b.classList.add("pop"); }
    if (bot) bot.innerHTML = Art.nova(mood || "happy");
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
    var t = RR_TROPHIES.filter(function (x) { return x.id === id; })[0]; if (!t) return;
    S.trophies.push(id); store(K.tro, S.trophies);
    toast(t.icon + " Trophy: " + t.name + "!");
    sfx.fanfare();
  }
  function checkTrophies() {
    var done = Object.keys(S.lessons).filter(function (k) { return S.lessons[k].done; }).length;
    if (done >= 1) trophy("first-lesson");
    if (S.perfect >= 10) trophy("perfect-10");
    if (S.fixed >= 5) trophy("word-fixer");
    if (Object.keys(S.checks).some(function (k) { return S.checks[k].passed; })) trophy("phase-pilot");
    if (Object.keys(S.lessons).filter(function (k) { return S.lessons[k].write; }).length >= 3) trophy("rocket-writer");
  }
  var toastTimer = null;
  function toast(msg) {
    var t = $("toast"); t.textContent = msg; t.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.classList.remove("show"); }, 2800);
  }
  function confetti(n) {
    var box = $("confetti"), colors = ["#4dabf7", "#ffd43b", "#69db7c", "#9775fa", "#ff8787", "#ffa94d"];
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
  function stickerPop(emoji, name) {
    var d = document.createElement("div");
    d.className = "sticker-pop"; d.innerHTML = '<div class="sp-card"><div class="sp-emoji">' + emoji + "</div><b>New sticker!</b><span>" + esc(name) + "</span></div>";
    document.body.appendChild(d); hud();
    d.onclick = function () { d.remove(); };
    setTimeout(function () { d.classList.add("out"); setTimeout(function () { d.remove(); }, 400); }, 2600);
  }
  function pulse(el) { if (!el) return; el.classList.remove("pulse"); void el.offsetWidth; el.classList.add("pulse"); }

  /* ---------------- words: chunks ---------------- */
  function chunksOf(u, word) {
    var c = u.chunks[word.toLowerCase()];
    return c ? c.split("·") : [word];
  }
  function chunkCard(u, word) {
    var parts = chunksOf(u, word);
    if (/^[A-Z]/.test(word)) parts[0] = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
    return parts.map(function (c, i) { return '<span class="lt ck" data-g="' + i + '">' + esc(c) + "</span>"; }).join('<span class="dot">·</span>');
  }
  // say each chunk (lighting it up), then the whole word
  function chunkOut(u, word, host) {
    var parts = chunksOf(u, word), chain = Promise.resolve(true);
    function light(i) { if (host) host.querySelectorAll(".lt").forEach(function (el) { el.classList.toggle("lit", i === "all" || +el.dataset.g === i); }); }
    function clear() { if (host) setTimeout(function () { host.querySelectorAll(".lt").forEach(function (el) { el.classList.remove("lit"); }); }, 500); }
    hush();
    if (parts.length > 1) parts.forEach(function (c, i) {
      chain = chain.then(function (ok) {
        if (!ok) return false;
        light(i);
        return speak(c, { rate: 0.7 }).then(function (still) { return still ? wait(140).then(function () { return true; }) : false; });
      });
    });
    return chain.then(function (ok) {
      if (!ok) { clear(); return false; }
      light("all");
      return speak(word, { rate: 0.8 }).then(function (r) { clear(); return r; });
    });
  }

  var nav = 0;
  function onNav(fn) { var my = nav; return function (x) { if (my === nav && fn) return fn(x); }; }
  function listen(opt) {
    Listener.start({ target: opt.target, vocab: opt.vocab, single: opt.single,
      onUpdate: onNav(function (h) { if (opt.onUpdate) opt.onUpdate(h); }),
      onDone: onNav(opt.onDone), onError: onNav(opt.onError) });
  }

  /* ============================================================
     SCREENS
     ============================================================ */
  var current = { screen: "home" };
  function go(screen, arg) {
    hush(); Listener.stop(); nav++;
    current = { screen: screen, arg: arg };
    $("backBtn").hidden = screen === "home";
    document.body.dataset.screen = screen;
    window.scrollTo(0, 0);
    ({ home: renderHome, phase: renderPhase, lesson: renderLesson, lab: renderLab, read: renderReader, quiz: renderQuiz, write: renderWrite,
       stickers: renderStickers, trophies: renderTrophies })[screen](arg);
  }
  function back() {
    var c = current, a = c.arg || {};
    if (c.screen === "lab" || c.screen === "write" || ((c.screen === "read" || c.screen === "quiz" || c.screen === "done") && a.key && a.key.indexOf("c:") !== 0)) go("lesson", a.key);
    else if ((c.screen === "read" || c.screen === "quiz" || c.screen === "done") && a.key) go("phase", a.key.slice(2));
    else if (c.screen === "lesson") go("phase", lessonById(c.arg).p.id);
    else go("home");
  }
  function themeVars(p) { return "--bk:" + p.color + ";--bk2:" + p.accent; }

  /* ---------------- home: the phase path ---------------- */
  function renderHome() {
    $("topTitle").textContent = "Read-Aloud Rocket";
    var mic = S.helper
      ? '<span class="mic-chip off">🎤 ' + (S.micNote || "Reading check needs Chrome or Edge, so a grown-up can listen instead") + "</span>"
      : '<span class="mic-chip">🎤 Nova can hear you read!</span>';
    var path = PHASES.map(function (p) {
      var open = phaseOpen(p), soon = !p.lessons, passed = crec(p.id).passed, done = lessonsDone(p);
      var state = soon ? "soon" : !open ? "locked" : passed ? "passed" : "open";
      var status = soon ? "Coming soon" : !open ? "🔒 Pass Phase " + (p.n - 1) + " to unlock" : passed ? "✅ Phase passed!" : done + " of " + p.lessons.length + " lessons";
      return '<button class="phase-card ' + state + '" data-phase="' + p.id + '" style="' + themeVars(p) + '"' + (open ? "" : " disabled") + ">" +
        '<span class="ph-n">' + (passed ? p.badge.emoji : p.n) + "</span>" +
        '<span class="ph-txt"><small>Phase ' + p.n + "</small><b>" + esc(p.title) + "</b><em>" + esc(p.sub) + "</em>" +
        '<span class="ph-status">' + status + "</span></span>" +
        (open && !soon ? '<span class="ph-bar"><i style="width:' + Math.round(100 * done / p.lessons.length) + '%"></i></span>' : "") +
        "</button>";
    }).join('<span class="path-dash" aria-hidden="true"></span>');
    view.innerHTML = novaRow("Hi! I'm Nova! Read stories out loud to me and we'll blast off, one phase at a time!") +
      '<div class="mic-row">' + mic + (S.best ? '<span class="mic-chip speed">⚡ Best speed: ' + S.best + " words a minute</span>" : "") + "</div>" +
      '<div class="phase-path">' + path + "</div>" +
      '<div class="home-actions"><button class="big-btn alt" data-go="stickers">🎟️ My Stickers</button><button class="big-btn alt" data-go="trophies">🏆 My Trophies</button></div>';
    view.querySelectorAll("[data-phase]").forEach(function (el) { el.onclick = function () { sfx.pop(); go("phase", el.dataset.phase); }; });
    view.querySelectorAll("[data-go]").forEach(function (el) { el.onclick = function () { go(el.dataset.go); }; });
  }

  /* ---------------- one phase: its lessons + the Phase Check ---------------- */
  function renderPhase(pid) {
    var p = phaseById(pid), c = crec(p.id), done = lessonsDone(p), checkOpen = done >= p.lessons.length;
    $("topTitle").textContent = "Phase " + p.n + ": " + p.title;
    var cards = p.lessons.map(function (l, i) {
      var r = lrec(l.id), u = unit(l.id), w = r.wcpm;
      return '<button class="lesson-card' + (r.done ? " done" : "") + '" data-lesson="' + l.id + '">' +
        '<span class="lc-n">' + (r.done ? l.sticker.emoji : i + 1) + "</span>" +
        '<span class="lc-txt"><b>' + esc(l.title) + "</b><small>" + esc(l.skill) + "</small>" +
        '<span class="steps-mini"><i class="' + (r.lab ? "ok" : "") + '">🔤</i><i class="' + (r.seen >= l.passage.length ? "ok" : "") + '">📖</i><i class="' + (r.quiz ? "ok" : "") + '">❓</i>' + (l.write ? '<i class="' + (r.write ? "ok" : "") + '">✏️</i>' : "") +
        '<span class="stars">' + starsHtml(unitStars(u)) + "</span>" + (w ? '<span class="wchip">⚡ ' + w + "</span>" : "") + "</span></span>" +
        '<span class="step-go">' + (r.done ? "✅" : "▶") + "</span></button>";
    }).join("");
    var checkCard = '<button class="lesson-card check' + (c.passed ? " done" : "") + '" id="checkCard"' + (checkOpen ? "" : " disabled") + ">" +
      '<span class="lc-n">' + (c.passed ? p.badge.emoji : "🏁") + "</span>" +
      '<span class="lc-txt"><b>Phase Check: ' + esc(p.check.title) + "</b><small>" +
      (c.passed ? "Passed with " + c.score + " of 6! " : checkOpen ? "Read a new story, then answer 6 questions. Get 4 right to pass!" : "Finish all " + p.lessons.length + " lessons to unlock") +
      "</small></span><span class=\"step-go\">" + (c.passed ? "✅" : checkOpen ? "▶" : "🔒") + "</span></button>";
    view.innerHTML = '<div class="phase-head" style="' + themeVars(p) + '"><span class="ph-badge">' + p.badge.emoji + "</span><div><small>Phase " + p.n + "</small><h2>" + esc(p.title) + "</h2><p>" + esc(p.sub) +
        '</p><p class="goal">🎯 Speed goal: <b>' + p.goal + "</b> words a minute</p></div></div>" +
      novaRow(c.passed ? "You passed this phase! Re-read any story to beat your speed." : done < p.lessons.length ? "Pick a lesson. Each one has a Word Lab, a story to read aloud, a Check-up, and a writing challenge." : "All lessons done! Take the Phase Check to unlock the next phase!") +
      '<div class="steps">' + cards + checkCard + "</div>";
    view.querySelectorAll("[data-lesson]").forEach(function (el) { el.onclick = function () { sfx.pop(); go("lesson", el.dataset.lesson); }; });
    $("checkCard").onclick = function () {
      sfx.pop();
      var key = "c:" + p.id;
      if (c.seen >= p.check.passage.length) go("quiz", { key: key }); else go("read", { key: key, para: Math.min(c.seen, p.check.passage.length - 1) });
    };
    nova($("novaSay").textContent, "happy");
  }

  /* ---------------- lesson menu ---------------- */
  function renderLesson(id) {
    var u = unit(id), l = u.l, r = u.rec, read = Math.min(r.seen, l.passage.length);
    $("topTitle").textContent = l.title;
    view.innerHTML = '<div class="phase-head" style="' + themeVars(u.p) + '"><span class="ph-badge">' + (r.done ? l.sticker.emoji : "📖") + "</span><div><small>Phase " + u.p.n + " · " + esc(l.skill) + "</small><h2>" + esc(l.title) + "</h2>" +
        '<p class="goal">' + (r.wcpm ? "⚡ Your best: <b>" + r.wcpm + "</b> words a minute · " : "") + "🎯 Goal: " + u.p.goal + "</p></div></div>" +
      novaRow(r.done ? "You finished this lesson! Read it again to beat your speed!" : r.lab ? "Now read the story out loud to me!" : "Let's warm up in the Word Lab first!") +
      '<div class="steps">' +
        stepCard(1, "🔤", "Word Lab", r.lab ? "Done! ✔" : esc(l.skill) + ": hear, chunk & say the words", r.lab, "lab") +
        stepCard(2, "📖", "Read Aloud", read + " of " + l.passage.length + " paragraphs · " + starsHtml(unitStars(u)), read >= l.passage.length, "read") +
        stepCard(3, "❓", "Check-up", r.quiz ? "Done! ✔" : "Show what you understood", r.quiz, "quiz") +
        (l.write ? stepCard(4, "✏️", "Write It", r.write ? "Done! ✔" : "Answer in your own sentences", r.write, "write") : "") +
      "</div>";
    view.querySelectorAll("[data-step]").forEach(function (el) {
      el.onclick = function () {
        sfx.pop();
        var s = el.dataset.step;
        if (s === "read") go("read", { key: id, para: r.seen > 0 && r.seen < l.passage.length ? r.seen : 0 });
        else go(s, { key: id });
      };
    });
    nova($("novaSay").textContent, "happy");
  }
  function stepCard(n, icon, name, sub, ok, step) {
    return '<button class="step-card' + (ok ? " ok" : "") + '" data-step="' + step + '"><span class="step-n">' + n + '</span><span class="step-ic">' + icon + "</span>" +
      '<span class="step-txt"><b>' + name + "</b><small>" + sub + '</small></span><span class="step-go">' + (ok ? "✅" : "▶") + "</span></button>";
  }

  /* ---------------- Word Lab ---------------- */
  function renderLab(arg) {
    var u = unit(arg.key), l = u.l;
    $("topTitle").textContent = "Word Lab";
    view.innerHTML = novaRow("") +
      '<div class="warm-intro" style="' + themeVars(u.p) + '">' +
        '<button class="tip-card" id="tipCard"><span class="tip-ic">💡</span><span><b>' + esc(l.skill) + "</b>" + esc(l.tip) + "</span></button>" +
        '<div class="wall"><h3>Story words: tap one to hear it in chunks</h3><div class="word-wall">' +
          l.focus.map(function (w) { return '<button class="wcard" data-w="' + esc(w) + '">' + chunkCard(u, w) + "</button>"; }).join("") +
        "</div>" +
        (u.vocab.length ? '<h3>Word meanings</h3><div class="vocab-list">' + u.vocab.map(function (v) { return '<button class="vcard" data-v="' + esc(v.w) + '" data-d="' + esc(v.def) + '"><b>' + esc(v.w) + "</b> means " + esc(v.def) + "</button>"; }).join("") + "</div>" : "") +
        "</div>" +
        '<button class="big-btn go" id="playBtn">▶ Start the word game</button></div>';
    $("tipCard").onclick = function () { speak(l.tip); };
    view.querySelectorAll(".wcard").forEach(function (el) { el.onclick = function () { chunkOut(u, el.dataset.w, el); }; });
    view.querySelectorAll(".vcard").forEach(function (el) { el.onclick = function () { sfx.pop(); speak(el.dataset.v + " means " + el.dataset.d); }; });
    $("playBtn").onclick = function () { labGame(u); };
    nova(l.tip + " Tap a word to hear it.", "happy");
  }

  function labGame(u) {
    var l = u.l, pool = shuffle(l.focus).slice(0, 6), round = 0, score = 0, useMic = !S.helper;
    function next() {
      if (round >= pool.length) return finish();
      var w = pool[round], type = useMic && round % 2 === 1 ? "say" : "pick";
      round++;
      if (type === "pick") pickRound(w); else sayRound(w);
    }
    function frame(inner, msg, mood) {
      view.innerHTML = novaRow(msg, mood) + '<div class="game-box" style="' + themeVars(u.p) + '">' +
        '<div class="round-dots">' + pool.map(function (_, i) { return '<i class="' + (i < round - 1 ? "done" : i === round - 1 ? "now" : "") + '"></i>'; }).join("") + "</div>" + inner + "</div>";
    }
    function pickRound(w) {
      var others = shuffle(l.focus.filter(function (x) { return x !== w; })).slice(0, 2), choices = shuffle([w].concat(others)), tries = 0;
      frame('<p class="game-q">Tap the word you hear <button class="mini-btn" id="again">🔊</button></p><div class="choice-row">' +
        choices.map(function (c) { return '<button class="choice word" data-c="' + esc(c) + '">' + esc(c) + "</button>"; }).join("") + "</div>", "Tap the word: " + w, "happy");
      speak("Tap the word: " + w);
      $("again").onclick = function () { speak(w, { rate: 0.8 }); };
      view.querySelectorAll(".choice").forEach(function (el) {
        el.onclick = function () {
          if (el.dataset.c === w) {
            el.classList.add("right"); sfx.ding(); if (!tries) { score++; addPoints(2); }
            if (window.Tracker) Tracker.answer(!tries, "Decoding: " + l.skill);
            nova(pick(PRAISE.right), "happy").then(onNav(function () { setTimeout(onNav(next), 250); }));
          } else { tries++; el.classList.add("nope"); sfx.boop(); nova(pick(PRAISE.oops) + " Listen: " + w, "happy"); }
        };
      });
    }
    function sayRound(w) {
      var tries = 0;
      frame('<p class="game-q">Read this word to Nova!</p><div class="say-word" id="sayWord">' + chunkCard(u, w) + "</div>" +
        '<div class="say-row"><button class="mic-btn" id="sayMic"><span>🎤</span></button><button class="mini-btn" id="hearIt">🔊 Help me</button></div>', "Tap the microphone and read the word!", "listen");
      speak("Tap the microphone and read the word!");
      $("hearIt").onclick = function () { chunkOut(u, w, $("sayWord")); };
      $("sayMic").onclick = function () {
        var btn = $("sayMic"); if (btn.classList.contains("live")) return;   // one listen at a time
        hush(); sfx.mic(); btn.classList.add("live");
        setTimeout(function () {
          listen({ target: Listener.tokens(w), single: true,
            onDone: function (res) {
              btn.classList.remove("live");
              if (!document.body.contains(btn)) return;                      // round already moved on
              if (res.hits[0]) {
                $("sayWord").classList.add("right"); sfx.ding(); confetti(16);
                score++; addPoints(tries ? 2 : 3);
                if (window.Tracker) Tracker.answer(!tries, "Decoding: " + l.skill);
                nova(pick(PRAISE.fixed), "happy").then(onNav(function () { setTimeout(onNav(next), 250); }));
              } else if (++tries >= 2) {
                if (window.Tracker) Tracker.answer(false, "Decoding: " + l.skill);
                nova("Good try! It says " + w + ".", "happy").then(onNav(function () { setTimeout(onNav(next), 300); }));
              } else {
                nova(res.heardAny ? "Close! Let's hear it in chunks." : "I couldn't hear you. Listen, then try again!", "happy")
                  .then(onNav(function () { return chunkOut(u, w, $("sayWord")); }));
              }
            },
            onError: function (code) { btn.classList.remove("live"); useMic = false; micTrouble(code, true); setTimeout(onNav(next), 2500); }
          });
        }, 200);
      };
    }
    function finish() {
      var r = u.rec, first = !r.lab;
      r.lab = true; save();
      if (first) addPoints(5);
      if (window.Tracker) Tracker.complete("wordlab", score, pool.length, { item: l.title });
      checkTrophies(); sfx.fanfare(); confetti(40);
      view.innerHTML = novaRow("Word Lab complete! Now let's read the story!", "happy") +
        '<div class="celebrate"><div class="big-emoji">🔤🚀</div><h2>' + score + " of " + pool.length + " words!</h2>" +
        '<button class="big-btn go" id="toRead">📖 Read the story</button><button class="big-btn alt" id="toLesson">⬅ Back</button></div>';
      nova($("novaSay").textContent, "happy");
      $("toRead").onclick = function () { go("read", { key: u.key, para: 0 }); };
      $("toLesson").onclick = function () { go("lesson", u.key); };
    }
    next();
  }

  /* ---------------- Read Aloud ---------------- */
  var R = null;
  var PUNCT = /^([“"‘'(]*)(.*?)([.,!?;:”"’')]*)$/;
  function renderReader(arg) {
    var u = unit(arg.key), n = u.passage.length, i = Math.max(0, Math.min(arg.para || 0, n - 1)), r = u.rec;
    var F = {}; u.focus.forEach(function (w) { F[w.toLowerCase()] = true; });
    var V = {}; u.vocab.forEach(function (v) { V[v.w.toLowerCase()] = v.def; });
    $("topTitle").textContent = (u.kind === "check" ? "Phase Check" : u.title) + " · " + (i + 1) + "/" + n;
    r.seen = Math.max(r.seen, i + 1); save();
    var raw = u.passage[i].split(/\s+/), toks = raw.map(Listener.norm);
    var vocabAll = {}; u.passage.forEach(function (p) { Listener.tokens(p).forEach(function (w) { vocabAll[w] = true; }); });
    R = { u: u, i: i, toks: toks, vocab: vocabAll, queue: [], mode: "idle", missed: [] };

    var textHtml = raw.map(function (w, k) {
      var m = w.match(PUNCT), t = toks[k];
      var cls = "w" + (F[t] ? " focus" : "") + (V[t] ? " vocab" : "");
      return esc(m[1]) + '<span class="' + cls + '" data-k="' + k + '">' + esc(m[2]) + "</span>" + esc(m[3]);
    }).join(" ");
    var dots = u.passage.map(function (_, k) { var s = r.paras[k] || 0; return '<i class="' + (k === i ? "now " : "") + (s === 3 ? "s3" : s ? "s1" : "") + '"></i>'; }).join("");
    var micBtn = S.helper
      ? '<button class="big-btn go" id="selfBtn">✅ I read it!</button><button class="big-btn alt small" id="trickyBtn">🤔 Tricky word</button>'
      : '<button class="mic-btn big" id="micBtn" title="Read to Nova (space)"><span>🎤</span><em>Read to Nova</em></button>';
    var last = (r.flu || [])[i];

    view.innerHTML =
      '<div class="page-dots">' + dots + "</div>" +
      '<div class="para-card" style="' + themeVars(u.p) + '">' +
        '<div class="para-head"><b>' + esc(u.title) + '</b><span class="page-stars" id="pageStars">' + starsHtml(r.paras[i] || 0) + "</span></div>" +
        '<div class="story-text para" id="storyText">' + textHtml + "</div>" +
        '<div class="meter" id="meter">' + meterHtml(last ? Math.round(last.n / (last.ms / 60000)) : 0, u.p.goal) + "</div>" +
      "</div>" +
      '<div class="reader-controls">' +
        '<button class="nav-btn" id="prevBtn" ' + (i === 0 ? "disabled" : "") + ' title="Back">◀</button>' +
        '<button class="big-btn listen" id="listenBtn">🔊 Read to me</button>' + micBtn +
        '<button class="nav-btn next" id="nextBtn" title="Next">▶</button>' +
      "</div>" +
      novaRow("") +
      '<div class="practice" id="practice" hidden></div>';

    view.querySelectorAll(".w").forEach(function (el) {
      el.onclick = function () {
        var k = +el.dataset.k;
        if (R.mode === "tricky") { el.classList.toggle("miss"); return; }
        if (R.mode !== "idle") return;
        var w = cleanWord(k), def = V[toks[k]];
        speak(def ? w + ". " + w + " means " + def + "." : w, { rate: 0.8 });
        if (def) toast("📘 " + w + " means " + def);
        el.classList.add("tap"); setTimeout(function () { el.classList.remove("tap"); }, 500);
      };
    });
    $("prevBtn").onclick = function () { go("read", { key: u.key, para: i - 1 }); };
    $("nextBtn").onclick = nextPara;
    $("listenBtn").onclick = readToMe;
    if ($("micBtn")) $("micBtn").onclick = toggleMic;
    if ($("selfBtn")) $("selfBtn").onclick = selfReport;
    if ($("trickyBtn")) $("trickyBtn").onclick = trickyMode;
    var first = i === 0 && !r.paras[0];
    nova(S.helper
      ? (first ? "Read this paragraph out loud to a grown-up, then tap I read it!" : "Read this paragraph out loud!")
      : (first ? (u.kind === "check" ? "This is a brand-new story. Tap the microphone and read it to me!" : "Tap the microphone and read the paragraph to me. Tap any word for help.") : "Your turn! Tap the microphone and read."),
      S.helper ? "happy" : "listen");
  }

  function meterHtml(wcpm, goal) {
    if (!wcpm) return '<span class="m-label">⚡ Read to Nova to see your reading speed</span>';
    var pct = Math.min(100, Math.round(100 * wcpm / (goal * 1.4))), gp = Math.round(100 / 1.4);
    return '<span class="m-label">⚡ <b>' + wcpm + "</b> words a minute" + (wcpm >= goal ? " · 🎯 goal reached!" : " · goal " + goal) + "</span>" +
      '<span class="m-track"><i class="m-fill" style="width:' + pct + '%"></i><span class="m-goal" style="left:' + gp + '%"></span><span class="m-rocket" style="left:' + pct + '%">🚀</span></span>';
  }

  function spans() { return view.querySelectorAll("#storyText .w"); }
  function cleanWord(k) { return spans()[k].textContent.replace(/[^A-Za-z'’-]/g, ""); }
  function setParaStars(n) {
    var r = R.u.rec, old = r.paras[R.i] || 0;
    if (n > old) { r.paras[R.i] = n; save(); }
    var el = $("pageStars"); if (el) { el.innerHTML = starsHtml(Math.max(n, old)); el.classList.remove("pop"); void el.offsetWidth; el.classList.add("pop"); }
    var dot = view.querySelectorAll(".page-dots i")[R.i];
    if (dot) { var s = Math.max(n, old); dot.className = "now " + (s === 3 ? "s3" : s ? "s1" : ""); }
    return old;
  }

  function nextPara() {
    if (!R) return;
    var u = R.u;
    if (R.i < u.passage.length - 1) { sfx.pop(); go("read", { key: u.key, para: R.i + 1 }); return; }
    u.rec.seen = u.passage.length; save();
    var w = unitWcpm(u);
    if (w > (u.rec.wcpm || 0)) { u.rec.wcpm = w; save(); }
    if (window.Tracker) Tracker.complete("story", unitStars(u), 3, { item: u.title, wcpm: w || null });
    if (u.kind === "lesson" && u.rec.quiz) finishLesson(u, null);
    else go("quiz", { key: u.key });
  }

  // karaoke: speak each sentence, lighting up words as they are spoken
  function readToMe() {
    if (R.mode !== "idle") return;
    Listener.stop(); hush();
    R.mode = "tts";
    var els = spans(), groups = [[]];
    els.forEach(function (el, k) { groups[groups.length - 1].push(k); var t = el.nextSibling && el.nextSibling.textContent || ""; if (/[.!?]/.test(t) && k < els.length - 1) groups.push([]); });
    var btn = $("listenBtn"); btn.classList.add("live");
    var chain = Promise.resolve(true);
    groups.forEach(function (g) {
      chain = chain.then(function (ok) {
        if (ok === false) return false;
        var words = g.map(function (k) { return els[k].textContent; }), text = words.join(" "), offs = [], pos = 0;
        words.forEach(function (w) { offs.push(pos); pos += w.length + 1; });
        var gotB = false, step = 0, fb = null;
        function light(n) { els.forEach(function (e) { e.classList.remove("on"); }); if (g[n] != null) els[g[n]].classList.add("on"); }
        light(0);
        fb = setTimeout(function tick() { if (gotB) return; step++; if (step < g.length) { light(step); fb = setTimeout(tick, 330); } }, 380);
        return speak(text, { rate: 0.92, queue: true, onboundary: function (e) {
          if (e.name && e.name !== "word") return;
          gotB = true; clearTimeout(fb);
          var n = 0; for (var q = 0; q < offs.length; q++) if (e.charIndex >= offs[q]) n = q;
          light(n);
        } }).then(function (still) { clearTimeout(fb); return wait(160).then(function () { return still; }); });
      });
    });
    chain.then(onNav(function () {
      els.forEach(function (e) { e.classList.remove("on"); });
      btn.classList.remove("live");
      if (R && R.mode === "tts") { R.mode = "idle"; nova(S.helper ? "Now you read it! Tap I read it when you're done." : "Now you try! Tap the microphone and read it to me.", S.helper ? "happy" : "listen"); }
    }));
  }

  function toggleMic() {
    if (R.mode === "listen") { Listener.stop(); return; }
    if (R.mode !== "idle") { if (R.mode === "tts") { hush(); R.mode = "idle"; spans().forEach(function (e) { e.classList.remove("on"); }); $("listenBtn").classList.remove("live"); } else return; }
    hush(); sfx.mic();
    $("practice").hidden = true;
    spans().forEach(function (e) { e.classList.remove("heard", "miss", "fixed", "on"); });
    R.mode = "listen"; R.t0 = 0; R.t1 = 0;
    var btn = $("micBtn"); btn.classList.add("live"); btn.querySelector("em").textContent = "Listening…";
    nova("I'm listening! Read the paragraph out loud. Tap the mic when you finish.", "listen", true);
    setTimeout(function () {
      listen({
        target: R.toks, vocab: R.vocab,
        onUpdate: function (hits) {
          var now = Date.now(); if (!R.t0) R.t0 = now; R.t1 = now;
          spans().forEach(function (e, k) { e.classList.toggle("heard", !!hits[k]); });
        },
        onDone: function (res) { micOff(); gradeReading(res.hits, res.heardAny); },
        onError: function (code) { micOff(); R.mode = "idle"; micTrouble(code); }
      });
    }, 250);
  }
  function micOff() { var btn = $("micBtn"); if (!btn) return; btn.classList.remove("live"); btn.querySelector("em").textContent = "Read to Nova"; }
  function micTrouble(code, quiet) {
    var msg;
    if (code === "aborted") return;
    if (code === "not-allowed" || code === "service-not-allowed") { S.denied = (S.denied || 0) + 1; if (S.denied >= 2) code = "blocked"; }
    if (code === "not-allowed" || code === "service-not-allowed") msg = "I need the microphone to hear you. Ask a grown-up to tap Allow, then try again!";
    else if (code === "network") msg = "I need the internet to listen. You can still read out loud and tap I read it!";
    else if (code === "audio-capture") msg = "I can't find a microphone. A grown-up can help, or tap I read it!";
    else if (code === "no-speech") { nova("Hmm, I didn't hear you. Tap the microphone and read nice and loud!", "happy"); return; }
    else if (code === "blocked") msg = "The microphone is blocked, so a grown-up can listen instead. Read out loud and tap I read it!";
    else msg = "My ears aren't working right now. Read out loud and tap I read it!";
    if (code !== "not-allowed" && code !== "service-not-allowed") {
      S.helper = true; S.micNote = code === "network" ? "Reading check needs the internet, so a grown-up can listen instead" : "Microphone not available, so a grown-up can listen instead";
    }
    nova(msg, "happy");
    if (S.helper && current.screen === "read" && !quiet) setTimeout(onNav(function () { go("read", { key: R.u.key, para: R.i }); }), 3600);
  }

  function gradeReading(hits, heardAny) {
    R.mode = "idle";
    var els = spans(), total = hits.length, n = hits.filter(Boolean).length, u = R.u;
    if (!heardAny || n === 0) { nova("Hmm, I didn't hear the words. Tap the microphone and read nice and loud!", "happy"); return; }
    trophy("first-read");
    // fluency: words read correctly ÷ time from the first to the last word heard
    var ms = Math.max(4000, (R.t1 - R.t0) + 800), wcpm = Math.min(220, Math.round(n / (ms / 60000)));
    u.rec.flu = u.rec.flu || []; u.rec.flu[R.i] = { n: n, ms: ms }; save();
    $("meter").innerHTML = meterHtml(wcpm, u.p.goal);
    var newBest = wcpm > S.best;
    if (newBest) { S.best = wcpm; store(K.best, S.best); }
    if (wcpm >= u.p.goal && n / total >= 0.9) trophy("speed-goal");

    var missed = [];
    hits.forEach(function (h, k) { els[k].classList.toggle("heard", h); if (!h) { els[k].classList.add("miss"); missed.push(k); } });
    var stars = n === total ? 3 : n / total >= 0.85 ? 2 : 1;
    var old = setParaStars(stars);
    addPoints(stars * 2 + (stars === 3 && old < 3 ? 5 : 0));
    if (window.Tracker) Tracker.answer(stars === 3, "Read aloud" + (u.l ? ": " + u.l.skill : ""), { para: R.i + 1, words: total, read: n, wcpm: wcpm });
    var speedMsg = " You read " + wcpm + " words a minute" + (newBest ? ", your best ever!" : ".");

    if (stars === 3) {
      if (old < 3) { S.perfect++; store(K.perfect, S.perfect); }
      checkTrophies(); hud(); sfx.launch(); confetti(60);
      nova(pick(PRAISE.perfect) + speedMsg, "happy").then(onNav(function () { pulse($("nextBtn")); }));
      return;
    }
    sfx.ding();
    var seen = {}, q = [];
    missed.forEach(function (k) { var t = R.toks[k]; if (!seen[t]) { seen[t] = true; q.push(k); } });
    R.queue = q.slice(0, 3); R.missed = missed;
    nova((stars === 2 ? pick(PRAISE.good) : pick(PRAISE.tryAgain)) + " " + n + " of " + total + " words." + speedMsg + " Let's practise the orange ones.", "happy")
      .then(onNav(function () { practiceNext(); }));
  }

  function practiceNext() {
    var box = $("practice");
    if (!R.queue.length) {
      box.hidden = true;
      var els = spans(), left = R.missed.filter(function (k) { return !els[k].classList.contains("fixed"); }).length;
      if (!left) {
        var now = R.u.rec.paras[R.i] || 0;
        if (now < 3) setParaStars(now + 1);
        sfx.fanfare(); confetti(30);
        nova("You fixed every tricky word! Here's an extra star! Read it again to go faster, or go on.", "happy");
      } else nova("Great practising! Read the paragraph again, or go on to the next one.", "happy");
      return;
    }
    var k = R.queue.shift(), word = cleanWord(k), tries = 0, u = R.u;
    spans().forEach(function (e) { e.classList.remove("focus-now"); });
    spans()[k].classList.add("focus-now");
    box.hidden = false;
    box.innerHTML = '<div class="practice-card"><p>Let\'s practise this word:</p><div class="say-word" id="pWord">' + chunkCard(u, word) + "</div>" +
      '<div class="say-row"><button class="mini-btn" id="pHear">🔊 Hear it</button>' +
      (S.helper ? '<button class="big-btn go small" id="pSaid">✅ I said it!</button>' : '<button class="mic-btn" id="pMic"><span>🎤</span></button>') +
      '<button class="mini-btn" id="pSkip">Skip ➡</button></div></div>';
    $("pHear").onclick = function () { chunkOut(u, word, $("pWord")); };
    $("pSkip").onclick = function () { hush(); Listener.stop(); spans()[k].classList.remove("focus-now"); practiceNext(); };
    function success() {
      var el = spans()[k];
      el.classList.remove("miss", "focus-now"); el.classList.add("fixed");
      R.missed.forEach(function (m) { if (R.toks[m] === R.toks[k]) { spans()[m].classList.remove("miss"); spans()[m].classList.add("fixed"); } });
      $("pWord").classList.add("right"); sfx.ding(); addPoints(1);
      S.fixed++; store(K.fixed, S.fixed); checkTrophies();
      if (window.Tracker) Tracker.answer(true, "Tricky words", { word: word });
      nova(pick(PRAISE.fixed), "happy").then(onNav(function () { setTimeout(onNav(practiceNext), 200); }));
    }
    if ($("pSaid")) $("pSaid").onclick = success;
    if ($("pMic")) $("pMic").onclick = function () {
      var btn = $("pMic"); if (btn.classList.contains("live")) return;
      hush(); sfx.mic(); btn.classList.add("live");
      setTimeout(function () {
        listen({ target: Listener.tokens(word), single: true, vocab: R.vocab,
          onDone: function (res) {
            btn.classList.remove("live");
            if (!document.body.contains(btn)) return;
            if (res.hits[0]) return success();
            tries++;
            if (window.Tracker) Tracker.answer(false, "Tricky words", { word: word });
            if (tries >= 2) nova("Good try! It says " + word + ". We'll see it again soon.", "happy").then(onNav(function () { spans()[k].classList.remove("focus-now"); setTimeout(onNav(practiceNext), 200); }));
            else nova(res.heardAny ? "Close! Listen to the chunks." : "I couldn't hear you. Listen, then say it nice and loud!", "happy")
              .then(onNav(function () { return chunkOut(u, word, $("pWord")); }))
              .then(onNav(function () { nova("Your turn! Tap the microphone.", "listen"); }));
          },
          onError: function (code) { btn.classList.remove("live"); micTrouble(code); }
        });
      }, 200);
    };
    nova("Let's practise " + word + ". Listen!", "happy").then(onNav(function (still) {
      if (!still) return;
      return chunkOut(u, word, $("pWord")).then(function (ok) { if (ok) nova(S.helper ? "Now you say it! Then tap I said it." : "Now you say it! Tap the microphone.", S.helper ? "happy" : "listen"); });
    }));
  }

  // helper mode (no mic): the child reads to a grown-up
  function selfReport() {
    if (R.mode === "tricky") return endTricky();
    trophy("first-read");
    var marked = view.querySelectorAll("#storyText .w.miss").length, stars = marked ? 2 : 3, old = setParaStars(stars);
    addPoints(stars * 2);
    if (stars === 3 && old < 3) { S.perfect++; store(K.perfect, S.perfect); }
    if (window.Tracker) Tracker.answer(stars === 3, "Read aloud" + (R.u.l ? ": " + R.u.l.skill : ""), { para: R.i + 1, helper: true });
    checkTrophies(); hud(); sfx.fanfare(); confetti(40);
    nova(pick(PRAISE.perfect), "happy").then(onNav(function () { pulse($("nextBtn")); }));
  }
  function trickyMode() {
    if (R.mode === "tricky") return endTricky();
    R.mode = "tricky";
    $("trickyBtn").textContent = "▶ Practise them";
    nova("Grown-up: tap the words that were tricky, then tap Practise them.", "happy");
  }
  function endTricky() {
    R.mode = "idle";
    $("trickyBtn").textContent = "🤔 Tricky word";
    var q = [], seen = {};
    spans().forEach(function (e, k) { if (e.classList.contains("miss") && !seen[R.toks[k]]) { seen[R.toks[k]] = true; q.push(k); } });
    R.missed = q.slice(); R.queue = q.slice(0, 4);
    if (q.length) practiceNext(); else nova("No tricky words? Great reading!", "happy");
  }

  /* ---------------- Check-up / Phase Check questions ---------------- */
  function renderQuiz(arg) {
    var u = unit(arg.key), qi = arg.q || 0, Q = u.quiz[qi], tries = 0;
    var score = arg.score || 0, firstAll = arg.firstAll !== false;
    var order = arg.order || shuffle(Q.choices.map(function (_, k) { return k; }));
    $("topTitle").textContent = (u.kind === "check" ? "Phase Check" : "Check-up") + " · " + (qi + 1) + "/" + u.quiz.length;
    view.innerHTML = novaRow(Q.q, "happy") +
      '<div class="quiz-box" style="' + themeVars(u.p) + '">' +
        '<div class="round-dots">' + u.quiz.map(function (_, k) { return '<i class="' + (k < qi ? "done" : k === qi ? "now" : "") + '"></i>'; }).join("") + "</div>" +
        '<h2 class="quiz-q">' + esc(Q.q) + ' <button class="mini-btn" id="qSay">🔊</button></h2>' +
        '<div class="choice-col">' + order.map(function (k) { return '<button class="choice qa" data-k="' + k + '"><span class="qt">' + esc(Q.choices[k]) + "</span></button>"; }).join("") + "</div>" +
        '<div class="why" id="why" hidden></div>' +
        '<div class="quiz-next" id="qNextRow" hidden><button class="big-btn go" id="qNext">Next ▶</button></div>' +
        '<p class="look-back"><button class="mini-btn" id="lookBack">📖 Look back at the story</button></p>' +
      "</div>";
    function readAll() {
      nova(Q.q, "happy").then(onNav(function (still) {
        if (!still) return;
        var chain = Promise.resolve(true);
        view.querySelectorAll(".qa").forEach(function (el) {
          chain = chain.then(function (ok) {
            if (!ok) return false;
            el.classList.add("on");
            return speak(el.textContent, { rate: 0.92 }).then(function (s) { el.classList.remove("on"); return s; });
          });
        });
      }));
    }
    $("qSay").onclick = readAll;
    $("lookBack").onclick = function () { showStory(u); };
    readAll();
    function reveal(correct) {
      view.querySelectorAll(".qa").forEach(function (x) { x.disabled = true; if (+x.dataset.k === Q.answer) x.classList.add("right"); });
      var why = $("why"); why.hidden = false;
      why.innerHTML = (correct ? "✅ " : "💡 ") + esc(Q.why);
      $("qNextRow").hidden = false;
      $("qNext").onclick = function () {
        var nextScore = score + (correct && !tries ? 1 : 0), fa = firstAll && correct && !tries;
        if (qi + 1 < u.quiz.length) go("quiz", { key: u.key, q: qi + 1, score: nextScore, firstAll: fa });
        else finishQuiz(u, nextScore, fa);
      };
    }
    view.querySelectorAll(".qa").forEach(function (el) {
      el.onclick = function () {
        var k = +el.dataset.k;
        if (k === Q.answer) {
          sfx.ding(); confetti(16); addPoints(tries ? 2 : 5);
          if (window.Tracker) Tracker.answer(!tries, u.kind === "check" ? "Phase Check" : "Comprehension", { item: u.title });
          reveal(true);
          nova(pick(PRAISE.right) + " " + Q.why, "happy");
        } else {
          tries++; el.classList.add("nope"); el.disabled = true; sfx.boop();
          if (tries >= 2) { if (window.Tracker) Tracker.answer(false, u.kind === "check" ? "Phase Check" : "Comprehension", { item: u.title }); reveal(false); nova("Here's the answer. " + Q.why, "happy"); }
          else nova(pick(PRAISE.oops), "happy");
        }
      };
    });
  }
  // a pop-up with the whole story, for looking back while answering
  function showStory(u) {
    var d = document.createElement("div");
    d.className = "story-pop";
    d.innerHTML = '<div class="sp-sheet"><h3>' + esc(u.title) + "</h3>" + u.passage.map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("") +
      '<button class="big-btn go" id="spClose">Back to the question</button></div>';
    document.body.appendChild(d);
    d.onclick = function (e) { if (e.target === d || e.target.id === "spClose") d.remove(); };
  }

  function finishQuiz(u, score, firstAll) {
    if (u.kind === "lesson") {
      if (firstAll) trophy("quiz-whiz");
      u.rec.quiz = true; save();
      return finishLesson(u, firstAll);
    }
    // Phase Check
    var c = u.rec, p = u.p, pass = score >= 4, firstPass = pass && !c.passed;
    c.score = Math.max(c.score || 0, score); c.wcpm = Math.max(c.wcpm || 0, unitWcpm(u));
    if (pass) c.passed = true;
    save();
    if (window.Tracker) Tracker.complete("phasecheck", score, u.quiz.length, { item: p.title, passed: pass, wcpm: unitWcpm(u) || null });
    current = { screen: "done", arg: { key: u.key } };
    var nextP = PHASES[p.n];
    if (pass) {
      if (firstPass) { giveSticker("p:" + p.id); addPoints(20); giveTicket(); }
      checkTrophies(); hud(); sfx.launch(); confetti(100);
      view.innerHTML = novaRow("", "wow") +
        '<div class="celebrate" style="' + themeVars(p) + '"><div class="sticker-reveal' + (firstPass ? " new" : "") + '"><span>' + p.badge.emoji + "</span></div>" +
        "<h2>Phase " + p.n + " passed!</h2><p class=\"done-loot\">" + score + " of " + u.quiz.length + " correct" + (firstPass ? " · ⭐ +20 · 🎟️ +1 Prize Wheel ticket" : "") + "</p>" +
        '<div class="done-actions">' + (nextP ? '<button class="big-btn go" id="dNext">🚀 ' + (nextP.lessons ? "Phase " + nextP.n + ": " + esc(nextP.title) : "Phase " + nextP.n + " is coming soon!") + "</button>" : "") +
        '<button class="big-btn alt" id="dHome">🗺️ Phase path</button></div></div>';
      nova(firstPass ? "Blast off! You passed Phase " + p.n + " and earned the " + p.badge.name + "!" : "You passed again! Great reading!", "wow");
      if ($("dNext")) $("dNext").onclick = function () { if (nextP.lessons) go("phase", nextP.id); else go("home"); };
    } else {
      hud();
      view.innerHTML = novaRow("", "happy") +
        '<div class="celebrate" style="' + themeVars(p) + '"><div class="big-emoji">🛠️</div><h2>' + score + " of " + u.quiz.length + " this time</h2>" +
        "<p>You need 4 to pass. Look back at the story, then try the questions again. You can do it!</p>" +
        '<div class="done-actions"><button class="big-btn go" id="dRetry">🔁 Try the questions again</button><button class="big-btn alt" id="dReread">📖 Read the story again</button><button class="big-btn alt" id="dHome">🗺️ Phase path</button></div></div>';
      nova("Good effort! You got " + score + ". You need 4 to pass. Look back at the story and try again!", "happy");
      $("dRetry").onclick = function () { go("quiz", { key: u.key }); };
      $("dReread").onclick = function () { go("read", { key: u.key, para: 0 }); };
    }
    $("dHome").onclick = function () { go("home"); };
  }

  function finishLesson(u, quizPerfect) {
    var r = u.rec, l = u.l, wasDone = r.done, storyDone = r.seen >= l.passage.length;
    current = { screen: "done", arg: { key: u.key } };
    $("topTitle").textContent = l.title;
    var needWrite = l.write && !r.write && !wasDone;
    if (!storyDone || !r.lab || !r.quiz || needWrite) {
      var need = !r.lab ? "lab" : !storyDone ? "read" : !r.quiz ? "quiz" : "write";
      var MSG = { lab: "Finish the Word Lab to win the sticker!", read: "Now read every paragraph to win the sticker!", quiz: "Now answer the Check-up questions to win the sticker!",
                  write: "Super! One last mission: write about the story in your own words!" };
      var BTN = { lab: "🔤 Word Lab", read: "📖 Keep reading", quiz: "❓ Check-up", write: "✏️ Write It" };
      view.innerHTML = novaRow((need === "write" ? "" : "Great work! ") + MSG[need], "happy") +
        '<div class="celebrate"><button class="big-btn go" id="dGo">' + BTN[need] + "</button></div>";
      nova($("novaSay").textContent, "happy");
      $("dGo").onclick = function () { if (need === "read") go("read", { key: u.key, para: Math.min(r.seen, l.passage.length - 1) }); else go(need, { key: u.key }); };
      return;
    }
    r.done = true; save();
    var newSticker = giveSticker("l:" + l.id);
    if (!wasDone) { giveTicket(); addPoints(10); }
    var w = unitWcpm(u);
    if (window.Tracker) Tracker.complete("lesson", unitStars(u), 3, { item: l.title, firstTime: !wasDone, quizPerfect: !!quizPerfect, wcpm: w || null });
    checkTrophies(); hud(); sfx.launch(); confetti(90);
    var p = u.p, nextL = p.lessons.filter(function (x) { return !lrec(x.id).done; })[0], allDone = !nextL;
    view.innerHTML = novaRow("", "wow") +
      '<div class="celebrate" style="' + themeVars(p) + '"><div class="sticker-reveal' + (newSticker ? " new" : "") + '"><span>' + l.sticker.emoji + "</span></div>" +
      "<h2>You finished “" + esc(l.title) + "”!</h2>" +
      '<p class="done-stars">' + starsHtml(unitStars(u)) + "</p>" +
      (w ? '<div class="meter big">' + meterHtml(w, p.goal) + "</div>" : "") +
      (wasDone ? "" : '<p class="done-loot">🎟️ +1 Prize Wheel ticket · ⭐ +10 bonus</p>') +
      '<div class="done-actions">' +
        (nextL ? '<button class="big-btn go" id="dNext">📗 Next: ' + esc(nextL.title) + "</button>" : '<button class="big-btn go" id="dCheck">🏁 Take the Phase Check</button>') +
        '<button class="big-btn alt" id="dAgain">🔁 Read it again</button><button class="big-btn alt" id="dHome">🗺️ Phase path</button>' +
      "</div></div>";
    nova(newSticker ? "Awesome! You earned the " + l.sticker.name + " sticker!" + (allDone ? " Now you're ready for the Phase Check!" : "") : "You read it again! Your reading keeps getting stronger!", "wow");
    if ($("dNext")) $("dNext").onclick = function () { go("lesson", nextL.id); };
    if ($("dCheck")) $("dCheck").onclick = function () { go("read", { key: "c:" + p.id, para: 0 }); };
    $("dAgain").onclick = function () { go("read", { key: u.key, para: 0 }); };
    $("dHome").onclick = function () { go("home"); };
  }

  /* ---------------- ✏️ Write It: answer in your own sentences ---------------- */
  function renderWrite(arg) {
    var u = unit(arg.key), l = u.l, wi = arg.w || 0, P = l.write[wi];
    $("topTitle").textContent = "Write It · " + (wi + 1) + "/" + l.write.length;
    view.innerHTML = novaRow("", "happy") +
      '<div class="round-dots">' + l.write.map(function (_, k) { return '<i class="' + (k < wi ? "done" : k === wi ? "now" : "") + '"></i>'; }).join("") + "</div>" +
      '<div class="write-box" style="' + themeVars(u.p) + '" id="padHost"></div>' +
      '<p class="look-back"><button class="mini-btn" id="lookBack">📖 Look back at the story</button></p>';
    $("lookBack").onclick = function () { showStory(u); };
    WritePad.mount($("padHost"), {
      prompt: P, buddy: "Nova", speak: speak, sfx: sfx, saveLabel: wi + 1 < l.write.length ? "Save it & next ▶" : "Save it ▶",
      say: function (m, mood) { return nova(m, mood === "wow" ? "wow" : "happy"); },
      listen: S.helper ? null : function (o) { listen({ target: o.target, vocab: o.vocab, single: o.single, onDone: o.onDone, onError: o.onError }); },
      onDone: function (res) {
        S.writing.push({ ts: Date.now(), lesson: l.id, prompt: P.p, text: res.text, stars: res.stars });
        if (S.writing.length > 200) S.writing = S.writing.slice(-200);
        store(K.writing, S.writing);
        addPoints(res.stars * 2);
        if (window.Tracker) Tracker.answer(res.stars >= 2, "Writing: " + l.skill, { text: res.text.slice(0, 200), stars: res.stars, tries: res.tries });
        if (wi + 1 < l.write.length) { go("write", { key: u.key, w: wi + 1 }); return; }
        var first = !u.rec.write;
        u.rec.write = true; save();
        if (first) addPoints(5);
        if (window.Tracker) Tracker.complete("writeit", res.stars, 3, { item: l.title });
        checkTrophies();
        finishLesson(u, null);
      }
    });
    nova(P.p, "happy");
  }

  /* ---------------- stickers & trophies ---------------- */
  function renderStickers() {
    $("topTitle").textContent = "My Stickers";
    var html = PHASES.filter(function (p) { return p.lessons; }).map(function (p) {
      var ls = p.lessons.map(function (l) {
        var got = S.stickers.indexOf("l:" + l.id) >= 0;
        return '<div class="stk' + (got ? " got" : "") + '" style="--bk:' + p.color + '"><span class="se">' + (got ? l.sticker.emoji : "❔") + "</span><small>" + (got ? esc(l.sticker.name) : esc(l.title)) + "</small></div>";
      }).join("");
      var bgot = S.stickers.indexOf("p:" + p.id) >= 0;
      ls += '<div class="stk badge' + (bgot ? " got" : "") + '" style="--bk:' + p.color + '"><span class="se">' + (bgot ? p.badge.emoji : "🏁") + "</span><small>" + (bgot ? esc(p.badge.name) : "Pass the Phase Check") + "</small></div>";
      return '<section class="album"><h3>Phase ' + p.n + ": " + esc(p.title) + '</h3><div class="stk-grid">' + ls + "</div></section>";
    }).join("");
    view.innerHTML = novaRow("Every lesson you finish adds a sticker. Pass a Phase Check to win a badge!", "happy") + html;
    nova($("novaSay").textContent, "happy");
  }
  function renderTrophies() {
    $("topTitle").textContent = "My Trophies";
    view.innerHTML = novaRow("Every trophy shows how hard you worked!", "happy") +
      '<div class="trophy-list">' + RR_TROPHIES.map(function (t) {
        var got = S.trophies.indexOf(t.id) >= 0;
        return '<div class="trophy' + (got ? " got" : "") + '"><span class="ti">' + (got ? t.icon : "🔒") + "</span><span><b>" + esc(t.name) + "</b><small>" + esc(t.desc) + "</small></span></div>";
      }).join("") + "</div>" +
      '<div class="stat-row"><span>⭐ ' + S.points + " points</span><span>⚡ Best: " + (S.best || 0) + " words/min</span><span>💯 " + S.perfect + " perfect paragraphs</span><span>🔧 " + S.fixed + " tricky words fixed</span><span>✏️ " + S.writing.length + " answers written</span></div>";
    nova($("novaSay").textContent, "happy");
  }

  /* ---------------- wiring ---------------- */
  $("backBtn").onclick = back;
  $("muteBtn").onclick = function () { S.mute = !S.mute; store(K.mute, S.mute); if (S.mute) hush(); hud(); };
  $("stkPill").onclick = function () { go("stickers"); };
  $("trophyBtn").onclick = function () { go("trophies"); };
  document.addEventListener("keydown", function (e) {
    if (current.screen !== "read" || !R) return;
    if (e.key === "ArrowRight") { e.preventDefault(); nextPara(); }
    else if (e.key === "ArrowLeft" && R.i > 0) { e.preventDefault(); go("read", { key: R.u.key, para: R.i - 1 }); }
    else if (e.key === " " && $("micBtn")) { e.preventDefault(); toggleMic(); }
  });

  hud();
  go("home");
  window.RocketApp = { go: go, state: S };
})();
