// 최종본 정리: output/<폴더>/ 의 완성 파일을 papers/<폴더>/final/ 로 복사하고 안내문(papers/README.md, 폴더별 README.md)을 다시 만듦
// 사용: node src/final.js <키>        (또는 npm run final -- <키>)
//       node src/final.js --index     안내문만 다시 만들기
// 파일 이름: work/meta.json 의 file 값(예: ABM_Hou), 없으면 폴더 이름. 파랑이와 노랑이가 둘 다 있으면 노랑이에 _story를 붙임
// final/ 은 git에 들어간다(GitHub에서 결과물을 받는 곳). 원문 PDF와 작업 부산물은 넣지 않는다
const fs=require('fs'),path=require('path');
const {paper,paperDirs,metaOf,PAPERS}=require('./paths');

function finalize(P){
  const meta=metaOf(P.key),base=meta.file||P.key,o=f=>path.join(P.output,f),ex=f=>fs.existsSync(o(f));
  const deckPptx=meta.file&&ex(meta.file+'.pptx')?meta.file+'.pptx':'deck.pptx',hasDeck=ex('deck.html'),sb=hasDeck?base+'_story':base;
  const pairs=[['deck.html',base+'.html'],[deckPptx,base+'.pptx'],['story.html',sb+'.html'],['story.pptx',sb+'.pptx']].filter(([s])=>ex(s));
  if(!pairs.length){console.error('output/'+P.key+'/ 에 완성 파일이 없습니다. 먼저 node src/build.js '+P.key+' (PPTX는 node src/export_pptx.js '+P.key+')');process.exit(1);}
  fs.mkdirSync(P.final,{recursive:true});let total=0;
  for(const [s,d] of pairs){const to=path.join(P.final,d);
    if(s==='story.html')fs.writeFileSync(to,fs.readFileSync(o(s),'utf8').split('href="story.pptx"').join('href="'+sb+'.pptx"'));  // 페이지의 "PPTX 받기" 링크도 새 이름으로
    else fs.copyFileSync(o(s),to);total+=fs.statSync(to).size;}
  console.log('papers/'+P.key+'/final/ 에 저장: '+pairs.map(p=>p[1]).join(', ')+' ('+(total/1048576).toFixed(1)+'MB)');
}

const kind=d=>{const w=path.join(PAPERS,d,'work');return [fs.existsSync(path.join(w,'slides'))&&'파랑이(슬라이드)',fs.existsSync(path.join(w,'story'))&&'노랑이(스크롤)'].filter(Boolean).join(' + ')||'-';};
const finals=d=>{const f=path.join(PAPERS,d,'final');return fs.existsSync(f)?fs.readdirSync(f).filter(x=>/\.(html|pptx)$/.test(x)).sort():[];};
function index(){
  const ds=paperDirs().filter(d=>!/^9\d_/.test(d)),papers=ds.filter(d=>!/^00_/.test(d)),checks=ds.filter(d=>/^00_/.test(d));
  const row=d=>{const m=metaOf(d),fl=finals(d);return '| '+d.slice(0,2)+' | ['+d+']('+d+'/) | '+(m.cite||m.title||'')+' | '+kind(d)+' | '
    +(fl.length?fl.map(x=>'['+x+']('+d+'/final/'+x+')').join('<br>'):'아직 없음')+' |';};
  let md='# 논문 목록\n\n논문 하나 = 폴더 하나입니다. 폴더 이름은 `번호_저자연도_주제`입니다.\n\n'
    +'- **결과물은 각 폴더의 `final/`** 에 있습니다(완성 HTML, PPTX). 받아 갈 파일은 여기만 보면 됩니다.\n'
    +'- `work/` 는 원고입니다(슬라이드 원고, 노트, 아웃라인, 발표 스크립트). 고칠 때는 여기를 고치고 다시 빌드합니다.\n'
    +'- 원문 PDF와 빌드 중간 파일은 PC의 `input/`, `output/` 에만 있고 GitHub에는 올리지 않습니다.\n\n'
    +'| 번호 | 폴더 | 논문 | 형식 | 최종 파일 |\n|---|---|---|---|---|\n'+papers.map(row).join('\n')+'\n';
  if(checks.length)md+='\n## 점검용(논문 아님)\n\n템플릿이 깨지지 않았는지 확인하는 시험 폴더입니다. `npm test` 가 사용합니다.\n\n| 번호 | 폴더 | 내용 | 형식 | 최종 파일 |\n|---|---|---|---|---|\n'+checks.map(row).join('\n')+'\n';
  md+='\n이 파일은 `node src/final.js` 가 자동으로 만듭니다. 직접 고치지 마세요.\n';
  fs.writeFileSync(path.join(PAPERS,'README.md'),md);
  for(const d of paperDirs()){const m=metaOf(d),fl=finals(d),n=d.slice(0,2);
    const t='# '+d+'\n\n'+(m.cite?'**논문**: '+m.cite+'\n\n':'')+(m.title?'**덱 제목**: '+m.title+'\n\n':'')
      +'| 폴더 | 내용 |\n|---|---|\n| `final/` | **최종 결과물**: '+(fl.length?fl.map(x=>'['+x+'](final/'+x+')').join(', '):'아직 없음')+' |\n'
      +'| `work/` | 원고(고치는 곳): `meta.json`(제목·파일 이름), `slides/` 또는 `story/`(슬라이드 원고, 여러 조각을 이름 순서대로 이어 붙임), 노트, 아웃라인, `script.md`(발표 스크립트) |\n\n'
      +'다시 만들기(PC의 `input/'+d+'/` 에 원문이 있어야 함):\n\n```bash\nnode src/build.js '+n+'\nnode src/export_pptx.js '+n+'\nnode src/final.js '+n+'\n```\n';
    fs.writeFileSync(path.join(PAPERS,d,'README.md'),t);}
  console.log('안내문 갱신: papers/README.md 와 폴더별 README.md');
}
const arg=process.argv[2];
if(!arg){console.error('usage: node src/final.js <키>   |   node src/final.js --index');process.exit(1);}
if(arg!=='--index'){let P;try{P=paper(arg);}catch(e){console.error(e.message);process.exit(1);}finalize(P);}
index();
