/* 조직 안의 Axelrod 문화 확산 모형
   원본: 복잡계/5강/axelrod-조직내여성동학.html 의 makeSim, interactOnce, computeMetrics 로직을 그대로 옮김
   (속도 조절, 프리셋 로직은 공통 부품으로 대체, 이질성 파라미터와 순차 갱신은 파일럿에서 제외) */
(function(){
  var W=20,H=10,F=6,T=4,TRAITS=[2,4,4,4,4,4];
  function idx(x,y){return y*W+x;}
  var C={maj:"#C9D1DD",minLo:"#0046CB",minHi:"#9AA8BC",line:"#203044"};
  function theme(){var cs=getComputedStyle(document.documentElement),g=function(n,d){var v=(cs.getPropertyValue(n)||"").trim();return v||d;};
    C={maj:g("--sim-maj","#C9D1DD"),minLo:g("--sim-min","#0046CB"),minHi:g("--sim-min2","#9AA8BC"),line:g("--sim-line","#203044")};}
  var themed=false;
  function hex(c){var n=parseInt(c.slice(1),16);return[(n>>16)&255,(n>>8)&255,n&255];}
  function lerp(a,b,t){a=hex(a);b=hex(b);return"rgb("+[0,1,2].map(function(i){return Math.round(a[i]+(b[i]-a[i])*t);}).join(",")+")";}

  function init(p,rng){
    var N=W*H,legacyCols=Math.round(W*2/3),culture=new Int16Array(N*F),zone=new Uint8Array(N);
    for(var y=0;y<H;y++)for(var x=0;x<W;x++){var i=idx(x,y);zone[i]=x<legacyCols?0:1;for(var f=1;f<F;f++)culture[i*F+f]=Math.floor(rng()*TRAITS[f]);}
    var ratio=p.minorityRatio/100;
    if(p.placement==="scattered"){
      for(y=0;y<H;y++)for(x=0;x<W;x++){i=idx(x,y);var lf=legacyCols/W,norm=lf*0.5+(1-lf)*3.0;
        var rate=zone[i]===0?ratio*0.5/norm:Math.min(1,ratio*3.0/norm);culture[i*F]=rng()<rate?1:0;}
    }else{
      var target=Math.round(ratio*N),periW=W-legacyCols,blockW=Math.max(1,Math.min(periW,Math.round(Math.sqrt(target*periW/H)))),placed=0;
      for(i=0;i<N;i++)culture[i*F]=0;
      for(y=0;y<H&&placed<target;y++)for(x=legacyCols;x<Math.min(W,legacyCols+blockW)&&placed<target;x++){culture[idx(x,y)*F]=1;placed++;}
    }
    var nb=new Array(N);
    for(y=0;y<H;y++)for(x=0;x<W;x++){i=idx(x,y);
      var radius,moore;if(p.dualNetwork){if(zone[i]===0){radius=2;moore=true;}else{radius=1;moore=false;}}else{radius=2;moore=true;}
      var list=[];
      for(var dy=-radius;dy<=radius;dy++)for(var dx=-radius;dx<=radius;dx++){
        if(!dx&&!dy)continue;if(!moore&&Math.abs(dx)+Math.abs(dy)>radius)continue;
        var nx=x+dx,ny=y+dy;if(nx<0||nx>=W||ny<0||ny>=H)continue;list.push(idx(nx,ny));}
      nb[i]=list;}
    return{N:N,culture:culture,zone:zone,nb:nb,legacyCols:legacyCols,assim:null,t:0,t90:null};
  }
  function interact(st,p,rng,i){
    var c=st.culture,nb=st.nb[i];if(!nb.length)return;
    var j=nb[Math.floor(rng()*nb.length)],shared=0,diff=[];
    for(var f=0;f<F;f++){if(c[i*F+f]===c[j*F+f])shared++;else diff.push(f);}
    if(rng()<shared/F){var el=p.identityFixed?diff.filter(function(f){return f!==0;}):diff;
      if(el.length){var g=el[Math.floor(rng()*el.length)];c[i*F+g]=c[j*F+g];}}
  }
  function step(st,p,rng,n){for(var b=0;b<n;b++)interact(st,p,rng,Math.floor(rng()*st.N));st.t+=n;}

  function measure(st){
    var c=st.culture,N=st.N,visited=new Uint8Array(N),regions=0,femDom=0,stack=[];
    for(var s=0;s<N;s++){if(visited[s])continue;visited[s]=1;stack.length=0;stack.push(s);var size=0,allMin=true;
      while(stack.length){var q=stack.pop();size++;if(c[q*F]!==1)allMin=false;var qx=q%W,qy=(q/W)|0;
        [[1,0],[-1,0],[0,1],[0,-1]].forEach(function(d){var nx=qx+d[0],ny=qy+d[1];if(nx<0||nx>=W||ny<0||ny>=H)return;var n=idx(nx,ny);if(visited[n])return;
          for(var f=0;f<F;f++)if(c[q*F+f]!==c[n*F+f])return;visited[n]=1;stack.push(n);});}
      regions++;if(allMin&&size>=2)femDom++;}
    var mc=[];for(var f=1;f<F;f++)mc.push(new Array(T).fill(0));var minN=0;
    for(var i=0;i<N;i++){if(c[i*F]===1){minN++;continue;}for(f=1;f<F;f++)mc[f-1][c[i*F+f]]++;}
    var mode=mc.map(function(a){return a.indexOf(Math.max.apply(null,a));}),per=new Float32Array(N),sum=0;
    for(i=0;i<N;i++){if(c[i*F]!==1)continue;var m=0;for(f=1;f<F;f++)if(c[i*F+f]===mode[f-1])m++;per[i]=m/(F-1);sum+=per[i];}
    st.assim=per;
    var a=minN?sum/minN:NaN;if(st.t90===null&&a>=0.9)st.t90=st.t;
    return{assim:a,regions:regions,femDom:femDom,minN:minN,t90:st.t90===null?NaN:st.t90};
  }
  function hue(c,i){var h=2166136261;for(var f=1;f<F;f++){h^=c[i*F+f];h=Math.imul(h,16777619);}return(h>>>0)%360;}
  function draw(ctx,st,o){
    if(!themed){theme();themed=true;}
    var cell=Math.floor(Math.min(o.w/W,o.h/H)),ox=Math.floor((o.w-cell*W)/2),oy=Math.floor((o.h-cell*H)/2),c=st.culture;
    for(var y=0;y<H;y++)for(var x=0;x<W;x++){var i=idx(x,y),isMin=c[i*F]===1;
      ctx.fillStyle=o.view==="culture"?"hsl("+hue(c,i)+",46%,"+(isMin?"38%":"62%")+")":(isMin?lerp(C.minLo,C.minHi,st.assim?st.assim[i]:0):C.maj);
      ctx.fillRect(ox+x*cell,oy+y*cell,cell-2,cell-2);
      if(isMin&&o.view==="culture"){ctx.strokeStyle="#fff";ctx.lineWidth=3;ctx.strokeRect(ox+x*cell+3,oy+y*cell+3,cell-8,cell-8);}}
    if(o.p.dualNetwork){var bx=ox+st.legacyCols*cell-1;ctx.save();ctx.strokeStyle=C.line;ctx.setLineDash([10,8]);ctx.lineWidth=4;
      ctx.beginPath();ctx.moveTo(bx,oy-4);ctx.lineTo(bx,oy+H*cell+4);ctx.stroke();ctx.restore();
      ctx.fillStyle=C.line;ctx.font="700 26px 'Noto Sans KR',sans-serif";ctx.textBaseline="top";
      ctx.fillText("기존 조직(반경 2)",ox+6,6);ctx.textAlign="right";ctx.fillText("주변부(반경 1)",ox+W*cell-6,6);ctx.textAlign="left";}
  }

  PaperSim.register("axelrod-org",{
    params:[
      {key:"minorityRatio",label:"소수 비율",type:"range",min:3,max:30,step:1,value:9,fmt:function(v){return v+"%";}},
      {key:"placement",label:"소수 배치",type:"seg",value:"scattered",options:[["scattered","분산"],["clustered","군집"]]},
      {key:"identityFixed",label:"성별 특성",type:"seg",value:true,options:[[true,"고정"],[false,"바뀔 수 있음"]]},
      {key:"dualNetwork",label:"네트워크",type:"seg",value:true,options:[[true,"이중"],[false,"단일"]]}],
    presets:{
      base:{label:"기본",values:{minorityRatio:9,placement:"scattered",identityFixed:true,dualNetwork:true}},
      clu:{label:"군집",values:{minorityRatio:9,placement:"clustered",identityFixed:true,dualNetwork:true}},
      free:{label:"정체성 가변",values:{minorityRatio:9,placement:"scattered",identityFixed:false,dualNetwork:true}},
      single:{label:"단일망",values:{minorityRatio:9,placement:"scattered",identityFixed:true,dualNetwork:false}}},
    views:[["assim","동화 정도"],["culture","문화 벡터"]],
    legend:function(v){if(!themed){theme();themed=true;}return v==="culture"?[["#8FA0C0","다수"],["#3C4A66","소수(흰 테두리)"],["#C9D1DD","색이 같으면 같은 문화"]]:[[C.maj,"다수"],[C.minLo,"소수, 동화 전"],[C.minHi,"소수, 동화됨"]];},
    metrics:[
      {key:"assim",label:"소수 동화율",fmt:function(v){return isNaN(v)?"소수 소멸":Math.round(v*100)+"%";},chart:true,max:1,color:"#0046CB"},
      {key:"regions",label:"문화 영역 수",fmt:function(v){return v;},chart:true,color:"#203044"},
      {key:"t90",label:"90% 도달(상호작용)",fmt:function(v){return isNaN(v)?"–":(v/10000).toFixed(1)+"만";}},
      {key:"femDom",label:"소수만의 영역",tile:false}],
    init:init,step:step,measure:measure,draw:draw,
    batch:40,speeds:[1,4,16],ffChunk:40000,ffMeasure:2000,ffMax:3200000,tLabel:"상호작용"
  });
})();
