// 프로젝트 폴더 규칙과 설정(.env)을 한곳에서 관리
//   input/<키>/   원문 PDF와 원문에서 나온 것(커밋 안 함): source.pdf, extract/(텍스트·쪽 이미지), figures/(논문 그림 자른 것), sources/(리뷰 등 원문 밖 자료)
//   papers/<키>/  직접 쓴 작업 원고(커밋): meta.json, 노트, 아웃라인, slides/, story/, sims/, replication/, assets/(직접 만든 이미지)
//   output/<키>/  빌드 결과(커밋 안 함): deck.html, story.html, *.pptx, export/, 04_numbers.md, results.json
// 모든 도구는 <키> 하나만 받는다. 예전처럼 papers/<키> 를 줘도 된다.
const fs=require('fs'),path=require('path');
const ROOT=path.join(__dirname,'..');

// .env 읽기(따로 패키지를 쓰지 않음). 이미 있는 환경변수가 우선
(function(){const f=path.join(ROOT,'.env');if(!fs.existsSync(f))return;
  for(const line of fs.readFileSync(f,'utf8').split(/\r?\n/)){const m=line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if(m&&!line.trim().startsWith('#')&&m[2]!==''&&process.env[m[1]]===undefined)process.env[m[1]]=m[2].replace(/^["']|["']$/g,'');}})();

function keyOf(arg){
  if(!arg){return null;}
  const k=path.basename(path.resolve(arg));
  return /^[A-Za-z0-9_-]+$/.test(k)?k:null;
}
function paper(arg){
  const key=keyOf(arg);
  if(!key)throw new Error('논문 키가 필요합니다(예: schelling 또는 papers/schelling)');
  const input=path.join(ROOT,'input',key),work=path.join(ROOT,'papers',key),output=path.join(ROOT,'output',key);
  return {key,root:ROOT,work,input,output,
    pdf:path.join(input,'source.pdf'),extract:path.join(input,'extract'),figures:path.join(input,'figures'),sources:path.join(input,'sources'),
    templates:path.join(ROOT,'templates')};
}
// 이미지·데이터 파일을 찾는 순서: 작업 원고(assets) → 원문 그림(figures) → 빌드 결과(output)
function findAsset(p,file){
  for(const c of [path.join(p.work,'assets',file),path.join(p.figures,file),path.join(p.work,file),path.join(p.output,file)])if(fs.existsSync(c))return c;
  return null;
}
module.exports={ROOT,paper,keyOf,findAsset};
