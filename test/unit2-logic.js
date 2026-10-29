// Unit 2 Test Prep: question picking (no repeats, mixing, new combinations), checking and scoring.
// Run: node test/unit2-logic.js
const path = require('path');
const base = path.join(__dirname, '../adventurepack/stickerquest/src');
const QS = require(path.join(base, 'data/unit2Questions.js'));
const L = require(path.join(base, 'unit2Logic.js'));

let fail = 0; const err = m => { console.log('FAIL: ' + m); fail++; };
// Seeded random numbers (mulberry32) so a failure can be replayed.
const seeded = s => () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const byId = Object.fromEntries(QS.map(q => [q.id, q]));
const key = qs => qs.map(q => q.id).sort().join();

// 1. No repeats, the right size and the right difficulty in every mode.
for (let seed = 1; seed <= 300; seed++){
  for (const mode of ['easy', 'medium', 'mixed']){
    const qs = L.pickSession(QS, mode, {rng: seeded(seed)});
    const ids = qs.map(q => q.id);
    if (qs.length !== L.SIZES[mode]) err(`${mode}#${seed}: ${qs.length} questions`);
    if (new Set(ids).size !== ids.length) err(`${mode}#${seed}: repeated question ${ids}`);
    if (ids.some(id => !byId[id])) err(`${mode}#${seed}: unknown question`);
    if (mode !== 'mixed' && qs.some(q => q.difficulty !== mode)) err(`${mode}#${seed}: wrong difficulty`);
    if (mode === 'mixed'){
      const easy = qs.filter(q => q.difficulty === 'easy').length;
      if (easy < 3 || easy > 5) err(`mixed#${seed}: ${easy} easy questions (want 3–5)`);
    }
  }
}

// 2. Options are shuffled copies: same choices, answers still valid, originals untouched.
const before = JSON.stringify(QS);
let reordered = 0, shown = 0;
for (let seed = 1; seed <= 200; seed++){
  L.pickSession(QS, 'mixed', {rng: seeded(seed)}).forEach(q => {
    const orig = byId[q.id];
    if (key(q.options) !== key(orig.options)) err(`${q.id}: options changed, not just reordered`);
    if (q.type === 'true_false_sentence' && q.options.map(o => o.id).join() !== 'T,F') err(`${q.id}: True/False got shuffled`);
    if (q.type !== 'true_false_sentence'){ shown++; if (q.options.map(o => o.id).join() !== orig.options.map(o => o.id).join()) reordered++; }
  });
}
if (JSON.stringify(QS) !== before) err('pickSession changed the question bank');
if (reordered < shown * 0.5) err(`options barely shuffle (${reordered} of ${shown} reordered)`);

// 3. Random mixing: many different combinations, and a new round never repeats the last one.
const combos = new Set();
for (let seed = 1; seed <= 200; seed++) combos.add(key(L.pickSession(QS, 'mixed', {rng: seeded(seed)})));
if (combos.size < 190) err(`only ${combos.size} different mixes in 200 rounds`);
for (const mode of ['easy', 'medium', 'mixed']){
  const rng = seeded(7); let last = [];
  for (let round = 0; round < 50; round++){
    const ids = L.pickSession(QS, mode, {rng, avoid: last}).map(q => q.id);
    if (key(ids.map(id => ({id}))) === key(last.map(id => ({id})))) err(`${mode}: round ${round} repeated the last round`);
    // Mixed has enough questions to make the next round all new.
    if (mode === 'mixed' && ids.some(id => last.includes(id))) err(`mixed: round ${round} reused a question from the last round`);
    last = ids;
  }
}

// 4. Checking answers, for every question in the bank.
QS.forEach(q => {
  const c = L.prepare(q, seeded(3));
  const right = q.type === 'choose_two' ? [...q.correctAnswers].reverse()
    : q.type === 'matching' ? Object.assign({}, q.correctAnswers) : q.correctAnswer;
  if (!L.isCorrect(c, right)) err(`${q.id}: the right answer is marked wrong`);
  const rightIds = q.type === 'choose_two' ? q.correctAnswers : [q.correctAnswer];
  const other = q.options.find(o => !rightIds.includes(o.id));
  if (q.type === 'multiple_choice' || q.type === 'true_false_sentence'){
    if (L.isCorrect(c, other.id)) err(`${q.id}: a wrong answer is marked right`);
  } else if (q.type === 'choose_two'){
    if (L.isCorrect(c, [q.correctAnswers[0], other.id])) err(`${q.id}: one right + one wrong passes`);
    if (L.isCorrect(c, [q.correctAnswers[0]])) err(`${q.id}: only one pick passes`);
    if (L.isCorrect(c, [q.correctAnswers[0], q.correctAnswers[0]])) err(`${q.id}: same pick twice passes`);
  } else {
    const [a, b] = q.items.map(i => i.id), swapped = Object.assign({}, right, {[a]: right[b], [b]: right[a]});
    if (L.isCorrect(c, swapped)) err(`${q.id}: swapped pairs pass`);
    if (L.wrongItems(c, swapped).sort().join() !== [a, b].sort().join()) err(`${q.id}: wrongItems should be ${a},${b}`);
    const partial = Object.assign({}, right); delete partial[a];
    if (L.isCorrect(c, partial)) err(`${q.id}: an unfinished match passes`);
  }
});

// 5. Scoring: first try = 1 point, fixed on the retry = ½, stars from the share of points.
const run = (first, fixed, missed) => [
  ...Array(first).fill({correct: true, tries: 1}),
  ...Array(fixed).fill({correct: true, tries: 2}),
  ...Array(missed).fill({correct: false, tries: 2})];
[[8, 0, 0, 8, 3], [7, 1, 0, 7.5, 3], [7, 0, 1, 7, 3], [6, 0, 2, 6, 2], [5, 0, 3, 5, 2], [4, 2, 2, 5, 2],
 [4, 0, 4, 4, 1], [0, 0, 8, 0, 1], [6, 0, 0, 6, 3], [3, 1, 2, 3.5, 1]].forEach(([f, x, m, points, stars]) => {
  const s = L.scoreSession(run(f, x, m));
  if (s.firstTry !== f || s.fixed !== x || s.missed !== m || s.total !== f + x + m) err(`score ${f}/${x}/${m}: counts ${JSON.stringify(s)}`);
  if (s.points !== points) err(`score ${f}/${x}/${m}: ${s.points} points, want ${points}`);
  if (s.stars !== stars) err(`score ${f}/${x}/${m}: ${s.stars} stars, want ${stars}`);
});
if (L.scoreSession([]).stars !== 1) err('an empty round should still show 1 star');

// 6. Read-aloud follows the order the choices are shown in.
const q = L.prepare(byId.sg8, seeded(5)), said = L.readText(q);
const at = q.options.map(o => said.indexOf(o.text.replace(/[.?]$/, '')));
if (at.some(i => i < 0) || at.some((v, i) => i && v < at[i - 1])) err('readText does not follow the shown order');

console.log(`${combos.size} different mixes in 200 rounds`);
console.log(fail ? `${fail} FAILED` : 'ALL OK');
process.exit(fail ? 1 : 0);
