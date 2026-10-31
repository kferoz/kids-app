// Class Corner data rules (classroom/js/classstore.js), in a fake browser.
// Run: node test/classroom-store.js
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
let fail = 0; const err = m => { console.log('FAIL: ' + m); fail++; };
const throws = (f, m) => { try { f(); err(m + ' (no error)'); } catch (e) {} };

function browser(seed = {}) {
  const data = Object.assign({}, seed), b = { data, full: false };
  const localStorage = { getItem: k => k in data ? data[k] : null,
    setItem: (k, v) => { if (b.full) throw new Error('QuotaExceededError'); data[k] = String(v); },
    removeItem: k => { delete data[k]; }, key: i => Object.keys(data)[i], get length() { return Object.keys(data).length; } };
  const ctx = vm.createContext({ localStorage, JSON, Date, Math, console });
  ctx.window = ctx; ctx.globalThis = ctx;
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'classroom/js/classstore.js'), 'utf8'), ctx);
  b.S = ctx.ClassStore; return b;
}

const { S, data } = browser();
const c = S.addClass('  Room 12  ');
if (c.name !== 'Room 12') err('class name is trimmed');
if (S.skills(c.id, 'pos').length !== 6 || S.skills(c.id, 'neg').length !== 4) err('default skills: 6 positive, 4 needs work');
if (S.skills(c.id, 'neg').some(k => k.value >= 0) || S.skills(c.id, 'pos').some(k => k.value <= 0)) err('skill signs');
throws(() => S.addClass('   '), 'a class with no name');

const added = S.addStudents(c.id, ['Ava', 'ben', ' ', 'Ava', 'Cy', 'Dee']);
if (added.length !== 4) err('addStudents skips blanks and repeats: ' + added.length);
if (S.addStudents(c.id, ['AVA']).length !== 0) err('names match without case');
const [ava, ben, cy, dee] = S.students(c.id);
if (!ava.avatar || ava.avatar === ben.avatar) err('each student gets a critter');

const kind = S.skills(c.id, 'pos').find(k => k.name === 'Kindness'), off = S.skills(c.id, 'neg').find(k => k.name === 'Off task');
const r1 = S.award(c.id, [ava.id], kind.id);
if (!r1.saved || r1.tx.length !== 1 || r1.tx[0].v !== 1 || r1.tx[0].g) err('single award');
S.award(c.id, [ava.id, ben.id, ben.id], kind.id, { whole: false });
if (S.totals(c.id)[ava.id] !== 2 || S.totals(c.id)[ben.id] !== 1) err('group award counts each student once: ' + JSON.stringify(S.totals(c.id)));
S.award(c.id, [cy.id], off.id);
if (S.totals(c.id)[cy.id] !== -1) err('needs-work award subtracts');

// a bad request stores nothing
const before = JSON.parse(data.cc_data).tx.length;
throws(() => S.award(c.id, [ava.id, 'nobody'], kind.id), 'award to a student outside the class');
throws(() => S.award(c.id, [ava.id], 'k-none'), 'award with an unknown skill');
throws(() => S.award(c.id, [], kind.id), 'award to nobody');
throws(() => S.award('c-none', [ava.id], kind.id), 'award in an unknown class');
const other = S.addClass('Room 13'), [zed] = S.addStudents(other.id, ['Zed']);
throws(() => S.award(c.id, [zed.id], kind.id), "award to another class's student");
throws(() => S.award(c.id, [ava.id], S.skills(other.id)[0].id), "award with another class's skill");
if (JSON.parse(data.cc_data).tx.length !== before) err('a rejected award changed the records');

// values: 1–10, sign set by the skill type
if (S.updateSkill(c.id, kind.id, { value: 5 }).value !== 5) err('set a positive value');
if (S.updateSkill(c.id, off.id, { value: 3 }).value !== -3) err('a needs-work value is stored negative');
throws(() => S.updateSkill(c.id, kind.id, { value: 11 }), 'value over 10');
throws(() => S.updateSkill(c.id, kind.id, { value: 0 }), 'value 0');
const team = S.addSkill(c.id, { emoji: '🧹', name: 'Clean up', type: 'pos', value: -4 });
if (team.value !== 4) err('a positive skill is stored positive');

// summary for today
S.award(c.id, [dee.id], kind.id);              // +5
let sm = S.summary(c.id);
if (sm.plus !== 1 + 2 + 5 || sm.minus !== -1 || sm.active !== 4 || sm.none !== 0 || sm.roster !== 4) err('summary today: ' + JSON.stringify(sm));
if (S.summary(c.id, Date.now() + 86400000).active !== 0) err('tomorrow starts at zero');

// undo marks, never deletes
const last = S.lastBatch(c.id);
if (S.undo(c.id, last) !== 1 || S.totals(c.id)[dee.id]) err('undo the last award');
if (S.undo(c.id, last) !== 0) err('undo twice does nothing');
if (!JSON.parse(data.cc_data).tx.some(r => r.b === last && r.u)) err('an undone award stays in the records');
if (S.lastBatch(c.id) === last) err('lastBatch skips undone awards');

// archive keeps history
S.archiveStudent(c.id, cy.id);
if (S.students(c.id).length !== 3 || S.students(c.id, true).length !== 4) err('archived student leaves the board only');
throws(() => S.award(c.id, [cy.id], kind.id), 'award to an archived student');
if (S.totals(c.id)[cy.id] !== -1) err("an archived student's points stay");
S.archiveSkill(c.id, off.id);
throws(() => S.award(c.id, [ava.id], off.id), 'award with an archived skill');
if (S.skills(c.id, 'neg').length !== 3) err('archived skill leaves the list');

// audit log
const log = S.auditLog(c.id, 500).map(e => e.a);
['class_add', 'student_add', 'award', 'skill_edit', 'skill_add', 'undo', 'student_archive', 'skill_archive'].forEach(a => { if (!log.includes(a)) err('audit has no ' + a); });
if (S.auditLog(other.id).some(e => e.d.c !== other.id)) err("one class's log shows another class");

// saved and reloaded the same
const again = browser({ cc_data: data.cc_data }).S;
if (JSON.stringify(again.totals(c.id)) !== JSON.stringify(S.totals(c.id))) err('reload keeps totals');

// unreadable data is parked, never lost
const bad = browser({ cc_data: '{not json' });
if (bad.S.classes().length !== 0) err('unreadable data starts empty');
if (!Object.keys(bad.data).some(k => k.startsWith('cc_data_unreadable_') && bad.data[k] === '{not json')) err('unreadable data is kept aside');

// a full device reports saved:false instead of throwing
{ const f = browser(); const fc = f.S.addClass('Full'); const [kim] = f.S.addStudents(fc.id, ['Kim']);
  f.full = true;
  const r = f.S.award(fc.id, [kim.id], f.S.skills(fc.id, 'pos')[0].id);
  if (r.saved !== false) err('award on a full device should say saved:false'); }

console.log(fail ? `${fail} FAILED` : 'classroom store: all checks passed');
process.exit(fail ? 1 : 0);
