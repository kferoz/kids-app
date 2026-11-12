// Ad-hoc Math Tests tab in Sticker Quest, driven in headless Chromium at phone size.
// Run: node test/adhoc-ui.js   (needs playwright-core: set PLAYWRIGHT_CORE to its folder if it isn't installed here,
// and the cached Chromium in %LOCALAPPDATA%/ms-playwright, or CHROME=<path to chrome>).
// Serves the repo on a spare port so the kids' real file:// data is never touched.
const http = require('http'), fs = require('fs'), path = require('path'), os = require('os');
const { chromium } = require(process.env.PLAYWRIGHT_CORE || 'playwright-core');
const ROOT = path.join(__dirname, '..');
const SHOTS = process.env.SHOTS || '';
const CHROME = process.env.CHROME || path.join(os.homedir(), 'AppData/Local/ms-playwright/chromium-1223/chrome-win64/chrome.exe');
const TYPES = {'.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json', '.png': 'image/png'};

let fail = 0; const err = m => { console.log('FAIL: ' + m); fail++; };
const ok = (c, m) => { if (!c) err(m); };

const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split(/[?#]/)[0]));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, {'Content-Type': TYPES[path.extname(p)] || 'application/octet-stream'});
  fs.createReadStream(p).pipe(res);
});

(async () => {
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const URL = `http://127.0.0.1:${server.address().port}/adventurepack/stickerquest/index.html#adhoc`;
  const browser = await chromium.launch({executablePath: CHROME});
  const errors = [];
  async function open(opts = {}){
    const ctx = await browser.newContext({viewport: {width: 390, height: 844}, reducedMotion: opts.reduce ? 'reduce' : 'no-preference'});
    const page = await ctx.newPage();
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errors.push(m.text()); });
    page.on('response', r => { if (r.status() >= 400 && !/favicon/.test(r.url())) errors.push(r.status() + ' ' + r.url()); });
    await page.addInitScript(noTts => {
      window.__mqTest = true;
      // Close Hub celebrations ($1, level-up, surprise gift) as they pop up, so they never cover buttons.
      addEventListener('DOMContentLoaded', () => new MutationObserver(()=>document.querySelectorAll('.kb-ok').forEach(b=>b.click())).observe(document.documentElement,{childList:true,subtree:true}));
      if (noTts) { try { delete window.speechSynthesis; } catch (e) {} window.speechSynthesis = undefined; window.SpeechSynthesisUtterance = undefined; }
    }, !!opts.noTts);
    await page.goto(URL);
    await page.waitForSelector('#adhoc .mq-test');
    return {ctx, page};
  }
  const shot = async (page, name) => { if (SHOTS) await page.screenshot({path: path.join(SHOTS, name + '.png'), fullPage: false}); };
  const noHScroll = async (page, where) => ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${where}: page scrolls sideways`);
  // Close the kidbar's $1 celebration if one pops up, so it never covers the buttons.
  const clearParty = page => page.evaluate(() => document.querySelectorAll('.kb-ok').forEach(b => b.click()));

  const state = page => page.evaluate(() => {
    const S = window.__mqState(); if (!S) return null;
    const q = S.q;
    return {i: S.i, n: S.qs.length, done: S.done, attempt: S.attempt, streak: S.streak, type: q.type, kind: q.answerKind,
      fields: q.fields ? q.fields.map(f => ({id: f.id, answer: f.answer})) : null,
      options: q.options ? q.options.map(o => o.id) : null, correct: q.correctAnswers, model: q.model ? q.model.fields : null,
      ids: S.qs.map(x => x.id)};
  });
  async function typeNumber(page, n){ for (const d of String(n)) await page.click(`#adhoc .mq-key[data-key="${d}"]`); }
  async function answer(page, s, right){
    if (s.kind === 'choice'){
      const pickIds = right ? s.correct : (s.correct.length === 1 || s.type === 'choose_correct_ways'
        ? s.options.filter(id => !s.correct.includes(id)).slice(0, s.type === 'choose_correct_ways' ? 2 : 1)
        : s.options.filter(id => !s.correct.includes(id)).slice(0, 1));
      // clear what's picked, then pick
      for (const id of s.options) {
        const on = await page.getAttribute(`#adhoc .mq-opt[data-opt="${id}"]`, 'aria-pressed');
        if ((on === 'true') !== pickIds.includes(id)) await page.click(`#adhoc .mq-opt[data-opt="${id}"]`);
      }
    } else {
      for (const f of s.fields){
        const cls = await page.getAttribute(`#adhoc .mq-blank[data-f="${f.id}"]`, 'class');
        if (/\bright\b/.test(cls)) continue;
        if (s.model && s.model.includes(f.id)) await page.click(`#adhoc svg rect[data-f="${f.id}"]`, {force: true});
        else await page.click(`#adhoc .mq-blank[data-f="${f.id}"]`);
        for (let k = 0; k < 4; k++) await page.click('#adhoc .mq-key[data-key="del"]');
        await typeNumber(page, right ? f.answer : f.answer + 1);
      }
    }
    await page.click('#adhoc [data-act="check"]');
  }

  /* ---- 1. Home: grouped by date, newest first, badges, mix button ---- */
  {
    const {ctx, page} = await open();
    const dates = await page.$$eval('#adhoc .mq-date', h => h.map(x => x.textContent.trim()));
    ok(dates[0].includes('Nov 11, 2026') && dates[dates.length - 1].includes('Nov 9, 2026'), 'dates newest first: ' + dates);
    const cards = await page.$$eval('#adhoc .mq-test', c => c.map(x => x.innerText));
    ok(cards.length === 4, 'four sample tests');
    ok(cards.some(c => c.includes('Chapter 5 Multiplication Check') && c.includes('10 questions')), 'card shows title + count');
    ok(await page.$eval('#adhoc .lv-hard', b => b.textContent.trim()) === '★★★', 'hard badge ★★★');
    ok(await page.$eval('#adhoc .lv-easy', b => b.textContent.trim()) === '★', 'easy badge ★');
    ok(await page.$('#adhoc [data-act="mix"]'), 'Practice Mix button');
    ok(await page.$('#adhoc .mq-toggle'), 'Read everything toggle with speech');
    const small = await page.$$eval('#adhoc button', bs => bs.filter(b => b.offsetParent && b.getBoundingClientRect().height < 48).map(b => b.textContent.trim()));
    ok(!small.length, 'tap targets under 48px: ' + small);
    await noHScroll(page, 'home');
    await shot(page, '1-home');

    /* ---- 2. Play the Chapter 5 check: wrong→explain→retry, hints, streak, stickers ---- */
    const stickers0 = await page.evaluate(() => save.stickers.length);
    await page.click('#adhoc .mq-test[data-test="ch5-check"]');
    await page.waitForSelector('#adhoc .mq-q');
    const fs1 = await page.$eval('#adhoc .mq', el => parseFloat(getComputedStyle(el).fontSize));
    ok(fs1 >= 20, 'body text 20px+');
    let s = await state(page);
    ok(s.n === 10, 'ten questions');
    // hint once
    await page.click('#adhoc [data-act="hint"]');
    ok(await page.isVisible('#adhoc .mq-hint'), 'hint shows');
    ok(await page.isDisabled('#adhoc [data-act="hint"]'), 'hint only once');
    // wrong first
    await answer(page, s, false);
    s = await state(page);
    ok(s.attempt === 1 && !s.done, 'one retry after a miss');
    ok(await page.isVisible('#adhoc .mq-explain'), 'explanation after a miss');
    ok(await page.$eval('#adhoc .mq-q', e => e.classList.contains('mq-wiggle')), 'wiggle on a miss');
    await shot(page, '2-retry');
    await answer(page, s, true);
    s = await state(page);
    ok(s.done, 'retry right finishes the question');
    ok(await page.isVisible('#adhoc [data-act="next"]'), 'Next shows');
    let sawConfetti = false, sawFlame = false, sawArea = false, sawGot = false;
    for (let k = 1; k < 10; k++){
      await page.click('#adhoc [data-act="next"]');
      await page.waitForSelector('#adhoc .mq-q');
      s = await state(page);
      if (s.type === 'area_model' && !sawArea){ sawArea = true; await page.waitForSelector('#adhoc svg rect'); await shot(page, '3-area'); await noHScroll(page, 'area'); }
      if (s.type === 'true_false_equations') await shot(page, '3-truefalse');
      await answer(page, s, true);
      await page.waitForTimeout(30);
      if (await page.$('.mq-confetti')) sawConfetti = true;
      if (await page.isVisible('#adhoc .mq-got')) sawGot = true;
      if (await page.isVisible('#adhoc .mq-flame')) sawFlame = true;
      s = await state(page);
      ok(s.done, `question ${k + 1} (${s.type}) accepted the right answer`);
      if (k === 3) { ok(s.streak === 3, 'streak counts first-try rights'); ok(await page.isVisible('#adhoc .mq-flame'), 'flame at 3 in a row'); await shot(page, '4-flame'); }
      await clearParty(page);
    }
    ok(sawConfetti, 'confetti on a right answer'); ok(sawFlame, 'flame badge'); ok(sawGot, 'sticker message'); ok(sawArea, 'met an area model');
    const steps = await page.$$eval('#adhoc .mq-step.s-full', x => x.length);
    ok(steps === 9, 'path shows 9 full stars, got ' + steps);
    ok(await page.evaluate(() => save.stickers.length) > stickers0, 'stickers added to the book');
    await page.click('#adhoc [data-act="next"]');
    await page.waitForSelector('#adhoc .mq-end');
    const endText = await page.$eval('#adhoc .mq-end', e => e.innerText);
    ok(!/%/.test(endText), 'no percentage on the end screen');
    ok(await page.$$eval('#adhoc .mq-star.on', x => x.length) === 3, '9.5/10 = 3 stars');
    ok(/You got these right/.test(endText), 'topics right listed');
    ok(await page.$('#adhoc .mq-prize-st'), 'reward sticker');
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('stickerQuest_v1')).adhoc);
    ok(saved.results['ch5-check'].best === 3, 'best stars saved');
    await noHScroll(page, 'end');
    await shot(page, '5-end');
    // try again with new numbers
    const firstIds = s.ids;
    await page.click('#adhoc [data-act="again"]');
    await page.waitForSelector('#adhoc .mq-q');
    s = await state(page);
    ok(s.ids.join() !== firstIds.join(), 'try again uses new numbers');
    // keyboard typing works on an input question
    await page.click('#adhoc [data-act="home"]');
    await page.click('#adhoc .mq-test[data-test="ch5-area"]');
    s = await state(page);
    for (const f of s.fields){ await page.click(`#adhoc .mq-blank[data-f="${f.id}"]`); await page.keyboard.type(String(f.answer)); }
    await page.keyboard.press('Enter');
    ok((await state(page)).done, 'typing on a real keyboard + Enter works');
    // practice mix
    await page.click('#adhoc [data-act="home"]');
    await page.click('#adhoc [data-act="mix"]');
    s = await state(page);
    ok(s.n === 10 && new Set(s.ids).size === 10, 'Practice Mix: 10 different questions');
    await ctx.close();
  }

  /* ---- 3. Hard test aced → $1 challenge; a fully missed question shows the answer ---- */
  {
    const {ctx, page} = await open();
    await page.click('#adhoc .mq-test[data-test="ch5-big"]');
    let s = await state(page);
    await answer(page, s, false); s = await state(page); await answer(page, s, false);
    s = await state(page);
    ok(s.done, 'two misses move on');
    ok(await page.$$eval('#adhoc .shown', x => x.length) > 0, 'the answer is shown after two misses');
    await page.click('#adhoc [data-act="home"]');
    await page.click('#adhoc .mq-test[data-test="ch5-big"]');
    for (let k = 0; k < 8; k++){
      s = await state(page); await answer(page, s, true); await clearParty(page);
      await page.click('#adhoc [data-act="next"]');
    }
    await page.waitForSelector('#adhoc .mq-end');
    const aced = await page.evaluate(() => JSON.parse(localStorage.getItem('stickerQuest_v1')).adhoc.aced);
    ok(aced.includes('ch5-big'), 'hard test with 3 stars is recorded for the $1 challenge');
    const won = await page.evaluate(() => window.DollarBank && DollarBank.earnedNow ? DollarBank.earnedNow(k => { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }).map(d => d.id) : null);
    if (won) ok(won.includes('stickerquest:adhoc-ch5-big'), 'Dollar Bank sees the hard-test win');
    await ctx.close();
  }

  /* ---- 4. No speech: no read buttons, nothing broken. Reduced motion: no confetti ---- */
  {
    const {ctx, page} = await open({noTts: true, reduce: true});
    ok(!(await page.$('#adhoc .mq-toggle')), 'no Read-everything toggle without speech');
    await page.click('#adhoc .mq-test[data-test="ch5-warmup"]');
    ok(!(await page.$('#adhoc [data-act="read"]')), 'no 🔊 without speech');
    const s = await state(page); await answer(page, s, true);
    ok(!(await page.$('.mq-confetti')), 'no confetti with reduced motion');
    ok((await state(page)).done, 'still plays without speech');
    await ctx.close();
  }

  ok(!errors.length, 'page errors: ' + errors.join(' | '));
  await browser.close(); server.close();
  console.log(fail ? `\n${fail} problem(s)` : 'OK: Ad-hoc Tests tab works');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
