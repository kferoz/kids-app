/* Worksheets: every math drill builds full sheets, and the answer key is right.
   Run: node test/worksheets.js */
global.window = {};
require('../worksheets/js/drills.js');
const DR = window.WS_DRILLS;
let errs = 0, checked = 0;
const err = m => { errs++; if (errs < 30) console.log('FAIL', m); };
const GRADES = ['pk', 'kg', 'g1', 'g2', 'g3', 'g4', 'g5'];
GRADES.forEach(g => { if (DR.forGrade(g).length < 4) err(g + ': fewer than 4 drills'); });
const ids = {};
function fr(s) { // "3/4", "1 1/2", "5" → number
  s = String(s).trim(); let m;
  if ((m = /^(\d+) (\d+)\/(\d+)$/.exec(s))) return +m[1] + m[2] / m[3];
  if ((m = /^(\d+)\/(\d+)$/.exec(s))) return m[1] / m[2];
  return +s;
}
function simplified(s) { const m = /(\d+)\/(\d+)$/.exec(s); if (!m) return true; const g = (a, b) => b ? g(b, a % b) : a; return g(+m[1], +m[2]) === 1 && +m[1] < +m[2]; }
DR.list.forEach(d => {
  if (ids[d.id]) err('duplicate id ' + d.id); ids[d.id] = 1;
  if (!d.std || !d.title || !d.how) err(d.id + ': missing std/title/how');
  for (let seed = 1; seed <= 25; seed++) {
    const ps = DR.build(d, seed * 7919);
    if (ps.length !== d.n) err(d.id + ' seed ' + seed + ': ' + ps.length + ' of ' + d.n);
    if (JSON.stringify(ps) !== JSON.stringify(DR.build(d, seed * 7919))) err(d.id + ': not repeatable for one seed');
    ps.forEach(p => {
      if (p.k !== 'trace' && (p.a == null || p.a === '' || /NaN|undefined|Infinity/.test(p.a))) err(d.id + ': bad answer ' + JSON.stringify(p));
      let m;
      if (p.k === 'h' && (m = /^(\d+(?:\.\d+)?) ([+−×÷]) (\d+(?:\.\d+)?) =$/.exec(p.t))) {
        const a = +m[1], b = +m[3], op = m[2];
        if (op === '÷' && / R /.test(p.a)) { const [q, r] = p.a.split(' R ').map(Number); if (q * b + r !== a || r >= b) err(d.id + ': ' + p.t + ' ' + p.a); }
        else { const want = op === '+' ? a + b : op === '−' ? a - b : op === '×' ? a * b : a / b; if (Math.abs(want - parseFloat(p.a)) > 1e-9) err(d.id + ': ' + p.t + ' ' + p.a); }
        checked++;
      }
      if (p.k === 'h' && (m = /^(\d+)\/(\d+) ([+−×]) (\d+)\/(\d+) =$/.exec(p.t))) {
        const a = m[1] / m[2], b = m[4] / m[5], want = m[3] === '+' ? a + b : m[3] === '−' ? a - b : a * b;
        if (Math.abs(want - fr(p.a)) > 1e-9) err(d.id + ': ' + p.t + ' ' + p.a);
        if (!simplified(p.a)) err(d.id + ': not simplified ' + p.t + ' ' + p.a);
        checked++;
      }
      if (p.k === 'v') {
        const a = parseFloat(p.top), b = parseFloat(p.bot), want = p.op === '+' ? a + b : p.op === '−' ? a - b : a * b;
        if (Math.abs(want - parseFloat(p.a)) > 1e-6) err(d.id + ': ' + p.top + p.op + p.bot + ' = ' + p.a);
        if (want < 0) err(d.id + ': negative answer');
        checked++;
      }
      if (p.k === 'cmp') { const a = +p.l, b = +p.r; if ((a < b ? '<' : a > b ? '>' : '=') !== p.a) err(d.id + ': cmp ' + JSON.stringify(p)); checked++; }
      if (p.k === 'count' && +p.a !== p.n) err(d.id + ': count');
      if (p.k === 'pic' && +p.a !== p.x + p.y) err(d.id + ': pic');
      if (p.k === 'more' && p.a !== (p.l > p.r ? 'left' : 'right')) err(d.id + ': more');
      if (p.k === 'h' && (m = /^(\d+) \+ ___ = (\d+)$/.exec(p.t)) && +m[1] + +p.a !== +m[2]) err(d.id + ': ' + p.t + ' ' + p.a);
      if (p.k === 'h' && (m = /^(\d+) × ___ = (\d+)$/.exec(p.t)) && +m[1] * +p.a !== +m[2]) err(d.id + ': ' + p.t + ' ' + p.a);
    });
  }
});
console.log(errs ? 'worksheets: ' + errs + ' problems' : 'worksheets: all checks passed (' + DR.list.length + ' drills, ' + checked + ' answers re-computed)');
process.exit(errs ? 1 : 0);
