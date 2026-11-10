/* ============================================================
   Koa's Reading Gym — app engine
   A lesson is a gradual release, the way teachers train readers:
     📚 Learn      strategy cards + a quick check
     👀 Watch Koa  preview, read in parts, Koa thinks aloud on Q1
     🤝 Together   Koa coaches each step: key word → proof → answer
     ⭐ On my own  a new passage; answer, then "Prove it!"; a hint
                   ladder (strategy → where to look → show me)
   Data: js/data.js (Grade 3 track) and js/data-kg.js (Kindergarten track:
         everything read aloud, a picture per sentence, 🔊 on choices).
   Track: #g=kg|g3, else the learner's grade (Pre-K/KG → kg).
   Test hook: window.ReadGym.
   ============================================================ */
(function () {
  "use strict";

  /* ---------------- storage (per learner via profile-store) ---------------- */
  var K = { pts: "rg_points", les: "rg_lessons", stk: "rg_stickers", tro: "rg_trophies", stats: "rg_stats", mute: "rg_mute", tickets: "rw_tickets" };
  function load(k, d) { try { var v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }
  function store(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  var S = { points: load(K.pts, 0), lessons: load(K.les, {}), stickers: load(K.stk, []), trophies: load(K.tro, []),
            stats: load(K.stats, {}), mute: load(K.mute, false) };
  ["proofs", "first", "answered", "hints"].forEach(function (k) { S.stats[k] = S.stats[k] || 0; });
  function saveStats() { store(K.stats, S.stats); }

  var $ = function (id) { return document.getElementById(id); };
  var view = $("view");
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function bare(w) { return String(w).toLowerCase().replace(/[’]/g, "'").replace(/[^a-z0-9']/g, "").replace(/'s$/, ""); }
  function stem(w) { w = bare(w); return w.slice(0, Math.max(3, w.length - 2)); }

  function kidGrade() {
    try {
      var id = localStorage.getItem("hub_activeKid"), kids = JSON.parse(localStorage.getItem("hub_kids") || "[]");
      for (var i = 0; i < kids.length; i++) if (String(kids[i].id) === String(id)) return kids[i].grade;
    } catch (e) {}
    return "";
  }
  function kidName() {
    try {
      var id = localStorage.getItem("hub_activeKid"), kids = JSON.parse(localStorage.getItem("hub_kids") || "[]");
      for (var i = 0; i < kids.length; i++) if (String(kids[i].id) === String(id)) return kids[i].name;
    } catch (e) {}
    return "";
  }

  /* ---------------- voice & sound ---------------- */
  var speakToken = 0;
  function say(text, rate) {
    if (S.mute || !window.speechSynthesis || !text) return Promise.resolve(false);
    var my = ++speakToken;
    speechSynthesis.cancel();
    return new Promise(function (res) {
      var u = new SpeechSynthesisUtterance(String(text).replace(/[\u{1F300}-\u{1FAFF}☀-➿✗✅]/gu, "")), done = false;
      u.lang = "en-US"; u.rate = rate || 0.92; u.pitch = 1.05;
      function fin() { if (!done) { done = true; res(my === speakToken); } }
      u.onend = fin; u.onerror = fin;
      setTimeout(fin, 1800 + text.length * 95);
      speechSynthesis.speak(u);
    });
  }
  function hush() { speakToken++; if (window.speechSynthesis) speechSynthesis.cancel(); clearReading(); }
  var actx = null;
  function tone(freqs, dur, type, gap) {
    if (S.mute) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      freqs.forEach(function (f, i) {
        var o = actx.createOscillator(), g = actx.createGain(), t = actx.currentTime + i * (gap || 0.1);
        o.type = type || "sine"; o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.14, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        o.connect(g); g.connect(actx.destination); o.start(t); o.stop(t + dur + 0.05);
      });
    } catch (e) {}
  }
  var sfx = {
    ding: function () { tone([880, 1320], 0.22, "triangle", 0.09); },
    tap: function () { tone([700], 0.05); },
    boop: function () { tone([300, 240], 0.18, "sine", 0.12); },
    fanfare: function () { tone([523, 659, 784, 1047], 0.3, "triangle", 0.13); }
  };

  /* ---------------- Coach Koa ---------------- */
  function koaRow(msg) {
    return '<div class="koa-row"><div class="koa" id="koa" aria-hidden="true"><span>🐨</span></div>' +
      '<div class="bubble" id="koaSay" role="status" aria-live="polite">' + esc(msg || "") + "</div></div>";
  }
  function koa(msg, mood, speak) {
    var b = $("koaSay"); if (b) b.innerHTML = esc(msg);
    var z = $("koa"); if (z) { z.className = "koa " + (mood || ""); void z.offsetWidth; z.classList.add("hop"); }
    if (speak !== false) say(msg);
  }
  var PRAISE = ["Strong reading! 💪", "Yes! You found it!", "Great thinking!", "That's how a champion reads!", "Nailed it! 🎯", "Super focus!"];
  var KIND = ["Not yet, and that's okay. Let's look again.", "Good try! Reading again is a super move.", "Hmm, close! Let's check the text."];

  /* ---------------- rewards ---------------- */
  function hud() {
    $("ptsPill").textContent = "⭐ " + S.points;
    $("stkPill").textContent = "🎟️ " + S.stickers.length;
    $("muteBtn").textContent = S.mute ? "🔇" : "🔊";
  }
  function addPoints(n) { S.points += n; store(K.pts, S.points); hud(); }
  function giveTicket() { var t = parseInt(localStorage.getItem(K.tickets) || "0", 10) || 0; localStorage.setItem(K.tickets, String(t + 1)); }
  function giveSticker(L) {
    if (S.stickers.indexOf(L.id) >= 0) return false;
    S.stickers.push(L.id); store(K.stk, S.stickers); hud(); giveTicket();
    popup(L.sticker, "New sticker!", L.title + " · 🎟️ +1 Prize Wheel ticket"); return true;
  }
  function trophy(id) {
    id = TP + id;
    if (S.trophies.indexOf(id) >= 0) return;
    var t = TROPHIES.filter(function (x) { return x.id === id; })[0]; if (!t) return;
    S.trophies.push(id); store(K.tro, S.trophies);
    popup(t.icon, "Trophy: " + t.name + "!", t.how);
  }
  var popQueue = [];
  function popup(emoji, title, sub) { popQueue.push([emoji, title, sub]); if (popQueue.length === 1) showPop(); }
  function showPop() {
    var p = popQueue[0]; if (!p) return;
    var el = document.createElement("div"); el.className = "pop-veil";
    el.innerHTML = '<div class="pop" role="dialog" aria-label="' + esc(p[1]) + '"><div class="pop-e">' + p[0] + "</div><h2>" + esc(p[1]) + "</h2><p>" + esc(p[2]) + '</p><button class="big-btn go">Yay! 🎉</button></div>';
    document.body.appendChild(el); sfx.fanfare(); confetti(50);
    el.querySelector("button").onclick = function () { el.remove(); popQueue.shift(); showPop(); };
  }
  function toast(msg) {
    var t = $("toast"); t.textContent = msg; t.classList.add("show");
    clearTimeout(toast.h); toast.h = setTimeout(function () { t.classList.remove("show"); }, 2400);
  }
  function confetti(n) {
    var box = $("confetti"), bits = ["⭐", "🐨", "📚", "✨", "💚", "🍃"];
    for (var i = 0; i < n; i++) {
      var s = document.createElement("span"); s.textContent = pick(bits);
      s.style.left = Math.random() * 100 + "vw"; s.style.animationDelay = Math.random() * 0.6 + "s"; s.style.fontSize = 14 + Math.random() * 18 + "px";
      box.appendChild(s); setTimeout(function (x) { x.remove(); }.bind(null, s), 2800);
    }
  }

  /* ---------------- lessons helpers ---------------- */
  var hashG = (/g=(kg|g3)/.exec(location.hash) || [])[1], gr = kidGrade();
  var KG = (hashG || (gr === "pk" || gr === "kg" ? "kg" : "g3")) === "kg" && typeof RGK_LESSONS !== "undefined";
  var TRACK = KG ? "kg" : "g3", TP = KG ? "k-" : "";
  var LESSONS = KG ? RGK_LESSONS : RG_LESSONS, BELTS = KG ? RGK_BELTS : RG_BELTS, TROPHIES = KG ? RGK_TROPHIES : RG_TROPHIES;
  document.body.classList.toggle("kg", KG);
  function W(g3, kg) { return KG ? kg : g3; }
  function plain(t) { return String(t).replace(/[\u{1F300}-\u{1FAFF}\u2600-\u27BF\uFE0F\u200D\u20E3]/gu, "").replace(/\s+/g, " ").trim(); }
  // KG: Koa says each step out loud (Grade 3 readers read the bubble themselves).
  function kgSay(text) { if (KG) say(text); }
  function lessonIdx(id) { for (var i = 0; i < LESSONS.length; i++) if (LESSONS[i].id === id) return i; return -1; }
  function rec(L) { return S.lessons[L.id] || {}; }
  function unlocked(i) { return i === 0 || !!rec(LESSONS[i - 1]).done; }
  function beltDone(b) { return LESSONS.filter(function (L) { return L.belt === b; }).every(function (L) { return rec(L).done; }); }
  function sentences(P) { return [].concat.apply([], P.p); }
  function partOf(P, si) { var n = 0; for (var i = 0; i < P.p.length; i++) { n += P.p[i].length; if (si < n) return i; } return 0; }
  function evIdx(P, q) {
    var ss = sentences(P);
    return (q.ev || []).map(function (sn) { for (var i = 0; i < ss.length; i++) if (ss[i].toLowerCase().indexOf(sn.toLowerCase()) >= 0) return i; return -1; })
      .filter(function (i) { return i >= 0; });
  }
  var QWORD = { who: ["WHO", "a person or an animal"], where: ["WHERE", "a place"], when: ["WHEN", "a time"], what: ["WHAT", "a thing or an action"],
                why: ["WHY", "a reason, so I'll look for “because”"], how: ["HOW", "the way something happens, or how many"], which: ["WHICH", "one choice out of a few"] };
  function qwordOf(q) { var w = bare(q.q.split(/\s+/)[0]); return QWORD[w] ? w : ""; }
  function keyWords(q) { var o = {}; (q.key || []).forEach(function (k) { k.split(/\s+/).forEach(function (w) { o[bare(w)] = 1; }); }); return o; }
  function qarOf(L, q) {
    if (q.qar) return q.qar;
    if ((q.ev || []).length > 1) return "search";
    return (L.id === "infer" || L.id === "character") ? "me" : "here";
  }
  var QAR = { here: "👉 Right There", search: "🧩 Think & Search", me: "🧠 Between the Lines" };

  /* ---------------- passage view ---------------- */
  // upto: show parts 0..upto (reading), cur: the part being read now
  function passageHTML(P, opt) {
    opt = opt || {};
    var si = 0, upto = opt.upto == null ? P.p.length - 1 : opt.upto;
    var html = '<article class="passage" id="passage" aria-label="' + esc(P.title) + '"><header class="p-head"><span class="p-emo">' + P.emoji + "</span><h2>" + esc(P.title) + "</h2>" +
      '<button class="mini-btn" id="readAll" title="Read the whole text to me">🔊 Read to me</button></header>';
    P.p.forEach(function (part, pi) {
      var cls = pi > upto ? " hidden-part" : (opt.cur === pi ? " cur" : "");
      html += '<p class="part' + cls + '" data-part="' + pi + '"><span class="pnum" title="Part ' + (pi + 1) + '">' + (pi + 1) + "</span>" +
        (P.pics ? '<span class="ppic" aria-hidden="true">' + P.pics[pi] + "</span>" : "");
      part.forEach(function (s) { html += '<span class="s" data-s="' + si + '">' + esc(s) + "</span> "; si++; });
      html += "</p>";
    });
    return html + "</article>";
  }
  function sEl(i) { return view.querySelector('.s[data-s="' + i + '"]'); }
  function mark(idx, cls, on) { idx.forEach(function (i) { var e = sEl(i); if (e) e.classList.toggle(cls, on !== false); }); }
  function clearMarks(cls) { view.querySelectorAll(".s." + cls).forEach(function (e) { e.classList.remove(cls); }); }
  var reading = 0;
  function clearReading() { reading++; view.querySelectorAll(".s.reading").forEach(function (e) { e.classList.remove("reading"); }); }
  // Read sentences aloud one by one, lighting each up.
  function readAloud(idx) {
    hush(); var my = ++reading, k = 0;
    if (S.mute || !window.speechSynthesis) { toast("🔇 Sound is off. Tap 🔇 to turn it on."); return; }
    (function next() {
      if (my !== reading || k >= idx.length) { if (my === reading) clearReading(); return; }
      var e = sEl(idx[k]); view.querySelectorAll(".s.reading").forEach(function (x) { x.classList.remove("reading"); });
      if (e) e.classList.add("reading");
      say(e ? e.textContent : "", 0.85).then(function () { if (my === reading) { k++; next(); } });
    })();
  }
  function wireReadAll(P, idxFn) {
    var b = $("readAll"); if (!b) return;
    b.onclick = function () { readAloud(idxFn ? idxFn() : sentences(P).map(function (_, i) { return i; })); };
  }

  /* ---------------- lesson runner ---------------- */
  var R = null; // { L, steps, i, first, total, hints, proofs, gotWrong }
  function buildSteps(L) {
    var st = [{ k: "learn" }];
    if (L.champ) {
      ["A", "B"].forEach(function (pk) {
        st.push({ k: "preview", pk: pk }, { k: "read", pk: pk });
        L[pk].qs.forEach(function (_, qi) { st.push({ k: "solo", pk: pk, qi: qi }); });
      });
    } else {
      st.push({ k: "preview", pk: "A" }, { k: "read", pk: "A" }, { k: "model", pk: "A", qi: 0 });
      L.A.qs.forEach(function (_, qi) { if (qi) st.push({ k: "guide", pk: "A", qi: qi }); });
      st.push({ k: "preview", pk: "B" }, { k: "read", pk: "B" });
      L.B.qs.forEach(function (_, qi) { st.push({ k: "solo", pk: "B", qi: qi }); });
    }
    st.push({ k: "done" });
    return st;
  }
  var PHASES = [["📚", "Learn"], ["👀", "Watch Koa"], ["🤝", "Together"], ["⭐", "On my own"], ["🏁", "Done"]];
  function phaseOf(step) {
    if (step.k === "learn") return 0;
    if (step.k === "done") return 4;
    if (R.L.champ || step.k === "solo" || step.pk === "B") return 3;
    return step.k === "guide" ? 2 : 1;
  }
  function stepBar() {
    var ph = phaseOf(R.steps[R.i]), solo = R.steps.filter(function (s) { return s.k === "solo"; }), at = R.steps.slice(0, R.i).filter(function (s) { return s.k === "solo"; }).length;
    return '<nav class="stepbar" aria-label="Lesson steps">' + PHASES.map(function (p, i) {
      if (R.L.champ && (i === 1 || i === 2)) return "";
      return '<span class="sb ' + (i < ph ? "past" : i === ph ? "now" : "") + '"><b>' + p[0] + "</b> " + p[1] + (i === 3 && ph === 3 ? " " + Math.min(at + 1, solo.length) + "/" + solo.length : "") + "</span>";
    }).join("") + "</nav>";
  }
  function startLesson(id) {
    var L = LESSONS[lessonIdx(id)]; if (!L) return home();
    R = { L: L, steps: buildSteps(L), i: 0, first: 0, total: 0, hints: 0, proofs: 0, shuffles: {} };
    location.hash = "g=" + TRACK + "&l=" + id; showStep();
  }
  function nextStep() { hush(); R.i++; showStep(); }
  function showStep() {
    var st = R.steps[R.i]; setBack(true);
    $("topTitle").textContent = R.L.emoji + " " + R.L.title;
    ({ learn: stepLearn, preview: stepPreview, read: stepRead, model: stepModel, guide: stepGuide, solo: stepSolo, done: stepDone })[st.k](st);
    window.scrollTo(0, 0);
  }
  function P_(st) { return R.L[st.pk]; }
  function Q_(st) { return R.L[st.pk].qs[st.qi]; }
  // A stable shuffled order of a question's choices for this run (index 0 = right).
  function order(key, n) { if (!R.shuffles[key]) R.shuffles[key] = shuffle(Array.apply(null, Array(n)).map(function (_, i) { return i; })); return R.shuffles[key]; }

  /* ---- 📚 Learn ---- */
  function stepLearn() {
    var L = R.L, c = 0;
    function draw() {
      var card = L.cards[c];
      view.innerHTML = stepBar() + koaRow(c === 0 ? "Today's reading muscle: " + L.title + "! " + L.goal : "") +
        '<section class="learn-card" style="--bc:' + BELTS[L.belt].color + '"><div class="lc-e">' + card[0] + "</div><h2>" + esc(card[1]) + "</h2><p>" + esc(card[2]) + "</p>" +
        '<div class="dots">' + L.cards.map(function (_, i) { return '<i class="' + (i === c ? "on" : "") + '"></i>'; }).join("") + "</div></section>" +
        '<div class="row-btns"><button class="btn ghost" id="cPrev"' + (c ? "" : " disabled") + '>◀ Back</button><button class="btn" id="cSay">🔊 Read it</button>' +
        '<button class="btn go" id="cNext">' + (c < L.cards.length - 1 ? "Next ▶" : "Quick check ✔") + "</button></div>";
      say(card[1] + ". " + card[2]);
      $("cPrev").onclick = function () { c--; draw(); };
      $("cSay").onclick = function () { say(card[1] + ". " + card[2]); };
      $("cNext").onclick = function () { if (c < L.cards.length - 1) { c++; draw(); } else check(); };
    }
    function check() {
      var q = L.check, ord = order("check", q.c.length), wrong = 0;
      view.innerHTML = stepBar() + koaRow("Quick check! " + q.q) + '<section class="qcard"><h3 class="qtext">' + esc(q.q) + '</h3><div class="choices" id="ch">' +
        ord.map(function (ci) { return sp('<button class="choice" data-ci="' + ci + '">' + esc(q.c[ci]) + "</button>", q.c[ci]); }).join("") + "</div></section>" +
        '<div class="row-btns"><button class="btn ghost" id="again">📚 See the cards again</button></div>';
      $("again").onclick = function () { c = 0; draw(); };
      kgSay("Quick check! " + plain(q.q));
      $("ch").onclick = function (e) {
        var b = e.target.closest(".choice"); if (!b || b.disabled) return;
        if (+b.dataset.ci === 0) {
          b.classList.add("right"); sfx.ding(); lockChoices();
          koa(pick(PRAISE) + " Now let's use it on a real text.", "wow");
          appendNext("Let's read! ▶");
        } else {
          b.classList.add("wrong"); b.disabled = true; sfx.boop(); wrong++;
          koa(wrong > 1 ? "The answer is glowing. Remember: " + L.tip : KIND[0] + " Think about the cards.", "think");
          if (wrong > 1) view.querySelector('.choice[data-ci="0"]').classList.add("hint");
        }
      };
    }
    draw();
  }
  function lockChoices() { view.querySelectorAll(".choice").forEach(function (b) { b.disabled = true; }); }
  function appendNext(label, fn) {
    var old = $("goNext"); if (old) old.remove();
    var b = document.createElement("button"); b.className = "btn go big next"; b.id = "goNext"; b.textContent = label || "Next ▶";
    b.onclick = fn || nextStep;
    (view.querySelector(".qcard") || view).appendChild(b);
    setTimeout(function () { try { b.scrollIntoView({ block: "nearest", behavior: "smooth" }); } catch (e) {} }, 60);
  }

  /* ---- 🔮 Before reading ---- */
  function stepPreview(st) {
    var P = P_(st), solo = R.L.champ || st.pk === "B";
    view.innerHTML = stepBar() + koaRow(solo ? "New text! Do your before-reading moves: look at the title and picture, then predict." :
        W("Before we read, good readers PREVIEW. Look at the title and the picture. What do you think this will be about?",
          "Look at the title and the pictures. What do you think this story is about? Tap your guess!")) +
      '<section class="preview"><div class="scene" aria-hidden="true">' + P.scene + "</div><h2>" + P.emoji + " " + esc(P.title) + "</h2>" +
      '<h3>🔮 I predict this text is about…</h3><div class="choices" id="pred">' + P.predict.map(function (p, i) { return sp('<button class="choice" data-i="' + i + '">' + esc(p) + "</button>", p); }).join("") + "</div>" +
      '<div id="wordsBox"></div></section>';
    kgSay(P.title + ". What do you think this is about? Tap your guess!");
    $("pred").onclick = function (e) {
      var b = e.target.closest(".choice"); if (!b || b.disabled) return;
      lockChoices(); b.classList.add("picked"); sfx.tap();
      koa(+b.dataset.i === 0 ? "Smart prediction! The title and picture were good clues. Let's read to check." :
        "Interesting guess! Look at the title and picture again… Let's read to find out.", +b.dataset.i === 0 ? "wow" : "");
      var w = P.words || [];
      $("wordsBox").innerHTML = w.length ? '<h3>📖 Words to know</h3><div class="words">' + w.map(function (x, i) {
        return '<button class="word-card" data-i="' + i + '"><b>' + esc(x[0]) + "</b><span>" + esc(x[1]) + "</span><i>🔊</i></button>"; }).join("") + "</div>" : "";
      view.querySelectorAll(".word-card").forEach(function (c) { c.onclick = function () { var x = w[+c.dataset.i]; say(x[0] + ". " + x[1]); }; });
      appendNext("Start reading 📖", nextStep);
      view.querySelector(".preview").appendChild($("goNext"));
    };
  }

  /* ---- 📖 Read in parts ---- */
  var KG_TIPS = ["👂 Listen and look at the picture.", "🎬 Make a picture in your mind.", "🤔 Who is it about?", "👀 What is happening?"];
  var READ_TIPS = ["🎬 Make a movie in your mind.", "🔍 Read every word.", "🛑 Stop and check: do I get it?", "🤔 Who is it about? What's happening?"];
  function stepRead(st) {
    var P = P_(st), k = 0, stops = {};
    (P.stops || []).forEach(function (s) { stops[s.after] = s; });
    function partIdx(pi) { var a = 0, out = []; for (var i = 0; i < P.p.length; i++) { for (var j = 0; j < P.p[i].length; j++) { if (i === pi) out.push(a); a++; } } return out; }
    function draw() {
      var last = k === P.p.length - 1;
      view.innerHTML = stepBar() + koaRow(KG ? (k === 0 ? "Listen and look! I'll read each part to you. " : "") + KG_TIPS[k % KG_TIPS.length] :
          k === 0 ? "Read one part at a time. Tap 🔊 if you want me to read with you. " + READ_TIPS[0] : READ_TIPS[k % READ_TIPS.length]) +
        passageHTML(P, { upto: k, cur: k }) +
        '<div class="row-btns read-btns"><button class="btn" id="partSay">' + W("🔊 Read this part to me", "🔊 Hear it again") + "</button>" +
        '<button class="btn go" id="partNext">' + (last ? "I finished reading ✅" : "Next part ▶") + '</button></div><div id="stopBox"></div>';
      $("readAll").remove();
      $("partSay").onclick = function () { readAloud(partIdx(k)); };
      if (KG) setTimeout(function () { readAloud(partIdx(k)); }, k === 0 ? 900 : 250);
      $("partNext").onclick = function () {
        hush();
        if (stops[k] && !stops[k].ok) return stopCheck(stops[k]);
        if (last) return selfCheck();
        k++; draw();
        var cur = view.querySelector(".part.cur"); if (cur) try { cur.scrollIntoView({ block: "center", behavior: "smooth" }); } catch (e) {}
      };
    }
    function stopCheck(s) {
      var ord = order("stop" + st.pk + s.after, s.c.length), wrong = 0;
      $("partNext").disabled = true;
      $("stopBox").innerHTML = '<section class="qcard stop"><div class="tag">🛑 Stop & Check</div><h3 class="qtext">' + esc(s.q) + '</h3><div class="choices" id="stopCh">' +
        ord.map(function (ci) { return sp('<button class="choice" data-ci="' + ci + '">' + esc(s.c[ci]) + "</button>", s.c[ci]); }).join("") + "</div></section>";
      koa("Stop and check! Do you get it so far?", "think", !KG);
      kgSay("Stop and check! " + plain(s.q));
      try { $("stopBox").scrollIntoView({ block: "center", behavior: "smooth" }); } catch (e) {}
      $("stopCh").onclick = function (e) {
        var b = e.target.closest(".choice"); if (!b || b.disabled) return;
        if (+b.dataset.ci === 0) {
          b.classList.add("right"); sfx.ding(); s.ok = true; $("stopCh").querySelectorAll(".choice").forEach(function (x) { x.disabled = true; });
          koa("You've got it! Keep reading.", "wow"); $("partNext").disabled = false;
        } else {
          b.classList.add("wrong"); b.disabled = true; sfx.boop(); wrong++;
          view.querySelector(".part.cur").classList.add("reread");
          koa(wrong > 1 ? "Let's fix it: I'll read that part again with you. Listen for the answer." : "Fix-up time! Read the yellow part again, slowly. 🧰", "think");
          if (wrong > 1) readAloud(partIdx(k));
        }
      };
    }
    function selfCheck() {
      $("stopBox").innerHTML = '<section class="qcard"><h3 class="qtext">How did that reading feel?</h3><div class="choices two">' +
        '<button class="choice" id="gotIt">👍 I got it!</button><button class="choice" id="blurry">🤔 Some parts were blurry</button></div></section>';
      koa(W("Before the questions, check yourself. Did the movie in your mind make sense?", "Did you understand the story?"), "");
      try { $("stopBox").scrollIntoView({ block: "center", behavior: "smooth" }); } catch (e) {}
      $("gotIt").onclick = function () { koa("Awesome! On to the questions.", "wow"); nextStep(); };
      $("blurry").onclick = function () {
        koa("Great noticing! That's what strong readers do. Let's re-read the whole thing together.", "wow");
        view.querySelectorAll(".part").forEach(function (p) { p.classList.remove("hidden-part"); });
        setTimeout(function () { readAloud(sentences(P).map(function (_, i) { return i; })); }, 2600);
        $("stopBox").innerHTML = ""; var row = view.querySelector(".read-btns"); row.innerHTML = '<button class="btn go" id="doneReread">Now I get it ▶</button>';
        $("doneReread").onclick = nextStep;
      };
    }
    draw();
  }

  /* ---- question widgets ---- */
  function qHead(L, q, opt) {
    opt = opt || {};
    var tag = opt.tag || "", txt;
    if (opt.tapWords) txt = q.q.split(/\s+/).map(function (w, i) { return '<button class="qw" data-w="' + i + '">' + esc(w) + "</button>"; }).join(" ");
    else txt = esc(q.q);
    var showQar = !KG && lessonIdx(L.id) >= lessonIdx("search") && q.ev && !opt.noQar;
    return (tag ? '<div class="tag">' + tag + "</div>" : "") + (showQar ? '<div class="qar">' + QAR[qarOf(L, q)] + "</div>" : "") +
      '<h3 class="qtext" id="qtext">' + txt + ' <button class="say-q" id="sayQ" title="Read the question to me">🔊</button></h3>';
  }
  // Kindergarten: every choice gets a 🔊 so pre-readers can hear it.
  function sp(btn, text) { return KG ? '<div class="choice-wrap">' + btn + '<button class="sbtn" data-t="' + esc(plain(text)) + '" title="Hear it">🔊</button></div>' : btn; }
  function choicesHTML(L, q, key) {
    var ord = order(key, q.c.length);
    return '<div class="choices" id="ch">' + ord.map(function (ci) {
      return '<div class="choice-wrap"><button class="choice" data-ci="' + ci + '">' + esc(q.c[ci]) + "</button>" +
        (L.cross ? '<button class="xbtn" data-x="' + ci + '" title="Cross out">✗</button>' : "") +
        (KG ? '<button class="sbtn" data-t="' + esc(plain(q.c[ci])) + '" title="Hear it">🔊</button>' : "") + "</div>";
    }).join("") + "</div>";
  }
  function wireCross() {
    view.querySelectorAll(".xbtn").forEach(function (x) {
      x.onclick = function () { var w = x.parentNode; w.classList.toggle("crossed"); sfx.tap(); };
    });
  }
  function workHTML(P, side) { return '<div class="work">' + passageHTML(P) + '<section class="qcard" id="qcard">' + side + "</section></div>"; }
  function wireSayQ(q) { var b = $("sayQ"); if (b) b.onclick = function () { say(q.q); }; }
  function hiKeys(q) {
    var k = keyWords(q);
    var h = $("qtext"); if (!h) return;
    if (!h.querySelector(".qw")) h.innerHTML = q.q.split(/\s+/).map(function (w) { return '<span class="qk' + (k[bare(w)] ? " on" : "") + '">' + esc(w) + "</span>"; }).join(" ") + ' <button class="say-q" id="sayQ">🔊</button>';
    wireSayQ(q);
  }
  function scanFor(P, word) {
    var st = stem(word); clearMarks("scan"); if (st.length < 3) return;
    sentences(P).forEach(function (s, i) { if (s.toLowerCase().indexOf(st) >= 0) mark([i], "scan"); });
  }
  function scrollTo(id) { var e = typeof id === "string" ? $(id) : id; if (e) try { e.scrollIntoView({ block: "center", behavior: "smooth" }); } catch (x) {} }

  /* ---- 👀 Watch Koa (I do) ---- */
  function stepModel(st) {
    var L = R.L, P = P_(st), q = Q_(st), type = q.type || "mc", t = 0, ev = evIdx(P, q);
    var side = qHead(L, q, { tag: "👀 Watch Koa think" }) + '<div id="qbody"></div>' +
      '<div class="think" id="think"></div><div class="row-btns"><button class="btn go" id="thinkNext">▶ Next thought</button></div>';
    view.innerHTML = stepBar() + koaRow(W("Watch how I think! I'll say my thoughts out loud, one step at a time.", "Watch me find the answer!")) + workHTML(P, side);
    wireReadAll(P); wireSayQ(q);
    var body = $("qbody");
    if (type === "mc") body.innerHTML = choicesHTML(L, q, "m" + st.pk + st.qi), lockChoices();
    if (type === "order") body.innerHTML = '<ol class="order-slots">' + q.items.map(function () { return "<li>…</li>"; }).join("") + "</ol>";
    if (type === "build") body.innerHTML = buildSlots(q);
    function act(line, i, n) {
      var m = /^\[x:([^\]]+)\]/.exec(line), text = line.replace(/^\[[^\]]+\]/, "");
      if (type === "mc") {
        if (m) { var ci = q.c.indexOf(m[1]); var w = view.querySelector('.choice[data-ci="' + ci + '"]'); if (w) w.parentNode.classList.add("crossed"); }
        else if (i === 0) hiKeys(q);
        else if (i === n - 1) { mark(ev, "proof"); view.querySelector('.choice[data-ci="0"]').classList.add("right"); }
        else { mark(ev, "proof"); scrollTo(sEl(ev[0])); }
      } else if (type === "order") {
        if (i > 0) mark(ev, "proof");
        var lis = view.querySelectorAll(".order-slots li"), upto = i === n - 1 ? q.items.length : Math.round(q.items.length * i / (n - 1));
        for (var k = 0; k < upto; k++) { lis[k].textContent = q.items[k]; lis[k].className = "filled"; }
      } else if (type === "build") {
        if (i < q.parts.length) fillPart(i, q.parts[i].c[0]);
        if (i === n - 1) mark(ev, "proof");
      }
      return text;
    }
    function step() {
      var lines = q.think || [], line = lines[t];
      var text = act(line, t, lines.length);
      $("think").insertAdjacentHTML("beforeend", '<p class="th"><span>💭</span>' + esc(text) + "</p>");
      koa(text, t === lines.length - 1 ? "wow" : "think", false);
      say((KG && t === 0 ? plain(q.q) + " " : "") + text);
      t++;
      if (t >= lines.length) {
        $("thinkNext").remove(); sfx.ding();
        var why = '<p class="why">✅ ' + esc(q.why) + "</p>"; $("think").insertAdjacentHTML("beforeend", why);
        appendNext("Got it! Now we try together 🤝");
      }
    }
    $("thinkNext").onclick = step;
    step();
  }
  function buildSlots(q) {
    return '<div class="build" id="build">' + q.parts.map(function (p, i) {
      return '<div class="slot" data-p="' + i + '"><span class="slot-l">' + esc(p.l) + '</span><span class="slot-t">…</span></div>'; }).join("") + "</div>";
  }
  function fillPart(i, text) { var s = view.querySelector('.slot[data-p="' + i + '"]'); if (s) { s.classList.add("filled"); s.querySelector(".slot-t").textContent = text; } }

  /* ---- 🤝 Together (We do) ---- */
  var PART_TIPS = {
    Restate: "Which start uses words from the question?", Answer: "Which answer does the text tell you?", Prove: "Which proof really comes from the text and matches your answer?",
    Beginning: "What happened at the beginning?", Middle: "What happened in the middle?", End: "How did it end?",
    Somebody: "Who is the main character?", Wanted: "What did they want?", But: "What was the problem?", So: "How did they try to fix it?", Then: "How did it end?"
  };
  function stepGuide(st) {
    var L = R.L, P = P_(st), q = Q_(st), type = q.type || "mc";
    if (type !== "mc") return seqOrBuild(st, true);
    var noKey = L.tap === "none";
    var ev = evIdx(P, q), qw = L.tap === "qword" ? qwordOf(q) : "", keys = keyWords(q), phase = noKey ? "proof" : "key", wrong = 0, found = {};
    var side = qHead(L, q, { tag: "🤝 Together", tapWords: !noKey }) + '<ol class="steps" id="steps">' +
      (noKey ? "" : '<li id="st1" class="now">' + (qw ? "Tap the QUESTION WORD." : "Tap a KEY WORD in the question.") + "</li>") +
      '<li id="st2"' + (noKey ? ' class="now"' : "") + ">" + W("Find the proof in the text.", "Find it in the story: tap the part that tells you.") + '</li><li id="st3">Pick the answer.</li></ol><div id="qbody"></div>';
    var intro = noKey ? "Listen to the question. Then tap the part of the story that tells you the answer. 👉" :
      qw ? W("Step 1: Read the question. Tap the QUESTION WORD. It tells you what kind of answer to look for.", "Listen to the question. Tap the QUESTION WORD. It's the first word!") :
      "Step 1: Read the question. Tap a KEY WORD: a word that tells you what to look for in the text.";
    view.innerHTML = stepBar() + koaRow(intro) + workHTML(P, side);
    kgSay(plain(q.q) + " " + intro);
    wireReadAll(P); wireSayQ(q);
    view.querySelectorAll("#qtext .qw").forEach(function (b, i) {
      b.onclick = function () {
        if (phase !== "key") return;
        var w = bare(b.textContent), ok = qw ? (i === 0) : !!keys[w];
        if (ok) {
          b.classList.add("on"); sfx.ding(); phase = "proof"; wrong = 0;
          $("st1").className = "ok"; $("st2").className = "now";
          if (qw) koa("Yes! " + QWORD[qw][0] + " wants " + QWORD[qw][1] + ". Step 2: tap the sentence in the text that has the answer. That's your proof!", "wow");
          else { scanFor(P, w); koa("Yes! “" + b.textContent.replace(/[?.,!“”]/g, "") + "” is a key word. I lit up the sentences with it. Step 2: tap the sentence that PROVES the answer." + (ev.length > 1 ? " This one needs TWO pieces!" : ""), "wow"); }
          scrollTo("passage");
        } else {
          b.classList.add("nope"); sfx.boop(); wrong++;
          if (wrong >= 2) {
            view.querySelectorAll("#qtext .qw").forEach(function (x, j) { if (qw ? j === 0 : keys[bare(x.textContent)]) x.classList.add("hint"); });
            koa("Look at the glowing word" + (qw ? "" : "s") + ". Tap one!", "think");
          } else koa(qw ? "The question word is usually the FIRST word: who, what, where, when, why or how." : "That's a small helper word. Key words are names, things or actions that you can look for in the text.", "think");
        }
      };
    });
    view.querySelector("#passage").addEventListener("click", function (e) {
      var s = e.target.closest(".s"); if (!s || phase !== "proof") return;
      var i = +s.dataset.s;
      if (ev.indexOf(i) >= 0) {
        found[i] = 1; s.classList.add("proof"); sfx.ding();
        var left = ev.filter(function (x) { return !found[x]; }).length;
        if (left) { koa("That's one piece! 🧩 Find the other piece too.", "wow"); return; }
        phase = "answer"; wrong = 0; clearMarks("scan"); $("st2").className = "ok"; $("st3").className = "now";
        $("qbody").innerHTML = choicesHTML(L, q, "g" + st.pk + st.qi); wireCross(); wireAnswer();
        koa(W("That's your proof! 📌 Step 3: pick the answer that matches your proof.", "You found it! 👉 Now pick the answer.") + (L.cross ? " Cross out ✗ any traps first!" : ""), "wow");
        scrollTo("qbody");
      } else {
        s.classList.add("nope"); setTimeout(function () { s.classList.remove("nope"); }, 700); sfx.boop(); wrong++;
        if (wrong >= 2) { mark(ev.filter(function (x) { return !found[x]; }), "hint"); koa("Look at the sentence with the dotted line. Does it answer the question? Tap it!", "think"); }
        else koa("Hmm, does that sentence answer the question? Try part " + (partOf(P, ev.filter(function (x) { return !found[x]; })[0]) + 1) + ".", "think");
      }
    });
    function wireAnswer() {
      $("ch").onclick = function (e) {
        var b = e.target.closest(".choice"); if (!b || b.disabled) return;
        if (+b.dataset.ci === 0) {
          b.classList.add("right"); lockChoices(); sfx.ding(); $("st3").className = "ok";
          addPoints(5); if (window.Tracker) Tracker.answer(true, "Reading Gym: " + L.title, { q: q.q, step: "together" });
          koa(pick(PRAISE) + " " + q.why, "wow");
          $("qcard").insertAdjacentHTML("beforeend", '<p class="why">✅ ' + esc(q.why) + "</p>");
          appendNext();
        } else {
          b.classList.add("wrong"); b.disabled = true; sfx.boop(); wrong++;
          if (window.Tracker) Tracker.answer(false, "Reading Gym: " + L.title, { q: q.q, step: "together" });
          if (wrong >= 2) { view.querySelector('.choice[data-ci="0"]').classList.add("hint"); koa("Read your proof sentence again. The answer is glowing.", "think"); }
          else koa("Not quite. Read your proof sentence again. Which choice says the same thing?", "think");
        }
      };
    }
  }

  // Order and R.A.P./story-hand questions, guided (Together) or solo.
  function seqOrBuild(st, guided) {
    var L = R.L, P = P_(st), q = Q_(st), type = q.type, mistakes = 0, ev = evIdx(P, q), hintsUsed = 0;
    var tag = guided ? "🤝 Together" : "⭐ On my own";
    var side = qHead(L, q, { tag: tag, noQar: true }) + '<div id="qbody"></div>' + (guided ? "" : '<div class="row-btns"><button class="btn ghost" id="helpBtn">🧠 Help me think</button></div>');
    var intro = type === "order" ? (guided ? "Look for the order words in the text: first, next, then, finally. Tap the events in order!" : "Tap the events in the order they happened.")
      : (q.parts[0].l === "Somebody" ? "Use your story hand ✋! Pick one part at a time." : q.parts[0].l === "Beginning" ? "Retell it: beginning, middle and end. One part at a time!" : "Build your R.A.P. answer: Restate, Answer, Prove. One part at a time!");
    view.innerHTML = stepBar() + koaRow(intro) + workHTML(P, side);
    wireReadAll(P); wireSayQ(q); kgSay(plain(q.q) + " " + intro);
    if (!guided) $("helpBtn").onclick = function () {
      hintsUsed++; R.hints++; S.stats.hints++; saveStats();
      if (hintsUsed === 1) koa("Strategy: " + L.tip, "think");
      else { mark(ev, "hint"); koa("Look at the sentence with the dotted line. It helps!", "think"); }
    };
    if (type === "order") {
      var ord = order("o" + st.pk + st.qi, q.items.length), k = 0;
      $("qbody").innerHTML = '<ol class="order-slots">' + q.items.map(function () { return "<li>…</li>"; }).join("") + '</ol><div class="choices" id="ch">' +
        ord.map(function (i) { return sp('<button class="choice" data-i="' + i + '">' + esc(q.items[i]) + "</button>", q.items[i]); }).join("") + "</div>";
      if (guided) view.querySelectorAll(".s").forEach(function (s) { if (/\b(first|next|then|finally|at last|after|later)\b/i.test(s.textContent)) s.classList.add("scan"); });
      $("ch").onclick = function (e) {
        var b = e.target.closest(".choice"); if (!b || b.disabled) return;
        if (+b.dataset.i === k) {
          b.disabled = true; b.classList.add("right"); sfx.tap();
          var li = view.querySelectorAll(".order-slots li")[k]; li.textContent = q.items[k]; li.className = "filled"; k++;
          if (k === q.items.length) finish();
          else koa(pick(["Yes! What happened next?", "Right! And after that?", "Good! Keep going."]), "wow", false);
        } else {
          b.classList.add("shake"); setTimeout(function () { b.classList.remove("shake"); }, 500); sfx.boop(); mistakes++;
          koa(mistakes > 1 ? "Look at the glowing one. That happened next." : "Hmm, did that happen next? Check the text for order words.", "think");
          if (mistakes > 1) view.querySelector('.choice[data-i="' + k + '"]').classList.add("hint");
        }
      };
    } else {
      var p = 0;
      $("qbody").innerHTML = buildSlots(q) + '<div id="partBox"></div>';
      var drawPart = function () {
        var part = q.parts[p], o = order("b" + st.pk + st.qi + "_" + p, part.c.length), wrong = 0;
        view.querySelectorAll(".slot").forEach(function (s, i) { s.classList.toggle("now", i === p); });
        $("partBox").innerHTML = '<p class="part-q"><b>' + esc(part.l) + ":</b> " + esc(PART_TIPS[part.l] || "") + '</p><div class="choices" id="ch">' +
          o.map(function (ci) { return sp('<button class="choice" data-ci="' + ci + '">' + esc(part.c[ci]) + "</button>", part.c[ci]); }).join("") + "</div>";
        if (guided || p > 0) koa(part.l + ": " + (PART_TIPS[part.l] || ""), "", guided);
        $("ch").onclick = function (e) {
          var b = e.target.closest(".choice"); if (!b || b.disabled) return;
          if (+b.dataset.ci === 0) {
            fillPart(p, part.c[0]); sfx.ding(); p++;
            if (p === q.parts.length) finish(); else drawPart();
          } else {
            b.classList.add("wrong"); b.disabled = true; sfx.boop(); mistakes++; wrong++;
            if (wrong >= 2) { view.querySelector('#ch .choice[data-ci="0"]').classList.add("hint"); koa("The glowing one fits best. Does it match the text?", "think"); }
            else koa(part.l === "Prove" ? "Proof must come from the text AND match your answer. Look again!" : "Hmm, check the text. " + (PART_TIPS[part.l] || ""), "think");
          }
        };
      };
      drawPart();
    }
    function finish() {
      mark(ev, "proof"); lockChoices();
      var first = mistakes === 0 && hintsUsed === 0;
      if (!guided) scoreSolo(q, first, mistakes === 0);
      else { addPoints(5); if (window.Tracker) Tracker.answer(mistakes === 0, "Reading Gym: " + L.title, { q: q.q, step: "together" }); }
      sfx.ding();
      var full = type === "build" ? q.parts.map(function (x) { return x.c[0]; }).join(" ") : "";
      koa((first ? pick(PRAISE) + " " : "You did it! ") + (type === "build" ? "Read your answer out loud: " + full : q.why), "wow");
      if (type === "build") { $("partBox").innerHTML = ""; view.querySelectorAll(".slot").forEach(function (s) { s.classList.remove("now"); }); }
      $("qcard").insertAdjacentHTML("beforeend", full ? '<p class="full">🗣️ ' + esc(full) + "</p>" + (q.why.indexOf(q.parts[1].c[0].replace(/[.,!]$/, "")) < 0 ? '<p class="why">✅ ' + esc(q.why) + "</p>" : "")
        : '<p class="why">✅ ' + esc(q.why) + "</p>");
      var hb = $("helpBtn"); if (hb) hb.remove();
      appendNext();
    }
  }

  /* ---- ⭐ On my own (You do) ---- */
  function scoreSolo(q, first, rightEventually) {
    R.total++; S.stats.answered++;
    if (first) { R.first++; S.stats.first++; addPoints(10); } else addPoints(4);
    saveStats();
    if (window.Tracker) Tracker.answer(first, "Reading Gym: " + R.L.title, { q: q.q, first: first });
  }
  function stepSolo(st) {
    var L = R.L, P = P_(st), q = Q_(st), type = q.type || "mc";
    if (type !== "mc") return seqOrBuild(st, false);
    var ev = evIdx(P, q), wrong = 0, hints = 0, phase = "answer", proofTries = 0;
    var side = qHead(L, q, { tag: "⭐ On my own" }) + choicesHTML(L, q, "s" + st.pk + st.qi) +
      '<div class="row-btns"><button class="btn ghost" id="helpBtn">🧠 Help me think</button></div>';
    var n = R.steps.filter(function (s) { return s.k === "solo"; }).indexOf(st);
    view.innerHTML = stepBar() + koaRow(n === 0 ? "Your turn! Use your steps: read the question twice, find the key words, look for proof, then answer." +
      (L.cross ? " Cross out ✗ traps!" : "") : pick(["You've got this!", "Read the question twice.", "Find your proof!", "Take your time."])) + workHTML(P, side);
    wireReadAll(P); wireSayQ(q); wireCross();
    kgSay(plain(q.q));
    function help() {
      hints++; R.hints++; S.stats.hints++; saveStats();
      if (hints === 1) { hiKeys(q); koa("Strategy: " + L.tip + " The key words are highlighted.", "think"); }
      else if (hints === 2) { var pi = partOf(P, ev[0]); view.querySelector('.part[data-part="' + pi + '"]').classList.add("look"); koa("Look in part " + (pi + 1) + ". Read it slowly.", "think"); scrollTo("passage"); }
      else { mark(ev, "hint"); koa("The proof has a dotted line. Read it, then pick the answer that matches.", "think"); $("helpBtn").disabled = true; }
    }
    $("helpBtn").onclick = help;
    $("ch").onclick = function (e) {
      var b = e.target.closest(".choice"); if (!b || b.disabled || phase !== "answer") return;
      if (+b.dataset.ci === 0) {
        b.classList.add("right"); lockChoices(); sfx.ding();
        var first = wrong === 0 && hints === 0;
        scoreSolo(q, first, true);
        $("helpBtn").remove();
        if (first) {
          phase = "prove";
          koa(pick(PRAISE) + W(" Now PROVE it! 📌 Tap the sentence in the text that proves your answer, for a bonus star.", " Now show me! 👉 Tap the part of the story that tells you, for a bonus star."), "wow");
          $("qcard").insertAdjacentHTML("beforeend", '<div class="prove" id="prove">' + W("📌 <b>Prove it!</b> Tap your proof sentence", "👉 <b>Show me!</b> Tap the part of the story") + (ev.length > 1 ? "s (" + ev.length + " pieces)" : "") +
            W(" in the text.", "") + ' <button class="mini-btn" id="skipProve">Skip</button></div>');
          $("skipProve").onclick = function () { phase = "done"; mark(ev, "proof"); showWhy(); };
          scrollTo("passage");
        } else { mark(ev, "proof"); showWhy(); koa("You got it! " + q.why, "wow"); }
      } else {
        b.classList.add("wrong"); b.disabled = true; sfx.boop(); wrong++;
        if (wrong === 1) { koa(pick(KIND) + " Let's use our steps.", "think"); if (hints < 1) help(); }
        else if (wrong === 2) { if (hints < 2) { hints = 1; help(); } }
        else { view.querySelector('.choice[data-ci="0"]').classList.add("hint"); mark(ev, "proof"); koa("Here's the proof. The answer is glowing. " + q.why, "think"); }
      }
    };
    var found = {};
    view.querySelector("#passage").addEventListener("click", function (e) {
      var s = e.target.closest(".s"); if (!s || phase !== "prove") return;
      var i = +s.dataset.s;
      if (ev.indexOf(i) >= 0) {
        found[i] = 1; s.classList.add("proof"); sfx.ding();
        if (ev.some(function (x) { return !found[x]; })) { koa("One piece! Find the other one. 🧩", "wow"); return; }
        phase = "done"; R.proofs++; S.stats.proofs++; saveStats(); addPoints(5);
        if (S.stats.proofs >= 10) trophy("proof10");
        koa("Proof found! ⭐ +5 bonus. That's real reading power!", "wow"); confetti(14); showWhy();
      } else {
        proofTries++; s.classList.add("nope"); setTimeout(function () { s.classList.remove("nope"); }, 700); sfx.boop();
        if (proofTries >= 2) { phase = "done"; mark(ev, "proof"); koa("Here's the proof sentence. Next time, look for the key words!", "think"); showWhy(); }
        else koa("Hmm, does that sentence show your answer? Look for the key words.", "think");
      }
    });
    function showWhy() {
      var pv = $("prove"); if (pv) pv.remove();
      $("qcard").insertAdjacentHTML("beforeend", '<p class="why">✅ ' + esc(q.why) + "</p>");
      appendNext(R.steps[R.i + 1].k === "done" ? "Finish 🏁" : "Next ▶");
    }
  }

  /* ---- 🏁 Done ---- */
  function stepDone() {
    var L = R.L, ratio = R.total ? R.first / R.total : 1;
    var stars = ratio >= 0.85 ? 3 : ratio >= 0.5 ? 2 : 1, old = rec(L), firstTime = !old.done;
    S.lessons[L.id] = { done: 1, stars: Math.max(stars, old.stars || 0), last: stars, first: R.first, total: R.total, hints: R.hints, proofs: R.proofs, t: Date.now(), runs: (old.runs || 0) + 1 };
    store(K.les, S.lessons); addPoints(20);
    if (window.Tracker) Tracker.complete(L.id, R.first, R.total, { item: L.title, stars: stars, hints: R.hints, proofs: R.proofs });
    var nextI = lessonIdx(L.id) + 1, next = LESSONS[nextI];
    view.innerHTML = stepBar() + koaRow(stars === 3 ? "WOW! Champion reading! 💪" : stars === 2 ? "Great workout! Your reading muscles are growing!" : "You finished! Every workout makes you stronger. Try it again for more stars!") +
      '<section class="done-card"><div class="big-stars">' + [1, 2, 3].map(function (i) { return '<span class="' + (i <= stars ? "on" : "") + '">⭐</span>'; }).join("") + "</div>" +
      "<h2>" + L.emoji + " " + esc(L.title) + "</h2><p>" + R.first + " of " + R.total + " answered on the first try · " + R.proofs + " proofs found" + (R.hints ? " · " + R.hints + " hints" : "") + "</p>" +
      '<div class="tool-won"><b>🧰 New tool in your toolbox:</b> ' + esc(L.tip) + "</div>" +
      '<div class="row-btns">' + (next ? '<button class="btn go big" id="nextL">Next: ' + next.emoji + " " + esc(next.title) + " ▶</button>" : "") +
      '<button class="btn" id="again">🔁 Try again</button><button class="btn ghost" id="toHome">🏠 Gym</button></div></section>';
    if (next) $("nextL").onclick = function () { startLesson(next.id); };
    $("again").onclick = function () { startLesson(L.id); };
    $("toHome").onclick = home;
    sfx.fanfare(); confetti(stars * 25);
    giveSticker(L);
    if (firstTime) trophy("first");
    if (stars === 3 && R.hints === 0) trophy("perfect");
    BELTS.forEach(function (b, bi) { if (bi < 4 && beltDone(bi)) trophy(b.id); });
    if (L.champ) trophy("champion");
    if (LESSONS.every(function (x) { return (rec(x).stars || 0) >= 3; })) trophy("allstars");
  }

  /* ---------------- home & other screens ---------------- */
  function setBack(on) { $("backBtn").hidden = !on; }
  function home() {
    hush(); R = null; setBack(false); history.replaceState(null, "", location.pathname + "#g=" + TRACK);
    $("topTitle").textContent = "Koa's Reading Gym" + W("", " · K");
    var name = kidName(), doneN = LESSONS.filter(function (L) { return rec(L).done; }).length;
    var nextI = 0; for (var i = 0; i < LESSONS.length; i++) if (!rec(LESSONS[i]).done) { nextI = i; break; } else nextI = i;
    var html = koaRow((name ? "Hi " + name + "! " : "Hi! ") + (doneN ? W("Welcome back to the gym. Ready for today's reading workout? 💪", "Welcome back! Ready to listen and think? 💪") :
      W("I'm Coach Koa. Reading is like a sport: we train one skill at a time. I show you, we try together, then you do it on your own!",
        "I'm Coach Koa! We'll listen to little stories and find the answers. I show you, we try together, then you try!"))) +
      '<div class="stat-row"><span>✅ ' + doneN + " of " + LESSONS.length + " lessons</span><span>📌 " + S.stats.proofs + W(" proofs found", " answers found") + "</span><span>🏆 " + TROPHIES.filter(function (t) { return S.trophies.indexOf(t.id) >= 0; }).length + " trophies</span></div>" +
      '<div class="quick"><button class="quick-card go-card" id="goNextL"><span class="qe">' + LESSONS[nextI].emoji + "</span><b>" + (doneN ? "Keep training" : "Start here") + "</b><small>" + esc(LESSONS[nextI].title) + "</small></button>" +
      '<button class="quick-card tool" id="toolBtn"><span class="qe">🧰</span><b>My Toolbox</b><small>Every reading tool you’ve learned</small></button>' +
      '<button class="quick-card grown" id="grownBtn"><span class="qe">👪</span><b>For grown-ups</b><small>How the lessons teach</small></button></div>';
    BELTS.forEach(function (b, bi) {
      var ls = LESSONS.filter(function (L) { return L.belt === bi; });
      html += '<section class="belt" style="--bc:' + b.color + '"><h2><span class="belt-e">' + b.emoji + "</span> " + esc(b.name) + " <small>" + esc(b.level) + "</small>" + (beltDone(bi) ? ' <span class="earned">Earned!</span>' : "") + '</h2><div class="lesson-grid">' +
        ls.map(function (L) {
          var i = lessonIdx(L.id), r = rec(L), open = unlocked(i);
          return '<button class="lesson' + (r.done ? " done" : "") + (open ? "" : " locked") + (i === nextI && open && !r.done ? " next" : "") + '" data-id="' + L.id + '"' + (open ? "" : " disabled") + ">" +
            '<span class="ln">' + (i + 1) + '</span><span class="le">' + (open ? L.emoji : "🔒") + "</span><b>" + esc(L.title) + "</b><small>" + esc(L.goal) + "</small>" +
            '<span class="ls">' + [1, 2, 3].map(function (s) { return s <= (r.stars || 0) ? "⭐" : "☆"; }).join("") + "</span></button>";
        }).join("") + "</div></section>";
    });
    html += '<p class="switch"><button class="btn ghost" id="switchTrack">' + W("🐣 Switch to the Kindergarten gym", "🎒 Switch to the Grade 3 gym") + "</button></p>";
    view.innerHTML = html;
    $("switchTrack").onclick = function () { location.hash = "g=" + W("kg", "g3"); location.reload(); };
    kgSay($("koaSay").textContent);
    view.querySelectorAll(".lesson").forEach(function (b) { b.onclick = function () { startLesson(b.dataset.id); }; });
    $("goNextL").onclick = function () { startLesson(LESSONS[nextI].id); };
    $("toolBtn").onclick = toolbox; $("grownBtn").onclick = grownups;
    window.scrollTo(0, 0);
  }
  function toolbox() {
    hush(); setBack(true); $("topTitle").textContent = "🧰 My Reading Toolbox";
    view.innerHTML = koaRow("These are your reading tools. Tap one to practise it again. Locked tools open as you train!") +
      '<div class="tools">' + LESSONS.map(function (L) {
        var r = rec(L);
        return '<details class="tool' + (r.done ? "" : " locked") + '"><summary><span class="te">' + (r.done ? L.emoji : "🔒") + "</span><b>" + esc(L.title) + "</b><small>" + esc(L.tip) + "</small></summary>" +
          '<ul>' + L.cards.map(function (c) { return "<li><b>" + c[0] + " " + esc(c[1]) + ":</b> " + esc(c[2]) + "</li>"; }).join("") + "</ul>" +
          (unlocked(lessonIdx(L.id)) ? '<button class="btn" data-id="' + L.id + '">Practise ▶</button>' : "") + "</details>";
      }).join("") + "</div>";
    view.querySelectorAll(".tool .btn").forEach(function (b) { b.onclick = function () { startLesson(b.dataset.id); }; });
  }
  function stickers() {
    hush(); setBack(true); $("topTitle").textContent = "🎟️ Stickers & Trophies";
    view.innerHTML = koaRow("Finish a lesson to earn its sticker. Trophies are for big wins!") +
      '<h2 class="sec-h">Stickers</h2><div class="stickers">' + LESSONS.map(function (L) {
        var has = S.stickers.indexOf(L.id) >= 0;
        return '<div class="stk' + (has ? "" : " locked") + '"><span>' + (has ? L.sticker : "❔") + "</span><small>" + esc(L.title) + "</small></div>"; }).join("") + "</div>" +
      '<h2 class="sec-h">Trophies</h2><div class="stickers">' + TROPHIES.map(function (t) {
        var has = S.trophies.indexOf(t.id) >= 0;
        return '<div class="stk' + (has ? "" : " locked") + '"><span>' + (has ? t.icon : "🔒") + "</span><b>" + esc(t.name) + "</b><small>" + esc(t.how) + "</small></div>"; }).join("") + "</div>";
  }
  function grownups() {
    hush(); setBack(true); $("topTitle").textContent = "👪 For grown-ups";
    view.innerHTML = '<section class="grown"><h2>How Koa’s Reading Gym teaches</h2>' +
      "<p>Each lesson trains <b>one comprehension strategy</b> with a <b>gradual release of responsibility</b>, the routine strong reading teachers use:</p><ol>" +
      "<li><b>📚 Learn</b> — short strategy cards (read aloud) and a one-question check.</li>" +
      "<li><b>👀 Watch Koa</b> — preview (title, picture, prediction, key vocabulary), read in parts, then Koa <i>thinks aloud</i> through the first question: what the question asks, the key words, where the proof is, why traps are wrong.</li>" +
      "<li><b>🤝 Together</b> — the child does each step with coaching: tap the key word (or question word), tap the proof sentence, then answer. Mistakes get a hint, never a dead end.</li>" +
      "<li><b>⭐ On my own</b> — a new text. The child answers first, then <b>proves it</b> by tapping the sentence. “🧠 Help me think” gives a hint ladder: the strategy → which part to look in → the proof itself.</li></ol>" +
      "<p><b>Habits built every time:</b> preview and predict · read in chunks · stop and check (fix-up when confused) · read the question twice · find text evidence · cross out traps · answer in a full sentence (R.A.P.: Restate, Answer, Prove) · summarise (Somebody–Wanted–But–So–Then).</p>" +
      '<h3>The ladder (' + W("easy → Grade 3", "Pre-K → Kindergarten") + ')</h3><ol class="ladder">' + LESSONS.map(function (L) { return "<li>" + BELTS[L.belt].emoji + " <b>" + esc(L.title) + "</b> — " + esc(L.goal) + "</li>"; }).join("") + "</ol>" +
      (KG ? "<p><b>Kindergarten track:</b> Koa reads every story part, question and answer aloud (🔊 on each answer). Each sentence has a picture, stories are 3–4 short sentences, and guided questions skip the key-word step: the child taps the part of the story that tells the answer.</p>" +
        "<p><b>Standards:</b> CCSS RL.K.1–3, RL.K.7, RI.K.1–2, L.K.4 · UK EYFS / Year 1 comprehension · Lgr22 förskoleklass.</p>" :
      "<p><b>Standards:</b> CCSS RL.3.1–3.3, RL.3.7, RI.3.1–3.4, RI.3.8, RF.3.4 · UK Year 4 reading comprehension · Lgr22 Svenska reading strategies. Question types follow QAR (Right There, Think &amp; Search, Between the Lines).</p>") +
      "<p><b>Stars:</b> share of “On my own” questions right first time with no hints (85% = ⭐⭐⭐). Results go to Admin and Insights. All passages are original.</p>" +
      "<p><b>Tips at home:</b> ask your child to read the text aloud to you, and after each answer ask “How do you know? Show me in the text.”</p></section>";
  }

  /* ---------------- wiring ---------------- */
  view.addEventListener("click", function (e) { var b = e.target.closest(".sbtn"); if (b) { e.stopPropagation(); say(b.dataset.t); } }, true);
  $("backBtn").onclick = function () { home(); };
  $("muteBtn").onclick = function () { S.mute = !S.mute; store(K.mute, S.mute); if (S.mute) hush(); hud(); };
  $("stkPill").onclick = stickers; $("trophyBtn").onclick = stickers;
  hud();
  var m = /l=([\w-]+)/.exec(location.hash);
  if (m && lessonIdx(m[1]) >= 0 && unlocked(lessonIdx(m[1]))) startLesson(m[1]); else home();

  window.ReadGym = { track: TRACK, S: S, get R() { return R; }, start: startLesson, home: home, next: nextStep, lessons: LESSONS, evIdx: evIdx };
})();
