// 수치 대조: 파랑이(slides/)나 노랑이(story/)에 쓴 숫자가 근거 자료에 있는지 확인
// 사용: node src/check_numbers.js <키> [deck|story]      (또는 npm run check -- <키>)
// 근거 자료: input/<키>/extract/full.txt(원문) + input/<키>/sources/*.txt|md(리뷰 등) + output/<키>/results.json(실험 결과)
// 맞음 판정: 같은 값, 표시 자릿수만큼 반올림한 값(88.39 → 88.4), 100배·1/100 차이(%와 소수)
// 건너뜀: 0~10의 정수, 연도와 연월, § p. 표 그림 식 쪽 뒤의 번호, 장/부/강/번/단계/주차 앞의 번호
// 결과: 콘솔 요약 + output/<키>/04_numbers.md (근거를 못 찾은 숫자와 위치, 앞뒤 글)
// 의도적으로 계산한 값은 papers/<키>/work/numbers_ok.txt 에 "값<TAB>이유" 로 적으면 다음부터 통과
const fs=require('fs'),path=require('path');
const {paper}=require('./paths');
let P;try{P=paper(process.argv[2]);}catch(e){console.error('usage: node src/check_numbers.js <키> [deck|story]');process.exit(1);}
const only=process.argv[3],dir=P.work;
const rd=p=>fs.existsSync(p)?fs.readFileSync(p,'utf8'):'';
const norm=s=>s.replace(/[−–‒]/g,'-').replace(/(\d),(\d{3})/g,'$1$2');

// 1) 근거 숫자 모으기
let ref=rd(path.join(P.extract,'full.txt'));
if(fs.existsSync(P.sources))for(const f of fs.readdirSync(P.sources))if(/\.(txt|md)$/.test(f))ref+='\n'+rd(path.join(P.sources,f));
const rj=path.join(P.output,'results.json');
if(fs.existsSync(rj)){(function walk(o){if(typeof o==='number')ref+=' '+o;else if(o&&typeof o==='object')Object.values(o).forEach(walk);})(JSON.parse(rd(rj)));}
if(!ref.trim()){console.error('근거 자료가 없습니다(input/'+P.key+'/extract/full.txt, input/'+P.key+'/sources/, output/'+P.key+'/results.json)');process.exit(1);}
const refNums=[...norm(ref).matchAll(/(?:\d+\.?\d*|\.\d+)/g)].map(m=>parseFloat(m[0])).filter(Number.isFinite);
const refSet=new Set(refNums.map(String));
const ok=new Map(rd(path.join(dir,'numbers_ok.txt')).split('\n').filter(l=>l.trim()&&!l.startsWith('#')).map(l=>{const [v,...r]=l.split('\t');return[v.trim(),r.join(' ')];}));

function matched(tok){
  const x=parseFloat(tok),d=(tok.split('.')[1]||'').length,tol=0.5*Math.pow(10,-d)+1e-9;
  for(const c of [x,x/100,x*100]){const t=c===x?tol:(c<x?tol/100:tol*100);
    if(refSet.has(String(c)))return true;
    for(const y of refNums)if(Math.abs(y-c)<=t)return true;}
  return false;
}
// 2) 대상 글 꺼내기
function units(kind){
  const files=fs.existsSync(path.join(dir,kind))?fs.readdirSync(path.join(dir,kind)).filter(f=>f.endsWith('.html')).sort():[];
  const out=[];let n=0;
  for(const f of files){const h=rd(path.join(dir,kind,f));
    const re=kind==='slides'?/<section class="slide[^"]*">([\s\S]*?)<\/section>/g:/<div class="sc-(?:step|g)"[^>]*>([\s\S]*?)(?=<div class="sc-(?:step|g)"|<\/section>)/g;
    for(const m of h.matchAll(re)){n++;
      const tips=[...m[1].matchAll(/data-tip="([^"]*)"/g)].map(t=>t[1]).join(' ');
      const text=(m[1].replace(/<script[\s\S]*?<\/script>/g,'').replace(/<style[\s\S]*?<\/style>/g,'').replace(/<(?!text)[^>]*>/g,' ').replace(/<text[^>]*>/g,' ')+' '+tips)
        .replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&nbsp;/g,' ').replace(/\s+/g,' ');
      out.push({where:(kind==='slides'?'슬라이드 ':'단계/그래픽 ')+n+' ('+f+')',text});}}
  return out;
}
const SKIP_BEFORE=/(§\s*|p\.\s*|pp\.\s*|표\s*|그림\s*|식\s*\(|쪽\s*|Fig\.?\s*|Table\s*|부록\s*S?|S|\[)$/;
const SKIP_AFTER=/^(장|부|강|번|단계|주차|교시|쪽|차시|\])/;
function check(kind){
  const us=units(kind);if(!us.length)return null;
  const miss=[];let total=0;
  for(const u of us){const t=norm(u.text);
    for(const m of t.matchAll(/(?<![\w.])-?(\d+(?:\.\d+)?)(?![\d])/g)){
      const tok=m[1],v=parseFloat(tok),before=t.slice(Math.max(0,m.index-12),m.index),after=t.slice(m.index+m[0].length,m.index+m[0].length+4);
      if(!tok.includes('.')&&v<=10)continue;
      if(!tok.includes('.')&&v>=1900&&v<=2100)continue;
      if(/^(19|20)\d\d\.\d{1,2}$/.test(tok))continue;  // 2024.5 같은 연월
      if(SKIP_BEFORE.test(before)||SKIP_AFTER.test(after))continue;
      total++;
      if(ok.has(tok)||matched(tok))continue;
      miss.push({where:u.where,tok,ctx:t.slice(Math.max(0,m.index-28),m.index+m[0].length+20).trim()});}}
  return {kind,total,miss};
}
const kinds=(only?[only]:['deck','story']).map(k=>k==='deck'?'slides':'story');
const reports=kinds.map(check).filter(Boolean);
if(!reports.length){console.error('papers/'+P.key+'/work/slides/ 또는 story/ 가 없습니다');process.exit(1);}
let md='# 수치 대조 결과 ('+P.key+')\n\n근거: input/'+P.key+'/extract/full.txt'+(fs.existsSync(P.sources)?', input/'+P.key+'/sources/':'')+(fs.existsSync(rj)?', output/'+P.key+'/results.json':'')+'\n';
for(const r of reports){
  console.log((r.kind==='slides'?'파랑이':'노랑이')+': 숫자 '+r.total+'개 중 근거를 못 찾은 것 '+r.miss.length+'개');
  md+='\n## '+(r.kind==='slides'?'파랑이(slides)':'노랑이(story)')+' · 숫자 '+r.total+'개, 확인 필요 '+r.miss.length+'개\n\n';
  if(r.miss.length){md+='| 위치 | 값 | 앞뒤 글 |\n|---|---|---|\n'+r.miss.map(x=>'| '+x.where+' | '+x.tok+' | '+x.ctx.replace(/\|/g,'/')+' |').join('\n')+'\n';
    r.miss.slice(0,40).forEach(x=>console.log('  ['+x.where+'] '+x.tok+'  …'+x.ctx+'…'));}}
md+='\n확인 방법: 원문 쪽 이미지(node src/pdf_figure.js '+P.key+' <쪽>)로 보거나, 계산한 값이면 papers/'+P.key+'/numbers_ok.txt에 "값<TAB>이유"를 적는다.\n';
fs.mkdirSync(P.output,{recursive:true});const rep=path.join(P.output,'04_numbers.md');
fs.writeFileSync(rep,md);console.log('보고서: '+path.relative(P.root,rep));
