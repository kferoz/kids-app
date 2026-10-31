// Phase 4: the shared Quiz Kit — logic, every quiz pack, and the pages that use it.
// Run: node test/phase4-quizkit.js
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
let fail = 0; const err = m => { console.log('FAIL: ' + m); fail++; };
const L = require(path.join(ROOT, 'js/quizkit/logic.js'));
const seeded = s => () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };

/* ---------- Sticker Quest's U2Logic IS the shared logic ---------- */
if (require(path.join(ROOT, 'adventurepack/stickerquest/src/unit2Logic.js')) !== L) err('unit2Logic.js should hand back QuizLogic');

/* ---------- load every pack the quiz page lists ---------- */
const page = fs.readFileSync(path.join(ROOT, 'quiz/index.html'), 'utf8');
const listed = [...page.matchAll(/<script src="packs\/([\w-]+)\.js"><\/script>/g)].map(m => m[1]);
const onDisk = fs.readdirSync(path.join(ROOT, 'quiz/packs')).filter(f => f.endsWith('.js')).map(f => f.replace(/\.js$/, ''));
onDisk.forEach(f => { if (!listed.includes(f)) err(`quiz/packs/${f}.js is not loaded by quiz/index.html`); });
const ctx = vm.createContext({ console }); ctx.window = ctx; ctx.globalThis = ctx;
vm.runInContext(fs.readFileSync(path.join(ROOT, 'quiz/js/packs.js'), 'utf8'), ctx);
listed.forEach(id => vm.runInContext(fs.readFileSync(path.join(ROOT, 'quiz/packs', id + '.js'), 'utf8'), ctx, { filename: id + '.js' }));
const packs = ctx.QuizPacks.all();
if (!packs.length) err('no packs');
const catalog = fs.readFileSync(path.join(ROOT, 'js/catalog.js'), 'utf8');
const GRADES = ['pk', 'kg', 'g1', 'g2', 'g3', 'g4', 'g5'], SUBJECTS = ['science', 'math', 'social', 'language', 'fun'];
const words = s => String(s).trim().split(/\s+/).length;
const sentences = s => String(s).split(/(?<=[.!?])\s+/).filter(Boolean);

packs.forEach(p => {
  const P = `pack ${p.id}`;
  ['id', 'title', 'icon', 'skill', 'subject'].forEach(k => { if (!p[k]) err(`${P}: missing ${k}`); });
  if (!listed.includes(p.id)) err(`${P}: file name must be packs/${p.id}.js`);
  if (!SUBJECTS.includes(p.subject)) err(`${P}: subject ${p.subject}`);
  if (!Array.isArray(p.grades) || !p.grades.length || p.grades.some(g => !GRADES.includes(g))) err(`${P}: grades ${p.grades}`);
  if (!catalog.includes(`"quiz/index.html#${p.id}"`)) err(`${P}: no js/catalog.js entry`);
  if ((p.grades.includes('pk') || p.grades.includes('kg')) && !p.readToMe) err(`${P}: Pre-K/KG packs should read to me by default`);
  if (!p.mascot || !p.mascot.name || !(p.mascot.emoji || p.mascot.svg)) err(`${P}: mascot needs a name and an emoji or svg`);
  const sizes = Object.assign({}, L.SIZES, p.sizes), qs = p.questions || [];
  // {{native|spelling}} markers: well formed, only in packs that say which language they are
  const texts = [p.title, p.mascot && p.mascot.hello].concat(...(p.topics || []).map(t => [t.title, t.story].concat(t.facts)),
    ...qs.map(q => [q.prompt, q.explanation, q.audioText].concat((q.options || []).map(o => o.text), (q.items || []).map(i => i.text))));
  texts.filter(Boolean).forEach(t => {
    if (/\{\{|\}\}/.test(t.replace(/\{\{[^|{}]+\|[^|{}]+\}\}/g, ''))) err(`${P}: broken {{native|spelling}} in: ${t}`);
    L.segments(t).filter(g => g.native).forEach(g => {
      if (!p.native) err(`${P}: uses {{…}} but has no native language`);
      if (/[A-Za-z]/.test(g.text) || !/^[A-Za-z' -]+$/.test(g.say)) err(`${P}: {{${g.text}|${g.say}}} should be native script | English letters`);
    });
    if (p.native && /^ta/.test(p.native.lang) && /[஀-௿]/.test(L.segments(t).filter(g => !g.native).map(g => g.text).join(''))) err(`${P}: Tamil script outside {{…}}: ${t}`);
  });
  const topicNs = (p.topics || []).map(t => t.n);
  (p.topics || []).forEach(t => {
    if (!t.title || !t.art || !Array.isArray(t.facts) || !t.facts.length) err(`${P} topic ${t.n}: needs title, art, facts`);
    t.facts.forEach(f => { if (words(f) > 12) err(`${P} topic ${t.n}: fact over 12 words: ${f}`); });
    if (t.story) sentences(t.story).forEach(s => { if (words(s) > 12) err(`${P} topic ${t.n}: story sentence over 12 words: ${s}`); });
  });
  const ids = new Set();
  qs.forEach(q => {
    const Q = `${P} ${q.id}`;
    if (ids.has(q.id)) err(`${Q}: duplicate id`); ids.add(q.id);
    if (!['easy', 'medium'].includes(q.difficulty)) err(`${Q}: difficulty`);
    if (topicNs.length && !topicNs.includes(q.topic)) err(`${Q}: unknown topic ${q.topic}`);
    if (!q.prompt || !q.explanation || !q.picture) err(`${Q}: needs prompt, explanation, picture`);
    if (words(q.prompt) > 12) err(`${Q}: prompt over 12 words`);
    sentences(q.explanation).forEach(s => { if (words(s) > 12) err(`${Q}: explanation sentence over 12 words: ${s}`); });
    const opt = new Set((q.options || []).map(o => o.id));
    if (opt.size !== (q.options || []).length) err(`${Q}: duplicate option ids`);
    (q.options || []).forEach(o => { if (words(o.text) > 12) err(`${Q}: option over 12 words`); });
    if (q.type === 'multiple_choice') { if (opt.size < 2 || !opt.has(q.correctAnswer)) err(`${Q}: bad multiple_choice`); }
    else if (q.type === 'true_false_sentence') { if ([...opt].join() !== 'T,F' || !opt.has(q.correctAnswer) || !q.audioText) err(`${Q}: bad true/false`); }
    else if (q.type === 'choose_two') { if (opt.size < 3 || q.correctAnswers.length !== 2 || q.correctAnswers.some(a => !opt.has(a)) || q.correctAnswers[0] === q.correctAnswers[1]) err(`${Q}: bad choose_two`); }
    else if (q.type === 'matching') {
      const used = Object.values(q.correctAnswers || {});
      if (!q.items || q.items.length !== opt.size || q.items.some(i => !opt.has(q.correctAnswers[i.id])) || new Set(used).size !== used.length || !q.audioText) err(`${Q}: bad matching`);
    } else err(`${Q}: unknown type ${q.type}`);
    // the right answer is marked right, a wrong one wrong, after shuffling
    const c = L.prepare(q, seeded(7));
    const right = q.type === 'choose_two' ? q.correctAnswers.slice() : q.type === 'matching' ? Object.assign({}, q.correctAnswers) : q.correctAnswer;
    if (!L.isCorrect(c, right)) err(`${Q}: the right answer is marked wrong`);
    if (q.type === 'multiple_choice' || q.type === 'true_false_sentence') {
      const other = c.options.find(o => o.id !== q.correctAnswer);
      if (L.isCorrect(c, other.id)) err(`${Q}: a wrong answer is marked right`);
    }
    if (typeof L.readText(c) !== 'string' || !L.readText(c)) err(`${Q}: nothing to read aloud`);
    if ((q.type === 'multiple_choice' || q.type === 'choose_two') && (q.audioText || (q.audioPrompt && L.readText(c).indexOf(q.audioPrompt) !== 0))) err(`${Q}: a choice question speaks audioPrompt, not audioText`);
  });
  // Math packs: recompute every "a + b" / "a minus b" the answers depend on.
  // Also "a × b" and "a ÷ b" (a division with a remainder answers "q R r"); numbers may have thousands commas.
  const OPS = { '+': (a, b) => a + b, 'minus': (a, b) => a - b, '−': (a, b) => a - b, '-': (a, b) => a - b,
    '×': (a, b) => a * b, 'times': (a, b) => a * b, '÷': (a, b) => a / b, 'divided by': (a, b) => a / b };
  const num = t => +String(t).replace(/,/g, '');
  const calc = t => { const m = String(t).trim().match(/^([\d,]+) (\+|minus|−|-|×|times|÷|divided by) ([\d,]+)$/); return m ? OPS[m[2]](num(m[1]), num(m[3])) : null; };
  // the answer text for a sum: "3 R2" for a division that leaves a remainder
  const answerOf = t => { const m = String(t).trim().match(/^([\d,]+) (?:÷|divided by) ([\d,]+)$/); if (!m) return String(calc(t)); const a = num(m[1]), b = num(m[2]); return a % b ? Math.floor(a / b) + ' R' + (a % b) : String(a / b); };
  const same = (text, t) => String(text).replace(/,/g, '') === answerOf(t);
  let sums = 0;
  qs.forEach(q => {
    const Q = `${P} ${q.id}`, optText = id => (q.options.find(o => o.id === id) || {}).text;
    let m;
    if (q.type === 'multiple_choice' && (m = q.prompt.match(/^What is (.+)\?$/)) && calc(m[1]) !== null) {
      sums++;
      q.options.forEach(o => { if (same(o.text, m[1]) !== (o.id === q.correctAnswer)) err(`${Q}: ${m[1]} = ${answerOf(m[1])}, key says ${optText(q.correctAnswer)}`); });
    }
    if (q.type === 'true_false_sentence' && (m = q.prompt.match(/^(.+) = ([\d,]+)\.?$/)) && calc(m[1]) !== null) {
      sums++;
      if ((calc(m[1]) === num(m[2])) !== (q.correctAnswer === 'T')) err(`${Q}: ${q.prompt} is ${calc(m[1]) === num(m[2])}, key says ${q.correctAnswer}`);
    }
    if (q.type === 'matching' && q.items.every(i => calc(i.text) !== null)) {
      sums++;
      q.items.forEach(i => { if (!same(optText(q.correctAnswers[i.id]), i.text)) err(`${Q}: ${i.text} = ${answerOf(i.text)}, key says ${optText(q.correctAnswers[i.id])}`); });
    }
    if (q.type === 'choose_two' && (m = q.prompt.match(/(?:make|equal to) ([\d,]+)/)) && q.options.every(o => calc(o.text) !== null)) {
      sums++;
      q.options.forEach(o => { if ((calc(o.text) === num(m[1])) !== q.correctAnswers.includes(o.id)) err(`${Q}: ${o.text} = ${calc(o.text)} (want ${m[1]})`); });
    }
  });
  if (p.subject === 'math' && !sums) err(`${P}: a math pack with no sums the test can check`);
  const easy = qs.filter(q => q.difficulty === 'easy').length, med = qs.filter(q => q.difficulty === 'medium').length;
  if (easy < sizes.easy) err(`${P}: ${easy} easy questions, a round needs ${sizes.easy}`);
  if (med < sizes.medium) err(`${P}: ${med} medium questions, a round needs ${sizes.medium}`);
  // rounds: right size, no repeats, back-to-back rounds differ
  for (let s = 1; s <= 60; s++) ['easy', 'medium', 'mixed'].forEach(mode => {
    const r = L.pickSession(qs, mode, { rng: seeded(s), sizes });
    const want = Math.min(sizes[mode], mode === 'mixed' ? qs.length : qs.filter(q => q.difficulty === mode).length);
    if (r.length !== want) err(`${P} ${mode}#${s}: ${r.length} questions, want ${want}`);
    if (new Set(r.map(q => q.id)).size !== r.length) err(`${P} ${mode}#${s}: repeated question`);
    if (mode === 'mixed' && (!r.some(q => q.difficulty === 'easy') || !r.some(q => q.difficulty === 'medium'))) err(`${P} mixed#${s}: needs both kinds`);
  });
  const a = L.pickSession(qs, 'easy', { rng: seeded(1), sizes }).map(q => q.id);
  const b = L.pickSession(qs, 'easy', { rng: seeded(2), sizes, avoid: a }).map(q => q.id);
  if (easy >= 2 * sizes.easy && b.some(id => a.includes(id))) err(`${P}: a fresh round repeated the last one`);
  console.log(`pack ${p.id}: ${qs.length} questions (${easy} easy, ${med} medium), ${(p.topics || []).length} topics` + (sums ? `, ${sums} sums checked` : ''));
});

/* ---------- logic edge cases the kit relies on ---------- */
{
  const o = [{ id: 'A' }, { id: 'B' }];
  const small = [{ id: 'a', difficulty: 'easy', options: o }, { id: 'b', difficulty: 'easy', options: o }, { id: 'c', difficulty: 'medium', options: o }];
  const r = L.pickSession(small, 'mixed', { rng: seeded(3), sizes: { mixed: 8 } });
  if (r.length !== 3) err('mixed caps at the pool size');
  const onlyEasy = L.pickSession(small.slice(0, 2), 'mixed', { rng: seeded(3), sizes: { mixed: 2 } });
  if (onlyEasy.length !== 2) err('mixed with no medium questions still fills the round');
  if (L.scoreSession([{ correct: true, tries: 1 }, { correct: true, tries: 2 }]).points !== 1.5) err('retry = half a point');
}

/* ---------- pages that use the kit load it in order ---------- */
[['quiz/index.html', ['js/quizkit/logic.js', 'js/quizkit/quizkit.js', 'js/packs.js', 'js/app.js']],
 ['adventurepack/stickerquest/index.html', ['js/quizkit/logic.js', 'src/unit2Logic.js', 'js/quizkit/quizkit.js', 'src/unit2.js']]].forEach(([f, order]) => {
  const h = fs.readFileSync(path.join(ROOT, f), 'utf8');
  const at = order.map(s => h.indexOf(s + '"></script>'));
  if (at.some(i => i < 0) || at.some((i, k) => k && i < at[k - 1])) err(`${f}: scripts must load in order ${order.join(' → ')}`);
  if (!h.includes('js/quizkit/quizkit.css')) err(`${f}: missing quizkit.css`);
});

console.log(fail ? `${fail} failure(s)` : 'phase4 quiz kit: all checks passed');
process.exit(fail ? 1 : 0);
