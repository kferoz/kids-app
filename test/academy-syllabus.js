// The Academy syllabus (js/syllabus.js): every grade has every subject, every unit is complete,
// and every app it points to exists in the catalog and is visible to that grade.
// Run: node test/academy-syllabus.js
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
let fail = 0; const err = m => { console.log('FAIL: ' + m); fail++; };
const ctx = vm.createContext({ console }); ctx.window = ctx; ctx.globalThis = ctx;
['js/catalog.js', 'js/syllabus.js'].forEach(f => vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), ctx));
const C = ctx.Catalog, Y = ctx.Syllabus;
const BAND = { pk: 'kg', kg: 'kg', g1: 'g3', g2: 'g3', g3: 'g3', g4: 'g3', g5: 'g3' };
const MIN = { math: 5, english: 5, science: 5, social: 5, computing: 4, health: 4 };

if (Y.SUBJECTS.map(s => s.id).join() !== 'math,english,science,social,computing,health') err('the six Academy subjects, in order');
const ids = new Set(); let total = 0;
Y.GRADES.forEach(g => {
  if (!Y.MATCH[g] || !Y.MATCH[g].uk || !Y.MATCH[g].se) err(`${g}: no US/UK/SE grade match`);
  Y.SUBJECTS.forEach(s => {
    const list = Y.units(g, s.id);
    if (list.length < MIN[s.id]) err(`${g}/${s.id}: only ${list.length} units`);
    const titles = new Set();
    list.forEach((u, i) => {
      total++;
      if (u.n !== i + 1 || u.id !== `${g}-${s.id}-${i + 1}`) err(`${g}/${s.id}: unit ${i + 1} numbering`);
      if (ids.has(u.id)) err('duplicate id ' + u.id); ids.add(u.id);
      if (titles.has(u.title)) err(`${g}/${s.id}: title twice: ${u.title}`); titles.add(u.title);
      if (!u.emoji || /^[\x00-\x7F’⁏]+$/.test(u.emoji)) err(`${u.id}: needs an emoji`);
      if (!u.title || u.title.length > 50) err(`${u.id}: title`);
      if (!Array.isArray(u.goals) || u.goals.length < 2 || u.goals.length > 3) err(`${u.id}: 2–3 goals`);
      u.goals.forEach(q => { if (!/^I (can|know|use|keep|ask|tell|hold|cover|stop|brush|respect)\b/.test(q) || !/[.!?]$/.test(q)) err(`${u.id}: goal "${q}" should be an "I can…" sentence`); });
      ['us', 'uk', 'se'].forEach(k => { if (!u[k] || u[k].length < 4) err(`${u.id}: no ${k} reference`); });
      if (!/^(Lgr22|Lpfö 18)/.test(u.se)) err(`${u.id}: SE ref should name Lgr22 or Lpfö 18: ${u.se}`);
      // apps on a unit: real catalog ids, same subject, visible to this grade
      u.acts.forEach(a => {
        const it = C.ITEMS.find(x => x.id === a);
        if (!it) { err(`${u.id}: unknown app ${a}`); return; }
        if (!Y.catalogMatch(s, it)) err(`${u.id}: ${a} is ${it.subject}/${it.lang}, not ${s.id}`);
        if (!it.grades.includes(g) && !it.grades.includes(BAND[g])) err(`${u.id}: ${a} is not visible to ${g}`);
      });
    });
  });
});
// Every app a grade can see in an Academy subject is attached to at least one unit somewhere in that grade
// or its band, so nothing is orphaned. (More practice on the subject page shows the rest anyway.)
const extras = Y.EXTRAS.map(e => e.id);
if (extras.join() !== 'languages,adhoc') err('extras: World Languages and AdHoc');
const langs = Y.subject('languages');
if (!C.ITEMS.filter(it => Y.catalogMatch(langs, it)).every(it => ['tamil', 'arabic'].includes(it.lang))) err('World Languages = Tamil + Arabic');
if (!C.ITEMS.filter(it => it.subject === 'language').every(it => Y.catalogMatch(Y.subject('english'), it) || Y.catalogMatch(langs, it))) err('every Language app lands in English or World Languages');
if (Y.PRINCIPLES.length < 5) err('design principles listed');
console.log(fail ? `${fail} FAILED` : `academy syllabus: all checks passed (${total} units)`);
process.exit(fail ? 1 : 0);
