// Phase 2: RewardKit (stars, levels, streaks, virtual surprise gifts).
// Run: node test/phase2-rewardkit.js
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
let fail = 0; const err = m => { console.log('FAIL: ' + m); fail++; };

const ctx = vm.createContext({ console, JSON, Math, Date }); ctx.window = ctx; ctx.globalThis = ctx;
vm.runInContext(fs.readFileSync(path.join(ROOT, 'js/rewardkit.js'), 'utf8'), ctx);
const R = ctx.RewardKit;
const T0 = new Date(2026, 9, 30, 10, 0).getTime(), DAY = 864e5;
const never = () => 0.99, always = () => 0;   // rand: no surprise / surprise every time
const c = (rand, perDay = 3) => ({ rand, perDay, critters: [] });

/* ---------- levels ---------- */
if (R.starsFor(1) !== 0 || R.starsFor(2) !== 40 || R.starsFor(3) !== 100 || R.starsFor(4) !== 180) err('starsFor curve');
for (let n = 1; n < 30; n++) {
  if (R.starsFor(n + 1) - R.starsFor(n) <= (n > 1 ? R.starsFor(n) - R.starsFor(n - 1) : 0)) err('each level must need more than the last: ' + n);
  const lv = R.levelOf(R.starsFor(n));
  if (lv.n !== n || lv.have !== 0) err('levelOf at threshold ' + n);
  if (R.levelOf(R.starsFor(n + 1) - 1).n !== n) err('levelOf just below ' + (n + 1));
}
if (R.levelOf(R.starsFor(13)).name !== 'Legend 2') err('past the last name: ' + R.levelOf(R.starsFor(13)).name);
if (R.LEVELS.length !== 12 || R.LEVELS.some(l => !l.name || !l.emoji)) err('12 named levels');

/* ---------- stars ---------- */
{
  const s = R.fresh();
  if (R.apply(s, { type: 'answer', ok: true }, T0, c(never)) !== 1) err('correct answer = 1 star');
  if (R.apply(s, { type: 'answer', ok: false }, T0, c(never)) !== 0) err('wrong answer = 0 stars');
  if (R.apply(s, { type: 'complete', score: 3, total: 5 }, T0, c(never)) !== 5) err('complete = 5');
  if (R.apply(s, { type: 'complete', score: 9, total: 10 }, T0, c(never)) !== 10) err('90%+ complete = 10');
  if (R.apply(s, { type: 'complete' }, T0, c(never)) !== 5) err('complete without a score = 5');
  if (s.stars !== 21) err('total stars ' + s.stars);
  // daily cap
  for (let i = 0; i < 400; i++) R.apply(s, { type: 'answer', ok: true }, T0, c(never));
  if (s.dayStars !== R.DAY_CAP) err('day cap ' + s.dayStars);
  if (R.apply(s, { type: 'complete' }, T0, c(never)) !== 0) err('nothing past the cap');
  if (R.apply(s, { type: 'answer', ok: true }, T0 + DAY, c(never)) !== 1) err('cap resets next day');
}

/* ---------- streaks ---------- */
{
  const s = R.fresh(), hit = t => R.apply(s, { type: 'answer', ok: true }, t, c(never));
  hit(T0); hit(T0 + 3600e3);
  if (s.streak !== 1) err('first day = 1');
  hit(T0 + DAY); hit(T0 + 2 * DAY);
  if (s.streak !== 3 || s.best !== 3) err('3 days in a row ' + s.streak);
  if (!s.news.some(n => n.type === 'streak' && n.days === 3)) err('3-day streak celebrated');
  if (!s.gifts.some(g => g.why === '3-day streak')) err('3-day streak gift');
  if (R.summaryOf(s, T0 + 3 * DAY).streak !== 3) err('streak still alive the next morning');
  if (R.summaryOf(s, T0 + 4 * DAY).streak !== 0) err('a missed day shows 0');
  hit(T0 + 5 * DAY);
  if (s.streak !== 1 || s.best !== 3) err('broken streak restarts at 1, best kept');
  // calendar days, not 24h blocks: 23:30 → 00:30 is the next day
  const s2 = R.fresh();
  R.apply(s2, { type: 'answer', ok: true }, new Date(2026, 9, 30, 23, 30).getTime(), c(never));
  R.apply(s2, { type: 'answer', ok: true }, new Date(2026, 9, 31, 0, 30).getTime(), c(never));
  if (s2.streak !== 2) err('midnight rollover');
  if (R.daysBetween('2026-11-01', '2026-11-02') !== 1 || R.daysBetween('2026-03-08', '2026-03-09') !== 1) err('DST-safe days');
}

/* ---------- level-ups and gifts ---------- */
{
  const s = R.fresh(), x = c(never);
  for (let i = 0; i < 39; i++) R.apply(s, { type: 'answer', ok: true }, T0, x);
  if (s.level !== 1 || s.news.some(n => n.type === 'level')) err('no level-up below 40');
  R.apply(s, { type: 'answer', ok: true }, T0, x);
  const lv = s.news.filter(n => n.type === 'level');
  if (s.level !== 2 || lv.length !== 1 || lv[0].name !== 'Sprout') err('level 2 at 40 stars');
  if (s.gifts.length !== 1 || s.gifts[0].why !== 'Level 2') err('a level-up always gives a gift');
  // a big jump celebrates every level
  const j = R.fresh(); j.stars = 95; j.level = 1;
  R.apply(j, { type: 'complete', score: 1, total: 1 }, T0, c(never));
  if (j.level !== 3 || j.news.filter(n => n.type === 'level').length !== 2) err('jump 1 → 3 celebrates both');
}
{
  // surprise gifts after a finished lesson, capped per day by the grown-up setting
  const s = R.fresh(); s.stars = 5000; s.level = R.levelOf(5000).n;
  let t = T0;
  for (let i = 0; i < 10; i++) R.apply(s, { type: 'complete' }, t, c(always, 2));
  const surprise = s.gifts.filter(g => g.why === 'Surprise!');
  if (surprise.length !== 2 || s.giftsToday !== 2) err('perDay cap 2 → ' + surprise.length);
  R.apply(s, { type: 'answer', ok: true }, T0, c(always, 2));
  if (s.gifts.filter(g => g.why === 'Surprise!').length !== 2) err('answers never give surprises');
  R.apply(s, { type: 'complete' }, T0 + DAY, c(always, 2));
  if (s.giftsToday !== 1) err('gift cap resets next day');
  const n = R.fresh(); n.stars = 5000; n.level = R.levelOf(5000).n;
  R.apply(n, { type: 'complete' }, T0, c(always, 0));
  if (n.gifts.length) err('perDay 0 = no surprises');
}
{
  // every gift is virtual and well-formed; items/critters never repeat
  let seed = 7; const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const s = R.fresh(); s.stars = 9e6; s.level = R.levelOf(9e6).n;
  const x = { rand, perDay: 999, critters: [] };
  for (let d = 0; d < 400; d++) R.apply(s, { type: 'complete' }, T0 + d * DAY, x);
  const kinds = new Set(s.gifts.map(g => g.kind));
  ['tickets', 'sticker', 'critter', 'item'].forEach(k => { if (!kinds.has(k)) err('never gave a ' + k); });
  s.gifts.forEach(g => {
    if (!['tickets', 'sticker', 'critter', 'item'].includes(g.kind)) err('non-virtual gift ' + g.kind);
    if (!g.e || !g.n || !g.why) err('gift missing fields ' + JSON.stringify(g));
    if (g.kind === 'tickets' && !(g.amount >= 1 && g.amount <= 3)) err('tickets 1–3');
  });
  if (new Set(s.items).size !== s.items.length || s.items.length > R.ITEMS.length) err('items repeat');
  if (new Set(x.critters).size !== x.critters.length) err('critters repeat');
  if (s.items.length !== R.ITEMS.length) err('all items collected over time: ' + s.items.length);
  if (s.gifts.length > 200) err('gift log capped');
}

/* ---------- old / broken saved data ---------- */
{
  const s = R.clean({ stars: 12, junk: 1, gifts: 'x', news: null });
  if (s.stars !== 12 || !Array.isArray(s.gifts) || !Array.isArray(s.news) || s.streak !== 0) err('clean() repairs bad fields');
  if (R.clean(null).stars !== 0) err('clean(null)');
}

/* ---------- the Prize Wheel critters match ---------- */
{
  const src = fs.readFileSync(path.join(ROOT, 'rewards/js/data.js'), 'utf8');
  const ids = [...src.matchAll(/\{ id: "(\w+)",\s+emoji: "([^"]+)"/g)].map(m => m[1] + m[2]);
  const mine = R.CRITTERS.map(x => x.id + x.e);
  if (ids.join() !== mine.join()) err('RewardKit.CRITTERS must match rewards/js/data.js CRITTERS');
}

/* ---------- every app page loads it in order ---------- */
{
  const pages = [];
  (function walk(d) {
    fs.readdirSync(d, { withFileTypes: true }).forEach(e => {
      const p = path.join(d, e.name);
      if (e.isDirectory() && !/^(android|node_modules|test|\.git|apk|docs|SummerPacket)$/.test(e.name)) walk(p);
      else if (e.name.endsWith('.html')) pages.push(p);
    });
  })(ROOT);
  let n = 0;
  pages.forEach(p => {
    const h = fs.readFileSync(p, 'utf8');
    if (!h.includes('js/tracker.js')) return;
    n++;
    const at = k => h.indexOf('js/' + k + '.js');
    const rel = path.relative(ROOT, p);
    if (at('rewardkit') < 0) return err(rel + ' does not load rewardkit.js');
    if (!(at('tracker') < at('settings') && at('settings') < at('rewardkit'))) err(rel + ': want tracker → settings → rewardkit');
    if (h.includes('js/kidbar.js') && at('rewardkit') > at('kidbar')) err(rel + ': rewardkit must load before kidbar');
  });
  if (n < 24) err('only ' + n + ' tracked pages found');
}

console.log(fail ? `${fail} failure(s)` : 'phase2 rewardkit: all checks passed');
process.exit(fail ? 1 : 0);
