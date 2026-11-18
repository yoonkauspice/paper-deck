// PDF 쪽 이미지와 그림 잘라내기 (poppler의 pdftoppm, pdfinfo 사용)
// 쪽 전체 보기:  node src/pdf_figure.js <키> <쪽>
//                → input/<키>/extract/pages/p<쪽>.png (읽고 그림 위치를 정할 때)
// 그림 잘라내기: node src/pdf_figure.js <키> <쪽> <이름> --crop x0,y0,x1,y1 [--dpi 200]
//                → input/<키>/figures/<이름>.png  (crop은 쪽 크기 대비 비율 0~1, 왼쪽 위가 0,0)
//                자른 기록은 papers/<키>/work/figures.txt 에 남아(커밋됨) 다른 PC에서 다시 만들 수 있음
// 기록대로 모두 다시 만들기: node src/pdf_figure.js <키> --all
// 페이지 HTML에서는 <img src="{{IMG:<이름>.png}}"> 로 넣는다(빌드 때 파일 안에 포함)
const fs=require('fs'),path=require('path'),cp=require('child_process');
const {paper}=require('./paths');
const argv=process.argv.slice(2),opt=k=>{const i=argv.indexOf('--'+k);return i>=0?argv[i+1]:null;};
const pos=argv.filter((a,i)=>!a.startsWith('--')&&!(argv[i-1]||'').startsWith('--'));
let P;try{P=paper(pos[0]);}catch(e){console.error('usage: node src/pdf_figure.js <키> <쪽> [이름 --crop x0,y0,x1,y1] [--dpi 200] | <키> --all');process.exit(1);}
if(!fs.existsSync(P.pdf)){console.error('원문 PDF가 없습니다: input/'+P.key+'/source.pdf');process.exit(1);}
const logFile=path.join(P.work,'figures.txt');

function render(page,name,crop,dpi){
  const info=cp.execFileSync('pdfinfo',['-f',String(page),'-l',String(page),P.pdf]).toString();
  const m=info.match(new RegExp('Page\\s+'+page+' size:\\s+([\\d.]+) x ([\\d.]+)'))||info.match(/Page size:\s+([\d.]+) x ([\d.]+)/);
  if(!m)throw new Error('쪽 크기를 읽지 못했습니다: '+page+'쪽');
  const Wpx=Math.round(+m[1]/72*dpi),Hpx=Math.round(+m[2]/72*dpi);
  const args=['-r',String(dpi),'-f',String(page),'-l',String(page),'-png','-singlefile'];let outBase;
  if(name){const c=crop.split(',').map(Number);
    if(c.length!==4||c.some(v=>!(v>=0&&v<=1))||c[2]<=c[0]||c[3]<=c[1])throw new Error('--crop 은 0~1 비율 x0,y0,x1,y1');
    args.push('-x',String(Math.round(c[0]*Wpx)),'-y',String(Math.round(c[1]*Hpx)),'-W',String(Math.round((c[2]-c[0])*Wpx)),'-H',String(Math.round((c[3]-c[1])*Hpx)));
    fs.mkdirSync(P.figures,{recursive:true});outBase=path.join(P.figures,name);
  }else{fs.mkdirSync(path.join(P.extract,'pages'),{recursive:true});outBase=path.join(P.extract,'pages','p'+page);}
  cp.execFileSync('pdftoppm',[...args,P.pdf,outBase]);
  console.log('저장:',path.relative(P.root,outBase+'.png'),name?'(잘라냄)':'(쪽 전체 '+Wpx+'×'+Hpx+')');
}
function readLog(){return fs.existsSync(logFile)?fs.readFileSync(logFile,'utf8').split('\n').filter(l=>l.trim()&&!l.startsWith('#')).map(l=>l.trim().split(/\s+/)):[];}
try{
  if(argv.includes('--all')){const rows=readLog();if(!rows.length){console.log('papers/'+P.key+'/work/figures.txt 에 기록이 없습니다');process.exit(0);}
    for(const [name,page,crop,dpi] of rows)render(+page,name.replace(/\.png$/,''),crop,+(dpi||200));}
  else{const page=+pos[1],name=pos[2];if(!page){console.error('쪽 번호가 필요합니다');process.exit(1);}
    const dpi=+(opt('dpi')||(name?200:110)),crop=opt('crop')||'0,0,1,1';
    render(page,name,crop,dpi);
    if(name){const rows=readLog().filter(r=>r[0].replace(/\.png$/,'')!==name);rows.push([name,String(page),crop,String(dpi)]);
      fs.writeFileSync(logFile,'# 이름 쪽 crop(x0,y0,x1,y1) dpi  — node src/pdf_figure.js '+P.key+' --all 로 input/'+P.key+'/figures/ 를 다시 만듦\n'+rows.map(r=>r.join(' ')).join('\n')+'\n');}}
}catch(e){console.error(e.message);process.exit(1);}
