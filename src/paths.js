// 프로젝트 폴더 규칙과 설정(.env)을 한곳에서 관리
//   papers/<폴더>/          논문 하나 = 폴더 하나. 폴더 이름은 "번호_저자연도_주제"(예: 04_Hou2025_VacSim)
//     work/                 직접 쓰는 원고(커밋): meta.json, 노트, 아웃라인, slides/, story/, sims/, replication/, assets/, script.md
//     final/                최종 결과물(커밋): 완성 HTML과 PPTX. node src/final.js <키> 로 채움
//   input/<폴더>/           원문 PDF와 원문에서 나온 것(PC 전용, 커밋 안 함): source.pdf, extract/, figures/, sources/
//   output/<폴더>/          빌드 결과(PC 전용, 커밋 안 함): deck.html, story.html, *.pptx, export/, 04_numbers.md, results.json
//   src/templates/          디자인 템플릿(파랑이·노랑이 공용)
//   private/                비공개 저장소(paper-deck-private, 이 저장소에서는 git 제외)
//     papers/NN_*/          비공개 논문과 공개 전 작업 중인 논문(번호는 비공개 쪽에서 따로 매김). 구조는 papers/ 와 같음
//     overlays/<폴더>.json  (선택) 제출판 설정: {"file":"제출 파일 이름","replace":[["공개판 문구","제출판 문구"],...]}
//     submissions/<폴더>/   (선택) 제출판 결과물. build/export/final 에 --submit
// 도구에 주는 <키>는 다음 중 무엇이든 된다: 폴더 이름 전체, 번호(04), meta.json의 alias(hou), 폴더 이름의 한 마디(vacsim)
const fs=require('fs'),path=require('path');
const ROOT=path.join(__dirname,'..'),PAPERS=path.join(ROOT,'papers'),PRIVATE=path.join(ROOT,'private'),PRIVATE_PAPERS=path.join(PRIVATE,'papers');

// .env 읽기(따로 패키지를 쓰지 않음). 이미 있는 환경변수가 우선
(function(){const f=path.join(ROOT,'.env');if(!fs.existsSync(f))return;
  for(const line of fs.readFileSync(f,'utf8').split(/\r?\n/)){const m=line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if(m&&!line.trim().startsWith('#')&&m[2]!==''&&process.env[m[1]]===undefined)process.env[m[1]]=m[2].replace(/^["']|["']$/g,'');}})();

const NAME=/^[A-Za-z0-9_-]+$/;
const listDir=r=>fs.existsSync(r)?fs.readdirSync(r).filter(d=>NAME.test(d)&&fs.statSync(path.join(r,d)).isDirectory()):[];
// 공개 여부는 위치로 정함: private/papers/ 에 있으면 비공개(번호는 공개·비공개가 각자 매김)
const isPrivate=d=>listDir(PRIVATE_PAPERS).includes(d);
function paperDirs(){return [...new Set([...listDir(PAPERS),...listDir(PRIVATE_PAPERS)])].sort();}
// 폴더가 있는 곳(공개 papers/ 또는 비공개 private/papers/)
function dirOf(d){return isPrivate(d)?path.join(PRIVATE_PAPERS,d):path.join(PAPERS,d);}
function metaOf(dir){try{return JSON.parse(fs.readFileSync(path.join(dirOf(dir),'work','meta.json'),'utf8'));}catch(e){return {};}}
// 제출판 설정(private/overlays/<폴더>.json). 없으면 null
function overlayOf(key){const f=path.join(PRIVATE,'overlays',key+'.json');return fs.existsSync(f)?JSON.parse(fs.readFileSync(f,'utf8')):null;}
// <키> → 폴더 이름. 못 찾으면 null, 여러 개가 맞으면 오류
function resolveKey(arg){
  if(!arg)return null;
  let parts=String(arg).replace(/[\\/]+$/,'').split(/[\\/]/);if(['work','final'].includes(parts[parts.length-1]))parts.pop();
  const a=parts[parts.length-1];if(!NAME.test(a))return null;
  const ds=paperDirs(),one=(m,how)=>{if(m.length===1)return m[0];if(m.length>1)throw new Error('"'+a+'"('+how+')에 맞는 논문이 여러 개입니다: '+m.join(', ')+'. 번호나 폴더 이름 전체로 지정하세요');return null;};
  if(ds.includes(a))return a;
  if(/^\d+$/.test(a)){const r=one(ds.filter(d=>d.startsWith(a.padStart(2,'0')+'_')),'번호');if(r)return r;}
  let r=one(ds.filter(d=>metaOf(d).alias===a),'alias');if(r)return r;
  const lc=a.toLowerCase();
  return one(ds.filter(d=>d.toLowerCase().split(/[_-]/).some(t=>t===lc||(lc.length>=3&&t.startsWith(lc)))),'이름');
}
// 새 논문의 폴더 이름: 번호가 없으면 그 저장소(공개 또는 비공개)의 다음 번호를 붙임
function newKey(arg,priv){
  if(/^\d{2}_/.test(arg))return arg;
  const nums=listDir(priv?PRIVATE_PAPERS:PAPERS).map(d=>+(d.match(/^(\d{2})_/)||[])[1]).filter(n=>!isNaN(n));
  return String((nums.length?Math.max(...nums):0)+1).padStart(2,'0')+'_'+arg;
}
function make(key,priv){
  const p=priv===undefined?isPrivate(key):priv,dir=path.join(p?PRIVATE_PAPERS:PAPERS,key),input=path.join(ROOT,'input',key),output=path.join(ROOT,'output',key);
  return {key,root:ROOT,dir,work:path.join(dir,'work'),final:path.join(dir,'final'),input,output,private:p,
    submit:path.join(output,'submit'),submissions:path.join(PRIVATE,'submissions',key),
    pdf:path.join(input,'source.pdf'),extract:path.join(input,'extract'),figures:path.join(input,'figures'),sources:path.join(input,'sources'),
    templates:path.join(ROOT,'src','templates')};
}
// opts.create: 없으면 새 폴더 이름을 만들어 돌려줌(new_paper.js 전용). opts.private: 비공개 저장소(private/papers/)에 만듦
function paper(arg,opts){
  if(!arg)throw new Error('논문 키가 필요합니다(예: 04, hou, 04_Hou2025_VacSim)');
  const key=resolveKey(arg);if(key)return make(key);
  if(opts&&opts.create){const a=String(arg).split(/[\\/]/).pop();if(!NAME.test(a))throw new Error('폴더 이름은 영문·숫자·_·- 만 씁니다: '+a);
    if(opts.private&&!fs.existsSync(PRIVATE))throw new Error('비공개 저장소가 없습니다. 프로젝트 안에서 git clone https://github.com/yoonkauspice/paper-deck-private.git private');
    return Object.assign(make(newKey(a,opts.private),!!opts.private),{isNew:true});}
  throw new Error('논문을 찾지 못했습니다: '+arg+'\n  있는 논문: '+paperDirs().join(', '));
}
// 이미지·데이터 파일을 찾는 순서: 작업 원고(assets) → 원문 그림(figures) → 원고 폴더 → 빌드 결과(output)
function findAsset(p,file){
  for(const c of [path.join(p.work,'assets',file),path.join(p.figures,file),path.join(p.work,file),path.join(p.output,file)])if(fs.existsSync(c))return c;
  return null;
}
const keyOf=arg=>{try{return resolveKey(arg);}catch(e){return null;}};
module.exports={ROOT,PAPERS,PRIVATE,PRIVATE_PAPERS,paper,keyOf,findAsset,paperDirs,metaOf,dirOf,isPrivate,overlayOf};
