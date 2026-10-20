/* ============================================================
   Write & Trace — app engine (KG handwriting)
   Screens: home (phase path) → phase (lessons) → lesson (3 steps)
            👀 Watch & Trace → ✍️ Your Turn → 🧩 Picture Words / 🎨 Magic Drawing
            → done · stickers · trophies
   Tracing is checked by TracePad (js/tracepad.js, shared with arabic/).
   ============================================================ */
(function () {
  "use strict";

  /* ---------------- storage ---------------- */
  var K = { pts: "tw_points", stk: "tw_stickers", tro: "tw_trophies", les: "tw_lessons", clean: "tw_clean", built: "tw_built", mute: "tw_mute", tickets: "rw_tickets" };
  function load(k, d) { try { var v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }
  function store(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  var S = { points: load(K.pts, 0), stickers: load(K.stk, []), trophies: load(K.tro, []), lessons: load(K.les, {}),
            clean: load(K.clean, 0), built: load(K.built, 0), mute: load(K.mute, false) };
  function lrec(id) {
    if (!S.lessons[id]) S.lessons[id] = { trace: false, write: false, build: false, done: false, stars: {} };
    return S.lessons[id];
  }
  function save() { store(K.les, S.lessons); }
  function phaseById(id) { for (var i = 0; i < PHASES.length; i++) if (PHASES[i].id === id) return PHASES[i]; return PHASES[0]; }
  function lessonById(id) {
    for (var i = 0; i < PHASES.length; i++) for (var j = 0; j < (PHASES[i].lessons || []).length; j++) if (PHASES[i].lessons[j].id === id) return PHASES[i].lessons[j];
    return PHASES[0].lessons[0];
  }
  function phaseOfLesson(id) { for (var i = 0; i < PHASES.length; i++) if ((PHASES[i].lessons || []).some(function (l) { return l.id === id; })) return PHASES[i]; return PHASES[0]; }
  function phaseDone(p) { return !!p.lessons && p.lessons.every(function (l) { return lrec(l.id).done; }); }
  function phaseOpen(p) { return !!p.lessons && (p.n === 1 || phaseDone(PHASES[p.n - 2])); }

  /* ---------------- dom helpers ---------------- */
  var $ = function (id) { return document.getElementById(id); };
  var view = $("view");
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function starsHtml(n, max) { var s = ""; for (var i = 0; i < (max || 3); i++) s += '<span class="st' + (i < n ? " on" : "") + '">★</span>'; return s; }

  /* ---------------- sound ---------------- */
  var voice = null, speakToken = 0;
  function chooseVoice() {
    if (!window.speechSynthesis) return;
    var vs = speechSynthesis.getVoices().filter(function (v) { return /^en[-_]/i.test(v.lang); });
    var prefs = [/Aria/i, /Jenny/i, /Ana\b/i, /Samantha/i, /Google US English/i, /Zira/i, /en-US/i];
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
      u.lang = "en-US"; u.rate = opt.rate || 0.9; u.pitch = opt.pitch || 1.1;
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

  /* ---------------- Scribbles the Crayon ---------------- */
  function buddyRow(msg, mood) {
    return '<div class="echo-row"><div class="echo-bird" id="buddyBot">' + Art.scribbles(mood) + '</div><div class="echo-bubble" id="buddySay">' + esc(msg || "") + "</div></div>";
  }
  function buddy(msg, mood, noVoice) {
    var b = $("buddySay"), bot = $("buddyBot");
    if (b) { b.textContent = msg; b.classList.remove("pop"); void b.offsetWidth; b.classList.add("pop"); }
    if (bot) bot.innerHTML = Art.scribbles(mood || "happy");
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
    var t = TW_TROPHIES.filter(function (x) { return x.id === id; })[0]; if (!t) return;
    S.trophies.push(id); store(K.tro, S.trophies);
    toast(t.icon + " Trophy: " + t.name + "!"); sfx.fanfare();
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

  /* ---------------- shapes & words → TracePad sheets ---------------- */
  // move a path sideways (M/L/C add dx to every x; A only to its end point)
  function shiftPath(d, dx) {
    return d.replace(/([MLCA])([^MLCA]*)/g, function (_, cmd, args) {
      var n = args.trim().split(/[\s,]+/).map(Number);
      if (cmd === "A") for (var i = 5; i < n.length; i += 7) n[i] += dx;
      else for (var j = 0; j < n.length; j += 2) n[j] += dx;
      return cmd + n.join(",") + " ";
    }).trim();
  }
  function sheet(item) {
    if (SHAPES[item]) {   // one shape, centred on a sheet at least 120 wide so the lines show
      var W = Math.max(SHAPES[item].w + 16, 120), dx = (W - SHAPES[item].w) / 2;
      return { w: W, strokes: SHAPES[item].strokes.map(function (s) { return s.dot ? { dot: [s.dot[0] + dx, s.dot[1]] } : { d: shiftPath(s.d, dx) }; }) };
    }
    var x = 10, strokes = [];
    item.split("").forEach(function (ch) {
      var L = SHAPES[ch];
      L.strokes.forEach(function (s) { strokes.push(s.dot ? { dot: [s.dot[0] + x, s.dot[1]] } : { d: shiftPath(s.d, x) }); });
      x += L.w + 4;
    });
    return { w: x + 6, strokes: strokes };
  }
  // size the pad so the whole sheet fits on screen (never taller than ~half the window)
  function fitPad(el, sh) {
    var maxH = Math.max(150, Math.min(window.innerHeight * 0.46, 340));
    el.style.width = "min(100%, " + Math.round(maxH * sh.w / SHEET_H) + "px)";
  }
  function isWord(item) { return !SHAPES[item]; }
  function shapeLabel(item) { return SHAPES[item] && SHAPES[item].name ? SHAPES[item].e + " " + SHAPES[item].name : item; }
  function talkFor(item) {
    if (SHAPE_TALK[item]) return SHAPE_TALK[item];
    return "Let's write " + item + ". " + item.split("").join(", ") + ". " + item + "! One letter at a time.";
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
    ({ home: renderHome, phase: renderPhase, lesson: renderLesson, trace: renderTrace, build: renderBuild, draw: renderDraw, stickers: renderStickers, trophies: renderTrophies })[screen](arg);
  }
  function back() {
    var c = current;
    if (/^(trace|build|draw|done)$/.test(c.screen)) go("lesson", c.arg.lesson);
    else if (c.screen === "lesson") go("phase", phaseOfLesson(c.arg).id);
    else go("home");
  }

  /* ---------------- home: the phase path ---------------- */
  function renderHome() {
    $("topTitle").textContent = "Write & Trace";
    var cards = PHASES.map(function (p) {
      var open = phaseOpen(p), soon = !p.lessons, done = phaseDone(p), n = soon ? 0 : p.lessons.filter(function (l) { return lrec(l.id).done; }).length;
      var status = soon ? "Coming soon" : !open ? "🔒 Finish Phase " + (p.n - 1) + " first" : done ? "✅ All done!" : n + " of " + p.lessons.length + " lessons";
      return '<button class="phase-card ' + (soon ? "soon" : !open ? "locked" : done ? "passed" : "open") + '" data-phase="' + p.id + '" style="--bk:' + p.color + ";--bk2:" + p.accent + '"' + (open ? "" : " disabled") + ">" +
        '<span class="ph-n">' + (done ? "⭐" : p.emoji) + "</span>" +
        '<span class="ph-txt"><small>Phase ' + p.n + "</small><b>" + esc(p.title) + "</b><em>" + esc(p.sub) + '</em><span class="ph-status">' + status + "</span></span>" +
        (open ? '<span class="ph-bar"><i style="width:' + Math.round(100 * n / p.lessons.length) + '%"></i></span>' : "") + "</button>";
    }).join('<span class="path-dash" aria-hidden="true"></span>');
    view.innerHTML = buddyRow("Hi! I'm Scribbles the Crayon! Let's make your hand super strong and write letters. Pick a phase!") +
      '<div class="phase-path">' + cards + "</div>" +
      '<div class="home-actions"><button class="big-btn alt" data-go="stickers">🎟️ My Sticker Book</button><button class="big-btn alt" data-go="trophies">🏆 My Trophies</button><button class="big-btn alt" id="jokeBtn">😂 Tell me a joke</button></div>';
    view.querySelectorAll("[data-phase]").forEach(function (el) { el.onclick = function () { sfx.pop(); go("phase", el.dataset.phase); }; });
    view.querySelectorAll("[data-go]").forEach(function (el) { el.onclick = function () { go(el.dataset.go); }; });
    $("jokeBtn").onclick = function () { buddy(pick(JOKES), "wow"); };
    buddy($("buddySay").textContent, "happy");
  }

  function renderPhase(pid) {
    var p = phaseById(pid);
    $("topTitle").textContent = "Phase " + p.n + ": " + p.title;
    view.innerHTML = buddyRow("Pick a lesson! Each one has tracing, writing all by yourself, and a fun surprise.") +
      '<div class="steps">' + p.lessons.map(function (l, i) {
        var r = lrec(l.id), third = l.kind === "warmup" ? "🎨" : "🧩";
        return '<button class="step-card' + (r.done ? " ok" : "") + '" data-lesson="' + l.id + '"><span class="step-n">' + (i + 1) + "</span>" +
          '<span class="step-ic">' + (r.done ? l.sticker.emoji : l.kind === "warmup" ? "〰️" : l.kind === "words" ? "📝" : "✏️") + "</span>" +
          '<span class="step-txt"><b class="letters-title">' + esc(l.title) + "</b>" +
          '<span class="steps-mini"><i class="' + (r.trace ? "ok" : "") + '">👀</i><i class="' + (r.write ? "ok" : "") + '">✍️</i><i class="' + (r.build ? "ok" : "") + '">' + third + "</i></span></span>" +
          '<span class="step-go">' + (r.done ? "✅" : "▶") + "</span></button>";
      }).join("") + "</div>";
    view.querySelectorAll("[data-lesson]").forEach(function (el) { el.onclick = function () { sfx.pop(); go("lesson", el.dataset.lesson); }; });
    buddy($("buddySay").textContent, "happy");
  }

  function stepCard(n, icon, name, sub, ok, step) {
    return '<button class="step-card' + (ok ? " ok" : "") + '" data-step="' + step + '"><span class="step-n">' + n + '</span><span class="step-ic">' + icon + "</span>" +
      '<span class="step-txt"><b>' + esc(name) + "</b><small>" + esc(sub) + '</small></span><span class="step-go">' + (ok ? "✅" : "▶") + "</span></button>";
  }
  function renderLesson(id) {
    var l = lessonById(id), r = lrec(id), warm = l.kind === "warmup";
    $("topTitle").textContent = l.title;
    view.innerHTML = '<div class="letter-strip">' + l.items.map(function (x) { return '<span class="ls-chip' + (isWord(x) ? " wide" : "") + '">' + (SHAPES[x] && SHAPES[x].e || esc(x)) + "</span>"; }).join("") + "</div>" +
      buddyRow(r.done ? "You finished this one! Practise again any time. Practice makes your hand strong!" : !r.trace ? "First, watch me, then trace on the dots!" : !r.write ? "Now try it with only a shadow to help!" : warm ? "Time for Magic Drawing!" : "Let's write some picture words!") +
      '<div class="steps">' +
        stepCard(1, "👀", "Watch & Trace", r.trace ? "Done! ✔" : "Follow the dots and the green start dot", r.trace, "trace") +
        stepCard(2, "✍️", "Your Turn", r.write ? "Done! ✔" : "A faint shadow, then all by yourself", r.write, "write") +
        (warm ? stepCard(3, "🎨", "Magic Drawing", r.build ? "Done! ✔" : "Draw anything with your lines and circles", r.build, "draw")
              : stepCard(3, "🧩", "Picture Words", r.build ? "Done! ✔" : "Spell a word, then write it", r.build, "build")) +
      "</div>";
    view.querySelectorAll("[data-step]").forEach(function (el) {
      el.onclick = function () { sfx.pop(); var s = el.dataset.step; go(s === "write" ? "trace" : s, { lesson: id, mode: s === "write" ? "write" : "trace", i: 0 }); };
    });
    buddy($("buddySay").textContent, "happy");
  }

  /* ---------------- 👀 trace & ✍️ write ---------------- */
  function planFor(l, mode) {
    if (mode === "trace") return l.items.map(function (x) { return { item: x, guide: "full" }; });
    var plan = l.items.map(function (x) { return { item: x, guide: "faint" }; });
    plan.push({ item: l.kind === "warmup" ? "circle" : pick(l.items), guide: "none" });
    return plan;
  }
  function renderTrace(arg) {
    var l = lessonById(arg.lesson), mode = arg.mode, plan = arg.plan || planFor(l, mode), i = arg.i || 0, P = plan[i];
    var fails = arg.fails || 0, item = P.item, sh = sheet(item), streak = 0, lastHint = "";
    $("topTitle").textContent = (mode === "trace" ? "Watch & Trace" : "Your Turn") + " · " + (i + 1) + "/" + plan.length;
    var label = isWord(item) ? '<span class="tw-word">' + esc(item) + "</span>" : SHAPES[item].name ? '<span class="tw-shape">' + shapeLabel(item) + "</span>" : '<span class="tw-letter">' + esc(item) + "</span>";
    var tag = P.guide === "none" ? '<span class="tw-tag solo">🦸 All by myself!</span>' : P.guide === "faint" ? '<span class="tw-tag">👻 Shadow help</span>' : "";
    view.innerHTML = buddyRow("") +
      '<div class="game-box tw-box"><div class="round-dots">' + plan.map(function (_, k) { return '<i class="' + (k < i ? "done" : k === i ? "now" : "") + '"></i>'; }).join("") + "</div>" +
      '<div class="tw-head">' + label + tag + "</div>" +
      '<div class="tw-pad" id="pad"></div>' +
      '<div class="say-row tw-tools"><button class="mini-btn" id="showMe">👀 Show me</button><button class="mini-btn" id="hearIt">🔊 Hear it</button><button class="mini-btn" id="clearIt">🧽 Start over</button></div>' +
      '<div id="nextRow"></div></div>';
    var mine = nav;
    fitPad($("pad"), sh);
    pad = TracePad.mount($("pad"), {
      w: sh.w, h: SHEET_H, strokes: sh.strokes, lines: LINES, guide: P.guide, ink: pick(["#7048e8", "#e64980", "#1c7ed6", "#2f9e44", "#f76707"]),
      onStroke: function (r) {
        if (mine !== nav) return;
        if (r.ok) {
          streak = 0; sfx.scribble();
          var hint = r.reversed ? PRAISE.reversed : !r.startOK && P.guide === "full" ? PRAISE.start : "";
          if (r.left) buddy(hint || pick(PRAISE.stroke), "happy");
          else lastHint = hint;              // said together with the praise when the letter is done
        } else {
          fails++; streak++; sfx.boop();
          if (streak >= 2 && P.guide !== "none") { streak = 0; buddy(pick(PRAISE.helped), "think").then(onNav(function () { if (pad) pad.demo(); })); }
          else buddy(pick(PRAISE[r.reason] || PRAISE.off), "think");
        }
      },
      onDone: function (res) {
        if (mine !== nav) return;
        var stars = fails === 0 ? 3 : fails <= 2 ? 2 : 1;
        if (window.Tracker) Tracker.answer(fails === 0, mode === "trace" ? "Tracing" : "Writing", { item: item, guide: P.guide });
        trophy("first-trace");
        if (fails === 0) { S.clean++; store(K.clean, S.clean); if (S.clean >= 5) trophy("perfect-5"); }
        if (P.guide === "none") trophy("free-hand");
        addPoints(stars); sfx.ding(); confetti(stars * 12);
        plan[i].stars = stars;
        $("nextRow").innerHTML = '<div class="tw-win"><span class="done-stars">' + starsHtml(stars) + '</span><button class="big-btn go" id="nextBtn">' + (i + 1 < plan.length ? "Next ▶" : "🎉 Finish") + "</button></div>";
        $("nextBtn").onclick = function () {
          if (i + 1 < plan.length) go("trace", { lesson: l.id, mode: mode, plan: plan, i: i + 1 });
          else finishStep(l, mode, plan);
        };
        buddy((P.guide === "none" ? pick(PRAISE.free) : pick(PRAISE.win)) + (lastHint ? " " + lastHint : ""), "wow");
      }
    });
    $("showMe").onclick = function () { pad.clear(); pad.demo(); };
    $("hearIt").onclick = function () { speak(talkFor(item)); };
    $("clearIt").onclick = function () { pad.clear(); $("nextRow").innerHTML = ""; };
    var intro = P.guide === "none" ? "No dots this time! Write " + (isWord(item) ? "the word " : "") + (SHAPES[item] && SHAPES[item].name ? "the " + SHAPES[item].name : item) + " all by yourself, on the lines."
      : P.guide === "faint" ? "Now there's just a shadow. " + talkFor(item)
      : talkFor(item) + " Watch me first!";
    buddy(intro, "happy").then(onNav(function (still) { if (still && P.guide === "full" && pad) pad.demo(); }));
  }
  function finishStep(l, mode, plan) {
    var r = lrec(l.id), sum = plan.reduce(function (a, p) { return a + (p.stars || 1); }, 0), stars = Math.round(sum / plan.length);
    r[mode] = true; r.stars[mode] = Math.max(r.stars[mode] || 0, stars); save();
    if (window.Tracker) Tracker.complete(mode, sum, plan.length * 3, { item: l.title });
    stepDone(l, stars, mode === "trace" ? "You traced them all!" : "You wrote them all by yourself!");
  }
  function stepDone(l, stars, title) {
    var r = lrec(l.id);
    if (r.trace && r.write && r.build) return finishLesson(l);
    current = { screen: "done", arg: { lesson: l.id } };
    var nextStep = !r.trace ? "trace" : !r.write ? "write" : l.kind === "warmup" ? "draw" : "build";
    var nextName = { trace: "👀 Watch & Trace", write: "✍️ Your Turn", draw: "🎨 Magic Drawing", build: "🧩 Picture Words" }[nextStep];
    sfx.fanfare(); confetti(50);
    view.innerHTML = buddyRow("", "wow") +
      '<div class="celebrate"><div class="big-emoji">🖍️✨</div><h2>' + esc(title) + '</h2><div class="done-stars">' + starsHtml(stars) + "</div>" +
      '<div class="done-actions"><button class="big-btn go" id="dNext">' + nextName + '</button><button class="big-btn alt" id="dBack">⬅ Lesson</button></div></div>';
    buddy(pick(PRAISE.win) + " " + pick(JOKES), "wow");
    $("dNext").onclick = function () { go(nextStep === "write" ? "trace" : nextStep, { lesson: l.id, mode: nextStep === "write" ? "write" : "trace", i: 0 }); };
    $("dBack").onclick = function () { go("lesson", l.id); };
  }

  /* ---------------- 🧩 picture words: spell it, then write it ---------------- */
  function renderBuild(arg) {
    var l = lessonById(arg.lesson), i = arg.i || 0, X = l.words[i], score = arg.score || 0;
    var letters = X.w.split(""), pool = l.items.join("").split("").filter(function (c, k, a) { return a.indexOf(c) === k && letters.indexOf(c) < 0; });
    var tiles = shuffle(letters.concat(shuffle(pool).slice(0, 2))), placed = [], tries = 0;
    $("topTitle").textContent = "Picture Words · " + (i + 1) + "/" + l.words.length;
    view.innerHTML = buddyRow("") +
      '<div class="game-box tw-box"><div class="round-dots">' + l.words.map(function (_, k) { return '<i class="' + (k < i ? "done" : k === i ? "now" : "") + '"></i>'; }).join("") + "</div>" +
      '<p class="game-q"><span class="pic-big">' + X.e + '</span> <button class="mini-btn" id="again">🔊 Hear it</button></p>' +
      '<div class="tw-slots" id="slots">' + letters.map(function (_, k) { return '<span class="tw-slot" data-k="' + k + '"></span>'; }).join("") + "</div>" +
      '<div class="tile-bank">' + tiles.map(function (c, k) { return '<button class="ltile tw-tile" data-k="' + k + '">' + c + "</button>"; }).join("") + "</div>" +
      '<div id="writeRow"></div></div>';
    function sayIt() { return speak(X.say || X.w, { rate: 0.85 }); }
    $("again").onclick = sayIt;
    view.querySelectorAll(".tw-tile").forEach(function (b) {
      b.onclick = function () {
        var c = tiles[+b.dataset.k], want = letters[placed.length];
        if (c === want) {
          sfx.pop(); b.disabled = true; placed.push(c);
          var slot = view.querySelector('.tw-slot[data-k="' + (placed.length - 1) + '"]'); slot.textContent = c; slot.classList.add("filled");
          speak(LETTER_SAY[c] || c, { rate: 0.8 });
          if (placed.length === letters.length) built();
        } else {
          tries++; sfx.boop(); b.classList.add("nope"); setTimeout(function () { b.classList.remove("nope"); }, 500);
          buddy(pick(PRAISE.buildOops) + " " + X.w + ": " + letters.map(function (x) { return LETTER_SAY[x] || x; }).join(", ") + ".", "think");
        }
      };
    });
    function built() {
      $("slots").classList.add("right"); sfx.ding(); confetti(20);
      if (!tries) { score++; addPoints(2); }
      S.built++; store(K.built, S.built); if (S.built >= 5) trophy("speller");
      if (window.Tracker) Tracker.answer(!tries, "Spelling", { word: X.w });
      view.querySelector(".tile-bank").remove();
      var sh = sheet(X.w);
      $("writeRow").innerHTML = '<p class="game-q">Now write it! ✍️</p><div class="tw-pad' + (sh.w > 200 ? " wide" : "") + '" id="pad"></div>' +
        '<div class="say-row tw-tools"><button class="mini-btn" id="showMe">👀 Show me</button><button class="mini-btn" id="clearIt">🧽 Start over</button></div><div id="nextRow"></div>';
      var mine = nav, fails = 0;
      fitPad($("pad"), sh);
      pad = TracePad.mount($("pad"), {
        w: sh.w, h: SHEET_H, strokes: sh.strokes, lines: LINES, guide: "faint", ink: "#e64980",
        onStroke: function (r) { if (mine !== nav) return; if (r.ok) sfx.scribble(); else { fails++; sfx.boop(); buddy(pick(PRAISE[r.reason] || PRAISE.off), "think"); } },
        onDone: function () {
          if (mine !== nav) return;
          addPoints(fails ? 1 : 2); sfx.fanfare(); confetti(30);
          $("nextRow").innerHTML = '<div class="tw-win"><button class="big-btn go" id="nextBtn">' + (i + 1 < l.words.length ? "Next word ▶" : "🎉 Finish") + "</button></div>";
          $("nextBtn").onclick = function () {
            if (i + 1 < l.words.length) go("build", { lesson: l.id, i: i + 1, score: score });
            else {
              var r = lrec(l.id); r.build = true; r.stars.build = Math.max(r.stars.build || 0, score >= l.words.length ? 3 : score ? 2 : 1); save();
              if (window.Tracker) Tracker.complete("words", score, l.words.length, { item: l.title });
              stepDone(l, r.stars.build, "You spelled and wrote every word!");
            }
          };
          buddy(pick(PRAISE.build) + " You wrote " + X.w + "!", "wow");
        }
      });
      $("showMe").onclick = function () { pad.clear(); pad.demo(); };
      $("clearIt").onclick = function () { pad.clear(); $("nextRow").innerHTML = ""; };
      buddy(pick(PRAISE.build) + " Now write " + X.w + " on the lines!", "happy");
    }
    buddy("What's this? Listen!", "happy").then(onNav(sayIt)).then(onNav(function () { buddy("Tap the letters to spell " + X.w + ".", "happy", true); }));
  }

  /* ---------------- 🎨 magic drawing (warm-up lesson) ---------------- */
  function renderDraw(arg) {
    var l = lessonById(arg.lesson), colors = ["#7048e8", "#e64980", "#1c7ed6", "#2f9e44", "#f76707", "#fab005", "#3b2b20"], color = colors[0], inked = 0;
    $("topTitle").textContent = "Magic Drawing";
    var ideas = ["a sun with rays", "a house with a zig-zag roof", "a happy face", "a bunny in the grass", "a rocket", "a donut with sprinkles"];
    view.innerHTML = buddyRow("") +
      '<div class="game-box tw-box"><p class="game-q">🎨 Draw <b id="idea">' + pick(ideas) + '</b> <button class="mini-btn" id="newIdea">🎲 New idea</button></p>' +
      '<div class="tw-palette">' + colors.map(function (c, k) { return '<button class="tw-color' + (k ? "" : " on") + '" data-c="' + c + '" style="background:' + c + '" aria-label="color"></button>'; }).join("") +
      '<button class="mini-btn" id="wipe">🧽 Clear</button></div>' +
      '<canvas class="tw-draw" id="drawC"></canvas>' +
      '<div class="home-actions"><button class="big-btn go" id="drawDone" disabled>🖼️ I\'m done!</button></div></div>';
    var c = $("drawC"), x = c.getContext("2d"), dpr = Math.min(2, window.devicePixelRatio || 1), last = null;
    function fit() { var r = c.getBoundingClientRect(); c.width = r.width * dpr; c.height = r.height * dpr; x.setTransform(dpr, 0, 0, dpr, 0, 0); x.lineCap = "round"; x.lineJoin = "round"; }
    fit();
    function p(e) { var r = c.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
    c.addEventListener("pointerdown", function (e) { e.preventDefault(); try { c.setPointerCapture(e.pointerId); } catch (err) {} last = p(e); x.fillStyle = color; x.beginPath(); x.arc(last.x, last.y, 4, 0, 7); x.fill(); });
    c.addEventListener("pointermove", function (e) {
      if (!last) return; e.preventDefault();
      var q = p(e); x.strokeStyle = color; x.lineWidth = 9; x.beginPath(); x.moveTo(last.x, last.y); x.lineTo(q.x, q.y); x.stroke(); last = q;
      if (++inked === 40) { $("drawDone").disabled = false; buddy(pick(["Ooh, I love it!", "Wow, what a masterpiece!", "You're a real artist!"]), "wow"); }
    });
    ["pointerup", "pointercancel"].forEach(function (t) { c.addEventListener(t, function () { last = null; }); });
    view.querySelectorAll(".tw-color").forEach(function (b) {
      b.onclick = function () { color = b.dataset.c; sfx.pop(); view.querySelectorAll(".tw-color").forEach(function (o) { o.classList.toggle("on", o === b); }); };
    });
    $("newIdea").onclick = function () { $("idea").textContent = pick(ideas); speak("Draw " + $("idea").textContent + "!"); };
    $("wipe").onclick = function () { x.clearRect(0, 0, c.width, c.height); };
    $("drawDone").onclick = function () {
      var r = lrec(l.id); r.build = true; r.stars.build = 3; save();
      trophy("artist");
      if (window.Tracker) Tracker.complete("drawing", 1, 1, { item: l.title });
      stepDone(l, 3, "What a beautiful drawing!");
    };
    buddy("Use lines, circles and zig-zags to draw " + $("idea").textContent + "! Anything goes. There are no mistakes in art!", "happy");
  }

  /* ---------------- lesson complete ---------------- */
  function finishLesson(l) {
    var r = lrec(l.id), wasDone = r.done;
    r.done = true; save();
    var newSticker = giveSticker("l:" + l.id);
    if (!wasDone) { giveTicket(); addPoints(10); trophy("first-lesson"); }
    if (window.Tracker) Tracker.complete("lesson", 1, 1, { item: l.title, firstTime: !wasDone });
    var p = phaseOfLesson(l.id);
    if (phaseDone(p) && p.n === 1) trophy("phase-1");
    hud(); sfx.fanfare(); confetti(100);
    current = { screen: "done", arg: { lesson: l.id } };
    var nextL = p.lessons.filter(function (x) { return !lrec(x.id).done; })[0];
    view.innerHTML = buddyRow("", "wow") +
      '<div class="celebrate"><div class="sticker-reveal' + (newSticker ? " new" : "") + '"><span>' + l.sticker.emoji + "</span></div>" +
      "<h2>You finished " + esc(l.title) + "!</h2>" +
      (wasDone ? "" : '<p class="done-loot">🎟️ +1 Prize Wheel ticket · ⭐ +10 bonus</p>') +
      '<div class="done-actions">' + (nextL ? '<button class="big-btn go" id="dNext">✏️ Next: ' + esc(nextL.title) + "</button>" : "") +
      '<button class="big-btn alt" id="dHome">🗺️ All phases</button></div></div>';
    buddy(newSticker ? "Hooray! You won the " + l.sticker.name + " sticker! " + pick(JOKES) : pick(PRAISE.win), "wow");
    if ($("dNext")) $("dNext").onclick = function () { go("lesson", nextL.id); };
    $("dHome").onclick = function () { go("home"); };
  }

  /* ---------------- sticker book & trophies ---------------- */
  function renderStickers() {
    $("topTitle").textContent = "My Sticker Book";
    var html = PHASES.filter(function (p) { return p.lessons; }).map(function (p) {
      return '<section class="album"><h3>' + p.emoji + " " + esc(p.title) + '</h3><div class="stk-grid">' + p.lessons.map(function (l) {
        var got = S.stickers.indexOf("l:" + l.id) >= 0;
        return '<div class="stk' + (got ? " got" : "") + '" style="--bk:' + p.color + '"><span class="se">' + (got ? l.sticker.emoji : "❔") + "</span><small>" + esc(got ? l.sticker.name : l.title) + "</small></div>";
      }).join("") + "</div></section>";
    }).join("");
    view.innerHTML = buddyRow("Look at your stickers! Finish lessons to win more!") + html;
    buddy($("buddySay").textContent, "happy");
  }
  function renderTrophies() {
    $("topTitle").textContent = "My Trophies";
    view.innerHTML = buddyRow("Every trophy shows how hard you worked!") +
      '<div class="trophy-list">' + TW_TROPHIES.map(function (t) {
        var got = S.trophies.indexOf(t.id) >= 0;
        return '<div class="trophy' + (got ? " got" : "") + '"><span class="ti">' + (got ? t.icon : "🔒") + "</span><span><b>" + esc(t.name) + "</b><small>" + esc(t.desc) + "</small></span></div>";
      }).join("") + "</div>" +
      '<div class="stat-row"><span>⭐ ' + S.points + " points</span><span>💯 " + S.clean + " perfect traces</span><span>🧩 " + S.built + " words spelled</span></div>";
    buddy($("buddySay").textContent, "happy");
  }

  /* ---------------- wiring ---------------- */
  $("backBtn").onclick = back;
  $("muteBtn").onclick = function () { S.mute = !S.mute; store(K.mute, S.mute); if (S.mute) hush(); hud(); };
  $("stkPill").onclick = function () { go("stickers"); };
  $("trophyBtn").onclick = function () { go("trophies"); };
  hud();
  go("home");
  window.TraceApp = { go: go, state: S };
})();
