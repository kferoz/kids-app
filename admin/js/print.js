/* admin/print.html#<test id> — a clean, printable worksheet for one Ad-hoc Test, plus an answer key.
   Recipe-only tests (no saved questions) get freshly made numbers, from the recipe's seed if it has one. */
(function () {
  "use strict";
  const $ = s => document.querySelector(s);
  const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const M = window.MathQuestions, ST = window.AdhocStore;
  function niceDate(iso) {
    const [y, m, d] = iso.split("-").map(Number), dt = new Date(y, m - 1, d);
    return isNaN(dt) ? iso : dt.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  }
  function questionsOf(t) {
    if (t.questions.length) return t.questions.map(s => { try { return M.build(s); } catch (e) { return null; } }).filter(Boolean);
    const r = t.recipe;
    return M.createSession({ seed: r.seed != null ? r.seed : null, count: r.count, difficulty: r.difficulty, types: r.types.length ? r.types : null }).questions;
  }
  const HOW = { true_false_equations: "Circle every true equation.", choose_correct_ways: "Circle TWO answers.", multiple_choice: "Circle the answer.", word_match: "Circle the same word." };
  function item(q) {
    let body = "";
    if (q.type === "word_match") body = `<div class="word">${esc(q.word)}</div>`;
    if (q.type === "area_model") body += `<div class="pic">${M.areaSvg(q.model)}</div>`;
    if (q.type === "word_multiply" && q.picture) body += `<div class="groups">${esc(q.picture.groups + " groups of " + q.picture.each)}</div>`;
    if (q.answerKind === "input") body += `<div class="tpl">${q.template.map(t => typeof t === "string" ? esc(t) : '<span class="blank"></span>').join("")}</div>`;
    else body += `<p class="note">${HOW[q.type] || ""}</p><ul class="opts">${q.options.map(o => `<li>${esc(o.text)}</li>`).join("")}</ul>`;
    return `<li><p class="p">${esc(q.type === "word_match" ? "Find this word:" : q.prompt)}</p>${body}</li>`;
  }
  function answer(q) {
    if (q.answerKind === "input") return q.fields.length === 1 ? M.format(q.answer) : q.fields.map(f => f.label + " = " + M.format(f.answer)).join(";  ");
    return q.options.filter(o => q.correctAnswers.includes(o.id)).map(o => o.text).join(";  ");
  }
  function render() {
    const id = decodeURIComponent(location.hash.slice(1)), t = ST.get(id);
    if (!t) { $("#out").innerHTML = `<p class="err">That test was not found. <a href="tests.html">Back to tests</a></p>`; return; }
    let qs = [];
    try { qs = questionsOf(t); } catch (e) { qs = []; }
    const grade = (ST.GRADES.find(g => g[0] === t.grade) || ["", ""])[1];
    document.title = niceDate(t.date) + " — " + t.title + " (worksheet)";
    $("#bar").hidden = false;
    $("#out").innerHTML = `<article class="sheet">
        <h1>${esc(t.title)}</h1>
        <p class="meta">${esc(niceDate(t.date))} · ${esc(t.subject)} · ${esc(grade)} · ${qs.length} questions</p>
        <div class="name"><span>Name:</span><span>Date:</span></div>
        ${t.recipe && !t.questions.length ? `<p class="note">The numbers on this sheet were made for this printout.</p>` : ""}
        <ol class="qs">${qs.map(item).join("")}</ol>
        <section class="key"><h2>Answer key — ${esc(t.title)}</h2><ol>${qs.map(q => `<li>${esc(answer(q))}</li>`).join("")}</ol></section>
      </article>`;
  }
  function start() {
    render();
    window.addEventListener("hashchange", render);
    $("#withKey").addEventListener("change", e => document.body.classList.toggle("no-key", !e.target.checked));
    $("#printBtn").addEventListener("click", () => {
      if (window.AndroidBridge && AndroidBridge.printPage) AndroidBridge.printPage(document.title);   // the APK prints natively
      else window.print();
    });
  }
  document.addEventListener("DOMContentLoaded", () => AdminPin.gate({ title: "Print worksheet", back: "../index.html", onOpen: start }));
})();
