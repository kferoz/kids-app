/* Unit 2 Test Prep: picking, shuffling, checking and scoring. No DOM, so Node tests load it too.
   rng is a () => [0,1) function: the page uses Math.random, tests pass a seeded one. */
const U2Logic = (() => {
  const SIZES = {easy: 6, medium: 6, mixed: 8};

  function shuffle(list, rng = Math.random){
    const a = list.slice();
    for (let i = a.length - 1; i > 0; i--){
      const j = Math.floor(rng() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // n questions from list. Ones not in `avoid` (the last round) go first, so back-to-back rounds differ.
  function take(list, n, avoid, rng){
    const fresh = shuffle(list.filter(q => !avoid.includes(q.id)), rng);
    const old = shuffle(list.filter(q => avoid.includes(q.id)), rng);
    return fresh.concat(old).slice(0, n);
  }

  // A copy with the choices in a new order. Answers are option ids, so they still hold.
  function prepare(q, rng = Math.random){
    const c = Object.assign({}, q);
    if (q.type !== "true_false_sentence") c.options = shuffle(q.options, rng);
    if (q.items) c.items = shuffle(q.items, rng);
    return c;
  }

  // mode "easy" | "medium" | "mixed". Mixed takes 3–5 easy ones and fills the rest with medium.
  function pickSession(pool, mode, opts = {}){
    const rng = opts.rng || Math.random, avoid = opts.avoid || [], n = opts.n || SIZES[mode];
    let picked;
    if (mode === "mixed"){
      const easy = pool.filter(q => q.difficulty === "easy"), med = pool.filter(q => q.difficulty === "medium");
      let lo = Math.max(1, n - med.length), hi = Math.min(easy.length, n - 1);
      // Fit the split to the questions the last round didn't use, when there are enough of them.
      const freshEasy = easy.filter(q => !avoid.includes(q.id)).length, freshMed = med.filter(q => !avoid.includes(q.id)).length;
      if (Math.max(lo, n - freshMed) <= Math.min(hi, freshEasy)){ lo = Math.max(lo, n - freshMed); hi = Math.min(hi, freshEasy); }
      const e = Math.min(hi, Math.max(lo, Math.round(n / 2) - 1 + Math.floor(rng() * 3)));
      picked = take(easy, e, avoid, rng).concat(take(med, n - e, avoid, rng));
    } else {
      picked = take(pool.filter(q => q.difficulty === mode), n, avoid, rng);
    }
    return shuffle(picked, rng).map(q => prepare(q, rng));
  }

  // r: an option id (single choice, true/false), [id, id] (choose two) or {itemId: optionId} (matching).
  function isCorrect(q, r){
    if (q.type === "choose_two") return Array.isArray(r) && r.length === 2 && q.correctAnswers.every(a => r.includes(a));
    if (q.type === "matching") return !!r && q.items.every(i => r[i.id] === q.correctAnswers[i.id]);
    return r === q.correctAnswer;
  }

  // Matching items that are unmatched or matched to the wrong option.
  function wrongItems(q, r){
    return q.items.map(i => i.id).filter(id => r[id] !== q.correctAnswers[id]);
  }

  // results: [{correct, tries}]. Right on the first try = 1 point, fixed on the retry = half a point.
  function scoreSession(results){
    const total = results.length;
    const firstTry = results.filter(r => r.correct && r.tries === 1).length;
    const fixed = results.filter(r => r.correct && r.tries > 1).length;
    const points = firstTry + fixed / 2, pct = total ? points / total : 0;
    return {total, firstTry, fixed, missed: total - firstTry - fixed, points,
      stars: pct >= 0.85 ? 3 : pct >= 0.6 ? 2 : 1};
  }

  // What 🔊 reads: the prompt and the choices in the order they are shown.
  function readText(q){
    if (q.type !== "multiple_choice" && q.type !== "choose_two") return q.audioText;
    return q.prompt + " " + q.options.map((o, i) => (i ? "Or, " : "") + o.text.replace(/[.?]$/, "") + "?").join(" ");
  }

  return {SIZES, shuffle, prepare, pickSession, isCorrect, wrongItems, scoreSession, readText};
})();

if (typeof module !== "undefined" && module.exports) module.exports = U2Logic;
