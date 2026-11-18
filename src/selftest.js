// 회귀 시험: npm test
//  1) 필요한 명령(node, pdftotext, pdfinfo, pdftoppm)과 npm 패키지 확인
//  2) 템플릿 스크립트 문법 확인
//  3) papers/ 의 모든 논문을 빌드(실험 코드가 있으면 먼저 실행). 원문이 필요한 그림이 없는 논문은 "건너뜀"으로 표시
//  4) 노랑이 시험 페이지(00_check_story)와 파랑이 템플릿 시험(00_check_deck)이 만들어지는지 확인
// 크롬 캡처(PPTX)는 시간이 걸려 여기서는 하지 않는다: npm run export -- <키>
const fs=require('fs'),path=require('path'),cp=require('child_process');
const ROOT=path.join(__dirname,'..');
let fail=0,skip=0;
const ok=m=>console.log('  ✓ '+m),bad=m=>{fail++;console.log('  ✗ '+m);},sk=m=>{skip++;console.log('  - '+m);};
console.log('1) 명령과 패키지');
for(const c of ['pdftotext','pdfinfo','pdftoppm']){try{cp.execFileSync(c,['-v'],{stdio:'pipe'});ok(c);}catch(e){e.code==='ENOENT'?bad(c+' 없음(poppler-utils 설치 필요)'):ok(c);}}
try{require.resolve('pptxgenjs',{paths:[ROOT]});ok('pptxgenjs');}catch(e){bad('pptxgenjs 없음(npm ci)');}
console.log('2) 템플릿 스크립트 문법');
for(const f of ['sim.js','scroll.js']){try{new Function(fs.readFileSync(path.join(ROOT,'src','templates',f),'utf8'));ok(f);}catch(e){bad(f+': '+e.message);}}
console.log('3) 논문 빌드');
const keys=fs.readdirSync(path.join(ROOT,'papers')).filter(k=>fs.existsSync(path.join(ROOT,'papers',k,'work','meta.json'))).sort();
for(const k of keys){
  const run=path.join(ROOT,'papers',k,'work','replication','run.js');
  try{if(fs.existsSync(run))cp.execFileSync(process.execPath,[run],{stdio:'pipe'});
    cp.execFileSync(process.execPath,[path.join(__dirname,'build.js'),k],{stdio:'pipe'});ok(k);}
  catch(e){const msg=(e.stderr||'').toString();
    /파일을 찾지 못했습니다/.test(msg)&&!fs.existsSync(path.join(ROOT,'input',k,'source.pdf'))?sk(k+' (원문 그림 필요: input/'+k+'/ 이 이 PC에 없음)'):bad(k+': '+msg.split('\n')[0]);}
}
console.log('4) 시험 페이지 결과');
for(const [k,f] of [['00_check_deck','deck.html'],['00_check_story','story.html']]){const p=path.join(ROOT,'output',k,f);fs.existsSync(p)&&fs.statSync(p).size>1000?ok(k+'/'+f):bad(k+'/'+f+' 없음');}
console.log(fail?'\n실패 '+fail+'개':'\n모두 통과'+(skip?' (건너뜀 '+skip+'개)':''));
process.exit(fail?1:0);
