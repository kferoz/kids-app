const { chromium } = require('playwright');
(async()=>{
const b=await chromium.launch({...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
const p=await b.newPage(); const errs=[];
p.on('pageerror',e=>errs.push('PAGEERR '+e.message)); p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
await p.setViewportSize({width:1440,height:900});
await p.goto('file://'+require('path').join(__dirname,'..','index.html')); await p.waitForTimeout(300);
const r = await p.evaluate(()=>{
 const out=[];
 for(const s of SCI_STORIES){
  if(!ICONS[s.icon]) out.push('noicon '+s.id);
  const toks=new Set(s.lines.join(' ').toLowerCase().match(/[a-z']+/g));
  for(const t of s.tricky){ if(!toks.has(t.word.toLowerCase())) out.push(s.id+' tricky missing '+t.word); if(t.syll.replace(/·/g,'')!==t.word) out.push(s.id+' syll '+t.word); }
  for(const q of s.questions){ if(q.a<0||q.a>=q.opts.length) out.push(s.id+' bad a'); if(new Set(q.opts).size!==q.opts.length) out.push(s.id+' dup'); if(!q.why) out.push(s.id+' nowhy'); }
  if(s.lines.length<10||s.lines.length>12) out.push(s.id+' lines '+s.lines.length);
 }
 for(const q of SCI_BANK){ if(q.a<0||q.a>=q.opts.length) out.push(q.id+' bad a'); if(new Set(q.opts).size!==q.opts.length) out.push(q.id+' dup opts'); if(!q.why) out.push(q.id+' nowhy'); }
 for(const t of SCI_TOPICS) for(const l of [1,2,3]){ const n=SCI_BANK.filter(q=>q.topic===t.id&&q.lvl===l).length; if(n<(l===1?5:l===2?5:4)) out.push('few '+t.id+l+':'+n); }
 for(const k in SCI_LESSONS) for(const s of SCI_LESSONS[k].slides) if(!SCI_ART[s.art]) out.push('noart '+s.art);
 for(const c of SCI_CLOZE) if(!SCI_VOCAB.find(v=>v.w===c.a)) out.push('cloze '+c.a);
 for(const v of SCI_VOCAB) if(v.s.replace(/·/g,'').replace(/ /g,'')!==v.w.replace(/ /g,'')) out.push('vocab syll '+v.w);
 const pos = {}; SCI_BANK.forEach(q=>pos[q.a]=(pos[q.a]||0)+1);
 const spos = {}; SCI_STORIES.forEach(s=>s.questions.forEach(q=>spos[q.a]=(spos[q.a]||0)+1));
 return {out, bank:SCI_BANK.length, tf:SCI_TF.length, vocab:SCI_VOCAB.length, stories:SCI_STORIES.length, pos, spos};
});
console.log(JSON.stringify(r));
console.log('errs',JSON.stringify(errs));
await b.close();})();
