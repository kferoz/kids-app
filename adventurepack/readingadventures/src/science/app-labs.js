/* =====================================================================
   SCIENCE TEST PREP — APP PART 2: labs, flashcards, match-up
   ===================================================================== */
function sciLabUsed(k){ if(!sciP.labs[k]){ sciP.labs[k] = true; sciSave(); sciCheckBadges(); } }
function sciLabTabs(active){ return ''; }

/* ---------------- Magnet Lab ---------------- */
let sciMagTab = 'poles';
function sciMagnetLab(el){
  el.innerHTML = `<div class="card"><h2 style="margin-top:0">🧲 Magnet Lab</h2>
    <div class="sci-lab-tabs"><button class="sci-tab ${sciMagTab==='poles'?'on':''}" onclick="sciMagTab='poles';sciRender()">🧲 Pole Play</button><button class="sci-tab ${sciMagTab==='test'?'on':''}" onclick="sciMagTab='test';sciRender()">🔍 Magnet Tester</button></div>
    <div id="sciLabBody"></div></div>`;
  sciMagTab==='poles' ? sciPolePlay() : sciMagTester();
}
function sciPolePlay(){
  const body = document.getElementById('sciLabBody');
  const AW = 160, AX = 30, AY = 90, H = 60, MAXX = 640-AW-12, MINX = AX+AW+6;
  let bx = 420, flipped = false, dragging = false, off = 0, raf = null;
  body.innerHTML = `<p>Drag the <b>right magnet</b> toward the left magnet. Then tap <b>Flip</b> and try again. What do you notice?</p>
    <div class="sci-stage"><svg id="polesSvg" viewBox="0 0 640 240" xmlns="http://www.w3.org/2000/svg" style="touch-action:none;cursor:grab"></svg></div>
    <div class="sci-msg" id="polesMsg"></div>
    <div class="action-row"><button class="btn orange" id="flipBtn">🔄 Flip magnet</button><button class="btn plain" id="resetBtn">↩ Reset</button><span id="strength" style="font-weight:800"></span></div>`;
  const svg = document.getElementById('polesSvg'), msg = document.getElementById('polesMsg');
  const magnet = (x,l,r) => `<rect x="${x}" y="${AY}" width="${AW/2}" height="${H}" fill="${l==='N'?'#ef4444':'#3b82f6'}"/><rect x="${x+AW/2}" y="${AY}" width="${AW/2}" height="${H}" fill="${r==='N'?'#ef4444':'#3b82f6'}"/><rect x="${x}" y="${AY}" width="${AW}" height="${H}" rx="8" fill="none" stroke="#24304a" stroke-width="3"/><text x="${x+AW/4}" y="${AY+H/2+10}" font-size="30" font-weight="900" fill="#fff" text-anchor="middle">${l}</text><text x="${x+3*AW/4}" y="${AY+H/2+10}" font-size="30" font-weight="900" fill="#fff" text-anchor="middle">${r}</text>`;
  const arr = (x1,x2,y,c,w) => { const d = x2>x1?1:-1; return `<line x1="${x1}" y1="${y}" x2="${x2-d*14}" y2="${y}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/><polygon points="${x2},${y} ${x2-d*18},${y-w-5} ${x2-d*18},${y+w+5}" fill="${c}"/>`; };
  function state(){ const bl = flipped?'N':'S', br = flipped?'S':'N'; const attract = bl!=='N'; const gap = bx - (AX+AW); const s = Math.max(0, Math.min(1, 1-(gap-6)/300)); return {bl,br,attract,gap,s}; }
  function draw(){
    const st = state(); let a = '';
    if(st.s>0.05){
      const len = 14 + st.s*50, w = 3 + st.s*7, c = st.attract?'#16a34a':'#dc2626';
      if(st.attract){ a = arr(AX+AW+4, AX+AW+4+len, 70, c, w) + arr(bx-4, bx-4-len, 70, c, w); }
      else { a = arr(AX+AW+4+len, AX+AW+4, 70, c, w) + arr(bx-4-len, bx-4, 70, c, w); }
    }
    svg.innerHTML = `<rect width="640" height="240" fill="#f7fbff"/><rect y="170" width="640" height="70" fill="#e5edf9"/>` + magnet(AX,'S','N') + `<g id="magB" style="cursor:grab">${magnet(bx,st.bl,st.br)}</g>` + a +
      `<text x="${AX+AW/2}" y="205" font-size="14" font-weight="700" fill="#64748b" text-anchor="middle">fixed magnet</text><text x="${bx+AW/2}" y="205" font-size="14" font-weight="700" fill="#64748b" text-anchor="middle">drag me ↔</text>`;
    const label = st.s>0.66?'💪 STRONG force':st.s>0.25?'👍 medium force':st.s>0.05?'🤏 weak force':'— almost no force (too far!)';
    document.getElementById('strength').textContent = 'Force: ' + label;
    msg.innerHTML = st.attract ? `Left magnet <b>N</b> pole faces the <b>S</b> pole → opposite poles <b style="color:#16a34a">ATTRACT</b>. They pull together!` : `Left magnet <b>N</b> pole faces another <b>N</b> pole → same poles <b style="color:#dc2626">REPEL</b>. They push apart!`;
  }
  function svgX(ev){ const r = svg.getBoundingClientRect(); return (ev.clientX - r.left) * (640 / r.width); }
  function animate(){
    cancelAnimationFrame(raf);
    const st = state(), target = st.attract ? MINX : MAXX;
    (function step(){ const d = target - bx; if(Math.abs(d) < 0.6){ bx = target; draw(); msg.innerHTML += st.attract?' <b>Snap!</b> 🧲':' <b>Whoosh!</b> 💨'; return; } bx += d*0.07 + Math.sign(d)*0.6; draw(); raf = requestAnimationFrame(step); })();
  }
  svg.addEventListener('pointerdown', ev => { const x = svgX(ev); if(x >= bx-10 && x <= bx+AW+10){ dragging = true; off = x - bx; cancelAnimationFrame(raf); svg.setPointerCapture(ev.pointerId); sciLabUsed('magnet'); } });
  svg.addEventListener('pointermove', ev => { if(!dragging) return; bx = Math.max(MINX, Math.min(MAXX, svgX(ev) - off)); draw(); });
  const up = () => { if(dragging){ dragging = false; animate(); } };
  svg.addEventListener('pointerup', up); svg.addEventListener('pointercancel', up);
  document.getElementById('flipBtn').onclick = () => { flipped = !flipped; sciLabUsed('magnet'); draw(); if(!dragging) animate(); };
  document.getElementById('resetBtn').onclick = () => { cancelAnimationFrame(raf); bx = 420; flipped = false; draw(); };
  sciCleanup = () => cancelAnimationFrame(raf);
  draw();
}
function sciMagTester(){
  const body = document.getElementById('sciLabBody');
  const items = SCI_SORTS.magnetic.items;
  const seen = {};
  body.innerHTML = `<p>Tap an object to test it with the magnet. Does it stick? Remember: <b>not all metals are magnetic!</b></p>
    <div class="sci-testzone"><div class="mag">🧲</div><div class="item" id="testItem"></div></div>
    <div class="sci-msg" id="testMsg">Pick an object to test…</div>
    <div class="sci-tester">${items.map((it,i)=>`<button class="sci-obj" id="obj-${i}" onclick="sciTestObj(${i})"><span>${it.e}</span>${it.t}</button>`).join('')}</div>
    <div class="action-row"><span id="testTally" style="font-weight:800">Tested: 0 of ${items.length}</span></div>`;
  window.sciTestObj = function(i){
    const it = items[i], magnetic = it.a===0, item = document.getElementById('testItem');
    sciLabUsed('magnet');
    item.className = 'item'; item.textContent = it.e; void item.offsetWidth;
    if(magnetic) item.classList.add('pull');
    document.getElementById('testMsg').innerHTML = (magnetic ? `✅ <b>${it.t}</b> sticks! ` : `❌ <b>${it.t}</b> does not stick. `) + `<br>💡 ${it.why}`;
    const b = document.getElementById('obj-'+i); b.classList.add(magnetic?'stick':'nostick'); seen[i] = true;
    document.getElementById('testTally').textContent = `Tested: ${Object.keys(seen).length} of ${items.length}`;
    setTimeout(()=>{ item.classList.remove('pull'); }, 1800);
  };
}

/* ---------------- Force Lab ---------------- */
const SCI_SURF = [ {n:'Ice', mu:.15, e:'🧊'}, {n:'Wood floor', mu:.4, e:'🪵'}, {n:'Carpet', mu:.8, e:'🧶'}, {n:'Sandpaper', mu:1.2, e:'🟫'} ];
const SCI_LOAD = [ {n:'Empty box', m:1, e:'📦'}, {n:'Some books', m:2, e:'📚'}, {n:'Heavy rocks', m:3, e:'🪨'} ];
const SCI_PUSH = [ {n:'Small push', f:1}, {n:'Medium push', f:2}, {n:'Big push', f:3} ];
let sciForce = { p:1, s:1, l:0, trials:[] };
function sciForceLab(el){
  const seg = (name, arr, cur, label) => `<div><label>${label}</label><div class="sci-seg">${arr.map((o,i)=>`<button class="${i===cur?'on':''}" onclick="sciForceSet('${name}',${i})">${o.e?o.e+' ':''}${o.n}</button>`).join('')}</div></div>`;
  const rows = sciForce.trials.slice(-6).map((t,i)=>`<tr><td>${sciForce.trials.length-Math.min(6,sciForce.trials.length)+i+1}</td><td>${SCI_PUSH[t.p].n}</td><td>${SCI_SURF[t.s].n}</td><td>${SCI_LOAD[t.l].n}</td><td><b>${t.d.toFixed(1)}</b></td></tr>`).join('');
  el.innerHTML = `<div class="card"><h2 style="margin-top:0">📦 Force Lab</h2>
    <p>Choose a push, a surface, and what is inside the box. Then press <b>PUSH!</b> Change <b>only one thing</b> at a time to run a <b>fair test</b>.</p>
    <div class="sci-ctl">${seg('p',SCI_PUSH,sciForce.p,'1️⃣ How hard do you push?')}${seg('s',SCI_SURF,sciForce.s,'2️⃣ What surface?')}${seg('l',SCI_LOAD,sciForce.l,'3️⃣ What is in the box?')}</div>
    <div class="sci-track" id="fTrack"><div class="ticks"></div><div class="sci-box" id="fBox">${SCI_LOAD[sciForce.l].e}</div></div>
    <div class="action-row"><button class="btn orange" onclick="sciForcePush()">👉 PUSH!</button><button class="btn plain" onclick="sciForce.trials=[];sciRender()">🗑 Clear table</button><span style="font-weight:800" id="fDist"></span></div>
    <div class="sci-msg" id="fMsg">Friction on ${SCI_SURF[sciForce.s].n}: ${'🟧'.repeat(Math.max(1,Math.round(SCI_SURF[sciForce.s].mu*3.3)))}. Press PUSH to see how far the box slides!</div>
    ${rows? `<table class="sci-table"><tr><th>#</th><th>Push</th><th>Surface</th><th>Box</th><th>Distance (blocks)</th></tr>${rows}</table>`:''}
  </div>`;
}
function sciForceSet(k,i){ sciForce[k] = i; sciRender(); }
function sciForcePush(){
  const P = SCI_PUSH[sciForce.p], S = SCI_SURF[sciForce.s], L = SCI_LOAD[sciForce.l];
  let d = 6 * P.f / (L.m * (0.5 + S.mu)); d = Math.min(d, 29);
  const prev = sciForce.trials[sciForce.trials.length-1];
  sciForce.trials.push({ p:sciForce.p, s:sciForce.s, l:sciForce.l, d });
  sciLabUsed('force');
  const box = document.getElementById('fBox'), track = document.getElementById('fTrack');
  box.style.transition = 'none'; box.style.left = '4px'; void box.offsetWidth;
  box.style.transition = ''; box.style.left = (4 + (d/30) * (track.clientWidth - 64)) + 'px';
  document.getElementById('fDist').textContent = `Distance: ${d.toFixed(1)} blocks`;
  let note = '';
  if(prev){
    const changed = []; if(prev.p!==sciForce.p) changed.push('push'); if(prev.s!==sciForce.s) changed.push('surface'); if(prev.l!==sciForce.l) changed.push('box weight');
    if(changed.length===1){
      const more = d > prev.d, c = changed[0];
      const why = c==='push' ? (more?'A bigger force changes motion more.':'A smaller force changes motion less.') : c==='surface' ? (more?'Less friction lets the box slide farther.':'More friction slows the box sooner.') : (more?'A lighter box is easier to move.':'A heavier box needs more force to move.');
      note = `✅ <b>Fair test!</b> You changed only the <b>${c}</b>. The box went ${more?'farther':'less far'}. 💡 ${why}`;
    } else if(changed.length>1) note = `🤔 You changed ${changed.length} things at once, so you can’t be sure which one made the difference. Try changing just <b>ONE</b> thing!`;
    else note = 'Same settings, same result. Scientists repeat tests to check! Now change ONE thing.';
  } else note = `The box slid ${d.toFixed(1)} blocks. Now change <b>one</b> thing and push again!`;
  setTimeout(()=>{ const m = document.getElementById('fMsg'); if(m) m.innerHTML = note; sciForceTable(); }, 1700);
}
function sciForceTable(){
  const wrap = document.querySelector('#scienceView .card'); if(!wrap || sciState.screen!=='lab_force') return;
  let t = wrap.querySelector('table'); const rows = sciForce.trials.slice(-6).map((x,i)=>`<tr><td>${sciForce.trials.length-Math.min(6,sciForce.trials.length)+i+1}</td><td>${SCI_PUSH[x.p].n}</td><td>${SCI_SURF[x.s].n}</td><td>${SCI_LOAD[x.l].n}</td><td><b>${x.d.toFixed(1)}</b></td></tr>`).join('');
  const html = `<tr><th>#</th><th>Push</th><th>Surface</th><th>Box</th><th>Distance (blocks)</th></tr>${rows}`;
  if(!t){ t = document.createElement('table'); t.className='sci-table'; wrap.appendChild(t); }
  t.innerHTML = html;
}

/* ---------------- Electromagnet Lab ---------------- */
let sciEM = { coils:10, batt:1, core:true, on:true, flip:false };
function sciEMClips(){ const s = sciEM; if(!s.on) return 0; const str = s.coils * s.batt; return s.core ? Math.min(12, Math.max(1, Math.round(str/12))) : Math.min(3, Math.round(str/60)); }
function sciElectroLab(el){
  el.innerHTML = `<div class="card"><h2 style="margin-top:0">⚡ Electromagnet Lab</h2>
    <p>Build an electromagnet! Change the coils, batteries, and core, and see how many paper clips it can pick up.</p>
    <div class="sci-stage"><svg id="emSvg" viewBox="0 0 640 270" xmlns="http://www.w3.org/2000/svg"></svg></div>
    <div class="sci-msg" id="emMsg"></div>
    <div class="sci-ctl">
      <div><label>🌀 Coils of wire: <span id="emCoilV">${sciEM.coils}</span></label><input type="range" id="emCoils" min="5" max="40" step="5" value="${sciEM.coils}"></div>
      <div><label>🔋 Batteries: <span id="emBattV">${sciEM.batt}</span></label><input type="range" id="emBatt" min="1" max="4" step="1" value="${sciEM.batt}"></div>
      <div><label>🔩 Core inside the coil</label><div class="sci-seg"><button id="emCoreY">Iron nail</button><button id="emCoreN">Plastic straw</button></div></div>
      <div><label>🔘 Switch & battery</label><div class="sci-seg"><button id="emSw"></button><button id="emFlip">🔄 Flip battery</button></div></div>
    </div>
    <p style="font-size:.85rem;color:#64748b;background:#fffbe6;border-radius:12px;padding:.5rem .8rem;">⚠️ Safety: use only small batteries, with a grown-up. <b>Never</b> connect wires to a wall outlet!</p></div>`;
  const svg = document.getElementById('emSvg');
  function draw(){
    const s = sciEM, n = sciEMClips();
    const x0 = 190, x1 = 450, nailY = 110;
    let coil = ''; const step = (x1-x0-60) / s.coils;
    for(let i=0;i<s.coils;i++){ const x = x0+30+i*step; coil += `<path d="M${x} ${nailY-24} q${step*0.8} 24 0 48" fill="none" stroke="${s.on?'#d97706':'#a8a29e'}" stroke-width="3"/>`; }
    const left = s.flip ? 'S' : 'N', right = s.flip ? 'N' : 'S';
    const poleCol = L => L==='N' ? '#ef4444' : '#3b82f6';
    const poles = (s.on && s.core) || (s.on && sciEMClips()>0) ? `<circle cx="${x0-8}" cy="${nailY}" r="16" fill="${poleCol(left)}"/><text x="${x0-8}" y="${nailY+6}" font-size="18" font-weight="900" fill="#fff" text-anchor="middle">${left}</text><circle cx="${x1+8}" cy="${nailY}" r="16" fill="${poleCol(right)}"/><text x="${x1+8}" y="${nailY+6}" font-size="18" font-weight="900" fill="#fff" text-anchor="middle">${right}</text>` : '';
    let clips = ''; for(let i=0;i<12;i++){ const picked = i < n; const px = picked ? x1+30+ (i%3)*12 : 150+i*34; const py = picked ? nailY+10 + Math.floor(i/3)*16 : 244; const rot = picked ? ((i*37)%50-25) : ((i*53)%90-45);
      clips += `<g transform="translate(${px},${py}) rotate(${rot})"><rect x="-10" y="-4" width="20" height="8" rx="4" fill="none" stroke="#6b7a90" stroke-width="2.5"/></g>`; }
    const batt = Array.from({length:s.batt}).map((_,i)=>`<rect x="${34+i*34}" y="${nailY+30+0}" width="28" height="56" rx="6" fill="#34d399" stroke="#047857" stroke-width="3"/><text x="${48+i*34}" y="${nailY+66}" font-size="18" text-anchor="middle">🔋</text>`).join('');
    const wireCol = s.on ? '#d97706' : '#a8a29e';
    svg.innerHTML = `<rect width="640" height="270" fill="#f7fbff"/>
      <path d="M${x0+30} ${nailY-24} L${x0+30} 40 H60 V${nailY+30}" fill="none" stroke="${wireCol}" stroke-width="4"/>
      <path d="M${x1-30} ${nailY+24} L${x1-30} 190 H${34+s.batt*34+10} V${nailY+60}" fill="none" stroke="${wireCol}" stroke-width="4"/>
      ${s.on?'':`<line x1="${x1-30}" y1="150" x2="${x1-12}" y2="150" stroke="#ef4444" stroke-width="4"/>`}
      <rect x="${x0}" y="${nailY-9}" width="${x1-x0}" height="18" rx="${s.core?3:9}" fill="${s.core?'#9aa5b5':'#fbcfe8'}" stroke="${s.core?'#6b7a90':'#ec4899'}" stroke-width="2"/>
      ${coil}${poles}${batt}${clips}
      <text x="${(x0+x1)/2}" y="${nailY-40}" font-size="13" font-weight="700" fill="#64748b" text-anchor="middle">${s.core?'iron nail (core)':'plastic straw (not magnetic)'}</text>
      <text x="320" y="262" font-size="12" fill="#94a3b8" text-anchor="middle">paper clips</text>`;
    const str = s.on ? s.coils*s.batt : 0;
    const word = !s.on ? 'OFF: no current, so no magnetism!' : n>=9 ? 'Very strong! 💪' : n>=4 ? 'Strong 👍' : n>=1 ? 'Weak 🤏' : 'Almost nothing (the straw is not iron)';
    document.getElementById('emMsg').innerHTML = `Paper clips picked up: <b style="font-size:1.3rem;color:#6d28d9">${n}</b> · ${word}${s.on?`<br>💡 ${s.core?'Iron core + current = electromagnet.':'Without an iron core, it is much weaker.'} ${s.flip?'The battery is flipped, so the poles switched!':''}`:''}`;
    document.getElementById('emCoilV').textContent = s.coils; document.getElementById('emBattV').textContent = s.batt;
    document.getElementById('emCoreY').classList.toggle('on', s.core); document.getElementById('emCoreN').classList.toggle('on', !s.core);
    const sw = document.getElementById('emSw'); sw.textContent = s.on ? '🟢 Switch is ON' : '🔴 Switch is OFF'; sw.classList.toggle('on', s.on);
    document.getElementById('emFlip').classList.toggle('on', s.flip);
  }
  const touch = () => { sciLabUsed('electro'); draw(); };
  document.getElementById('emCoils').oninput = e => { sciEM.coils = +e.target.value; touch(); };
  document.getElementById('emBatt').oninput = e => { sciEM.batt = +e.target.value; touch(); };
  document.getElementById('emCoreY').onclick = () => { sciEM.core = true; touch(); };
  document.getElementById('emCoreN').onclick = () => { sciEM.core = false; touch(); };
  document.getElementById('emSw').onclick = () => { sciEM.on = !sciEM.on; touch(); };
  document.getElementById('emFlip').onclick = () => { sciEM.flip = !sciEM.flip; touch(); };
  draw();
}

/* ---------------- Flashcards ---------------- */
let sciFC = { topic:'all', i:0, flipped:false };
function sciFlash(el){
  const deck = SCI_VOCAB.filter(v => sciFC.topic==='all' || v.t===sciFC.topic);
  if(sciFC.i >= deck.length) sciFC.i = 0;
  const w = deck[sciFC.i], t = sciTopic(w.t), known = !!sciP.cards[w.w];
  el.innerHTML = `<div class="card"><h2 style="margin-top:0">🃏 Flashcards</h2>
    <div class="sci-lab-tabs"><button class="sci-tab ${sciFC.topic==='all'?'on':''}" onclick="sciFCTopic('all')">All</button>${SCI_TOPICS.map(x=>`<button class="sci-tab ${sciFC.topic===x.id?'on':''}" onclick="sciFCTopic('${x.id}')">${x.emoji} ${x.title}</button>`).join('')}</div>
    <p style="font-weight:800">Card ${sciFC.i+1} of ${deck.length} · You know ${deck.filter(v=>sciP.cards[v.w]).length} of ${deck.length} ${known?'· ✅ this one':''}</p>
    <div class="sci-cardflip" style="--c:${t.color}"><div class="sci-flipcard ${sciFC.flipped?'flipped':''}" onclick="sciFCFlip()">
      <div class="sci-face"><div class="em">${w.e}</div><div class="w">${escapeHtml(w.w)}</div><div class="s">${w.s}</div><p style="color:#7a8296;font-size:.9rem">Tap to flip</p></div>
      <div class="sci-face back"><p><b>${escapeHtml(w.w)}</b></p><p>${escapeHtml(w.d)}</p><p style="color:#7a8296">Example: ${escapeHtml(w.ex)}</p></div></div></div>
    <div class="action-row" style="justify-content:center;margin-top:1rem">
      <button class="btn orange" onclick="sciSay(SCI_VOCAB.filter(v=>sciFC.topic==='all'||v.t===sciFC.topic)[sciFC.i].w + '. ' + SCI_VOCAB.filter(v=>sciFC.topic==='all'||v.t===sciFC.topic)[sciFC.i].d)">🔊 Read</button>
      <button class="btn plain" onclick="sciFCNext(false)">🔁 Practice again</button>
      <button class="btn green" onclick="sciFCNext(true)">✅ I know it!</button></div></div>`;
}
function sciFCTopic(t){ sciFC.topic = t; sciFC.i = 0; sciFC.flipped = false; sciRender(); }
function sciFCFlip(){ sciFC.flipped = !sciFC.flipped; document.querySelector('.sci-flipcard').classList.toggle('flipped', sciFC.flipped); }
function sciFCNext(knew){
  const deck = SCI_VOCAB.filter(v => sciFC.topic==='all' || v.t===sciFC.topic), w = deck[sciFC.i];
  if(knew){ sciP.cards[w.w] = true; sciSave(); } else { delete sciP.cards[w.w]; sciSave(); }
  sciFC.i = (sciFC.i + 1) % deck.length; sciFC.flipped = false; sciRender();
}

/* ---------------- Match-Up ---------------- */
let sciMM = null;
function sciMatch(el){
  if(!sciMM || sciMM.done){ const pick = sciPick(SCI_VOCAB,6); sciMM = { pick, right:sciShuffle(pick), sel:null, matched:{}, tries:0, done:false }; }
  const m = sciMM;
  el.innerHTML = `<div class="card"><h2 style="margin-top:0">🔗 Match-Up</h2><p>Tap a <b>word</b>, then tap its <b>meaning</b>. Fewer tries = better!</p>
    <div class="sci-match"><div style="display:grid;gap:.6rem">${m.pick.map(v=>`<button class="sci-mbtn ${m.matched[v.w]?'ok':''} ${m.sel===v.w?'sel':''}" onclick="sciMMLeft('${v.w}')">${v.e} ${escapeHtml(v.w)}</button>`).join('')}</div>
    <div style="display:grid;gap:.6rem">${m.right.map(v=>`<button class="sci-mbtn ${m.matched[v.w]?'ok':''}" id="mm-${v.w.replace(/ /g,'_')}" onclick="sciMMRight('${v.w}')">${escapeHtml(v.d)}</button>`).join('')}</div></div>
    <div class="sci-msg" id="mmMsg">Tries: ${m.tries}</div>
    <div class="action-row"><button class="btn plain" onclick="sciMM=null;sciRender()">🔄 New words</button></div></div>`;
}
function sciMMLeft(w){ if(sciMM.matched[w]) return; sciMM.sel = w; sciRender(); }
function sciMMRight(w){
  const m = sciMM; if(!m.sel || m.matched[w]) { document.getElementById('mmMsg').textContent = 'Tap a word on the left first 👈'; return; }
  m.tries++;
  if(m.sel === w){ m.matched[w] = true; m.sel = null;
    if(Object.keys(m.matched).length === 6){ m.done = true; sciP.match = sciP.match ? Math.min(sciP.match, m.tries) : m.tries; sciSave(); sciRender(); document.getElementById('mmMsg').innerHTML = `🎉 All matched in <b>${m.tries}</b> tries! (Perfect is 6.)`; return; }
    sciRender(); document.getElementById('mmMsg').textContent = `✅ Match! Tries: ${m.tries}`;
  } else { const b = document.getElementById('mm-'+w.replace(/ /g,'_')); b.classList.add('shake'); document.getElementById('mmMsg').textContent = `❌ Not that one. Tries: ${m.tries}`; }
}
