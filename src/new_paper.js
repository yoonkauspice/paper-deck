// 새 논문 시작: 폴더 만들기 + PDF 가져오기 + 텍스트 추출 + 쪽 수 확인
// 사용: node src/new_paper.js <키> [PDF]      (또는 npm run new -- <키> <PDF>)
//   <키>: 영문 소문자 짧은 이름(예: schelling)
//   PDF: 다음 중 하나. 생략하면 input/<키>/source.pdf 가 이미 있어야 함
//     - 파일 경로: 윈도우 경로(C:\...)나 Linux 경로. Claude Code 웹에서는 저장소의 inbox/<파일>.pdf
//     - URL(https://...): 공개 논문 PDF를 내려받음(웹 세션은 네트워크 허용 도메인에 그 사이트가 있어야 함)
// 만드는 것: input/<키>/{source.pdf, extract/full.txt, figures/, sources/}, papers/<키>/{meta.json, assets/}, output/<키>/
// papers/<키>/ 가 이미 있으면(다른 PC나 새 웹 세션) 원문만 다시 준비하고 작업 원고는 건드리지 않음
const fs=require('fs'),path=require('path'),cp=require('child_process'),https=require('https'),http=require('http');
const {paper}=require('./paths');
const [key,src]=process.argv.slice(2);
if(!key||!/^[a-z0-9_-]+$/.test(key)){console.error('usage: node src/new_paper.js <키(영문 소문자)> [PDF 경로 또는 URL]');process.exit(1);}
const P=paper(key);
const resume=fs.existsSync(path.join(P.work,'meta.json'));
if(resume&&fs.existsSync(P.pdf)&&!src){console.error('이미 준비된 키입니다: papers/'+key+', input/'+key+' (그대로 이어서 작업하면 됩니다)');process.exit(1);}

function download(url,dest,left){
  return new Promise((ok,bad)=>{const lib=url.startsWith('https:')?https:http;
    lib.get(url,{headers:{'User-Agent':'paper-deck/1.0','Accept':'application/pdf,*/*'}},res=>{
      if([301,302,303,307,308].includes(res.statusCode)&&res.headers.location){res.resume();
        if(left<=0)return bad(new Error('리디렉션이 너무 많습니다'));return download(new URL(res.headers.location,url).href,dest,left-1).then(ok,bad);}
      if(res.statusCode!==200){res.resume();return bad(new Error('내려받기 실패: HTTP '+res.statusCode+' '+url));}
      const out=fs.createWriteStream(dest);res.pipe(out);out.on('finish',()=>out.close(ok));out.on('error',bad);
    }).on('error',e=>bad(new Error('내려받기 실패: '+e.message+' (웹 세션이면 네트워크 허용 도메인 확인)')));});
}
(async()=>{
  for(const d of [P.extract,P.figures,P.sources,path.join(P.work,'assets'),P.output])fs.mkdirSync(d,{recursive:true});
  if(src&&/^https?:\/\//i.test(src)){
    await download(src,P.pdf,5).catch(e=>{console.error(e.message);process.exit(1);});
    const head=Buffer.alloc(5);const fd=fs.openSync(P.pdf,'r');fs.readSync(fd,head,0,5,0);fs.closeSync(fd);
    if(head.toString()!=='%PDF-'){fs.renameSync(P.pdf,P.pdf+'.not-pdf');console.error('받은 파일이 PDF가 아닙니다(로그인·안내 페이지일 수 있음): input/'+key+'/source.pdf.not-pdf');process.exit(1);}
    console.log('내려받음: '+src);
  }else if(src){let p=src;
    if(/^[A-Za-z]:[\\/]/.test(p)||p.startsWith('\\\\')){
      try{p=cp.execFileSync('wslpath',['-u',p]).toString().trim();}catch(e){console.error('윈도우 경로를 바꾸지 못했습니다(WSL이 아니면 Linux 경로를 주세요): '+src);process.exit(1);}}
    if(!fs.existsSync(p)){console.error('PDF를 찾지 못했습니다: '+src);process.exit(1);}fs.copyFileSync(p,P.pdf);}
  if(!fs.existsSync(P.pdf)){console.error('source.pdf가 없습니다. PDF 경로나 URL을 함께 주거나 input/'+key+'/source.pdf 로 넣으세요.');process.exit(1);}
  const full=path.join(P.extract,'full.txt');
  cp.execFileSync('pdftotext',['-layout',P.pdf,full]);
  const info=cp.execFileSync('pdfinfo',[P.pdf]).toString(),pages=+(info.match(/Pages:\s+(\d+)/)||[])[1]||0;
  const chars=fs.readFileSync(full,'utf8').replace(/\s/g,'').length;
  if(!resume)fs.writeFileSync(path.join(P.work,'meta.json'),JSON.stringify({title:'',short:'',parts:[]},null,1)+'\n');
  console.log((resume?'원문 다시 준비: ':'준비 완료: ')+'input/'+key+'/ (원문, '+pages+'쪽, 텍스트 '+chars.toLocaleString()+'자), papers/'+key+'/ ('+(resume?'기존 작업 원고 그대로':'작업 원고')+')');
  if(resume&&fs.existsSync(path.join(P.work,'figures.txt')))console.log('논문 그림 기록이 있습니다. 다시 만들기: node src/pdf_figure.js '+key+' --all');
  if(pages&&chars/pages<300)console.log('주의: 쪽당 글자가 적습니다. 스캔본이면 OCR이 필요할 수 있습니다(쪽 이미지는 node src/pdf_figure.js '+key+' <쪽>).');
  console.log('다음: Claude에게 "'+key+' 논문 파랑이로(또는 노랑이로) 만들어줘"');
})();
