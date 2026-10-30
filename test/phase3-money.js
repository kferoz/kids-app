// Phase 3: money settings (js/settings.js) drive the Dollar Bank (js/dollars.js).
// Run: node test/phase3-money.js
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
let fail = 0; const err = m => { console.log('FAIL: ' + m); fail++; };

function browser(seed = {}) {
  const data = Object.assign({}, seed);
  const localStorage = { getItem: k => k in data ? data[k] : null, setItem: (k, v) => { data[k] = String(v); },
    removeItem: k => { delete data[k]; }, key: i => Object.keys(data)[i], get length() { return Object.keys(data).length; } };
  const ctx = vm.createContext({ localStorage, JSON, Date, Math, console });
  ctx.window = ctx; ctx.globalThis = ctx;
  ['js/settings.js', 'js/dollars.js'].forEach(f => vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), ctx, { filename: f }));
  return { ctx, data, B: ctx.DollarBank, H: ctx.HubSettings };
}
const J = JSON.stringify;
// A kid (id k1) who has won the Grand Prix "track-master" trophy (one challenge) and nothing else.
const won = (extra = {}) => Object.assign({ hub_kids: J([{ id: 'k1', name: 'Sam', grade: 'g3' }, { id: 'k2', name: 'Ava', grade: 'kg' }]),
  'kk1::gp_trophies': J(['track-master']), 'kk2::gp_trophies': J(['track-master']) }, extra);

/* ---------- defaults = old behaviour: $1 per challenge ---------- */
{
  const { B } = browser(won());
  const io = B.forKid('k1'); B.sync(io.g, io.s);
  const L = B.ledger(io.g);
  if (L.length !== 1 || L[0].amt !== 1 || L[0].cur !== 'USD' || L[0].lv !== 'big' || L[0].off) err('default row: ' + J(L));
  const t = B.totals(io.g);
  if (t.earned !== 1 || t.owed !== 1 || t.text.earned !== '$1' || t.text.owed !== '$1' || t.text.paid !== '$0') err('default totals ' + J(t));
  if (B.bankName('k1') !== 'Dollar Bank') err('bank name USD');
  const ch = B.challengesFor('grandprix', io.g).filter(c => c.id === 'grandprix:track-master')[0];
  if (ch.amountText !== '$1' || ch.earnedText !== '$1' || !ch.done) err('challengesFor text ' + J(ch));
}

/* ---------- old ledger rows (no cur / lv) keep their dollars ---------- */
{
  const old = [{ id: 'grandprix:track-master', ch: 'grandprix:track-master', app: 'grandprix', title: 'x', amt: 1, ts: 1, seen: true, paid: 0 },
               { id: 'readingadventures:grade3#1', ch: 'readingadventures:stories', app: 'readingadventures', title: 'y', amt: 3, ts: 2, seen: true, paid: 5 }];
  const { B, H } = browser(won({ 'kk1::kb_dollars': J(old) }));
  H.set({ money: { currency: 'INR' } });
  const io = B.forKid('k1'); B.sync(io.g, io.s);
  const L = B.ledger(io.g);
  if (L.length !== 2 || L[0].amt !== 1 || L[1].amt !== 3) err('old rows untouched');
  const t = B.totals(io.g);
  if (t.text.earned !== '$4' || t.text.paid !== '$3' || t.text.owed !== '$1') err('old rows stay USD after switching to INR: ' + J(t.text));
}

/* ---------- currency, levels and per-challenge choice ---------- */
{
  const { B, H } = browser(won());
  H.set({ money: { currency: 'INR', levelOf: { 'grandprix:track-master': 'huge' } } });
  const io = B.forKid('k1'); B.sync(io.g, io.s);
  const r = B.ledger(io.g)[0];
  if (r.amt !== 500 || r.cur !== 'INR' || r.lv !== 'huge') err('INR Gold row ' + J(r));
  if (B.totals(io.g).text.earned !== '₹500' || B.bankName('k1') !== 'Rupee Bank') err('INR text');
  // changing amounts later never rewrites what was earned
  const lv = H.get().money.levels; lv[2].amounts.INR = 999; H.set({ money: { levels: lv } });
  if (B.ledger(io.g)[0].amt !== 500) err('earned rows keep their amount');
  // Bronze in USD shows cents
  H.set({ money: { currency: 'USD', levelOf: { 'grandprix:track-master': 'small' } } });
  const c = B.challengesFor('grandprix', io.g).filter(x => x.id === 'grandprix:track-master')[0];
  if (c.amountText !== '$0.25' || c.lv !== 'small') err('Bronze text ' + c.amountText);
  // mixed currencies add up per currency
  if (B.sumText([{ amt: 1, cur: 'USD' }, { amt: 0.25, cur: 'USD' }, { amt: 100, cur: 'INR' }]) !== '$1.25 + ₹100') err('mixed sumText');
}

/* ---------- per-learner currency ---------- */
{
  const { B, H } = browser(won());
  H.set({ money: { perKid: { k2: { currency: 'INR' } } } });
  const a = B.forKid('k1'), b = B.forKid('k2'); B.sync(a.g, a.s); B.sync(b.g, b.s);
  if (B.ledger(a.g)[0].cur !== 'USD' || B.ledger(b.g)[0].cur !== 'INR' || B.ledger(b.g)[0].amt !== 100) err('per-learner currency');
  // "same as device" again (Admin stores "")
  H.set({ money: { perKid: { k2: { currency: '' } } } });
  if (H.moneyFor('k2').currency !== 'USD') err('"" = same as device');
}

/* ---------- money off: recorded, not paid, no back-pay ---------- */
{
  const { B, H } = browser(won());
  H.set({ money: { perKid: { k1: { enabled: false } } } });
  const a = B.forKid('k1'), b = B.forKid('k2'); B.sync(a.g, a.s); B.sync(b.g, b.s);
  const r = B.ledger(a.g)[0];
  if (!r.off || r.amt !== 0 || !r.seen) err('off row ' + J(r));
  if (B.totals(a.g).count !== 0 || B.totals(a.g).text.earned !== '$0') err('off rows not counted');
  if (B.ledger(b.g)[0].off || B.ledger(b.g)[0].amt !== 1) err('other learner still paid');
  if (B.on('k1') || !B.on('k2')) err('on()');
  // switching back on does not back-pay the same win
  H.set({ money: { perKid: { k1: { enabled: null } } } });
  B.sync(a.g, a.s);
  if (B.ledger(a.g).length !== 1 || B.totals(a.g).count !== 0) err('no back-pay after switching on');
  // "Mark all paid" skips off rows
  B.setPaid('*', true, a.g, a.s);
  if (B.ledger(a.g)[0].paid) err('off rows are never marked paid');
  // device switch beats the learner's own "on"
  H.set({ money: { enabled: false, perKid: { k2: { enabled: true } } } });
  if (B.on('k2')) err('device off wins');
}

/* ---------- Reading Adventures: its count × the Silver amount ---------- */
{
  const ra = J({ grade3: { events: [{ milestoneNumber: 1, amount: 2, storiesRequired: 5 }] } });
  const { B, H } = browser({ 'kk1::readingAdventuresRewards_v2': ra });
  H.set({ money: { currency: 'INR' } });
  const io = B.forKid('k1'); B.sync(io.g, io.s);
  const r = B.ledger(io.g).filter(e => e.app === 'readingadventures')[0];
  if (!r || r.amt !== 200 || r.cur !== 'INR') err('Reading Adventures 2 × ₹100 → ' + J(r));
}

/* ---------- this page's learner (apps): getter without .kid ---------- */
{
  const { B, H, data } = browser(won({ hub_activeKid: 'k2' }));
  H.set({ money: { perKid: { k2: { currency: 'INR' } } } });
  // fake profile-store: app keys already namespaced
  const g = k => { const v = data['kk2::' + k]; return v == null ? null : JSON.parse(v); };
  const s = (k, v) => { data['kk2::' + k] = J(v); };
  B.sync(g, s);
  if (B.ledger(g)[0].cur !== 'INR' || B.bankName() !== 'Rupee Bank') err('active learner settings used on app pages');
}

/* ---------- every page that loads dollars.js loads settings.js first ---------- */
{
  const pages = [];
  (function walk(d) {
    fs.readdirSync(d, { withFileTypes: true }).forEach(e => {
      const p = path.join(d, e.name);
      if (e.isDirectory() && !/^(android|node_modules|test|\.git|apk|docs|SummerPacket)$/.test(e.name)) walk(p);
      else if (e.name.endsWith('.html')) pages.push(p);
    });
  })(ROOT);
  pages.forEach(p => {
    const h = fs.readFileSync(p, 'utf8'), d = h.indexOf('js/dollars.js');
    if (d < 0) return;
    const st = h.indexOf('js/settings.js');
    if (st < 0 || st > d) err(path.relative(ROOT, p) + ': settings.js must load before dollars.js');
  });
}

console.log(fail ? `${fail} failure(s)` : 'phase3 money: all checks passed');
process.exit(fail ? 1 : 0);
