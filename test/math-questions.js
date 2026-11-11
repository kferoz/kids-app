// Chapter 5 multiplication engine: answers are right (checked by re-parsing the text, not by trusting
// the engine), false equations are really false, no repeats in a test, ranges and replayable seeds.
// Run: node test/math-questions.js
const path = require('path');
const M = require(path.join(__dirname, '../adventurepack/stickerquest/src/engine/mathQuestions.js'));

let fail = 0, checked = 0;
const err = m => { if (fail < 40) console.log('FAIL: ' + m); fail++; };
const num = s => Number(String(s).replace(/,/g, ''));
const N = '(\\d[\\d,]*)';
const UNIT = { ones: 1, tens: 10, hundreds: 100, thousands: 1000 };
const digits = n => String(n).length;
const isPlacePart = n => /^[1-9]0*$/.test(String(n));
const text = q => q.template.filter(t => typeof t === 'string').join('');

// Independent value of a "way" option.
function wayValue(t){
  t = t.replace(/(\d),(\d)/g, '$1$2');
  let m;
  if ((m = t.match(/^(\d+) × (\d+) × (\d+)$/))) return m[1] * m[2] * m[3];
  if ((m = t.match(/^(\d+) \+ (\d+)$/))) return +m[1] + +m[2];
  if ((m = t.match(/^(\d+) × (\d+) \+ (\d+)$/))) return m[1] * m[2] + +m[3];
  if ((m = t.match(/^(\d+) groups of (\d+) (ones|tens|hundreds|thousands)$/))) return m[1] * m[2] * UNIT[m[3]];
  if ((m = t.match(/^Find (\d+) × (\d+) = (\d+), then make it (\d+) (tens|hundreds|thousands)$/))){
    if (m[1] * m[2] !== +m[3] || m[3] !== m[4]) return NaN;   // the fact inside must be right
    return m[4] * UNIT[m[5]];
  }
  return NaN;
}

function verify(q, where){
  checked++;
  const tag = `${where} ${q.id}`;
  // shape
  for (const k of ['id', 'type', 'difficulty', 'prompt', 'hint', 'explanation', 'audioText', 'mathKey'])
    if (!q[k] || typeof q[k] !== 'string') err(`${tag}: missing ${k}`);
  if (!['easy', 'medium', 'hard'].includes(q.difficulty)) err(`${tag}: difficulty ${q.difficulty}`);
  if (!Array.isArray(q.steps) || q.steps.length < 2) err(`${tag}: needs step-by-step`);
  if (/[×=()+]/.test(q.audioText)) err(`${tag}: audioText has symbols: ${q.audioText}`);
  // no number above 9,999 anywhere a child sees or hears
  const shown = JSON.stringify(q, (k, v) => (k === 'svg' || k === 'id' || k === 'mathKey') ? undefined : v);
  (shown.match(/\d[\d,]*\d|\d/g) || []).forEach(s => { if (num(s) > M.MAX) err(`${tag}: number ${s} is above 9,999`); });

  if (q.answerKind === 'input'){
    if (!q.fields.length || q.fields.some(f => !q.template.some(t => t.field === f.id))) err(`${tag}: field not in template`);
    if (q.answer !== q.fields[q.fields.length - 1].answer) err(`${tag}: answer ≠ last field`);
    const right = Object.fromEntries(q.fields.map(f => [f.id, String(f.answer)]));
    if (!M.check(q, right)) err(`${tag}: check() rejects the right answers`);
    const comma = Object.fromEntries(q.fields.map(f => [f.id, M.format(f.answer)]));
    if (!M.check(q, comma)) err(`${tag}: check() rejects "1,200" style`);
    const off = Object.assign({}, right, {[q.fields[0].id]: String(q.fields[0].answer + 1)});
    if (M.check(q, off)) err(`${tag}: check() accepts a wrong answer`);
    if (M.check(q, {})) err(`${tag}: check() accepts blanks`);
  } else {
    if (!M.check(q, q.correctAnswers)) err(`${tag}: check() rejects the right picks`);
    if (M.check(q, q.correctAnswers.slice(1))) err(`${tag}: check() accepts too few picks`);
    const extra = q.options.map(o => o.id).find(id => !q.correctAnswers.includes(id));
    if (extra && M.check(q, q.correctAnswers.concat(extra))) err(`${tag}: check() accepts a wrong pick`);
  }

  if (q.type === 'single_multiply'){
    const m = text(q).match(new RegExp(`^${N} × ${N} = $`));
    if (!m) return err(`${tag}: can't read ${text(q)}`);
    const a = num(m[1]), b = num(m[2]);
    if (q.answer !== a * b) err(`${tag}: ${a} × ${b} ≠ ${q.answer}`);
    const ds = [digits(a), digits(b)].sort().join('');
    const ok = {easy: ['11', '12'], medium: ['13'], hard: ['22']}[q.difficulty];
    if (!ok.includes(ds)) err(`${tag}: ${a} × ${b} is the wrong size for ${q.difficulty}`);
  }

  if (q.type === 'true_false_equations'){
    if (q.options.length < 3 || q.options.length > 5) err(`${tag}: ${q.options.length} equations`);
    const truth = q.options.map(o => {
      const m = o.text.match(new RegExp(`^${N} × ${N} = ${N}$`));
      if (!m) { err(`${tag}: can't read ${o.text}`); return null; }
      const a = num(m[1]), b = num(m[2]), shown = num(m[3]), p = a * b;
      if (shown !== p){
        // false answers must be close: same length, exactly one digit changed
        const s1 = String(p), s2 = String(shown);
        const diff = [...s1].filter((c, i) => c !== s2[i]).length;
        if (s1.length !== s2.length || diff !== 1) err(`${tag}: ${o.text} is not a near miss of ${p}`);
      }
      return {id: o.id, isTrue: shown === p};
    }).filter(Boolean);
    const trueIds = truth.filter(t => t.isTrue).map(t => t.id).sort().join();
    if (trueIds !== q.correctAnswers.slice().sort().join()) err(`${tag}: key ${q.correctAnswers} but true ones are ${trueIds}`);
    if (!truth.some(t => t.isTrue) || !truth.some(t => !t.isTrue)) err(`${tag}: needs a mix of true and false`);
    if (q.selectCount !== 'all') err(`${tag}: selectCount`);
  }

  if (q.type === 'choose_correct_ways'){
    const m = q.prompt.match(new RegExp(`find ${N} × ${N}\\?`));
    if (!m) return err(`${tag}: can't read ${q.prompt}`);
    const P = num(m[1]) * num(m[2]);
    if (q.options.length < 4 || q.options.length > 5) err(`${tag}: ${q.options.length} options`);
    const vals = q.options.map(o => ({id: o.id, v: wayValue(o.text), t: o.text}));
    vals.filter(x => isNaN(x.v)).forEach(x => err(`${tag}: can't work out "${x.t}"`));
    const good = vals.filter(x => x.v === P).map(x => x.id).sort().join();
    if (good !== q.correctAnswers.slice().sort().join()) err(`${tag}: key ${q.correctAnswers} but right ways are ${good}`);
    if (q.correctAnswers.length !== 2 || q.selectCount !== 2) err(`${tag}: must be choose TWO`);
    if (new Set(q.options.map(o => o.text)).size !== q.options.length) err(`${tag}: repeated option`);
  }

  if (q.type === 'fill_blanks_decompose' || q.type === 'area_model'){
    const t = text(q), m = t.match(new RegExp(`^${N} × ${N} = `));
    if (!m) return err(`${tag}: can't read ${t}`);
    const a = num(m[1]), b = num(m[2]);
    const parts = [...t.matchAll(new RegExp(`\\(${N} × ${N}\\)`, 'g'))].map(x => [num(x[1]), num(x[2])]);
    if (parts.length < 2) err(`${tag}: needs 2+ parts`);
    const splitA = parts.every(p => p[1] === b) && parts.reduce((s, p) => s + p[0], 0) === a;
    const splitB = parts.every(p => p[0] === a) && parts.reduce((s, p) => s + p[1], 0) === b;
    if (!splitA && !splitB) err(`${tag}: parts ${JSON.stringify(parts)} don't make ${a} × ${b}`);
    parts.forEach((p, i) => {
      if (!isPlacePart(splitA ? p[0] : p[1])) err(`${tag}: part ${p} is not tens/ones/hundreds`);
      const f = q.fields[i];
      if (!f || f.answer !== p[0] * p[1]) err(`${tag}: box ${i + 1} should be ${p[0] * p[1]}`);
    });
    if (q.fields.length !== parts.length + 1 || q.answer !== a * b) err(`${tag}: total should be ${a * b}`);
    if (q.type === 'area_model'){
      if (!/^<svg [^>]*role="img"/.test(q.svg) || /href|<script|on\w+=/i.test(q.svg)) err(`${tag}: svg`);
      if ((q.svg.match(/<rect /g) || []).length !== parts.length) err(`${tag}: svg should have ${parts.length} boxes`);
      const filled = M.areaSvg(q.model, {p1: q.fields[0].answer});
      if (!filled.includes('>' + M.format(q.fields[0].answer) + '<')) err(`${tag}: areaSvg doesn't show filled values`);
    }
    if (q.type === 'fill_blanks_decompose'){
      const sizes = parts.map(p => digits(p[0])).join();
      const want = {easy: '2,1', medium: '3,1', hard: '3,2,1'}[q.difficulty];
      if (sizes !== want) err(`${tag}: ${q.difficulty} split should be ${want}, got ${sizes}`);
    }
  }

  if (q.type === 'word_multiply'){
    const m = q.prompt.match(/has (\d+) \w+ with (\d+) \w+ each/);
    if (!m) return err(`${tag}: can't read ${q.prompt}`);
    if (q.answer !== m[1] * m[2]) err(`${tag}: ${m[1]} × ${m[2]} ≠ ${q.answer}`);
    if (q.picture.groups !== +m[1] || q.picture.each !== +m[2]) err(`${tag}: picture doesn't match`);
    if (q.difficulty !== 'easy') err(`${tag}: word problems are easy only`);
  }
}

// 1. Many full tests: every question right, no repeats, the right levels and types.
const LEVELS = ['easy', 'medium', 'hard', 'mixed'];
const TYPE_SETS = [null, ...M.TYPES.map(t => [t])];
let short = 0;
for (let seed = 1; seed <= 120; seed++){
  for (const difficulty of LEVELS){
    for (const types of TYPE_SETS){
      if (types && types[0] === 'word_multiply' && difficulty !== 'easy' && difficulty !== 'mixed') continue;
      const where = `seed ${seed} ${difficulty} ${types || 'all'}`;
      const s = M.createSession({seed, difficulty, types, count: 12});
      if (s.questions.length !== 12) short++;
      const ids = s.questions.map(q => q.id), keys = s.questions.map(q => q.mathKey);
      if (new Set(ids).size !== ids.length) err(`${where}: repeated id`);
      if (new Set(keys).size !== keys.length) err(`${where}: same multiplication twice`);
      const sig = s.questions.map(q => q.prompt + '|' + JSON.stringify(q.options || q.template));
      if (new Set(sig).size !== sig.length) err(`${where}: duplicate question`);
      s.questions.forEach(q => {
        if (difficulty !== 'mixed' && q.difficulty !== difficulty) err(`${where}: got a ${q.difficulty} question`);
        if (types && q.type !== types[0]) err(`${where}: got a ${q.type} question`);
        verify(q, where);
      });
      if (difficulty === 'mixed' && !types){
        const lv = new Set(s.questions.map(q => q.difficulty));
        if (lv.size !== 3) err(`${where}: mixed should have all 3 levels`);
        if (new Set(s.questions.map(q => q.type)).size < 5) err(`${where}: too little variety`);
      }
    }
  }
}
if (short) err(`${short} tests came out shorter than asked`);

// 2. Replay: same seed → same test; text seeds work; no seed → a fresh test.
const a1 = JSON.stringify(M.createSession({seed: 4242}));
if (a1 !== JSON.stringify(M.createSession({seed: 4242}))) err('same seed gave a different test');
if (a1 === JSON.stringify(M.createSession({seed: 4243}))) err('different seeds gave the same test');
if (JSON.stringify(M.createSession({seed: 'TIGER-7'})) !== JSON.stringify(M.createSession({seed: 'TIGER-7'}))) err('text seed not replayable');
const r1 = M.createSession(), r2 = M.createSession();
if (typeof r1.seed !== 'number' || JSON.stringify(r1.questions) === JSON.stringify(r2.questions)) err('random tests repeat');
if (JSON.stringify(M.createSession({seed: r1.seed}).questions) !== JSON.stringify(r1.questions)) err('a random test cannot be replayed from its seed');

// 3. Bad requests say so instead of making a broken test.
const throws = f => { try { f(); return false; } catch (e) { return true; } };
if (!throws(() => M.generate('word_multiply', 'hard', 1))) err('word_multiply hard should throw');
if (!throws(() => M.generate('nope', 'easy', 1))) err('unknown type should throw');
if (!throws(() => M.createSession({difficulty: 'hard', types: ['word_multiply']}))) err('impossible test should throw');
if (!throws(() => M.createSession({difficulty: 'super'}))) err('unknown difficulty should throw');

// 4. Worksheet-style examples come out as expected.
const ex = M.generate('fill_blanks_decompose', 'easy', 7);
if (!/^\d+ × \d = \(\d0 × \d\) \+ \(\d × \d\) = {2}\+ {2}= $/.test(text(ex))) err('decompose template looks wrong: ' + text(ex));

console.log(fail ? `\n${fail} problem(s) in ${checked} questions` : `OK: ${checked} questions checked`);
process.exit(fail ? 1 : 0);
