/* ============================================================
   quizkit/quizkit.js — QuizKit: Learn cards, Practice Easy / Medium
   and a Mixed Test for any quiz pack
   ------------------------------------------------------------
   Grew out of Sticker Quest's Unit 2 Test Prep. Needs
   js/quizkit/logic.js (QuizLogic) and css: js/quizkit/quizkit.css.

     QuizKit.mount(hostElement, pack, hooks)

   pack (one data file, see quiz/packs/README.md):
     id, title, skill ("Unit 2" → Tracker skill "Unit 2: <topic>"),
     topics [{n, title, art, facts[], story}], questions [...],
     mascot {name, svg | emoji, hello}, readToMe (default for a new
     learner), sizes {easy, medium, mixed}, lang ("en-US").
   hooks (all optional):
     store     object to keep {readToMe, last, rounds, ends} in
               (default: localStorage "qk_<pack.id>", per learner)
     persist() save the store
     art(key)  HTML for a topic / question picture (default: emoji)
     questionArt(q)  key for a question's picture (default q.picture)
     earn(msg, id)   give a sticker for a first-time right answer
               ("<prefix>:<question id>") or a finished round
     prize()   HTML of the sticker just won (shown at the end)
     prefix    sticker id prefix (default pack.id)
     complete  Tracker.complete name prefix (default pack.id)

   Reports every answer to Tracker.answer and every round to
   Tracker.complete, so RewardKit stars and Admin charts just work.
   ============================================================ */
(function (root) {
  "use strict";
  const L = root.QuizLogic;

  const CHEERS = ["Super job!", "You're a star!", "Way to go!", "You got it!", "Brain power!", "Awesome thinking!"];
  const PAIR_COLORS = ["#6C4CF1", "#E0424E", "#0E7C70", "#C77700"];
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;"}[c]));

  function mount(host, pack, hooks) {
    hooks = hooks || {};
    const KEY = "qk_" + pack.id;
    const sizes = Object.assign({}, L.SIZES, pack.sizes);
    const topics = pack.topics || [];
    const prefix = hooks.prefix || pack.id, completeName = hooks.complete || pack.id;
    const mascot = pack.mascot || {name: "Hoot", emoji: "🦉"};
    let store = hooks.store;
    if (!store) { try { store = JSON.parse(localStorage.getItem(KEY)); } catch (e) {} }
    const qs0 = Object.assign({readToMe: !!pack.readToMe, last: {}, rounds: [], ends: 0}, store);
    if (hooks.store) Object.assign(hooks.store, qs0);
    const S = hooks.store || qs0;
    const persist = hooks.persist || (() => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} });
    const art = hooks.art || (k => `<span class="qk-emoji" aria-hidden="true">${k || "⭐"}</span>`);
    const questionArt = hooks.questionArt || (q => q.picture);
    const earn = hooks.earn || (() => {});
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const TTS = !!(root.speechSynthesis && root.SpeechSynthesisUtterance && speechSynthesis.speak);
    const topicName = n => (topics.find(t => t.n === n) || {}).title || pack.skill || pack.title;
    const modes = {
      learn: {icon:"📚", title:"Learn", sub:"Study the facts", cls:"sun"},
      easy: {icon:"🌱", title:"Practice Easy", sub:sizes.easy + " easy questions", cls:"teal"},
      medium: {icon:"🚀", title:"Practice Medium", sub:sizes.medium + " harder questions", cls:"grape"},
      mixed: {icon:"🏆", title:"Mixed Test", sub:sizes.mixed + " mixed-up questions", cls:"coral"},
    };
    if (!topics.length) delete modes.learn;
    const endings = pack.endings || ["", "Good try! Every practice makes your brain stronger.",
      "Great work! You're getting so good at this!", "WOW! You're a " + (pack.skill || pack.title) + " superstar!"];

    host.classList.add("qk");
    if (!TTS) host.classList.add("qk-no-tts");
    host.innerHTML = `<div class="qk-bar">
        <button class="qk-btn ghost" data-qk="back" aria-label="Back to the ${esc(pack.title)} menu" hidden>&#9664; Menu</button>
        <button class="qk-btn ghost qk-tts" data-qk="read" aria-pressed="false">🔊 Read to me: Off</button>
      </div>
      <div class="qk-mascot"><div class="qk-buddy"></div><p class="qk-bubble"></p></div>
      <div class="qk-view"></div>`;
    const view = host.querySelector(".qk-view"), buddy = host.querySelector(".qk-buddy"), bubble = host.querySelector(".qk-bubble");
    const backBtn = host.querySelector('[data-qk="back"]');
    const $ = sel => host.querySelector(sel);

    /* ---------- read aloud ---------- */
    // An on-device voice in the pack's language, a friendly one if we can find it. Network voices send the
    // text to a server, so with no local voice we leave the browser default. voice.js still applies a
    // voice the learner picked on the Hub.
    const lang = pack.lang || "en-US", langRe = new RegExp("^" + lang.split("-")[0] + "([-_]|$)", "i");
    let voice = null;
    function findVoice() {
      const local = speechSynthesis.getVoices().filter(v => langRe.test(v.lang) && v.localService);
      voice = local.find(v => /samantha|zira|aria|jenny|karen|moira|tessa|female/i.test(v.name)) || local[0] || null;
    }
    if (TTS) { try { findVoice(); if (speechSynthesis.addEventListener) speechSynthesis.addEventListener("voiceschanged", findVoice); } catch (e) {} }
    function speak(text) {
      if (!TTS || !text) return;
      try {
        speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = lang; u.rate = .9; u.pitch = 1.1;
        if (voice) u.voice = voice;
        speechSynthesis.speak(u);
      } catch (e) {}
    }
    function hush() { if (TTS) try { speechSynthesis.cancel(); } catch (e) {} }

    /* ---------- mascot, confetti, streak ---------- */
    function mood(m, text) {
      buddy.classList.remove("mood-happy", "mood-think");
      void buddy.offsetWidth;          // restart the hop / tilt animation
      if (m) buddy.classList.add("mood-" + m);
      bubble.textContent = text;
    }
    function confetti() {
      if (reduced.matches) return;
      const box = document.createElement("div");
      box.className = "qk-confetti"; box.setAttribute("aria-hidden", "true");
      const colors = ["#FF6B6B", "#FFC93C", "#1FA596", "#6C4CF1", "#23A35C", "#FF9F1C"];
      for (let i = 0; i < 28; i++) {
        const s = document.createElement("i"), a = Math.random() * Math.PI * 2, d = 70 + Math.random() * 110;
        s.style.cssText = `--x:${Math.cos(a) * d}px;--y:${Math.sin(a) * d - 60}px;--r:${Math.random() * 720 - 360}deg;` +
          `background:${colors[i % colors.length]};animation-delay:${Math.random() * 80}ms`;
        box.appendChild(s);
      }
      document.body.appendChild(box);
      setTimeout(() => box.remove(), 1300);
    }
    function setStreak(n) {
      const el = $(".qk-streak");
      if (!el) return;
      el.hidden = n === null;
      if (n === null) return;
      el.classList.toggle("hot", n >= 3);
      el.textContent = n >= 3 ? `🔥 ${n} in a row!` : `⭐ Streak: ${n}`;
    }
    function animate(el, cls) { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); }

    /* ---------- screens ---------- */
    let state = null;   // the round in progress
    const cur = () => state.qs[state.i];

    function show(html, focus = true) {
      view.innerHTML = `<div class="qk-screen">${html}</div>`;
      if (!focus) return;
      if (host.getBoundingClientRect().top < 0) host.scrollIntoView({block:"start"});
      const h = view.querySelector(".qk-h");
      if (h) h.focus({preventScroll:true});
    }

    function home(focus = true) {
      state = null; hush();
      backBtn.hidden = true; setStreak(null);
      mood(null, mascot.hello || `Hi! I'm ${mascot.name}. Pick a card to start!`);
      show(`<h3 class="qk-h" tabindex="-1">${esc(pack.title)}</h3>
        <p class="qk-lead">Pick a card. Take your time. There is no timer!</p>
        <div class="qk-home">${Object.entries(modes).map(([k, m]) =>
          `<button class="qk-mode ${m.cls}" data-mode="${k}"><span class="qk-mode-icon" aria-hidden="true">${m.icon}</span>` +
          `<span class="qk-mode-title">${m.title}</span><span class="qk-mode-sub">${m.sub}</span></button>`).join("")}</div>`, focus);
    }

    function factHtml(f) {
      const i = f.indexOf(": ");
      return i < 0 ? esc(f) : `<b>${esc(f.slice(0, i))}:</b> ${esc(f.slice(i + 2))}`;
    }
    function learn() {
      state = null; hush();
      backBtn.hidden = false; setStreak(null);
      mood(null, "Read a card, or tap Hear it and I'll read it to you.");
      show(`<h3 class="qk-h" tabindex="-1">Learn the facts</h3>
        <div class="qk-topics">${topics.map((t, i) => `
          <article class="qk-topic" style="animation-delay:${i * 60}ms">
            <div class="qk-pic">${art(t.art)}</div>
            <h4>${t.n}. ${esc(t.title)}</h4>
            <ul>${t.facts.map(f => `<li>${factHtml(f)}</li>`).join("")}</ul>
            <div class="qk-row qk-tts">
              <button class="qk-btn ghost" data-hear="${i}" aria-label="Hear the ${esc(t.title)} facts">🔊 Hear it</button>
              ${t.story ? `<button class="qk-btn ghost" data-story="${i}" aria-label="Story mode: hear a story about ${esc(t.title)}">📖 Story mode</button>` : ""}
            </div>
          </article>`).join("")}</div>
        <button class="qk-btn" data-mode="easy">I'm ready to practice! 🌱</button>`);
    }

    function start(mode) {
      const qs = L.pickSession(pack.questions, mode, {avoid: S.last[mode] || [], sizes});
      S.last[mode] = qs.map(q => q.id); persist();
      state = {mode, qs, i:0, results:[], streak:0};
      backBtn.hidden = false;
      mood(null, mode === "mixed" ? qs.length + " questions. You can do it!" : "Let's practice together!");
      question();
    }

    /* ---------- one question ---------- */
    function answersHtml(q) {
      if (q.type === "matching") {
        const btn = (side, o) => `<button class="qk-mi" data-${side}="${o.id}"><span>${esc(o.text)}</span><b class="qk-badge" aria-hidden="true"></b></button>`;
        return `<div class="qk-match"><svg class="qk-lines" aria-hidden="true"></svg>
          <div class="qk-col">${q.items.map(o => btn("left", o)).join("")}</div>
          <div class="qk-col">${q.options.map(o => btn("right", o)).join("")}</div></div>`;
      }
      const multi = q.type === "choose_two", tf = q.type === "true_false_sentence";
      return `<div class="qk-choices${tf ? " tf" : ""}">${q.options.map(o =>
        `<button class="qk-choice" data-opt="${o.id}"${multi ? ' aria-pressed="false"' : ""}>` +
        `${tf ? (o.id === "T" ? "👍 " : "👎 ") : ""}<span>${esc(o.text)}</span></button>`).join("")}</div>`;
    }

    function question() {
      const q = cur(), n = state.qs.length;
      state.tries = 0; state.done = false; state.sel = null; state.locked = [];
      state.resp = q.type === "choose_two" ? [] : q.type === "matching" ? {} : null;
      const tf = q.type === "true_false_sentence";
      show(`
        <div class="qk-progress" role="img" aria-label="Question ${state.i + 1} of ${n}">${state.qs.map((_, k) =>
          `<span class="${k < state.i ? "done" : k === state.i ? "now" : ""}"></span>`).join("")}</div>
        <div class="qk-countrow"><p class="qk-count">Question ${state.i + 1} of ${n} · ${q.difficulty === "easy" ? "🌱 Easy" : "🚀 Medium"}</p>
          <span class="qk-streak"></span></div>
        <div class="qk-q">
          <div class="qk-pic sm">${art(questionArt(q))}</div>
          <h3 class="qk-h qk-prompt" tabindex="-1">${tf ? "True or false?" : esc(q.prompt)}</h3>
          <button class="qk-say qk-tts" data-say="q" aria-label="Read the question to me">🔊</button>
          ${tf ? `<p class="qk-sentence">“${esc(q.prompt)}”</p>` : ""}
        </div>
        ${q.type === "choose_two" ? `<p class="qk-hint">✌️ Pick 2 answers</p>` :
          q.type === "matching" ? `<p class="qk-hint">👆 Tap one, then tap what it matches</p>` : ""}
        <div class="qk-answers">${answersHtml(q)}</div>
        ${q.type === "choose_two" || q.type === "matching" ? `<button class="qk-btn" data-qk="check" disabled>Check my answer</button>` : ""}
        <div class="qk-feedback" role="status" aria-live="polite"></div>`);
      setStreak(state.streak);
      if (q.type === "matching") paintMatch();
      if (S.readToMe) speak(L.readText(q));
    }

    const ansBtn = id => view.querySelector(`[data-opt="${id}"]`);
    const checkBtn = () => $('[data-qk="check"]');
    function lockAnswers() { view.querySelectorAll('.qk-answers button, [data-qk="check"]').forEach(b => b.disabled = true); }

    function feedback(kind, msg, expl) {
      state.fb = msg + " " + expl;
      const last = state.i === state.qs.length - 1, box = $(".qk-feedback");
      box.innerHTML = `<div class="qk-fb ${kind}">
        <p class="qk-msg">${esc(msg)}</p><p class="qk-expl">${esc(expl)}</p>
        <div class="qk-row"><button class="qk-say qk-tts" data-say="fb" aria-label="Read why to me">🔊 Hear why</button>
        ${state.done ? `<button class="qk-btn" data-qk="next">${last ? "See my stars ⭐" : "Next question ➜"}</button>` : ""}</div></div>`;
      if (S.readToMe) speak(state.fb);
      const next = $('[data-qk="next"]');
      if (next) next.focus({preventScroll:true});
      box.scrollIntoView({block:"nearest", behavior: reduced.matches ? "auto" : "smooth"});
    }

    function track(ok) {
      const q = cur();
      if (root.Tracker) Tracker.answer(ok, (pack.skill || pack.title) + ": " + topicName(q.topic), {q:q.id, try:state.tries});
    }

    function correct(els) {
      const q = cur(), first = state.tries === 0;
      state.tries++; state.done = true;
      state.results.push({id:q.id, correct:true, tries:state.tries});
      track(true);
      if (first) state.streak++;
      setStreak(state.streak);
      if (first && state.streak >= 3) animate($(".qk-streak"), "hot");
      els.forEach(b => { b.classList.add("right"); animate(b, "qk-bounce"); });
      lockAnswers();
      const cheer = pick(CHEERS);
      mood("happy", cheer);
      confetti();
      earn(cheer + " New sticker!", prefix + ":" + q.id);       // one sticker per question, ever
      feedback("good", "✅ " + cheer + (first && state.streak >= 3 ? ` 🔥 ${state.streak} in a row!` : ""), q.explanation);
    }

    // Returns true when the child gets another try. True/false has none: only the answer would be left.
    function wrong(els) {
      const q = cur();
      state.tries++;
      track(false);
      state.streak = 0; setStreak(0);
      els.forEach(b => animate(b, "qk-wiggle"));
      if (state.tries < 2 && q.type !== "true_false_sentence") {
        mood("think", "Hmm… let's look again!");
        feedback("try", "🤔 Almost! Let's look again.", q.explanation + " Try one more time!");
        return true;
      }
      state.done = true;
      state.results.push({id:q.id, correct:false, tries:state.tries});
      reveal(q);
      lockAnswers();
      mood("think", "That's okay! Now you know it.");
      feedback("show", "💡 Here is the answer. You'll get it next time!", q.explanation);
      return false;
    }

    function reveal(q) {
      if (q.type === "matching") { state.resp = Object.assign({}, q.correctAnswers); state.sel = null; paintMatch(); return; }
      (q.correctAnswers || [q.correctAnswer]).forEach(id => ansBtn(id).classList.add("right"));
    }

    /* single choice and true/false: a tap answers */
    function choose(id) {
      const q = cur(), b = ansBtn(id);
      if (id === q.correctAnswer) return correct([b]);
      b.classList.add("wrong");
      b.disabled = true;
      wrong([b]);
    }

    /* choose two */
    function togglePick(id) {
      const r = state.resp, i = r.indexOf(id);
      if (i >= 0) r.splice(i, 1);
      else if (r.length < 2) r.push(id);
      else { mood(null, "You can pick 2. Tap one again to un-pick it."); return; }
      view.querySelectorAll("[data-opt]").forEach(b => b.setAttribute("aria-pressed", r.includes(b.dataset.opt)));
      checkBtn().disabled = r.length !== 2;
    }
    function checkTwo() {
      const q = cur(), r = state.resp;
      if (L.isCorrect(q, r)) return correct(r.map(ansBtn));
      const bad = r.filter(id => !q.correctAnswers.includes(id)).map(ansBtn);
      bad.forEach(b => { b.classList.add("wrong"); b.disabled = true; b.setAttribute("aria-pressed", "false"); });
      state.resp = r.filter(id => q.correctAnswers.includes(id));
      checkBtn().disabled = true;
      wrong(bad);
    }

    /* matching: tap one side, then the other; a line joins each pair */
    const pairNo = id => cur().items.findIndex(i => i.id === id);
    const leftOf = optId => Object.keys(state.resp).find(l => state.resp[l] === optId);
    function tapMatch(side, id) {
      const r = state.resp, sel = state.sel;
      if (side === "left") delete r[id];                // tapping a matched one un-matches it
      else { const l = leftOf(id); if (l) delete r[l]; }
      if (sel && sel.side !== side) {
        r[side === "left" ? id : sel.id] = side === "right" ? id : sel.id;
        state.sel = null;
      } else {
        state.sel = sel && sel.side === side && sel.id === id ? null : {side, id};
      }
      paintMatch();
    }
    function paintMatch() {
      const q = cur(), r = state.resp, sel = state.sel;
      const text = (side, id) => (side === "left" ? q.items : q.options).find(o => o.id === id).text;
      view.querySelectorAll(".qk-mi").forEach(b => {
        const side = b.dataset.left ? "left" : "right", id = b.dataset[side];
        const l = side === "left" ? (r[id] ? id : null) : leftOf(id);
        const other = l && (side === "left" ? text("right", r[l]) : text("left", l));
        b.classList.toggle("paired", !!l);
        b.classList.toggle("locked", !!l && (state.locked.includes(l) || state.done));
        b.classList.toggle("sel", !!sel && sel.side === side && sel.id === id);
        b.style.setProperty("--pc", l ? PAIR_COLORS[pairNo(l) % PAIR_COLORS.length] : "");
        b.querySelector(".qk-badge").textContent = l ? pairNo(l) + 1 : "";
        b.setAttribute("aria-pressed", !!sel && sel.side === side && sel.id === id);
        b.setAttribute("aria-label", text(side, id) + (other ? ", matched with " + other : ", not matched yet"));
        if (state.locked.includes(l) || state.done) b.disabled = true;
      });
      const check = checkBtn();
      if (check) check.disabled = state.done || Object.keys(r).length !== q.items.length;
      drawLines();
    }
    function drawLines() {
      const box = view.querySelector(".qk-match");
      if (!box || !state) return;
      const R = box.getBoundingClientRect(), svg = box.querySelector(".qk-lines");
      svg.setAttribute("viewBox", `0 0 ${R.width} ${R.height}`);
      svg.innerHTML = Object.entries(state.resp).map(([l, o]) => {
        const a = box.querySelector(`[data-left="${l}"]`).getBoundingClientRect();
        const b = box.querySelector(`[data-right="${o}"]`).getBoundingClientRect();
        const x1 = a.right - R.left, y1 = a.top + a.height / 2 - R.top, x2 = b.left - R.left, y2 = b.top + b.height / 2 - R.top;
        const c = PAIR_COLORS[pairNo(l) % PAIR_COLORS.length];
        return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="5" stroke-linecap="round"/>` +
          `<circle cx="${x1}" cy="${y1}" r="6" fill="${c}"/><circle cx="${x2}" cy="${y2}" r="6" fill="${c}"/>`;
      }).join("");
    }
    addEventListener("resize", drawLines);
    function checkMatch() {
      const q = cur(), r = state.resp, bad = L.wrongItems(q, r);
      if (!bad.length) { state.locked = q.items.map(i => i.id); state.done = true; paintMatch(); return correct([...view.querySelectorAll(".qk-mi")]); }
      const badEls = bad.flatMap(l => [view.querySelector(`[data-left="${l}"]`), view.querySelector(`[data-right="${r[l]}"]`)]);
      const again = wrong(badEls);
      if (again) {
        state.locked = q.items.map(i => i.id).filter(id => !bad.includes(id));
        bad.forEach(l => delete r[l]);
        state.sel = null;
        paintMatch();
      }
    }

    function next() {
      state.i++;
      if (state.i < state.qs.length) question(); else end();
    }

    /* ---------- end of the round ---------- */
    function end() {
      const s = L.scoreSession(state.results);
      S.rounds.push({mode:state.mode, points:s.points, total:s.total, stars:s.stars, ts:Date.now()});
      if (S.rounds.length > 50) S.rounds.splice(0, S.rounds.length - 50);
      S.ends++; persist();
      if (root.Tracker) Tracker.complete(completeName + "-" + state.mode, s.firstTry, s.total, {fixed:s.fixed, stars:s.stars});
      earn("You finished a round!", prefix + ":end:" + S.ends);
      const prize = hooks.prize ? hooks.prize() : "";
      setStreak(null);
      mood("happy", endings[s.stars]);
      confetti();
      const did = s.firstTry || s.fixed
        ? `You got <b>${s.firstTry}</b> right on the first try${s.fixed ? ` and fixed <b>${s.fixed}</b> more` : ""}!`
        : "You practiced every question. Let's read the facts, then try again!";
      show(`<h3 class="qk-h" tabindex="-1">${state.mode === "mixed" ? "Test finished!" : "Practice finished!"}</h3>
        <div class="qk-stars" role="img" aria-label="${s.stars} out of 3 stars">${[1, 2, 3].map(k =>
          `<span class="${k <= s.stars ? "on" : ""}" style="--d:${k * 180}ms" aria-hidden="true">★</span>`).join("")}</div>
        <p class="qk-lead">${endings[s.stars]}</p>
        <p class="qk-did">${did}</p>
        ${prize ? `<p class="qk-prize">You earned a sticker for your book: <span class="qk-prize-s">${prize}</span></p>` : ""}
        <div class="qk-row">
          <button class="qk-btn" data-mode="${state.mode}">🔀 Try a new mix</button>
          ${s.stars < 3 && modes.learn ? `<button class="qk-btn ghost" data-mode="learn">📚 Learn the facts</button>` : ""}
          <button class="qk-btn ghost" data-home>◀ Menu</button>
        </div>`);
      if (S.readToMe) speak(endings[s.stars] + " You earned " + s.stars + (s.stars === 1 ? " star." : " stars."));
    }

    /* ---------- one click handler for the whole quiz ---------- */
    function paintReadToMe() {
      const b = $('[data-qk="read"]');
      b.setAttribute("aria-pressed", S.readToMe);
      b.textContent = "🔊 Read to me: " + (S.readToMe ? "On" : "Off");
    }
    host.addEventListener("click", e => {
      const b = e.target.closest("button");
      if (!b || b.disabled) return;
      const d = b.dataset;
      if (d.qk === "back" || "home" in d) return home();
      if (d.qk === "read") {
        S.readToMe = !S.readToMe; persist(); paintReadToMe();
        if (!S.readToMe) return hush();
        return speak(state && !state.done ? L.readText(cur()) : "I will read each question to you.");
      }
      if (d.mode) return d.mode === "learn" ? learn() : start(d.mode);
      if (d.hear) { const t = topics[d.hear]; return speak(t.title + ". " + t.facts.join(" ")); }
      if (d.story) return speak(topics[d.story].story);
      if (d.say === "q") return speak(L.readText(cur()));
      if (d.say === "fb") return speak(state.fb);
      if (d.qk === "next") { hush(); return next(); }
      if (!state || state.done) return;
      if (d.opt) return cur().type === "choose_two" ? togglePick(d.opt) : choose(d.opt);
      if (d.left) return tapMatch("left", d.left);
      if (d.right) return tapMatch("right", d.right);
      if (d.qk === "check") return cur().type === "matching" ? checkMatch() : checkTwo();
    });

    buddy.innerHTML = mascot.svg || `<span class="qk-buddy-emoji" aria-hidden="true">${mascot.emoji || "🦉"}</span>`;
    paintReadToMe();
    home(false);
    // host.__qk lets tests (and the console) see the round in progress.
    return (host.__qk = {home, learn, start, speak, state: () => state, store: S});
  }

  root.QuizKit = {mount};
})(typeof window !== "undefined" ? window : globalThis);
