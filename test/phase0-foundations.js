// Phase 0: PreK–5 grades, the subject catalog and grown-up settings.
// Run: node test/phase0-foundations.js
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
let fail = 0; const err = m => { console.log('FAIL: ' + m); fail++; };

// A fake browser with its own localStorage, so tests never touch real data.
function browser(seed = {}){
  const data = Object.assign({}, seed);
  const localStorage = { getItem: k => k in data ? data[k] : null, setItem: (k, v) => { data[k] = String(v); },
    removeItem: k => { delete data[k]; }, key: i => Object.keys(data)[i], get length(){ return Object.keys(data).length; } };
  const ctx = vm.createContext({ localStorage, JSON, Date, Math, console });
  ctx.window = ctx; ctx.globalThis = ctx;
  return { ctx, data, load: f => vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), ctx, { filename: f }) };
}

/* ---------- grades ---------- */
{
  const b = browser({ hub_kids: JSON.stringify([{ id: 'old1', name: 'Ava', avatar: '🦄', grade: 'kg', created: 1 }, { id: 'old2', name: 'Sam', avatar: '🦊', grade: 'g3', created: 2 }]) });
  b.load('js/kidsdb.js');
  const DB = b.ctx.KidsDB;
  const want = ['pk', 'kg', 'g1', 'g2', 'g3', 'g4', 'g5'];
  if (DB.GRADE_ORDER.join() !== want.join()) err('GRADE_ORDER should be ' + want);
  DB.GRADE_ORDER.forEach((c, i) => {
    const g = DB.GRADES[c];
    if (!g) return err('missing grade ' + c);
    if (g.code !== c || g.n !== i - 1) err(`${c}: code/n wrong`);
    ['label', 'short', 'emoji', 'color'].forEach(k => { if (!g[k]) err(`${c}: missing ${k}`); });
    if (!['kg', 'g3'].includes(g.band)) err(`${c}: band ${g.band} is not an app level`);
    if (!['kinder', 'elementary'].includes(g.cat)) err(`${c}: bad Hub section ${g.cat}`);
    if (DB.band(c) !== g.band) err(`band(${c})`);
  });
  // The two grades every app already knows must not change.
  if (DB.GRADES.kg.cat !== 'kinder' || DB.GRADES.kg.label !== 'Kindergartener' || DB.band('kg') !== 'kg') err('kg changed');
  if (DB.GRADES.g3.cat !== 'elementary' || DB.GRADES.g3.label !== '3rd Grader' || DB.band('g3') !== 'g3') err('g3 changed');
  if (DB.band('zz') !== 'kg') err('an unknown grade should fall back to kg');
  // Existing learners keep their grade; new grades save as-is; junk falls back to kg.
  if (DB.kids().map(k => k.grade).join() !== 'kg,g3') err('existing learners changed');
  const p = DB.addKid('Mia', '🐼', 'g4', { activate: false }), q = DB.addKid('Lee', '🐸', 'pk', { activate: false }), r = DB.addKid('Zed', '🐙', 'g9', { activate: false });
  if (p.grade !== 'g4' || q.grade !== 'pk' || r.grade !== 'kg') err(`addKid grades: ${p.grade} ${q.grade} ${r.grade}`);
  if (DB.updateKid(p.id, { grade: 'g5' }).grade !== 'g5') err('updateKid to g5');
  if (DB.kids().length !== 5 || DB.kids()[0].name !== 'Ava') err('profiles lost');
}

/* ---------- apps that pick a level from the login ---------- */
{
  const arabic = fs.readFileSync(path.join(ROOT, 'arabic/js/app.js'), 'utf8');
  const ra = fs.readFileSync(path.join(ROOT, 'adventurepack/readingadventures/index.html'), 'utf8');
  ['pk', 'g1', 'g2', 'g4', 'g5'].forEach(c => {
    if (!new RegExp(`\\b${c}: "(kg|g3)"`).test(arabic)) err(`Arabic Oasis has no path for ${c}`);
    if (!new RegExp(`\\b${c}:'(kinder|grade3)'`).test(ra)) err(`Reading Adventures (built) has no book set for ${c}`);
  });
}

/* ---------- catalog ---------- */
{
  const b = browser(); b.load('js/catalog.js');
  const C = b.ctx.Catalog, subjects = C.SUBJECTS.map(s => s.id), sections = C.SECTIONS.map(s => s.id);
  const langs = C.subject('language').langs.map(l => l.id);
  const grades = ['pk', 'kg', 'g1', 'g2', 'g3', 'g4', 'g5'];
  ['science', 'math', 'social', 'language'].forEach(s => { if (!subjects.includes(s)) err('missing subject ' + s); });
  ['english', 'tamil', 'arabic'].forEach(l => { if (!langs.includes(l)) err('missing language ' + l); });
  const ids = new Set();
  C.ITEMS.forEach(it => {
    if (ids.has(it.id)) err('duplicate catalog id ' + it.id); ids.add(it.id);
    if (!subjects.includes(it.subject)) err(`${it.id}: unknown subject ${it.subject}`);
    if (!sections.includes(it.section)) err(`${it.id}: unknown section ${it.section}`);
    if (!it.grades.length || it.grades.some(g => !grades.includes(g))) err(`${it.id}: bad grades ${it.grades}`);
    if ((it.subject === 'language') !== !!it.lang) err(`${it.id}: lang must be set for language items only`);
    if (it.lang && !langs.includes(it.lang)) err(`${it.id}: unknown language ${it.lang}`);
    if (!it.title || !it.icon || !it.app) err(`${it.id}: missing title/icon/app`);
    const file = it.href.split('#')[0];
    if (!fs.existsSync(path.join(ROOT, file))) err(`${it.id}: ${file} does not exist`);
  });
  // Deep links must be ones the app actually handles.
  const hashes = { '#science': 'adventurepack/readingadventures/index.html', '#unit2': 'adventurepack/stickerquest/index.html',
    '#ch1': 'adventurepack/piratemath/js/app.js', '#ch2': 'adventurepack/piratemath/js/app.js' };
  C.ITEMS.filter(it => it.href.includes('#')).forEach(it => {
    const h = '#' + it.href.split('#')[1], src = hashes[h];
    if (!src) return err(`${it.id}: no known handler for ${h}`);
    if (!fs.readFileSync(path.join(ROOT, src), 'utf8').includes(h.slice(1))) err(`${it.id}: ${src} never reads ${h}`);
  });
  // Every app on today's Hub is somewhere in the catalog.
  const hub = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const hubApps = new Set([...hub.matchAll(/data-app="([^"]+)"/g)].map(m => m[1]));
  hubApps.forEach(a => { if (!C.ITEMS.some(it => it.app === a)) err(`Hub app ${a} is missing from the catalog`); });
  // Every subject except Tamil (Phase 5) has something for KG and 3rd grade.
  ['science', 'math', 'language'].forEach(s => ['kg', 'g3'].forEach(g => { if (!C.forGrade(g, s).length) err(`nothing for ${s} ${g}`); }));
  if (!C.forGrade('g3', 'social').length) err('nothing for social studies g3');
  if (C.forGrade('g3', 'language', 'arabic').length !== 1) err('forGrade language+arabic filter');
  console.log(`catalog: ${C.ITEMS.length} activities from ${hubApps.size} Hub apps`);
}

/* ---------- settings ---------- */
{
  const b = browser(); b.load('js/settings.js');
  const S = b.ctx.HubSettings;
  const s = S.get();
  if (!s.money.enabled || s.money.currency !== 'USD') err('defaults: money on, USD');
  if (s.money.levels.map(l => l.id).join() !== 'small,big,huge') err('three levels small/big/huge');
  const txt = (lv, kid) => S.amount(lv, kid).text;
  if ([txt('small'), txt('big'), txt('huge')].join() !== '$0.25,$1,$5') err('USD amounts ' + [txt('small'), txt('big'), txt('huge')]);
  if (b.data.hub_settings !== undefined) err('reading settings must not write anything');
  S.set({ money: { currency: 'INR' } });
  if ([txt('small'), txt('big'), txt('huge')].join() !== '₹25,₹100,₹500') err('INR amounts ' + [txt('small'), txt('big'), txt('huge')]);
  if (JSON.parse(b.data.hub_settings).money.levels) err('set() should save only what changed');
  // Per-learner: own currency and own on/off; the device switch beats everyone.
  S.set({ money: { perKid: { kA: { currency: 'USD' }, kB: { enabled: false } } } });
  if (S.moneyFor('kA').currency !== 'USD' || S.moneyFor('kC').currency !== 'INR') err('per-learner currency');
  if (S.moneyFor('kB').enabled || !S.moneyFor('kA').enabled) err('per-learner on/off');
  S.set({ money: { enabled: false } });
  if (S.moneyFor('kA').enabled) err('device switch off should turn money off for everyone');
  if (S.get().money.perKid.kA.currency !== 'USD') err('perKid lost when another setting changed');
  // Gifts stay virtual even if a saved value says otherwise; bad data falls back to defaults.
  S.set({ gifts: { virtualOnly: false } });
  if (S.get().gifts.virtualOnly !== true) err('gifts must stay virtual only');
  b.data.hub_settings = '{not json';
  if (S.get().money.currency !== 'USD' || !S.get().money.enabled) err('broken saved settings should fall back to defaults');
  b.data.hub_settings = JSON.stringify({ money: { currency: 'EUR' } });
  if (S.get().money.currency !== 'USD') err('unknown currency should fall back to USD');
  if (S.amount('nope') !== null) err('unknown level should be null');
  S.reset();
  if (b.data.hub_settings !== undefined) err('reset should clear the saved settings');
}

console.log(fail ? `${fail} FAILED` : 'ALL OK');
process.exit(fail ? 1 : 0);
