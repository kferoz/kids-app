/* Ad-hoc Tests tab (index.html#adhoc; one page per test at #tests/<id>).
   Questions come from src/engine/mathQuestions.js. The list is the PUBLISHED tests a grown-up made in
   admin/tests.html (js/adhocstore.js, stored as engine specs and rebuilt here), or the built-in
   samples in src/data/adhocTests.js until Admin is first used.
   Loads after index.html's own script and uses its globals ($, save, persist, earn) and Hoot (U2_OWL).
   Saved in stickerQuest_v1 as save.adhoc: {readAll, results:{testId:{best,last,plays,ts}}, ends, aced:[hard test ids with 3 stars]}.
   Sticker ids: "mq:<question id>" (one per question ever) and "mq:end:<n>" (one per finished test).
   Scoring like Unit 2: right first try = 1, fixed on the retry = ½; 3 stars ≥ 85%, 2 ≥ 60%, else 1.
   No timers anywhere. */
(() => {
  "use strict";
  const host = $("#adhoc");
  if (!host || typeof MathQuestions === "undefined") return;
  const M = MathQuestions;
  const A = save.adhoc = Object.assign({ readAll: false, results: {}, ends: 0, aced: [] }, save.adhoc || {});

  const TOPIC = {
    single_multiply: "Multiplying numbers", true_false_equations: "True or false equations",
    choose_correct_ways: "Ways to multiply", fill_blanks_decompose: "Breaking numbers apart",
    area_model: "Area models", word_multiply: "Word problems",
    word_match: "Sight words", multiple_choice: "Worksheet questions"
  };
  const LV = { easy: ["★", "Easy"], medium: ["★★", "Medium"], hard: ["★★★", "Hard"], mixed: ["★ ★★ ★★★", "Mixed"] };
  const ORDER = { easy: 0, medium: 1, hard: 2 };
  const CHEERS = ["Super multiplier!", "Times-table hero!", "You got it!", "Brain power!", "Math star!", "Way to go!"];
  const RETRY = ["Almost! Let's look at the steps together.", "Good try! Read the steps, then try again.", "So close! You can fix it."];
  const ENDINGS = ["", "Good try! Every practice makes your brain stronger.",
    "Great work! You're getting so good at this!", "WOW! You're a multiplication superstar!"];
  const MIX = { id: "mix", title: "Practice Mix", difficulty: "mixed", count: 10, mix: true };

  const pick = a => a[Math.floor(Math.random() * a.length)];
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const motionOK = () => !(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
  const OWL = typeof U2_OWL !== "undefined" ? U2_OWL : "🦉";

  /* ---------- read aloud (on-device voices only, rate 0.9) ---------- */
  // Test the objects themselves: "speechSynthesis" in window can be true while it is undefined.
  const TTS = !!(window.speechSynthesis && window.SpeechSynthesisUtterance && typeof speechSynthesis.speak === "function");
  let voice = null;
  function findVoice() {
    try {
      const local = speechSynthesis.getVoices().filter(v => v.localService && /^en([-_]|$)/i.test(v.lang));
      voice = local.find(v => /samantha|zira|aria|jenny|karen|moira|tessa|female/i.test(v.name)) || local[0] || null;
    } catch (e) { voice = null; }
  }
  if (TTS) { findVoice(); try { speechSynthesis.addEventListener("voiceschanged", findVoice); } catch (e) {} }
  function speak(text) {
    if (!TTS || !text) return;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(M.speak(text));   // "15 × 4" → "15 times 4"
      u.rate = 0.9; u.pitch = 1.1; u.lang = "en-US";
      if (voice) u.voice = voice;
      speechSynthesis.speak(u);
    } catch (e) {}
  }
  function hush() { if (TTS) try { speechSynthesis.cancel(); } catch (e) {} }
  const auto = text => { if (A.readAll) speak(text); };

  /* ---------- tests ---------- */
  const SAMPLES = typeof ADHOC_TESTS !== "undefined" ? ADHOC_TESTS : [];
  function tests() {
    let list = [];
    try {
      list = window.AdhocStore ? AdhocStore.published(SAMPLES)
        : SAMPLES.map(t => Object.assign({ questions: [], recipe: { difficulty: t.difficulty, count: t.count, types: t.types, seed: t.seed } }, t));
    } catch (e) { list = []; }
    return list.filter(t => t && t.id && /^\d{4}-\d\d-\d\d$/.test(t.date || "") && LV[t.difficulty]);
  }
  const countOf = t => (t.questions && t.questions.length) || (t.recipe && t.recipe.count) || 10;
  function niceDate(iso) {
    const [y, m, d] = iso.split("-").map(Number), dt = new Date(y, m - 1, d);
    return isNaN(dt) ? iso : dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  /* ---------- shared bits ---------- */
  const buddy = msg => `<div class="mq-buddy"><div class="mq-owl" aria-hidden="true">${OWL}</div>
    <p class="mq-bubble" role="status" aria-live="polite">${esc(msg)}</p></div>`;
  function owl(mood, msg) {
    const o = host.querySelector(".mq-owl"), b = host.querySelector(".mq-bubble");
    if (b && msg != null) b.textContent = msg;
    if (o) { o.classList.remove("happy", "oops", "fire"); if (mood) { void o.offsetWidth; o.classList.add(mood); } }
  }
  const toggleHtml = () => TTS ? `<button class="mq-toggle" data-act="readall" role="switch" aria-checked="${A.readAll}">
    🔊 Read everything: <b>${A.readAll ? "On" : "Off"}</b></button>` : "";
  // A new screen starts at the top of the tab (Next / Check leave the page scrolled down on phones).
  function toTop() {
    if (host.getBoundingClientRect().top < 0) host.scrollIntoView({ block: "start", behavior: motionOK() ? "smooth" : "auto" });
  }
  function replay(el, cls) { if (!el || !motionOK()) return; el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); }

  function confetti(el) {
    if (!el || !motionOK()) return;
    const r = el.getBoundingClientRect(), layer = document.createElement("div");
    layer.className = "mq-confetti"; layer.setAttribute("aria-hidden", "true");
    layer.style.left = (r.left + r.width / 2) + "px";
    layer.style.top = (r.top + Math.min(r.height / 2, 180)) + "px";
    const colors = ["#FF6B6B", "#FFC93C", "#1FA596", "#6C4CF1", "#23A35C"];
    for (let k = 0; k < 26; k++) {
      const s = document.createElement("i"), ang = Math.random() * Math.PI * 2, dist = 70 + Math.random() * 120;
      s.style.setProperty("--dx", Math.round(Math.cos(ang) * dist) + "px");
      s.style.setProperty("--dy", Math.round(Math.sin(ang) * dist - 50) + "px");
      s.style.setProperty("--r", Math.round(Math.random() * 540) + "deg");
      s.style.background = colors[k % colors.length];
      layer.appendChild(s);
    }
    document.body.appendChild(layer);
    setTimeout(() => layer.remove(), 1100);
  }
  function sparkle(el) {
    if (!el || !motionOK()) return;
    ["12%", "50%", "86%"].forEach((x, k) => {
      const s = document.createElement("span");
      s.className = "mq-sparkle"; s.textContent = "✨"; s.setAttribute("aria-hidden", "true");
      s.style.left = x; s.style.animationDelay = (k * 0.08) + "s";
      el.appendChild(s);
      setTimeout(() => s.remove(), 1000);
    });
  }

  /* ---------- pages: #adhoc (list) and #tests/<id> (one test) ---------- */
  const BASE_TITLE = document.title;
  let S = null, PAGE = null;
  function openTab() {
    const tab = document.querySelector('.tab[data-tab="adhoc"]');
    if (tab && tab.getAttribute("aria-selected") !== "true") tab.click();
  }
  function route() {
    const m = location.hash.match(/^#tests\/([A-Za-z0-9_-]{1,40})$/);
    if (m) {
      openTab();
      const t = tests().find(x => x.id === m[1]);
      if (t) return testPage(t);
      home(); owl("oops", "That test isn't here any more. Pick another one!"); return;
    }
    if (location.hash === "#adhoc") { openTab(); home(); }
  }
  function goHome() { if (location.hash !== "#adhoc") location.hash = "adhoc"; else home(); }

  function testPage(t) {
    S = null; PAGE = t; hush();
    const lv = LV[t.difficulty], n = countOf(t), best = (A.results[t.id] || {}).best || 0;
    const heading = niceDate(t.date) + " — " + t.title;
    document.title = heading + " · Sticker Quest";
    host.innerHTML = `<div class="mq mq-enter mq-page">
      <a class="mq-back" href="#adhoc">← All tests</a>
      <h2 class="mq-ptitle">${esc(heading)}</h2>
      <div class="mq-pinfo"><span class="mq-badge lv-${t.difficulty}" aria-hidden="true">${lv[0]}</span>
        <span>${n} questions · ${lv[1]}${t.subject ? " · " + esc(t.subject) : ""}${best ? " · Your best " + "⭐".repeat(best) : ""}</span></div>
      ${buddy("Ready? Take your time. There is no timer!")}
      <button class="btn mq-start" data-act="start">▶ Start test</button>
      ${toggleHtml()}
    </div>`;
    toTop();
    auto(heading + ". " + n + " questions.");
  }

  /* ---------- home: tests grouped by date, newest first ---------- */
  function home() {
    S = null; PAGE = null; hush();
    document.title = BASE_TITLE;
    const list = tests().sort((a, b) => b.date.localeCompare(a.date));
    const days = [];
    list.forEach(t => {
      const last = days[days.length - 1];
      if (last && last.date === t.date) last.tests.push(t); else days.push({ date: t.date, tests: [t] });
    });
    host.innerHTML = `<div class="mq mq-enter">
      <div class="mq-head"><h2>Ad-hoc Tests</h2>${toggleHtml()}</div>
      ${buddy("Hoo-hoo! Pick a test. Take your time. There is no timer!")}
      <button class="btn mq-mixbtn" data-act="mix">🎲 Practice Mix <small>10 questions from all the tests</small></button>
      ${days.map(d => `<section class="mq-day" aria-label="${esc(niceDate(d.date))}">
        <h3 class="mq-date">📅 ${esc(niceDate(d.date))}</h3>
        <div class="mq-list">${d.tests.map(card).join("")}</div></section>`).join("")
        || `<p class="muted">No tests yet. Ask a grown-up to add one!</p>`}
    </div>`;
    toTop();
  }
  function card(t) {
    const lv = LV[t.difficulty], n = countOf(t), best = (A.results[t.id] || {}).best || 0;
    return `<a class="mq-test" href="#tests/${esc(t.id)}"
        aria-label="${esc(niceDate(t.date) + ": " + t.title)}. ${n} questions. ${lv[1]}.${best ? " Best: " + best + " stars." : ""}">
      <span class="mq-badge lv-${t.difficulty}" aria-hidden="true">${lv[0]}</span>
      <span class="mq-tt"><b>${esc(t.title)}</b>
        <span class="mq-meta">${n} questions · ${lv[1]}${best ? " · Best " + "⭐".repeat(best) : ""}</span></span>
      <span class="mq-go" aria-hidden="true">▶</span></a>`;
  }

  /* ---------- a test ---------- */
  function shuffle(a) {
    a = a.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }
  // Saved questions are engine specs: rebuild them (the engine works the answers out again).
  const fromSpecs = t => (t.questions || []).map(spec => { try { return M.build(spec); } catch (e) { return null; } }).filter(Boolean);
  const fromRecipe = (r, seed) => M.createSession({ seed, count: r.count || 10, difficulty: r.difficulty, types: r.types && r.types.length ? r.types : null }).questions;
  // On a replay, choices move around (ids stay, so answers still check); true/false keeps its order.
  const reshuffle = q => q.answerKind === "choice" && q.type !== "true_false_equations" ? Object.assign({}, q, { options: shuffle(q.options) }) : q;
  function mixQuestions() {
    let pool = [];
    tests().forEach(t => {
      try { pool.push(...(t.recipe ? fromRecipe(t.recipe, null) : fromSpecs(t))); } catch (e) {}
    });
    pool = shuffle(pool);
    const seen = {}, out = [];
    for (const q of pool) {
      if (seen[q.mathKey] || seen[q.id]) continue;
      seen[q.mathKey] = seen[q.id] = 1;
      out.push(q);
      if (out.length === 10) break;
    }
    return out.sort((a, b) => ORDER[a.difficulty] - ORDER[b.difficulty]);   // warm up first
  }
  function begin(test, fresh) {
    let qs = [];
    try {
      if (test.mix) qs = mixQuestions();
      else if (test.questions && test.questions.length && !(fresh && test.recipe)) {
        qs = fromSpecs(test);
        if (fresh) qs = shuffle(qs).map(reshuffle);                    // same questions, new order
      } else if (test.recipe) qs = fromRecipe(test.recipe, !fresh && test.recipe.seed != null ? test.recipe.seed : null);
    } catch (e) { qs = []; }
    if (!qs.length) { goHome(); owl("oops", "Hmm, that test isn't ready yet. Ask a grown-up to check it."); return; }
    qs.forEach((q, k) => { q.number = k + 1; });
    S = { test, qs, i: 0, res: [], streak: 0, walk: 0 };
    showQ();
  }

  function pathHtml() {
    const n = S.qs.length;
    const steps = S.qs.map((_, k) => {
      const r = S.res[k];
      const cls = r ? (r.score === 1 ? "s-full" : r.score > 0 ? "s-half" : "s-miss") : (k === S.i ? "s-now" : "");
      return `<span class="mq-step ${cls}">★</span>`;
    }).join("");
    const done = S.res.filter(Boolean).length;
    return `<div class="mq-path" role="progressbar" aria-label="Test progress" aria-valuemin="0" aria-valuemax="${n}"
        aria-valuenow="${done}" aria-valuetext="Question ${S.i + 1} of ${n}">
      <div class="mq-steps">${steps}</div><span class="mq-walker" aria-hidden="true" style="left:${S.walk}%">🦉</span></div>`;
  }
  function updatePath() {
    const p = host.querySelector(".mq-path");
    if (p) p.outerHTML = pathHtml();
    moveWalker();
  }
  function moveWalker() {
    const w = host.querySelector(".mq-walker");
    const to = (S.i + 0.5) / S.qs.length * 100;
    if (!w) return;
    requestAnimationFrame(() => requestAnimationFrame(() => { w.style.left = to + "%"; S.walk = to; }));
  }
  function flame(blaze) {
    const f = host.querySelector(".mq-flame");
    if (!f) return;
    f.hidden = S.streak < 3;
    f.textContent = "🔥 " + S.streak;
    f.setAttribute("aria-label", S.streak + " right in a row");
    if (blaze) replay(f, "blaze");
  }

  function pictureHtml(q) {
    if (q.type === "word_match") {
      return `<div class="mq-word"><span class="mq-wordtext" lang="en">${esc(q.word)}</span>${TTS
        ? `<button class="say" data-act="read" aria-label="Say the word again">🔊</button>` : ""}</div>`;
    }
    if (q.type === "area_model") return `<div class="mq-area-wrap"></div>`;
    if (q.type === "word_multiply" && q.picture) {
      const p = q.picture;
      return `<div class="mq-groups" role="img" aria-label="${p.groups} groups with ${p.each} in each">${
        Array.from({ length: p.groups }, () => `<div class="mq-grp"><span class="mq-gicon">${p.group}</span>
          <span class="mq-items">${p.item.repeat(p.each)}</span></div>`).join("")}</div>`;
    }
    return "";
  }

  function showQ() {
    const q = S.qs[S.i];
    Object.assign(S, { q, attempt: 0, hint: false, done: false, vals: {}, picked: [], marks: {}, sel: q.fields ? q.fields[0].id : null });
    const n = S.qs.length;
    host.innerHTML = `<div class="mq mq-play">
      <div class="mq-bar">
        <button class="btn ghost mq-stop" data-act="home" aria-label="Stop and go back to the tests">✖</button>
        ${pathHtml()}
        <span class="mq-flame" hidden></span>
      </div>
      ${buddy(q.difficulty === "hard" ? "A tricky one! Take your time." : pick(["Let's do this!", "You've got this!", "Think it through. No rush!"]))}
      <article class="mq-q mq-enter" aria-labelledby="mqPrompt">
        <div class="mq-qhead">
          <span class="mq-lv lv-${q.difficulty}" title="${LV[q.difficulty][1]}" aria-label="${LV[q.difficulty][1]}">${LV[q.difficulty][0]}</span>
          <p id="mqPrompt" class="mq-prompt"><span class="mq-num">${S.i + 1} of ${n}.</span> ${esc(q.prompt)}</p>
          ${TTS ? `<button class="say" data-act="read" aria-label="Read the question to me">🔊</button>` : ""}
        </div>
        ${pictureHtml(q)}
        <div class="mq-answer"></div>
        <p class="mq-hint" hidden></p>
        <div class="mq-explain" hidden></div>
        <div class="mq-actions">
          <button class="btn ghost" data-act="hint">💡 Hint</button>
          <button class="btn" data-act="check">✔ Check</button>
          <button class="btn alt" data-act="next" hidden>${S.i + 1 < n ? "Next ➜" : "Finish 🏁"}</button>
          <span class="mq-fire" hidden></span>
          <span class="mq-got" hidden></span>
        </div>
      </article>
      ${toggleHtml()}
    </div>`;
    flame(false);
    moveWalker();
    drawAnswer();
    toTop();
    if (q.type === "word_match") speak(q.audioText); else auto(q.audioText);   // sight words are always read aloud
  }

  /* ---------- answering ---------- */
  function drawAnswer() {
    const q = S.q, box = host.querySelector(".mq-answer");
    if (!box) return;
    const a = document.activeElement, keep = a && host.contains(a) && ["f", "key", "opt"].map(k => a.getAttribute("data-" + k) && `[data-${k}="${a.getAttribute("data-" + k)}"]`).find(Boolean);
    if (q.answerKind === "choice") {
      const tip = q.selectCount === 2 ? "Pick 2 answers, then tap Check." : q.selectCount === 1
        ? (q.type === "word_match" ? "Tap the same word, then tap Check." : "Tap the right answer, then tap Check.")
        : "Tap every true one, then tap Check.";
      box.innerHTML = `<p class="mq-tip">${tip}</p>
        <div class="mq-opts" role="group" aria-label="Answer choices">${q.options.map(o => {
          const on = S.picked.includes(o.id);
          return `<button class="mq-opt ${S.marks[o.id] || ""}" data-opt="${o.id}" aria-pressed="${on}" ${S.done ? "disabled" : ""}>
            <span class="mq-box" aria-hidden="true">${on ? "✓" : ""}</span><span>${esc(o.text)}</span></button>`;
        }).join("")}</div>`;
    } else {
      const wrap = host.querySelector(".mq-area-wrap");
      if (wrap) {
        wrap.innerHTML = M.areaSvg(q.model, S.vals);
        wrap.querySelectorAll("rect").forEach((r, k) => {
          const f = q.model.fields[k];
          r.setAttribute("data-f", f);
          r.setAttribute("class", ["mq-rect", S.sel === f && !S.done ? "sel" : "", S.marks[f] || ""].join(" ").trim());
        });
      }
      const tpl = q.template.map(t => typeof t === "string" ? `<span class="mq-t">${esc(t)}</span>` : blankHtml(t.field)).join("");
      const tip = q.type === "area_model" ? "Tap a box in the picture or a blank, then type the number."
        : q.fields.length > 1 ? "Tap a blank, then type the number." : "Type your answer.";
      box.innerHTML = `<p class="mq-tip">${tip}</p><div class="mq-tpl">${tpl}</div>${S.done ? "" : keypadHtml()}`;
    }
    if (keep) { const el = host.querySelector(keep); if (el && !el.disabled) el.focus(); }
  }
  function blankHtml(id) {
    const f = S.q.fields.find(x => x.id === id), v = S.vals[id] || "", m = S.marks[id] || "";
    const locked = S.done || m === "right";
    return `<button class="mq-blank ${S.sel === id && !locked ? "sel" : ""} ${m}" data-f="${id}" aria-pressed="${S.sel === id}"
      aria-label="${esc(M.speak(f.label))}: ${v || "empty"}" ${locked ? "disabled" : ""}>${esc(v ? M.format(+v) : "")}</button>`;
  }
  function keypadHtml() {
    const many = S.q.fields.length > 1;
    const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "del", "0", many ? "next" : ""];
    return `<div class="mq-pad" role="group" aria-label="Number pad">${keys.map(k =>
      k === "del" ? `<button class="mq-key alt" data-key="del" aria-label="Delete">⌫</button>`
      : k === "next" ? `<button class="mq-key alt" data-key="next" aria-label="Next blank">➜</button>`
      : k ? `<button class="mq-key" data-key="${k}">${k}</button>` : "<span></span>").join("")}</div>`;
  }
  function type(k) {
    if (!S || S.done || !S.q.fields || !S.sel) return;
    if (k === "next") return moveSel();
    let v = S.vals[S.sel] || "";
    if (k === "del") v = v.slice(0, -1);
    else if (v.length < 4) v = (v === "0" ? "" : v) + k;   // answers never pass 9,999
    S.vals[S.sel] = v;
    delete S.marks[S.sel];
    drawAnswer();
  }
  function moveSel() {
    const ids = S.q.fields.filter(f => S.marks[f.id] !== "right").map(f => f.id);
    const i = ids.indexOf(S.sel);
    S.sel = ids.find((id, n) => n > i && !S.vals[id]) || ids.find(id => !S.vals[id]) || ids[(i + 1) % ids.length];
    drawAnswer();
  }
  function toggleOpt(id) {
    if (!S || S.done) return;
    const i = S.picked.indexOf(id);
    if (i >= 0) S.picked.splice(i, 1);
    else {
      if (S.q.selectCount === 1) S.picked.length = 0;
      if (S.q.selectCount === 2 && S.picked.length >= 2) S.picked.shift();
      S.picked.push(id);
    }
    delete S.marks[id];
    drawAnswer();
  }

  function notReady() {
    const q = S.q;
    if (q.answerKind === "choice") {
      if (q.selectCount === 2 && S.picked.length !== 2) return "Pick 2 answers first.";
      return S.picked.length ? "" : q.selectCount === 1 ? "Tap an answer first." : "Tap the true ones first.";
    }
    const empty = q.fields.find(f => !S.vals[f.id]);
    if (!empty) return "";
    S.sel = empty.id; drawAnswer();
    return "Fill in every blank first.";
  }
  function mark() {
    const q = S.q;
    if (q.answerKind === "choice") S.picked.forEach(id => { S.marks[id] = q.correctAnswers.includes(id) ? "right" : "wrong"; });
    else q.fields.forEach(f => { S.marks[f.id] = M.checkField(q, f.id, S.vals[f.id]) ? "right" : "wrong"; });
  }
  function showExplain() {
    const box = host.querySelector(".mq-explain");
    box.innerHTML = `<h3>Let's work it out ${TTS ? `<button class="say sm" data-act="readsteps" aria-label="Read the steps to me">🔊</button>` : ""}</h3>
      <ol>${S.q.steps.map(s => `<li>${esc(s)}</li>`).join("")}</ol>`;
    box.hidden = false;
  }
  function finishButtons() {
    const act = k => host.querySelector(`[data-act="${k}"]`);
    act("hint").hidden = true; act("check").hidden = true;
    const next = act("next"); next.hidden = false; next.focus({ preventScroll: true });
  }

  function check() {
    if (!S || S.done) return;
    const need = notReady();
    if (need) { owl(null, need); auto(need); return; }
    const q = S.q, ok = M.check(q, q.answerKind === "choice" ? S.picked.slice() : S.vals);
    if (window.Tracker) Tracker.answer(ok, "Multiplication: " + TOPIC[q.type]);
    mark();
    if (ok) return win();
    const card = host.querySelector(".mq-q");
    if (S.attempt === 0) {                       // first miss: the steps, then one more try
      S.attempt = 1; S.streak = 0; flame(false);
      const msg = pick(RETRY);
      owl("oops", msg); auto(msg);
      replay(card, "mq-wiggle");
      showExplain();
      host.querySelector('[data-act="check"]').textContent = "✔ Try again";
      if (q.fields) S.sel = (q.fields.find(f => S.marks[f.id] === "wrong") || q.fields[0]).id;
      drawAnswer();
      return;
    }
    // second miss: show the answer kindly and move on
    S.done = true;
    S.res[S.i] = { type: q.type, score: 0 };
    if (q.answerKind === "choice") {
      q.correctAnswers.forEach(id => { if (S.marks[id] !== "right") S.marks[id] = "shown"; });
      S.picked = q.correctAnswers.slice();
    } else q.fields.forEach(f => { if (S.marks[f.id] !== "right") { S.marks[f.id] = "shown"; S.vals[f.id] = String(f.answer); } });
    replay(card, "mq-wiggle");
    const msg = "Here is the answer. You'll get the next one!";
    owl("oops", msg); auto(msg);
    showExplain(); drawAnswer(); finishButtons(); updatePath();
  }

  function win() {
    const q = S.q, first = S.attempt === 0, card = host.querySelector(".mq-q");
    S.done = true;
    S.res[S.i] = { type: q.type, score: first ? 1 : 0.5 };
    if (first) S.streak++;                       // a fixed answer keeps the streak but doesn't grow it
    const blaze = first && S.streak >= 3 && S.streak % 3 === 0;
    const cheer = pick(CHEERS);
    const msg = cheer + (first ? "" : " You fixed it!") + (blaze ? ` ${S.streak} in a row!` : "");
    owl(blaze ? "fire" : "happy", (blaze ? "🔥 " : "") + msg); auto(msg);
    replay(card, "mq-bounce"); confetti(card); sparkle(card);
    flame(blaze);
    if (S.streak >= 3) {                         // also beside Next: the top bar may be scrolled away
      const fire = host.querySelector(".mq-fire");
      fire.textContent = "🔥 " + S.streak + " in a row!"; fire.hidden = false;
      if (blaze) replay(fire, "blaze");
    }
    const before = save.stickers.length;
    earn(cheer, "mq:" + q.id);                  // one sticker per question, ever (index.html)
    const got = host.querySelector(".mq-got");
    if (save.stickers.length > before && got) {
      got.textContent = save.stickers[save.stickers.length - 1] + " added to your sticker book!";
      got.hidden = false; replay(got, "mq-pop");
    }
    drawAnswer(); finishButtons(); updatePath();
  }

  function next() {
    if (!S || !S.done) return;
    hush();
    S.i++;
    if (S.i >= S.qs.length) end(); else showQ();
  }

  /* ---------- end of test: stars, a sticker, topics ---------- */
  function end() {
    const t = S.test, n = S.qs.length;
    const pts = S.res.reduce((s, r) => s + (r ? r.score : 0), 0), pct = pts / n;
    const stars = pct >= 0.85 ? 3 : pct >= 0.6 ? 2 : 1;
    const r = A.results[t.id] = Object.assign({ best: 0, plays: 0 }, A.results[t.id]);
    r.plays++; r.last = stars; r.best = Math.max(r.best, stars); r.ts = Date.now();
    if (stars === 3 && t.difficulty === "hard" && !t.mix && !A.aced.includes(t.id)) A.aced.push(t.id);   // $1 challenge
    A.ends++;
    persist();
    if (window.Tracker) Tracker.complete("adhoc-" + t.id, pts, n, { stars });
    const before = save.stickers.length;
    earn("You finished a test!", "mq:end:" + A.ends);
    const prize = save.stickers.length > before ? save.stickers[save.stickers.length - 1] : "🏅";
    const right = [...new Set(S.res.filter(x => x && x.score > 0).map(x => x.type))];
    const tried = [...new Set(S.qs.map(q => q.type))];
    const msg = ENDINGS[stars];
    host.innerHTML = `<div class="mq mq-end mq-enter">
      <h2>${esc(t.title)}</h2>
      ${buddy(msg)}
      <div class="mq-stars" role="img" aria-label="${stars} out of 3 stars">${[1, 2, 3].map(k =>
        `<span class="mq-star ${k <= stars ? "on" : ""}" style="animation-delay:${k * 0.25}s">★</span>`).join("")}</div>
      <div class="mq-prize"><span class="mq-prize-st" aria-hidden="true">${prize}</span>
        <p>A new sticker for your sticker book!</p></div>
      <div class="mq-topics">${right.length
        ? `<h3>You got these right:</h3><ul>${right.map(x => `<li>✅ ${TOPIC[x]}</li>`).join("")}</ul>`
        : `<h3>You practised:</h3><ul>${tried.map(x => `<li>💪 ${TOPIC[x]}</li>`).join("")}</ul>`}</div>
      <div class="mq-actions">
        <button class="btn" data-act="again">🔁 ${t.mix || t.recipe ? "Try again with new numbers" : "Try again"}</button>
        <button class="btn ghost" data-act="home">📋 All tests</button>
      </div>
      ${toggleHtml()}
    </div>`;
    toTop();
    confetti(host.querySelector(".mq-stars"));
    owl("happy");
    auto(`${msg} You earned ${stars} ${stars === 1 ? "star" : "stars"}.`);
    host.querySelector('[data-act="again"]').focus({ preventScroll: true });
  }

  /* ---------- events ---------- */
  host.addEventListener("click", e => {
    const b = e.target.closest("[data-act],[data-opt],[data-f],[data-key]");
    if (!b || b.disabled) return;
    const get = k => b.getAttribute("data-" + k);
    if (get("key")) return type(get("key"));
    if (get("opt")) return toggleOpt(get("opt"));
    if (get("f")) {
      if (!S || S.done || S.marks[get("f")] === "right") return;
      S.sel = get("f"); drawAnswer(); return;
    }
    switch (get("act")) {
      case "home": return goHome();
      case "start": return PAGE && begin(PAGE);
      case "mix": return begin(MIX);
      case "read": return S && speak(S.q.audioText);
      case "readsteps": return S && speak(S.q.steps.join(" "));
      case "hint": {
        if (!S || S.hint || S.done) return;
        S.hint = true;
        const h = host.querySelector(".mq-hint");
        h.textContent = "💡 " + S.q.hint; h.hidden = false;
        b.disabled = true; b.textContent = "💡 Hint used";
        owl(null, S.q.hint); auto(S.q.hint);
        return;
      }
      case "check": return check();
      case "next": return next();
      case "again": return S && begin(S.test, true);
      case "readall": {
        A.readAll = !A.readAll; persist();
        host.querySelectorAll(".mq-toggle").forEach(x => {
          x.setAttribute("aria-checked", A.readAll); x.querySelector("b").textContent = A.readAll ? "On" : "Off";
        });
        if (A.readAll && S && !S.done) speak(S.q.audioText); else if (!A.readAll) hush();
        return;
      }
    }
  });
  // A real keyboard works too: digits, Backspace, Enter.
  document.addEventListener("keydown", e => {
    if (host.hidden || !S || e.altKey || e.ctrlKey || e.metaKey) return;
    const tag = (e.target && e.target.tagName) || "";
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
    if (S.q.fields && !S.done && /^[0-9]$/.test(e.key)) { type(e.key); e.preventDefault(); }
    else if (S.q.fields && !S.done && e.key === "Backspace") { type("del"); e.preventDefault(); }
    // Enter checks, unless it is pressing some other button (blanks and number keys still check).
    else if (e.key === "Enter") {
      const btn = e.target.closest && e.target.closest("button");
      if (btn && !btn.matches(".mq-blank, .mq-key")) return;
      S.done ? next() : check(); e.preventDefault();
    }
  });

  if (window.__mqTest) window.__mqState = () => S;   // headless tests only (test/adhoc-ui.js)
  window.addEventListener("hashchange", route);
  home();
  route();
})();
