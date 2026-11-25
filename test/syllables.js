// Bongo's Syllable Beats: checks the lesson data. Run: node test/syllables.js
const D = require('../syllables/js/data.js');
let bad = 0;
const err = m => { bad++; console.error('✗ ' + m); };
const KINDS = { kg: ['count', 'jumble', 'missing', 'pick'], g3: ['count', 'jumble', 'missing', 'chop', 'rule', 'build'] };
const ids = new Set();
let words = 0;
Object.values(D.tracks).forEach(T => {
  const all = [];
  T.lessons.forEach((L, i) => {
    if (ids.has(L.id)) err('duplicate lesson id ' + L.id); ids.add(L.id);
    if (L.id[0] !== T.id[0]) err(`${L.id}: id must start with "${T.id[0]}" (Admin counts lessons by it)`);
    ['title', 'emoji', 'intro', 'trick'].forEach(k => { if (!L[k]) err(`${L.id}: missing ${k}`); });
    if (!L.sticker || !L.sticker.emoji || !L.sticker.name) err(`${L.id}: sticker`);
    if (!L.joke || !L.joke.q || !L.joke.a) err(`${L.id}: joke`);
    if (!L.quiz.length) err(`${L.id}: no quiz`);
    L.quiz.forEach(k => { if (!KINDS[T.id].includes(k)) err(`${L.id}: quiz kind ${k} not for ${T.id}`); });
    if (!!L.master !== (i === T.lessons.length - 1)) err(`${L.id}: only the last lesson is the master challenge`);
    if (!L.master && L.words.length < 5) err(`${L.id}: needs at least 5 words`);
    if (!L.master && L.read > L.words.length) err(`${L.id}: reads more words than it has`);
    if (T.id === 'g3' && !L.sentence) err(`${L.id}: G3 lessons read a sentence`);
    L.words.forEach(w => {
      words++;
      const P = w.w.split('-');
      if (!/^[a-z]+(-[a-z]+)*$/.test(w.w)) err(`${L.id}: bad word "${w.w}"`);
      if (P.some(p => !/[aeiouy]/.test(p))) err(`${L.id}: "${w.w}" has a syllable with no vowel`);
      if (!w.e || !w.fun) err(`${L.id}: "${w.w}" needs a picture and a fun note`);
      if (w.say && w.say.length !== P.length) err(`${L.id}: "${w.w}" say has ${w.say.length} parts, word has ${P.length}`);
      if (all.some(x => x.w.replace(/-/g, '') === w.w.replace(/-/g, '') && x.w !== w.w)) err(`"${w.w}" is split two different ways`);
      all.push(w);
      // jumble needs cards that can be out of order; chop/rule need at least one cut
      const needsMulti = L.quiz.some(k => ['jumble', 'missing', 'chop', 'rule', 'build'].includes(k));
      if (needsMulti && !L.words.some(x => x.w.includes('-'))) err(`${L.id}: jumble/chop need multi-syllable words`);
    });
  });
  // KG: every beat count 1–4 appears so "pick" always has distinct options
  const counts = new Set(all.map(w => w.w.split('-').length));
  [1, 2, 3].forEach(n => { if (!counts.has(n)) err(`${T.id}: no ${n}-beat words for pick questions`); });
});
console.log(bad ? 'syllables: ' + bad + ' problems' : `syllables ok: ${ids.size} lessons, ${words} words`);
process.exit(bad ? 1 : 0);
