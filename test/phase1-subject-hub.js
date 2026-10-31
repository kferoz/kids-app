// Phase 1: the subject Hub reads js/catalog.js for the learner's grade.
// Run: node test/phase1-subject-hub.js
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
let fail = 0; const err = m => { console.log('FAIL: ' + m); fail++; };

const ctx = vm.createContext({ console }); ctx.window = ctx; ctx.globalThis = ctx;
vm.runInContext(fs.readFileSync(path.join(ROOT, 'js/catalog.js'), 'utf8'), ctx);
const C = ctx.Catalog;
const BAND = { pk: 'kg', kg: 'kg', g1: 'g3', g2: 'g3', g3: 'g3', g4: 'g3', g5: 'g3' };
const hub = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

if (typeof C.forLearner !== 'function') err('Catalog.forLearner missing');
if (!/<script src="js\/catalog\.js"><\/script>[\s\S]*<script src="js\/hub\.js">/.test(hub)) err('index.html must load catalog.js before hub.js');
['id="viewBar"', 'id="subjectHub"', 'id="allApps"'].forEach(id => { if (!hub.includes(id)) err('index.html missing ' + id); });

Object.keys(BAND).forEach(g => {
  const all = C.forLearner(g, BAND[g]);
  // Every learner has Math, English and the Fun Zone; nobody gets an empty Hub.
  ['math', 'fun'].forEach(s => { if (!C.forLearner(g, BAND[g], s).length) err(`${g}: no ${s}`); });
  if (!C.forLearner(g, BAND[g], 'language', 'english').length) err(`${g}: no English`);
  // Only own grade or band: a KG learner never sees 3rd-grade-only work and the reverse.
  all.forEach(it => { if (!it.grades.includes(g) && !it.grades.includes(BAND[g])) err(`${g}: ${it.id} is for ${it.grades}`); });
  // One subject page never shows the same link twice in one section.
  C.SUBJECTS.forEach(s => {
    const seen = new Set();
    all.filter(it => it.subject === s.id).forEach(it => {
      const k = it.section + ' ' + it.href + ' ' + it.lang;
      if (seen.has(k)) err(`${g}/${s.id}: ${it.href} twice in ${it.section}`); seen.add(k);
    });
  });
  // Every item has a tile on the Hub to borrow colours and a tip from.
  all.forEach(it => { if (!hub.includes(`data-app="${it.app}"`)) err(`${it.id}: no Hub tile for ${it.app}`); });
});
// Grade-specific twins pick the right one.
const ids = (g, s, l) => C.forLearner(g, BAND[g], s, l).map(it => it.id);
if (!ids('kg', 'math').includes('homeschool-kg-math') || ids('kg', 'math').includes('homeschool-g3-math')) err('kg homeschool twin');
if (!ids('g5', 'math').includes('homeschool-g3-math') || ids('g5', 'math').includes('homeschool-kg-math')) err('g5 homeschool twin');
if (!ids('pk', 'language', 'arabic').includes('arabic-kg')) err('pk Arabic');
if (!ids('kg', 'social').includes('quiz-helpers') || !ids('pk', 'social').includes('quiz-helpers')) err('Pre-K/KG Social Studies: Community Helpers');
if (ids('g3', 'social').includes('quiz-helpers')) err('Community Helpers is for Pre-K/KG only');
if (!ids('g1', 'math').includes('quiz-numbers') || !ids('g2', 'math').includes('quiz-numbers') || ids('g3', 'math').includes('quiz-numbers') || ids('kg', 'math').includes('quiz-numbers')) err('Number Fun is for grades 1–2 only');
if (!ids('g1', 'science').includes('quiz-living') || !ids('g2', 'science').includes('quiz-living') || ids('g3', 'science').includes('quiz-living') || ids('kg', 'science').includes('quiz-living')) err('Plants & Animals is for grades 1–2 only');
if (!ids('g1', 'language', 'english').includes('quiz-words') || !ids('g2', 'language', 'english').includes('quiz-words') || ids('g3', 'language', 'english').includes('quiz-words') || ids('kg', 'language', 'english').includes('quiz-words')) err('Word Wizards is for grades 1–2 only');
if (!ids('g4', 'math').includes('quiz-mathlab') || !ids('g5', 'math').includes('quiz-mathlab') || ids('g3', 'math').includes('quiz-mathlab') || !ids('g5', 'math').includes('multiply')) err('Math Lab is for grades 4–5, who still see the G3 band');
if (!C.forLearner('g3', 'g3', 'language', 'tamil').length || !C.forLearner('pk', 'kg', 'language', 'tamil').length) err('Tamil Starter for every grade');

console.log(fail ? `${fail} failure(s)` : 'phase1 subject hub: all checks passed');
process.exit(fail ? 1 : 0);
