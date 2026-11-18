// 최종본 정리: output/<폴더>/ 의 완성 파일을 papers/<폴더>/final/ 로 복사하고 안내문(papers/README.md, 폴더별 README.md)을 다시 만듦
// 사용: node src/final.js <키>            (또는 npm run final -- <키>)
//       node src/final.js <키> --submit   제출판(이름·학번이 든 표지 등)을 private/submissions/<폴더>/ 로 복사(비공개 저장소)
//       node src/final.js --index         안내문만 다시 만들기
// 파일 이름: work/meta.json 의 file 값(예: ABM_Hou), 없으면 폴더 이름. 파랑이와 노랑이가 둘 다 있으면 노랑이에 _story를 붙임
// 제출판 이름은 private/overlays/<폴더>.json 의 file 값
// papers/<폴더>/final/ 은 공개 저장소에, 90번대 논문(private/papers/)과 제출판은 비공개 저장소(private/)에 들어간다
const fs=require('fs'),path=require('path');
const {paper,paperDirs,metaOf,dirOf,isPrivate,overlayOf,PAPERS,PRIVATE,PRIVATE_PAPERS}=require('./paths');
const relRoot=p=>path.relative(path.join(__dirname,'..'),p).split(path.sep).join('/');

function copyAll(pairs,from,to,story){fs.mkdirSync(to,{recursive:true});let total=0;
  for(const [s,d] of pairs){const t=path.join(to,d);
    if(s==='story.html')fs.writeFileSync(t,fs.readFileSync(path.join(from,s),'utf8').split('href="story.pptx"').join('href="'+story+'.pptx"'));  // 페이지의 "PPTX 받기" 링크도 새 이름으로
    else fs.copyFileSync(path.join(from,s),t);total+=fs.statSync(t).size;}
  console.log(relRoot(to)+'/ 에 저장: '+pairs.map(p=>p[1]).join(', ')+' ('+(total/1048576).toFixed(1)+'MB)');}
function finalize(P){
  const meta=metaOf(P.key),base=meta.file||P.key,ex=f=>fs.existsSync(path.join(P.output,f));
  const deckPptx=meta.file&&ex(meta.file+'.pptx')?meta.file+'.pptx':'deck.pptx',hasDeck=ex('deck.html'),sb=hasDeck?base+'_story':base;
  const pairs=[['deck.html',base+'.html'],[deckPptx,base+'.pptx'],['story.html',sb+'.html'],['story.pptx',sb+'.pptx']].filter(([s])=>ex(s));
  if(!pairs.length){console.error('output/'+P.key+'/ 에 완성 파일이 없습니다. 먼저 node src/build.js '+P.key+' (PPTX는 node src/export_pptx.js '+P.key+')');process.exit(1);}
  copyAll(pairs,P.output,P.final,sb);
}
function submit(P){
  const ov=overlayOf(P.key);if(!ov||!ov.file){console.error('제출판 설정(file)이 없습니다: private/overlays/'+P.key+'.json');process.exit(1);}
  const ex=f=>fs.existsSync(path.join(P.submit,f)),pairs=[['deck.html',ov.file+'.html'],[ov.file+'.pptx',ov.file+'.pptx']].filter(([s])=>ex(s));
  if(!pairs.length){console.error('제출판이 없습니다. 먼저 node src/build.js '+P.key+' --submit 와 node src/export_pptx.js '+P.key+' --submit');process.exit(1);}
  copyAll(pairs,P.submit,P.submissions,'');
}

const kind=d=>{const w=path.join(dirOf(d),'work');return [fs.existsSync(path.join(w,'slides'))&&'파랑이(슬라이드)',fs.existsSync(path.join(w,'story'))&&'노랑이(스크롤)'].filter(Boolean).join(' + ')||'-';};
const listFiles=f=>fs.existsSync(f)?fs.readdirSync(f).filter(x=>/\.(html|pptx)$/.test(x)).sort():[];
const finals=d=>listFiles(path.join(dirOf(d),'final'));
const NOTE='\n이 파일은 `node src/final.js` 가 자동으로 만듭니다. 직접 고치지 마세요.\n';
function index(){
  const pub=paperDirs().filter(d=>!isPrivate(d)),papers=pub.filter(d=>!/^00_/.test(d)),checks=pub.filter(d=>/^00_/.test(d));
  const row=(d,pre)=>{const m=metaOf(d),fl=finals(d);return '| '+d.slice(0,2)+' | ['+d+']('+pre+d+'/) | '+(m.cite||m.title||'')+' | '+kind(d)+' | '
    +(fl.length?fl.map(x=>'['+x+']('+pre+d+'/final/'+x+')').join('<br>'):'아직 없음')+' |';};
  const head='| 번호 | 폴더 | 논문 | 형식 | 최종 파일 |\n|---|---|---|---|---|\n';
  let md='# 논문 목록\n\n논문 하나 = 폴더 하나입니다. 폴더 이름은 `번호_저자연도_주제`입니다.\n\n'
    +'- **결과물은 각 폴더의 `final/`** 에 있습니다(완성 HTML, PPTX). 받아 갈 파일은 여기만 보면 됩니다.\n'
    +'- `work/` 는 원고입니다(슬라이드 원고, 노트, 아웃라인, 발표 스크립트). 고칠 때는 여기를 고치고 다시 빌드합니다.\n'
    +'- 원문 PDF와 빌드 중간 파일은 PC의 `input/`, `output/` 에만 있고 GitHub에는 올리지 않습니다.\n'
    +'- 결과물 속 논문 그림과 인용은 각 논문 저자에게 저작권이 있습니다. 출처는 슬라이드마다 적었습니다.\n\n'
    +head+papers.map(d=>row(d,'')).join('\n')+'\n';
  if(checks.length)md+='\n## 점검용(논문 아님)\n\n템플릿이 깨지지 않았는지 확인하는 시험 폴더입니다. `npm test` 가 사용합니다.\n\n'+head.replace('논문 |','내용 |')+checks.map(d=>row(d,'')).join('\n')+'\n';
  fs.writeFileSync(path.join(PAPERS,'README.md'),md+NOTE);
  // 비공개 저장소(private/)가 있으면 그쪽 목록도
  if(fs.existsSync(PRIVATE)){const priv=paperDirs().filter(isPrivate),subs=fs.existsSync(path.join(PRIVATE,'submissions'))?fs.readdirSync(path.join(PRIVATE,'submissions')).sort():[];
    let pm='# paper-deck-private (비공개)\n\npaper-deck 의 `private/` 폴더에 연결된 비공개 저장소입니다. 공개 저장소에 올리면 안 되는 것만 둡니다.\n\n'
      +'- `papers/9N_*/`: 비공개 논문(구조는 공개 저장소의 `papers/` 와 같음, 결과물은 `final/`)\n'
      +'- `overlays/<폴더>.json`: 제출판 설정(파일 이름, 표지의 이름·학번 등 공개판에서 바꿀 문구)\n'
      +'- `submissions/<폴더>/`: 제출판 결과물\n\n## 비공개 논문\n\n'+head+(priv.length?priv.map(d=>row(d,'papers/')).join('\n'):'| - | - | - | - | - |')+'\n'
      +'\n## 제출판\n\n| 폴더 | 파일 |\n|---|---|\n'+(subs.length?subs.map(s=>'| '+s+' | '+listFiles(path.join(PRIVATE,'submissions',s)).map(x=>'[' +x+'](submissions/'+s+'/'+x+')').join('<br>')+' |').join('\n'):'| - | - |')+'\n'
      +'\n제출판 다시 만들기: `node src/build.js <키> --submit` → `node src/export_pptx.js <키> --submit` → `node src/final.js <키> --submit`\n';
    fs.writeFileSync(path.join(PRIVATE,'README.md'),pm+NOTE);}
  for(const d of paperDirs()){const m=metaOf(d),fl=finals(d),n=d.slice(0,2);
    const t='# '+d+'\n\n'+(m.cite?'**논문**: '+m.cite+'\n\n':'')+(m.title?'**덱 제목**: '+m.title+'\n\n':'')
      +'| 폴더 | 내용 |\n|---|---|\n| `final/` | **최종 결과물**: '+(fl.length?fl.map(x=>'['+x+'](final/'+x+')').join(', '):'아직 없음')+' |\n'
      +'| `work/` | 원고(고치는 곳): `meta.json`(제목·파일 이름), `slides/` 또는 `story/`(슬라이드 원고, 여러 조각을 이름 순서대로 이어 붙임), 노트, 아웃라인, `script.md`(발표 스크립트) |\n\n'
      +'다시 만들기(PC의 `input/'+d+'/` 에 원문이 있어야 함):\n\n```bash\nnode src/build.js '+n+'\nnode src/export_pptx.js '+n+'\nnode src/final.js '+n+'\n```\n';
    fs.writeFileSync(path.join(dirOf(d),'README.md'),t);}
  console.log('안내문 갱신: papers/README.md, 폴더별 README.md'+(fs.existsSync(PRIVATE)?', private/README.md':''));
}
const args=process.argv.slice(2),arg=args.find(a=>!a.startsWith('--'));
if(!arg&&!args.includes('--index')){console.error('usage: node src/final.js <키> [--submit]   |   node src/final.js --index');process.exit(1);}
if(arg){let P;try{P=paper(arg);}catch(e){console.error(e.message);process.exit(1);}args.includes('--submit')?submit(P):finalize(P);}
index();
