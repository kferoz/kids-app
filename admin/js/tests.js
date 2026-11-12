/* ============================================================
   admin/js/tests.js — grown-ups' Ad-hoc Tests manager
   ------------------------------------------------------------
   List (filters, search, publish/draft, duplicate, print, delete),
   editor (details + three ways to add questions: question builder,
   worksheet photos + type-by-hand, sight-word list) and JSON
   backup. Data: js/adhocstore.js. Questions: the Sticker Quest
   engine (MathQuestions) — the hand form calls the same builders,
   so answers are always worked out by the engine.
   No network: photos are resized on this device and kept in
   IndexedDB; OCR is not included.
   ============================================================ */
(function () {
  "use strict";
  const M = window.MathQuestions, ST = window.AdhocStore;
  const $ = s => document.querySelector(s);
  const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const KIDS_PAGE = "../adventurepack/stickerquest/index.html#tests/";
  const TYPE_LABEL = {
    single_multiply: "Multiply (type the answer)", true_false_equations: "True or false equations",
    choose_correct_ways: "Choose two ways", fill_blanks_decompose: "Break apart (fill the blanks)",
    area_model: "Area model", word_multiply: "Word problem", multiple_choice: "Multiple choice", word_match: "Sight word match"
  };
  const LV = { easy: "★ Easy", medium: "★★ Medium", hard: "★★★ Hard", mixed: "Mixed" };
  const gradeName = g => (ST.GRADES.find(x => x[0] === g) || [g, g])[1];
  function niceDate(iso) {
    const [y, m, d] = iso.split("-").map(Number), dt = new Date(y, m - 1, d);
    return isNaN(dt) ? iso : dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }
  let toastT = null;
  function toast(msg) { const t = $("#toast"); t.textContent = msg; t.classList.add("show"); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("show"), 2600); }
  function build(spec) { try { return M.build(spec); } catch (e) { return null; } }

  /* ---------- question summaries (list, preview) ---------- */
  function answerText(q) {
    if (q.answerKind === "input") return q.fields.length === 1 ? M.format(q.answer) : q.fields.map(f => f.label + " = " + M.format(f.answer)).join(" · ");
    return q.options.filter(o => q.correctAnswers.includes(o.id)).map(o => o.text).join(" · ");
  }
  function qSummary(q, n, tools) {
    if (!q) return `<li class="q bad">⚠ This question could not be built. Remove it.${tools || ""}</li>`;
    const body = q.answerKind === "input"
      ? `<div class="q-tpl">${esc(q.template.map(t => typeof t === "string" ? t : "▢").join(""))}</div>`
      : `<ul class="q-opts">${q.options.map(o => `<li class="${q.correctAnswers.includes(o.id) ? "ok" : ""}">${q.correctAnswers.includes(o.id) ? "✓ " : ""}${esc(o.text)}</li>`).join("")}</ul>`;
    return `<li class="q"><div class="q-head"><span class="q-n">${n}.</span><span class="q-type">${esc(TYPE_LABEL[q.type] || q.type)} · ${esc(LV[q.difficulty] || q.difficulty)}</span>${tools || ""}</div>
      <div class="q-prompt">${esc(q.prompt)}</div>${body}<div class="q-ans">Answer: <b>${esc(answerText(q))}</b></div></li>`;
  }

  /* ============================================================
     LIST
     ============================================================ */
  const F = { from: "", to: "", subject: "", grade: "", status: "", q: "" };
  function filtered() {
    const q = F.q.trim().toLowerCase();
    return ST.all().filter(t => (!F.from || t.date >= F.from) && (!F.to || t.date <= F.to) && (!F.subject || t.subject === F.subject) &&
      (!F.grade || t.grade === F.grade) && (!F.status || t.status === F.status) && (!q || t.title.toLowerCase().includes(q)))
      .sort((a, b) => b.date.localeCompare(a.date) || b.updated - a.updated);
  }
  function showList() {
    location.hash = "";
    const subjects = [...new Set(ST.SUBJECTS.concat(ST.all().map(t => t.subject)))];
    $("#view").innerHTML = `
      <section class="newrow" aria-label="Make a new test">
        <span class="lbl">New test:</span>
        <button class="btn primary" data-new="builder">🧮 Question builder</button>
        <button class="btn primary" data-new="worksheet">📷 Worksheet</button>
        <button class="btn primary" data-new="sightwords">🔤 Sight words</button>
      </section>
      <section class="filters tfilters" aria-label="Find tests">
        <label>From <input type="date" id="fFrom" value="${esc(F.from)}"></label>
        <label>To <input type="date" id="fTo" value="${esc(F.to)}"></label>
        <label>Subject <select id="fSubject"><option value="">All</option>${subjects.map(s => `<option ${F.subject === s ? "selected" : ""}>${esc(s)}</option>`).join("")}</select></label>
        <label>Grade <select id="fGrade"><option value="">All</option>${ST.GRADES.map(g => `<option value="${g[0]}" ${F.grade === g[0] ? "selected" : ""}>${g[1]}</option>`).join("")}</select></label>
        <label>Status <select id="fStatus"><option value="">All</option><option value="published" ${F.status === "published" ? "selected" : ""}>Published</option><option value="draft" ${F.status === "draft" ? "selected" : ""}>Draft</option></select></label>
        <label class="grow">Search <input type="search" id="fQ" placeholder="Title…" value="${esc(F.q)}"></label>
        <button class="btn small" id="fClear">Clear</button>
      </section>
      <div id="tableBox"></div>`;
    const on = (id, k) => $(id).addEventListener("input", e => { F[k] = e.target.value; renderTable(); });
    on("#fFrom", "from"); on("#fTo", "to"); on("#fSubject", "subject"); on("#fGrade", "grade"); on("#fStatus", "status"); on("#fQ", "q");
    $("#fClear").addEventListener("click", () => { Object.keys(F).forEach(k => { F[k] = ""; }); showList(); });
    renderTable();
  }
  function renderTable() {
    const list = filtered(), total = ST.all().length;
    $("#tableBox").innerHTML = !list.length
      ? `<p class="muted empty">${total ? "No tests match these filters." : "No tests yet. Make one above!"}</p>`
      : `<p class="muted small">${list.length} of ${total} tests · newest first</p>
      <table class="ttable">
        <thead><tr><th>Date</th><th>Title</th><th>Subject</th><th>Grade</th><th>Questions</th><th>Attachments</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>${list.map(t => `<tr data-id="${esc(t.id)}">
          <td data-label="Date" class="nowrap">${esc(niceDate(t.date))}</td>
          <td data-label="Title"><div><b>${esc(t.title)}</b><div class="muted small">${esc(LV[t.difficulty] || "")}${t.recipe ? " · new numbers on retry" : ""}${t.notes ? " · " + esc(t.notes.slice(0, 60)) + (t.notes.length > 60 ? "…" : "") : ""}</div></div></td>
          <td data-label="Subject">${esc(t.subject)}</td>
          <td data-label="Grade">${esc(gradeName(t.grade))}</td>
          <td data-label="Questions">${ST.count(t)}</td>
          <td data-label="Attachments">${t.attachments.length ? "📎 " + t.attachments.length : "—"}</td>
          <td data-label="Status"><button class="pill ${t.status}" data-act="status" aria-label="${t.status === "published" ? "Published. Click to make it a draft" : "Draft. Click to publish"}">${t.status === "published" ? "● Published" : "○ Draft"}</button></td>
          <td data-label="Actions"><div class="acts">
            <button class="btn small" data-act="edit">Edit</button>
            <button class="btn small" data-act="dup">Duplicate</button>
            <a class="btn small" href="print.html#${esc(t.id)}">Print</a>
            ${t.status === "published" ? `<a class="btn small" href="${KIDS_PAGE + esc(t.id)}" title="Open the children's page for this test">Kids' page ↗</a>` : ""}
            <button class="btn small danger" data-act="del">Delete</button>
          </div></td></tr>`).join("")}</tbody>
      </table>`;
  }
  function listClick(e) {
    const nb = e.target.closest("[data-new]");
    if (nb) return edit(null, nb.getAttribute("data-new"));
    const b = e.target.closest("[data-act]"), row = e.target.closest("tr[data-id]");
    if (!b || !row) return;
    const id = row.getAttribute("data-id"), t = ST.get(id);
    if (!t) return;
    const act = b.getAttribute("data-act");
    if (act === "status") { t.status = t.status === "published" ? "draft" : "published"; ST.put(t); toast(t.status === "published" ? "Published: the children can see it now." : "Moved to drafts: hidden from the children."); renderTable(); }
    else if (act === "edit") edit(t);
    else if (act === "dup") ST.duplicate(id).then(c => { toast("Copied as a draft: " + c.title); renderTable(); }).catch(err => toast(err.message));
    else if (act === "del") {
      if (b.dataset.sure !== "1") {                  // two taps, no pop-up dialog
        b.dataset.sure = "1"; b.textContent = "Sure? Delete";
        setTimeout(() => { if (b.isConnected) { b.dataset.sure = ""; b.textContent = "Delete"; } }, 4000);
        return;
      }
      ST.remove(id).then(() => { toast("Deleted “" + t.title + "”."); renderTable(); });
    }
  }

  /* ============================================================
     EDITOR
     ============================================================ */
  let D = null;   // the test being edited
  function edit(test, source) {
    D = test ? JSON.parse(JSON.stringify(test)) : {
      title: "", date: ST.today(), subject: source === "sightwords" ? "Sight Words" : "Multiplication",
      grade: source === "sightwords" ? "kg" : "g3", notes: "", status: "draft", source: source, questions: [], attachments: [], recipe: null
    };
    D.isNew = !test;
    D.genOnly = test ? !!test.recipe : true;          // only builder questions so far → "Try again" can make new numbers
    D.addedImages = []; D.removedImages = []; PREVIEW = [];
    D.panel = test ? (test.source === "sample" ? "builder" : test.source) : source;
    location.hash = "edit";
    renderEditor();
  }
  function renderEditor() {
    const subjects = [...new Set(ST.SUBJECTS.concat([D.subject]))];
    $("#view").innerHTML = `
      <div class="ed-head"><h2>${D.isNew ? "New test" : "Edit test"}</h2>
        <div class="ed-save"><button class="btn" data-ed="cancel">Cancel</button><button class="btn primary" data-ed="save">💾 Save test</button></div></div>
      <section class="card ed-meta" aria-label="Test details">
        <label class="wide">Title <input id="eTitle" maxlength="120" required value="${esc(D.title)}" placeholder="Chapter 5 Multiplication Check"></label>
        <label>Date <input type="date" id="eDate" value="${esc(D.date)}"></label>
        <label>Subject <select id="eSubject">${subjects.map(s => `<option ${s === D.subject ? "selected" : ""}>${esc(s)}</option>`).join("")}</select></label>
        <label>Grade <select id="eGrade">${ST.GRADES.map(g => `<option value="${g[0]}" ${g[0] === D.grade ? "selected" : ""}>${g[1]}</option>`).join("")}</select></label>
        <fieldset class="status-set"><legend>Status</legend>
          <label><input type="radio" name="eStatus" value="draft" ${D.status !== "published" ? "checked" : ""}> Draft (hidden from children)</label>
          <label><input type="radio" name="eStatus" value="published" ${D.status === "published" ? "checked" : ""}> Published</label></fieldset>
        <label class="wide">Notes (only grown-ups see these) <textarea id="eNotes" rows="2" maxlength="2000">${esc(D.notes)}</textarea></label>
      </section>
      <section class="card" aria-labelledby="qTitle">
        <h3 id="qTitle">Questions (<span id="qCount">${D.questions.length}</span>)</h3>
        ${D.recipe && !D.questions.length ? `<p class="muted">This test makes new numbers every time: ${esc(LV[D.recipe.difficulty] || "")}, ${D.recipe.count} questions${D.recipe.types.length ? " (" + D.recipe.types.map(t => TYPE_LABEL[t]).join(", ") + ")" : ""}. Add questions below to fix them instead.</p>` : ""}
        <ol class="qlist" id="qList"></ol>
      </section>
      <section class="card" aria-label="Add questions">
        <div class="ptabs" role="tablist">
          ${[["builder", "🧮 Question builder"], ["worksheet", "📷 Worksheet & type by hand"], ["sightwords", "🔤 Sight words"]].map(p =>
            `<button role="tab" class="ptab" data-panel="${p[0]}" aria-selected="${D.panel === p[0]}">${p[1]}</button>`).join("")}
        </div>
        <div id="panelBox"></div>
      </section>
      <section class="card" aria-labelledby="attTitle">
        <h3 id="attTitle">Worksheet photos (${D.attachments.length})</h3>
        <div class="thumbs" id="thumbs"></div>
      </section>
      <p class="ed-msg error" id="edMsg" role="alert"></p>
      <div class="ed-save bottom"><button class="btn" data-ed="cancel">Cancel</button><button class="btn primary" data-ed="save">💾 Save test</button></div>`;
    renderQuestions(); renderPanel(); renderThumbs();
  }
  function readMeta() {
    D.title = $("#eTitle").value.trim(); D.date = $("#eDate").value || ST.today();
    D.subject = $("#eSubject").value; D.grade = $("#eGrade").value; D.notes = $("#eNotes").value;
    D.status = (document.querySelector('input[name="eStatus"]:checked') || {}).value || "draft";
  }
  function renderQuestions() {
    $("#qCount").textContent = D.questions.length;
    $("#qList").innerHTML = D.questions.map((s, i) => qSummary(build(s), i + 1,
      `<span class="q-tools"><button class="btn small" data-q="up" data-i="${i}" aria-label="Move up" ${i ? "" : "disabled"}>↑</button><button class="btn small" data-q="down" data-i="${i}" aria-label="Move down" ${i < D.questions.length - 1 ? "" : "disabled"}>↓</button><button class="btn small danger" data-q="del" data-i="${i}" aria-label="Remove question ${i + 1}">✕</button></span>`)).join("")
      || `<li class="muted">No questions yet. Add some below.</li>`;
  }
  function addSpecs(specs, fromBuilder) {
    D.questions = D.questions.concat(specs).slice(0, 60);
    if (!fromBuilder) D.genOnly = false;
    renderQuestions();
    toast(specs.length === 1 ? "Question added." : specs.length + " questions added.");
  }

  /* ---------- panel 1: question builder ---------- */
  let PREVIEW = [], LAST = null;
  function renderPanel() {
    document.querySelectorAll(".ptab").forEach(b => b.setAttribute("aria-selected", b.getAttribute("data-panel") === D.panel));
    const box = $("#panelBox");
    if (D.panel === "builder") {
      box.innerHTML = `<div class="formrow">
          <label>Question type <select id="bType"><option value="">All types (a mix)</option>${M.TYPES.map(t => `<option value="${t}">${TYPE_LABEL[t]}</option>`).join("")}</select></label>
          <label>Difficulty <select id="bLevel"><option value="easy">★ Easy</option><option value="medium">★★ Medium</option><option value="hard">★★★ Hard</option><option value="mixed">Mixed</option></select></label>
          <label>How many <input type="number" id="bCount" min="1" max="20" value="10"></label>
          <label>Seed (optional) <input id="bSeed" placeholder="random" maxlength="40"></label>
          <button class="btn" id="bGo">Preview</button></div>
        <p class="muted small">Easy: 1-digit or 2-digit × 1-digit · Medium: 3-digit × 1-digit · Hard: 2-digit × 2-digit. Answers never go above 9,999. Word problems are easy only.</p>
        <div id="bPrev"></div>`;
      $("#bGo").addEventListener("click", preview);
    } else if (D.panel === "worksheet") renderHandPanel(box);
    else renderSightPanel(box);
  }
  function preview() {
    const type = $("#bType").value, difficulty = $("#bLevel").value, count = Math.max(1, Math.min(20, +$("#bCount").value || 10));
    const seed = $("#bSeed").value.trim();
    try {
      const s = M.createSession({ seed: seed || null, count, difficulty, types: type ? [type] : null });
      PREVIEW = s.questions; LAST = { type, difficulty, seed: s.seed };
    } catch (e) { $("#bPrev").innerHTML = `<p class="error">${esc(e.message)}</p>`; return; }
    renderPreview();
  }
  function renderPreview() {
    $("#bPrev").innerHTML = `<h4>Preview (${PREVIEW.length}) · seed ${esc(LAST.seed)}</h4>
      <ol class="qlist">${PREVIEW.map((q, i) => qSummary(q, i + 1, `<span class="q-tools"><button class="btn small" data-p="swap" data-i="${i}" aria-label="New numbers for question ${i + 1}">↻</button><button class="btn small danger" data-p="del" data-i="${i}" aria-label="Leave out question ${i + 1}">✕</button></span>`)).join("")}</ol>
      ${PREVIEW.length ? `<button class="btn primary" id="bAdd">Add these ${PREVIEW.length} questions</button>` : ""}`;
    if ($("#bAdd")) $("#bAdd").addEventListener("click", () => { addSpecs(PREVIEW.map(q => q.spec), true); PREVIEW = []; $("#bPrev").innerHTML = ""; });
  }
  function previewClick(b) {
    const i = +b.getAttribute("data-i");
    if (b.getAttribute("data-p") === "del") PREVIEW.splice(i, 1);
    else {
      const old = PREVIEW[i], keys = new Set(PREVIEW.map(q => q.mathKey).concat(D.questions.map(s => (build(s) || {}).mathKey)));
      for (let k = 0; k < 40; k++) {
        const q = M.generate(old.type, old.difficulty, M.newSeed());
        if (!keys.has(q.mathKey)) { PREVIEW[i] = q; break; }
      }
    }
    renderPreview();
  }

  /* ---------- panel 2: worksheet photos + type by hand ---------- */
  const N = (id, label, extra) => `<label>${label}<input type="number" min="0" max="9999" data-k="${id}" ${extra || ""}></label>`;
  const T = (id, label, extra) => `<label>${label}<input data-k="${id}" ${extra || ""}></label>`;
  const FORMS = {
    single_multiply: { html: () => N("a", "First number") + N("b", "Times"), params: v => ({ a: +v.a, b: +v.b }) },
    true_false_equations: {
      html: () => `<label class="wide">Equations, one per line (2 to 5), like <code>62 × 4 = 248</code>. Make at least one true.<textarea data-k="eqs" rows="4"></textarea></label>`,
      params: v => ({ eqs: v.eqs.split(/\n+/).map(l => l.trim()).filter(Boolean).map(l => {
        const m = l.replace(/,/g, "").match(/^(\d+)\s*[x×*]\s*(\d+)\s*=\s*(\d+)$/i);
        if (!m) throw new Error("Can't read “" + l + "”. Write it like 62 × 4 = 248.");
        return [+m[1], +m[2], +m[3]];
      }) })
    },
    choose_correct_ways: { html: () => N("x", "First number (like 8 or 40)") + N("y", "Second number (like 300)"), params: v => ({ x: +v.x, y: +v.y }) },
    fill_blanks_decompose: { html: () => N("a", "Number to break apart (like 15 or 306)") + N("b", "Times"), params: v => ({ a: +v.a, b: +v.b }) },
    area_model: {
      html: () => N("a", "First number") + N("b", "Second number") +
        `<label>Split <select data-k="split"><option value="first">the first number</option><option value="second">the second number</option></select></label>`,
      params: v => ({ a: +v.a, b: +v.b, split: v.split })
    },
    word_multiply: {
      html: () => T("who", "Name", 'maxlength="20" value="Sam"') + N("g", "Groups (2–12)") + N("e", "In each (2–12)") +
        `<label>Things <select data-k="thing">${M.THINGS.map((t, i) => `<option value="${i}">${t.group} ${t.many} of ${t.icon} ${t.item}</option>`).join("")}</select></label>`,
      params: v => ({ who: v.who, g: +v.g, e: +v.e, thing: +v.thing })
    },
    multiple_choice: {
      html: () => `<label class="wide">Question<input data-k="prompt" maxlength="200"></label>` +
        ["A", "B", "C", "D"].map((L, i) => `<label class="opt"><input type="radio" name="mcRight" value="${i}" ${i ? "" : "checked"} aria-label="${L} is the right answer"> ${L}<input data-k="o${i}" maxlength="120" placeholder="${i < 2 ? "Choice " + L : "Choice " + L + " (optional)"}"></label>`).join("") +
        T("hint", "Hint (optional)", 'maxlength="160"') + T("explain", "Explanation (optional)", 'maxlength="300"') +
        `<p class="muted small wide">Pick the right choice with its round button.</p>`,
      params: v => {
        const all = [v.o0, v.o1, v.o2, v.o3], right = +((document.querySelector('input[name="mcRight"]:checked') || {}).value || 0);
        if (!String(all[right] || "").trim()) throw new Error("The right answer's box is empty.");
        const kept = all.map((t, i) => ({ t: String(t || "").trim(), i })).filter(o => o.t);
        return { prompt: v.prompt, options: kept.map(o => o.t), answer: kept.findIndex(o => o.i === right), hint: v.hint, explain: v.explain };
      }
    },
    word_match: {
      html: () => T("word", "Sight word", 'maxlength="24"') + T("others", "Other choices (optional, comma-separated)", 'maxlength="80" placeholder="leave blank to pick look-alikes"'),
      params: v => {
        const word = v.word.trim(), others = v.others.split(/[,;\s]+/).map(w => w.trim()).filter(Boolean).filter(w => w.toLowerCase() !== word.toLowerCase());
        // the grown-up's own look-alikes if 2+ are given, else the engine picks some
        return { word, options: others.length >= 2 ? shuffleIn(word, others.slice(0, 3)) : M.wordOptions(word, [], 4, M.newSeed()) };
      }
    }
  };
  function shuffleIn(word, others) {
    const a = others.concat([word]);
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }
  function renderHandPanel(box) {
    box.innerHTML = `
      <h4>1. Add worksheet photos</h4>
      <p class="muted small">Photos are made smaller (up to 1400 px) and kept only on this device, for you to look at while typing. Text reading (OCR) is not included, so nothing leaves the device.</p>
      <label class="btn">📷 Add photos<input type="file" id="hPhotos" accept="image/*" multiple hidden></label>
      <span class="muted small" id="hPhotoMsg" role="status"></span>
      <h4>2. Type each question</h4>
      <div class="formrow"><label>Question type <select id="hType">${M.BUILD_TYPES.map(t => `<option value="${t}">${TYPE_LABEL[t]}</option>`).join("")}</select></label>
        <label>Difficulty <select id="hLevel"><option value="auto">Auto (from the numbers)</option><option value="easy">★ Easy</option><option value="medium">★★ Medium</option><option value="hard">★★★ Hard</option></select></label></div>
      <div class="formrow" id="hFields"></div>
      <div class="formrow"><button class="btn primary" id="hAdd">Check and add</button><span class="error" id="hMsg" role="alert"></span></div>`;
    const draw = () => { $("#hFields").innerHTML = FORMS[$("#hType").value].html(); $("#hMsg").textContent = ""; };
    $("#hType").addEventListener("change", draw); draw();
    $("#hAdd").addEventListener("click", () => {
      const type = $("#hType").value, v = {};
      document.querySelectorAll("#hFields [data-k]").forEach(el => { v[el.getAttribute("data-k")] = el.value; });
      try {
        const q = M.build({ type, difficulty: $("#hLevel").value, params: FORMS[type].params(v) });
        addSpecs([q.spec], false);
        draw();
      } catch (e) { $("#hMsg").textContent = e.message; }
    });
    $("#hPhotos").addEventListener("change", e => addPhotos([...e.target.files]));
  }
  function resize(file) {
    return new Promise((res, rej) => {
      if (!/^image\//.test(file.type)) return rej(new Error(file.name + " is not a picture."));
      const url = URL.createObjectURL(file), img = new Image();
      img.onload = () => {
        const k = Math.min(1, 1400 / Math.max(img.naturalWidth, img.naturalHeight));
        const w = Math.max(1, Math.round(img.naturalWidth * k)), h = Math.max(1, Math.round(img.naturalHeight * k));
        const c = document.createElement("canvas"); c.width = w; c.height = h;
        const g = c.getContext("2d"); g.fillStyle = "#fff"; g.fillRect(0, 0, w, h); g.drawImage(img, 0, 0, w, h);
        URL.revokeObjectURL(url);
        res({ dataUrl: c.toDataURL("image/jpeg", 0.8), w, h });
      };
      img.onerror = () => { URL.revokeObjectURL(url); rej(new Error("Can't open " + file.name + ". Try a JPG or PNG photo.")); };
      img.src = url;
    });
  }
  function addPhotos(files) {
    const msg = $("#hPhotoMsg");
    msg.textContent = "Saving " + files.length + " photo(s)…";
    let done = 0, bad = [];
    return files.reduce((p, f) => p.then(() => resize(f).then(r => {
      const id = ST.newId("i");
      return ST.putImage({ id, name: f.name, w: r.w, h: r.h, dataUrl: r.dataUrl }).then(() => {
        D.attachments.push({ id, name: f.name.slice(0, 80), w: r.w, h: r.h, size: r.dataUrl.length });
        D.addedImages.push(id); done++;
      });
    }).catch(e => bad.push(e.message))), Promise.resolve()).then(() => {
      msg.textContent = done + " photo(s) added." + (bad.length ? " " + bad.join(" ") : "");
      renderThumbs();
    });
  }
  function renderThumbs() {
    $("#attTitle").textContent = "Worksheet photos (" + D.attachments.length + ")";
    const box = $("#thumbs");
    if (!D.attachments.length) { box.innerHTML = `<p class="muted small">No photos. Add them in “📷 Worksheet & type by hand”.</p>`; return; }
    box.innerHTML = D.attachments.map(a => `<figure class="thumb" data-img="${esc(a.id)}"><button class="thumb-img" data-view="${esc(a.id)}" aria-label="View ${esc(a.name)}"><span class="muted small">Loading…</span></button>
      <figcaption>${esc(a.name)} <button class="btn small danger" data-unimg="${esc(a.id)}" aria-label="Remove ${esc(a.name)}">✕</button></figcaption></figure>`).join("");
    D.attachments.forEach(a => ST.getImage(a.id).then(img => {
      const b = box.querySelector(`[data-view="${a.id}"]`);
      if (b) b.innerHTML = img ? `<img src="${img.dataUrl}" alt="">` : `<span class="muted small">Photo missing</span>`;
    }).catch(() => {}));
  }
  function viewPhoto(id) {
    ST.getImage(id).then(img => {
      if (!img) return;
      const v = document.createElement("div");
      v.className = "viewer"; v.setAttribute("role", "dialog"); v.setAttribute("aria-modal", "true"); v.setAttribute("aria-label", "Worksheet photo");
      v.innerHTML = `<button class="btn" data-close>✕ Close</button><img src="${img.dataUrl}" alt="Worksheet photo ${esc(img.name)}">`;
      v.addEventListener("click", e => { if (e.target === v || e.target.closest("[data-close]")) v.remove(); });
      document.body.appendChild(v);
      v.querySelector("[data-close]").focus();
    });
  }

  /* ---------- panel 3: sight words ---------- */
  function parseWords(text) {
    const seen = {}, out = [];
    String(text).split(/[\r\n,;\t]+/).map(w => w.trim().replace(/^"|"$/g, "")).forEach(w => {
      const k = w.toLowerCase();
      if (/^[A-Za-z][A-Za-z'-]{0,23}$/.test(w) && k !== "word" && k !== "words" && !seen[k]) { seen[k] = 1; out.push(w); }
    });
    return out.slice(0, 60);
  }
  function renderSightPanel(box) {
    box.innerHTML = `
      <p class="muted small">One word per line, or a CSV file (commas are fine; a “word” header row is skipped). Each word becomes a question:
        the child sees and hears the word, then taps the same word from 3–4 look-alike choices.</p>
      <div class="formrow">
        <label class="wide">Words<textarea id="sWords" rows="5" placeholder="the&#10;said&#10;was&#10;they"></textarea></label>
        <label class="btn">📄 Load .txt / .csv<input type="file" id="sFile" accept=".txt,.csv,text/plain,text/csv" hidden></label>
        <label>Choices per word <select id="sN"><option value="3">3</option><option value="4" selected>4</option></select></label>
      </div>
      <div class="formrow"><button class="btn primary" id="sGo">Make word questions</button><span id="sMsg" class="muted small" role="status"></span></div>`;
    $("#sFile").addEventListener("change", e => {
      const f = e.target.files[0]; if (!f) return;
      if (f.size > 200000) { $("#sMsg").textContent = "That file is too big for a word list."; return; }
      const r = new FileReader(); r.onload = () => { $("#sWords").value = r.result; $("#sMsg").textContent = parseWords(r.result).length + " words found."; }; r.readAsText(f);
    });
    $("#sGo").addEventListener("click", () => {
      const words = parseWords($("#sWords").value), n = +$("#sN").value;
      if (!words.length) { $("#sMsg").textContent = "Type or load some words first (letters only)."; return; }
      const have = new Set(D.questions.filter(s => s.type === "word_match").map(s => String(s.params.word).toLowerCase()));
      const specs = [];
      words.forEach(w => {
        if (have.has(w.toLowerCase())) return;
        try { specs.push(M.build({ type: "word_match", difficulty: "easy", params: { word: w, options: M.wordOptions(w, words, n, M.newSeed()) } }).spec); } catch (e) {}
      });
      if (!specs.length) { $("#sMsg").textContent = "Those words are already in the test."; return; }
      addSpecs(specs, false);
      $("#sMsg").textContent = specs.length + " word questions added.";
      if (!D.title) $("#eTitle").value = "Sight Words: " + words.slice(0, 3).join(", ") + (words.length > 3 ? "…" : "");
    });
  }

  /* ---------- save / cancel ---------- */
  function saveDraft() {
    readMeta();
    const msg = $("#edMsg");
    if (!D.title) { msg.textContent = "Give the test a title."; $("#eTitle").focus(); return; }
    if (!D.questions.length && !D.recipe) { msg.textContent = "Add at least one question."; return; }
    // Builder-only tests keep a recipe, so the child's "Try again" makes new numbers of the same kinds.
    let recipe = D.recipe;
    if (D.questions.length) {
      const qs = D.questions.map(build).filter(Boolean), levels = [...new Set(qs.map(q => q.difficulty))];
      recipe = D.genOnly && qs.every(q => M.TYPES.includes(q.type))
        ? { difficulty: levels.length === 1 ? levels[0] : "mixed", count: qs.length, types: [...new Set(qs.map(q => q.type))] } : null;
    }
    const test = {
      id: D.id, title: D.title, date: D.date, subject: D.subject, grade: D.grade, notes: D.notes, status: D.status,
      source: D.source || "worksheet", recipe, questions: D.questions, attachments: D.attachments, created: D.created
    };
    let saved;
    try { saved = ST.put(test); } catch (e) { msg.textContent = "Could not save: this device is out of space. Remove some photos or old tests."; return; }
    ST.deleteImages(D.removedImages);
    toast((saved.status === "published" ? "Saved and published: " : "Saved as a draft: ") + saved.title);
    D = null;
    showList();
  }
  function cancel() {
    if (D) ST.deleteImages(D.addedImages);          // photos added during this edit and never saved
    D = null; PREVIEW = [];
    showList();
  }

  /* ---------- clicks ---------- */
  function onClick(e) {
    if (!D) return listClick(e);
    const t = e.target;
    const ed = t.closest("[data-ed]");
    if (ed) return ed.getAttribute("data-ed") === "save" ? saveDraft() : cancel();
    const tab = t.closest(".ptab");
    if (tab) { readMeta(); D.panel = tab.getAttribute("data-panel"); return renderPanel(); }
    const qb = t.closest("[data-q]");
    if (qb) {
      const i = +qb.getAttribute("data-i"), a = qb.getAttribute("data-q"), list = D.questions;
      if (a === "del") list.splice(i, 1);
      else { const j = a === "up" ? i - 1 : i + 1; [list[i], list[j]] = [list[j], list[i]]; }
      return renderQuestions();
    }
    const pb = t.closest("[data-p]");
    if (pb) return previewClick(pb);
    const vw = t.closest("[data-view]");
    if (vw) return viewPhoto(vw.getAttribute("data-view"));
    const un = t.closest("[data-unimg]");
    if (un) {
      const id = un.getAttribute("data-unimg");
      D.attachments = D.attachments.filter(a => a.id !== id);
      if (D.addedImages.includes(id)) ST.deleteImages([id]); else D.removedImages.push(id);
      return renderThumbs();
    }
  }

  /* ---------- backup ---------- */
  function download(name, text) {
    if (window.AndroidBridge && AndroidBridge.saveFile) {      // Android WebView ignores <a download>
      const where = AndroidBridge.saveFile(name, text, "application/json");
      toast(where ? "Saved to " + where : "Could not save the file"); return;
    }
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type: "application/json" })); a.download = name;
    document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  function exportAll() {
    ST.exportData().then(data => {
      download("adhoc-tests-" + ST.today() + ".json", JSON.stringify(data, null, 1));
      toast("Backup made: " + data.tests.length + " tests, " + data.images.length + " photos.");
    }).catch(e => toast("Export failed: " + e.message));
  }
  function importFile(file) {
    if (!file) return;
    const r = new FileReader();
    r.onload = () => {
      let data;
      try { data = JSON.parse(r.result); } catch (e) { toast("That file is not a backup (not JSON)."); return; }
      ST.importData(data).then(res => {
        toast("Imported " + res.tests + " tests and " + res.images + " photos" + (res.skipped ? " (" + res.skipped + " skipped)" : "") + ".");
        if (!D) showList();
      }).catch(e => toast(e.message));
    };
    r.readAsText(file);
  }

  /* ---------- start ---------- */
  function start() {
    $("#app").hidden = false;
    const db = ST.ensure(typeof ADHOC_TESTS !== "undefined" ? ADHOC_TESTS : []);   // a top-level const is not on window
    if (db.tooNew) toast("These tests were saved by a newer version of the app.");
    $("#view").addEventListener("click", onClick);
    $("#exportBtn").addEventListener("click", exportAll);
    $("#importFile").addEventListener("change", e => { importFile(e.target.files[0]); e.target.value = ""; });
    $("#pinBtn").addEventListener("click", () => AdminPin.changeDialog(() => toast("PIN changed.")));
    $("#lockBtn").addEventListener("click", () => { AdminPin.lock(); location.href = "../index.html"; });
    window.addEventListener("hashchange", () => { if (D && location.hash !== "#edit") cancel(); });   // browser Back leaves the editor
    showList();
  }
  if (window.__testsApi) window.__testsApi({ build, parseWords, FORMS });   // headless tests only
  document.addEventListener("DOMContentLoaded", () => AdminPin.gate({ title: "Ad-hoc Tests admin", back: "../index.html", onOpen: start }));
})();
