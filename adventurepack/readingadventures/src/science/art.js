/* =====================================================================
   SCIENCE TEST PREP — original SVG diagrams for lessons (SCI_ART[key]() -> svg string)
   ===================================================================== */
const SCI_ART = (function(){
  const W = 320, H = 180;
  const svg = (inner, bg) => `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img"><rect width="${W}" height="${H}" rx="14" fill="${bg||'#f7fbff'}"/>${inner}</svg>`;
  const T = (x,y,s,size=12,fill='#24304a',anchor='middle',weight=700) => `<text x="${x}" y="${y}" font-size="${size}" fill="${fill}" text-anchor="${anchor}" font-weight="${weight}" font-family="Trebuchet MS,Segoe UI,Verdana,sans-serif">${s}</text>`;
  const arrow = (x1,y1,x2,y2,c='#ef4444',w=5) => {
    const a = Math.atan2(y2-y1,x2-x1), L = 11 + w;
    const p1 = [x2 - L*Math.cos(a-0.45), y2 - L*Math.sin(a-0.45)], p2 = [x2 - L*Math.cos(a+0.45), y2 - L*Math.sin(a+0.45)];
    return `<line x1="${x1}" y1="${y1}" x2="${x2 - (L-4)*Math.cos(a)}" y2="${y2 - (L-4)*Math.sin(a)}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/><polygon points="${x2},${y2} ${p1[0]},${p1[1]} ${p2[0]},${p2[1]}" fill="${c}"/>`;
  };
  const kid = (x,y,shirt='#4d7cfe',s=1,flip=1) => `<g transform="translate(${x},${y}) scale(${s*flip},${s})"><circle cx="0" cy="-30" r="9" fill="#f6c9a3"/><rect x="-8" y="-20" width="16" height="22" rx="6" fill="${shirt}"/><line x1="-4" y1="2" x2="-6" y2="16" stroke="#3b2a1e" stroke-width="4" stroke-linecap="round"/><line x1="4" y1="2" x2="6" y2="16" stroke="#3b2a1e" stroke-width="4" stroke-linecap="round"/></g>`;
  const bar = (x,y,w,h,left='#ef4444',right='#3b82f6',L='N',R='S') => `<g><rect x="${x}" y="${y}" width="${w/2}" height="${h}" fill="${left}"/><rect x="${x+w/2}" y="${y}" width="${w/2}" height="${h}" fill="${right}"/><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="none" stroke="#24304a" stroke-width="2"/>${T(x+w/4,y+h/2+5,L,15,'#fff')}${T(x+3*w/4,y+h/2+5,R,15,'#fff')}</g>`;
  const clip = (x,y,r=0) => `<g transform="translate(${x},${y}) rotate(${r})"><rect x="-7" y="-3" width="14" height="6" rx="3" fill="none" stroke="#6b7a90" stroke-width="2"/></g>`;
  const ground = (y,c='#cfe6c8') => `<rect x="0" y="${y}" width="${W}" height="${H-y}" fill="${c}"/>`;
  const A = {};

  A.m_position = () => svg(ground(130) +
    `<g><rect x="46" y="86" width="8" height="44" fill="#8d5a3b"/><circle cx="50" cy="76" r="26" fill="#4caf50"/></g>` + T(50,150,'tree',12) +
    `<g><rect x="140" y="110" width="50" height="8" rx="3" fill="#a86f3f"/><rect x="144" y="118" width="5" height="12" fill="#6b4423"/><rect x="181" y="118" width="5" height="12" fill="#6b4423"/><rect x="140" y="98" width="50" height="7" rx="3" fill="#a86f3f"/></g>` + T(165,150,'bench',12) +
    `<g><ellipse cx="270" cy="124" rx="24" ry="7" fill="#7cc4ff"/><rect x="266" y="100" width="8" height="24" fill="#9aa5b5"/><path d="M270 98 q-14 -8 -20 8 M270 98 q14 -8 20 8" stroke="#4aa3ff" stroke-width="3" fill="none"/></g>` + T(270,150,'fountain',12) +
    `<circle cx="78" cy="118" r="9" fill="#ffb703" stroke="#c77f00" stroke-width="2"/>` + `<circle cx="215" cy="118" r="9" fill="#ffb703" stroke="#c77f00" stroke-width="2" opacity=".9"/>` +
    arrow(100,84,200,84,'#8b5cf6',4) + T(165,62,'position changed = MOTION',13,'#8b5cf6') + T(160,24,'Where is the ball? Use a landmark!',13,'#24304a'));

  A.m_patterns = () => {
    const panel = (cx,label,draw) => `<g><rect x="${cx-28}" y="38" width="56" height="86" rx="10" fill="#fff" stroke="#dbe6ff" stroke-width="2"/>${draw}${T(cx,142,label,9.5)}</g>`;
    return svg(
      T(160,22,'Patterns of motion',14) +
      panel(37,'straight',`<line x1="14" y1="80" x2="54" y2="80" stroke="#3b82f6" stroke-width="4"/>${arrow(14,80,56,80,'#3b82f6',3)}<circle cx="20" cy="80" r="6" fill="#ffb703"/>`) +
      panel(99,'back & forth',`<path d="M78 64 Q99 118 120 64" fill="none" stroke="#8b5cf6" stroke-width="3" stroke-dasharray="4 4"/><circle cx="78" cy="64" r="6" fill="#ffb703"/><circle cx="120" cy="64" r="6" fill="#ffb703" opacity=".5"/>`) +
      panel(161,'circle',`<circle cx="161" cy="82" r="20" fill="none" stroke="#10b981" stroke-width="4" stroke-dasharray="5 4"/><circle cx="181" cy="82" r="6" fill="#ffb703"/>`) +
      panel(223,'up & down',`<line x1="223" y1="50" x2="223" y2="112" stroke="#f97316" stroke-width="3" stroke-dasharray="4 4"/><circle cx="223" cy="52" r="6" fill="#ffb703"/><circle cx="223" cy="110" r="6" fill="#ffb703" opacity=".5"/><path d="M212 80 l11 -12 l11 12" stroke="#f97316" stroke-width="3" fill="none"/>`) +
      panel(285,'zig-zag',`<polyline points="268,112 277,62 286,112 296,62" fill="none" stroke="#ef4444" stroke-width="4" stroke-linejoin="round"/><circle cx="268" cy="112" r="6" fill="#ffb703"/>`));
  };

  A.m_speed = () => svg(
    T(160,20,'Same time: 5 seconds',13,'#8b5cf6') +
    `<rect x="14" y="36" width="292" height="50" rx="10" fill="#fff4dc"/><rect x="14" y="102" width="292" height="50" rx="10" fill="#e9f7ea"/>` +
    T(40,70,'🐆',26) + arrow(66,70,282,70,'#f97316',6) + T(190,54,'goes far = FAST',12,'#c25e00') +
    T(40,136,'🐢',26) + arrow(66,136,128,136,'#16a34a',6) + T(220,132,'goes a little = SLOW',12,'#15803d') +
    T(160,172,'Farther in the same time = higher speed',12));

  A.m_direction = () => svg(
    T(160,18,'Direction: which way?',14) +
    `<circle cx="160" cy="98" r="14" fill="#ffb703" stroke="#c77f00" stroke-width="2"/>` +
    arrow(160,80,160,48,'#3b82f6',5) + T(160,42,'up',12) +
    arrow(160,116,160,148,'#ef4444',5) + T(160,168,'down',12) +
    arrow(142,98,92,98,'#10b981',5) + T(66,102,'left',12) +
    arrow(178,98,228,98,'#f59e0b',5) + T(254,102,'right',12) +
    T(306,146,'speed + direction',10,'#8b5cf6','end') + T(306,160,'= motion',10,'#8b5cf6','end'));

  A.m_predict = () => svg(
    T(160,20,'Swing pattern: what comes next?',14) +
    `<line x1="160" y1="30" x2="160" y2="30"/><path d="M60 54 Q160 188 260 54" fill="none" stroke="#cbd5e1" stroke-width="3" stroke-dasharray="5 5"/>` +
    `<line x1="160" y1="36" x2="70" y2="62" stroke="#6b7a90" stroke-width="3"/><circle cx="70" cy="62" r="11" fill="#ffb703"/>` + T(70,92,'1',14,'#8b5cf6') +
    `<line x1="160" y1="36" x2="160" y2="124" stroke="#6b7a90" stroke-width="3" opacity=".5"/><circle cx="160" cy="132" r="11" fill="#ffb703" opacity=".5"/>` + T(160,160,'2',14,'#8b5cf6') +
    `<line x1="160" y1="36" x2="250" y2="62" stroke="#6b7a90" stroke-width="3" opacity=".5"/><circle cx="250" cy="62" r="11" fill="none" stroke="#ef4444" stroke-width="3" stroke-dasharray="4 3"/>` + T(250,92,'?',20,'#ef4444') +
    T(160,176,'Forward, back, forward… we can predict!',11));

  A.f_pushpull = () => svg(
    `<rect x="0" y="0" width="160" height="180" rx="14" fill="#fff3e6"/><rect x="0" y="138" width="160" height="42" fill="#f3dfc4"/>` +
    `<rect x="160" y="0" width="160" height="180" fill="#e8f1ff"/><rect x="160" y="138" width="160" height="42" fill="#d6e6f5"/>` +
    kid(46,136,'#f97316',1.3) + `<rect x="78" y="106" width="40" height="32" rx="4" fill="#c58b4e" stroke="#8d5a3b" stroke-width="2"/>` + arrow(70,86,134,86,'#ef4444',6) + T(80,28,'PUSH',18,'#c2410c') + T(80,50,'moves away from you',10) +
    kid(280,136,'#3b82f6',1.3,-1) + `<rect x="192" y="116" width="40" height="18" rx="4" fill="#3b82f6"/><circle cx="202" cy="138" r="6" fill="#24304a"/><circle cx="224" cy="138" r="6" fill="#24304a"/><line x1="232" y1="124" x2="270" y2="112" stroke="#6b4423" stroke-width="3"/>` + arrow(250,86,196,86,'#ef4444',6) + T(240,28,'PULL',18,'#1d4ed8') + T(240,50,'moves toward you',10));

  A.f_effects = () => {
    const chip = (x,emoji,label,col) => `<g><rect x="${x-30}" y="52" width="60" height="84" rx="12" fill="#fff" stroke="${col}" stroke-width="3"/>${T(x,88,emoji,26)}${T(x,118,label,10,col)}</g>`;
    return svg(T(160,28,'A force can…',15) + chip(36,'▶️','start','#16a34a') + chip(96,'⏹️','stop','#dc2626') + chip(160,'⏩','speed up','#f97316') + chip(224,'🐢','slow down','#2563eb') + chip(286,'↪️','turn','#8b5cf6') + T(160,164,'Bigger force = bigger change',12));
  };

  A.f_balanced = () => svg(ground(140,'#d7ecd0') +
    kid(60,138,'#ef4444',1.4) + kid(260,138,'#3b82f6',1.4,-1) +
    `<line x1="76" y1="116" x2="244" y2="116" stroke="#8d5a3b" stroke-width="5"/><polygon points="160,104 148,126 172,126" fill="#facc15" stroke="#ca8a04" stroke-width="2"/>` +
    arrow(110,70,40,70,'#ef4444',6) + arrow(210,70,280,70,'#3b82f6',6) + T(160,24,'EQUAL forces, opposite directions',13) + T(160,50,'= BALANCED',16,'#16a34a') + T(160,166,'The rope does not move',12));

  A.f_unbalanced = () => svg(ground(140,'#d7ecd0') +
    kid(56,138,'#ef4444',1.4) + kid(116,138,'#f97316',1.4) + kid(268,138,'#3b82f6',1.4,-1) +
    `<line x1="72" y1="116" x2="252" y2="116" stroke="#8d5a3b" stroke-width="5"/><polygon points="130,104 118,126 142,126" fill="#facc15" stroke="#ca8a04" stroke-width="2"/>` +
    arrow(100,70,18,70,'#ef4444',9) + arrow(228,70,282,70,'#3b82f6',4) +
    T(160,24,'One force is BIGGER',13) + T(160,50,'= UNBALANCED',16,'#d97706') + T(160,176,'The rope moves toward the bigger force',11));

  A.f_gravity = () => svg(`<circle cx="160" cy="260" r="120" fill="#7bc67e"/><circle cx="160" cy="260" r="116" fill="none" stroke="#4aa3ff" stroke-width="6" opacity=".4"/>` +
    `<circle cx="160" cy="34" r="14" fill="#ef4444"/>` + arrow(160,56,160,128,'#8b5cf6',7) + T(160,106,'', 1) +
    T(230,80,'Gravity pulls',13,'#6d28d9','start') + T(230,98,'DOWN toward',13,'#6d28d9','start') + T(230,116,'the Earth',13,'#6d28d9','start') + T(160,164,'EARTH',14,'#14532d') + T(60,48,'🍎',22) + arrow(60,62,60,112,'#8b5cf6',5));

  A.f_friction = () => svg(
    `<rect x="0" y="0" width="160" height="180" rx="14" fill="#e6f6ff"/><rect x="0" y="112" width="160" height="68" fill="#bfe8ff"/>` +
    `<rect x="40" y="82" width="38" height="30" rx="4" fill="#c58b4e" stroke="#8d5a3b" stroke-width="2"/>` + arrow(86,96,150,96,'#ef4444',6) + T(80,28,'ICE (smooth)',14,'#0369a1') + T(80,48,'LESS friction',12) + T(80,150,'slides far',12) +
    `<rect x="160" y="0" width="160" height="180" fill="#fff0dd"/><polyline points="160,114 172,108 184,114 196,108 208,114 220,108 232,114 244,108 256,114 268,108 280,114 292,108 304,114 316,108" fill="none" stroke="#a16207" stroke-width="3"/><rect x="160" y="114" width="160" height="66" fill="#e8c9a0"/>` +
    `<rect x="190" y="84" width="38" height="30" rx="4" fill="#c58b4e" stroke="#8d5a3b" stroke-width="2"/>` + arrow(236,98,262,98,'#ef4444',6) + arrow(196,128,170,128,'#16a34a',5) + T(240,28,'CARPET (rough)',14,'#a16207') + T(240,48,'MORE friction',12) + T(240,150,'slows down fast',12) + T(214,172,'← friction',10,'#15803d'));

  A.g_magnet = () => svg(
    bar(90,60,140,40) + clip(110,128,10)+clip(150,124,-20)+clip(190,130,25) + `<path d="M105 104 q4 14 6 18 M150 104 q-2 12 0 14 M195 104 q-4 14 -6 22" stroke="#ef4444" stroke-width="2" stroke-dasharray="3 3" fill="none"/>` +
    T(160,28,'A magnet pulls on some metals',14) + T(160,168,'No touching needed!',12,'#8b5cf6'));

  A.g_poles = () => svg(
    bar(80,66,160,48) + T(40,88,'north',12,'#ef4444') + T(40,104,'pole',12,'#ef4444') + T(280,88,'south',12,'#2563eb') + T(280,104,'pole',12,'#2563eb') +
    `<path d="M120 62 Q160 14 200 62" fill="none" stroke="#9aa5b5" stroke-width="2"/><path d="M104 62 Q160 2 216 62" fill="none" stroke="#9aa5b5" stroke-width="2"/><path d="M120 118 Q160 166 200 118" fill="none" stroke="#9aa5b5" stroke-width="2"/><path d="M104 118 Q160 178 216 118" fill="none" stroke="#9aa5b5" stroke-width="2"/>` +
    T(160,172,'Force is strongest at the poles',12));

  A.g_attract = () => svg(T(160,18,'Opposites attract, likes repel',13) +
      bar(26,38,70,26,'#ef4444','#3b82f6','N','S') + bar(224,38,70,26,'#ef4444','#3b82f6','N','S') +
      arrow(104,51,142,51,'#16a34a',5) + arrow(216,51,178,51,'#16a34a',5) + T(160,86,'S meets N: ATTRACT (pull together)',12,'#16a34a') +
      bar(26,104,70,26,'#3b82f6','#ef4444','S','N') + bar(224,104,70,26,'#ef4444','#3b82f6','N','S') +
      arrow(142,117,104,117,'#dc2626',5) + arrow(178,117,216,117,'#dc2626',5) + T(160,152,'N meets N: REPEL (push apart)',12,'#dc2626') + T(160,172,'S meets S also repel',11,'#dc2626'));

  A.g_materials = () => {
    const col = (x,title,col,items) => `<g><rect x="${x-74}" y="30" width="148" height="132" rx="12" fill="#fff" stroke="${col}" stroke-width="3"/>${T(x,52,title,13,col)}` + items.map((it,i)=>T(x-36+(i%2)*72, 88+Math.floor(i/2)*40, it[0],24) + T(x-36+(i%2)*72, 104+Math.floor(i/2)*40, it[1],9.5)).join('') + `</g>`;
    return svg(col(82,'ATTRACTED ✅','#16a34a',[['🔩','iron nail'],['📎','paper clip'],['🔧','screw'],['🥫','steel can']]) + col(238,'NOT attracted ❌','#dc2626',[['✏️','wood'],['🥤','aluminum'],['🔮','glass'],['🥄','plastic']]));
  };

  A.g_distance = () => svg(
    T(160,18,'The closer the magnet, the stronger the pull',12) +
    bar(20,32,70,26,'#ef4444','#3b82f6','N','S') + clip(138,45,0) + arrow(128,45,98,45,'#16a34a',8) + T(240,40,'CLOSE = STRONG pull',12,'#16a34a') +
    bar(20,100,70,26,'#ef4444','#3b82f6','N','S') + clip(284,113,0) + arrow(262,113,242,113,'#dc2626',2) + T(190,150,'FAR = WEAK pull',12,'#dc2626'));

  A.g_earth = () => svg(
    `<circle cx="110" cy="92" r="64" fill="#5aa9f0"/><path d="M70 70 q20 -26 44 -10 q12 14 -4 28 q-24 6 -40 -18z M112 110 q22 -6 30 14 q-8 22 -26 14z" fill="#7bc67e"/>` +
    `<rect x="102" y="26" width="16" height="132" rx="6" fill="#ef4444" opacity=".35"/><rect x="102" y="92" width="16" height="66" rx="6" fill="#3b82f6" opacity=".35"/>` + T(110,20,'North',12) + T(110,174,'South',12) +
    `<circle cx="244" cy="92" r="46" fill="#fff" stroke="#6b7a90" stroke-width="5"/><polygon points="244,56 234,92 254,92" fill="#ef4444"/><polygon points="244,128 234,92 254,92" fill="#3b82f6"/>` + T(244,50,'N',12,'#24304a') + T(244,146,'S',12) + T(244,166,'compass needle',11,'#24304a') + T(244,22,'points north',11,'#ef4444'));

  A.e_wire = () => svg(
    `<rect x="26" y="70" width="40" height="52" rx="6" fill="#34d399" stroke="#047857" stroke-width="3"/>${T(46,100,'🔋',22)}` +
    `<path d="M66 82 H160 M160 82 H254 V160 H46 V122" fill="none" stroke="#b45309" stroke-width="5"/>` +
    arrow(100,82,150,82,'#f59e0b',4) + T(130,66,'electric current',11,'#b45309') +
    `<ellipse cx="205" cy="82" rx="26" ry="14" fill="none" stroke="#8b5cf6" stroke-width="2.5" stroke-dasharray="4 3"/><ellipse cx="205" cy="82" rx="42" ry="24" fill="none" stroke="#8b5cf6" stroke-width="2" stroke-dasharray="4 3"/>` + T(250,36,'magnetic force around the wire',11,'#6d28d9','end') + T(160,176,'Current flows around a loop = a circuit',11));

  A.e_build = () => {
    let coil = ''; for(let i=0;i<8;i++) coil += `<path d="M${112+i*13} 64 q10 22 0 44" fill="none" stroke="#b45309" stroke-width="4"/>`;
    return svg(
      T(160,22,'Electromagnet = nail + coil + battery',13) +
      `<rect x="96" y="76" width="140" height="20" rx="4" fill="#9aa5b5" stroke="#6b7a90" stroke-width="2"/><polygon points="236,76 256,86 236,96" fill="#9aa5b5" stroke="#6b7a90" stroke-width="2"/>` + coil +
      `<path d="M62 118 V58 H112" fill="none" stroke="#b45309" stroke-width="3"/><path d="M204 108 V160 H62 V150" fill="none" stroke="#b45309" stroke-width="3"/>` +
      `<rect x="42" y="118" width="40" height="32" rx="6" fill="#34d399" stroke="#047857" stroke-width="3"/>` + T(62,141,'🔋',18) +
      clip(262,100,80)+clip(266,114,100)+clip(262,128,70) +
      T(150,50,'coil of wire',11,'#b45309') + T(168,136,'iron nail',11,'#475569') + T(262,150,'clips stick',10,'#475569') + T(160,176,'Current flows → the nail becomes a magnet',11));
  };

  A.e_onoff = () => svg(
    `<rect x="0" y="0" width="160" height="180" rx="14" fill="#ecfdf3"/><rect x="40" y="40" width="80" height="16" rx="6" fill="#9aa5b5"/>` + T(80,26,'SWITCH ON ✅',13,'#16a34a') + clip(60,70,0)+clip(80,74,10)+clip(100,70,-10)+clip(70,88,20)+clip(92,90,-15) + T(80,138,'clips stick',12) + T(80,158,'current flows',11,'#16a34a') +
    `<rect x="160" y="0" width="160" height="180" fill="#fef2f2"/><rect x="200" y="40" width="80" height="16" rx="6" fill="#cbd5e1"/>` + T(240,26,'SWITCH OFF ❌',13,'#dc2626') + clip(210,140,30)+clip(235,148,-20)+clip(262,142,10)+clip(224,128,60)+clip(250,130,-50) + arrow(240,66,240,112,'#dc2626',3) + T(240,172,'clips fall',12));

  A.e_stronger = () => {
    const nail = (x,coils,batt,clips,label) => { let c=''; for(let i=0;i<coils;i++) c+=`<line x1="${x-24+i*(48/Math.max(coils,1))}" y1="64" x2="${x-18+i*(48/Math.max(coils,1))}" y2="86" stroke="#b45309" stroke-width="3"/>`;
      let cl=''; for(let i=0;i<clips;i++) cl+=clip(x-14+(i%3)*14, 112+Math.floor(i/3)*10, (i*37)%50-25);
      return `<rect x="${x-30}" y="68" width="60" height="14" rx="5" fill="#9aa5b5"/>${c}${T(x,48,'🔋'.repeat(batt),14)}${cl}${T(x,162,label,11)}`; };
    return svg(nail(60,3,1,1,'few coils') + nail(160,8,1,4,'more coils') + nail(260,8,3,9,'more batteries') + T(160,22,'Stronger electromagnet = more clips',12,'#6d28d9'));
  };

  A.e_flip = () => svg(
    `<rect x="0" y="0" width="160" height="180" rx="14" fill="#f3f0ff"/>` + bar(30,68,100,36,'#ef4444','#3b82f6','N','S') + T(80,36,'🔋 + on the left',12) + arrow(60,126,100,126,'#f59e0b',4) + T(80,148,'current →',11,'#b45309') +
    `<rect x="160" y="0" width="160" height="180" fill="#fff7ed"/>` + bar(190,68,100,36,'#3b82f6','#ef4444','S','N') + T(240,36,'🔋 flipped!',12) + arrow(270,126,230,126,'#f59e0b',4) + T(240,148,'← current',11,'#b45309') + T(160,176,'Flip the battery → the poles switch!',12));

  A.e_uses = () => svg(
    `<rect x="10" y="130" width="300" height="40" fill="#e3e8ef"/><rect x="40" y="40" width="10" height="90" fill="#f59e0b"/><rect x="40" y="40" width="100" height="8" fill="#f59e0b"/>` +
    `<line x1="132" y1="48" x2="132" y2="76" stroke="#475569" stroke-width="3"/><rect x="108" y="76" width="48" height="16" rx="6" fill="#8b5cf6"/>${T(132,88,'⚡',12,'#fff')}` +
    `<rect x="104" y="100" width="56" height="20" rx="6" fill="#ef4444"/><circle cx="116" cy="124" r="6" fill="#24304a"/><circle cx="148" cy="124" r="6" fill="#24304a"/>` +
    T(132,26,'Junkyard crane lifts cars',12) +
    T(214,66,'🔔',26) + T(214,82,'doorbell',10) + T(264,66,'🔊',26) + T(264,82,'speaker',10) + T(214,118,'⚙️',26) + T(214,134,'motor',10) + T(264,118,'🚄',26) + T(264,134,'maglev train',10));

  return A;
})();
