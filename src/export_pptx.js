// PPTX 내보내기 (파랑이 deck.html, 노랑이 story.html 공통)
// 사용: node src/export_pptx.js <키> [deck|story]   (생략하면 있는 것 모두. 또는 npm run export -- <키>)
//  - 파랑이: 슬라이드마다 1280×720을 1.5배로 캡처(1920×1080) → output/<키>/deck.pptx. 노트 = papers/<키>/work/script.md의 "## 번호" 절(없으면 장 제목 + 2줄 메시지)
//    meta.json에 "file":"이름"이 있으면 output/<키>/이름.pptx 로 저장하고 deck.html도 이름.html 로 복사
//    템플릿은 건드리지 않고, 캡처용 임시 사본(output/<키>/export/_deck_shot.html)에만 "한 장 꽉 차게" 스타일을 덧붙임
//  - 노랑이: 표지와 단계마다 1600×900 캡처(?shot=번호) → output/<키>/story.pptx. 노트 = 숫자가 채워진 단계 글
//    끝나면 build.js를 다시 실행해 페이지 상단에 "PPTX 받기" 버튼을 붙임
// 캡처는 크롬 헤드리스. 크롬 위치는 .env 의 CHROME(없으면 자동 탐색: WSL이면 윈도우 Chrome/Edge, Linux면 google-chrome/chromium)
// PPTX는 pptxgenjs. 슬라이드는 이미지라 글자 편집은 안 됨
const fs=require('fs'),path=require('path'),http=require('http'),cp=require('child_process');
const {paper,overlayOf}=require('./paths');
const PptxGenJS=require('pptxgenjs');
let P;try{P=paper(process.argv[2]);}catch(e){console.error('usage: node src/export_pptx.js <키> [deck|story] [--submit]');process.exit(1);}
// --submit: 제출판(node src/build.js <키> --submit 로 만든 output/<폴더>/submit/deck.html)을 제출 파일 이름으로 내보냄
const SUBMIT=process.argv.includes('--submit'),OV=SUBMIT?overlayOf(P.key):null;
if(SUBMIT&&!OV){console.error('제출판 설정이 없습니다: private/overlays/'+P.key+'.json');process.exit(1);}
// --variant <이름>: 용도별 판(node src/build.js <키> --variant <이름> 로 만든 output/<폴더>/<이름>/deck.html) → <파일 이름>_<이름>.pptx
const VAR=(i=>i>0?process.argv[i+1]:null)(process.argv.indexOf('--variant'));
const only=SUBMIT||VAR?'deck':process.argv.slice(3).find(a=>!a.startsWith('--')),ROOT=P.root,abs=SUBMIT?P.submit:VAR?path.join(P.output,VAR):P.output,rel=path.relative(ROOT,abs).split(path.sep).join('/');
const metaP=path.join(P.work,'meta.json'),META0=fs.existsSync(metaP)?JSON.parse(fs.readFileSync(metaP,'utf8')):{};
const META=Object.assign({},META0,OV&&OV.file?{file:OV.file}:{},VAR?{file:(META0.file||P.key)+'_'+VAR}:{});
const CANDIDATES=['/mnt/c/Program Files/Google/Chrome/Application/chrome.exe','/mnt/c/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  '/mnt/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe','/mnt/c/Program Files/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium','/usr/bin/chromium-browser'];
const CHROME=process.env.CHROME||process.env.CHROME_PATH||CANDIDATES.find(p=>fs.existsSync(p));  // CHROME_PATH: Claude Code 웹의 크롬
if(!CHROME||!fs.existsSync(CHROME)){console.error('크롬을 찾지 못했습니다. .env 에 CHROME=크롬 실행 파일 경로 를 적으세요(.env.example 참고).');process.exit(1);}
const onWin=CHROME.startsWith('/mnt/');
const winPath=p=>onWin?cp.execFileSync('wslpath',['-w',p]).toString().trim():p;
const strip=h=>h.replace(/<br\s*\/?>/g,' ').replace(/<\/dt>/g,': ').replace(/<\/(p|h1|h2|h3|h5|li|dd|div)>/g,'\n').replace(/<[^>]+>/g,'')
  .replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/[ \t]+/g,' ').replace(/\n\s*/g,'\n').trim();
const chrome=(args)=>new Promise((ok,bad)=>cp.execFile(CHROME,['--headless=new','--disable-gpu','--virtual-time-budget=9000',...args],{timeout:120000,maxBuffer:64<<20},(e,out)=>e&&!out?bad(e):ok(out.toString())));

const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'};
function serve(){return new Promise(r=>{const s=http.createServer((req,res)=>{const u=decodeURIComponent(req.url.split('?')[0].split('#')[0]);const f=path.join(ROOT,u);
  if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.writeHead(404);res.end();return;}
  res.writeHead(200,{'Content-Type':mime[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(res);});
  // WSL에서 연 포트가 윈도우 쪽에 보이기까지 시간이 걸리므로 잠시 기다린 뒤 사용
  s.listen(0,'127.0.0.1',()=>setTimeout(()=>r(s),onWin?2000:0));});}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function shoot(url,out,w,h,scale){
  for(let k=0;k<4&&!fs.existsSync(out);k++){if(k)await sleep(1500);
    await chrome(['--hide-scrollbars','--window-size='+w+','+h,'--force-device-scale-factor='+(scale||1),'--screenshot='+winPath(out),url]).catch(()=>{});}
  if(!fs.existsSync(out))throw new Error('캡처 실패(4번 시도): '+url);}
async function save(slides,title,outFile){
  const pptx=new PptxGenJS();pptx.layout='LAYOUT_16x9';pptx.title=title;pptx.author='paper-deck';
  // altText를 주지 않으면 pptxgenjs가 이미지의 PC 경로(/home/사용자/...)를 설명으로 넣으므로 장 번호로 대신함
  slides.forEach((x,i)=>{const s=pptx.addSlide();s.background={color:'FFFFFF'};s.addImage({path:x.img,x:0,y:0,w:10,h:5.625,altText:'슬라이드 '+(i+1)});if(x.note)s.addNotes(x.note);});
  await pptx.writeFile({fileName:outFile});console.log('\n저장:',path.relative(ROOT,outFile),slides.length+'장');}

async function deck(port,shotDir){
  const src=fs.readFileSync(path.join(abs,'deck.html'),'utf8');
  const css='<style id="pptx-shot">html,body{background:#fff!important}#nav,#tipbox{display:none!important}#deck{height:720px!important}'
    +'.slide{left:0!important;top:0!important;transform:none!important;box-shadow:none!important}.an{animation:none!important;opacity:1!important}</style>';
  fs.writeFileSync(path.join(shotDir,'_deck_shot.html'),src.replace('</head>',css+'</head>'));
  const all=[...src.matchAll(/<section class="slide[^"]*"([^>]*)>([\s\S]*?)<\/section>/g)],secs=all.map(m=>m[2]),sids=all.map(m=>(m[1].match(/data-id="([^"]*)"/)||[])[1]);
  const notes=secs.map(b=>{const t=(b.match(/<h[12][^>]*>([\s\S]*?)<\/h[12]>/)||[])[1]||'',m=(b.match(/<div class="(?:msg|dm[^"]*)"[^>]*>([\s\S]*?)<\/div>/)||[])[1]||'';return strip(t)+(m?'\n'+strip(m):'');});
  // 발표 스크립트(papers/<키>/work/script.md의 "## 번호" 절)가 있으면 그 장의 노트로 씀
  const sp=path.join(P.work,'script.md'),script={};
  // 절 제목은 장 번호(## 09, 전체판 기준) 또는 장의 data-id(## limits). 용도별 판은 번호가 바뀌므로 data-id 로 찾고, 번호는 전체판에서만 씀
  if(fs.existsSync(sp))fs.readFileSync(sp,'utf8').split(/^## +([\w-]+)[^\n]*\n/m).forEach((t,i,a)=>{if(i%2)script[/^\d+$/.test(t)?+t:t]=a[i+1].trim();});
  const nS=Object.keys(script).length;if(nS&&!VAR&&nS!==secs.length)console.warn('주의: script.md는 '+nS+'장, 덱은 '+secs.length+'장입니다. 없는 장은 제목과 메시지를 노트로 씁니다.');
  const out=[];
  for(let i=0;i<secs.length;i++){const f=path.join(shotDir,'d'+String(i+1).padStart(2,'0')+'.png');
    await shoot('http://localhost:'+port+'/'+rel+'/export/_deck_shot.html#'+(i+1),f,1280,720,1.5);out.push({img:f,note:(sids[i]&&script[sids[i]])||(!VAR&&script[i+1])||notes[i]});process.stdout.write('\r파랑이 캡처 '+(i+1)+'/'+secs.length);}
  const title=(src.match(/<title>([^<]*)<\/title>/)||[])[1]||P.key;
  // meta.json의 file(예: "ABM_Hou")이 있으면 그 이름으로 PPTX와 HTML 사본을 만듦
  const name=META.file||'deck';
  await save(out,title,path.join(abs,name+'.pptx'));
  if(META.file){fs.copyFileSync(path.join(abs,'deck.html'),path.join(abs,name+'.html'));console.log('저장:',path.relative(ROOT,path.join(abs,name+'.html')));}
}
async function story(port,shotDir){
  const base='http://localhost:'+port+'/'+rel+'/story.html';
  const stepRe=/<div class="sc-step(?: [^"]*)?"[^>]*>([\s\S]*?)(?=<div class="sc-step(?: [^"]*)?"|<\/div>\s*<div class="sc-fig">)/g;
  const src=fs.readFileSync(path.join(abs,'story.html'),'utf8');let notes=[...src.matchAll(stepRe)].map(m=>strip(m[1]));
  // 숫자 칸(data-v)이 모두 채워진 화면을 받을 때까지 최대 5번 시도
  let filled=false;
  for(let k=0;k<5&&!filled;k++){try{const dom=await chrome(['--dump-dom',base]);
    const body=(dom.match(/<main>[\s\S]*<\/main>/)||[dom])[0];  // 스크립트 주석의 예시 문자열은 제외
    const empty=(body.match(/data-v="[^"]*"[^>]*><\/span>/g)||[]).length,live=[...dom.matchAll(stepRe)].map(m=>strip(m[1]));
    if(!empty&&live.length===notes.length){notes=live;filled=true;}}catch(e){}}
  if(!filled&&/data-v="/.test(src))console.warn('\n주의: 노트의 숫자 칸을 채우지 못했습니다. 다시 실행하세요.');
  const title=(src.match(/<title>([^<]*)<\/title>/)||[])[1]||P.key,out=[];
  for(let i=0;i<=notes.length;i++){const f=path.join(shotDir,'s'+String(i).padStart(2,'0')+'.png');
    await shoot(base+'?shot='+i,f,1600,900,1);out.push({img:f,note:i?notes[i-1]:title+'\n(표지)'});process.stdout.write('\r노랑이 캡처 '+(i+1)+'/'+(notes.length+1));}
  await save(out,title,path.join(abs,'story.pptx'));
}
(async()=>{
  const want=k=>(!only||only===k)&&fs.existsSync(path.join(abs,k+'.html'));
  if(!want('deck')&&!want('story')){console.error('output/'+P.key+'/deck.html 또는 story.html이 없습니다. 먼저 node src/build.js '+P.key);process.exit(1);}
  const srv=await serve(),port=srv.address().port,shotDir=path.join(abs,'export');
  fs.rmSync(shotDir,{recursive:true,force:true});fs.mkdirSync(shotDir,{recursive:true});
  try{if(want('deck'))await deck(port,shotDir);if(want('story'))await story(port,shotDir);}
  catch(e){console.error('\n'+e.message);srv.close();process.exit(1);}
  srv.close();
  if(want('story'))cp.execFileSync(process.execPath,[path.join(__dirname,'build.js'),P.key],{stdio:'inherit'});
})();
