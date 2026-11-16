// 레플리케이션 실험: 페이지의 시뮬레이션과 같은 모형 파일(sims/axelrod.js)을 헤드리스로 실행
// 사용: node papers/axelrod_story/replication/run.js  ->  output/axelrod_story/results.json (페이지가 {{JSON:results.json}}으로 읽음)
const fs=require('fs'),path=require('path');
const here=__dirname, REG={};
global.window={addEventListener(){}};
global.PaperSim={register(n,d){REG[n]=d;}};
eval(fs.readFileSync(path.join(here,'..','sims','axelrod.js'),'utf8'));
const M=REG['axelrod-org'];
function rng32(seed){return function(){seed|=0;seed=(seed+0x6D2B79F5)|0;var t=Math.imul(seed^(seed>>>15),1|seed);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296;};}

const SEEDS=Array.from({length:20},(_,i)=>i+1), FINE=2000, CHUNK=40000, MAX=3200000, TRACE=20000, TRACE_MAX=400000;
const same=(a,b)=>['assim','regions','femDom'].every(k=>a[k]===b[k]||(a[k]!==a[k]&&b[k]!==b[k]));

function runOne(values,seed){
  const p=Object.assign({},values), r=rng32(seed), st=M.init(p,r);
  const start=M.measure(st,p); let t=0,prev=null,stable=0;
  while(t<MAX&&stable<3){M.step(st,p,r,FINE);t+=FINE;const v=M.measure(st,p);if(t%CHUNK)continue;stable=prev&&same(prev,v)?stable+1:0;prev=v;}
  return {seed,minN:start.minN,minNEnd:prev.minN,allMin:prev.allMin,assim0:start.assim,t90:prev.t90,assim:prev.assim,regions:prev.regions,femDom:prev.femDom,stopAt:t};
}
function trace(values,seed){
  const p=Object.assign({},values), r=rng32(seed), st=M.init(p,r), out=[];
  for(let t=0;t<=TRACE_MAX;t+=TRACE){ if(t) M.step(st,p,r,TRACE); const v=M.measure(st,p); out.push({t,assim:v.assim,regions:v.regions}); }
  return out;
}
const mean=a=>a.reduce((s,x)=>s+x,0)/a.length, sd=a=>{const m=mean(a);return Math.sqrt(a.reduce((s,x)=>s+(x-m)**2,0)/(a.length-1));};
const fin=a=>a.filter(x=>Number.isFinite(x));

const scenarios=Object.entries(M.presets).map(([key,pr])=>{
  const runs=SEEDS.map(s=>runOne(pr.values,s));
  const t90=fin(runs.map(r=>r.t90));
  return {key,label:pr.label,values:pr.values,runs,
    summary:{t90Mean:t90.length?mean(t90):null,t90Sd:t90.length>1?sd(t90):null,t90N:t90.length,
      regionsMean:mean(runs.map(r=>r.regions)),femDomMean:mean(runs.map(r=>r.femDom)),minNMean:mean(runs.map(r=>r.minN)),
      vanished:runs.filter(r=>r.minN>0&&r.minNEnd===0).length,takeover:runs.filter(r=>r.allMin===1).length},
    trace:trace(pr.values,1)};
});
const out={generated:new Date().toISOString(),env:{node:process.version,platform:process.platform},
  rule:{seeds:SEEDS,measureEvery:FINE,chunk:CHUNK,max:MAX,stop:'지표(동화율, 영역 수, 소수만의 영역)를 4만 회마다 비교해 3번 연속 같으면 정지. 90% 도달 시점은 2천 회 간격으로 측정',traceEvery:TRACE,traceMax:TRACE_MAX,traceSeed:1},
  model:'sims/axelrod.js (복잡계 5강 모형 이식, 이질성·순차 갱신 제외)',scenarios};
const outDir=path.join(here,'..','..','..','output',path.basename(path.join(here,'..')));fs.mkdirSync(outDir,{recursive:true});
fs.writeFileSync(path.join(outDir,'results.json'),JSON.stringify(out,null,1));
for(const s of scenarios){const m=s.summary;console.log(s.label.padEnd(7),'90%도달',m.t90Mean?(m.t90Mean/1e4).toFixed(1)+'±'+(m.t90Sd/1e4).toFixed(1)+'만(n='+m.t90N+')':'–','영역',m.regionsMean.toFixed(1),'소수영역',m.femDomMean.toFixed(1),'소수',m.minNMean.toFixed(1),'소멸',m.vanished,'전체소수',m.takeover);}
