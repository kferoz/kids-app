const fs = require('fs'), vm = require('vm');
const ctx = vm.createContext({});
vm.runInContext(fs.readFileSync('D:/_projects/kidsapp/grandprix/js/data.js','utf8') +
  '\nthis.RIVALS=RIVALS;this.GP_LAPS=GP_LAPS;', ctx);
const { RIVALS, GP_LAPS } = ctx;

function tune(u){return{base:9+u.engine*0.8,speedMax:3+u.tires*0.5,missRoll:2+u.tires*0.7,
  turboAt:u.nitro>=2?2:3,turboAdd:u.nitro>=3?5:(u.nitro>=1?4:3)};}

function race(acc, speedFrac, u){
  const t=tune(u); let me=0, streak=0;
  for(let i=0;i<GP_LAPS;i++){
    if(Math.random()<acc){ streak++;
      me += t.base + speedFrac*t.speedMax + (streak>=t.turboAt?t.turboAdd:0);
    } else { streak=0; me += t.missRoll; }
  }
  const rv = RIVALS.map(r=>r.pace*GP_LAPS*(0.9+Math.random()*0.2));
  return 1 + rv.filter(d=>d>me).length;
}
const scen = [
  ['10/10 fast   ', 1.00, 0.85], ['10/10 slow   ', 1.00, 0.10],
  ['8/10  fast   ', 0.80, 0.85], ['8/10  medium ', 0.80, 0.50],
  ['6/10  medium ', 0.60, 0.50], ['4/10  medium ', 0.40, 0.50],
];
const kits = [['stock      ',{engine:0,tires:0,nitro:0}],
              ['one upgrade',{engine:1,tires:1,nitro:0}],
              ['maxed      ',{engine:3,tires:3,nitro:3}]];
for (const [kn,u] of kits){
  console.log('\n— ' + kn.trim() + ' car —');
  for (const [name,acc,sp] of scen){
    const c=[0,0,0,0];
    for(let i=0;i<20000;i++) c[race(acc,sp,u)-1]++;
    console.log(`${name}  1st ${(c[0]/200).toFixed(0).padStart(3)}%  2nd ${(c[1]/200).toFixed(0).padStart(3)}%  3rd ${(c[2]/200).toFixed(0).padStart(3)}%  4th ${(c[3]/200).toFixed(0).padStart(3)}%`);
  }
}
