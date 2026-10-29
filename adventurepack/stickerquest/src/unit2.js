/* Unit 2 Test Prep tab: Learn cards, Practice Easy / Medium and an 8-question Mixed Test.
   Loads after index.html's own script and uses its globals ($, save, persist, earn), plus
   UNIT2_QUESTIONS, UNIT2_TOPICS, U2Logic and the art in unit2Art.js.
   Saved in stickerQuest_v1 as save.unit2: {readToMe, last:{mode:[ids]}, rounds:[…], ends}. */
(() => {
  const panel = $("#unit2"), view = $("#u2View"), owl = $("#u2Owl"), bubble = $("#u2Bubble");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const TTS = !!(window.speechSynthesis && window.SpeechSynthesisUtterance && speechSynthesis.speak);
  if (!TTS) document.body.classList.add("no-tts");

  const u2 = save.unit2 = Object.assign({readToMe:false, last:{}, rounds:[], ends:0}, save.unit2);

  const MODES = {
    learn: {icon:"📚", title:"Learn", sub:"Study the facts", cls:"sun"},
    easy: {icon:"🌱", title:"Practice Easy", sub:"6 easy questions", cls:"teal"},
    medium: {icon:"🚀", title:"Practice Medium", sub:"6 harder questions", cls:"grape"},
    mixed: {icon:"🏆", title:"Mixed Test", sub:"8 mixed-up questions", cls:"coral"},
  };
  const CHEERS = ["Super job!", "You're a star!", "Way to go!", "You got it!", "Brain power!", "Awesome thinking!"];
  const PAIR_COLORS = ["#6C4CF1", "#E0424E", "#0E7C70", "#C77700"];
  const ENDINGS = ["", "Good try! Every practice makes your brain stronger.",
    "Great work! You're getting so good at this!", "WOW! You're a Unit 2 superstar!"];

  const pick = a => a[Math.floor(Math.random() * a.length)];
  const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;"}[c]));
  const topicName = n => (UNIT2_TOPICS.find(t => t.n === n) || {}).title || "Unit 2";

  /* ---------- read aloud ---------- */
  // An on-device English voice only, a friendly one if we can find it. Network voices (e.g. Chrome's
  // "Google US English") send the text to a server, so with no local voice we leave the browser default.
  // voice.js still swaps in the learner's own chosen voice when there is one.
  let voice = null;
  function findVoice(){
    const local = speechSynthesis.getVoices().filter(v => /^en([-_]|$)/i.test(v.lang) && v.localService);
    voice = local.find(v => /samantha|zira|aria|jenny|karen|moira|tessa|female/i.test(v.name)) || local[0] || null;
  }
  if (TTS){
    try { findVoice(); if (speechSynthesis.addEventListener) speechSynthesis.addEventListener("voiceschanged", findVoice); } catch (e) {}
  }
  function speak(text){
    if (!TTS || !text) return;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "en-US"; u.rate = .9; u.pitch = 1.1;
      if (voice) u.voice = voice;
      speechSynthesis.speak(u);
    } catch (e) {}
  }
  function hush(){ if (TTS) try { speechSynthesis.cancel(); } catch (e) {} }

  /* ---------- mascot, confetti, streak ---------- */
  function mood(m, text){
    owl.classList.remove("mood-happy", "mood-think");
    void owl.offsetWidth;          // restart the hop / tilt animation
    if (m) owl.classList.add("mood-" + m);
    bubble.textContent = text;
  }
  function confetti(){
    if (reduced.matches) return;
    const box = document.createElement("div");
    box.className = "u2-confetti"; box.setAttribute("aria-hidden", "true");
    const colors = ["#FF6B6B", "#FFC93C", "#1FA596", "#6C4CF1", "#23A35C", "#FF9F1C"];
    for (let i = 0; i < 28; i++){
      const s = document.createElement("i"), a = Math.random() * Math.PI * 2, d = 70 + Math.random() * 110;
      s.style.cssText = `--x:${Math.cos(a) * d}px;--y:${Math.sin(a) * d - 60}px;--r:${Math.random() * 720 - 360}deg;` +
        `background:${colors[i % colors.length]};animation-delay:${Math.random() * 80}ms`;
      box.appendChild(s);
    }
    document.body.appendChild(box);
    setTimeout(() => box.remove(), 1300);
  }
  function setStreak(n){
    const el = $("#u2Streak");
    if (!el) return;
    el.hidden = n === null;
    if (n === null) return;
    el.classList.toggle("hot", n >= 3);
    el.textContent = n >= 3 ? `🔥 ${n} in a row!` : `⭐ Streak: ${n}`;
  }
  function animate(el, cls){ el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); }

  /* ---------- screens ---------- */
  let state = null;   // the round in progress
  const cur = () => state.qs[state.i];

  function show(html, focus = true){
    view.innerHTML = `<div class="u2-screen">${html}</div>`;
    if (!focus) return;
    if (panel.getBoundingClientRect().top < 0) panel.scrollIntoView({block:"start"});
    const h = view.querySelector(".u2-h");
    if (h) h.focus({preventScroll:true});
  }

  function home(focus = true){
    state = null; hush();
    $("#u2Back").hidden = true; setStreak(null);
    mood(null, "Hoo-hoo! I'm Hoot. Pick a card to start!");
    show(`<h3 class="u2-h" tabindex="-1">Unit 2 Test Prep</h3>
      <p class="u2-lead">Pick a card. Take your time. There is no timer!</p>
      <div class="u2-home">${Object.entries(MODES).map(([k, m]) =>
        `<button class="u2-mode ${m.cls}" data-mode="${k}"><span class="u2-mode-icon" aria-hidden="true">${m.icon}</span>` +
        `<span class="u2-mode-title">${m.title}</span><span class="u2-mode-sub">${m.sub}</span></button>`).join("")}</div>`, focus);
  }

  function factHtml(f){
    const i = f.indexOf(": ");
    return i < 0 ? esc(f) : `<b>${esc(f.slice(0, i))}:</b> ${esc(f.slice(i + 2))}`;
  }
  function learn(){
    state = null; hush();
    $("#u2Back").hidden = false; setStreak(null);
    mood(null, "Read a card, or tap Hear it and I'll read it to you.");
    show(`<h3 class="u2-h" tabindex="-1">Learn the facts</h3>
      <div class="u2-topics">${UNIT2_TOPICS.map((t, i) => `
        <article class="u2-topic" style="animation-delay:${i * 60}ms">
          <div class="u2-pic">${u2Picture(t.art)}</div>
          <h4>${t.n}. ${esc(t.title)}</h4>
          <ul>${t.facts.map(f => `<li>${factHtml(f)}</li>`).join("")}</ul>
          <div class="row tts">
            <button class="btn ghost" data-hear="${i}" aria-label="Hear the ${esc(t.title)} facts">🔊 Hear it</button>
            <button class="btn ghost" data-story="${i}" aria-label="Story mode: hear a story about ${esc(t.title)}">📖 Story mode</button>
          </div>
        </article>`).join("")}</div>
      <button class="btn" data-mode="easy">I'm ready to practice! 🌱</button>`);
  }

  function start(mode){
    const qs = U2Logic.pickSession(UNIT2_QUESTIONS, mode, {avoid: u2.last[mode] || []});
    u2.last[mode] = qs.map(q => q.id); persist();
    state = {mode, qs, i:0, results:[], streak:0};
    $("#u2Back").hidden = false;
    mood(null, mode === "mixed" ? "8 questions. You can do it!" : "Let's practice together!");
    question();
  }

  /* ---------- one question ---------- */
  function answersHtml(q){
    if (q.type === "matching"){
      const btn = (side, o) => `<button class="u2-mi" data-${side}="${o.id}"><span>${esc(o.text)}</span><b class="u2-badge" aria-hidden="true"></b></button>`;
      return `<div class="u2-match"><svg class="u2-lines" aria-hidden="true"></svg>
        <div class="u2-col">${q.items.map(o => btn("left", o)).join("")}</div>
        <div class="u2-col">${q.options.map(o => btn("right", o)).join("")}</div></div>`;
    }
    const multi = q.type === "choose_two", tf = q.type === "true_false_sentence";
    return `<div class="u2-choices${tf ? " tf" : ""}">${q.options.map(o =>
      `<button class="u2-choice" data-opt="${o.id}"${multi ? ' aria-pressed="false"' : ""}>` +
      `${tf ? (o.id === "T" ? "👍 " : "👎 ") : ""}<span>${esc(o.text)}</span></button>`).join("")}</div>`;
  }

  function question(){
    const q = cur(), n = state.qs.length;
    state.tries = 0; state.done = false; state.sel = null; state.locked = [];
    state.resp = q.type === "choose_two" ? [] : q.type === "matching" ? {} : null;
    const tf = q.type === "true_false_sentence";
    show(`
      <div class="u2-progress" role="img" aria-label="Question ${state.i + 1} of ${n}">${state.qs.map((_, k) =>
        `<span class="${k < state.i ? "done" : k === state.i ? "now" : ""}"></span>`).join("")}</div>
      <div class="u2-countrow"><p class="u2-count">Question ${state.i + 1} of ${n} · ${q.difficulty === "easy" ? "🌱 Easy" : "🚀 Medium"}</p>
        <span class="u2-streak" id="u2Streak"></span></div>
      <div class="u2-q">
        <div class="u2-pic sm">${u2Picture(U2_PICTURE[q.id] || q.picture)}</div>
        <h3 class="u2-h u2-prompt" tabindex="-1">${tf ? "True or false?" : esc(q.prompt)}</h3>
        <button class="say tts" data-say="q" aria-label="Read the question to me">🔊</button>
        ${tf ? `<p class="u2-sentence">“${esc(q.prompt)}”</p>` : ""}
      </div>
      ${q.type === "choose_two" ? `<p class="u2-hint">✌️ Pick 2 answers</p>` :
        q.type === "matching" ? `<p class="u2-hint">👆 Tap a word, then tap what it matches</p>` : ""}
      <div id="u2Answers">${answersHtml(q)}</div>
      ${q.type === "choose_two" || q.type === "matching" ? `<button class="btn" id="u2Check" disabled>Check my answer</button>` : ""}
      <div class="u2-feedback" id="u2Feedback" role="status" aria-live="polite"></div>`);
    setStreak(state.streak);
    if (q.type === "matching") paintMatch();
    if (u2.readToMe) speak(U2Logic.readText(q));
  }

  const ansBtn = id => view.querySelector(`[data-opt="${id}"]`);
  function lockAnswers(){ view.querySelectorAll("#u2Answers button, #u2Check").forEach(b => b.disabled = true); }

  function feedback(kind, msg, expl){
    state.fb = msg + " " + expl;
    const last = state.i === state.qs.length - 1;
    $("#u2Feedback").innerHTML = `<div class="u2-fb ${kind}">
      <p class="u2-msg">${esc(msg)}</p><p class="u2-expl">${esc(expl)}</p>
      <div class="row"><button class="say tts" data-say="fb" aria-label="Read why to me">🔊 Hear why</button>
      ${state.done ? `<button class="btn" id="u2Next">${last ? "See my stars ⭐" : "Next question ➜"}</button>` : ""}</div></div>`;
    if (u2.readToMe) speak(state.fb);
    const next = $("#u2Next");
    if (next) next.focus({preventScroll:true});
    $("#u2Feedback").scrollIntoView({block:"nearest", behavior: reduced.matches ? "auto" : "smooth"});
  }

  function track(ok){
    const q = cur();
    if (window.Tracker) Tracker.answer(ok, "Unit 2: " + topicName(q.topic), {q:q.id, try:state.tries});
  }

  function correct(els){
    const q = cur(), first = state.tries === 0;
    state.tries++; state.done = true;
    state.results.push({id:q.id, correct:true, tries:state.tries});
    track(true);
    if (first) state.streak++;
    setStreak(state.streak);
    if (first && state.streak >= 3) animate($("#u2Streak"), "hot");
    els.forEach(b => { b.classList.add("right"); animate(b, "u2-bounce"); });
    lockAnswers();
    const cheer = pick(CHEERS);
    mood("happy", cheer);
    confetti();
    earn(cheer + " New sticker!", "u2:" + q.id);       // one sticker per question, ever
    feedback("good", "✅ " + cheer + (first && state.streak >= 3 ? ` 🔥 ${state.streak} in a row!` : ""), q.explanation);
  }

  // Returns true when the child gets another try. True/false has none: only the answer would be left.
  function wrong(els){
    const q = cur();
    state.tries++;
    track(false);
    state.streak = 0; setStreak(0);
    els.forEach(b => animate(b, "u2-wiggle"));
    if (state.tries < 2 && q.type !== "true_false_sentence"){
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

  function reveal(q){
    if (q.type === "matching"){ state.resp = Object.assign({}, q.correctAnswers); state.sel = null; paintMatch(); return; }
    (q.correctAnswers || [q.correctAnswer]).forEach(id => ansBtn(id).classList.add("right"));
  }

  /* single choice and true/false: a tap answers */
  function choose(id){
    const q = cur(), b = ansBtn(id);
    if (id === q.correctAnswer) return correct([b]);
    b.classList.add("wrong");
    b.disabled = true;
    wrong([b]);
  }

  /* choose two */
  function togglePick(id){
    const r = state.resp, i = r.indexOf(id);
    if (i >= 0) r.splice(i, 1);
    else if (r.length < 2) r.push(id);
    else { mood(null, "You can pick 2. Tap one again to un-pick it."); return; }
    view.querySelectorAll("[data-opt]").forEach(b => b.setAttribute("aria-pressed", r.includes(b.dataset.opt)));
    $("#u2Check").disabled = r.length !== 2;
  }
  function checkTwo(){
    const q = cur(), r = state.resp;
    if (U2Logic.isCorrect(q, r)) return correct(r.map(ansBtn));
    const bad = r.filter(id => !q.correctAnswers.includes(id)).map(ansBtn);
    bad.forEach(b => { b.classList.add("wrong"); b.disabled = true; b.setAttribute("aria-pressed", "false"); });
    state.resp = r.filter(id => q.correctAnswers.includes(id));
    $("#u2Check").disabled = true;
    wrong(bad);
  }

  /* matching: tap one side, then the other; a line joins each pair */
  const pairNo = id => cur().items.findIndex(i => i.id === id);
  const leftOf = optId => Object.keys(state.resp).find(l => state.resp[l] === optId);
  function tapMatch(side, id){
    const r = state.resp, sel = state.sel;
    if (side === "left") delete r[id];                // tapping a matched one un-matches it
    else { const l = leftOf(id); if (l) delete r[l]; }
    if (sel && sel.side !== side){
      r[side === "left" ? id : sel.id] = side === "right" ? id : sel.id;
      state.sel = null;
    } else {
      state.sel = sel && sel.side === side && sel.id === id ? null : {side, id};
    }
    paintMatch();
  }
  function paintMatch(){
    const q = cur(), r = state.resp, sel = state.sel;
    const text = (side, id) => (side === "left" ? q.items : q.options).find(o => o.id === id).text;
    view.querySelectorAll(".u2-mi").forEach(b => {
      const side = b.dataset.left ? "left" : "right", id = b.dataset[side];
      const l = side === "left" ? (r[id] ? id : null) : leftOf(id);
      const other = l && (side === "left" ? text("right", r[l]) : text("left", l));
      b.classList.toggle("paired", !!l);
      b.classList.toggle("locked", !!l && (state.locked.includes(l) || state.done));
      b.classList.toggle("sel", !!sel && sel.side === side && sel.id === id);
      b.style.setProperty("--pc", l ? PAIR_COLORS[pairNo(l) % PAIR_COLORS.length] : "");
      b.querySelector(".u2-badge").textContent = l ? pairNo(l) + 1 : "";
      b.setAttribute("aria-pressed", !!sel && sel.side === side && sel.id === id);
      b.setAttribute("aria-label", text(side, id) + (other ? ", matched with " + other : ", not matched yet"));
      if (state.locked.includes(l) || state.done) b.disabled = true;
    });
    const check = $("#u2Check");
    if (check) check.disabled = state.done || Object.keys(r).length !== q.items.length;
    drawLines();
  }
  function drawLines(){
    const box = view.querySelector(".u2-match");
    if (!box || !state) return;
    const R = box.getBoundingClientRect(), svg = box.querySelector(".u2-lines");
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
  function checkMatch(){
    const q = cur(), r = state.resp, bad = U2Logic.wrongItems(q, r);
    if (!bad.length){ state.locked = q.items.map(i => i.id); state.done = true; paintMatch(); return correct([...view.querySelectorAll(".u2-mi")]); }
    const badEls = bad.flatMap(l => [view.querySelector(`[data-left="${l}"]`), view.querySelector(`[data-right="${r[l]}"]`)]);
    const again = wrong(badEls);
    if (again){
      state.locked = q.items.map(i => i.id).filter(id => !bad.includes(id));
      bad.forEach(l => delete r[l]);
      state.sel = null;
      paintMatch();
    }
  }

  function next(){
    state.i++;
    if (state.i < state.qs.length) question(); else end();
  }

  /* ---------- end of the round ---------- */
  function end(){
    const s = U2Logic.scoreSession(state.results);
    u2.rounds.push({mode:state.mode, points:s.points, total:s.total, stars:s.stars, ts:Date.now()});
    if (u2.rounds.length > 50) u2.rounds.splice(0, u2.rounds.length - 50);
    u2.ends++; persist();
    if (window.Tracker) Tracker.complete("unit2-" + state.mode, s.firstTry, s.total, {fixed:s.fixed, stars:s.stars});
    earn("You finished a round!", "u2:end:" + u2.ends);
    const sticker = save.stickers[save.stickers.length - 1];
    setStreak(null);
    mood("happy", ENDINGS[s.stars]);
    confetti();
    const did = s.firstTry || s.fixed
      ? `You got <b>${s.firstTry}</b> right on the first try${s.fixed ? ` and fixed <b>${s.fixed}</b> more` : ""}!`
      : "You practiced every question. Let's read the facts, then try again!";
    show(`<h3 class="u2-h" tabindex="-1">${state.mode === "mixed" ? "Test finished!" : "Practice finished!"}</h3>
      <div class="u2-stars" role="img" aria-label="${s.stars} out of 3 stars">${[1, 2, 3].map(k =>
        `<span class="${k <= s.stars ? "on" : ""}" style="--d:${k * 180}ms" aria-hidden="true">★</span>`).join("")}</div>
      <p class="u2-lead">${ENDINGS[s.stars]}</p>
      <p class="u2-did">${did}</p>
      <p class="u2-prize">You earned a sticker for your book: <span class="u2-prize-s">${sticker}</span></p>
      <div class="row">
        <button class="btn" data-mode="${state.mode}">🔀 Try a new mix</button>
        ${s.stars < 3 ? `<button class="btn ghost" data-mode="learn">📚 Learn the facts</button>` : ""}
        <button class="btn ghost" data-home>◀ Unit 2 menu</button>
      </div>`);
    if (u2.readToMe) speak(ENDINGS[s.stars] + " You earned " + s.stars + (s.stars === 1 ? " star." : " stars."));
  }

  /* ---------- one click handler for the whole tab ---------- */
  function paintReadToMe(){
    const b = $("#u2ReadToMe");
    b.setAttribute("aria-pressed", u2.readToMe);
    b.textContent = "🔊 Read to me: " + (u2.readToMe ? "On" : "Off");
  }
  panel.addEventListener("click", e => {
    const b = e.target.closest("button");
    if (!b || b.disabled) return;
    const d = b.dataset;
    if (b.id === "u2Back" || "home" in d) return home();
    if (b.id === "u2ReadToMe"){
      u2.readToMe = !u2.readToMe; persist(); paintReadToMe();
      if (!u2.readToMe) return hush();
      return speak(state && !state.done ? U2Logic.readText(cur()) : "I will read each question to you.");
    }
    if (d.mode) return d.mode === "learn" ? learn() : start(d.mode);
    if (d.hear){ const t = UNIT2_TOPICS[d.hear]; return speak(t.title + ". " + t.facts.join(" ")); }
    if (d.story) return speak(UNIT2_TOPICS[d.story].story);
    if (d.say === "q") return speak(U2Logic.readText(cur()));
    if (d.say === "fb") return speak(state.fb);
    if (b.id === "u2Next"){ hush(); return next(); }
    if (!state || state.done) return;
    if (d.opt) return cur().type === "choose_two" ? togglePick(d.opt) : choose(d.opt);
    if (d.left) return tapMatch("left", d.left);
    if (d.right) return tapMatch("right", d.right);
    if (b.id === "u2Check") return cur().type === "matching" ? checkMatch() : checkTwo();
  });

  owl.innerHTML = U2_OWL;
  paintReadToMe();
  home(false);
})();
