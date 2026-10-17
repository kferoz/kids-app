const fs = require('fs'), vm = require('vm');
const ctx = vm.createContext({});
vm.runInContext(fs.readFileSync('D:/_projects/kidsapp/clueisland/js/data.js','utf8') +
  '\nthis.ISLANDS=ISLANDS;this.CI_TROPHIES=CI_TROPHIES;', ctx);
const { ISLANDS, CI_TROPHIES } = ctx;

let fail = 0; const err = m => { console.log('FAIL: ' + m); fail++; };
const ids = new Set(), skills = {}, allStops = [];
let qCount = 0, words = 0;

ISLANDS.forEach((isl, ii) => {
  if (ids.has(isl.id)) err(`duplicate island id ${isl.id}`);
  ids.add(isl.id);
  if (isl.n !== ii + 1) err(`${isl.id}: n is ${isl.n}, expected ${ii + 1}`);
  ['name','emoji','blurb','theme'].forEach(k => { if (!isl[k]) err(`${isl.id}: missing ${k}`); });
  if (!isl.chest || !isl.chest.icon || !isl.chest.name) err(`${isl.id}: bad chest`);
  if (isl.stops.length !== 6) err(`${isl.id}: ${isl.stops.length} stops (expected 6)`);

  const names = new Set();
  isl.stops.forEach((s, si) => {
    const where = `${isl.id}/stop${si + 1}`;
    allStops.push(s);
    if (names.has(s.name)) err(`${where}: duplicate stop name ${s.name}`);
    names.add(s.name);
    // coordinates must sit inside the map with room for the marker
    if (s.x < 5 || s.x > 95 || s.y < 5 || s.y > 95) err(`${where}: coords off-map (${s.x},${s.y})`);
    // stops must not overlap each other
    isl.stops.forEach((o, oi) => {
      if (oi <= si) return;
      const d = Math.hypot(s.x - o.x, s.y - o.y);
      if (d < 12) err(`${where}: too close to stop${oi + 1} (distance ${d.toFixed(1)})`);
    });
    if (!s.passage || !s.passage.title || !s.passage.text) err(`${where}: missing passage`);
    const w = s.passage.text.split(/\s+/).length;
    words += w;
    if (w < 35) err(`${where}: passage only ${w} words`);
    if (w > 95) err(`${where}: passage ${w} words — too long for Grade 3`);
    if (s.qs.length !== 2) err(`${where}: ${s.qs.length} questions (expected 2)`);

    s.qs.forEach((q, qi) => {
      qCount++;
      const at = `${where}/q${qi + 1}`;
      ['skill','q','a','why','lookFor'].forEach(k => { if (!q[k]) err(`${at}: missing ${k}`); });
      if (!Array.isArray(q.wrong) || q.wrong.length !== 3) err(`${at}: ${q.wrong && q.wrong.length} wrong answers (expected 3)`);
      const all = [q.a, ...(q.wrong || [])];
      if (new Set(all.map(x => String(x).toLowerCase().trim())).size !== all.length)
        err(`${at}: duplicate option -> ${JSON.stringify(all)}`);
      all.forEach(o => { if (!String(o).trim()) err(`${at}: blank option`); });
      // the correct answer must not be identifiable by being much longer than the rest
      const lens = all.map(x => String(x).length);
      const maxWrong = Math.max(...lens.slice(1));
      if (lens[0] > maxWrong * 2.2 && lens[0] - maxWrong > 22)
        err(`${at}: correct answer is far longer than every distractor (${lens.join('/')}) — a giveaway`);
      skills[q.skill] = (skills[q.skill] || 0) + 1;
    });
  });
});

const trIds = new Set();
CI_TROPHIES.forEach(t => {
  if (trIds.has(t.id)) err(`duplicate trophy ${t.id}`);
  trIds.add(t.id);
  if (!t.icon || !t.name || !t.desc) err(`trophy ${t.id} incomplete`);
});
// the "12 different skills" trophy must actually be reachable
const nSkills = Object.keys(skills).length;
if (nSkills < 12) err(`only ${nSkills} distinct skills — the all-skills trophy (needs 12) is unreachable`);
// the gem trophy must be reachable too
const maxGems = qCount * 5;
if (maxGems < 60) err(`max gems ${maxGems} — gem-hunter (60) unreachable`);

console.log(`${ISLANDS.length} islands · ${allStops.length} stops · ${qCount} questions · ${words} words of passage`);
console.log(`${nSkills} skills: ${Object.keys(skills).sort().join(', ')}`);
console.log(`max gems ${maxGems}`);
console.log(fail ? `\n${fail} FAILURES` : '\nALL CHECKS PASSED');
process.exit(fail ? 1 : 0);
