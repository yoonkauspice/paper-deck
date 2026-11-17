// 결과물 내보내기: output/<키>/ 의 최종본을 deliver/<키>/ 로 복사(deliver/ 는 git에 포함)
// 사용: node src/deliver.js <키>      (또는 npm run deliver -- <키>)
// Claude Code 웹에서는 output/ 이 git에 안 들어가 세션 밖으로 나오지 않으므로, 이 폴더를 커밋해서 받는다.
// 로컬에서는 필요할 때만 쓴다. 복사하는 것: deck.html, story.html, deck.pptx, story.pptx, 04_numbers.md
const fs=require('fs'),path=require('path');
const {paper}=require('./paths');
let P;try{P=paper(process.argv[2]);}catch(e){console.error('usage: node src/deliver.js <키>');process.exit(1);}
const dst=path.join(P.root,'deliver',P.key);fs.mkdirSync(dst,{recursive:true});
const mp=path.join(P.work,'meta.json'),nm=fs.existsSync(mp)?JSON.parse(fs.readFileSync(mp,'utf8')).file:'';  // meta.json의 file 이름(있으면)
const files=['deck.html','story.html','deck.pptx','story.pptx','04_numbers.md'].concat(nm?[nm+'.html',nm+'.pptx']:[]).filter(f=>fs.existsSync(path.join(P.output,f)));
if(!files.length){console.error('output/'+P.key+'/ 에 결과물이 없습니다. 먼저 node src/build.js '+P.key);process.exit(1);}
let total=0;for(const f of files){fs.copyFileSync(path.join(P.output,f),path.join(dst,f));total+=fs.statSync(path.join(dst,f)).size;}
console.log('deliver/'+P.key+'/ 에 복사: '+files.join(', ')+' ('+(total/1048576).toFixed(1)+'MB)');
console.log('커밋: git add deliver/'+P.key+' papers/'+P.key+' && git commit -m "'+P.key+' 결과물" && git push');
