// Koa's Reading Gym: every lesson is well formed and every proof snippet
// points at exactly one sentence of its passage. Run: node test/readgym.js
const fs = require('fs'), path = require('path'), vm = require('vm');
const ctx = {}; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(__dirname, '../readgym/js/data.js'), 'utf8') + ';this.L=RG_LESSONS;this.B=RG_BELTS;this.T=RG_TROPHIES;', ctx);
let bad = 0, qn = 0, pn = 0;
const err = m => { bad++; console.log('FAIL', m); };
const low = s => s.toLowerCase();
const ids = {};
if (ctx.L.length !== 15) err('expected 15 lessons, got ' + ctx.L.length);
ctx.L.forEach((L, li) => {
  const tag = L.id;
  if (ids[L.id]) err(tag + ': duplicate id'); ids[L.id] = 1;
  if (!ctx.B[L.belt]) err(tag + ': bad belt');
  if (li && L.belt < ctx.L[li - 1].belt) err(tag + ': belts must not go backwards');
  ['emoji', 'title', 'goal', 'tip', 'sticker'].forEach(k => { if (!L[k]) err(tag + ': missing ' + k); });
  if (!(L.cards && L.cards.length >= 3)) err(tag + ': needs 3+ strategy cards');
  if (!(L.check && L.check.c.length >= 2)) err(tag + ': needs a strategy check');
  ['A', 'B'].forEach(k => {
    const P = L[k], t = tag + '.' + k; pn++;
    if (!P || !P.p || !P.qs) return err(t + ': missing passage');
    const sents = [].concat(...P.p);
    if (!(P.predict && P.predict.length === 3)) err(t + ': needs 3 predictions');
    if (k === 'A' && !L.champ && P.qs.length < 3) err(t + ': A needs 3 questions (model + 2 guided)');
    if (k === 'A' && !L.champ && !P.qs[0].think) err(t + ': first question needs a think-aloud');
    (P.stops || []).forEach(s => { if (!(s.after >= 0 && s.after < P.p.length - 1)) err(t + ': stop after the last part'); if (!(s.c && s.c.length >= 2)) err(t + ': stop choices'); });
    P.qs.forEach((q, qi) => {
      qn++; const u = t + '.q' + (qi + 1);
      if (!q.q || !q.why) err(u + ': needs q and why');
      (q.ev || []).forEach(sn => {
        const hits = sents.filter(s => low(s).includes(low(sn)));
        if (hits.length !== 1) err(u + ': proof "' + sn + '" matches ' + hits.length + ' sentences');
      });
      if (!(q.ev && q.ev.length)) err(u + ': no proof');
      const type = q.type || 'mc';
      if (type === 'mc') {
        if (!(q.c && q.c.length >= 3)) err(u + ': needs 3 choices');
        if (new Set(q.c).size !== q.c.length) err(u + ': duplicate choices');
        (q.key || []).forEach(w => { if (!low(q.q).includes(low(w))) err(u + ': key "' + w + '" not in the question'); });
        if (!(q.key && q.key.length)) err(u + ': no key words');
        (q.think || []).forEach(line => { const m = /^\[x:([^\]]+)\]/.exec(line); if (m && q.c.indexOf(m[1]) < 1) err(u + ': cross-out "' + m[1] + '" is not a wrong choice'); });
      } else if (type === 'order') {
        if (!(q.items && q.items.length >= 3)) err(u + ': order needs 3+ items');
      } else if (type === 'build') {
        if (!(q.parts && q.parts.length >= 3)) err(u + ': build needs 3+ parts');
        q.parts.forEach(p => { if (!(p.l && p.c && p.c.length >= 2)) err(u + ': build part'); });
        if (q.think && q.think.length !== q.parts.length + 1) err(u + ': build think = parts + 1 lines');
      } else err(u + ': unknown type ' + type);
    });
  });
});
console.log(bad ? 'readgym: ' + bad + ' problems' : 'readgym ok: ' + ctx.L.length + ' lessons, ' + pn + ' passages, ' + qn + ' questions');
process.exit(bad ? 1 : 0);
