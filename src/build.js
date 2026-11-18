// 사용: node src/build.js <키>      (또는 npm run build -- <키>)
//  - papers/<키>/work/slides/*.html 이 있으면 output/<키>/deck.html (파랑이, 16:9 슬라이드)
//  - papers/<키>/work/story/*.html  이 있으면 output/<키>/story.html (노랑이, 스크롤형)
// 작업 원고의 선택 파일: meta.json(title, parts, short), extra.js(덱 단계 위젯), sims/*.js(시뮬레이션 모형),
//   story/*.js(스크롤 그래픽 핸들러), {{IMG:파일}}(papers/<키>/work/assets → input/<키>/figures 순서로 찾아 파일 안에 포함),
//   {{JSON:파일}}(papers/<키> → output/<키> 순서로 찾음. 예: 실험 결과 results.json)
const fs=require('fs'),path=require('path');
const {paper,findAsset}=require('./paths');
let P;try{P=paper(process.argv[2]);}catch(e){console.error('usage: node src/build.js <키>\n'+e.message);process.exit(1);}
const dir=P.work,T=P.templates;
const rd=p=>fs.readFileSync(p,'utf8');
const ex=p=>fs.existsSync(p);
if(!ex(path.join(dir,'meta.json'))){console.error('papers/'+P.key+'/work/meta.json 이 없습니다. 먼저 node src/new_paper.js '+P.key+' <PDF>');process.exit(1);}
const meta=JSON.parse(rd(path.join(dir,'meta.json')));
const list=(d,ext)=>ex(d)?fs.readdirSync(d).filter(f=>f.endsWith(ext)).sort().map(f=>rd(path.join(d,f))):[];
fs.mkdirSync(P.output,{recursive:true});

const mime={webp:"image/webp",png:"image/png",jpg:"image/jpeg",jpeg:"image/jpeg",svg:"image/svg+xml"};
function need(f,kind){const p=findAsset(P,f);
  if(!p)throw new Error(kind+' 파일을 찾지 못했습니다: '+f+'\n  찾은 곳: papers/'+P.key+'/assets, input/'+P.key+'/figures, output/'+P.key
    +'\n  논문 그림이면 node src/pdf_figure.js '+P.key+' --all, 실험 결과면 replication/run.js 를 먼저 실행');return p;}
const embed=t=>t
  .replace(/\{\{IMG:([^}]+)\}\}/g,(m,f)=>"data:"+mime[f.split(".").pop().toLowerCase()]+";base64,"+fs.readFileSync(need(f,'이미지')).toString("base64"))
  .replace(/\{\{JSON:([^}]+)\}\}/g,(m,f)=>JSON.stringify(JSON.parse(rd(need(path.basename(f),'데이터')))));

function simParts(body){
  if(!/data-sim=/.test(body))return {css:'',js:''};
  return {css:'<style>\n'+rd(path.join(T,'sim.css'))+'</style>\n',
          js:'<script>\n'+rd(path.join(T,'sim.js'))+'\n'+list(path.join(dir,'sims'),'.js').join('\n')+'\n</script>\n'};
}
const headHtml=rd(path.join(T,'head.html')).replace('{{TITLE}}',meta.title);
const tailHtml=rd(path.join(T,'tail.html'));
const rel=f=>path.relative(P.root,f).split(path.sep).join('/');
try{
  // 1) 파랑이
  const slides=list(path.join(dir,'slides'),'.html').join('\n\n');
  if(slides){
    const sim=simParts(slides);
    const extraP=path.join(dir,'extra.js');
    const extra=ex(extraP)?'<script>\n'+rd(extraP)+'\n</script>':'';
    const head=headHtml.replace('</head>',sim.css+'</head>');
    const tail=tailHtml.replace('<!--EXTRA_SCRIPTS-->',sim.js+extra);
    const pn='<script>window.PART_NAMES='+JSON.stringify(meta.parts||[])+';</script>\n';
    const out=path.join(P.output,'deck.html');
    fs.writeFileSync(out,embed(head+'\n'+slides+'\n</div>\n'+pn+tail));
    console.log('built',rel(out),'slides:',(slides.match(/<section class="slide/g)||[]).length,sim.js?'(sim)':'');
  }
  // 2) 노랑이
  const story=list(path.join(dir,'story'),'.html').join('\n\n');
  if(story){
    const sim=simParts(story);
    // 노랑이는 파랑이와 다른 전용 테마(src/templates/story.css, Pretendard). 아이콘만 파랑이 템플릿에서 가져옴
    const sprite=(headHtml.match(/<svg width="0"[\s\S]*?<\/svg>/)||[''])[0];
    const head='<!DOCTYPE html>\n<html lang="ko"><head><meta charset="utf-8">\n<title>'+meta.title+'</title>\n'
      +'<meta name="viewport" content="width=device-width,initial-scale=1">\n'
      +'<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">\n'
      +sim.css+'<style>\n'+rd(path.join(T,'story.css'))+'</style>\n</head><body>\n'+sprite;
    const chs=[...story.matchAll(/<section class="sc-ch" id="([^"]+)" data-n="([^"]+)">[\s\S]*?<h2>([\s\S]*?)<\/h2>/g)];
    const toc='<nav class="sc-toc">'+chs.map(m=>'<a href="#'+m[1]+'"><span>'+m[2].replace(/\D/g,'')+'</span>'+m[3].replace(/<br>/g,' ')+'</a>').join('')+'</nav>';
    const bar='<header class="sc-top"><span class="t">'+(meta.short||meta.title)+'</span><span class="c"></span><span class="b">'
      +'<button id="sc-toc-btn">목차</button><button id="sc-full-btn">전체 화면</button>'
      +(ex(path.join(P.output,'story.pptx'))?'<a class="dl" href="story.pptx" download>PPTX 받기</a>':'')+'</span><i class="sc-prog"></i></header>'+toc;
    const tip=tailHtml.split('<!--EXTRA_SCRIPTS-->')[1];
    const js='<script>\n'+rd(path.join(T,'scroll.js'))+'\n</script>\n'+sim.js
      +list(path.join(dir,'story'),'.js').map(s=>'<script>\n'+s+'\n</script>\n').join('');
    const out=path.join(P.output,'story.html');
    fs.writeFileSync(out,embed(head+'\n'+bar+'\n<main>\n'+story+'\n</main>\n'+js+tip));
    console.log('built',rel(out),'chapters:',chs.length,'steps:',(story.match(/class="sc-step"/g)||[]).length,sim.js?'(sim)':'');
  }
  if(!slides&&!story)console.error('papers/'+P.key+'/work/slides/ 또는 story/ 에 html 파일이 없습니다');
}catch(e){console.error(e.message);process.exit(1);}
