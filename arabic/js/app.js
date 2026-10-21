/* ============================================================
   Arabic Oasis — app engine
   Screens: home (track → phase path) → phase → lesson
            👋 Meet the Letters → 🎮 Letter Game → ✍️ Trace It → 🗣️ Talk Time (3rd grade)
            Talk lessons (KG Magic Words): 👋 Meet the Words → 🎮 Word Game
            · stickers · trophies
   Arabic is spoken with an Arabic voice when the device has one;
   otherwise Jamal says an English spelling of the sound (LETTERS.say,
   phrase .tr). Tracing uses TracePad in glyph mode (js/tracepad.js,
   shared with tracewrite/).
   ============================================================ */
(function () {
  "use strict";

  /* ---------------- storage ---------------- */
  var K = { pts: "ar_points", stk: "ar_stickers", tro: "ar_trophies", les: "ar_lessons", met: "ar_met", track: "ar_track",
            said: "ar_said", dots: "ar_dots", traced: "ar_traced", read: "ar_read", mute: "ar_mute", tickets: "rw_tickets" };
  function load(k, d) { try { var v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }
  function store(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  var S = { points: load(K.pts, 0), stickers: load(K.stk, []), trophies: load(K.tro, []), lessons: load(K.les, {}), met: load(K.met, []),
            said: load(K.said, 0), dots: load(K.dots, 0), traced: load(K.traced, 0), read: load(K.read, 0), mute: load(K.mute, false), track: load(K.track, "") };
  function lrec(id) {
    if (!S.lessons[id]) S.lessons[id] = { meet: false, game: false, read: false, trace: false, talk: false, done: false, stars: {} };
    return S.lessons[id];
  }
  function save() { store(K.les, S.lessons); }

  // the Hub login decides the track; with nobody logged in the child picks one
  function hubGrade() {
    try {
      var id = localStorage.getItem("hub_activeKid");
      var kid = id && JSON.parse(localStorage.getItem("hub_kids") || "[]").filter(function (k) { return k.id === id; })[0];
      return kid && (kid.grade === "kg" || kid.grade === "g3") ? kid.grade : "";
    } catch (e) { return ""; }
  }
  var LOCKED = hubGrade();
  function track() { return LOCKED || S.track; }
  function phases() { return PHASES[track()] || []; }
  function phaseById(id) { var ps = phases(); for (var i = 0; i < ps.length; i++) if (ps[i].id === id) return ps[i]; return ps[0]; }
  function allLessons() { var out = []; ["kg", "g3"].forEach(function (t) { PHASES[t].forEach(function (p) { (p.lessons || []).forEach(function (l) { out.push({ l: l, p: p, t: t }); }); }); }); return out; }
  function lessonById(id) { var a = allLessons().filter(function (x) { return x.l.id === id; })[0]; return a ? a.l : null; }
  function phaseOfLesson(id) { var a = allLessons().filter(function (x) { return x.l.id === id; })[0]; return a.p; }
  function trackOfLesson(id) { var a = allLessons().filter(function (x) { return x.l.id === id; })[0]; return a.t; }
  function phaseDone(p) { return !!p.lessons && p.lessons.every(function (l) { return lrec(l.id).done; }); }
  function phaseOpen(p) { return !!p.lessons && (p.n === 1 || phaseDone(phases()[p.n - 2])); }
  function needsTalk(l) { return l.kind === "letters" && !!l.talk; }
  function lessonComplete(l) {
    var r = lrec(l.id);
    if (l.kind === "talk") return r.meet && r.game;
    if (l.kind === "harakat") return r.meet && r.game && r.read && r.trace && r.talk;
    return r.meet && r.game && r.trace && (!needsTalk(l) || r.talk);
  }
  // every letter taught up to and including this lesson (for fair wrong answers)
  function lettersSoFar(l) {
    var out = [], t = trackOfLesson(l.id), stop = false;
    PHASES[t].forEach(function (p) { (p.lessons || []).forEach(function (x) { if (stop) return; if (x.letters) out = out.concat(x.letters); if (x.id === l.id) stop = true; }); });
    return out;
  }

  /* ---------------- dom helpers ---------------- */
  var $ = function (id) { return document.getElementById(id); };
  var view = $("view");
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function starsHtml(n, max) { var s = ""; for (var i = 0; i < (max || 3); i++) s += '<span class="st' + (i < n ? " on" : "") + '">★</span>'; return s; }
  function arSpan(text, cls) { return '<span class="ar' + (cls ? " " + cls : "") + '" lang="ar" dir="rtl">' + esc(text) + "</span>"; }

  /* ---------------- sound: English for Jamal, Arabic when the device can ---------------- */
  var enVoice = null, arVoice = null, speakToken = 0;
  function chooseVoices() {
    if (!window.speechSynthesis) return;
    var vs = speechSynthesis.getVoices();
    var en = vs.filter(function (v) { return /^en[-_]/i.test(v.lang); }), prefs = [/Aria/i, /Jenny/i, /Samantha/i, /Google US English/i, /Zira/i, /en-US/i];
    enVoice = null;
    for (var p = 0; p < prefs.length && !enVoice; p++) for (var i = 0; i < en.length; i++) if (prefs[p].test(en[i].name + " " + en[i].lang)) { enVoice = en[i]; break; }
    if (!enVoice && en.length) enVoice = en[0];
    var ar = vs.filter(function (v) { return /^ar([-_]|$)/i.test(v.lang); });
    arVoice = ar.filter(function (v) { return v.localService; })[0] || ar[0] || null;
    var chip = $("voiceChip"); if (chip) chip.outerHTML = voiceChip();
  }
  if (window.speechSynthesis) { chooseVoices(); speechSynthesis.onvoiceschanged = chooseVoices; }
  function utter(text, lang, rate, my) {
    return new Promise(function (resolve) {
      var finished = false;
      function done() { if (!finished) { finished = true; resolve(); } }
      if (my !== speakToken) return done();
      if (S.mute || !window.speechSynthesis) { setTimeout(done, Math.min(2500, 300 + text.length * 40)); return; }
      var u = new SpeechSynthesisUtterance(text);
      if (lang === "ar") { u.voice = arVoice; u.lang = arVoice.lang; u.rate = rate || 0.75; }
      else { if (enVoice) u.voice = enVoice; u.lang = "en-US"; u.rate = rate || 0.92; u.pitch = 1.05; }
      u.onend = done; u.onerror = done;
      speechSynthesis.speak(u);
      setTimeout(done, 3000 + text.length * 120);
    });
  }
  // parts: ["English", { ar: "باء", fb: "baa" }, ...] spoken in a row
  function say(parts) {
    if (!Array.isArray(parts)) parts = [parts];
    var my = ++speakToken;
    if (window.speechSynthesis) speechSynthesis.cancel();
    var chain = Promise.resolve();
    parts.forEach(function (p) {
      chain = chain.then(function () {
        if (typeof p === "string") return utter(p, "en", null, my);
        return arVoice ? utter(p.ar, "ar", p.rate, my) : utter(p.fb, "en", 0.8, my);
      });
    });
    return chain.then(function () { return my === speakToken; });
  }
  function hush() { speakToken++; if (window.speechSynthesis) speechSynthesis.cancel(); }
  function sayLetter(ch) { return say([{ ar: LETTERS[ch].ar, fb: LETTERS[ch].say }]); }
  function sayWord(w) { return say([{ ar: w.ar, fb: w.tr }]); }
  function voiceChip() {
    return arVoice ? '<span class="mic-chip" id="voiceChip">🔊 Jamal speaks Arabic on this device!</span>'
      : '<span class="mic-chip off" id="voiceChip">🔈 No Arabic voice here, so Jamal says the sounds in English letters. Grown-ups: add an Arabic voice in the device’s text-to-speech settings.</span>';
  }
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
    bell: function () { tone([1046, 1318, 1568], 0.25, "sine", 0.07); }
  };

  /* ---------------- Jamal the Camel ---------------- */
  function buddyRow(msg, mood) {
    return '<div class="echo-row"><div class="echo-bird" id="buddyBot">' + Art.jamal(mood) + '</div><div class="echo-bubble" id="buddySay">' + esc(msg || "") + "</div></div>";
  }
  // show text in the bubble; speak `parts` (defaults to the text)
  function jamal(msg, mood, parts) {
    var b = $("buddySay"), bot = $("buddyBot");
    // while tracing, the bubble may only grow: a shrinking bubble would move the pad under the child's finger
    if (b && pad) b.style.minHeight = b.offsetHeight + "px";
    if (b) { b.textContent = msg; b.classList.remove("pop"); void b.offsetWidth; b.classList.add("pop"); }
    if (bot) bot.innerHTML = Art.jamal(mood || "happy");
    return parts === false ? Promise.resolve(true) : say(parts || [msg]);
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
    var t = AR_TROPHIES.filter(function (x) { return x.id === id; })[0]; if (!t) return;
    S.trophies.push(id); store(K.tro, S.trophies);
    toast(t.icon + " Trophy: " + t.name + "!"); sfx.fanfare();
  }
  var toastTimer = null;
  function toast(msg) {
    var t = $("toast"); t.textContent = msg; t.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.classList.remove("show"); }, 2800);
  }
  function confetti(n) {
    var box = $("confetti"), colors = ["#ffd43b", "#ff8fab", "#69db7c", "#74c0fc", "#ffa94d", "#e0b07a"];
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
  function meetLetter(ch) {
    if (S.met.indexOf(ch) >= 0) return;
    S.met.push(ch); store(K.met, S.met);
    trophy("first-letter");
    if (S.met.length >= 28) trophy("all-letters");
  }

  /* ---------------- navigation ---------------- */
  var current = { screen: "home" }, pad = null, nav = 0;
  function onNav(fn) { var my = nav; return function (x) { if (my === nav && fn) return fn(x); }; }
  function go(screen, arg) {
    hush(); nav++;
    if (pad) { pad.destroy(); pad = null; }
    current = { screen: screen, arg: arg };
    $("backBtn").hidden = screen === "home";
    document.body.dataset.screen = screen;
    window.scrollTo(0, 0);
    ({ home: renderHome, phase: renderPhase, lesson: renderLesson, meet: renderMeet, game: renderGame, trace: renderTrace,
       tmeet: renderTalkMeet, tquiz: renderTalkQuiz, hmeet: renderMarkMeet, hgame: renderMarkGame, hread: renderReadWords, stickers: renderStickers, trophies: renderTrophies })[screen](arg);
  }
  function back() {
    var c = current;
    if (/^(meet|game|trace|tmeet|tquiz|hmeet|hgame|hread|done)$/.test(c.screen)) go("lesson", c.arg.lesson);
    else if (c.screen === "lesson") go("phase", phaseOfLesson(c.arg).id);
    else go("home");
  }

  /* ---------------- home ---------------- */
  function renderHome() {
    $("topTitle").textContent = "Arabic Oasis";
    if (!track()) {
      view.innerHTML = buddyRow("Marhaban! I'm Jamal the Camel! Which path are you on?") +
        '<div class="ar-tracks">' + ["kg", "g3"].map(function (t) {
          return '<button class="ar-track" data-track="' + t + '"><span class="ar-track-e">' + TRACKS[t].emoji + "</span><b>" + esc(TRACKS[t].title) + "</b><small>" + esc(TRACKS[t].sub) + "</small></button>";
        }).join("") + "</div>";
      view.querySelectorAll("[data-track]").forEach(function (el) { el.onclick = function () { sfx.pop(); S.track = el.dataset.track; store(K.track, S.track); go("home"); }; });
      jamal("Marhaban! I'm Jamal the Camel! Which path are you on?", "happy", ["Marhaban!", { ar: "مرحبا", fb: "marhaban" }, "I'm Jamal the Camel! Which path are you on?"]);
      return;
    }
    var ps = phases();
    var cards = ps.map(function (p) {
      var open = phaseOpen(p), soon = !p.lessons, done = phaseDone(p), n = soon ? 0 : p.lessons.filter(function (l) { return lrec(l.id).done; }).length;
      var status = soon ? "Coming soon" : !open ? "🔒 Finish Phase " + (p.n - 1) + " first" : done ? "✅ All done!" : n + " of " + p.lessons.length + " lessons";
      return '<button class="phase-card ' + (soon ? "soon" : !open ? "locked" : done ? "passed" : "open") + '" data-phase="' + p.id + '" style="--bk:' + p.color + ";--bk2:" + p.accent + '"' + (open ? "" : " disabled") + ">" +
        '<span class="ph-n">' + (done ? "⭐" : p.emoji) + "</span>" +
        '<span class="ph-txt"><small>Phase ' + p.n + "</small><b>" + esc(p.title) + "</b><em>" + esc(p.sub) + '</em><span class="ph-status">' + status + "</span></span>" +
        (open ? '<span class="ph-bar"><i style="width:' + Math.round(100 * n / p.lessons.length) + '%"></i></span>' : "") + "</button>";
    }).join('<span class="path-dash" aria-hidden="true"></span>');
    var greet = track() === "kg" ? "Marhaban, little explorer! Let's learn Arabic letters together. Pick a phase!" : "Marhaban! Ready to cross the alphabet desert? All 28 letters are waiting. Pick a phase!";
    view.innerHTML = buddyRow(greet) +
      '<div class="mic-row">' + voiceChip() + "</div>" +
      '<p class="ar-path-name">' + TRACKS[track()].emoji + " " + esc(TRACKS[track()].title) + (LOCKED ? "" : ' · <button class="link-btn" id="switchTrack">switch path</button>') + "</p>" +
      '<div class="phase-path">' + cards + "</div>" +
      '<div class="home-actions"><button class="big-btn alt" data-go="stickers">🎟️ My Sticker Book</button><button class="big-btn alt" data-go="trophies">🏆 My Trophies</button><button class="big-btn alt" id="jokeBtn">😂 Camel joke</button></div>';
    view.querySelectorAll("[data-phase]").forEach(function (el) { el.onclick = function () { sfx.pop(); go("phase", el.dataset.phase); }; });
    view.querySelectorAll("[data-go]").forEach(function (el) { el.onclick = function () { go(el.dataset.go); }; });
    if ($("switchTrack")) $("switchTrack").onclick = function () { S.track = ""; store(K.track, ""); go("home"); };
    $("jokeBtn").onclick = function () { jamal(pick(JOKES), "wow"); };
    jamal(greet, "happy", ["Marhaban!", { ar: "مرحبا", fb: "marhaban" }, greet.replace(/^Marhaban[^!]*! /, "")]);
  }

  function renderPhase(pid) {
    var p = phaseById(pid);
    $("topTitle").textContent = "Phase " + p.n + ": " + p.title;
    view.innerHTML = buddyRow("Pick a lesson! Arabic is read from right to left, like a camel walking home!") +
      '<div class="steps">' + p.lessons.map(function (l, i) {
        var r = lrec(l.id), talk = l.kind === "talk";
        var hk = l.kind === "harakat";
        var minis = talk ? ["meet:👋", "game:🎮"] : hk ? ["meet:👋", "game:🎮", "read:📖", "trace:✍️", "talk:🗣️"] : ["meet:👋", "game:🎮", "trace:✍️"].concat(needsTalk(l) ? ["talk:🗣️"] : []);
        return '<button class="step-card' + (r.done ? " ok" : "") + '" data-lesson="' + l.id + '"><span class="step-n">' + (i + 1) + "</span>" +
          '<span class="step-ic">' + (r.done ? l.sticker.emoji : talk ? "💬" : hk ? "🎵" : "🔤") + "</span>" +
          '<span class="step-txt"><b class="' + (talk || hk ? "" : "ar ar-title") + '"' + (talk || hk ? "" : ' lang="ar" dir="rtl"') + ">" + esc(l.title) + "</b>" +
          '<span class="steps-mini">' + minis.map(function (m) { var k = m.split(":"); return '<i class="' + (r[k[0]] ? "ok" : "") + '">' + k[1] + "</i>"; }).join("") + "</span></span>" +
          '<span class="step-go">' + (r.done ? "✅" : "▶") + "</span></button>";
      }).join("") + "</div>";
    view.querySelectorAll("[data-lesson]").forEach(function (el) { el.onclick = function () { sfx.pop(); go("lesson", el.dataset.lesson); }; });
    jamal($("buddySay").textContent, "happy");
  }

  function stepCard(n, icon, name, sub, ok, step) {
    return '<button class="step-card' + (ok ? " ok" : "") + '" data-step="' + step + '"><span class="step-n">' + n + '</span><span class="step-ic">' + icon + "</span>" +
      '<span class="step-txt"><b>' + esc(name) + "</b><small>" + esc(sub) + '</small></span><span class="step-go">' + (ok ? "✅" : "▶") + "</span></button>";
  }
  function renderLesson(id) {
    var l = lessonById(id), r = lrec(id);
    $("topTitle").textContent = l.kind === "talk" ? l.title : "Letters";
    if (l.kind === "talk") {
      var T = TALK[l.talk];
      view.innerHTML = '<div class="letter-strip">' + T.phrases.map(function (x) { return '<span class="ls-chip wide">' + x.e + "</span>"; }).join("") + "</div>" +
        buddyRow(r.done ? "You know your magic words! Use them at home today!" : "Magic words make people smile. Let's learn them in Arabic!") +
        '<div class="steps">' +
          stepCard(1, "👋", "Meet the Words", r.meet ? "Done! ✔" : "Hear them, say them out loud", r.meet, "tmeet") +
          stepCard(2, "🎮", "Word Game", r.game ? "Done! ✔" : "What does it mean? What would you say?", r.game, "tquiz") +
        "</div>";
    } else if (l.kind === "harakat") {
      view.innerHTML = '<div class="letter-strip" dir="rtl">' + l.marks.map(function (m) { return '<span class="ls-chip">' + arSpan("ب" + HARAKAT[m].mark) + "</span>"; }).join("") + "</div>" +
        buddyRow(r.done ? "Mumtaaz! You can read with harakat now!" : "Harakat are little marks that tell a letter which sound to make. Let's go!") +
        '<div class="steps">' +
          stepCard(1, "👋", "Meet the Mark" + (l.mix ? "s" : ""), r.meet ? "Done! ✔" : "See it, hear it, say the sounds", r.meet, "hmeet") +
          stepCard(2, "🎮", "Sound Game", r.game ? "Done! ✔" : "Hear a sound, find it. See it, say it", r.game, "hgame") +
          stepCard(3, "📖", "Read Words", r.read ? "Done! ✔" : "Read real Arabic words, sound by sound", r.read, "hread") +
          stepCard(4, "✍️", "Trace It", r.trace ? "Done! ✔" : "Write letters WITH their marks", r.trace, "trace") +
          stepCard(5, "🗣️", "Talk Time: " + TALK[l.talk].title, r.talk ? "Done! ✔" : "Real Arabic words to say every day", r.talk, "tmeet") +
        "</div>";
    } else {
      view.innerHTML = '<div class="letter-strip" dir="rtl">' + l.letters.map(function (x) { return '<span class="ls-chip">' + arSpan(x) + "</span>"; }).join("") + "</div>" +
        buddyRow(r.done ? "Mumtaaz! You finished these letters. Come back any time to practise!" : !r.meet ? "First, let's meet the letters!" : !r.game ? "Let's play the letter game!" : !r.trace ? "Now let's write them with your finger!" : "Talk Time! Let's say some real Arabic!") +
        '<div class="steps">' +
          stepCard(1, "👋", "Meet the Letters", r.meet ? "Done! ✔" : "See, hear and say each letter", r.meet, "meet") +
          stepCard(2, "🎮", "Letter Game", r.game ? "Done! ✔" : "Find letters by sound, picture and dots", r.game, "game") +
          stepCard(3, "✍️", "Trace It", r.trace ? "Done! ✔" : "Write each letter with your finger", r.trace, "trace") +
          (needsTalk(l) ? stepCard(4, "🗣️", "Talk Time: " + TALK[l.talk].title, r.talk ? "Done! ✔" : "Real Arabic words to say every day", r.talk, "tmeet") : "") +
        "</div>";
    }
    view.querySelectorAll("[data-step]").forEach(function (el) { el.onclick = function () { sfx.pop(); go(el.dataset.step, { lesson: id, i: 0 }); }; });
    jamal($("buddySay").textContent, "happy");
  }

  /* ---------------- 👋 meet the letters ---------------- */
  function dotWords(ch) {
    var d = LETTERS[ch].dots;
    if (!d[0]) return "no dots";
    return (["", "one dot", "two dots", "three dots"][d[0]]) + (d[1] === "inside" ? " inside" : d[1] === "below" ? " below" : " on top");
  }
  function renderMeet(arg) {
    var l = lessonById(arg.lesson), heard = {};
    $("topTitle").textContent = "Meet the Letters";
    view.innerHTML = buddyRow("") +
      '<div class="meet-grid ar-grid" dir="rtl">' + l.letters.map(function (ch) {
        var L = LETTERS[ch];
        return '<button class="meet-card ar-card" data-ch="' + ch + '">' + arSpan(ch, "ar-big") +
          '<span class="ar-name" dir="ltr">' + esc(L.name) + "</span>" +
          '<span class="ar-pic">' + L.word.e + "</span>" + arSpan(L.word.ar, "ar-word") + '<small dir="ltr">' + esc(L.word.tr + " · " + L.word.en) + "</small></button>";
      }).join("") + "</div>" +
      '<div class="home-actions"><button class="big-btn go" id="meetDone">▶ Play the Letter Game</button></div>';
    view.querySelectorAll(".ar-card").forEach(function (el) {
      el.onclick = function () {
        var ch = el.dataset.ch, L = LETTERS[ch]; heard[ch] = true; el.classList.add("heard"); meetLetter(ch);
        el.classList.remove("pop"); void el.offsetWidth; el.classList.add("pop");
        jamal(L.how, "happy", ["This is", { ar: L.ar, fb: L.say }, L.how, "Like", { ar: L.word.ar, fb: L.word.tr }, L.word.en + "!"]);
        if (Object.keys(heard).length === l.letters.length) pulse($("meetDone"));
      };
    });
    $("meetDone").onclick = function () {
      var r = lrec(l.id); if (!r.meet) { r.meet = true; save(); addPoints(3); }
      l.letters.forEach(meetLetter);
      go("game", { lesson: l.id });
    };
    jamal("Tap each letter to hear its name and sound. Arabic letters love dots, so count them!", "happy");
  }
  function pulse(el) { if (!el) return; el.classList.remove("pulse"); void el.offsetWidth; el.classList.add("pulse"); }

  /* ---------------- 🎮 letter game ---------------- */
  function renderGame(arg) {
    var l = lessonById(arg.lesson), g3 = trackOfLesson(l.id) === "g3", pool = lettersSoFar(l), round = 0, score = 0;
    var kinds = g3 ? ["hear", "pic", "dots", "name"] : ["hear", "pic", "dots"];
    var n = g3 ? 8 : Math.min(6, l.letters.length * 2);
    var order = shuffle(l.letters); while (order.length < n) order = order.concat(shuffle(l.letters));
    var plan = order.slice(0, n).map(function (ch, i) { return { ch: ch, t: kinds[i % kinds.length] }; });
    $("topTitle").textContent = "Letter Game";
    function others(ch, k) {
      var look = LOOKALIKE.filter(function (g) { return g.indexOf(ch) >= 0; })[0] || [];
      var a = shuffle(look.filter(function (x) { return x !== ch && pool.indexOf(x) >= 0; }));
      var b = shuffle(pool.filter(function (x) { return x !== ch && a.indexOf(x) < 0; }));
      return a.concat(b).slice(0, k || 2);
    }
    function frame(inner, msg, mood) {
      view.innerHTML = buddyRow(msg, mood) + '<div class="game-box">' +
        '<div class="round-dots">' + plan.map(function (_, i) { return '<i class="' + (i < round - 1 ? "done" : i === round - 1 ? "now" : "") + '"></i>'; }).join("") + "</div>" + inner + "</div>";
    }
    function next() {
      if (round >= plan.length) return finish();
      var r = plan[round++];
      if (r.t === "dots" && !dotRound(r.ch)) r.t = "hear";
      if (r.t === "hear") hearRound(r.ch);
      else if (r.t === "pic") picRound(r.ch);
      else if (r.t === "name") nameRound(r.ch);
    }
    function choose(target, skill, onRight, onWrong) {
      var tries = 0;
      view.querySelectorAll(".ar-choice").forEach(function (el) {
        el.onclick = function () {
          if (el.dataset.c === target) {
            view.querySelectorAll(".ar-choice").forEach(function (b) { b.disabled = true; });
            el.classList.add("right"); sfx.ding(); confetti(14);
            if (!tries) { score++; addPoints(2); }
            if (window.Tracker) Tracker.answer(!tries, skill, { letter: target });
            onRight(!tries);
          } else {
            tries++; el.classList.add("nope"); sfx.boop();
            onWrong(el.dataset.c, tries);
          }
        };
      });
    }
    function letterButtons(cs) { return '<div class="choice-row" dir="rtl">' + cs.map(function (c) { return '<button class="choice ar-choice ar-letter" data-c="' + c + '">' + arSpan(c) + "</button>"; }).join("") + "</div>"; }
    function praiseThen(extraParts) {
      var m = pick(PRAISE.right);
      jamal(m, "wow", [m].concat(extraParts || [])).then(onNav(function () { setTimeout(onNav(next), 250); }));
    }
    function hearRound(ch) {
      var cs = shuffle([ch].concat(others(ch)));
      frame('<p class="game-q">Which letter is this? <button class="mini-btn" id="again">🔊 Hear it</button></p>' + letterButtons(cs), "Listen! Which letter is it?", "happy");
      jamal("Listen! Which letter is it?", "happy", ["Listen! Which letter is", { ar: LETTERS[ch].ar, fb: LETTERS[ch].say }]);
      $("again").onclick = function () { sayLetter(ch); };
      choose(ch, "Letter sounds", function () { praiseThen(["That's", { ar: LETTERS[ch].ar, fb: LETTERS[ch].say }]); },
        function (c) { jamal(pick(PRAISE.oops) + " That one is " + LETTERS[c].name + ".", "think", [pick(PRAISE.oops), "That one is", { ar: LETTERS[c].ar, fb: LETTERS[c].say }]); });
    }
    function picRound(ch) {
      var W = LETTERS[ch].word, cs = shuffle([ch].concat(others(ch)));
      frame('<p class="game-q">Which letter does it start with? <button class="mini-btn" id="again">🔊</button></p>' +
        '<div class="say-word pic-say ar-pic-q"><span class="pic-big">' + W.e + "</span>" + arSpan(W.ar, "ar-word big") + "</div>" + letterButtons(cs),
        W.tr + " means " + W.en + ". Which letter does it start with?", "happy");
      jamal("", "happy", [{ ar: W.ar, fb: W.tr }, "means " + W.en + ". Which letter does it start with? Look at the right side, where Arabic words begin!"]);
      $("buddySay").textContent = W.tr + " means " + W.en + ". Which letter does it start with? (Arabic starts on the RIGHT!)";
      $("again").onclick = function () { sayWord(W); };
      choose(ch, "Picture words", function () { praiseThen([{ ar: W.ar, fb: W.tr }, "starts with", { ar: LETTERS[ch].ar, fb: LETTERS[ch].say }]); },
        function (c, t) { jamal(t >= 2 ? "Look at the first letter on the right side of the word!" : pick(PRAISE.oops), "think"); });
    }
    function dotRound(ch) {
      var key = dotWords(ch), cand = shuffle(pool.filter(function (x) { return x !== ch && dotWords(x) !== key; }));
      var look = (LOOKALIKE.filter(function (g) { return g.indexOf(ch) >= 0; })[0] || []).filter(function (x) { return x !== ch && pool.indexOf(x) >= 0 && dotWords(x) !== key; });
      var picks = shuffle(look).concat(cand.filter(function (x) { return look.indexOf(x) < 0; })).slice(0, 2);
      if (picks.length < 2) return false;
      var cs = shuffle([ch].concat(picks));
      frame('<p class="game-q">🔍 Dot Detective!</p><p class="ar-dotq">Find the letter with <b>' + esc(key) + "</b></p>" + letterButtons(cs), "Dot Detective! Find the letter with " + key + ".", "think");
      jamal("Dot Detective! Find the letter with " + key + ".", "think");
      choose(ch, "Letter dots", function (first) {
        if (first) { S.dots++; store(K.dots, S.dots); if (S.dots >= 5) trophy("dot-detective"); }
        praiseThen(["That's", { ar: LETTERS[ch].ar, fb: LETTERS[ch].say }, "with " + key + "."]);
      }, function (c) { jamal("Hmm, " + LETTERS[c].name + " has " + dotWords(c) + ". Count again!", "think"); });
      return true;
    }
    function nameRound(ch) {
      var cs = shuffle([ch].concat(others(ch)));
      frame('<p class="game-q">What is this letter called?</p><div class="say-word ar-show">' + arSpan(ch, "ar-huge") + "</div>" +
        '<div class="choice-row">' + cs.map(function (c) { return '<button class="choice word ar-choice" data-c="' + c + '">' + esc(LETTERS[c].name) + "</button>"; }).join("") + "</div>",
        "What is this letter called?", "happy");
      jamal("What is this letter called?", "happy");
      choose(ch, "Letter names", function () { praiseThen(["It's", { ar: LETTERS[ch].ar, fb: LETTERS[ch].say }]); },
        function () { jamal(pick(PRAISE.oops) + " Count the dots!", "think"); });
    }
    function finish() {
      var r = lrec(l.id), first = !r.game;
      r.game = true; r.stars.game = Math.max(r.stars.game || 0, score >= plan.length - 1 ? 3 : score >= plan.length / 2 ? 2 : 1); save();
      if (first) addPoints(5);
      if (window.Tracker) Tracker.complete("lettergame", score, plan.length, { item: "Arabic " + l.title });
      stepDone(l, r.stars.game, score + " of " + plan.length + " right!");
    }
    next();
  }

  /* ---------------- ✍️ trace each letter ---------------- */
  var AR_FONT = "'Noto Naskh Arabic', 'Amiri', 'Traditional Arabic', 'Arabic Typesetting', 'Geeza Pro', 'Noto Sans Arabic', 'Arial', serif";
  // what a lesson traces: its letters, or (harakat lessons) 3 syllables WITH their mark
  function traceItems(l) {
    if (l.kind !== "harakat") return l.letters.map(function (ch) { return { t: ch, ch: ch }; });
    if (l.mix) return l.marks.map(function (m) { return syl(l.letters[0], m); });
    return l.letters.slice(0, 3).map(function (ch) { return syl(ch, l.marks[0]); });
  }
  function renderTrace(arg) {
    var l = lessonById(arg.lesson), items = traceItems(l), i = arg.i || 0, it = items[i], ch = it.ch, L = LETTERS[ch], fails = 0, stars = arg.stars || [];
    var isSyl = !!it.m, sayIt = isSyl ? { ar: it.t, fb: it.fb } : { ar: L.ar, fb: L.say };
    $("topTitle").textContent = "Trace It · " + (i + 1) + "/" + items.length;
    view.innerHTML = buddyRow("") +
      '<div class="game-box ar-trace-box"><div class="round-dots">' + items.map(function (_, k) { return '<i class="' + (k < i ? "done" : k === i ? "now" : "") + '"></i>'; }).join("") + "</div>" +
      '<div class="ar-trace-head">' + arSpan(it.t, "ar-mid") + '<span><b>' + esc(isSyl ? it.tr : L.name) + "</b><small>" +
        (isSyl ? esc(HARAKAT[it.m].name + ": " + HARAKAT[it.m].where) : esc(dotWords(ch)) + " · " + L.word.e + " " + esc(L.word.tr)) + "</small></span></div>" +
      '<div class="ar-pad" id="pad"></div>' +
      '<div class="say-row"><button class="mini-btn" id="showMe">👀 Show me</button><button class="mini-btn" id="hearIt">🔊 Hear it</button><button class="mini-btn" id="clearIt">🧽 Start over</button></div>' +
      '<div id="nextRow"></div></div>';
    var mine = nav;
    var maxW = Math.max(160, Math.min(window.innerHeight * 0.48, 360));
    $("pad").style.width = "min(100%, " + Math.round(maxW) + "px)";
    TracePad.ready(AR_FONT.split(",")[0]).then(function () {
      if (mine !== nav) return;
      pad = TracePad.mount($("pad"), {
        w: 120, h: 120, glyph: { text: it.t, family: AR_FONT, rtl: ch !== "ا" }, guide: "full", ink: pick(["#e8590c", "#1c7ed6", "#2f9e44", "#ae3ec9"]),
        onStroke: function (r) {
          if (mine !== nav) return;
          if (!r.ok) { fails++; sfx.boop(); jamal(pick(PRAISE.traceOff), "think"); }
          else if (!r.complete) { if (r.missing === "dots") jamal(pick(isSyl ? PRAISE.mark : PRAISE.dots), "happy"); else jamal(pick(["Keep going!", "Nice, keep writing!", "More, more! Cover the whole letter!"]), "happy"); }
        },
        onDone: function () {
          if (mine !== nav) return;
          var st = fails === 0 ? 3 : fails <= 2 ? 2 : 1; stars[i] = st;
          S.traced++; store(K.traced, S.traced); if (S.traced >= 10) trophy("writer");
          if (window.Tracker) Tracker.answer(fails === 0, "Arabic writing", { letter: it.t });
          addPoints(st); sfx.bell(); confetti(st * 12);
          $("nextRow").innerHTML = '<div class="tw-win"><span class="done-stars">' + starsHtml(st) + '</span><button class="big-btn go" id="nextBtn">' + (i + 1 < items.length ? "Next ▶" : "🎉 Finish") + "</button></div>";
          $("nextBtn").onclick = function () {
            if (i + 1 < items.length) go("trace", { lesson: l.id, i: i + 1, stars: stars });
            else {
              var r = lrec(l.id), avg = Math.round(stars.reduce(function (a, b) { return a + (b || 1); }, 0) / items.length);
              r.trace = true; r.stars.trace = Math.max(r.stars.trace || 0, avg); save();
              if (window.Tracker) Tracker.complete("trace", avg, 3, { item: "Arabic " + l.title });
              stepDone(l, avg, isSyl ? "You wrote letters with harakat!" : "You wrote every letter!");
            }
          };
          var m = pick(PRAISE.trace);
          jamal(m, "wow", [m, "You wrote", sayIt]);
        }
      });
      $("showMe").onclick = function () { pad.clear(); pad.demo(); };
      $("clearIt").onclick = function () { pad.clear(); $("nextRow").innerHTML = ""; };
    });
    $("hearIt").onclick = function () { say(isSyl ? [sayIt, HARAKAT[it.m].how] : [sayIt, L.how]); };
    var intro = isSyl ? (i === 0 ? "Write the letter first, then add its little mark! " : "") + "Trace " + it.tr + ": " + L.name + " with " + HARAKAT[it.m].where + "."
      : (ch === "ا" ? "Alif goes from top to bottom, like rain falling! " : i === 0 ? "Arabic is written from right to left, so start on the right side! " : "") +
        "Trace over " + L.name + " with your finger." + (L.dots[0] ? " Don't forget the " + dotWords(ch).replace(/ (on top|below|inside)$/, "") + "!" : "");
    jamal(intro, "happy", ["Let's write", sayIt, intro]);
  }

  /* ---------------- 🎵 harakat: syllables, meet the mark, sound game, read words ---------------- */
  // a letter + one haraka → { t: text, tr: "ba", fb: what an English voice says, ch, m }
  function syl(ch, m) {
    var c = CONS[ch], H = HARAKAT[m];
    return { t: ch + H.mark, tr: c + H.v, fb: (c === "'" ? "" : c) + H.fb, ch: ch, m: m };
  }
  var MARK_OF = {};
  Object.keys(HARAKAT).forEach(function (m) { MARK_OF[HARAKAT[m].mark] = m; });
  // split a word with harakat into its syllables
  function wordParts(ar) {
    var parts = [];
    Array.from(ar).forEach(function (c) {
      if (MARK_OF[c] && parts.length) { var p = parts[parts.length - 1], s2 = syl(p.ch, MARK_OF[c]); p.t += c; p.tr = s2.tr; p.fb = s2.fb; p.m = s2.m; }
      else parts.push({ t: c, ch: c, tr: CONS[c] || c, fb: CONS[c] || c });
    });
    return parts;
  }
  function wordTr(w) { return wordParts(w.ar).map(function (p) { return p.tr; }).join(""); }
  function wordFb(w) { return wordParts(w.ar).map(function (p) { return p.fb; }).join("-"); }
  function marksSoFar(l) {   // every haraka taught up to and including this lesson
    var out = [], stop = false;
    PHASES[trackOfLesson(l.id)].forEach(function (p) {
      (p.lessons || []).forEach(function (x) {
        if (stop) return;
        if (x.kind === "harakat") x.marks.forEach(function (m) { if (out.indexOf(m) < 0) out.push(m); });
        if (x.id === l.id) stop = true;
      });
    });
    return out;
  }
  function circleMark(m) { return arSpan("\u25CC" + HARAKAT[m].mark, "ar-huge mark-big"); }

  function renderMarkMeet(arg) {
    var l = lessonById(arg.lesson), heard = 0;
    var letters = l.mix ? l.letters.slice(0, 4) : l.letters;
    $("topTitle").textContent = "Meet the Mark" + (l.mix ? "s" : "");
    view.innerHTML = buddyRow("") +
      '<div class="mark-cards">' + l.marks.map(function (m) {
        return '<button class="mark-card" data-m="' + m + '">' + circleMark(m) + "<b>" + esc(HARAKAT[m].name) + " " + HARAKAT[m].e + "</b><small>" + esc(HARAKAT[m].where) + " · says “" + HARAKAT[m].v + "”</small></button>";
      }).join("") + "</div>" +
      '<p class="game-q">Tap each sound and say it with Jamal!</p>' +
      '<div class="syl-grid" dir="rtl">' + letters.map(function (ch) {
        return l.marks.map(function (m) { var x = syl(ch, m); return '<button class="syl-card" data-ch="' + ch + '" data-m="' + m + '">' + arSpan(x.t) + "<small>" + esc(x.tr) + "</small></button>"; }).join("");
      }).join("") + "</div>" +
      '<div class="home-actions"><button class="big-btn go" id="meetDone">▶ Play the Sound Game</button></div>';
    view.querySelectorAll(".mark-card").forEach(function (el) {
      el.onclick = function () { var H = HARAKAT[el.dataset.m]; sfx.pop(); el.classList.remove("pop"); void el.offsetWidth; el.classList.add("pop"); jamal(H.how, "happy", [H.how]); };
    });
    view.querySelectorAll(".syl-card").forEach(function (el) {
      el.onclick = function () {
        var x = syl(el.dataset.ch, el.dataset.m);
        if (!el.classList.contains("heard")) { el.classList.add("heard"); heard++; }
        sfx.pop(); jamal(LETTERS[x.ch].name + " with " + HARAKAT[x.m].name + " says " + x.tr + "!", "happy", [{ ar: x.t, fb: x.fb }]);
        if (heard >= 4) pulse($("meetDone"));
      };
    });
    $("meetDone").onclick = function () {
      var r = lrec(l.id); if (!r.meet) { r.meet = true; save(); addPoints(3); }
      go("hgame", { lesson: l.id });
    };
    var m0 = HARAKAT[l.marks[0]];
    jamal(l.mix ? "Fatha, kasra and damma: three little marks, three sounds! a, i, u. Tap them all!" : "Meet " + m0.name + "! " + m0.how, "happy");
  }

  function renderMarkGame(arg) {
    var l = lessonById(arg.lesson), known = marksSoFar(l), round = 0, score = 0;
    var plan = []; shuffle(l.letters).concat(shuffle(l.letters)).slice(0, 8).forEach(function (ch, i) {
      var m = l.mix ? known[i % known.length] : l.marks[0];
      plan.push({ x: syl(ch, m), t: i % 2 ? "see" : "hear" });
    });
    $("topTitle").textContent = "Sound Game";
    // wrong answers: the same letter with another mark (once 2+ marks are known), else other letters
    function others(x) {
      var same = known.filter(function (m) { return m !== x.m; }).map(function (m) { return syl(x.ch, m); });
      var diff = shuffle(l.letters.filter(function (c) { return c !== x.ch && CONS[c] !== CONS[x.ch]; })).map(function (c) { return syl(c, x.m); });
      return shuffle(same).concat(diff).slice(0, 2);
    }
    function frame(inner, msg, mood) {
      view.innerHTML = buddyRow(msg, mood) + '<div class="game-box">' +
        '<div class="round-dots">' + plan.map(function (_, i) { return '<i class="' + (i < round - 1 ? "done" : i === round - 1 ? "now" : "") + '"></i>'; }).join("") + "</div>" + inner + "</div>";
    }
    function next() {
      if (round >= plan.length) return finish();
      var P = plan[round++], cs = shuffle([P.x].concat(others(P.x))), tries = 0;
      if (P.t === "hear") {
        frame('<p class="game-q">Which sound do you hear? <button class="mini-btn" id="again">🔊 Hear it</button></p>' +
          '<div class="choice-row" dir="rtl">' + cs.map(function (c) { return '<button class="choice ar-choice ar-letter" data-c="' + c.tr + '">' + arSpan(c.t) + "</button>"; }).join("") + "</div>", "Listen! Which sound is it?", "happy");
        jamal("Listen! Which sound is it?", "happy", ["Listen!", { ar: P.x.t, fb: P.x.fb }]);
        $("again").onclick = function () { say([{ ar: P.x.t, fb: P.x.fb }]); };
      } else {
        frame('<p class="game-q">How do you read this?</p><div class="say-word ar-show">' + arSpan(P.x.t, "ar-huge") + "</div>" +
          '<div class="choice-row">' + cs.map(function (c) { return '<button class="choice word ar-choice" data-c="' + c.tr + '">' + esc(c.tr) + "</button>"; }).join("") + "</div>", "How do you read this? Look at the mark!", "think");
        jamal("How do you read this? Look at the little mark!", "think");
      }
      view.querySelectorAll(".ar-choice").forEach(function (el) {
        el.onclick = function () {
          if (el.dataset.c === P.x.tr) {
            view.querySelectorAll(".ar-choice").forEach(function (b) { b.disabled = true; });
            el.classList.add("right"); sfx.ding(); confetti(14);
            if (!tries) { score++; addPoints(2); }
            if (window.Tracker) Tracker.answer(!tries, "Harakat", { sound: P.x.tr });
            var m = pick(PRAISE.right);
            jamal(m + " " + P.x.tr + "!", "wow", [m, { ar: P.x.t, fb: P.x.fb }]).then(onNav(function () { setTimeout(onNav(next), 250); }));
          } else {
            tries++; el.classList.add("nope"); sfx.boop();
            var H = HARAKAT[P.x.m];
            jamal(tries >= 2 ? "Look where the mark is: " + H.where + " means " + H.v + "!" : pick(PRAISE.oops), "think");
          }
        };
      });
    }
    function finish() {
      var r = lrec(l.id), first = !r.game;
      r.game = true; r.stars.game = Math.max(r.stars.game || 0, score >= plan.length - 1 ? 3 : score >= plan.length / 2 ? 2 : 1); save();
      if (first) addPoints(5);
      if (window.Tracker) Tracker.complete("harakatgame", score, plan.length, { item: "Arabic " + l.title });
      stepDone(l, r.stars.game, score + " of " + plan.length + " right!");
    }
    next();
  }

  // read each word sound by sound, then "which word did Jamal say?"
  function renderReadWords(arg) {
    var l = lessonById(arg.lesson), i = arg.i || 0, W = l.words, score = arg.score || 0;
    if (i >= W.length) return readQuiz(l, 0, 0);
    var w = W[i], parts = wordParts(w.ar);
    $("topTitle").textContent = "Read Words · " + (i + 1) + "/" + W.length;
    view.innerHTML = buddyRow("") +
      '<div class="game-box"><div class="round-dots">' + W.map(function (_, k) { return '<i class="' + (k < i ? "done" : k === i ? "now" : "") + '"></i>'; }).join("") + "</div>" +
      '<div class="say-word ar-show">' + arSpan(w.ar, "ar-huge") + "</div>" +
      '<p class="game-q">Tap each sound, from right to left ⬅</p>' +
      '<div class="syl-grid row" dir="rtl">' + parts.map(function (p, k) { return '<button class="syl-card" data-k="' + k + '">' + arSpan(p.t) + "<small>" + esc(p.tr) + "</small></button>"; }).join("") + "</div>" +
      '<div class="say-row"><button class="mini-btn" id="hearWord">🔊 Hear the word</button><button class="big-btn go small" id="readIt">📖 I read it!</button></div>' +
      '<div id="meaning"></div></div>';
    view.querySelectorAll(".syl-card").forEach(function (el) {
      el.onclick = function () { var p = parts[+el.dataset.k]; el.classList.add("heard"); sfx.pop(); say([{ ar: p.t, fb: p.fb }]); };
    });
    $("hearWord").onclick = function () { say([{ ar: w.ar, fb: wordFb(w) }]); };
    $("readIt").onclick = function () {
      $("readIt").disabled = true; sfx.fanfare(); confetti(24); addPoints(2);
      S.read = (S.read || 0) + 1; store(K.read, S.read); if (S.read >= 8) trophy("reader");
      $("meaning").innerHTML = '<div class="read-meaning"><span class="pic-big">' + w.e + "</span><b>" + esc(wordTr(w)) + "</b><span>means “" + esc(w.en) + "”</span>" +
        '<button class="big-btn go" id="nextWord">' + (i + 1 < W.length ? "Next word ▶" : "🎮 Word quiz") + "</button></div>";
      var m = pick(PRAISE.read);
      jamal(m + " " + wordTr(w) + " means " + w.en + ".", "wow", [m, { ar: w.ar, fb: wordFb(w) }, "means " + w.en]);
      $("nextWord").onclick = function () { go("hread", { lesson: l.id, i: i + 1 }); };
    };
    jamal(i === 0 ? "Let's read! Tap each sound from right to left, then put them together. You can do it!" : "Next word! Sound by sound, from right to left.", "happy");
  }
  function readQuiz(l, q, score) {
    var W = l.words, order = shuffle(W).slice(0, 3), tries = 0;
    function show() {
      if (q >= order.length) return done();
      var w = order[q], cs = shuffle([w].concat(shuffle(W.filter(function (x) { return x !== w; })).slice(0, 2)));
      tries = 0;
      $("topTitle").textContent = "Word quiz · " + (q + 1) + "/" + order.length;
      view.innerHTML = buddyRow("Which word did I say?") + '<div class="game-box">' +
        '<div class="round-dots">' + order.map(function (_, k) { return '<i class="' + (k < q ? "done" : k === q ? "now" : "") + '"></i>'; }).join("") + "</div>" +
        '<p class="game-q">Which word did Jamal say? <button class="mini-btn" id="again">🔊 Hear it</button></p>' +
        '<div class="choice-row" dir="rtl">' + cs.map(function (c) { return '<button class="choice ar-choice ar-letter" data-c="' + esc(c.ar) + '">' + arSpan(c.ar) + "</button>"; }).join("") + "</div></div>";
      jamal("Which word did I say?", "happy", ["Which word did I say?", { ar: w.ar, fb: wordFb(w) }]);
      $("again").onclick = function () { say([{ ar: w.ar, fb: wordFb(w) }]); };
      view.querySelectorAll(".ar-choice").forEach(function (el) {
        el.onclick = function () {
          if (el.dataset.c === w.ar) {
            view.querySelectorAll(".ar-choice").forEach(function (b) { b.disabled = true; });
            el.classList.add("right"); sfx.ding(); confetti(14);
            if (!tries) { score++; addPoints(2); }
            if (window.Tracker) Tracker.answer(!tries, "Arabic reading", { word: wordTr(w) });
            var m = pick(PRAISE.right);
            jamal(m + " " + wordTr(w) + "!", "wow", [m]).then(onNav(function () { q++; setTimeout(onNav(show), 250); }));
          } else { tries++; el.classList.add("nope"); sfx.boop(); jamal(pick(PRAISE.oops) + " Listen to each sound.", "think"); }
        };
      });
    }
    function done() {
      var r = lrec(l.id), first = !r.read;
      r.read = true; r.stars.read = Math.max(r.stars.read || 0, score >= 3 ? 3 : score >= 2 ? 2 : 1); save();
      if (first) addPoints(5);
      if (window.Tracker) Tracker.complete("readwords", score, order.length, { item: "Arabic " + l.title });
      stepDone(l, r.stars.read, "You read " + W.length + " Arabic words!");
    }
    show();
  }

  /* ---------------- 🗣️ talk time ---------------- */
  function talkOf(l) { return TALK[l.talk]; }
  function renderTalkMeet(arg) {
    var l = lessonById(arg.lesson), T = talkOf(l), heard = {};
    $("topTitle").textContent = "Talk Time: " + T.title;
    view.innerHTML = buddyRow("") +
      '<div class="talk-grid">' + T.phrases.map(function (x, k) {
        return '<div class="talk-card" data-k="' + k + '"><button class="talk-hear" data-k="' + k + '"><span class="talk-e">' + x.e + "</span>" + arSpan(x.ar, "talk-ar") +
          '<span class="talk-tr">' + esc(x.tr) + '</span><span class="talk-en">' + esc(x.en) + "</span></button>" +
          '<button class="mini-btn talk-said" data-k="' + k + '">🗣️ I said it!</button></div>';
      }).join("") + "</div>" +
      '<div class="home-actions"><button class="big-btn go" id="talkNext">▶ Play the Word Game</button></div>';
    view.querySelectorAll(".talk-hear").forEach(function (el) {
      el.onclick = function () {
        var x = T.phrases[+el.dataset.k]; heard[el.dataset.k] = true;
        el.parentNode.classList.add("heard"); sfx.pop();
        jamal(x.en + ": " + x.tr, "happy", [{ ar: x.ar, fb: x.tr }, "means", x.en, "Now you say it!", { ar: x.ar, fb: x.tr }]);
        if (Object.keys(heard).length === T.phrases.length) pulse($("talkNext"));
      };
    });
    view.querySelectorAll(".talk-said").forEach(function (el) {
      el.onclick = function () {
        if (el.classList.contains("done")) return;
        el.classList.add("done"); el.textContent = "✅ Said it!"; sfx.bell(); confetti(16); addPoints(1);
        S.said++; store(K.said, S.said); if (S.said >= 10) trophy("talker");
        jamal(pick(PRAISE.said), "wow");
      };
    });
    $("talkNext").onclick = function () {
      var r = lrec(l.id);
      if (l.kind === "talk" && !r.meet) { r.meet = true; save(); addPoints(3); }
      go("tquiz", { lesson: l.id });
    };
    jamal("Tap a card to hear it, then say it out loud like a real Arabic speaker! Tap I said it when you do.", "happy");
  }
  function renderTalkQuiz(arg) {
    var l = lessonById(arg.lesson), T = talkOf(l), round = 0, score = 0;
    var plan = shuffle(T.phrases.map(function (p) { return { t: "mean", p: p }; })).slice(0, 3)
      .concat(T.q.map(function (q) { return { t: "situ", q: q }; }));
    plan = shuffle(plan);
    $("topTitle").textContent = "Word Game";
    function frame(inner, msg, mood) {
      view.innerHTML = buddyRow(msg, mood) + '<div class="game-box">' +
        '<div class="round-dots">' + plan.map(function (_, i) { return '<i class="' + (i < round - 1 ? "done" : i === round - 1 ? "now" : "") + '"></i>'; }).join("") + "</div>" + inner + "</div>";
    }
    function next() {
      if (round >= plan.length) return finish();
      var r = plan[round++];
      if (r.t === "mean") meanRound(r.p); else situRound(r.q);
    }
    function wire(target, skill, after) {
      var tries = 0;
      view.querySelectorAll(".ar-choice").forEach(function (el) {
        el.onclick = function () {
          if (el.dataset.c === target) {
            view.querySelectorAll(".ar-choice").forEach(function (b) { b.disabled = true; });
            el.classList.add("right"); sfx.ding(); confetti(14);
            if (!tries) { score++; addPoints(2); }
            if (window.Tracker) Tracker.answer(!tries, skill, { phrase: target });
            after();
          } else { tries++; el.classList.add("nope"); sfx.boop(); jamal(pick(PRAISE.oops), "think"); }
        };
      });
    }
    function meanRound(p) {
      var cs = shuffle([p].concat(shuffle(T.phrases.filter(function (x) { return x !== p; })).slice(0, 2)));
      frame('<p class="game-q">What does it mean? <button class="mini-btn" id="again">🔊 Hear it</button></p><div class="say-word ar-show">' + arSpan(p.ar, "talk-ar big") + "</div>" +
        '<div class="choice-col">' + cs.map(function (c) { return '<button class="choice qa ar-choice" data-c="' + esc(c.ar) + '"><span class="qe">' + c.e + '</span><span class="qt">' + esc(c.en) + "</span></button>"; }).join("") + "</div>",
        "What does " + p.tr + " mean?", "happy");
      jamal("", "happy", ["What does", { ar: p.ar, fb: p.tr }, "mean?"]); $("buddySay").textContent = "What does “" + p.tr + "” mean?";
      $("again").onclick = function () { say([{ ar: p.ar, fb: p.tr }]); };
      wire(p.ar, "Arabic words", function () { var m = pick(PRAISE.right); jamal(m, "wow", [m, { ar: p.ar, fb: p.tr }, "means", p.en]).then(onNav(function () { setTimeout(onNav(next), 250); })); });
    }
    function situRound(q) {
      var right = T.phrases.filter(function (x) { return x.ar === q.a; })[0];
      var cs = shuffle([right].concat(shuffle(T.phrases.filter(function (x) { return x !== right; })).slice(0, 2)));
      frame('<p class="game-q ar-situ">' + esc(q.q) + "</p>" +
        '<div class="choice-col">' + cs.map(function (c) { return '<button class="choice qa ar-choice talk-pick" data-c="' + esc(c.ar) + '">' + arSpan(c.ar, "talk-ar") + '<span class="qt">' + esc(c.tr) + "</span></button>"; }).join("") + "</div>",
        q.q, "think");
      jamal(q.q, "think");
      wire(q.a, "Arabic phrases", function () { var m = pick(PRAISE.right); jamal(m + " " + right.tr + "!", "wow", [m, { ar: right.ar, fb: right.tr }]).then(onNav(function () { setTimeout(onNav(next), 250); })); });
    }
    function finish() {
      var r = lrec(l.id), first = l.kind === "talk" ? !r.game : !r.talk;
      if (l.kind === "talk") r.game = true; else r.talk = true;
      r.stars.talk = Math.max(r.stars.talk || 0, score >= plan.length - 1 ? 3 : score >= plan.length / 2 ? 2 : 1); save();
      if (first) addPoints(5);
      if (window.Tracker) Tracker.complete("talktime", score, plan.length, { item: "Arabic " + T.title });
      stepDone(l, r.stars.talk, score + " of " + plan.length + " right!");
    }
    next();
  }

  /* ---------------- step / lesson complete ---------------- */
  function stepDone(l, stars, title) {
    if (lessonComplete(l)) return finishLesson(l);
    var r = lrec(l.id);
    current = { screen: "done", arg: { lesson: l.id } };
    var nextStep = l.kind === "talk" ? (!r.meet ? "tmeet" : "tquiz")
      : l.kind === "harakat" ? (!r.meet ? "hmeet" : !r.game ? "hgame" : !r.read ? "hread" : !r.trace ? "trace" : "tmeet")
      : !r.meet ? "meet" : !r.game ? "game" : !r.trace ? "trace" : "tmeet";
    var nextName = { meet: "👋 Meet the Letters", game: "🎮 Letter Game", trace: "✍️ Trace It", tmeet: "🗣️ Talk Time", tquiz: "🎮 Word Game",
                     hmeet: "👋 Meet the Mark", hgame: "🎮 Sound Game", hread: "📖 Read Words" }[nextStep];
    sfx.fanfare(); confetti(50);
    view.innerHTML = buddyRow("", "wow") +
      '<div class="celebrate"><div class="big-emoji">🐪✨</div><h2>' + esc(title) + '</h2><div class="done-stars">' + starsHtml(stars) + "</div>" +
      '<div class="done-actions"><button class="big-btn go" id="dNext">' + nextName + '</button><button class="big-btn alt" id="dBack">⬅ Lesson</button></div></div>';
    var m = pick(PRAISE.right);
    jamal(m + " " + pick(JOKES), "wow");
    $("dNext").onclick = function () { go(nextStep, { lesson: l.id, i: 0 }); };
    $("dBack").onclick = function () { go("lesson", l.id); };
  }
  function finishLesson(l) {
    var r = lrec(l.id), wasDone = r.done;
    r.done = true; save();
    var newSticker = giveSticker("l:" + l.id);
    if (!wasDone) { giveTicket(); addPoints(10); trophy("first-lesson"); }
    if (window.Tracker) Tracker.complete("lesson", 1, 1, { item: "Arabic " + l.title, firstTime: !wasDone });
    var p = phaseOfLesson(l.id);
    if (phaseDone(p)) trophy("phase-" + p.n);
    hud(); sfx.fanfare(); confetti(100);
    current = { screen: "done", arg: { lesson: l.id } };
    var nextL = p.lessons.filter(function (x) { return !lrec(x.id).done; })[0];
    view.innerHTML = buddyRow("", "wow") +
      '<div class="celebrate"><div class="sticker-reveal' + (newSticker ? " new" : "") + '"><span>' + l.sticker.emoji + "</span></div>" +
      "<h2>Mumtaaz! You finished " + (l.kind === "letters" ? arSpan(l.title) : esc(l.title)) + "!</h2>" +
      (wasDone ? "" : '<p class="done-loot">🎟️ +1 Prize Wheel ticket · ⭐ +10 bonus</p>') +
      '<div class="done-actions">' + (nextL ? '<button class="big-btn go" id="dNext">🐪 Next lesson</button>' : "") +
      '<button class="big-btn alt" id="dHome">🗺️ All phases</button></div></div>';
    jamal(newSticker ? "Mumtaaz! You won the " + l.sticker.name + " sticker!" : pick(PRAISE.right), "wow");
    if ($("dNext")) $("dNext").onclick = function () { go("lesson", nextL.id); };
    $("dHome").onclick = function () { go("home"); };
  }

  /* ---------------- sticker book & trophies ---------------- */
  function renderStickers() {
    $("topTitle").textContent = "My Sticker Book";
    var html = ["kg", "g3"].filter(function (t) { return !LOCKED || t === LOCKED; }).map(function (t) {
      return PHASES[t].filter(function (p) { return p.lessons; }).map(function (p) {
        return '<section class="album"><h3>' + TRACKS[t].emoji + " " + esc(p.title) + '</h3><div class="stk-grid">' + p.lessons.map(function (l) {
          var got = S.stickers.indexOf("l:" + l.id) >= 0;
          return '<div class="stk' + (got ? " got" : "") + '" style="--bk:' + p.color + '"><span class="se">' + (got ? l.sticker.emoji : "❔") + "</span><small>" + (got ? esc(l.sticker.name) : l.kind === "talk" ? esc(l.title) : arSpan(l.title)) + "</small></div>";
        }).join("") + "</div></section>";
      }).join("");
    }).join("");
    var met = Object.keys(LETTERS).map(function (ch) { return '<span class="met-chip' + (S.met.indexOf(ch) >= 0 ? " on" : "") + '">' + arSpan(ch) + "</span>"; }).join("");
    view.innerHTML = buddyRow("Look at your stickers! And here are all the letters you've met so far.") + html +
      '<section class="album"><h3>🔤 Letters I\'ve met <small>(' + S.met.length + " of 28)</small></h3><div class=\"met-grid\" dir=\"rtl\">" + met + "</div></section>";
    jamal($("buddySay").textContent, "happy");
  }
  function renderTrophies() {
    $("topTitle").textContent = "My Trophies";
    view.innerHTML = buddyRow("Every trophy shows how hard you worked! Ahsant!") +
      '<div class="trophy-list">' + AR_TROPHIES.map(function (t) {
        var got = S.trophies.indexOf(t.id) >= 0;
        return '<div class="trophy' + (got ? " got" : "") + '"><span class="ti">' + (got ? t.icon : "🔒") + "</span><span><b>" + esc(t.name) + "</b><small>" + esc(t.desc) + "</small></span></div>";
      }).join("") + "</div>" +
      '<div class="stat-row"><span>⭐ ' + S.points + " points</span><span>🔤 " + S.met.length + " of 28 letters</span><span>✍️ " + S.traced + " letters traced</span><span>🗣️ " + S.said + " words said</span></div>";
    jamal($("buddySay").textContent, "happy");
  }

  /* ---------------- wiring ---------------- */
  $("backBtn").onclick = back;
  $("muteBtn").onclick = function () { S.mute = !S.mute; store(K.mute, S.mute); if (S.mute) hush(); hud(); };
  $("stkPill").onclick = function () { go("stickers"); };
  $("trophyBtn").onclick = function () { go("trophies"); };
  hud();
  go("home");
  window.ArabicApp = { go: go, state: S, voices: function () { return { en: enVoice, ar: arVoice }; } };
})();
