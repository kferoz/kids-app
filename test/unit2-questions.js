// Unit 2 question bank: every question has a valid correct answer that is one of its options.
// Run: node test/unit2-questions.js
const path = require('path');
const QS = require(path.join(__dirname, '../adventurepack/stickerquest/src/data/unit2Questions.js'));

let fail = 0; const err = m => { console.log('FAIL: ' + m); fail++; };
const TYPES = ['multiple_choice', 'choose_two', 'matching', 'true_false_sentence'];
const ids = new Set();

QS.forEach(q => {
  const w = q.id || '(no id)';
  if (!q.id || ids.has(q.id)) err(`${w}: missing or duplicate id`);
  ids.add(q.id);
  if (!['easy', 'medium'].includes(q.difficulty)) err(`${w}: bad difficulty ${q.difficulty}`);
  if (!TYPES.includes(q.type)) err(`${w}: bad type ${q.type}`);
  ['prompt', 'explanation', 'audioText'].forEach(k => { if (typeof q[k] !== 'string' || !q[k].trim()) err(`${w}: missing ${k}`); });
  if ((q.explanation.match(/[.!?](\s|$)/g) || []).length > 2) err(`${w}: explanation is more than 2 sentences`);
  if (q.picture && /https?:|url\(|<image|href/i.test(q.picture)) err(`${w}: picture must be an emoji or inline SVG`);

  if (!Array.isArray(q.options) || q.options.length < 2) { err(`${w}: needs 2+ options`); return; }
  const optIds = q.options.map(o => o.id);
  if (new Set(optIds).size !== optIds.length) err(`${w}: duplicate option ids`);
  q.options.forEach(o => { if (!o.text) err(`${w}: option ${o.id} has no text`); });
  const isOpt = a => optIds.includes(a);

  if (q.type === 'multiple_choice' || q.type === 'true_false_sentence') {
    if (!isOpt(q.correctAnswer)) err(`${w}: correctAnswer ${q.correctAnswer} is not an option`);
    if (q.type === 'true_false_sentence' && optIds.join() !== 'T,F') err(`${w}: true/false options must be T,F`);
  } else if (q.type === 'choose_two') {
    const a = q.correctAnswers;
    if (!Array.isArray(a) || a.length !== 2 || a[0] === a[1]) err(`${w}: choose_two needs 2 different answers`);
    else a.forEach(x => { if (!isOpt(x)) err(`${w}: answer ${x} is not an option`); });
    if (q.options.length < 3) err(`${w}: choose_two needs a wrong option too`);
  } else if (q.type === 'matching') {
    const a = q.correctAnswers || {};
    const items = (q.items || []).map(i => i.id);
    if (items.length < 2) err(`${w}: matching needs 2+ items`);
    items.forEach(i => { if (!isOpt(a[i])) err(`${w}: item ${i} matches ${a[i]}, not an option`); });
    if (Object.keys(a).some(k => !items.includes(k))) err(`${w}: answer for an unknown item`);
    if (new Set(Object.values(a)).size !== items.length) err(`${w}: each option should match one item`);
  }
});

// Reading level: no sentence a child sees or hears is longer than 12 words.
const TOPICS = require(path.join(__dirname, '../adventurepack/stickerquest/src/data/unit2Topics.js'));
const kidText = QS.flatMap(q => [[q.id, q.prompt], [q.id, q.explanation],
  ...q.options.map(o => [q.id, o.text]), ...(q.items || []).map(o => [q.id, o.text])])
  .concat(TOPICS.flatMap(t => [...t.facts, t.story].map(s => ['topic' + t.n, s])));
kidText.forEach(([w, t]) => t.split(/(?<=[.!?])\s+/).forEach(s => {
  const n = s.split(/\s+/).filter(x => /[A-Za-z0-9]/.test(x)).length;
  if (n > 12) err(`${w}: ${n}-word sentence: ${s}`);
}));
TOPICS.forEach(t => { const n = t.story.split(/(?<=[.!?])\s+/).length; if (n < 2 || n > 4) err(`topic${t.n}: story has ${n} sentences (want 2–4)`); });

const extra = QS.filter(q => !q.id.startsWith('sg')).length;
if (QS.length - extra !== 8) err(`expected the 8 study guide questions, found ${QS.length - extra}`);
if (extra < 10 || extra > 15) err(`expected 10–15 extra questions, found ${extra}`);

console.log(`${QS.length} questions (${QS.filter(q => q.difficulty === 'easy').length} easy, ${QS.filter(q => q.difficulty === 'medium').length} medium)`);
console.log(fail ? `${fail} FAILED` : 'ALL OK');
process.exit(fail ? 1 : 0);
