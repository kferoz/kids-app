// Admin → Ad-hoc Tests, end to end in headless Chromium: parent PIN (set, salted hash, lockout, change, old-PIN upgrade),
// making tests three ways, draft/publish, each published test's own kids' page, filters, duplicate, delete,
// export/import (+ a tampered file), print view, the hidden Hub door, and NO request leaving 127.0.0.1.
// Run: node test/admin-ui.js   (PLAYWRIGHT_CORE=<folder> if playwright-core isn't installed here; CHROME=<chrome.exe> optional)
const http = require('http'), fs = require('fs'), path = require('path'), os = require('os'), zlib = require('zlib');
const { chromium } = require(process.env.PLAYWRIGHT_CORE || 'playwright-core');
const ROOT = path.join(__dirname, '..');
const CHROME = process.env.CHROME || path.join(os.homedir(), 'AppData/Local/ms-playwright/chromium-1223/chrome-win64/chrome.exe');
const TYPES = {'.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json', '.png': 'image/png', '.woff2': 'font/woff2'};
let fail = 0; const ok = (c, m) => { if (!c) { console.log('FAIL: ' + m); fail++; } };

// A real PNG (solid colour) so the resize path runs: w × h pixels.
function png(w, h, rgb){
  const crcT = Array.from({length: 256}, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
  const crc = b => { let c = 0xFFFFFFFF; for (const x of b) c = crcT[(c ^ x) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; };
  const chunk = (type, data) => { const len = Buffer.alloc(4); len.writeUInt32BE(data.length); const td = Buffer.concat([Buffer.from(type), data]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([len, td, c]); };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 2;
  const row = Buffer.concat([Buffer.from([0]), Buffer.alloc(w * 3).map((_, i) => rgb[i % 3])]);
  const raw = Buffer.concat(Array.from({length: h}, () => row));
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}

const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split(/[?#]/)[0]));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, {'Content-Type': TYPES[path.extname(p)] || 'application/octet-stream'});
  fs.createReadStream(p).pipe(res);
});

(async () => {
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const BASE = `http://127.0.0.1:${server.address().port}/`;
  const browser = await chromium.launch({executablePath: CHROME});
  const external = [], errors = [];
  async function newCtx(){
    const ctx = await browser.newContext({viewport: {width: 1100, height: 900}, acceptDownloads: true});
    await ctx.addInitScript(() => {
      window.__mqTest = true;
      addEventListener('DOMContentLoaded', () => new MutationObserver(() => document.querySelectorAll('.kb-ok').forEach(b => b.click())).observe(document.documentElement, {childList: true, subtree: true}));
    });
    ctx.on('request', r => { const u = r.url(); if (!u.startsWith(BASE) && !u.startsWith('data:') && !u.startsWith('blob:')) external.push(u); });
    ctx.on('page', p => { p.on('pageerror', e => errors.push(e.message)); });
    return ctx;
  }
  const ctx = await newCtx();
  const page = await ctx.newPage();
  page.on('pageerror', e => errors.push(e.message));
  const go = async url => { await page.goto(BASE + url); };
  const rows = () => page.$$eval('.ttable tbody tr', r => r.map(x => ({id: x.dataset.id, text: x.innerText})));

  /* ---------- A. Parent PIN ---------- */
  await go('admin/tests.html');
  ok(await page.isVisible('.ap-veil'), 'gate covers the admin page');
  ok(await page.isHidden('#app'), 'admin content hidden before the PIN');
  ok(/Set a 4-digit parent PIN/.test(await page.innerText('.ap-veil')), 'first use asks to set a PIN');
  await page.fill('#apPin', '1234'); await page.fill('#apPin2', '1235'); await page.click('.ap-card button[type=submit]');
  ok(/don't match/.test(await page.innerText('.ap-msg')), 'mismatched PINs refused');
  await page.fill('#apPin', '12a4'); await page.fill('#apPin2', '12a4'); await page.click('.ap-card button[type=submit]');
  ok(/4 digits/.test(await page.innerText('.ap-msg')), 'non-digit PIN refused');
  await page.fill('#apPin', '1234'); await page.fill('#apPin2', '1234'); await page.click('.ap-card button[type=submit]');
  await page.waitForSelector('#app:not([hidden])');
  const rec = await page.evaluate(() => localStorage.getItem('hub_adminPin2'));
  const r0 = JSON.parse(rec);
  ok(r0.salt && r0.salt.length === 32 && /^[0-9a-f]{64}$/.test(r0.hash) && !rec.includes('1234'), 'PIN stored as salted hash only');
  ok(await page.evaluate(() => AdminPin._sha256('abc')) === 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad', 'SHA-256 matches the standard test vector');
  ok(r0.hash !== await page.evaluate(() => AdminPin._sha256('1234')), 'hash is salted + stretched, not plain sha256(PIN)');
  ok((await rows()).length === 4, 'built-in sample tests seeded on first use');

  // lock → wrong ×5 → locked 2 minutes
  await page.click('#lockBtn'); await page.waitForURL(/\/index\.html$/);
  await go('admin/tests.html');
  for (let k = 1; k <= 4; k++){
    await page.fill('#apPin', '0000'); await page.click('.ap-card button[type=submit]');
    ok(new RegExp((5 - k) + ' tr').test(await page.innerText('.ap-msg')), `wrong try ${k} says ${5 - k} left`);
  }
  await page.fill('#apPin', '0000'); await page.click('.ap-card button[type=submit]');
  ok(/Too many wrong tries/.test(await page.innerText('.ap-msg')), '5th wrong try locks');
  ok(await page.isDisabled('#apPin'), 'PIN box disabled while locked');
  const lock = await page.evaluate(() => JSON.parse(localStorage.getItem('hub_adminLock')));
  const left = lock.until - Date.now();
  ok(left > 110000 && left <= 120000, 'lock lasts 2 minutes, got ' + left);
  ok(!(await page.evaluate(() => AdminPin.verify('1234').ok)), 'right PIN refused while locked');
  await page.reload();
  ok(await page.isDisabled('#apPin'), 'still locked after reload');
  await page.evaluate(() => localStorage.setItem('hub_adminLock', JSON.stringify({fails: 5, until: Date.now() - 1})));   // 2 minutes pass
  await page.reload();
  await page.fill('#apPin', '1234'); await page.click('.ap-card button[type=submit]');
  await page.waitForSelector('#app:not([hidden])');
  ok(true, 'opens after the lock ends');

  // change PIN
  await page.click('#pinBtn');
  await page.fill('#apOld', '9999'); await page.fill('#apNew', '5678'); await page.fill('#apNew2', '5678');
  await page.click('#apChTitle ~ button[type=submit]');
  ok(/not right/.test(await page.innerText('.ap-veil .ap-msg')), 'change PIN needs the current PIN');
  await page.fill('#apOld', '1234'); await page.click('#apChTitle ~ button[type=submit]');
  await page.waitForSelector('.ap-veil', {state: 'detached'});
  ok(!(await page.evaluate(() => AdminPin.verify('1234').ok)) && await page.evaluate(() => AdminPin.verify('5678').ok), 'PIN changed to 5678');

  // an old (pre-salt) Admin PIN still opens once and is upgraded
  {
    const c2 = await newCtx(), p2 = await c2.newPage();
    await p2.goto(BASE + 'index.html');
    await p2.evaluate(() => { let h = 5381; const s = '2468'; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; localStorage.setItem('hub_adminPin', 'h' + (h >>> 0).toString(36)); });
    await p2.goto(BASE + 'admin/index.html');
    ok(/Enter the 4-digit/.test(await p2.innerText('.ap-veil')), 'old PIN: gate asks for it');
    await p2.fill('#apPin', '2468'); await p2.click('.ap-card button[type=submit]');
    await p2.waitForSelector('#app:not([hidden])');
    ok(await p2.evaluate(() => !localStorage.getItem('hub_adminPin') && !!localStorage.getItem('hub_adminPin2')), 'old PIN upgraded to the salted hash');
    // Hub home: no visible admin link; holding the 🎒 for 3 s opens Admin (which still asks for the PIN)
    const p3 = await c2.newPage();
    await p3.goto(BASE + 'index.html');
    ok(!(await p3.$$eval('a[href*="admin"]', as => as.filter(a => a.offsetParent).length)), 'no visible link to /admin on the Hub home');
    await p3.dispatchEvent('#hubLogo', 'pointerdown');
    await p3.waitForURL(/admin\/index\.html/, {timeout: 6000});
    ok(await p3.isVisible('.ap-veil'), 'hidden door still asks for the PIN (new tab)');
    await c2.close();
  }

  /* ---------- B. Question builder → draft → publish → kids' page ---------- */
  await page.click('[data-new="builder"]');
  await page.fill('#eTitle', 'Times Check');
  await page.fill('#eDate', '2026-11-12');
  await page.selectOption('#bType', 'single_multiply'); await page.selectOption('#bLevel', 'medium'); await page.fill('#bCount', '5');
  await page.click('#bGo');
  ok((await page.$$('#bPrev .q')).length === 5, 'preview shows 5');
  const before = await page.innerText('#bPrev .q:nth-child(2) .q-prompt');
  await page.click('#bPrev [data-p="swap"][data-i="1"]');
  ok(await page.innerText('#bPrev .q:nth-child(2) .q-prompt') !== before, '↻ gives new numbers');
  await page.click('#bPrev [data-p="del"][data-i="0"]');
  await page.click('#bAdd');
  ok(await page.innerText('#qCount') === '4', '4 questions added');
  await page.click('.ed-save [data-ed="save"]');
  let r = (await rows()).find(x => /Times Check/.test(x.text));
  ok(r && /Draft/.test(r.text) && /\t4\t/.test(r.text.replace(/\n/g, '\t')), 'saved as a draft with 4 questions');
  const timesId = r.id;
  await go('adventurepack/stickerquest/index.html#adhoc');
  ok(!(await page.innerText('#adhoc')).includes('Times Check'), 'draft hidden from children');
  await go('admin/tests.html');
  await page.click(`tr[data-id="${timesId}"] [data-act="status"]`);
  ok(/Published/.test(await page.innerText(`tr[data-id="${timesId}"]`)), 'published');
  await go('adventurepack/stickerquest/index.html#adhoc');
  const kidText = await page.innerText('#adhoc');
  ok(/Nov 12, 2026[\s\S]*Times Check/.test(kidText), 'published test listed under its date');
  ok(await page.getAttribute(`#adhoc a[href="#tests/${timesId}"]`, 'href'), 'card links to its own page');
  await page.click(`#adhoc a[href="#tests/${timesId}"]`);
  await page.waitForSelector('#adhoc .mq-ptitle');
  ok(await page.innerText('#adhoc .mq-ptitle') === 'Nov 12, 2026 — Times Check', 'own page title has the date');
  ok((await page.title()).startsWith('Nov 12, 2026 — Times Check'), 'browser title has the date');
  ok(await page.isVisible('#adhoc [data-act="start"]'), 'Start test button');
  // deep link straight to the page
  await go('adventurepack/stickerquest/index.html#tests/' + timesId);
  await page.waitForSelector('#adhoc .mq-ptitle');
  ok(await page.isVisible('#adhoc'), '#tests/<id> opens the Ad-hoc tab on its page');
  await page.click('#adhoc [data-act="start"]');
  async function playAll(){
    const seen = [];
    for (let k = 0; k < 60; k++){
      const s = await page.evaluate(() => { const S = __mqState(); return S && {q: S.q, i: S.i, n: S.qs.length}; });
      if (!s) break;
      seen.push(s.q);
      if (s.q.answerKind === 'input') for (const f of s.q.fields){ await page.click(`#adhoc .mq-blank[data-f="${f.id}"]`); await page.keyboard.type(String(f.answer)); }
      else for (const id of s.q.correctAnswers) await page.click(`#adhoc .mq-opt[data-opt="${id}"]`);
      await page.click('#adhoc [data-act="check"]');
      ok(await page.evaluate(() => __mqState().done), `kid answer accepted (${s.q.type})`);
      await page.click('#adhoc [data-act="next"]');
      if (s.i + 1 === s.n) break;
    }
    await page.waitForSelector('#adhoc .mq-end');
    return seen;
  }
  let played = await playAll();
  ok(played.length === 4 && played.every(q => q.type === 'single_multiply' && q.difficulty === 'medium'), 'kid plays the 4 saved questions');
  await page.click('#adhoc [data-act="again"]');
  const again = await page.evaluate(() => __mqState().qs.map(q => q.id));
  ok(again.length === 4 && again.join() !== played.map(q => q.id).join(), 'builder test: try again makes new numbers');

  /* ---------- C. Worksheet: photos + typed questions ---------- */
  await go('admin/tests.html');
  await page.click('[data-new="worksheet"]');
  await page.fill('#eTitle', 'Worksheet page 12');
  await page.setInputFiles('#hPhotos', [
    {name: 'page12.png', mimeType: 'image/png', buffer: png(2400, 1200, [240, 200, 80])},
    {name: 'page13.png', mimeType: 'image/png', buffer: png(600, 800, [80, 160, 240])}]);
  await page.waitForFunction(() => /2 photo/.test(document.querySelector('#hPhotoMsg').textContent));
  await page.waitForSelector('#thumbs img');
  ok((await page.$$('#thumbs .thumb')).length === 2, 'two photos attached');
  await page.click('#thumbs [data-view]'); await page.waitForSelector('.viewer img');
  await page.click('.viewer [data-close]');
  const hand = async (type, fill) => { await page.selectOption('#hType', type); for (const [k, v] of Object.entries(fill)) await page.fill(`#hFields [data-k="${k}"]`, v); await page.click('#hAdd'); };
  await hand('single_multiply', {a: '999', b: '99'});
  ok(/9,999/.test(await page.innerText('#hMsg')), 'answers over 9,999 refused with a message');
  await hand('single_multiply', {a: '157', b: '6'});
  await hand('true_false_equations', {eqs: '62 × 4 = 248\n31 x 4 = 134'});
  await page.selectOption('#hType', 'multiple_choice');
  await page.fill('#hFields [data-k="prompt"]', 'Which is <b>a</b> noun? <img src=x onerror="window.__xss=1">');
  await page.fill('#hFields [data-k="o0"]', 'run'); await page.fill('#hFields [data-k="o1"]', 'dog'); await page.fill('#hFields [data-k="o2"]', 'blue');
  await page.check('#hFields input[name="mcRight"][value="1"]'); await page.click('#hAdd');
  await page.selectOption('#hType', 'area_model'); await page.fill('#hFields [data-k="a"]', '14'); await page.fill('#hFields [data-k="b"]', '8'); await page.click('#hAdd');
  await hand('word_match', {word: 'said', others: 'sad, sand, slid'});
  ok(await page.innerText('#qCount') === '5', '5 hand-made questions');
  await page.check('input[name="eStatus"][value="published"]');
  await page.click('.ed-save [data-ed="save"]');
  r = (await rows()).find(x => /Worksheet page 12/.test(x.text));
  ok(r && /📎 2/.test(r.text) && /Published/.test(r.text), 'attachments column shows 📎 2');
  const wsId = r.id;
  const stored = await page.evaluate(id => new Promise(res => {
    const t = AdhocStore.get(id); Promise.all(t.attachments.map(a => AdhocStore.getImage(a.id))).then(res);
  }), wsId);
  ok(stored.length === 2 && stored.every(i => /^data:image\/jpeg;base64,/.test(i.dataUrl) && Math.max(i.w, i.h) <= 1400), 'photos stored as resized JPEGs (≤1400 px)');
  ok(stored[0].w === 1400 && stored[0].h === 700, 'big photo scaled down, got ' + stored[0].w + '×' + stored[0].h);
  const raw = await page.evaluate(() => localStorage.getItem('hub_adhocDB'));
  ok(!raw.includes('data:image'), 'photos are not in localStorage');
  ok(JSON.parse(raw).schema === 1, 'versioned schema');
  await go('adventurepack/stickerquest/index.html#tests/' + wsId);
  await page.click('#adhoc [data-act="start"]');
  played = await playAll();
  ok(played.map(q => q.type).join() === 'single_multiply,true_false_equations,multiple_choice,area_model,word_match', 'kid plays the typed worksheet questions in order');
  ok(!(await page.evaluate(() => window.__xss)), 'typed markup is shown as text, never run');

  /* ---------- D. Sight words ---------- */
  await go('admin/tests.html');
  await page.click('[data-new="sightwords"]');
  await page.fill('#sWords', 'word\nthe\nsaid, was\nthey\nhave\nthe');
  await page.selectOption('#sN', '3');
  await page.click('#sGo');
  ok(await page.innerText('#qCount') === '5', 'sight list → 5 word questions (header + duplicate skipped)');
  ok(/^Sight Words: the, said, was/.test(await page.inputValue('#eTitle')), 'title suggested from the words');
  ok(await page.inputValue('#eSubject') === 'Sight Words' && await page.inputValue('#eGrade') === 'kg', 'subject/grade preset');
  await page.check('input[name="eStatus"][value="published"]');
  await page.click('.ed-save [data-ed="save"]');
  const swId = (await rows()).find(x => /Sight Words:/.test(x.text)).id;
  await go('adventurepack/stickerquest/index.html#tests/' + swId);
  await page.click('#adhoc [data-act="start"]');
  await page.waitForSelector('#adhoc .mq-wordtext');
  ok((await page.$$('#adhoc .mq-opt')).length === 3, 'word match shows 3 choices');
  played = await playAll();
  ok(played.length === 5 && played.every(q => q.type === 'word_match'), 'sight-word test plays');
  ok(/Try again$/.test((await page.innerText('#adhoc [data-act="again"]')).trim()), 'fixed tests say "Try again", not "new numbers"');

  /* ---------- E. Finding tests ---------- */
  await go('admin/tests.html');
  const count = async () => (await rows()).length;
  const all = await count();
  await page.selectOption('#fSubject', 'Sight Words'); ok(await count() === 1, 'filter by subject');
  await page.selectOption('#fSubject', ''); await page.selectOption('#fGrade', 'kg'); ok(await count() === 1, 'filter by grade');
  await page.selectOption('#fGrade', ''); await page.fill('#fQ', 'times'); ok(await count() === 2, 'search by title (Times Check + Times Table Warm-Up)');
  await page.fill('#fQ', 'TIMES CHECK'); ok(await count() === 1, 'search ignores case');
  await page.fill('#fQ', ''); await page.fill('#fFrom', '2026-11-12'); ok(await count() === 1, 'date range (from)');
  await page.fill('#fFrom', ''); await page.fill('#fTo', '2026-11-09'); ok(await count() === 1, 'date range (to)');
  await page.click('#fClear'); ok(await count() === all, 'clear filters');
  const dates = (await rows()).map(x => x.text.split('\t')[0]);
  ok(dates[0].includes('Nov 12, 2026'), 'table newest first');
  // duplicate (with photos) then delete the copy: original photos survive
  await page.click(`tr[data-id="${wsId}"] [data-act="dup"]`);
  await page.waitForFunction(n => document.querySelectorAll('.ttable tbody tr').length === n, all + 1);
  const copy = (await rows()).find(x => /\(copy\)/.test(x.text));
  ok(copy && /Draft/.test(copy.text) && /📎 2/.test(copy.text), 'duplicate is a draft with its own photos');
  await page.click(`tr[data-id="${copy.id}"] [data-act="del"]`);
  ok((await rows()).length === all + 1, 'first Delete tap only asks');
  await page.click(`tr[data-id="${copy.id}"] [data-act="del"]`);
  await page.waitForFunction(n => document.querySelectorAll('.ttable tbody tr').length === n, all);
  const still = await page.evaluate(id => Promise.all(AdhocStore.get(id).attachments.map(a => AdhocStore.getImage(a.id))), wsId);
  ok(still.every(Boolean), 'original photos kept after deleting the copy');

  /* ---------- F. Export / import ---------- */
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('#exportBtn')]);
  const backup = JSON.parse(fs.readFileSync(await dl.path(), 'utf8'));
  ok(backup.app === 'kids-learning-hub/adhoc-tests' && backup.schema === 1 && backup.tests.length === all && backup.images.length === 2, 'export has every test and photo');
  await page.click(`tr[data-id="${wsId}"] [data-act="del"]`); await page.click(`tr[data-id="${wsId}"] [data-act="del"]`);
  await page.waitForFunction(n => document.querySelectorAll('.ttable tbody tr').length === n, all - 1);
  const evil = JSON.parse(JSON.stringify(backup));
  evil.tests.push({id: 'evil1', title: '<img src=x onerror="window.__xss=2">Evil', date: '2026-11-13', status: 'published', subject: 'Other', grade: 'g3',
    questions: [{type: 'single_multiply', params: {a: '<b>', b: 2}}, {type: 'area_model', params: {a: 14, b: 8}}, {type: 'nope', params: {}}]});
  evil.images.push({id: 'bad1', dataUrl: 'javascript:alert(1)'});
  const tmp = path.join(os.tmpdir(), 'adhoc-import-test.json');
  fs.writeFileSync(tmp, JSON.stringify(evil));
  await page.setInputFiles('#importFile', tmp);
  await page.waitForFunction(n => document.querySelectorAll('.ttable tbody tr').length === n, all + 1);
  const back = await page.evaluate(id => { const t = AdhocStore.get(id); return t && Promise.all(t.attachments.map(a => AdhocStore.getImage(a.id))).then(i => ({n: t.questions.length, imgs: i.filter(Boolean).length})); }, wsId);
  ok(back && back.n === 5 && back.imgs === 2, 'import brings the test and its photos back');
  const ev = await page.evaluate(() => AdhocStore.get('evil1'));
  ok(ev && ev.questions.length === 1 && ev.questions[0].type === 'area_model', 'bad questions in an import are dropped');
  ok(!(await page.evaluate(() => AdhocStore.getImage('bad1'))), 'non-picture data refused');
  await go('adventurepack/stickerquest/index.html#tests/evil1');
  await page.waitForSelector('#adhoc .mq-ptitle');
  ok(!(await page.evaluate(() => window.__xss)) && !(await page.$('#adhoc img')), 'imported markup never runs on the kids\' page');
  await page.evaluate(() => { const db = JSON.parse(localStorage.getItem('hub_adhocDB')); db.tests = db.tests.filter(t => t.id !== 'evil1'); localStorage.setItem('hub_adhocDB', JSON.stringify(db)); });

  /* ---------- G. Print view ---------- */
  await go('admin/print.html#' + wsId);
  await page.waitForSelector('.sheet');
  ok((await page.$$('.sheet ol.qs > li')).length === 5, 'worksheet lists every question');
  ok((await page.$$('.key li')).length === 5, 'answer key');
  ok(/942/.test(await page.innerText('.key')), 'answer key has 157 × 6 = 942');
  ok(await page.evaluate(() => document.getAnimations().length) === 0, 'no animations on the printout');
  await page.emulateMedia({media: 'print'});
  ok(await page.isHidden('#bar'), 'buttons hidden when printing');
  await page.emulateMedia({media: 'screen'});
  await go('admin/print.html#ch5-check');
  ok((await page.$$('.sheet ol.qs > li')).length === 10, 'recipe test prints with fresh numbers');

  /* ---------- H. The old Admin page uses the same PIN ---------- */
  await go('admin/index.html');
  ok(await page.isVisible('#app'), 'same session opens Hub Admin');
  ok(await page.$('a[href="tests.html"]'), 'Hub Admin links to Ad-hoc Tests');

  ok(!external.length, 'requests left the device: ' + external.join(', '));
  ok(!errors.length, 'page errors: ' + errors.join(' | '));
  await browser.close(); server.close();
  console.log(fail ? `\n${fail} problem(s)` : 'OK: Admin + Ad-hoc Tests work end to end');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
