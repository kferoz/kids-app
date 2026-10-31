// Academy lessons (academy/lessons/*.js): every file matches the syllabus, every lesson builds a Quiz Kit
// pack that can fill each practice mode, answers are well formed, and simple sums are re-computed.
// Run: node test/academy-lessons.js
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
let fail = 0; const err = m => { console.log('FAIL: ' + m); fail++; };
const ctx = vm.createContext({ console }); ctx.window = ctx; ctx.globalThis = ctx;
['js/syllabus.js', 'js/quizkit/logic.js', 'academy/js/lessons.js'].forEach(f => vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), ctx));
const Y = ctx.Syllabus, AL = ctx.AcademyLessons, QL = ctx.QuizLogic;
const dir = path.join(ROOT, 'academy/lessons');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));
const WORDS = { pk: 12, kg: 12, g1: 14, g2: 16, g3: 20, g4: 22, g5: 22 };
const EARLY = { pk: 1, kg: 1, g1: 1 };
const words = s => QL.plain(s).split(/\s+/).filter(Boolean).length;
let lessons = 0, questions = 0;
const sym = s => /[×÷]|\d\/\d/.test(s);
// "What is 7 × 8?" style prompts: the first (right) choice must equal the sum.
function recompute(q, u) {
  const m = /(\d[\d,]*)\s*([×÷+−-])\s*(\d[\d,]*)\s*\?$/.exec(q.prompt);
  if (!m || q.type !== 'multiple_choice' || !/^(What is|Work out)/.test(q.prompt)) return;
  const a = +m[1].replace(/,/g, ''), b = +m[3].replace(/,/g, '');
  const v = { '×': a * b, '÷': a / b, '+': a + b, '−': a - b, '-': a - b }[m[2]];
  const got = +String(q.options[0].text).replace(/,/g, '');
  if (got !== v) err(`${u.id} ${q.id}: "${q.prompt}" should be ${v}, answer says ${q.options[0].text}`);
}

files.forEach(f => {
  const key = f.replace(/\.js$/, ''), [g, s] = key.split('-');
  if (!Y.GRADES.includes(g) || !Y.SUBJECTS.some(x => x.id === s)) { err(`${f}: not a grade-subject file name`); return; }
  try { vm.runInContext(fs.readFileSync(path.join(dir, f), 'utf8'), ctx, { filename: f }); } catch (e) { err(`${f}: ${e.message}`); return; }
  const units = Y.units(g, s);
  AL.numbers(key).forEach(n => {
    const u = units[n - 1];
    if (!u) { err(`${key}: unit ${n} is not in the syllabus`); return; }
    let p; try { p = AL.build(u, AL.get(u.id)); } catch (e) { err(`${u.id}: ${e.message}`); return; }
    lessons++; questions += p.questions.length;
    const L = AL.get(u.id);
    if (!L.learn || !L.learn.length) err(`${u.id}: no learn cards`);
    (L.learn || []).forEach((c, i) => { if (c.length < 3 || !c[0] || !c[1] || !Array.isArray(c[2]) || c[2].length < 2) err(`${u.id}: learn card ${i + 1} needs title, art, 2+ facts`); });
    const easy = p.questions.filter(q => q.difficulty === 'easy').length, med = p.questions.length - easy;
    if (easy < 3 || med < 3) err(`${u.id}: needs 3+ easy and 3+ medium (has ${easy}/${med})`);
    const ids = new Set();
    p.questions.forEach(q => {
      if (ids.has(q.id)) err(`${q.id} twice`); ids.add(q.id);
      if (!q.prompt || !q.explanation) err(`${q.id}: prompt and explanation`);
      if (!q.picture) err(`${q.id}: picture`);
      if (words(q.prompt) > WORDS[g]) err(`${q.id}: ${words(q.prompt)} words (max ${WORDS[g]} for ${g}): ${q.prompt}`);
      const texts = (q.options || []).map(o => o.text);
      if (new Set(texts).size !== texts.length) err(`${q.id}: repeated choice`);
      if (q.type === 'multiple_choice' && texts.length < 2) err(`${q.id}: 2+ choices`);
      if (q.type === 'choose_two' && texts.length < 3) err(`${q.id}: choose two needs 3+ choices`);
      if (q.type === 'matching' && (q.items.length < 2 || q.items.length > 4)) err(`${q.id}: 2–4 pairs`);
      // early grades hear everything read aloud: symbols need a spoken version
      if (EARLY[g] && sym(q.prompt) && !(q.audioPrompt || (q.audioText && !sym(q.audioText.replace(/ True or false\?$/, ''))))) err(`${q.id}: ${g} prompt with a symbol needs a spoken version`);
      recompute(q, u);
    });
    ['easy', 'medium', 'mixed'].forEach(mode => {
      const sess = QL.pickSession(p.questions, mode, { rng: Math.random, avoid: [], sizes: p.sizes });
      if (!sess.length) err(`${u.id}: ${mode} round is empty`);
    });
  });
});
console.log(fail ? `${fail} FAILED` : `academy lessons: all checks passed (${files.length} files, ${lessons} lessons, ${questions} questions)`);
process.exit(fail ? 1 : 0);
