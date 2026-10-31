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

/* ---------- Phase 2: attendance ---------- */
{ const b = browser(); const A = b.S; const ac = A.addClass('Att');
  const [s1, s2, s3, s4] = A.addStudents(ac.id, ['Amy', 'Bo', 'Cal', 'Dot']);
  const today = A.dayKey(Date.now()), yest = A.dayKey(Date.now() - 86400000), tomorrow = A.dayKey(Date.now() + 86400000);
  if (A.inRoom(ac.id).length !== 4) err('before attendance, everyone is in the room');
  A.setAttendance(ac.id, today, s1.id, 'p'); A.setAttendance(ac.id, today, s2.id, 'a'); A.setAttendance(ac.id, today, s3.id, 't');
  let sm = A.attendanceSummary(ac.id, today);
  if (sm.p !== 1 || sm.a !== 1 || sm.t !== 1 || sm.l !== 0 || sm.none !== 1 || sm.roster !== 4) err('attendance summary: ' + JSON.stringify(sm));
  if (A.inRoom(ac.id).map(s => s.name).join() !== 'Amy,Cal') err('in the room = present or tardy once attendance is taken');
  if (A.markRestPresent(ac.id, today) !== 1 || A.attendance(ac.id, today)[s4.id] !== 'p') err('mark the rest present');
  if (A.markRestPresent(ac.id, today) !== 0) err('mark the rest twice does nothing');
  if (A.setAttendance(ac.id, today, s1.id, 'p').changed) err('same mark is not a change');
  A.setAttendance(ac.id, today, s1.id, 'l');
  if (A.attendance(ac.id, today)[s1.id] !== 'l') err('change a mark');
  A.setAttendance(ac.id, today, s1.id, '');
  if (s1.id in A.attendance(ac.id, today)) err('clear a mark');
  throws(() => A.setAttendance(ac.id, tomorrow, s1.id, 'p'), 'attendance for a future day');
  throws(() => A.setAttendance(ac.id, 'soon', s1.id, 'p'), 'attendance with a bad date');
  throws(() => A.setAttendance(ac.id, today, s1.id, 'x'), 'an unknown mark');
  throws(() => A.setAttendance(ac.id, today, 'nobody', 'p'), 'attendance for a student outside the class');
  A.setAttendance(ac.id, yest, s2.id, 'p');
  const days = A.attendanceDays(ac.id);
  if (days.length !== 2 || days[0].day !== today || days[1].day !== yest || days[1].p !== 1) err('attendance history newest first: ' + JSON.stringify(days));
  if (A.inRoom(ac.id, yest).length !== 1) err('in the room on another day');
  const log = A.auditLog(ac.id, 500).map(e => e.a);
  if (!log.includes('attendance') || !log.includes('attendance_rest')) err('attendance is audited');
  const again = browser({ cc_data: b.data.cc_data }).S;
  if (JSON.stringify(again.attendance(ac.id, today)) !== JSON.stringify(A.attendance(ac.id, today))) err('attendance survives reload');
  // Phase 1 data (no att field) still loads
  const old = JSON.parse(b.data.cc_data); delete old.att;
  const o = browser({ cc_data: JSON.stringify(old) }).S;
  if (Object.keys(o.attendance(ac.id, today)).length !== 0) err('old data without attendance loads empty');
}

/* ---------- Phase 2: toolkit maths ---------- */
{ const T = require(path.join(ROOT, 'classroom/js/tools.js'));
  let seed = 3; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const ids = [...Array(25).keys()];
  const sh = T.shuffle(ids, rnd);
  if (sh.length !== 25 || [...sh].sort((a, b) => a - b).join() !== ids.join() || sh.join() === ids.join()) err('shuffle keeps everyone, changes the order');
  for (const [n, size, want] of [[7, 3, '3,2,2'], [3, 2, '3'], [5, 2, '3,2'], [24, 4, '4,4,4,4,4,4'], [1, 3, '1'], [10, 3, '3,3,2,2']]) {
    const g = T.makeGroups([...Array(n).keys()], size, rnd), got = g.map(x => x.length).join();
    if (got !== want) err(`${n} students in groups of ${size}: ${got}, want ${want}`);
    if (g.flat().length !== n || new Set(g.flat()).size !== n) err(`groups of ${size} lose or repeat someone`);
  }
  if (T.makeGroups([], 3).length !== 0) err('no students, no groups');
  if (T.level(new Float32Array(512)) !== 0) err('silence is level 0');
  if (T.level(new Float32Array(512).fill(1)) !== 100) err('full scale is level 100');
  const mid = T.level(new Float32Array(512).fill(0.03162));   // -30 dB
  if (mid !== 50) err('-30 dB is level 50, got ' + mid);
  if (T.level([]) !== 0) err('no samples, level 0');
}

/* ---------- Phase 3: portfolio + approvals ---------- */
{ const b = browser(); const P = b.S; const pc = P.addClass('Art'); const [ana, bob] = P.addStudents(pc.id, ['Ana', 'Bob']);
  const j = P.submit(pc.id, ana.id, { type: 'journal', text: '  I saw a rainbow today.  ' }).item;
  if (j.st !== 'pending' || j.text !== 'I saw a rainbow today.' || j.media) err('a journal entry is saved pending, trimmed');
  const d = P.submit(pc.id, bob.id, { type: 'drawing', media: 'm1', text: 'My cat' }).item;
  if (d.media !== 'm1' || d.text !== 'My cat') err('a drawing keeps its media id and caption');
  if (P.submit(pc.id, ana.id, { type: 'journal', text: 'x', media: 'm9' }).item.media) err('a journal never keeps a media id');
  throws(() => P.submit(pc.id, ana.id, { type: 'journal', text: '   ' }), 'an empty journal');
  throws(() => P.submit(pc.id, ana.id, { type: 'photo' }), 'a photo with no picture');
  throws(() => P.submit(pc.id, ana.id, { type: 'drawing' }), 'a drawing with no picture');
  throws(() => P.submit(pc.id, ana.id, { type: 'video', media: 'm' }), 'an unknown kind of work');
  throws(() => P.submit(pc.id, ana.id, { type: 'journal', text: 'a'.repeat(P.MAX_TEXT + 1) }), 'a journal over the limit');
  throws(() => P.submit(pc.id, ana.id, { type: 'photo', media: 'm', text: 'a'.repeat(P.MAX_NOTE + 1) }), 'a caption over the limit');
  throws(() => P.submit(pc.id, 'nobody', { type: 'journal', text: 'hi' }), 'work from a student outside the class');
  if (P.pendingCount(pc.id) !== 3) err('3 pending');
  // review
  throws(() => P.review(pc.id, j.i, 'send_back', '  '), 'send back without a note');
  throws(() => P.review(pc.id, j.i, 'delete'), 'an unknown review action');
  const other = P.addClass('Other');
  throws(() => P.review(other.id, j.i, 'approve'), "review from another class");
  P.review(pc.id, j.i, 'approve');
  if (j.st !== 'approved' || !j.rt) err('approve');
  throws(() => P.review(pc.id, j.i, 'send_back', 'again'), 'review twice');
  P.review(pc.id, d.i, 'send_back', 'Add some colour please');
  if (d.st !== 'sent_back' || d.note !== 'Add some colour please') err('send back keeps the note');
  if (P.pendingCount(pc.id) !== 1) err('1 pending after two reviews');
  if (P.work(pc.id, { st: 'approved' }).length !== 1 || P.work(pc.id, { s: bob.id }).length !== 1) err('filter by status and student');
  const all = P.work(pc.id); if (all.length !== 3 || all[0].t < all[2].t) err('work is newest first');
  // archived student: work stays, no new work
  P.archiveStudent(pc.id, bob.id);
  throws(() => P.submit(pc.id, bob.id, { type: 'journal', text: 'hi' }), 'work from an archived student');
  if (P.work(pc.id, { s: bob.id }).length !== 1) err("an archived student's work stays");
  const log = P.auditLog(pc.id, 500).map(e => e.a);
  ['submit', 'work_approve', 'work_send_back'].forEach(a => { if (!log.includes(a)) err('audit has no ' + a); });
  const again = browser({ cc_data: b.data.cc_data }).S;
  if (again.work(pc.id).length !== 3 || again.work(pc.id, { st: 'sent_back' })[0].note !== 'Add some colour please') err('work survives reload');
  const old = JSON.parse(b.data.cc_data); delete old.sub;
  if (browser({ cc_data: JSON.stringify(old) }).S.work(pc.id).length !== 0) err('older data without work loads empty');
}

/* ---------- Phase 4: class feed + private notes ---------- */
{ const b = browser(); const F = b.S; const fc = F.addClass('Room 3'); const [ana, bob, cal] = F.addStudents(fc.id, ['Ana', 'Bob', 'Cal']);
  throws(() => F.post(fc.id, { text: '   ' }), 'an empty post');
  throws(() => F.post(fc.id, { text: 'a'.repeat(F.MAX_POST + 1) }), 'a post over the limit');
  const p1 = F.post(fc.id, { text: '  Field trip on Friday!  ' }).item;
  if (p1.text !== 'Field trip on Friday!' || p1.media || Object.keys(p1.likes).length) err('a words-only post');
  const p2 = F.post(fc.id, { media: 'm5' }).item;
  if (p2.media !== 'm5' || p2.text !== '') err('a photo-only post');
  // sharing work: approved only, once
  const w = F.submit(fc.id, ana.id, { type: 'drawing', media: 'm7', text: 'Volcano' }).item;
  throws(() => F.shareWork(fc.id, w.i), 'sharing work that is still waiting');
  F.review(fc.id, w.i, 'approve');
  const p3 = F.shareWork(fc.id, w.i, ' Look at this! ').item;
  if (p3.w !== w.i || p3.s !== ana.id || p3.media !== 'm7' || p3.text !== 'Look at this!') err('shared work carries its student, picture and caption');
  throws(() => F.shareWork(fc.id, w.i), 'sharing the same work twice');
  if (F.sharedPost(fc.id, w.i) !== p3) err('sharedPost finds it');
  const sb = F.submit(fc.id, bob.id, { type: 'journal', text: 'hi' }).item; F.review(fc.id, sb.i, 'send_back', 'more please');
  throws(() => F.shareWork(fc.id, sb.i), 'sharing sent-back work');
  const other = F.addClass('Other');
  throws(() => F.shareWork(other.id, w.i), 'sharing work from another class');
  // likes
  if (!F.like(fc.id, p1.i, ana.id).liked || !F.like(fc.id, p1.i, bob.id).liked || !F.like(fc.id, p1.i, F.TEACHER).liked) err('likes turn on');
  if (Object.keys(p1.likes).length !== 3) err('three likes');
  if (F.like(fc.id, p1.i, ana.id).liked || p1.likes[ana.id]) err('a second tap takes the like back');
  throws(() => F.like(fc.id, p1.i, 'nobody'), 'a like from outside the class');
  throws(() => F.like(other.id, p1.i, ana.id), 'a like through another class');
  F.archiveStudent(fc.id, cal.id);
  throws(() => F.like(fc.id, p1.i, cal.id), 'a like from an archived student');
  // order + hiding
  const list = F.feed(fc.id); if (list.length !== 3 || list[0].t < list[2].t) err('feed is newest first');
  F.hidePost(fc.id, p3.i);
  if (F.feed(fc.id).length !== 2 || F.feed(fc.id, true).length !== 3) err('a hidden post leaves the feed but is kept');
  throws(() => F.like(fc.id, p3.i, ana.id), 'liking a hidden post');
  if (F.sharedPost(fc.id, w.i)) err('a hidden share no longer counts');
  F.shareWork(fc.id, w.i); if (F.feed(fc.id).length !== 3) err('work can be shared again after its post is hidden');
  // notes
  throws(() => F.addNote(fc.id, ana.id, 'gossip', 'x'), 'a note with an unknown kind');
  throws(() => F.addNote(fc.id, ana.id, 'praise', '  '), 'an empty note');
  throws(() => F.addNote(fc.id, 'nobody', 'praise', 'x'), 'a note about a student outside the class');
  throws(() => F.addNote(fc.id, ana.id, 'other', 'a'.repeat(F.MAX_NOTE_TEXT + 1)), 'a note over the limit');
  const n1 = F.addNote(fc.id, ana.id, 'praise', 'Helped Bob with fractions.').item;
  F.addNote(fc.id, bob.id, 'family', 'Called home about the trip.');
  F.addNote(fc.id, cal.id, 'other', 'Moved schools; records kept.');
  if (F.notes(fc.id).length !== 3 || F.notes(fc.id, { s: ana.id }).length !== 1 || F.notes(fc.id, { kind: 'family' }).length !== 1) err('notes filter by student and kind');
  F.hideNote(fc.id, n1.i);
  if (F.notes(fc.id, { s: ana.id }).length !== 0 || !b.data.cc_data.includes('Helped Bob')) err('a hidden note leaves the list but stays stored');
  throws(() => F.hideNote(other.id, n1.i), 'hiding a note through another class');
  const log = F.auditLog(fc.id, 500).map(e => e.a);
  ['post_add', 'post_share', 'post_hide', 'like', 'unlike', 'note_add', 'note_hide'].forEach(a => { if (!log.includes(a)) err('audit has no ' + a); });
  if (JSON.stringify(F.auditLog(fc.id, 500)).includes('Helped Bob')) err('the audit log never copies note text');
  const again = browser({ cc_data: b.data.cc_data }).S;
  if (again.feed(fc.id).length !== 3 || again.notes(fc.id).length !== 2 || Object.keys(again.feed(fc.id, true).find(p => p.i === p1.i).likes).length !== 2) err('feed, likes and notes survive reload');
  const old = JSON.parse(b.data.cc_data); delete old.feed; delete old.notes;
  const S3 = browser({ cc_data: JSON.stringify(old) }).S;
  if (S3.feed(fc.id).length !== 0 || S3.notes(fc.id).length !== 0 || S3.work(fc.id).length !== 2) err('Phase 3 data without feed/notes loads, work kept');
}

console.log(fail ? `${fail} FAILED` : 'classroom store: all checks passed');
process.exit(fail ? 1 : 0);
