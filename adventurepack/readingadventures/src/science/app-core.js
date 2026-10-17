/* =====================================================================
   SCIENCE TEST PREP — APP PART 1: state, navigation, hub, lessons, stories, quiz engine
   Uses globals from the main app: setView, viewStack, speakText, escapeHtml, buildTrickyMap, wordDisplay,
   syllablesOn, ICONS, buildConfetti, CONFETTI_EMOJI, pickRandom, queueCelebration/showNextCelebration, closeCelebrate.
   ===================================================================== */
const SCI_KEY = 'readingAdventuresScience_v1';
function sciDefault(){ return { lessons:{}, stories:{}, quiz:{}, sorts:{}, speed:0, patterns:0, cloze:0, match:0, test:{best:0, attempts:0}, cards:{}, labs:{}, mistakes:[], badges:{}, stickers:{} }; }
function sciLoad(){ try{ const raw = localStorage.getItem(SCI_KEY); return raw ? Object.assign(sciDefault(), JSON.parse(raw)) : sciDefault(); }catch(e){ return sciDefault(); } }
function sciSave(){ try{ localStorage.setItem(SCI_KEY, JSON.stringify(sciP)); }catch(e){} }
let sciP = sciLoad();

function sciShuffle(a){ a = a.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
function sciPick(a,n){ return sciShuffle(a).slice(0,n); }
function sciTopic(id){ return SCI_TOPICS.find(t=>t.id===id); }
function sciStopSpeech(){ if('speechSynthesis' in window) speechSynthesis.cancel(); }
function sciSay(t){ speakText(t); }

/* ---------- navigation ---------- */
let sciState = { screen:'hub', param:null, idx:0 };
let sciCleanup = null;
let sciRun = null;
const SCI_PARENT = { lesson:'hub', stories:'hub', story:'stories', games:'hub', quizmenu:'hub', cheat:'hub', lab_magnet:'games', lab_force:'games', lab_electro:'games', flash:'games', match:'games' };

function showScience(){
  viewStack = (viewStack[viewStack.length-1]==='library' && currentGrade) ? ['home','library','science'] : ['home','science'];
  sciState = { screen:'hub', param:null, idx:0 };
  sciRender(); setView('science');
}
function sciGo(screen, param, idx){
  if(sciCleanup){ try{ sciCleanup(); }catch(e){} sciCleanup = null; }
  sciStopSpeech();
  sciState = { screen, param: param===undefined?null:param, idx: idx||0 };
  sciRender();
  window.scrollTo({ top:0, behavior:'smooth' });
}
function sciBack(){
  if(viewStack[viewStack.length-1] !== 'science') return false;
  if(sciState.screen === 'hub') return false;
  let par = SCI_PARENT[sciState.screen] || 'hub';
  if(sciState.screen === 'run') par = (sciRun && sciRun.cfg.back) || 'hub';
  sciGo(par);
  return true;
}
function sciRender(){
  const el = document.getElementById('scienceView');
  const map = { hub:sciHub, lesson:sciLesson, stories:sciStories, story:sciStory, games:sciGames, lab_magnet:sciMagnetLab, lab_force:sciForceLab, lab_electro:sciElectroLab, flash:sciFlash, match:sciMatch, run:sciRunView, quizmenu:sciQuizMenu, cheat:sciCheat };
  (map[sciState.screen] || sciHub)(el);
}

/* ---------- badges ---------- */
const SCI_BADGES = [
  { id:'lessons', e:'📘', n:'Lesson Learner', d:'Finish all 4 lessons', ok:()=> SCI_TOPICS.every(t=>sciP.lessons[t.id]) },
  { id:'stories5', e:'📖', n:'Story Star', d:'Pass 5 science stories', ok:()=> Object.values(sciP.stories).filter(s=>s.done).length>=5 },
  { id:'stories10', e:'📚', n:'Story Champion', d:'Pass all 10 stories', ok:()=> Object.values(sciP.stories).filter(s=>s.done).length>=SCI_STORIES.length },
  { id:'labs', e:'🔬', n:'Lab Explorer', d:'Try all 3 labs', ok:()=> sciP.labs.magnet && sciP.labs.force && sciP.labs.electro },
  { id:'sorter', e:'🧩', n:'Sorting Pro', d:'Get a perfect sort game', ok:()=> Object.keys(SCI_SORTS).some(k=> (sciP.sorts[k]||0) >= SCI_SORTS[k].items.length) },
  { id:'speed', e:'⚡', n:'Speed Champ', d:'11+ right in Speed Round', ok:()=> sciP.speed>=11 },
  { id:'motion', e:'🏃', n:'Motion Master', d:'80%+ on Motion quiz', ok:()=> (sciP.quiz.motion||0)>=80 },
  { id:'forces', e:'💪', n:'Force Master', d:'80%+ on Forces quiz', ok:()=> (sciP.quiz.forces||0)>=80 },
  { id:'magnets', e:'🧲', n:'Magnet Master', d:'80%+ on Magnets quiz', ok:()=> (sciP.quiz.magnets||0)>=80 },
  { id:'electro', e:'⚡', n:'Electro Master', d:'80%+ on Electromagnets quiz', ok:()=> (sciP.quiz.electro||0)>=80 },
  { id:'test', e:'🏆', n:'Test Ready!', d:'90%+ on the Practice Test', ok:()=> sciP.test.best>=90 }
];
function sciCheckBadges(){
  SCI_BADGES.forEach(b => {
    if(!sciP.badges[b.id] && b.ok()){
      sciP.badges[b.id] = true;
      queueCelebration('sci', { emoji:b.e, title:`New badge: ${b.n}!`, msg:b.d });
    }
  });
  sciSave();
  showNextCelebration();
}
function sciCelebrate(p){
  const overlay = document.getElementById('celebrateOverlay');
  const card = document.getElementById('celebrateCard');
  card.className = 'celebrate-card';
  card.innerHTML = `${buildConfetti(CONFETTI_EMOJI, 22)}<div class="big-emoji">${p.emoji}</div><h3>${escapeHtml(p.title)}</h3><p>${escapeHtml(p.msg)}</p><button class="btn pink" onclick="closeCelebrate()">Awesome! 🎉</button>`;
  overlay.classList.add('show');
}

/* ---------- hub ---------- */
function sciStat(){
  const lessons = SCI_TOPICS.filter(t=>sciP.lessons[t.id]).length;
  const stories = Object.values(sciP.stories).filter(s=>s.done).length;
  const labs = ['magnet','force','electro'].filter(k=>sciP.labs[k]).length;
  const quizzes = SCI_TOPICS.filter(t=>sciP.quiz[t.id]!==undefined).length;
  return { lessons, stories, labs, quizzes };
}
function sciHub(el){
  const st = sciStat();
  const badgesOn = SCI_BADGES.filter(b=>sciP.badges[b.id]).length;
  const step = (n,emoji,title,desc,status,done,fn,color) => `
    <button class="sci-step" style="--c:${color}" onclick="${fn}">
      <span class="num">STEP ${n}</span><div class="big">${emoji}</div><h3>${title}</h3><p>${desc}</p>
      <span class="status ${done?'done':''}">${status}</span></button>`;
  const ready = SCI_TOPICS.map(t => {
    const v = sciP.quiz[t.id];
    return `<div class="sci-ready-row"><span>${t.emoji} ${t.title}</span><div class="sci-bar" style="--c:${t.color}"><i style="width:${v||0}%"></i></div><span>${v===undefined?'—':v+'%'}</span></div>`;
  }).join('') + `<div class="sci-ready-row"><span>📝 Practice Test</span><div class="sci-bar" style="--c:#16a34a"><i style="width:${sciP.test.best||0}%"></i></div><span>${sciP.test.attempts? sciP.test.best+'%':'—'}</span></div>`;
  const weak = SCI_TOPICS.filter(t=>sciP.quiz[t.id]!==undefined && sciP.quiz[t.id]<80).map(t=>t.title);
  const stickers = Object.values(sciP.stickers).join(' ');
  el.innerHTML = `
    <div class="sci-hero">
      <span class="sci-tag" style="background:#fde047;color:#4c1d95;">THIS WEEK’S TEST</span>
      <h2>🔬 Science Test Prep</h2>
      <p>Review motion, forces, magnets, and electromagnetism. Start easy, then go deeper. You can do it!</p>
      <div class="sci-chips">${SCI_TOPICS.map(t=>`<span class="sci-chip">${t.emoji} ${t.title}</span>`).join('')}</div>
    </div>

    <div class="sci-section-title">🗺️ Your Study Path <small>follow the steps in order, or jump around</small></div>
    <div class="sci-grid">
      ${step(1,'📘','Learn It','Short lessons with pictures and a teacher voice, then a quick check.', st.lessons+' of 4 lessons done', st.lessons===4, "sciGo('lesson',null)", '#3b82f6')}
      ${step(2,'📖','Practice Stories','10 science stories with questions that explain every answer.', st.stories+' of '+SCI_STORIES.length+' stories passed', st.stories===SCI_STORIES.length, "sciGo('stories')", '#f97316')}
      ${step(3,'🎮','Play & Explore','Magnet lab, force lab, electromagnet builder, sorting games, and flashcards.', st.labs+' of 3 labs tried', st.labs===3, "sciGo('games')", '#10b981')}
      ${step(4,'⭐','Quizzes & Speed Round','Topic quizzes, true-or-false speed round, and your Practice Test.', st.quizzes+' of 4 topic quizzes tried', st.quizzes===4, "sciGo('quizmenu')", '#8b5cf6')}
      ${step(5,'🛠️','Fix My Mistakes', sciP.mistakes.length? 'Practice the questions you missed.' : 'Questions you miss will show up here.', sciP.mistakes.length+' to fix', sciP.mistakes.length===0, "sciStartMistakes()", '#ef4444')}
      ${step(6,'📄','Cheat Sheet','One page of the most important facts. You can print it!','Read it before the test', false, "sciGo('cheat')", '#0ea5e9')}
    </div>

    <div class="sci-section-title">📊 How ready am I? <small>best quiz scores${weak.length? ' · focus on: <b>'+weak.join(', ')+'</b>' : ''}</small></div>
    <div class="card"><div class="sci-ready">${ready}</div></div>

    <div class="sci-section-title">🏅 My Science Badges <small>${badgesOn} of ${SCI_BADGES.length}</small> ${stickers? '<span style="font-size:1.4rem;margin-left:.4rem;">'+stickers+'</span>':''}</div>
    <div class="sci-badges">${SCI_BADGES.map(b=>`<div class="sci-badge ${sciP.badges[b.id]?'on':''}"><span class="e">${b.e}</span>${b.n}<small>${b.d}</small></div>`).join('')}</div>

    <div class="sci-section-title">🧠 Test-day tips</div>
    <div class="sci-tips"><ul>
      <li>Read each question twice. Then read all the answers before you choose.</li>
      <li>Cross out answers you know are wrong. Then pick the best one left.</li>
      <li>Look for key words like <b>push, pull, balanced, attract, repel, current</b>.</li>
      <li>Think of an example you know (a swing, a tug-of-war, a fridge magnet).</li>
      <li>Remember: <b>not all metals are magnetic</b>, and electromagnets <b>turn on and off</b>.</li>
    </ul></div>
    <details class="sci-plan"><summary>📅 Suggested 5-day study plan</summary><ol>
      <li><b>Day 1 – Motion:</b> Lesson 1, stories 1–2, Motion quiz.</li>
      <li><b>Day 2 – Forces:</b> Lesson 2, stories 3–5, Force Lab, Forces quiz.</li>
      <li><b>Day 3 – Magnets:</b> Lesson 3, stories 6–8, Magnet Lab, Magnets quiz.</li>
      <li><b>Day 4 – Electromagnets:</b> Lesson 4, stories 9–10, Electromagnet Lab, quiz. Flashcards.</li>
      <li><b>Day 5 – Review:</b> Speed Round, Practice Test, Fix My Mistakes, Cheat Sheet.</li>
    </ol></details>
  `;
}

/* ---------- lessons ---------- */
function sciLesson(el){
  const topicId = sciState.param;
  if(!topicId){
    el.innerHTML = `<div class="card"><h2 style="margin-top:0;">📘 Choose a lesson</h2><div class="sci-grid">` +
      SCI_TOPICS.map(t => `<button class="sci-step topic" style="--c:${t.color};--bgc:${t.bg}" onclick="sciGo('lesson','${t.id}',0)"><div class="big">${t.emoji}</div><h3>${t.title}</h3><p>${SCI_LESSONS[t.id].slides.length} short slides + word wall</p><span class="status ${sciP.lessons[t.id]?'done':''}">${sciP.lessons[t.id]?'✓ Quick check passed':'Not finished'}</span></button>`).join('') + `</div></div>`;
    return;
  }
  const t = sciTopic(topicId), L = SCI_LESSONS[topicId];
  const total = L.slides.length + 1;       // + word wall
  const idx = sciState.idx;
  const dots = `<div class="sci-dots" style="--c:${t.color}">${Array.from({length:total}).map((_,i)=>`<i class="${i===idx?'on':''}"></i>`).join('')}</div>`;
  let body;
  if(idx < L.slides.length){
    const s = L.slides[idx];
    body = `<div class="sci-slide">
      <div class="sci-lesson-art">${SCI_ART[s.art]()}</div>
      <h2 style="color:${t.color}">${t.emoji} ${s.title}</h2>
      ${s.text.map(x=>`<p>${escapeHtml(x)}</p>`).join('')}
      <div class="sci-remember">💡 Remember: ${escapeHtml(s.remember)}</div>
    </div>`;
  } else {
    const words = SCI_VOCAB.filter(v=>v.t===topicId);
    body = `<div class="sci-slide"><h2 style="color:${t.color}">🧱 Word Wall: ${t.title}</h2><p>These words may be on the test. Say each one out loud!</p>
      <div class="sci-wordwall">${words.map(w=>`<div class="sci-word"><b>${w.e} ${escapeHtml(w.w)}</b><span class="syl">${syllablesOn? w.s : ''}</span><p>${escapeHtml(w.d)}</p><p style="color:#7a8296;">Example: ${escapeHtml(w.ex)}</p></div>`).join('')}</div></div>`;
  }
  const last = idx === total-1;
  el.innerHTML = `<div class="card">
      <div class="action-row sci-noprint"><button class="btn orange" onclick="sciReadSlide()">🔊 Read to me</button><button class="btn plain" onclick="sciStopSpeech()">⏹ Stop</button><span style="margin-left:auto;font-weight:800;color:#7a8296;">Slide ${idx+1} of ${total}</span></div>
      ${dots}${body}
      <div class="sci-nav">
        <button class="btn plain" ${idx===0?'disabled style="opacity:.4"':''} onclick="sciGo('lesson','${topicId}',${idx-1})">◀ Back</button>
        ${last ? `<button class="btn green" onclick="sciLessonCheck('${topicId}')">✅ Quick Check</button>` : `<button class="btn sci" onclick="sciGo('lesson','${topicId}',${idx+1})">Next ▶</button>`}
      </div></div>`;
}
function sciReadSlide(){
  const L = SCI_LESSONS[sciState.param]; const idx = sciState.idx;
  if(idx < L.slides.length){ const s = L.slides[idx]; sciSay(s.title + '. ' + s.text.join(' ') + ' Remember: ' + s.remember); }
  else sciSay(SCI_VOCAB.filter(v=>v.t===sciState.param).map(w=>w.w+'. '+w.d).join(' '));
}
function sciLessonCheck(topicId){
  const pool = SCI_BANK.filter(q=>q.topic===topicId && q.lvl===1);
  const t = sciTopic(topicId);
  sciStartRun({ title:`Quick Check: ${t.title}`, emoji:t.emoji, color:t.color, back:'lesson', backParam:topicId, kind:'lesson',
    build:()=> sciPick(pool,4).map(sciCloneQ),
    onFinish:(r)=>{ if(r.score >= 3){ sciP.lessons[topicId] = true; } } });
}

/* ---------- stories ---------- */
function sciStories(el){
  el.innerHTML = `<div class="sci-hero" style="background:linear-gradient(120deg,#f97316,#f43f5e)"><h2>📖 Science Practice Stories</h2><p>Read (or listen to) each story, then answer the questions. Every answer comes with an explanation!</p></div>
   <div class="sci-grid">` + SCI_STORIES.map(s => {
    const t = sciTopic(s.topic), pr = sciP.stories[s.id];
    return `<button class="sci-story-card" style="--c:${t.color}" onclick="sciGo('story','${s.id}')">
      ${pr&&pr.done?`<span class="done">✓ ${pr.best}/${pr.total}</span>`:''}
      <div class="ic">${ICONS[s.icon]}</div><div><span class="pill">${t.emoji} ${t.title}</span><span class="pill" style="background:#64748b">${'⭐'.repeat(s.level)}</span></div>
      <h3>${s.title}</h3><p>${s.blurb}</p></button>`; }).join('') + `</div>`;
}
let sciStoryAnswers = {};
function sciStory(el){
  const s = SCI_STORIES.find(x=>x.id===sciState.param);
  if(sciState.idx===0) sciStoryAnswers = {};     // fresh story
  const t = sciTopic(s.topic);
  const tm = buildTrickyMap(s);
  let wi = 0; const spoken = [];
  const lines = s.lines.map(line => `<p>${line.split(/\s+/).map(w => { const info = wordDisplay(w,tm); spoken.push(w.replace(/[“‘”’]/g,'')); return `<span class="word${info.isTricky?' tricky':''}" data-widx="${wi++}">${info.html}</span>`; }).join(' ')}</p>`).join('');
  const qs = s.questions.map((q,qi)=>`<div class="q-block"><div class="q-head"><h4>${qi+1}. ${escapeHtml(q.q)}</h4><button class="q-voice-btn" onclick="sciReadStoryQ(${qi})" title="Listen to this question and the choices">🔊</button></div>
    ${q.opts.map((o,oi)=>`<div class="opt" id="sopt-${qi}-${oi}" onclick="sciStoryPick(${qi},${oi})"><input type="radio" name="sq${qi}" readonly /><span>${escapeHtml(o)}</span></div>`).join('')}
    <div class="sci-qwhy" id="swhy-${qi}"></div></div>`).join('');
  const pr = sciP.stories[s.id];
  el.innerHTML = `<div class="card">
    <div class="story-head"><div class="icon-wrap">${ICONS[s.icon]}</div><div class="story-title-block"><h2>${s.title}${pr&&pr.done?' '+s.sticker.emoji:''}</h2><span class="level" style="background:${t.color}">${t.emoji} ${t.title}</span></div></div>
    <div class="action-row"><button class="btn orange" onclick="sciReadAloud()">🔊 Read Aloud</button><button class="btn plain" onclick="sciStopRead()">⏹ Stop</button>
      <button class="btn plain" id="sciSyllBtn" onclick="sciToggleSyll()">🔤 Syllables: ${syllablesOn?'ON':'OFF'}</button></div>
    <div class="tricky-panel"><h4>📚 Tricky Words</h4>${s.tricky.map(x=>`<span class="tricky-chip"><span class="syll">${syllablesOn?x.syll:x.word}</span><span class="meaning">${x.note}</span></span>`).join('')}</div>
    <div class="story-text" id="sciStoryText">${lines}</div></div>
    <div class="card"><h2 style="margin-top:0;font-size:1.25rem;">❓ Quick Check</h2>${qs}
      <div class="action-row"><button class="btn green" onclick="sciStoryCheck()">✅ Check My Answers</button><button class="btn plain" onclick="sciGo('story','${s.id}',0)">🔁 Try Again</button></div>
      <div class="score-box" id="sciScoreBox"></div></div>`;
  document.getElementById('scienceView').dataset.spoken = JSON.stringify(spoken);
}
function sciToggleSyll(){
  syllablesOn = !syllablesOn; const idx = sciState.idx; sciState.idx = 1; sciRender(); sciState.idx = idx;
  Object.keys(sciStoryAnswers).forEach(qi => { const e = document.getElementById(`sopt-${qi}-${sciStoryAnswers[qi]}`); if(e){ e.classList.add('selected'); e.querySelector('input').checked = true; } });
}
function sciStoryPick(qi,oi){
  const s = SCI_STORIES.find(x=>x.id===sciState.param);
  sciStoryAnswers[qi] = oi;
  s.questions[qi].opts.forEach((_,j)=>{ const e=document.getElementById(`sopt-${qi}-${j}`); e.classList.remove('selected','correct','wrong'); });
  const e = document.getElementById(`sopt-${qi}-${oi}`); e.classList.add('selected'); e.querySelector('input').checked = true;
}
function sciStoryCheck(){
  const s = SCI_STORIES.find(x=>x.id===sciState.param);
  let right = 0;
  s.questions.forEach((q,qi)=>{
    const ch = sciStoryAnswers[qi];
    q.opts.forEach((_,oi)=>{ const e=document.getElementById(`sopt-${qi}-${oi}`); e.classList.remove('selected','correct','wrong'); if(oi===q.a) e.classList.add('correct'); else if(oi===ch) e.classList.add('wrong'); });
    const w = document.getElementById(`swhy-${qi}`); w.textContent = '💡 ' + q.why; w.classList.add('show');
    if(ch===q.a) right++;
  });
  const total = s.questions.length, pass = Math.ceil(total*0.6);
  if(window.Tracker){ s.questions.forEach((q,qi)=>Tracker.answer(sciStoryAnswers[qi]===q.a, 'Science story: ' + s.title)); Tracker.complete('science-story', right, total, { item: 'Science story: ' + s.title, passed: right>=pass }); }
  const box = document.getElementById('sciScoreBox'); box.classList.add('show');
  const prev = sciP.stories[s.id] || {done:false,best:0,total};
  const isNew = !prev.done && right>=pass;
  sciP.stories[s.id] = { done: prev.done || right>=pass, best: Math.max(prev.best,right), total };
  if(right>=pass){ box.textContent = `You got ${right} out of ${total} correct! ` + (right===total? pickRandom(COMPLIMENTS_GREAT) : pickRandom(COMPLIMENTS_GOOD)); }
  else box.textContent = `You got ${right} out of ${total} correct. Read the 💡 hints, then try again! ` + pickRandom(COMPLIMENTS_RETRY);
  if(isNew){ sciP.stickers[s.id] = s.sticker.emoji; queueCelebration('sci',{ emoji:s.sticker.emoji, title:`You earned the "${s.sticker.name}" sticker!`, msg:`Great science reading on ${s.title}: ${right}/${total}.` }); }
  sciSave(); sciCheckBadges();
  box.scrollIntoView({behavior:'smooth', block:'center'});
}
function sciReadStoryQ(qi){ const q = SCI_STORIES.find(x=>x.id===sciState.param).questions[qi]; sciSay(q.q + '. ' + q.opts.map((o,i)=>'ABCDEF'[i]+'. '+o+'.').join(' ')); }
function sciReadAloud(){
  sciStopRead();
  const words = JSON.parse(document.getElementById('scienceView').dataset.spoken || '[]');
  const offsets = []; let pos = 0; words.forEach(w=>{ offsets.push(pos); pos += w.length+1; });
  const spans = Array.from(document.querySelectorAll('#sciStoryText .word'));
  speakText(words.join(' '), (e)=>{
    if(e.name && e.name!=='word') return;
    let idx = 0; for(let i=0;i<offsets.length;i++){ if(offsets[i] <= e.charIndex) idx = i; else break; }
    spans.forEach(sp=>sp.classList.remove('speaking'));
    if(spans[idx]){ spans[idx].classList.add('speaking'); spans[idx].scrollIntoView({behavior:'smooth',block:'center'}); }
  }, ()=> spans.forEach(sp=>sp.classList.remove('speaking')));
}
function sciStopRead(){ sciStopSpeech(); document.querySelectorAll('#sciStoryText .word.speaking').forEach(sp=>sp.classList.remove('speaking')); }

/* ---------- quiz engine (used for quizzes, sorts, true/false, patterns, cloze, lesson checks, practice test) ---------- */
function sciCloneQ(q){ return Object.assign({}, q, { opts: q.opts.slice() }); }
function sciShuffleOpts(q){ const correct = q.opts[q.a]; const o = sciShuffle(q.opts); return Object.assign({}, q, { opts:o, a:o.indexOf(correct) }); }
function sciStartRun(cfg){
  let qs = cfg.build();
  if(!cfg.keepOrder) qs = qs.map(sciShuffleOpts);
  sciRun = { cfg, qs, i:0, picked:null, score:0, streak:0, bestStreak:0, results:[], done:false };
  sciState = { screen:'run', param:null, idx:0 };
  if(sciCleanup){ try{ sciCleanup(); }catch(e){} sciCleanup=null; }
  sciStopSpeech(); sciRender(); window.scrollTo({top:0,behavior:'smooth'});
}
function sciRunView(el){
  if(!sciRun){ sciGo('hub'); return; }
  const r = sciRun, cfg = r.cfg;
  if(r.done){ return sciRunResults(el); }
  const q = r.qs[r.i], n = r.qs.length;
  const two = q.opts.length===2 && cfg.optColors;
  const pct = Math.round((r.i/n)*100);
  el.innerHTML = `<div class="card sci-run">
    <div class="sci-run-head"><span>${cfg.emoji} ${escapeHtml(cfg.title)}</span><span>${r.streak>=3?'🔥 '+r.streak+' in a row · ':''}Question ${r.i+1} of ${n}</span></div>
    <div class="sci-bar" style="--c:${cfg.color||'#8b5cf6'};margin-bottom:.8rem"><i style="width:${pct}%"></i></div>
    ${cfg.prompt?`<div class="sci-prompt">${escapeHtml(cfg.prompt)}</div>`:''}
    ${q.e?`<div class="sci-bigemoji">${q.e}</div>`:''}
    <div class="sci-q"><h3>${escapeHtml(q.q).replace(/____/g,'<span style="border-bottom:3px solid #8b5cf6;padding:0 1.6em;">&nbsp;</span>')}</h3><button class="q-voice-btn" onclick="sciReadRunQ()" title="Listen">🔊</button></div>
    <div class="sci-opts ${two?'two':''}">${q.opts.map((o,k)=>`<button class="sci-opt" id="sro-${k}" ${two?`style="background:${cfg.optColors[k]}"`:''} onclick="sciRunPick(${k})">${two?'':('ABCDEF'[k]+'. ')}${escapeHtml(o)}</button>`).join('')}</div>
    <div id="sciFeedback"></div></div>`;
}
function sciReadRunQ(){
  const q = sciRun.qs[sciRun.i];
  const two = q.opts.length===2 && sciRun.cfg.optColors;
  sciSay(q.q.replace(/____/g,'blank') + '. ' + (two ? 'Is it ' + q.opts.join(' or ') + '?' : q.opts.map((o,k)=>'ABCDEF'[k]+'. '+o+'.').join(' ')));
}
function sciRunPick(k){
  const r = sciRun; if(r.picked!==null) return;
  const q = r.qs[r.i]; r.picked = k;
  const ok = k===q.a;
  q.opts.forEach((_,j)=>{ const b=document.getElementById('sro-'+j); b.disabled = true; if(j===q.a) b.classList.add('correct'); else if(j===k) b.classList.add('wrong'); });
  if(!ok) document.getElementById('sro-'+k).classList.add('shake');
  if(ok){ r.score++; r.streak++; r.bestStreak = Math.max(r.bestStreak,r.streak); } else r.streak = 0;
  r.results.push({ q, ok, picked:k });
  if(window.Tracker) Tracker.answer(ok, 'Science: ' + ((q.topic && sciTopic(q.topic)) ? sciTopic(q.topic).title : r.cfg.title));
  if(q.id){ const m = sciP.mistakes; const at = m.indexOf(q.id); if(!ok && at<0) m.push(q.id); if(ok && at>=0) m.splice(at,1); sciSave(); }
  const last = r.i === r.qs.length-1;
  document.getElementById('sciFeedback').innerHTML = `<div class="sci-fb ${ok?'good':'bad'}">${ok? pickRandom(['✅ Correct!','🌟 Great job!','🎉 Yes!','👏 You got it!']) : '❌ Not quite. The answer is: <b>'+escapeHtml(q.opts[q.a])+'</b>'}${q.why?`<span class="why">💡 ${escapeHtml(q.why)}</span>`:''}</div>
    <div class="action-row" style="margin-top:.8rem"><button class="btn sci" onclick="sciRunNext()">${last?'See my results 🎯':'Next ▶'}</button></div>`;
}
function sciRunNext(){
  const r = sciRun; r.picked = null;
  if(r.i < r.qs.length-1){ r.i++; sciRender(); window.scrollTo({top:0,behavior:'smooth'}); return; }
  r.done = true;
  const byTopic = {}; r.results.forEach(x=>{ const t=x.q.topic; if(!t) return; byTopic[t] = byTopic[t]||{r:0,n:0}; byTopic[t].n++; if(x.ok) byTopic[t].r++; });
  r.byTopic = byTopic;
  if(window.Tracker) Tracker.complete('science-quiz', r.score, r.qs.length, { item: 'Science: ' + r.cfg.title, passed: r.score >= Math.ceil(r.qs.length*0.7) });
  if(r.cfg.onFinish) r.cfg.onFinish({ score:r.score, total:r.qs.length, byTopic, bestStreak:r.bestStreak });
  sciSave(); sciRender(); window.scrollTo({top:0,behavior:'smooth'}); sciCheckBadges();
}
function sciRunResults(el){
  const r = sciRun, cfg = r.cfg, n = r.qs.length, pct = Math.round(r.score/n*100);
  const stars = pct>=90?3:pct>=70?2:1;
  const msg = pct>=90 ? pickRandom(COMPLIMENTS_GREAT) : pct>=70 ? pickRandom(COMPLIMENTS_GOOD) : pickRandom(COMPLIMENTS_RETRY);
  const missed = r.results.filter(x=>!x.ok);
  const topicRows = Object.keys(r.byTopic||{}).length>1 ? `<div class="sci-ready" style="margin:1rem 0;text-align:left">` + Object.keys(r.byTopic).map(id=>{ const t=sciTopic(id), v=r.byTopic[id]; return `<div class="sci-ready-row"><span>${t.emoji} ${t.title}</span><div class="sci-bar" style="--c:${t.color}"><i style="width:${Math.round(v.r/v.n*100)}%"></i></div><span>${v.r}/${v.n}</span></div>`; }).join('') + `</div>` : '';
  const ready = cfg.kind==='test' ? (pct>=90?'🏆 You are TEST READY! Great work.':pct>=70?'👍 Almost there! Review the missed questions and try again.':'📚 Keep studying: use the lessons, then try again.') : '';
  el.innerHTML = `<div class="card sci-result">
    <div class="stars">${'⭐'.repeat(stars)}${'☆'.repeat(3-stars)}</div>
    <div class="score">${r.score} / ${n}</div><p style="font-weight:800;font-size:1.1rem;margin:.2rem 0">${msg}</p>
    <p style="margin:.2rem 0;color:#5b6479;">${cfg.title} · ${pct}%${r.bestStreak>=3?' · best streak 🔥 '+r.bestStreak:''}</p>
    ${ready?`<p style="font-weight:800">${ready}</p>`:''}${topicRows}
    <div class="action-row" style="justify-content:center;margin-top:.8rem">
      <button class="btn sci" onclick="sciStartRun(sciRun.cfg)">🔁 Play again</button>
      ${missed.length && cfg.kind!=='mistakes' ? `<button class="btn orange" onclick="sciStartMistakes()">🛠️ Fix my mistakes</button>`:''}
      <button class="btn plain" onclick="sciBack()">⬅ Back</button></div>
    ${missed.length ? `<div class="sci-missed"><h3>Let’s review ${missed.length} to remember:</h3>${missed.map(x=>`<div class="m"><b>${escapeHtml(x.q.q.replace(/____/g,'_____'))}</b><br>✅ <b class="ok">${escapeHtml(x.q.opts[x.q.a])}</b><br>💡 ${escapeHtml(x.q.why||'')}</div>`).join('')}</div>`:'<p style="font-weight:800;color:#15803d">Perfect! Nothing to review. 🎉</p>'}</div>`;
}
/* the back target of 'run' with a param (lesson) */
const _sciBackOrig = sciBack;
sciBack = function(){
  if(viewStack[viewStack.length-1]==='science' && sciState.screen==='run' && sciRun && sciRun.cfg.backParam){ const p = sciRun.cfg.backParam, b = sciRun.cfg.back; sciGo(b,p,0); return true; }
  if(viewStack[viewStack.length-1]==='science' && sciState.screen==='lesson' && sciState.param){ sciGo('lesson',null); return true; }
  return _sciBackOrig();
};

/* ---------- quiz menu + builders ---------- */
function sciBuildLevelled(pool, counts){
  const by = l => pool.filter(q=>q.lvl===l);
  return [].concat(sciPick(by(1),counts[0]), sciPick(by(2),counts[1]), sciPick(by(3),counts[2])).map(sciCloneQ);
}
function sciStartTopicQuiz(topic){
  const t = sciTopic(topic);
  sciStartRun({ title:`${t.title} Quiz`, emoji:t.emoji, color:t.color, back:'quizmenu', kind:'topic',
    build:()=> sciBuildLevelled(SCI_BANK.filter(q=>q.topic===topic),[2,3,3]),
    onFinish:(r)=>{ const pct = Math.round(r.score/r.total*100); sciP.quiz[topic] = Math.max(sciP.quiz[topic]||0, pct); } });
}
function sciStartTest(){
  sciStartRun({ title:'Practice Test', emoji:'📝', color:'#16a34a', back:'quizmenu', kind:'test',
    build:()=>{ let all=[]; SCI_TOPICS.forEach(t=>{ all = all.concat(sciBuildLevelled(SCI_BANK.filter(q=>q.topic===t.id),[1,2,2])); }); return all.sort((a,b)=>a.lvl-b.lvl || Math.random()-.5); },
    onFinish:(r)=>{ const pct = Math.round(r.score/r.total*100); sciP.test.best = Math.max(sciP.test.best,pct); sciP.test.attempts++; } });
}
function sciStartSpeed(){
  sciStartRun({ title:'True or False Speed Round', emoji:'⚡', color:'#f59e0b', back:'quizmenu', kind:'speed', keepOrder:true, optColors:['#16a34a','#dc2626'],
    build:()=> sciShuffle(SCI_TOPICS.flatMap(t=>sciPick(SCI_TF.filter(x=>x.topic===t.id),3))).map(x=>({ q:x.t, opts:['True','False'], a:x.a?0:1, why:x.why, topic:x.topic, e:'🤔' })),
    onFinish:(r)=>{ sciP.speed = Math.max(sciP.speed, r.score); } });
}
function sciStartMistakes(){
  const qs = sciP.mistakes.map(id=>SCI_BANK.find(q=>q.id===id)).filter(Boolean);
  if(!qs.length){ sciGo('quizmenu'); return; }
  sciStartRun({ title:'Fix My Mistakes', emoji:'🛠️', color:'#ef4444', back:'hub', kind:'mistakes', build:()=> qs.map(sciCloneQ) });
}
function sciQuizMenu(el){
  const card = (emoji,title,desc,best,fn,color) => `<button class="sci-step" style="--c:${color}" onclick="${fn}"><div class="big">${emoji}</div><h3>${title}</h3><p>${desc}</p><span class="status ${best?'done':''}">${best||'Not tried yet'}</span></button>`;
  el.innerHTML = `<div class="sci-hero" style="background:linear-gradient(120deg,#8b5cf6,#ec4899)"><h2>⭐ Quizzes & Practice Test</h2><p>Quizzes start easy and get a little harder. After every answer you see why.</p></div>
    <div class="sci-section-title">Topic quizzes <small>8 questions each: easy → harder</small></div>
    <div class="sci-grid">${SCI_TOPICS.map(t=>card(t.emoji,t.title+' Quiz','Easy, medium and challenge questions.', sciP.quiz[t.id]!==undefined?'Best: '+sciP.quiz[t.id]+'%':'', `sciStartTopicQuiz('${t.id}')`, t.color)).join('')}</div>
    <div class="sci-section-title">Challenges</div>
    <div class="sci-grid">
      ${card('⚡','Speed Round','12 true-or-false statements. Can you keep a streak?', sciP.speed?'Best: '+sciP.speed+' of 12':'', 'sciStartSpeed()', '#f59e0b')}
      ${card('📝','Practice Test','20 mixed questions, just like test day. Gets harder as you go.', sciP.test.attempts?'Best: '+sciP.test.best+'% ('+sciP.test.attempts+' tries)':'', 'sciStartTest()', '#16a34a')}
      ${card('🛠️','Fix My Mistakes','Re-try the questions you missed.', sciP.mistakes.length+' waiting', 'sciStartMistakes()', '#ef4444')}
    </div>`;
}

/* ---------- games menu ---------- */
function sciGames(el){
  const card = (emoji,title,desc,status,fn,color) => `<button class="sci-step" style="--c:${color}" onclick="${fn}"><div class="big">${emoji}</div><h3>${title}</h3><p>${desc}</p>${status?`<span class="status ${status.startsWith('✓')?'done':''}">${status}</span>`:''}</button>`;
  el.innerHTML = `<div class="sci-hero" style="background:linear-gradient(120deg,#10b981,#0ea5e9)"><h2>🎮 Play & Explore</h2><p>Try experiments and games. Playing helps you understand the ideas, not just remember them!</p></div>
    <div class="sci-section-title">🔬 Labs <small>change one thing at a time, like a real scientist</small></div>
    <div class="sci-grid">
      ${card('🧲','Magnet Lab','Drag magnets to see attract and repel. Test which objects stick.', sciP.labs.magnet?'✓ Tried':'Not tried', "sciGo('lab_magnet')", '#ef4444')}
      ${card('📦','Force Lab','Push a box on different surfaces. See how force, friction, and weight change motion.', sciP.labs.force?'✓ Tried':'Not tried', "sciGo('lab_force')", '#f97316')}
      ${card('⚡','Electromagnet Lab','Build an electromagnet. Change coils and batteries and count paper clips.', sciP.labs.electro?'✓ Tried':'Not tried', "sciGo('lab_electro')", '#8b5cf6')}
    </div>
    <div class="sci-section-title">🧩 Sorting & word games</div>
    <div class="sci-grid">
      ${Object.keys(SCI_SORTS).map(k=>{ const s=SCI_SORTS[k]; return card(s.emoji,s.title,s.blurb,(sciP.sorts[k]!==undefined?'Best: '+sciP.sorts[k]+'/'+s.items.length:''),`sciStartSort('${k}')`,s.colors[0]); }).join('')}
      ${card('🔄','Motion Patterns','Match each moving thing to its pattern of motion.', sciP.patterns?'Best: '+sciP.patterns+'/8':'', 'sciStartPatterns()', '#3b82f6')}
      ${card('✏️','Fill in the Blank','Pick the science word that completes the sentence.', sciP.cloze?'Best: '+sciP.cloze+'/10':'', 'sciStartCloze()', '#0ea5e9')}
      ${card('🃏','Flashcards','Flip each card to learn the word, its meaning, and an example.', Object.keys(sciP.cards).length+' of '+SCI_VOCAB.length+' known', "sciGo('flash')", '#8b5cf6')}
      ${card('🔗','Match-Up','Match 6 science words to their meanings.', sciP.match?'Best: '+sciP.match+' tries (fewer is better)':'', "sciGo('match')", '#10b981')}
    </div>`;
}
function sciStartSort(key){
  const s = SCI_SORTS[key];
  sciStartRun({ title:s.title, emoji:s.emoji, color:s.colors[0], back:'games', kind:'sort', keepOrder:true, optColors:s.colors, prompt:s.blurb,
    build:()=> sciPick(s.items,10).map(it=>({ q:it.t, e:it.e, opts:s.labels.slice(), a:it.a, why:it.why })),
    onFinish:(r)=>{ sciP.sorts[key] = Math.max(sciP.sorts[key]||0, r.score); } });
}
function sciStartPatterns(){
  sciStartRun({ title:'Motion Patterns', emoji:'🔄', color:'#3b82f6', back:'games', kind:'patterns', prompt:'What pattern of motion is it?',
    build:()=> SCI_PATTERNS.map(p=>({ q:p.t, e:p.e, opts:[p.a].concat(sciPick(SCI_PATTERN_CHOICES.filter(c=>c!==p.a),3)), a:0, why:`It moves in a ${p.a} pattern.` })),
    onFinish:(r)=>{ sciP.patterns = Math.max(sciP.patterns||0, r.score); } });
}
function sciStartCloze(){
  sciStartRun({ title:'Fill in the Blank', emoji:'✏️', color:'#0ea5e9', back:'games', kind:'cloze', prompt:'Which word fits?',
    build:()=> sciPick(SCI_CLOZE,10).map(c=>{ const cap = w => w.charAt(0).toUpperCase()+w.slice(1); const start = c.s.trim().startsWith('____'); const f = w => start ? cap(w) : w;
      const others = sciPick(SCI_CLOZE.filter(x=>x.a!==c.a),3).map(x=>x.a);
      return { q:c.s, opts:[c.a].concat(others).map(f), a:0, why:`${cap(c.a)}: ${(SCI_VOCAB.find(v=>v.w===c.a)||{}).d||''}` }; }),
    onFinish:(r)=>{ sciP.cloze = Math.max(sciP.cloze||0, r.score); } });
}
function sciCheat(el){
  el.innerHTML = `<div class="card" id="sciCheatPrint"><div class="action-row sci-noprint"><button class="btn orange" onclick="window.print()">🖨️ Print this page</button></div>
    <h2 style="margin-top:0">📄 Science Cheat Sheet: Motion, Forces, Magnets, Electromagnets</h2>
    <div class="sci-cheat">${SCI_TOPICS.map(t=>`<div style="--c:${t.color};--bgc:${t.bg}"><h3>${t.emoji} ${t.title}</h3><ul>${SCI_CHEAT[t.id].map(x=>`<li>${escapeHtml(x)}</li>`).join('')}</ul></div>`).join('')}</div>
    <h3>🧱 Key words</h3><div class="sci-wordwall">${SCI_VOCAB.map(w=>`<div class="sci-word"><b>${w.e} ${escapeHtml(w.w)}</b><p>${escapeHtml(w.d)}</p></div>`).join('')}</div></div>`;
}

/* overall progress for the Home card (0-100) */
function sciProgressPct(){
  const st = sciStat();
  const parts = [ st.lessons/4, st.stories/SCI_STORIES.length, st.labs/3, st.quizzes/4, sciP.test.attempts?1:0 ];
  return Math.round(parts.reduce((a,b)=>a+b,0)/parts.length*100);
}
