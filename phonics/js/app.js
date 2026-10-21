/* ============================================================
   Phonics Pals — app engine
   Screens: home (phase path) → Phase 1 letter lessons (meet / sound
            game / picture quiz) · Phase 2 shelf → book → warm-up /
            reader / quiz → done · sticker book · trophy shelf
   ============================================================ */
(function () {
  "use strict";

  /* ---------------- storage ---------------- */
  var K = { pts: "ph_points", stk: "ph_stickers", tro: "ph_trophies", books: "ph_books", lessons: "ph_lessons", built: "ph_built", perfect: "ph_perfect", fixed: "ph_fixed", mute: "ph_mute", tickets: "rw_tickets" };
  function load(k, d) { try { var v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }
  function store(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }

  var S = {
    points: load(K.pts, 0),
    stickers: load(K.stk, []),
    trophies: load(K.tro, []),
    books: load(K.books, {}),
    lessons: load(K.lessons, {}),
    built: load(K.built, 0),
    perfect: load(K.perfect, 0),
    fixed: load(K.fixed, 0),
    mute: load(K.mute, false),
    helper: !Listener.supported(),   // no mic → grown-up helper mode
    micNote: ""
  };
  function rec(id) {
    if (!S.books[id]) S.books[id] = { warm: false, pages: [], seen: 0, quiz: false, done: false };
    return S.books[id];
  }
  function saveBooks() { store(K.books, S.books); }
  function lrec(id) {
    if (!S.lessons[id]) S.lessons[id] = { meet: false, game: false, quiz: false, done: false };
    return S.lessons[id];
  }
  function saveLessons() { store(K.lessons, S.lessons); }
  function phaseById(id) { for (var i = 0; i < PHASES.length; i++) if (PHASES[i].id === id) return PHASES[i]; return PHASES[0]; }
  function letterLesson(id) { var ls = PHASES[0].lessons; for (var i = 0; i < ls.length; i++) if (ls[i].id === id) return ls[i]; return ls[0]; }
  function lessonById(id) {
    for (var i = 0; i < PHASES.length; i++) for (var j = 0; j < (PHASES[i].lessons || []).length; j++) if (PHASES[i].lessons[j].id === id) return PHASES[i].lessons[j];
    return PHASES[0].lessons[0];
  }
  function phaseOfLesson(id) { for (var i = 0; i < PHASES.length; i++) if ((PHASES[i].lessons || []).some(function (l) { return l.id === id; })) return PHASES[i]; return PHASES[0]; }
  function phaseProgress(p) {
    if (p.lessons) return { done: p.lessons.filter(function (l) { return lrec(l.id).done; }).length, total: p.lessons.length };
    if (p.books) return { done: p.books.filter(function (id) { return rec(id).done; }).length, total: p.books.length };
    return { done: 0, total: 0 };
  }
  function phaseOpen(p) {
    if (!p.lessons && !p.books) return false;          // coming soon
    if (p.n <= 3) return true;                          // letters, books and sight words are all open
    var prev = phaseProgress(PHASES[p.n - 2]);
    return prev.total > 0 && prev.done >= prev.total;
  }
  function bookById(id) { for (var i = 0; i < BOOKS.length; i++) if (BOOKS[i].id === id) return BOOKS[i]; return BOOKS[0]; }
  function bookStars(b) {
    var r = rec(b.id), sum = 0;
    for (var i = 0; i < b.pages.length; i++) sum += r.pages[i] || 0;
    return Math.round(sum / b.pages.length);
  }

  /* ---------------- dom helpers ---------------- */
  var $ = function (id) { return document.getElementById(id); };
  var view = $("view");
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function starsHtml(n, max) { var s = ""; for (var i = 0; i < (max || 3); i++) s += '<span class="st' + (i < n ? " on" : "") + '">★</span>'; return s; }

  /* ---------------- sound: speech + tiny sfx ---------------- */
  var voice = null, speakToken = 0;
  function chooseVoice() {
    if (!window.speechSynthesis) return;
    var vs = speechSynthesis.getVoices().filter(function (v) { return /^en[-_]/i.test(v.lang); });
    var prefs = [/Aria/i, /Jenny/i, /Ana\b/i, /Samantha/i, /Google US English/i, /Zira/i, /en-US/i];
    for (var p = 0; p < prefs.length && !voice; p++)
      for (var i = 0; i < vs.length; i++) if (prefs[p].test(v_name(vs[i]))) { voice = vs[i]; break; }
    if (!voice && vs.length) voice = vs[0];
  }
  function v_name(v) { return v.name + " " + v.lang; }
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
      u.lang = "en-US"; u.rate = opt.rate || 0.88; u.pitch = opt.pitch || 1.08;
      u.onend = done; u.onerror = done;
      if (opt.onboundary) u.onboundary = opt.onboundary;
      if (!opt.queue) speechSynthesis.cancel();
      speechSynthesis.speak(u);
      setTimeout(done, 2500 + text.length * 110);   // safety net
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
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.18, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        o.connect(g); g.connect(actx.destination); o.start(t); o.stop(t + dur + 0.05);
      });
    } catch (e) {}
  }
  var sfx = {
    ding: function () { tone([880, 1320], 0.22, "triangle", 0.09); },
    pop: function () { tone([520], 0.12, "sine"); },
    boop: function () { tone([300, 240], 0.18, "sine", 0.12); },
    fanfare: function () { tone([523, 659, 784, 1047], 0.3, "triangle", 0.13); },
    mic: function () { tone([660, 990], 0.12, "sine", 0.08); }
  };

  /* ---------------- Echo the parrot ---------------- */
  function echoRow(msg, mood) {
    return '<div class="echo-row"><div class="echo-bird" id="echoBird">' + Art.echo(mood) + '</div>' +
           '<div class="echo-bubble" id="echoSay">' + esc(msg || "") + "</div></div>";
  }
  function echo(msg, mood, noVoice) {
    var b = $("echoSay"), bird = $("echoBird");
    if (b) { b.textContent = msg; b.classList.remove("pop"); void b.offsetWidth; b.classList.add("pop"); }
    if (bird) bird.innerHTML = Art.echo(mood || "happy");
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
  function giveSticker(id) {
    if (S.stickers.indexOf(id) >= 0) return false;
    S.stickers.push(id); store(K.stk, S.stickers); return true;
  }
  function trophy(id) {
    if (S.trophies.indexOf(id) >= 0) return;
    var t = PH_TROPHIES.filter(function (x) { return x.id === id; })[0]; if (!t) return;
    S.trophies.push(id); store(K.tro, S.trophies);
    toast(t.icon + " Trophy: " + t.name + "!");
    sfx.fanfare();
  }
  function checkTrophies() {
    var done = BOOKS.filter(function (b) { return rec(b.id).done; }).length;
    var warm = BOOKS.filter(function (b) { return rec(b.id).warm; }).length;
    if (done >= 1) trophy("first-book");
    if (done >= BOOKS.length) trophy("all-books");
    if (S.perfect >= 10) trophy("perfect-10");
    if (S.fixed >= 5) trophy("word-fixer");
    if (warm >= 3) trophy("sound-star");
  }
  function nextFunSticker() {
    for (var i = 0; i < FUN_STICKERS.length; i++) if (S.stickers.indexOf(FUN_STICKERS[i].id) < 0) return FUN_STICKERS[i];
    return null;
  }
  var toastTimer = null;
  function toast(msg) {
    var t = $("toast"); t.textContent = msg; t.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.classList.remove("show"); }, 2600);
  }
  function confetti(n) {
    var box = $("confetti"), colors = ["#ff5a5f", "#ffd23f", "#2fbf71", "#2f80ed", "#a56bff", "#ff8a3d"];
    for (var i = 0; i < (n || 40); i++) {
      var c = document.createElement("i");
      c.style.left = Math.random() * 100 + "vw";
      c.style.background = pick(colors);
      c.style.animationDelay = Math.random() * 0.4 + "s";
      c.style.transform = "rotate(" + Math.random() * 360 + "deg)";
      box.appendChild(c);
      (function (el) { setTimeout(function () { el.remove(); }, 2600); })(c);
    }
  }
  function hud() {
    $("ptsPill").textContent = "⭐ " + S.points;
    $("stkPill").textContent = "🎟️ " + S.stickers.length;
    $("muteBtn").textContent = S.mute ? "🔇" : "🔊";
  }

  /* ---------------- words: tokens, colouring, sounding out ---------------- */
  function vocabOf(b) {
    var v = {};
    b.pages.forEach(function (p) { Listener.tokens(p.text).forEach(function (w) { v[w] = true; }); });
    return v;
  }
  function focusSet(b) { var s = {}; b.focus.forEach(function (w) { s[w.toLowerCase()] = true; }); return s; }
  function sightSet(b) { var s = {}; b.sight.forEach(function (w) { s[w.toLowerCase()] = true; }); return s; }
  // word → html with its short vowel coloured
  function wordHtml(word, vowel) {
    return esc(word).replace(new RegExp("[" + vowel + vowel.toUpperCase() + "]", "g"), function (m) { return '<b class="v">' + m + "</b>"; });
  }
  function letterGroups(word) {
    var w = word.toLowerCase().replace(/[^a-z]/g, ""), out = [], i = 0;
    while (i < w.length) {
      if (/^(sh|ch|th|ck)$/.test(w.substr(i, 2))) { out.push(w.substr(i, 2)); i += 2; }
      else if (w[i + 1] === w[i]) { out.push(w[i] + w[i]); i += 2; }
      else { out.push(w[i]); i++; }
    }
    return out;
  }
  function letterCard(word, vowel) {
    return letterGroups(word).map(function (g, i) {
      var shown = i === 0 && /^[A-Z]/.test(word) ? g.charAt(0).toUpperCase() + g.slice(1) : g;
      return '<span class="lt' + (g.charAt(0) === vowel ? " v" : "") + (g.length === 2 && DIGRAPHS[g] ? " team" : "") + '" data-g="' + i + '">' + esc(shown) + "</span>";
    }).join("");
  }
  // letter card with a blend's letters highlighted (blend letters stay separate sounds)
  function teamCard(word, team) {
    var groups = letterGroups(word), at = word.toLowerCase().indexOf(team), pos = 0;
    return groups.map(function (g, i) {
      var mine = at >= 0 && pos >= at && pos < at + team.length; pos += g.length;
      return '<span class="lt' + (mine || (g.length === 2 && DIGRAPHS[g]) ? " team" : "") + '" data-g="' + i + '">' + esc(g) + "</span>";
    }).join("");
  }
  // say each sound, lighting up its letters, then the whole word
  function soundOut(word, host) {
    var groups = letterGroups(word), chain = Promise.resolve(true);
    function light(i) { if (host) host.querySelectorAll(".lt").forEach(function (el) { el.classList.toggle("lit", i === "all" || +el.dataset.g === i); }); }
    function clear() { if (host) setTimeout(function () { host.querySelectorAll(".lt").forEach(function (el) { el.classList.remove("lit"); }); }, 500); }
    hush();
    groups.forEach(function (g, i) {
      chain = chain.then(function (ok) {
        if (!ok) return false;
        light(i);
        return speak(LETTER_SOUNDS[g] || LETTER_SOUNDS[g.charAt(0)] || g, { rate: 0.75 }).then(function (still) { return still ? wait(120).then(function () { return true; }) : false; });
      });
    });
    return chain.then(function (ok) {
      if (!ok) { clear(); return false; }
      light("all");
      return speak(word, { rate: 0.8 }).then(function (r) { clear(); return r; });
    });
  }

  /* only run a callback if the child is still on the same screen */
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
    ({ home: renderPath, shelf: renderShelf, phase: renderLetterPhase, lesson: renderLetterLesson, meet: renderMeet, lgame: renderLetterGame, lquiz: renderLetterQuiz, smeet: renderSightMeet, sgame: renderSightGame, sbuild: renderSightBuild, dmeet: renderTeamMeet, dgame: renderTeamGame, book: renderBook, warm: renderWarm, read: renderReader, quiz: renderQuiz, stickers: renderStickers, trophies: renderTrophies })[screen](arg);
  }
  function back() {
    var c = current;
    if (c.screen === "warm" || c.screen === "read" || c.screen === "quiz" || c.screen === "done") go("book", c.arg && c.arg.book || c.arg);
    else if (c.screen === "book") go("shelf");
    else if (/^(meet|lgame|lquiz|smeet|sgame|sbuild|dmeet|dgame|ldone)$/.test(c.screen)) go("lesson", c.arg && c.arg.lesson);
    else if (c.screen === "lesson") go("phase", phaseOfLesson(c.arg).id);
    else go("home");
  }

  /* ---------------- home: the phase path ---------------- */
  function renderPath() {
    $("topTitle").textContent = "Phonics Pals";
    var mic = S.helper
      ? '<span class="mic-chip off">🎤 ' + (S.micNote || "Reading check needs Chrome or Edge — a grown-up can help instead") + "</span>"
      : '<span class="mic-chip">🎤 Echo can hear you read!</span>';
    var cards = PHASES.map(function (p) {
      var open = phaseOpen(p), soon = !p.lessons && !p.books, pr = phaseProgress(p), done = pr.total && pr.done >= pr.total;
      var status = soon ? "Coming soon" : !open ? "🔒 Finish Phase " + (p.n - 1) + " first" : done ? "✅ All done!" : pr.done + " of " + pr.total + (p.books ? " books" : " lessons");
      return '<button class="phase-card ' + (soon ? "soon" : !open ? "locked" : done ? "passed" : "open") + '" data-phase="' + p.id + '" style="--bk:' + p.color + ";--bk2:" + p.accent + '"' + (open ? "" : " disabled") + ">" +
        '<span class="ph-n">' + (done ? "⭐" : p.emoji) + "</span>" +
        '<span class="ph-txt"><small>Step ' + p.n + "</small><b>" + esc(p.title) + "</b><em>" + esc(p.sub) + '</em><span class="ph-status">' + status + "</span></span>" +
        (open ? '<span class="ph-bar"><i style="width:' + Math.round(100 * pr.done / pr.total) + '%"></i></span>' : "") + "</button>";
    }).join('<span class="path-dash" aria-hidden="true"></span>');
    view.innerHTML = echoRow("Hi! I'm Echo! Let's learn to read, one step at a time. Pick a step!") +
      '<div class="mic-row">' + mic + "</div>" +
      '<div class="phase-path">' + cards + "</div>" +
      '<div class="home-actions"><button class="big-btn alt" data-go="stickers">🎟️ My Sticker Book</button><button class="big-btn alt" data-go="trophies">🏆 My Trophies</button></div>';
    view.querySelectorAll("[data-phase]").forEach(function (el) {
      el.onclick = function () { sfx.pop(); var p = phaseById(el.dataset.phase); if (p.books) go("shelf"); else go("phase", p.id); };
    });
    view.querySelectorAll("[data-go]").forEach(function (el) { el.onclick = function () { go(el.dataset.go); }; });
    echo($("echoSay").textContent, "happy");
  }

  /* ---------------- Phase 2: the bookshelf ---------------- */
  function renderShelf() {
    $("topTitle").textContent = "Story Books";
    var mic = S.helper
      ? '<span class="mic-chip off">🎤 ' + (S.micNote || "Reading check needs Chrome or Edge — a grown-up can help instead") + "</span>"
      : '<span class="mic-chip">🎤 Echo can hear you read!</span>';
    var html = echoRow("Hi! I'm Echo! Pick a book and read it to me. I love stories!") +
      '<div class="mic-row">' + mic + "</div>" +
      '<div class="shelf">' + BOOKS.map(function (b) {
        var r = rec(b.id), st = bookStars(b);
        return '<button class="book-card" data-book="' + b.id + '" style="--bk:' + b.color + ';--bk2:' + b.accent + '">' +
          '<span class="cover">' + Art.scene(b.pages[0].art, "cover-art") + '<span class="book-n">Book ' + b.n + "</span>" +
          (b.bonus ? '<span class="ribbon">Bonus</span>' : "") + (r.done ? '<span class="done-badge">' + b.sticker.emoji + "</span>" : "") + "</span>" +
          '<span class="book-title">' + esc(b.title) + "</span>" +
          '<span class="book-meta"><span class="vchip">short <b>' + b.vowel + "</b></span><span class=\"stars\">" + starsHtml(st) + "</span></span>" +
          '<span class="steps-mini"><i class="' + (r.warm ? "ok" : "") + '">🔤</i><i class="' + (r.seen >= b.pages.length ? "ok" : "") + '">📖</i><i class="' + (r.quiz ? "ok" : "") + '">❓</i></span>' +
          "</button>";
      }).join("") + "</div>" +
      '<div class="home-actions"><button class="big-btn alt" data-go="stickers">🎟️ My Sticker Book</button><button class="big-btn alt" data-go="trophies">🏆 My Trophies</button></div>';
    view.innerHTML = html;
    view.querySelectorAll("[data-book]").forEach(function (el) { el.onclick = function () { sfx.pop(); go("book", el.dataset.book); }; });
    view.querySelectorAll("[data-go]").forEach(function (el) { el.onclick = function () { go(el.dataset.go); }; });
  }

  /* ---------------- book menu ---------------- */
  function renderBook(id) {
    var b = bookById(id), r = rec(id), V = VOWELS[b.vowel];
    $("topTitle").textContent = "Book " + b.n + ": " + b.title;
    var pagesRead = Math.min(r.seen, b.pages.length);
    view.innerHTML = '<div class="book-head" style="--bk:' + b.color + ';--bk2:' + b.accent + '">' +
        '<div class="book-cover-big">' + Art.scene(b.pages[0].art) + "</div>" +
        '<div class="book-info"><h2>' + esc(b.title) + "</h2><p>" + esc(b.blurb) + "</p>" +
        '<div class="vowel-badge"><span class="vbig">' + b.vowel + "</span><span>short <b>" + b.vowel + "</b> says<br/>“" + b.vowel + "” like " + V.emoji + " " + V.key + "</span></div>" +
        '<div class="sticker-peek ' + (r.done ? "got" : "") + '">' + (r.done ? b.sticker.emoji : "🎁") + "<small>" + (r.done ? esc(b.sticker.name) : "Finish to win a sticker!") + "</small></div></div></div>" +
      echoRow(r.done ? "You finished this book! Read it again to get more stars!" : (r.warm ? "Now let's read the story together!" : "Let's warm up our short " + b.vowel + " sound first!")) +
      '<div class="steps">' +
        stepCard(1, "🔤", "Sound Warm-up", r.warm ? "Done! ✔" : "Hear & say the words", r.warm, "warm") +
        stepCard(2, "📖", "Read the Story", pagesRead + " of " + b.pages.length + " pages · " + starsHtml(bookStars(b)), pagesRead >= b.pages.length, "read") +
        stepCard(3, "❓", "Story Quiz", r.quiz ? "Done! ✔" : "Show what you know", r.quiz, "quiz") +
      "</div>";
    view.querySelectorAll("[data-step]").forEach(function (el) {
      el.onclick = function () {
        sfx.pop();
        var s = el.dataset.step;
        if (s === "read") go("read", { book: id, page: r.seen > 0 && r.seen < b.pages.length ? r.seen : 0 });
        else go(s, { book: id });
      };
    });
    echo($("echoSay").textContent, "happy");
  }
  function stepCard(n, icon, name, sub, ok, step) {
    return '<button class="step-card' + (ok ? " ok" : "") + '" data-step="' + step + '"><span class="step-n">' + n + '</span><span class="step-ic">' + icon + "</span>" +
      '<span class="step-txt"><b>' + name + "</b><small>" + sub + '</small></span><span class="step-go">' + (ok ? "✅" : "▶") + "</span></button>";
  }

  /* ---------------- warm-up ---------------- */
  function renderWarm(arg) {
    var b = bookById(arg.book), V = VOWELS[b.vowel];
    $("topTitle").textContent = "Sound Warm-up";
    view.innerHTML = echoRow("") +
      '<div class="warm-intro" style="--bk:' + b.color + ';--bk2:' + b.accent + '">' +
        '<button class="vowel-card" id="vowelCard"><span class="vbig">' + b.vowel + '</span><span class="vkey">' + V.emoji + " " + V.key + "</span></button>" +
        '<div class="wall"><h3>Short ' + b.vowel + ' words — tap to sound them out</h3><div class="word-wall">' +
          b.focus.map(function (w) { return '<button class="wcard" data-w="' + esc(w) + '">' + letterCard(w, b.vowel) + "</button>"; }).join("") +
        '</div><h3>Sight words — tap to hear</h3><div class="word-wall sight">' +
          b.sight.map(function (w) { return '<button class="scard" data-s="' + esc(w) + '">' + esc(w) + "</button>"; }).join("") +
        "</div></div>" +
        '<button class="big-btn go" id="playBtn">▶ Let\'s play!</button></div>';
    $("vowelCard").onclick = function () { speak("Short " + b.vowel + " says " + V.sound + ". " + V.sound + ", " + V.sound + ", " + V.key + "!"); };
    view.querySelectorAll(".wcard").forEach(function (el) { el.onclick = function () { soundOut(el.dataset.w, el); }; });
    view.querySelectorAll(".scard").forEach(function (el) { el.onclick = function () { sfx.pop(); speak(el.dataset.s, { rate: 0.8 }); }; });
    $("playBtn").onclick = function () { warmGame(b); };
    echo("This book has the short " + b.vowel + " sound. Short " + b.vowel + " says " + V.sound + ", like " + V.key + "! Tap a word to sound it out.", "happy");
  }

  function warmGame(b) {
    var focus = b.focus.slice(), pool = shuffle(focus).slice(0, 6), round = 0, score = 0;
    var useMic = !S.helper;
    function next() {
      if (round >= pool.length) return finish();
      var w = pool[round], type = useMic && round % 2 === 1 ? "say" : "pick";
      round++;
      if (type === "pick") pickRound(w); else sayRound(w);
    }
    function frame(inner, msg, mood) {
      view.innerHTML = echoRow(msg, mood) + '<div class="game-box" style="--bk:' + b.color + ';--bk2:' + b.accent + '">' +
        '<div class="round-dots">' + pool.map(function (_, i) { return '<i class="' + (i < round - 1 ? "done" : i === round - 1 ? "now" : "") + '"></i>'; }).join("") + "</div>" + inner + "</div>";
    }
    function pickRound(w) {
      var others = shuffle(focus.filter(function (x) { return x.toLowerCase() !== w.toLowerCase(); }).concat(b.sight)).slice(0, 2);
      var choices = shuffle([w].concat(others)), tries = 0;
      frame('<p class="game-q">Tap the word you hear <button class="mini-btn" id="again">🔊</button></p><div class="choice-row">' +
        choices.map(function (c) { return '<button class="choice word" data-c="' + esc(c) + '">' + wordHtml(c, b.vowel) + "</button>"; }).join("") + "</div>", "Tap the word: " + w, "happy");
      speak("Tap the word: " + w);
      $("again").onclick = function () { speak(w, { rate: 0.75 }); };
      view.querySelectorAll(".choice").forEach(function (el) {
        el.onclick = function () {
          if (el.dataset.c === w) {
            el.classList.add("right"); sfx.ding(); if (!tries) { score++; addPoints(2); }
            if (window.Tracker) Tracker.answer(!tries, "Phonics: short " + b.vowel);
            echo(pick(PRAISE.right), "happy").then(onNav(function () { setTimeout(onNav(next), 250); }));
          } else {
            tries++; el.classList.add("nope"); sfx.boop();
            echo(pick(PRAISE.oops) + " Listen: " + w, "happy");
          }
        };
      });
    }
    function sayRound(w) {
      var tries = 0;
      frame('<p class="game-q">Read this word to Echo!</p><div class="say-word" id="sayWord">' + letterCard(w, b.vowel) + "</div>" +
        '<div class="say-row"><button class="mic-btn" id="sayMic"><span>🎤</span></button><button class="mini-btn" id="hearIt">🔊 Help me</button></div>', "Can you read this word? Tap the mic and say it!", "listen");
      speak("Can you read this word? Tap the microphone and say it!");
      $("hearIt").onclick = function () { soundOut(w, $("sayWord")); };
      $("sayMic").onclick = function () {
        var btn = $("sayMic"); if (btn.classList.contains("live")) return;   // one listen at a time
        hush(); sfx.mic(); btn.classList.add("live");
        setTimeout(function () {
          listen({ target: Listener.tokens(w), single: true,
            onDone: function (res) {
              btn.classList.remove("live");
              if (!document.body.contains(btn)) return;                      // round already moved on
              if (res.hits[0]) {
                $("sayWord").classList.add("right"); sfx.ding(); confetti(18);
                score++; addPoints(tries ? 2 : 3);
                if (window.Tracker) Tracker.answer(!tries, "Phonics: short " + b.vowel);
                echo(pick(PRAISE.fixed) + " " + w + "!", "happy").then(onNav(function () { setTimeout(onNav(next), 250); }));
              } else {
                tries++;
                if (tries >= 2) {
                  if (window.Tracker) Tracker.answer(false, "Phonics: short " + b.vowel);
                  echo("Good try! It says " + w + ". You'll get it next time!", "happy").then(onNav(function () { setTimeout(onNav(next), 300); }));
                } else {
                  echo(res.heardAny ? "So close! Let's sound it out together." : "I couldn't hear you. Let's sound it out, then try again!", "happy")
                    .then(onNav(function () { return soundOut(w, $("sayWord")); }));
                }
              }
            },
            onError: function (code) { btn.classList.remove("live"); useMic = false; micTrouble(code, true); setTimeout(onNav(next), 2500); }
          });
        }, 200);
      };
    }
    function finish() {
      var r = rec(b.id), first = !r.warm;
      r.warm = true; saveBooks();
      if (first) addPoints(5);
      if (window.Tracker) Tracker.complete("warmup", score, pool.length, { item: b.title });
      checkTrophies(); sfx.fanfare(); confetti(50);
      view.innerHTML = echoRow("Hooray! Your short " + b.vowel + " sound is all warmed up! Now let's read the story!", "happy") +
        '<div class="celebrate"><div class="big-emoji">🔤✨</div><h2>' + score + " of " + pool.length + ' words!</h2>' +
        '<button class="big-btn go" id="toRead">📖 Read the story</button><button class="big-btn alt" id="toBook">⬅ Back to book</button></div>';
      echo($("echoSay").textContent, "happy");
      $("toRead").onclick = function () { go("read", { book: b.id, page: 0 }); };
      $("toBook").onclick = function () { go("book", b.id); };
    }
    next();
  }

  /* ---------------- the reader ---------------- */
  var R = null;   // reader state for the current page
  function renderReader(arg) {
    var b = bookById(arg.book), i = Math.max(0, Math.min(arg.page || 0, b.pages.length - 1)), page = b.pages[i], r = rec(b.id);
    var F = focusSet(b), SW = sightSet(b);
    $("topTitle").textContent = b.title + " · page " + (i + 1) + "/" + b.pages.length;
    r.seen = Math.max(r.seen, i + 1); saveBooks();
    var raw = page.text.split(/\s+/), toks = raw.map(Listener.norm);
    R = { b: b, i: i, toks: toks, vocab: vocabOf(b), queue: [], fixedAll: false, mode: "idle", missed: [] };

    // build the text: one span per word, sentences on their own line
    var lines = [[]];
    raw.forEach(function (w, k) { lines[lines.length - 1].push(k); if (/[.!?]$/.test(w) && k < raw.length - 1) lines.push([]); });
    var textHtml = lines.map(function (ln) {
      return '<span class="line">' + ln.map(function (k) {
        var w = raw[k], t = toks[k], m = w.match(/^(.*?)([.,!?]*)$/);
        var cls = "w" + (F[t] ? " focus" : "") + (SW[t] ? " sight" : "");
        var inner = F[t] ? wordHtml(m[1], b.vowel) : esc(m[1]);
        return '<span class="' + cls + '" data-k="' + k + '">' + inner + "</span>" + esc(m[2]);
      }).join(" ") + "</span>";
    }).join("");

    var dots = b.pages.map(function (_, k) { var s = r.pages[k] || 0; return '<i class="' + (k === i ? "now " : "") + (s === 3 ? "s3" : s ? "s1" : "") + '"></i>'; }).join("");
    var micBtn = S.helper
      ? '<button class="big-btn go" id="selfBtn">✅ I read it!</button><button class="big-btn alt small" id="trickyBtn">🤔 Tricky word</button>'
      : '<button class="mic-btn big" id="micBtn" title="Read to Echo (space)"><span>🎤</span><em>Read to Echo</em></button>';

    view.innerHTML =
      '<div class="page-dots">' + dots + "</div>" +
      '<div class="page-card" style="--bk:' + b.color + ';--bk2:' + b.accent + '">' +
        '<div class="pic">' + Art.scene(page.art) + '<span class="page-stars" id="pageStars">' + starsHtml(r.pages[i] || 0) + "</span></div>" +
        '<div class="story-text" id="storyText">' + textHtml + "</div>" +
      "</div>" +
      '<div class="reader-controls">' +
        '<button class="nav-btn" id="prevBtn" ' + (i === 0 ? "disabled" : "") + ' title="Back a page">◀</button>' +
        '<button class="big-btn listen" id="listenBtn">🔊 Read to me</button>' + micBtn +
        '<button class="nav-btn next" id="nextBtn" title="Next page">▶</button>' +
      "</div>" +
      echoRow("") +
      '<div class="practice" id="practice" hidden></div>';

    view.querySelectorAll(".w").forEach(function (el) {
      el.onclick = function () {
        var k = +el.dataset.k;
        if (R.mode === "tricky") { el.classList.toggle("miss"); return; }
        if (R.mode !== "idle") return;
        var w = raw[k].replace(/[^A-Za-z']/g, "");
        if (F[toks[k]]) speak(w, { rate: 0.75 }); else speak(w, { rate: 0.8 });
        el.classList.add("tap"); setTimeout(function () { el.classList.remove("tap"); }, 500);
      };
    });
    $("prevBtn").onclick = function () { go("read", { book: b.id, page: i - 1 }); };
    $("nextBtn").onclick = nextPage;
    $("listenBtn").onclick = readToMe;
    if ($("micBtn")) $("micBtn").onclick = toggleMic;
    if ($("selfBtn")) $("selfBtn").onclick = selfReport;
    if ($("trickyBtn")) $("trickyBtn").onclick = trickyMode;

    var first = i === 0 && !(r.pages[0]);
    echo(S.helper
      ? (first ? "Read the words out loud. When you're done, tap I read it! Tap any word if you need help." : "Read this page out loud!")
      : (first ? "Tap the microphone, then read the words out loud. I'll listen! Tap any word if you need help." : "Your turn! Tap the microphone and read this page."),
      S.helper ? "happy" : "listen");
  }

  function spans() { return view.querySelectorAll("#storyText .w"); }
  function setPageStars(n) {
    var r = rec(R.b.id), old = r.pages[R.i] || 0;
    if (n > old) { r.pages[R.i] = n; saveBooks(); }
    var el = $("pageStars"); if (el) { el.innerHTML = starsHtml(Math.max(n, old)); el.classList.remove("pop"); void el.offsetWidth; el.classList.add("pop"); }
    var dot = view.querySelectorAll(".page-dots i")[R.i];
    if (dot) { var s = Math.max(n, old); dot.className = "now " + (s === 3 ? "s3" : s ? "s1" : ""); }
    return old;
  }

  function nextPage() {
    if (!R) return;
    if (R.i < R.b.pages.length - 1) { sfx.pop(); go("read", { book: R.b.id, page: R.i + 1 }); return; }
    // last page → quiz (or finish if the quiz is already done)
    var r = rec(R.b.id); r.seen = R.b.pages.length; saveBooks();
    if (window.Tracker) Tracker.complete("story", bookStars(R.b), 3, { item: R.b.title });
    if (!r.quiz) go("quiz", { book: R.b.id }); else finishBook(R.b, null);
  }

  // karaoke: speak each sentence, lighting up words as they're spoken
  function readToMe() {
    if (R.mode !== "idle") return;
    Listener.stop(); hush();
    R.mode = "tts";
    var els = spans(), raw = R.toks, groups = [[]];
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
        fb = setTimeout(function tick() {
          if (gotB) return;
          step++; if (step < g.length) { light(step); fb = setTimeout(tick, 430); }
        }, 480);
        return speak(text, { rate: 0.82, queue: true, onboundary: function (e) {
          if (e.name && e.name !== "word") return;
          gotB = true; clearTimeout(fb);
          var n = 0; for (var q = 0; q < offs.length; q++) if (e.charIndex >= offs[q]) n = q;
          light(n);
        } }).then(function (still) { clearTimeout(fb); return wait(180).then(function () { return still; }); });
      });
    });
    chain.then(onNav(function () {
      els.forEach(function (e) { e.classList.remove("on"); });
      btn.classList.remove("live");
      if (R && R.mode === "tts") {
        R.mode = "idle";
        echo(S.helper ? "Now you read it! Tap I read it when you're done." : "Now it's your turn! Tap the microphone and read it to me.", S.helper ? "happy" : "listen");
      }
    }));
  }

  // ---- the listener ----
  function toggleMic() {
    if (R.mode === "listen") { Listener.stop(); return; }
    if (R.mode !== "idle") { if (R.mode === "tts") { hush(); R.mode = "idle"; spans().forEach(function (e) { e.classList.remove("on"); }); $("listenBtn").classList.remove("live"); } else return; }
    hush(); sfx.mic();
    $("practice").hidden = true;
    spans().forEach(function (e) { e.classList.remove("heard", "miss", "fixed", "on"); });
    R.mode = "listen";
    var btn = $("micBtn"); btn.classList.add("live"); btn.querySelector("em").textContent = "Listening…";
    echo("I'm listening! Read the words out loud.", "listen", true);
    setTimeout(function () {
      listen({
        target: R.toks, vocab: R.vocab,
        onUpdate: function (hits) { spans().forEach(function (e, k) { e.classList.toggle("heard", !!hits[k]); }); },
        onDone: function (res) { micOff(); gradeReading(res.hits, res.heardAny); },
        onError: function (code) { micOff(); R.mode = "idle"; micTrouble(code); }
      });
    }, 250);
  }
  function micOff() {
    var btn = $("micBtn"); if (!btn) return;
    btn.classList.remove("live"); btn.querySelector("em").textContent = "Read to Echo";
  }
  function micTrouble(code, quiet) {
    var msg;
    if (code === "aborted") return;
    if (code === "not-allowed" || code === "service-not-allowed") { S.denied = (S.denied || 0) + 1; if (S.denied >= 2) code = "blocked"; }
    if (code === "not-allowed" || code === "service-not-allowed") msg = "I need to use the microphone to hear you. Ask a grown-up to tap Allow, then try again!";
    else if (code === "network") msg = "I need the internet to listen. You can still read out loud and tap I read it!";
    else if (code === "audio-capture") msg = "I can't find a microphone. A grown-up can plug one in — or tap I read it!";
    else if (code === "no-speech") { echo("Hmm, I didn't hear you. Tap the microphone and read nice and loud!", "happy"); return; }
    else if (code === "blocked") msg = "The microphone is blocked, so a grown-up can listen instead. Read out loud and tap I read it!";
    else msg = "My ears aren't working right now. Read out loud and tap I read it!";
    if (code !== "not-allowed" && code !== "service-not-allowed") {
      S.helper = true; S.micNote = code === "network" ? "Reading check needs the internet — a grown-up can help instead" : "Microphone not available — a grown-up can help instead";
    }
    echo(msg, "happy");
    if (S.helper && current.screen === "read" && !quiet) setTimeout(onNav(function () { go("read", { book: R.b.id, page: R.i }); }), 3600);
  }

  function gradeReading(hits, heardAny) {
    R.mode = "idle";
    var els = spans(), total = hits.length, n = hits.filter(Boolean).length;
    if (!heardAny || n === 0) {
      echo("Hmm, I didn't hear the words. Tap the microphone and read nice and loud!", "happy");
      return;
    }
    trophy("first-read");
    var missed = [];
    hits.forEach(function (h, k) { els[k].classList.toggle("heard", h); if (!h) { els[k].classList.add("miss"); missed.push(k); } });
    var stars = n === total ? 3 : n / total >= 0.75 ? 2 : 1;
    var old = setPageStars(stars);
    addPoints(stars * 2 + (stars === 3 && old < 3 ? 5 : 0));
    if (window.Tracker) Tracker.answer(stars === 3, "Read aloud: short " + R.b.vowel, { page: R.i + 1, words: total, read: n });

    if (stars === 3) {
      sfx.fanfare(); confetti(60);
      var bonus = "";
      if (old < 3) {
        S.perfect++; store(K.perfect, S.perfect);
        if (S.perfect % 3 === 0) {
          var fs = nextFunSticker();
          if (fs && giveSticker(fs.id)) { bonus = " You won a new sticker: " + fs.name + "!"; stickerPop(fs.emoji, fs.name); }
        }
      }
      checkTrophies(); hud();
      echo(pick(PRAISE.perfect) + bonus, "happy").then(onNav(function () { pulse($("nextBtn")); }));
      return;
    }
    sfx.ding();
    // practise up to 3 different tricky words, kindly
    var seen = {}, q = [];
    missed.forEach(function (k) { var t = R.toks[k]; if (!seen[t]) { seen[t] = true; q.push(k); } });
    R.queue = q.slice(0, 3); R.missed = missed;
    var lead = stars === 2 ? pick(PRAISE.good) : pick(PRAISE.tryAgain);
    echo(lead + " You read " + n + " of " + total + " words! Let's practise the orange ones.", "happy").then(onNav(function () { practiceNext(); }));
  }

  function cleanWord(k) { return spans()[k].textContent.replace(/[^A-Za-z']/g, ""); }
  function practiceNext() {
    var box = $("practice");
    if (!R.queue.length) {
      box.hidden = true;
      var els = spans(), left = R.missed.filter(function (k) { return !els[k].classList.contains("fixed"); }).length;
      if (!left) {
        var r = rec(R.b.id), now = r.pages[R.i] || 0;
        if (now < 3) { setPageStars(now + 1); }
        sfx.fanfare(); confetti(30);
        echo("You fixed all your tricky words! Here's an extra star! Read the page again, or go to the next page.", "happy");
      } else {
        echo("Great practising! Read the page again to win more stars, or go to the next page.", "happy");
      }
      return;
    }
    var k = R.queue.shift(), word = cleanWord(k), tries = 0, b = R.b;
    spans().forEach(function (e) { e.classList.remove("focus-now"); });
    spans()[k].classList.add("focus-now");
    box.hidden = false;
    box.innerHTML = '<div class="practice-card"><p>Let\'s practise this word:</p><div class="say-word" id="pWord">' + letterCard(word, b.vowel) + "</div>" +
      '<div class="say-row">' +
        '<button class="mini-btn" id="pHear">🔊 Hear it</button>' +
        (S.helper ? '<button class="big-btn go small" id="pSaid">✅ I said it!</button>' : '<button class="mic-btn" id="pMic"><span>🎤</span></button>') +
        '<button class="mini-btn" id="pSkip">Skip ➡</button></div></div>';
    $("pHear").onclick = function () { soundOut(word, $("pWord")); };
    $("pSkip").onclick = function () { hush(); Listener.stop(); spans()[k].classList.remove("focus-now"); practiceNext(); };
    function success() {
      var el = spans()[k];
      el.classList.remove("miss", "focus-now"); el.classList.add("fixed");
      R.missed.forEach(function (m) { if (R.toks[m] === R.toks[k]) { spans()[m].classList.remove("miss"); spans()[m].classList.add("fixed"); } });
      $("pWord").classList.add("right"); sfx.ding(); addPoints(1);
      S.fixed++; store(K.fixed, S.fixed); checkTrophies();
      if (window.Tracker) Tracker.answer(true, "Tricky words", { word: word });
      echo(pick(PRAISE.fixed) + " " + word + "!", "happy").then(onNav(function () { setTimeout(onNav(practiceNext), 200); }));
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
            if (tries >= 2) {
              echo("Good try! It says " + word + ". We'll practise it again soon!", "happy").then(onNav(function () { spans()[k].classList.remove("focus-now"); setTimeout(onNav(practiceNext), 200); }));
            } else {
              echo(res.heardAny ? "Ooh, close! Listen carefully." : "I couldn't hear you. Listen, then say it nice and loud!", "happy")
                .then(onNav(function () { return soundOut(word, $("pWord")); }))
                .then(onNav(function () { echo("Your turn! Tap the microphone.", "listen"); }));
            }
          },
          onError: function (code) { btn.classList.remove("live"); micTrouble(code); }
        });
      }, 200);
    };
    echo("Let's practise " + word + ". Listen!", "happy").then(onNav(function (still) {
      if (!still) return;
      return soundOut(word, $("pWord")).then(function (ok) { if (ok) echo(S.helper ? "Now you say it! Then tap I said it." : "Now you say it! Tap the microphone.", S.helper ? "happy" : "listen"); });
    }));
  }

  // ---- helper mode (no mic): child reads to a grown-up ----
  function selfReport() {
    if (R.mode === "tricky") return endTricky();
    trophy("first-read");
    var marked = view.querySelectorAll("#storyText .w.miss").length;
    var stars = marked ? 2 : 3, old = setPageStars(stars);
    addPoints(stars * 2);
    if (stars === 3 && old < 3) { S.perfect++; store(K.perfect, S.perfect); if (S.perfect % 3 === 0) { var fs = nextFunSticker(); if (fs && giveSticker(fs.id)) stickerPop(fs.emoji, fs.name); } }
    if (window.Tracker) Tracker.answer(stars === 3, "Read aloud: short " + R.b.vowel, { page: R.i + 1, helper: true });
    checkTrophies(); hud(); sfx.fanfare(); confetti(40);
    echo(pick(PRAISE.perfect), "happy").then(onNav(function () { pulse($("nextBtn")); }));
  }
  function trickyMode() {
    if (R.mode === "tricky") return endTricky();
    R.mode = "tricky";
    $("trickyBtn").textContent = "▶ Practise them";
    $("selfBtn").textContent = "✅ I read it!";
    echo("Grown-up: tap the words that were tricky, then tap Practise them.", "happy");
  }
  function endTricky() {
    R.mode = "idle";
    $("trickyBtn").textContent = "🤔 Tricky word";
    var q = [], seen = {};
    spans().forEach(function (e, k) { if (e.classList.contains("miss") && !seen[R.toks[k]]) { seen[R.toks[k]] = true; q.push(k); } });
    R.missed = q.slice(); R.queue = q.slice(0, 4);
    if (q.length) practiceNext(); else echo("No tricky words? Great reading!", "happy");
  }

  function pulse(el) { if (!el) return; el.classList.remove("pulse"); void el.offsetWidth; el.classList.add("pulse"); }
  function stickerPop(emoji, name) {
    var d = document.createElement("div");
    d.className = "sticker-pop"; d.innerHTML = '<div class="sp-card"><div class="sp-emoji">' + emoji + "</div><b>New sticker!</b><span>" + esc(name) + "</span></div>";
    document.body.appendChild(d); hud();
    d.onclick = function () { d.remove(); };
    setTimeout(function () { d.classList.add("out"); setTimeout(function () { d.remove(); }, 400); }, 2600);
  }

  /* ---------------- quiz ---------------- */
  function renderQuiz(arg) {
    var b = bookById(arg.book), qi = arg.q || 0, firstAll = arg.firstAll !== false;
    var Q = b.quiz[qi], tries = 0;
    $("topTitle").textContent = "Story Quiz · " + (qi + 1) + "/" + b.quiz.length;
    view.innerHTML = echoRow(Q.q, "happy") +
      '<div class="quiz-box" style="--bk:' + b.color + ';--bk2:' + b.accent + '">' +
        '<div class="round-dots">' + b.quiz.map(function (_, k) { return '<i class="' + (k < qi ? "done" : k === qi ? "now" : "") + '"></i>'; }).join("") + "</div>" +
        '<h2 class="quiz-q">' + esc(Q.q) + ' <button class="mini-btn" id="qSay">🔊</button></h2>' +
        '<div class="choice-col">' + Q.choices.map(function (c, k) {
          return '<button class="choice qa" data-k="' + k + '"><span class="qe">' + c.e + '</span><span class="qt">' + esc(c.t) + "</span></button>";
        }).join("") + "</div></div>";
    function readAll() {
      echo(Q.say, "happy").then(onNav(function (still) {
        if (!still) return;
        var chain = Promise.resolve(true);
        Q.choices.forEach(function (c, k) {
          chain = chain.then(function (ok) {
            if (!ok) return false;
            var el = view.querySelectorAll(".qa")[k]; if (!el) return false;
            el.classList.add("on");
            return speak(c.t, { rate: 0.85 }).then(function (s) { el.classList.remove("on"); return s; });
          });
        });
      }));
    }
    $("qSay").onclick = readAll;
    readAll();
    view.querySelectorAll(".qa").forEach(function (el) {
      el.onclick = function () {
        var k = +el.dataset.k;
        if (k === Q.answer) {
          el.classList.add("right"); sfx.ding(); confetti(20);
          addPoints(tries ? 2 : 5);
          if (window.Tracker) Tracker.answer(!tries, "Story comprehension", { book: b.title });
          view.querySelectorAll(".qa").forEach(function (x) { x.disabled = true; });
          var fa = firstAll && !tries;
          echo(pick(PRAISE.right), "happy").then(onNav(function () {
            if (qi + 1 < b.quiz.length) go("quiz", { book: b.id, q: qi + 1, firstAll: fa });
            else { if (fa) trophy("quiz-whiz"); var r = rec(b.id); r.quiz = true; saveBooks(); finishBook(b, fa); }
          }));
        } else {
          tries++; el.classList.add("nope"); el.disabled = true; sfx.boop();
          echo(pick(PRAISE.oops), "happy");
        }
      };
    });
  }

  /* ---------------- book finished ---------------- */
  function finishBook(b, quizPerfect) {
    var r = rec(b.id), wasDone = r.done, storyDone = r.seen >= b.pages.length;
    current = { screen: "done", arg: b.id };
    $("topTitle").textContent = "Book " + b.n + " done!";
    if (!storyDone) {   // quiz done before reading every page
      view.innerHTML = echoRow("Great quiz! Now read every page of the story to win the " + b.sticker.name + " sticker!", "happy") +
        '<div class="celebrate"><button class="big-btn go" id="dRead">📖 Keep reading</button></div>';
      echo($("echoSay").textContent, "happy");
      $("dRead").onclick = function () { go("read", { book: b.id, page: Math.min(r.seen, b.pages.length - 1) }); };
      return;
    }
    r.done = true; saveBooks();
    var newSticker = giveSticker("b:" + b.id);
    if (!wasDone) { giveTicket(); addPoints(10); }
    if (window.Tracker) Tracker.complete("book", bookStars(b), 3, { item: b.title, firstTime: !wasDone, quizPerfect: !!quizPerfect });
    checkTrophies(); hud();
    sfx.fanfare(); confetti(90);
    var nextB = BOOKS.filter(function (x) { return !rec(x.id).done; })[0];
    view.innerHTML = echoRow("", "happy") +
      '<div class="celebrate" style="--bk:' + b.color + ';--bk2:' + b.accent + '">' +
        '<div class="sticker-reveal' + (newSticker ? " new" : "") + '"><span>' + b.sticker.emoji + "</span></div>" +
        "<h2>You read “" + esc(b.title) + "”!</h2>" +
        '<p class="done-stars">' + starsHtml(bookStars(b)) + "</p>" +
        (wasDone ? "" : '<p class="done-loot">🎟️ +1 Prize Wheel ticket · ⭐ +10 bonus</p>') +
        '<div class="done-actions">' +
          (nextB ? '<button class="big-btn go" id="dNext">📗 Next book: ' + esc(nextB.title) + "</button>" : "") +
          '<button class="big-btn alt" id="dAgain">🔁 Read it again</button>' +
          '<button class="big-btn alt" id="dStk">🎟️ My stickers</button>' +
          '<button class="big-btn alt" id="dHome">📚 Bookshelf</button>' +
        "</div></div>";
    var msg = newSticker ? "You did it! You read the whole book! Here is your " + b.sticker.name + " sticker!" : "You read the whole book again! You are a reading superstar!";
    echo(msg, "happy");
    if ($("dNext")) $("dNext").onclick = function () { go("book", nextB.id); };
    $("dAgain").onclick = function () { go("read", { book: b.id, page: 0 }); };
    $("dStk").onclick = function () { go("stickers"); };
    $("dHome").onclick = function () { go("shelf"); };
  }

  /* ============================================================
     PHASE 1 — Letter Sounds: meet the letters → sound game → picture quiz
     ============================================================ */
  function soundOf(l) { return LETTER_SOUNDS[l] || l; }
  function letterSay(l) {
    var P = LETTER_PICS[l];
    return P.end ? l + " says " + soundOf(l) + ", like at the end of " + P.w + "." : l + " says " + soundOf(l) + ", like " + P.w + "!";
  }
  function renderLetterPhase(pid) {
    var p = phaseById(pid || "k1");
    $("topTitle").textContent = "Step " + p.n + ": " + p.title;
    var sight = p.lessons[0].kind === "sight", team = isTeam(p.lessons[0]), blend = p.lessons[0].kind === "blend";
    view.innerHTML = echoRow(blend ? "In a blend, two sounds slide together, like a slide at the park! Pick a blend!" : team ? "Some letters hold hands and make a brand new sound! Pick a sound team!" : sight ? "Sight words are words we know by heart. Pick a group of words!" : "Every letter makes a sound. Pick a group of letters to learn!") +
      '<div class="steps">' + p.lessons.map(function (l, i) {
        var r = lrec(l.id);
        if (team) return '<button class="step-card' + (r.done ? " ok" : "") + '" data-lesson="' + l.id + '"><span class="step-n">' + (i + 1) + '</span>' +
          '<span class="step-ic">' + (r.done ? l.sticker.emoji : l.mix ? "🎲" : DIGRAPHS[l.teams[0]].e) + '</span>' +
          '<span class="step-txt"><b class="letters-title">' + esc(l.title) + "</b>" +
          '<span class="steps-mini"><i class="' + (r.meet ? "ok" : "") + '">👋</i><i class="' + (r.game ? "ok" : "") + '">🎮</i><i class="' + (r.quiz ? "ok" : "") + '">🧩</i></span></span>' +
          '<span class="step-go">' + (r.done ? "✅" : "▶") + "</span></button>";
        if (sight) return '<button class="step-card' + (r.done ? " ok" : "") + '" data-lesson="' + l.id + '"><span class="step-n">' + (i + 1) + '</span>' +
          '<span class="step-ic">' + (r.done ? l.sticker.emoji : "👀") + '</span>' +
          '<span class="step-txt"><b class="letters-title">' + esc(l.title) + "</b>" +
          '<span class="steps-mini"><i class="' + (r.meet ? "ok" : "") + '">👀</i><i class="' + (r.game ? "ok" : "") + '">🎮</i><i class="' + (r.quiz ? "ok" : "") + '">🧩</i></span></span>' +
          '<span class="step-go">' + (r.done ? "✅" : "▶") + "</span></button>";
        return '<button class="step-card' + (r.done ? " ok" : "") + '" data-lesson="' + l.id + '"><span class="step-n">' + (i + 1) + '</span>' +
          '<span class="step-ic">' + (r.done ? l.sticker.emoji : LETTER_PICS[l.letters[0]].e) + '</span>' +
          '<span class="step-txt"><b class="letters-title">' + esc(l.title) + "</b>" +
          '<span class="steps-mini"><i class="' + (r.meet ? "ok" : "") + '">👋</i><i class="' + (r.game ? "ok" : "") + '">🎮</i><i class="' + (r.quiz ? "ok" : "") + '">🖼️</i></span></span>' +
          '<span class="step-go">' + (r.done ? "✅" : "▶") + "</span></button>";
      }).join("") + "</div>";
    view.querySelectorAll("[data-lesson]").forEach(function (el) { el.onclick = function () { sfx.pop(); go("lesson", el.dataset.lesson); }; });
    echo($("echoSay").textContent, "happy");
  }
  function renderLetterLesson(id) {
    if (lessonById(id).kind === "sight") return renderSightLesson(id);
    if (isTeam(lessonById(id))) return renderTeamLesson(id);
    var l = letterLesson(id), r = lrec(id);
    $("topTitle").textContent = "Letters: " + l.title;
    view.innerHTML = '<div class="letter-strip">' + l.letters.map(function (x) { return '<span class="ls-chip">' + x + "</span>"; }).join("") + "</div>" +
      echoRow(r.done ? "You know these letters! Play again any time!" : r.meet ? "Let's play with the sounds!" : "Let's meet the letters first!") +
      '<div class="steps">' +
        stepCard(1, "👋", "Meet the Letters", r.meet ? "Done! ✔" : "See, hear and say each sound", r.meet, "meet") +
        stepCard(2, "🎮", "Sound Game", r.game ? "Done! ✔" : "Hear a sound, find the letter", r.game, "lgame") +
        stepCard(3, "🖼️", "Picture Quiz", r.quiz ? "Done! ✔" : "Which picture starts with it?", r.quiz, "lquiz") +
      "</div>";
    view.querySelectorAll("[data-step]").forEach(function (el) { el.onclick = function () { sfx.pop(); go(el.dataset.step, { lesson: id }); }; });
    echo($("echoSay").textContent, "happy");
  }
  function renderMeet(arg) {
    var l = letterLesson(arg.lesson), heard = {};
    $("topTitle").textContent = "Meet the Letters";
    view.innerHTML = echoRow("") +
      '<div class="meet-grid">' + l.letters.map(function (x) {
        var P = LETTER_PICS[x];
        return '<button class="meet-card" data-l="' + x + '"><span class="mc-letter">' + x.toUpperCase() + "<i>" + x + '</i></span><span class="mc-pic">' + P.e + '</span><span class="mc-word">' + esc(P.w) + "</span></button>";
      }).join("") + "</div>" +
      '<div class="home-actions"><button class="big-btn go" id="meetDone">▶ Play the Sound Game</button></div>';
    view.querySelectorAll(".meet-card").forEach(function (el) {
      el.onclick = function () {
        var x = el.dataset.l; heard[x] = true; el.classList.add("heard");
        el.classList.remove("pop"); void el.offsetWidth; el.classList.add("pop");
        speak(letterSay(x), { rate: 0.82 });
        if (Object.keys(heard).length === l.letters.length) pulse($("meetDone"));
      };
    });
    $("meetDone").onclick = function () {
      var r = lrec(l.id); if (!r.meet) { r.meet = true; saveLessons(); addPoints(3); }
      go("lgame", { lesson: l.id });
    };
    echo("Tap each letter to hear the sound it makes. Then say it with me!", "happy");
  }
  function letterChoices(l, target, n) {
    // never offer two letters that make the same sound (c and k both say "kuh")
    return shuffle([target].concat(shuffle(l.letters.filter(function (x) { return x !== target && soundOf(x) !== soundOf(target); })).slice(0, (n || 3) - 1)));
  }
  function renderLetterGame(arg) {
    var l = letterLesson(arg.lesson), useMic = !S.helper, round = 0, score = 0;
    var starters = l.letters.filter(function (x) { return !LETTER_PICS[x].end; });
    var plan = shuffle(l.letters).slice(0, 6).map(function (x, i) {
      var t = ["hear", "pic", "say"][i % 3];
      if (t !== "hear" && LETTER_PICS[x].end) t = "hear";          // x: no word starts with its sound
      if (t === "say" && !useMic) t = "pic";
      return { l: x, t: t };
    });
    $("topTitle").textContent = "Sound Game";
    function frame(inner, msg, mood) {
      view.innerHTML = echoRow(msg, mood) + '<div class="game-box" style="--bk:#ffd8a8;--bk2:#f08c00">' +
        '<div class="round-dots">' + plan.map(function (_, i) { return '<i class="' + (i < round - 1 ? "done" : i === round - 1 ? "now" : "") + '"></i>'; }).join("") + "</div>" + inner + "</div>";
    }
    function next() {
      if (round >= plan.length) return finish();
      var r = plan[round++];
      if (r.t === "say") sayRound(r.l); else pickRound(r.l, r.t);
    }
    function pickRound(x, t) {
      var P = LETTER_PICS[x], tries = 0, prompt = t === "hear" ? "Which letter says " + soundOf(x) + "?" : P.w + "! What sound does " + P.w + " start with?";
      frame('<p class="game-q">' + (t === "hear" ? "Which letter says this sound?" : '<span class="pic-big">' + P.e + "</span>") +
        ' <button class="mini-btn" id="again">🔊</button></p><div class="choice-row">' +
        letterChoices(l, x).map(function (c) { return '<button class="choice word letter" data-c="' + c + '">' + c + "</button>"; }).join("") + "</div>", prompt, "happy");
      speak(prompt);
      $("again").onclick = function () { speak(t === "hear" ? soundOf(x) + ". " + soundOf(x) : P.w, { rate: 0.8 }); };
      view.querySelectorAll(".choice").forEach(function (el) {
        el.onclick = function () {
          if (el.dataset.c === x) {
            el.classList.add("right"); sfx.ding(); if (!tries) { score++; addPoints(2); }
            if (window.Tracker) Tracker.answer(!tries, "Letter sounds", { letter: x });
            echo(pick(PRAISE.right) + " " + letterSay(x), "happy").then(onNav(function () { setTimeout(onNav(next), 250); }));
          } else {
            tries++; el.classList.add("nope"); sfx.boop();
            echo(pick(PRAISE.oops) + " Listen: " + soundOf(x), "happy");
          }
        };
      });
    }
    function sayRound(x) {
      var P = LETTER_PICS[x], tries = 0;
      frame('<p class="game-q">Say this word to Echo!</p><div class="say-word pic-say" id="sayWord"><span class="pic-big">' + P.e + "</span>" + esc(P.w) + "</div>" +
        '<div class="say-row"><button class="mic-btn" id="sayMic"><span>🎤</span></button><button class="mini-btn" id="hearIt">🔊 Help me</button></div>', "What is this? Tap the microphone and say it!", "listen");
      speak("What is this? Tap the microphone and say it!");
      $("hearIt").onclick = function () { speak(P.w + ". " + letterSay(x), { rate: 0.8 }); };
      $("sayMic").onclick = function () {
        var btn = $("sayMic"); if (btn.classList.contains("live")) return;
        hush(); sfx.mic(); btn.classList.add("live");
        setTimeout(function () {
          listen({ target: [P.w], single: true,
            onDone: function (res) {
              btn.classList.remove("live");
              if (!document.body.contains(btn)) return;                      // round already moved on
              if (res.hits[0]) {
                $("sayWord").classList.add("right"); sfx.ding(); confetti(18); score++; addPoints(tries ? 2 : 3);
                if (window.Tracker) Tracker.answer(!tries, "Letter sounds", { letter: x, said: true });
                echo("Yes! " + P.w + " starts with " + x + ". " + soundOf(x) + "!", "happy").then(onNav(function () { setTimeout(onNav(next), 250); }));
              } else if (++tries >= 2) {
                if (window.Tracker) Tracker.answer(false, "Letter sounds", { letter: x, said: true });
                echo("Good try! It's " + P.w + ". " + letterSay(x), "happy").then(onNav(function () { setTimeout(onNav(next), 300); }));
              } else {
                echo(res.heardAny ? "So close! Listen: " + P.w + ". Try again!" : "I couldn't hear you. Say it nice and loud!", "happy");
              }
            },
            onError: function (code) { btn.classList.remove("live"); useMic = false; micTrouble(code, true); setTimeout(onNav(next), 2500); }
          });
        }, 200);
      };
    }
    function finish() {
      var r = lrec(l.id), first = !r.game;
      r.game = true; saveLessons();
      if (first) addPoints(5);
      if (window.Tracker) Tracker.complete("lettergame", score, plan.length, { item: "Letters " + l.title });
      sfx.fanfare(); confetti(50);
      current = { screen: "ldone", arg: { lesson: l.id } };
      view.innerHTML = echoRow("Hooray! " + score + " of " + plan.length + "! Now let's do the picture quiz!", "happy") +
        '<div class="celebrate"><div class="big-emoji">🎮✨</div><h2>' + score + " of " + plan.length + " sounds!</h2>" +
        '<button class="big-btn go" id="toQuiz">🖼️ Picture Quiz</button><button class="big-btn alt" id="toLesson">⬅ Back</button></div>';
      echo($("echoSay").textContent, "happy");
      $("toQuiz").onclick = function () { go("lquiz", { lesson: l.id }); };
      $("toLesson").onclick = function () { go("lesson", l.id); };
    }
    if (!starters.length) plan.forEach(function (r) { r.t = "hear"; });
    next();
  }
  function renderLetterQuiz(arg) {
    var l = letterLesson(arg.lesson), qi = arg.q || 0, score = arg.score || 0;
    var starters = l.letters.filter(function (x) { return !LETTER_PICS[x].end; });
    var order = arg.order || shuffle(starters).slice(0, 4), x = order[qi], P = LETTER_PICS[x], tries = 0;
    var others = shuffle(Object.keys(LETTER_PICS).filter(function (k) { return k !== x && !LETTER_PICS[k].end && soundOf(k) !== soundOf(x); })).slice(0, 2);
    var choices = shuffle([x].concat(others));
    $("topTitle").textContent = "Picture Quiz · " + (qi + 1) + "/" + order.length;
    var prompt = "Which picture starts with " + soundOf(x) + "?";
    view.innerHTML = echoRow(prompt, "happy") +
      '<div class="quiz-box" style="--bk:#ffd8a8;--bk2:#f08c00">' +
        '<div class="round-dots">' + order.map(function (_, k) { return '<i class="' + (k < qi ? "done" : k === qi ? "now" : "") + '"></i>'; }).join("") + "</div>" +
        '<h2 class="quiz-q"><span class="quiz-letter">' + x.toUpperCase() + x + '</span> Which picture starts with this sound? <button class="mini-btn" id="qSay">🔊</button></h2>' +
        '<div class="choice-row">' + choices.map(function (c) {
          return '<button class="choice pic-choice" data-c="' + c + '"><span class="qe">' + LETTER_PICS[c].e + '</span><span class="qt">' + esc(LETTER_PICS[c].w) + "</span></button>";
        }).join("") + "</div></div>";
    $("qSay").onclick = function () { speak(prompt); };
    speak(prompt);
    view.querySelectorAll(".pic-choice").forEach(function (el) {
      el.onclick = function () {
        if (el.dataset.c === x) {
          el.classList.add("right"); sfx.ding(); confetti(18); addPoints(tries ? 2 : 5);
          if (window.Tracker) Tracker.answer(!tries, "Letter sounds: first sound", { letter: x });
          view.querySelectorAll(".pic-choice").forEach(function (b) { b.disabled = true; });
          var sc = score + (tries ? 0 : 1);
          echo("Yes! " + P.w + " starts with " + soundOf(x) + "!", "happy").then(onNav(function () {
            if (qi + 1 < order.length) go("lquiz", { lesson: l.id, q: qi + 1, score: sc, order: order });
            else finishLetterLesson(l, sc, order.length);
          }));
        } else {
          tries++; el.classList.add("nope"); el.disabled = true; sfx.boop();
          speak(LETTER_PICS[el.dataset.c].w + " starts with " + soundOf(el.dataset.c) + ". Try again!");
        }
      };
    });
  }
  function finishLetterLesson(l, score, total) {
    var r = lrec(l.id), wasDone = r.done;
    r.quiz = true;
    current = { screen: "ldone", arg: { lesson: l.id } };
    if (!r.meet || !r.game) {
      saveLessons();
      var need = !r.meet ? "meet" : "lgame";
      view.innerHTML = echoRow("Great quiz! Now finish the " + (need === "meet" ? "Meet the Letters" : "Sound Game") + " step to win your sticker!", "happy") +
        '<div class="celebrate"><button class="big-btn go" id="dGo">' + (need === "meet" ? "👋 Meet the Letters" : "🎮 Sound Game") + "</button></div>";
      echo($("echoSay").textContent, "happy");
      $("dGo").onclick = function () { go(need, { lesson: l.id }); };
      return;
    }
    r.done = true; saveLessons();
    var newSticker = giveSticker("l:" + l.id);
    if (!wasDone) { giveTicket(); addPoints(10); }
    if (window.Tracker) Tracker.complete("letters", score, total, { item: "Letters " + l.title, firstTime: !wasDone });
    if (PHASES[0].lessons.every(function (x) { return lrec(x.id).done; })) trophy("letter-pro");
    hud(); sfx.fanfare(); confetti(90);
    var ls = PHASES[0].lessons, nextL = ls.filter(function (x) { return !lrec(x.id).done; })[0];
    view.innerHTML = echoRow("", "happy") +
      '<div class="celebrate"><div class="sticker-reveal' + (newSticker ? " new" : "") + '"><span>' + l.sticker.emoji + "</span></div>" +
      "<h2>You learned " + esc(l.title) + "!</h2>" +
      (wasDone ? "" : '<p class="done-loot">🎟️ +1 Prize Wheel ticket · ⭐ +10 bonus</p>') +
      '<div class="done-actions">' +
        (nextL ? '<button class="big-btn go" id="dNext">🔤 Next letters: ' + esc(nextL.title) + "</button>" : '<button class="big-btn go" id="dBooks">📚 Read the story books</button>') +
        '<button class="big-btn alt" id="dHome">🗺️ All steps</button></div></div>';
    echo(newSticker ? "You did it! Here is your " + l.sticker.name + " sticker!" : "You know these letters so well!", "happy");
    if ($("dNext")) $("dNext").onclick = function () { go("lesson", nextL.id); };
    if ($("dBooks")) $("dBooks").onclick = function () { go("shelf"); };
    $("dHome").onclick = function () { go("home"); };
  }

  /* ============================================================
     PHASE 3 — Sight Words: meet the words → word game → build a sentence
     (building sentences from word tiles is the KG's first writing step)
     ============================================================ */
  var SW_THEME = "--bk:#d0bfff;--bk2:#7048e8";
  function sightWords() {   // every sight word taught so far, for wrong-answer choices
    var all = [];
    PHASES.forEach(function (p) { (p.lessons || []).forEach(function (l) { if (l.kind === "sight") all = all.concat(l.words); }); });
    return all;
  }
  function spellOut(w) { return w.split("").join(", ") + ". " + w + "!"; }
  function sentenceFor(l, w) {
    var re = new RegExp("\\b" + w + "\\b", w === "I" ? "" : "i");
    return l.sentences.filter(function (x) { return re.test(x.s); })[0];
  }
  function markWord(sentence, w) {
    var re = new RegExp("\\b(" + w + ")\\b", w === "I" ? "" : "i");
    return esc(sentence).replace(re, '<b class="sw-hi">$1</b>');
  }
  function renderSightLesson(id) {
    var l = lessonById(id), r = lrec(id);
    $("topTitle").textContent = "Sight Words";
    view.innerHTML = '<div class="letter-strip">' + l.words.map(function (x) { return '<span class="ls-chip sw">' + esc(x) + "</span>"; }).join("") + "</div>" +
      echoRow(r.done ? "You know these words by heart! Play again any time!" : r.meet ? "Let's play with the words!" : "Let's meet some new words!") +
      '<div class="steps">' +
        stepCard(1, "👀", "Meet the Words", r.meet ? "Done! ✔" : "See, hear and spell each word", r.meet, "smeet") +
        stepCard(2, "🎮", "Word Game", r.game ? "Done! ✔" : "Find the word you hear", r.game, "sgame") +
        stepCard(3, "🧩", "Build a Sentence", r.quiz ? "Done! ✔" : "Put the words in order, then read it", r.quiz, "sbuild") +
      "</div>";
    view.querySelectorAll("[data-step]").forEach(function (el) { el.onclick = function () { sfx.pop(); go(el.dataset.step, { lesson: id }); }; });
    echo($("echoSay").textContent, "happy");
  }
  function renderSightMeet(arg) {
    var l = lessonById(arg.lesson), heard = {};
    $("topTitle").textContent = "Meet the Words";
    view.innerHTML = echoRow("") +
      '<div class="meet-grid">' + l.words.map(function (w) {
        var ex = sentenceFor(l, w);
        return '<button class="meet-card sw-card" data-w="' + esc(w) + '"><span class="sw-word">' + esc(w) + "</span>" +
          (ex ? '<span class="sw-ex"><span class="sw-emo">' + ex.e + "</span>" + markWord(ex.s, w) + "</span>" : "") + "</button>";
      }).join("") + "</div>" +
      '<div class="home-actions"><button class="big-btn go" id="meetDone">▶ Play the Word Game</button></div>';
    view.querySelectorAll(".sw-card").forEach(function (el) {
      el.onclick = function () {
        var w = el.dataset.w, ex = sentenceFor(l, w); heard[w] = true; el.classList.add("heard");
        el.classList.remove("pop"); void el.offsetWidth; el.classList.add("pop");
        speak(w + ". " + spellOut(w) + (ex ? " " + ex.s : ""), { rate: 0.8 });
        if (Object.keys(heard).length === l.words.length) pulse($("meetDone"));
      };
    });
    $("meetDone").onclick = function () {
      var r = lrec(l.id); if (!r.meet) { r.meet = true; saveLessons(); addPoints(3); }
      go("sgame", { lesson: l.id });
    };
    echo("These words show up everywhere! Tap each one to hear it and spell it.", "happy");
  }
  function renderSightGame(arg) {
    var l = lessonById(arg.lesson), useMic = !S.helper, round = 0, score = 0;
    var plan = shuffle(l.words).concat(shuffle(l.words)).slice(0, 6).map(function (w, i) {
      var t = ["hear", "say", "fill"][i % 3];
      if (t === "say" && !useMic) t = "hear";
      if (t === "fill" && !sentenceFor(l, w)) t = "hear";
      return { w: w, t: t };
    });
    $("topTitle").textContent = "Word Game";
    function frame(inner, msg, mood) {
      view.innerHTML = echoRow(msg, mood) + '<div class="game-box" style="' + SW_THEME + '">' +
        '<div class="round-dots">' + plan.map(function (_, i) { return '<i class="' + (i < round - 1 ? "done" : i === round - 1 ? "now" : "") + '"></i>'; }).join("") + "</div>" + inner + "</div>";
    }
    function choices(w) {
      var pool = l.words.filter(function (x) { return x.toLowerCase() !== w.toLowerCase(); });
      var extra = sightWords().filter(function (x) { return l.words.indexOf(x) < 0; });
      return shuffle([w].concat(shuffle(pool.concat(shuffle(extra).slice(0, 2))).slice(0, 2)));
    }
    function next() {
      if (round >= plan.length) return finish();
      var r = plan[round++];
      if (r.t === "say") sayRound(r.w); else pickRound(r.w, r.t);
    }
    function pickRound(w, t) {
      var tries = 0, ex = sentenceFor(l, w);
      var prompt = t === "hear" ? "Tap the word: " + w : "Which word is missing? " + ex.s;
      var q = t === "hear" ? '<p class="game-q">Tap the word you hear <button class="mini-btn" id="again">🔊</button></p>'
        : '<p class="game-q">Which word is missing? <button class="mini-btn" id="again">🔊</button></p><div class="sw-fill"><span class="sw-emo">' + ex.e + "</span>" +
          esc(ex.s).replace(new RegExp("\\b" + w + "\\b", w === "I" ? "" : "i"), '<span class="sw-blank">?</span>') + "</div>";
      var first = t === "fill" && ex.s.toLowerCase().indexOf(w.toLowerCase() + " ") === 0;   // blank starts the sentence → show Capitals
      frame(q + '<div class="choice-row">' + choices(w).map(function (c) { var cc = first ? c.charAt(0).toUpperCase() + c.slice(1) : c; return '<button class="choice word" data-c="' + esc(c) + '">' + esc(cc) + "</button>"; }).join("") + "</div>", prompt, "happy");
      speak(prompt);
      $("again").onclick = function () { speak(t === "hear" ? w : ex.s, { rate: 0.8 }); };
      view.querySelectorAll(".choice").forEach(function (el) {
        el.onclick = function () {
          if (el.dataset.c.toLowerCase() === w.toLowerCase()) {
            el.classList.add("right"); sfx.ding(); if (!tries) { score++; addPoints(2); }
            if (window.Tracker) Tracker.answer(!tries, "Sight words", { word: w });
            var b = view.querySelector(".sw-blank"); if (b) { b.textContent = w; b.classList.add("filled"); }
            echo(pick(PRAISE.right) + " " + (t === "fill" ? ex.s : w + "! " + spellOut(w)), "happy").then(onNav(function () { setTimeout(onNav(next), 250); }));
          } else {
            tries++; el.classList.add("nope"); sfx.boop();
            echo(pick(PRAISE.oops) + " That says " + el.dataset.c + ". Find " + w + "!", "happy");
          }
        };
      });
    }
    function sayRound(w) {
      var tries = 0;
      frame('<p class="game-q">Read this word to Echo!</p><div class="say-word sw-say" id="sayWord">' + esc(w) + "</div>" +
        '<div class="say-row"><button class="mic-btn" id="sayMic"><span>🎤</span></button><button class="mini-btn" id="hearIt">🔊 Help me</button></div>', "Tap the microphone and read the word!", "listen");
      speak("Tap the microphone and read the word!");
      $("hearIt").onclick = function () { speak(w + ". " + spellOut(w), { rate: 0.8 }); };
      $("sayMic").onclick = function () {
        var btn = $("sayMic"); if (btn.classList.contains("live")) return;
        hush(); sfx.mic(); btn.classList.add("live");
        setTimeout(function () {
          listen({ target: Listener.tokens(w), single: true,
            onDone: function (res) {
              btn.classList.remove("live");
              if (!document.body.contains(btn)) return;
              if (res.hits[0]) {
                $("sayWord").classList.add("right"); sfx.ding(); confetti(18); score++; addPoints(tries ? 2 : 3);
                if (window.Tracker) Tracker.answer(!tries, "Sight words", { word: w, said: true });
                echo(pick(PRAISE.fixed) + " " + w + "!", "happy").then(onNav(function () { setTimeout(onNav(next), 250); }));
              } else if (++tries >= 2) {
                if (window.Tracker) Tracker.answer(false, "Sight words", { word: w, said: true });
                echo("Good try! This word is " + w + ". " + spellOut(w), "happy").then(onNav(function () { setTimeout(onNav(next), 300); }));
              } else echo(res.heardAny ? "So close! Listen: " + w + ". Try again!" : "I couldn't hear you. Say it nice and loud!", "happy");
            },
            onError: function (code) { btn.classList.remove("live"); useMic = false; micTrouble(code, true); setTimeout(onNav(next), 2500); }
          });
        }, 200);
      };
    }
    function finish() {
      var r = lrec(l.id), first = !r.game;
      r.game = true; saveLessons();
      if (first) addPoints(5);
      if (window.Tracker) Tracker.complete("sightgame", score, plan.length, { item: "Sight words " + l.title });
      sfx.fanfare(); confetti(50);
      current = { screen: "ldone", arg: { lesson: l.id } };
      view.innerHTML = echoRow("Hooray! " + score + " of " + plan.length + "! Now let's build some sentences!", "happy") +
        '<div class="celebrate"><div class="big-emoji">👀✨</div><h2>' + score + " of " + plan.length + " words!</h2>" +
        '<button class="big-btn go" id="toBuild">🧩 Build a Sentence</button><button class="big-btn alt" id="toLesson">⬅ Back</button></div>';
      echo($("echoSay").textContent, "happy");
      $("toBuild").onclick = function () { go("sbuild", { lesson: l.id }); };
      $("toLesson").onclick = function () { go("lesson", l.id); };
    }
    next();
  }
  // tap the word tiles in order, then read the sentence to Echo
  function renderSightBuild(arg) {
    var l = lessonById(arg.lesson), si = arg.s || 0, X = l.sentences[si], score = arg.score || 0;
    var end = X.s.slice(-1), words = X.s.slice(0, -1).split(" "), tiles = shuffle(words.map(function (w, i) { return { w: w, i: i }; }));
    var placed = [], tries = 0;
    $("topTitle").textContent = "Build a Sentence · " + (si + 1) + "/" + l.sentences.length;
    view.innerHTML = echoRow("", "happy") + '<div class="game-box" style="' + (isTeam(l) ? themeOf(l) : SW_THEME) + '">' +
      '<div class="round-dots">' + l.sentences.map(function (_, k) { return '<i class="' + (k < si ? "done" : k === si ? "now" : "") + '"></i>'; }).join("") + "</div>" +
      '<p class="game-q"><span class="pic-big">' + X.e + '</span> <button class="mini-btn" id="again">🔊 Hear it</button></p>' +
      '<div class="sw-line" id="line"></div><div class="sw-bank">' + tiles.map(function (t, k) { return '<button class="choice word sw-tile" data-k="' + k + '">' + esc(t.w) + "</button>"; }).join("") + "</div>" +
      '<div class="say-row"><button class="mini-btn" id="undo">↩ Undo</button></div><div id="readRow"></div></div>';
    function draw() {
      $("line").innerHTML = placed.length ? placed.map(function (k) { return '<span class="sw-placed">' + esc(tiles[k].w) + "</span>"; }).join(" ") + (placed.length === tiles.length ? '<span class="sw-placed end">' + end + "</span>" : "")
        : '<span class="sw-ph">Tap the words in order</span>';
      view.querySelectorAll(".sw-tile").forEach(function (b) { b.disabled = placed.indexOf(+b.dataset.k) >= 0; });
    }
    draw();
    $("again").onclick = function () { speak(X.s, { rate: 0.75 }); };
    $("undo").onclick = function () { placed.pop(); draw(); };
    view.querySelectorAll(".sw-tile").forEach(function (b) {
      b.onclick = function () {
        sfx.pop(); speak(tiles[+b.dataset.k].w, { rate: 0.85 });
        placed.push(+b.dataset.k); draw();
        if (placed.length < tiles.length) return;
        var ok = placed.every(function (k, n) { return tiles[k].w === words[n]; });
        if (!ok) {
          tries++; sfx.boop(); $("line").classList.add("shake");
          setTimeout(function () { $("line").classList.remove("shake"); placed = []; draw(); }, 600);
          echo("Oops, mixed up! The word with the big capital letter goes first. Listen: " + X.s, "happy");
          return;
        }
        $("line").classList.add("right"); $("undo").disabled = true; sfx.ding(); confetti(24);
        if (!tries) { score++; addPoints(3); } else addPoints(1);
        S.built = (S.built || 0) + 1; store(K.built, S.built); if (S.built >= 6) trophy("builder");
        if (window.Tracker) Tracker.answer(!tries, "Build a sentence", { sentence: X.s });
        readIt();
      };
    });
    function nextOne() {
      if (si + 1 < l.sentences.length) go("sbuild", { lesson: l.id, s: si + 1, score: score });
      else finishSightLesson(l, score, l.sentences.length);
    }
    function readIt() {
      var row = $("readRow");
      row.innerHTML = '<div class="say-row">' + (S.helper ? '<button class="big-btn go small" id="saidIt">✅ I read it!</button>' : '<button class="mic-btn" id="readMic"><span>🎤</span></button>') +
        '<button class="mini-btn" id="skipRead">Next ▶</button></div>';
      echo(S.helper ? "You built it! Now read it out loud to a grown-up." : "You built it! Now tap the microphone and read it to me!", S.helper ? "happy" : "listen");
      $("skipRead").onclick = nextOne;
      if ($("saidIt")) $("saidIt").onclick = function () { sfx.fanfare(); addPoints(2); echo(pick(PRAISE.perfect), "happy").then(onNav(nextOne)); };
      if ($("readMic")) $("readMic").onclick = function () {
        var btn = $("readMic"); if (btn.classList.contains("live")) return;
        hush(); sfx.mic(); btn.classList.add("live");
        setTimeout(function () {
          listen({ target: Listener.tokens(X.s),
            onDone: function (res) {
              btn.classList.remove("live");
              if (!document.body.contains(btn)) return;
              var n = res.hits.filter(Boolean).length;
              if (n === res.hits.length) { sfx.fanfare(); confetti(40); addPoints(3); trophy("first-read"); echo(pick(PRAISE.perfect), "happy").then(onNav(nextOne)); }
              else if (n) echo("Nice reading! " + n + " of " + res.hits.length + " words. Listen: " + X.s + ". Try again, or tap Next!", "happy");
              else echo("I couldn't hear you. Tap the microphone and read nice and loud!", "happy");
            },
            onError: function (code) { btn.classList.remove("live"); micTrouble(code, true); }
          });
        }, 200);
      };
    }
    echo("Listen: " + X.s + " Now build it! Tap the words in order.", "happy");
  }
  function finishSightLesson(l, score, total) {
    var r = lrec(l.id), wasDone = r.done, team = isTeam(l);
    r.quiz = true;
    current = { screen: "ldone", arg: { lesson: l.id } };
    if (!r.meet || !r.game) {
      saveLessons();
      var need = !r.meet ? (team ? "dmeet" : "smeet") : (team ? "dgame" : "sgame");
      var label = { smeet: "👀 Meet the Words", sgame: "🎮 Word Game", dmeet: "👋 Meet the Sound", dgame: "🎮 Sound Game" }[need];
      view.innerHTML = echoRow("Great building! Now finish the " + label.slice(3) + " step to win your sticker!", "happy") +
        '<div class="celebrate"><button class="big-btn go" id="dGo">' + label + "</button></div>";
      echo($("echoSay").textContent, "happy");
      $("dGo").onclick = function () { go(need, { lesson: l.id }); };
      return;
    }
    r.done = true; saveLessons();
    var newSticker = giveSticker("l:" + l.id);
    if (!wasDone) { giveTicket(); addPoints(10); }
    if (window.Tracker) Tracker.complete(team ? "soundteams" : "sightwords", score, total, { item: (team ? "Sound team " : "Sight words ") + l.title, firstTime: !wasDone });
    var ls = phaseOfLesson(l.id).lessons;
    if (ls.every(function (x) { return lrec(x.id).done; })) trophy(l.kind === "blend" ? "blend-champ" : team ? "team-champ" : "sight-star");
    hud(); sfx.fanfare(); confetti(90);
    var nextL = ls.filter(function (x) { return !lrec(x.id).done; })[0];
    view.innerHTML = echoRow("", "happy") +
      '<div class="celebrate"><div class="sticker-reveal' + (newSticker ? " new" : "") + '"><span>' + l.sticker.emoji + "</span></div>" +
      "<h2>" + (team ? "You know the " + esc(l.title) + " sound!" : "You know " + esc(l.words.join(", ")) + "!") + "</h2>" +
      (wasDone ? "" : '<p class="done-loot">🎟️ +1 Prize Wheel ticket · ⭐ +10 bonus</p>') +
      '<div class="done-actions">' +
        (nextL ? '<button class="big-btn go" id="dNext">' + (team ? "🤫 Next sound: " : "👀 Next words: ") + esc(nextL.title) + "</button>" : '<button class="big-btn go" id="dBooks">📚 Read the story books</button>') +
        '<button class="big-btn alt" id="dHome">🗺️ All steps</button></div></div>';
    echo(newSticker ? "You did it! Here is your " + l.sticker.name + " sticker!" : "You know these words so well!", "happy");
    if ($("dNext")) $("dNext").onclick = function () { go("lesson", nextL.id); };
    if ($("dBooks")) $("dBooks").onclick = function () { go("shelf"); };
    $("dHome").onclick = function () { go("home"); };
  }

  /* ============================================================
     PHASE 4 — Sh, Ch, Th: meet the sound team → sound game → build a sentence
     (the sentence step reuses the sight-word builder above)
     ============================================================ */
  // Phase 4 (sh ch th) and Phase 5 (blends) share these screens; a lesson's `teams` list says which
  function isTeam(l) { return l.kind === "digraph" || l.kind === "blend"; }
  function themeOf(l) { var p = phaseOfLesson(l.id); return "--bk:" + p.color + ";--bk2:" + p.accent; }
  function teamOf(w, teams) { for (var i = 0; i < teams.length; i++) if (w.toLowerCase().indexOf(teams[i]) >= 0) return teams[i]; return ""; }
  function teamWordHtml(w, t) { var at = w.indexOf(t); return at < 0 ? esc(w) : esc(w.slice(0, at)) + '<b class="dg-hi">' + esc(t) + "</b>" + esc(w.slice(at + t.length)); }
  function teamSay(t) { return t + " says " + DIGRAPHS[t].say + "! " + DIGRAPHS[t].how; }
  function teamWords(kind) {   // every word of this kind taught, tagged with its team, for wrong-answer pictures
    var all = [];
    PHASES.forEach(function (p) { (p.lessons || []).forEach(function (l) { if (l.kind === kind) l.words.forEach(function (x) { all.push({ w: x.w, e: x.e, t: teamOf(x.w, l.teams) }); }); }); });
    return all;
  }
  function renderTeamLesson(id) {
    var l = lessonById(id), r = lrec(id);
    $("topTitle").textContent = "Sound Team: " + l.title;
    view.innerHTML = '<div class="letter-strip">' + l.teams.map(function (x) { return '<span class="ls-chip dg">' + x + "</span>"; }).join("") + "</div>" +
      echoRow(r.done ? "You're a sound team champ! Play again any time!" : r.meet ? "Let's play the sound game!" : l.mix ? "Time to mix up all three sound teams!" : "Two letters, ONE sound! Let's meet them!") +
      '<div class="steps">' +
        stepCard(1, "👋", "Meet the Sound", r.meet ? "Done! ✔" : "Hear it, say it, see the words", r.meet, "dmeet") +
        stepCard(2, "🎮", "Sound Game", r.game ? "Done! ✔" : "Find the word, pick the sound team", r.game, "dgame") +
        stepCard(3, "🧩", "Build a Sentence", r.quiz ? "Done! ✔" : "Put the words in order, then read it", r.quiz, "sbuild") +
      "</div>";
    view.querySelectorAll("[data-step]").forEach(function (el) { el.onclick = function () { sfx.pop(); go(el.dataset.step, { lesson: id }); }; });
    echo($("echoSay").textContent, "happy");
  }
  function renderTeamMeet(arg) {
    var l = lessonById(arg.lesson), heard = {};
    $("topTitle").textContent = "Meet the Sound";
    view.innerHTML = echoRow("") +
      '<div class="dg-teams">' + l.teams.map(function (t) {
        return '<button class="dg-team" data-t="' + t + '"><span class="dg-big"><i>' + t.charAt(0) + "</i><i>" + t.charAt(1) + '</i></span><span class="dg-e">' + DIGRAPHS[t].e + '</span><small>' + esc(DIGRAPHS[t].say) + "</small></button>";
      }).join("") + "</div>" +
      '<div class="meet-grid">' + l.words.map(function (x) {
        return '<button class="meet-card dg-card" data-w="' + esc(x.w) + '"><span class="mc-pic">' + x.e + '</span><span class="mc-word dg-word">' + teamCard(x.w, teamOf(x.w, l.teams)) + "</span></button>";
      }).join("") + "</div>" +
      '<div class="home-actions"><button class="big-btn go" id="meetDone">▶ Play the Sound Game</button></div>';
    view.querySelectorAll(".dg-team").forEach(function (el) {
      el.onclick = function () { el.classList.remove("pop"); void el.offsetWidth; el.classList.add("pop"); speak(teamSay(el.dataset.t), { rate: 0.82 }); };
    });
    view.querySelectorAll(".dg-card").forEach(function (el) {
      el.onclick = function () {
        var w = el.dataset.w; heard[w] = true; el.classList.add("heard");
        soundOut(w, el);
        if (Object.keys(heard).length === l.words.length) pulse($("meetDone"));
      };
    });
    $("meetDone").onclick = function () {
      var r = lrec(l.id); if (!r.meet) { r.meet = true; saveLessons(); addPoints(3); }
      go("dgame", { lesson: l.id });
    };
    var t0 = l.teams[0];
    echo(l.kind === "blend" ? (l.mix ? "These blends hide at the END of words! " : "Blends! Two sounds slide together, like a slide at the park. ") + "Tap each blend to hear it, then tap the pictures!" :
      l.mix ? "Sh, ch and th! Tap each team to hear it, then tap the pictures!" : "Look! " + t0.charAt(0) + " and " + t0.charAt(1) + " hold hands and say " + DIGRAPHS[t0].say + ". " + DIGRAPHS[t0].how + " Tap the pictures to sound them out!", "happy");
  }
  function renderTeamGame(arg) {
    var l = lessonById(arg.lesson), useMic = !S.helper, round = 0, score = 0;
    var plan = shuffle(l.words).slice(0, 6).map(function (x, i) {
      var t = ["hear", "team", "say"][i % 3];
      if (t === "say" && !useMic) t = "team";
      return { x: x, t: t };
    });
    $("topTitle").textContent = "Sound Game";
    function frame(inner, msg, mood) {
      view.innerHTML = echoRow(msg, mood) + '<div class="game-box" style="' + themeOf(l) + '">' +
        '<div class="round-dots">' + plan.map(function (_, i) { return '<i class="' + (i < round - 1 ? "done" : i === round - 1 ? "now" : "") + '"></i>'; }).join("") + "</div>" + inner + "</div>";
    }
    function next() {
      if (round >= plan.length) return finish();
      var r = plan[round++];
      if (r.t === "say") sayRound(r.x); else if (r.t === "team") teamRound(r.x); else hearRound(r.x);
    }
    function right(msg) {
      sfx.ding(); confetti(14);
      echo(pick(PRAISE.right) + " " + msg, "happy").then(onNav(function () { setTimeout(onNav(next), 250); }));
    }
    // hear a word → tap its picture (wrong answers use a DIFFERENT sound team when possible)
    function hearRound(x) {
      var tries = 0, t = teamOf(x.w, l.teams);
      var pool = teamWords(l.kind).filter(function (y) { return y.w !== x.w && y.t !== t; });
      if (pool.length < 2) pool = l.words.filter(function (y) { return y.w !== x.w; });
      var opts = shuffle([x].concat(shuffle(pool).slice(0, 2)));
      frame('<p class="game-q">Tap the word you hear <button class="mini-btn" id="again">🔊</button></p><div class="choice-row">' +
        opts.map(function (o) { return '<button class="choice pic-choice" data-w="' + esc(o.w) + '"><span class="qe">' + o.e + '</span><span class="qt">' + teamWordHtml(o.w, o.t || teamOf(o.w, l.teams)) + "</span></button>"; }).join("") + "</div>", "Tap the word: " + x.w, "happy");
      speak("Find the word: " + x.w);
      $("again").onclick = function () { speak(x.w, { rate: 0.75 }); };
      view.querySelectorAll(".pic-choice").forEach(function (el) {
        el.onclick = function () {
          if (el.dataset.w === x.w) {
            el.classList.add("right"); view.querySelectorAll(".pic-choice").forEach(function (b) { b.disabled = true; });
            if (!tries) { score++; addPoints(2); }
            if (window.Tracker) Tracker.answer(!tries, "Sound teams", { word: x.w });
            right(x.w + "! " + t + " says " + DIGRAPHS[t].say + ".");
          } else {
            tries++; el.classList.add("nope"); sfx.boop();
            echo(pick(PRAISE.oops) + " That's " + el.dataset.w + ". Listen: " + x.w + ".", "happy");
          }
        };
      });
    }
    // see a picture + the word with a gap → pick sh, ch or th
    function teamRound(x) {
      var tries = 0, t = teamOf(x.w, l.teams), at = x.w.indexOf(t);
      var gap = esc(x.w.slice(0, at)) + '<span class="sw-blank dg-gap">?</span>' + esc(x.w.slice(at + t.length));
      var picks = l.teams.length >= 3 ? l.teams : ["sh", "ch", "th"];
      frame('<p class="game-q">Which sound team is missing? <button class="mini-btn" id="again">🔊</button></p>' +
        '<div class="say-word pic-say"><span class="pic-big">' + x.e + "</span><span>" + gap + "</span></div>" +
        '<div class="choice-row">' + shuffle(picks).map(function (c) { return '<button class="choice word dg-pick" data-c="' + c + '">' + c + "</button>"; }).join("") + "</div>",
        "What do you hear in " + x.w + "?", "happy");
      speak("Listen: " + x.w + ". Do you hear " + picks.slice(0, -1).join(", ") + ", or " + picks[picks.length - 1] + "?");
      $("again").onclick = function () { speak(x.w, { rate: 0.7 }); };
      view.querySelectorAll(".dg-pick").forEach(function (el) {
        el.onclick = function () {
          if (el.dataset.c === t) {
            el.classList.add("right"); view.querySelectorAll(".dg-pick").forEach(function (b) { b.disabled = true; });
            var g = view.querySelector(".dg-gap"); if (g) { g.textContent = t; g.classList.add("filled"); }
            if (!tries) { score++; addPoints(2); }
            if (window.Tracker) Tracker.answer(!tries, "Sound teams", { word: x.w, team: t });
            right(t + "! " + x.w + "!");
          } else {
            tries++; el.classList.add("nope"); sfx.boop();
            var c = el.dataset.c;
            echo("Hmm, " + c + " says " + DIGRAPHS[c].say + ". " + (tries >= 2 ? DIGRAPHS[t].how : "Listen again: " + x.w + "."), "happy");
          }
        };
      });
    }
    function sayRound(x) {
      var tries = 0;
      frame('<p class="game-q">Read this word to Echo!</p><div class="say-word pic-say" id="sayWord"><span class="pic-big">' + x.e + "</span><span>" + teamCard(x.w, teamOf(x.w, l.teams)) + "</span></div>" +
        '<div class="say-row"><button class="mic-btn" id="sayMic"><span>🎤</span></button><button class="mini-btn" id="hearIt">🔊 Help me</button></div>', "Tap the microphone and read the word!", "listen");
      speak("Tap the microphone and read the word!");
      $("hearIt").onclick = function () { soundOut(x.w, $("sayWord")); };
      $("sayMic").onclick = function () {
        var btn = $("sayMic"); if (btn.classList.contains("live")) return;
        hush(); sfx.mic(); btn.classList.add("live");
        setTimeout(function () {
          listen({ target: Listener.tokens(x.w), single: true,
            onDone: function (res) {
              btn.classList.remove("live");
              if (!document.body.contains(btn)) return;
              if (res.hits[0]) {
                $("sayWord").classList.add("right"); score++; addPoints(tries ? 2 : 3);
                if (window.Tracker) Tracker.answer(!tries, "Sound teams", { word: x.w, said: true });
                right(x.w + "!");
              } else if (++tries >= 2) {
                if (window.Tracker) Tracker.answer(false, "Sound teams", { word: x.w, said: true });
                echo("Good try! It says " + x.w + ". You'll get it next time!", "happy").then(onNav(function () { setTimeout(onNav(next), 300); }));
              } else {
                echo(res.heardAny ? "So close! Let's sound it out together." : "I couldn't hear you. Say it nice and loud!", "happy")
                  .then(onNav(function () { return res.heardAny ? soundOut(x.w, $("sayWord")) : null; }));
              }
            },
            onError: function (code) { btn.classList.remove("live"); useMic = false; micTrouble(code, true); setTimeout(onNav(next), 2500); }
          });
        }, 200);
      };
    }
    function finish() {
      var r = lrec(l.id), first = !r.game;
      r.game = true; saveLessons();
      if (first) addPoints(5);
      if (window.Tracker) Tracker.complete("teamgame", score, plan.length, { item: "Sound team " + l.title });
      sfx.fanfare(); confetti(50);
      current = { screen: "ldone", arg: { lesson: l.id } };
      var t0 = l.teams[0];
      view.innerHTML = echoRow(score + " of " + plan.length + "! " + DIGRAPHS[t0].joke + " Now let's build some sentences!", "happy") +
        '<div class="celebrate"><div class="big-emoji">' + DIGRAPHS[t0].e + '✨</div><h2>' + score + " of " + plan.length + " right!</h2>" +
        '<button class="big-btn go" id="toBuild">🧩 Build a Sentence</button><button class="big-btn alt" id="toLesson">⬅ Back</button></div>';
      echo($("echoSay").textContent, "happy");
      $("toBuild").onclick = function () { go("sbuild", { lesson: l.id }); };
      $("toLesson").onclick = function () { go("lesson", l.id); };
    }
    next();
  }

  /* ---------------- sticker book & trophies ---------------- */
  function renderStickers() {
    $("topTitle").textContent = "My Sticker Book";
    var bookS = BOOKS.map(function (b) {
      var got = S.stickers.indexOf("b:" + b.id) >= 0;
      return '<div class="stk' + (got ? " got" : "") + '" style="--bk:' + b.color + '"><span class="se">' + (got ? b.sticker.emoji : "❔") + "</span><small>" + (got ? esc(b.sticker.name) : "Finish Book " + b.n) + "</small></div>";
    }).join("");
    var funS = FUN_STICKERS.map(function (f) {
      var got = S.stickers.indexOf(f.id) >= 0;
      return '<div class="stk fun' + (got ? " got" : "") + '"><span class="se">' + (got ? f.emoji : "❔") + "</span><small>" + (got ? esc(f.name) : "???") + "</small></div>";
    }).join("");
    var toNext = 3 - (S.perfect % 3);
    var letterS = PHASES[0].lessons.map(function (l) {
      var got = S.stickers.indexOf("l:" + l.id) >= 0;
      return '<div class="stk' + (got ? " got" : "") + '" style="--bk:#ffd8a8"><span class="se">' + (got ? l.sticker.emoji : "❔") + "</span><small>" + (got ? esc(l.sticker.name) : esc(l.title)) + "</small></div>";
    }).join("");
    var sightS = phaseById("k3").lessons.map(function (l) {
      var got = S.stickers.indexOf("l:" + l.id) >= 0;
      return '<div class="stk' + (got ? " got" : "") + '" style="--bk:#d0bfff"><span class="se">' + (got ? l.sticker.emoji : "❔") + "</span><small>" + (got ? esc(l.sticker.name) : esc(l.title)) + "</small></div>";
    }).join("");
    function album(pid) {
      var p = phaseById(pid);
      return p.lessons.map(function (l) {
        var got = S.stickers.indexOf("l:" + l.id) >= 0;
        return '<div class="stk' + (got ? " got" : "") + '" style="--bk:' + p.color + '"><span class="se">' + (got ? l.sticker.emoji : "❔") + "</span><small>" + (got ? esc(l.sticker.name) : esc(l.title)) + "</small></div>";
      }).join("");
    }
    var teamS = album("k4"), blendS = album("k5");
    view.innerHTML = echoRow("Look at all your stickers! Read pages perfectly to win more!", "happy") +
      '<section class="album"><h3>🔤 Letter Stickers</h3><div class="stk-grid">' + letterS + "</div></section>" +
      '<section class="album"><h3>👀 Sight Word Stickers</h3><div class="stk-grid">' + sightS + "</div></section>" +
      '<section class="album"><h3>🤫 Sound Team Stickers</h3><div class="stk-grid">' + teamS + "</div></section>" +
      '<section class="album"><h3>🌊 Blend Stickers</h3><div class="stk-grid">' + blendS + "</div></section>" +
      '<section class="album"><h3>📚 Book Stickers</h3><div class="stk-grid">' + bookS + "</div></section>" +
      '<section class="album"><h3>🌟 Perfect-Reading Stickers <small>(' + (nextFunSticker() ? toNext + " more perfect page" + (toNext > 1 ? "s" : "") + " for the next one" : "all collected!") + ")</small></h3><div class=\"stk-grid\">" + funS + "</div></section>";
    echo($("echoSay").textContent, "happy");
  }
  function renderTrophies() {
    $("topTitle").textContent = "My Trophies";
    view.innerHTML = echoRow("Every trophy shows how hard you worked!", "happy") +
      '<div class="trophy-list">' + PH_TROPHIES.map(function (t) {
        var got = S.trophies.indexOf(t.id) >= 0;
        return '<div class="trophy' + (got ? " got" : "") + '"><span class="ti">' + (got ? t.icon : "🔒") + "</span><span><b>" + esc(t.name) + "</b><small>" + esc(t.desc) + "</small></span></div>";
      }).join("") + "</div>" +
      '<div class="stat-row"><span>⭐ ' + S.points + " points</span><span>💯 " + S.perfect + " perfect pages</span><span>🔧 " + S.fixed + " tricky words fixed</span></div>";
    echo($("echoSay").textContent, "happy");
  }

  /* ---------------- wiring ---------------- */
  $("backBtn").onclick = back;
  $("muteBtn").onclick = function () { S.mute = !S.mute; store(K.mute, S.mute); if (S.mute) hush(); hud(); };
  $("stkPill").onclick = function () { go("stickers"); };
  $("trophyBtn").onclick = function () { go("trophies"); };
  document.addEventListener("keydown", function (e) {
    if (current.screen !== "read" || !R) return;
    if (e.key === "ArrowRight") { e.preventDefault(); nextPage(); }
    else if (e.key === "ArrowLeft" && R.i > 0) { e.preventDefault(); go("read", { book: R.b.id, page: R.i - 1 }); }
    else if (e.key === " " && $("micBtn")) { e.preventDefault(); toggleMic(); }
  });

  hud();
  go("home");
  window.PhonicsApp = { go: go, state: S };
})();
