const { chromium } = require('playwright');
(async()=>{
const b=await chromium.launch({...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
const p=await b.newPage(); const errs=[];
p.on('pageerror',e=>errs.push('PAGEERR '+e.message)); p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
await p.setViewportSize({width:1440,height:900});
await p.goto('file://'+require('path').join(__dirname,'..','index.html')); await p.waitForTimeout(300);
const log=(...a)=>console.log(...a);
const dismiss = async()=>{ for(let i=0;i<5;i++){ if(await p.locator('#celebrateOverlay.show').count()){ log('  🎉', await p.locator('#celebrateCard h3').textContent()); await p.locator('#celebrateCard button').click(); await p.waitForTimeout(400);} else break; } };
async function runQuiz(correct=true, wrongEvery=0){
  const n = await p.evaluate(()=>sciRun.qs.length);
  for(let i=0;i<n;i++){
    let k = await p.evaluate(()=>sciRun.qs[sciRun.i].a);
    if(!correct || (wrongEvery && i%wrongEvery===0)) k = (k+1) % (await p.evaluate(()=>sciRun.qs[sciRun.i].opts.length));
    await p.locator('#sro-'+k).click(); await p.getByRole('button',{name:/Next|results/}).click(); await p.waitForTimeout(40);
  }
  await p.waitForTimeout(150); await dismiss();
  return await p.locator('.sci-result .score').textContent();
}
await p.locator('.grade-card.science').click(); await p.waitForTimeout(200);
await p.getByRole('button',{name:/Quizzes & Speed Round/}).click(); await p.waitForTimeout(150);
await p.screenshot({path:'quizmenu.png',fullPage:true});
for(const t of ['Motion','Forces','Magnets','Electromagnets']){
  await p.getByRole('button',{name:new RegExp(t+' Quiz')}).click(); await p.waitForTimeout(100);
  log(t,'quiz n=',await p.evaluate(()=>sciRun.qs.length),'score',await runQuiz(true));
  await p.locator('#backBtn').click(); await p.waitForTimeout(100);
}
await p.getByRole('button',{name:/Speed Round/}).click(); await p.waitForTimeout(100);
await p.screenshot({path:'speed_q.png'});
log('speed n=',await p.evaluate(()=>sciRun.qs.length),'score',await runQuiz(true,4));
await p.screenshot({path:'speed_result.png',fullPage:true});
await p.locator('#backBtn').click(); await p.waitForTimeout(100);
await p.getByRole('button',{name:/Practice Test/}).click(); await p.waitForTimeout(100);
log('test n=',await p.evaluate(()=>sciRun.qs.length),'levels',await p.evaluate(()=>sciRun.qs.map(q=>q.lvl).join('')));
log('test score',await runQuiz(true,5));
await p.screenshot({path:'test_result.png',fullPage:true});
log('mistakes after test:',await p.evaluate(()=>sciP.mistakes.length));
// fix mistakes
await p.getByRole('button',{name:/Fix my mistakes/}).click(); await p.waitForTimeout(100);
log('fix n=',await p.evaluate(()=>sciRun.qs.length),'score',await runQuiz(true));
log('mistakes now:',await p.evaluate(()=>sciP.mistakes.length));
// games
await p.locator('#backBtn').click(); await p.waitForTimeout(100);
log('screen',await p.evaluate(()=>sciState.screen));
await p.getByRole('button',{name:/Play & Explore/}).click(); await p.waitForTimeout(100);
for(const g of ['Push or Pull','Magnetic or Not','Balanced or Unbalanced','Motion Patterns','Fill in the Blank']){
  await p.getByRole('button',{name:new RegExp(g)}).first().click(); await p.waitForTimeout(100);
  if(g==='Push or Pull') await p.screenshot({path:'sort_q.png'});
  if(g==='Fill in the Blank') await p.screenshot({path:'cloze_q.png'});
  log(g,'n=',await p.evaluate(()=>sciRun.qs.length),'score',await runQuiz(true));
  await p.locator('#backBtn').click(); await p.waitForTimeout(100);
}
// flashcards
await p.getByRole('button',{name:/Flashcards/}).click(); await p.waitForTimeout(100);
await p.locator('.sci-flipcard').click(); await p.waitForTimeout(700); await p.screenshot({path:'flash.png'});
for(let i=0;i<3;i++) await p.getByRole('button',{name:/I know it/}).click();
log('cards known',await p.evaluate(()=>Object.keys(sciP.cards).length));
await p.locator('#backBtn').click(); await p.waitForTimeout(100);
// match-up
await p.getByRole('button',{name:/Match-Up/}).click(); await p.waitForTimeout(100);
for(let i=0;i<6;i++){
  const w = await p.evaluate(()=>sciMM.pick.find(v=>!sciMM.matched[v.w]).w);
  await p.locator('.sci-match .sci-mbtn', {hasText:w}).first().click();
  await p.locator('#mm-'+w.replace(/ /g,'_')).click(); await p.waitForTimeout(80);
}
log('match msg:', (await p.locator('#mmMsg').innerText()));
await p.screenshot({path:'match.png'});
await p.locator('#backBtn').click(); await p.waitForTimeout(100);
await p.locator('#backBtn').click(); await p.waitForTimeout(100);
log('badges',await p.evaluate(()=>Object.keys(sciP.badges).join(',')));
await p.getByRole('button',{name:/Cheat Sheet/}).click(); await p.waitForTimeout(100);
await p.screenshot({path:'cheat.png',fullPage:true});
await dismiss();
log('errs',JSON.stringify(errs));
await b.close();})();
