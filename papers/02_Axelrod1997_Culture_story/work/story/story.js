/* Axelrod 스크롤 관찰기: 데이터 연결과 그래픽 핸들러 */
(function(){
  var RAW={{JSON:results.json}};
  var S=ScrollStory,C=S.color,el=S.svg;
  var sc={};
  RAW.scenarios.forEach(function(s){var m=Object.assign({},s.summary);
    m.full=s.runs.filter(function(r){return r.assim===1;}).length;sc[s.key]=m;});
  S.data={raw:RAW,sc:sc};
  var COL={base:C.accent,clu:C.yellow,single:C.navy,free:C.mid};
  var byKey={};RAW.scenarios.forEach(function(s){byKey[s.key]=s;});
  function q(g){return g.querySelector(".sc-gb");}
  function sim(g){var r=g.querySelector(".sim");return r&&r._sim;}

  /* 01 규칙: i와 j의 특성 벡터 */
  var I=[1,2,1,3,0,2],J=[0,2,1,0,0,3],LB=["성별","문화 1","문화 2","문화 3","문화 4","문화 5"];
  var rule=null;
  function buildRule(box){
    box.innerHTML="";var s=el("svg",{viewBox:"0 0 760 420"});box.appendChild(s);
    var o={s:s,ci:[],cj:[],ti:[],tj:[]},x0=150,w=88;
    LB.forEach(function(l,k){s.appendChild(el("text",{x:x0+k*w+w/2-4,y:70,"text-anchor":"middle","font-size":13.33,fill:C.gray},k+"번 "+l));});
    [["i",I,120,"ci","ti"],["j",J,250,"cj","tj"]].forEach(function(r){
      o["row"+r[0]]=el("g",{});s.appendChild(o["row"+r[0]]);
      o["row"+r[0]].appendChild(el("text",{x:110,y:r[2]+44,"text-anchor":"end","font-size":32,fill:C.navy,"font-weight":700},r[0]));
      r[1].forEach(function(v,k){var c=el("rect",{x:x0+k*w,y:r[2],width:w-10,height:72,fill:"#fff",stroke:C.navy,"stroke-width":2});
        var t=el("text",{x:x0+k*w+w/2-5,y:r[2]+46,"text-anchor":"middle","font-size":28,fill:C.navy,"font-weight":700},v);
        o["row"+r[0]].appendChild(c);o["row"+r[0]].appendChild(t);o[r[3]].push(c);o[r[4]].push(t);});});
    s.appendChild(el("defs",{})).innerHTML='<pattern id="hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="8" height="8" fill="#fff"/><line x1="0" y1="0" x2="0" y2="8" stroke="#9AA8BC" stroke-width="4"/></pattern>';
    o.link=el("line",{x1:96,y1:202,x2:96,y2:238,stroke:C.accent,"stroke-width":4});s.appendChild(o.link);
    o.note=el("text",{x:150,y:370,"font-size":20,fill:C.navy,"font-weight":700},"");s.appendChild(o.note);
    o.arrow=el("path",{d:"M"+(150+3*88+39)+" 248 L"+(150+3*88+39)+" 200",stroke:C.accent,"stroke-width":4,fill:"none","marker-end":""});s.appendChild(o.arrow);
    return o;}
  S.on("g-rule",function(st,g){
    if(!rule)rule=buildRule(q(g));var o=rule;
    o.rowj.style.opacity=st>=2?1:.15;o.link.style.opacity=st>=2?1:0;o.arrow.style.opacity=st>=4?1:0;
    for(var k=0;k<6;k++){var same=I[k]===J[k];
      var fi=k===0&&st>=4?"url(#hatch)":(st>=3&&same?C.yellow:"#fff");
      o.ci[k].setAttribute("fill",fi);o.cj[k].setAttribute("fill",k===0&&st>=4?"url(#hatch)":(st>=3&&same?C.yellow:"#fff"));
      o.ci[k].setAttribute("stroke-width",st>=3&&same?4:2);o.cj[k].setAttribute("stroke-width",st>=3&&same?4:2);}
    o.ti[3].textContent=st>=4?J[3]:I[3];o.ti[3].setAttribute("fill",st>=4?C.accent:C.navy);
    o.note.textContent=st===1?"0번은 성별(2가지 값), 1~5번은 문화(각 4가지 값)":st===2?"i: 무작위로 고른 사람 · j: i의 이웃 중 한 명":
      st===3?"같은 특성 3개 → 이번 차례 상호작용 확률 3 ÷ 6 = 50%":"다른 특성(0, 3, 5번) 중 성별을 뺀 하나(3번)를 j 값으로 바꿈";
  });

  /* 표지 그림: 노란 원 + 20×10 격자(소수는 파랑, 주변부에 더 많이) */
  (function(){var svg=document.getElementById("hero-art");if(!svg)return;
    svg.appendChild(el("circle",{cx:470,cy:92,r:70,fill:C.yellow,stroke:C.navy,"stroke-width":4}));
    svg.appendChild(el("rect",{x:40,y:120,width:520,height:280,rx:14,fill:"#fff",stroke:C.navy,"stroke-width":4}));
    var r=PaperSim.rng(7),cell=24,x0=60,y0=140;
    for(var y=0;y<10;y++)for(var x=0;x<20;x++){var peri=x>=13,blue=r()<(peri?0.22:0.04);
      svg.appendChild(el("rect",{x:x0+x*cell,y:y0+y*cell,width:cell-4,height:cell-4,rx:3,fill:blue?C.accent:"#E3E5EA"}));}
    svg.appendChild(el("line",{x1:x0+13*cell-2,x2:x0+13*cell-2,y1:y0-8,y2:y0+10*cell+4,stroke:C.navy,"stroke-width":4,"stroke-dasharray":"10 8"}));})();

  /* 02 조직, 03 돌려 보기: 시뮬레이션 제어 */
  S.on("g-org",function(st,g){var m=sim(g);if(!m)return;m.preset("base");m.view(st>=3?"culture":"assim");});
  S.on("g-run",function(st,g){var m=sim(g);if(!m)return;m.view("assim");
    if(st===1)m.preset("base");else if(st===2){m.preset("base");m.ff();}else{m.preset("free");m.ff();}});

  /* 04 레플리케이션 차트 */
  var man=function(v){return (v/10000).toFixed(0)+"만";};
  S.on("g-trace",function(st,g){S.lines(q(g),["base","clu","single"].map(function(k){
      return{label:byKey[k].label,color:COL[k],outline:k==="clu"?C.navy:null,w:4,pts:byKey[k].trace.map(function(p){return[p.t,p.assim];})};}),
    {max:1,step:.25,fmt:S.fmt.pct,ylabel:"소수 동화율",xfmt:man,xlabel:"상호작용 횟수"});});
  S.on("g-t90",function(st,g){var keys=["base","single","clu"];
    S.dots(q(g),keys.map(function(k){return{label:byKey[k].label,sub:"n="+sc[k].t90N,color:COL[k],stroke:k==="clu"?C.navy:null,opacity:k==="clu"?.9:.55,
      values:byKey[k].runs.map(function(r){return r.t90;}).filter(function(v){return v!=null;})};}),
      {max:250000,step:50000,fmt:function(v){return (v/10000).toFixed(1)+"만";},ylabel:"90% 도달까지 상호작용 횟수",l:80});});
  S.on("g-final",function(st,g){var b=q(g);
    b.innerHTML='<table class="sm"><thead><tr><th>시나리오</th><th>처음 소수(명)</th><th>최종 문화 영역(개)</th><th>소수만의 영역(개)</th><th>동화율 100%</th></tr></thead><tbody>'+
      ["base","single","clu"].map(function(k){var m=sc[k];return"<tr><th>"+byKey[k].label+"</th><td>"+m.minNMean.toFixed(1)+"</td><td class=\"ac\">"+m.regionsMean.toFixed(1)+"</td><td>"+m.femDomMean.toFixed(1)+"</td><td>"+m.full+" / 20</td></tr>";}).join("")+
      "</tbody></table>";});
  S.on("g-free",function(st,g){var m=sc.free;
    S.hbars(q(g),[{label:"소수 표식 사라짐",value:m.vanished,text:m.vanished+"회",color:C.mid},
      {label:"소수 표식이 전체로",value:m.takeover,text:m.takeover+"회",color:C.accent},
      {label:"그 밖의 결말",value:20-m.vanished-m.takeover,text:(20-m.vanished-m.takeover)+"회",color:C.navy}],{max:20,h:300,t:20,b:20});});

  /* 05 환경 */
  S.on("g-env",function(st,g){var r=RAW.rule,b=q(g);
    b.innerHTML='<table class="sm"><tbody>'+[
      ["모형 파일",RAW.model],["실행 환경","Node.js "+RAW.env.node+" ("+RAW.env.platform+")"],["생성 시각",RAW.generated.replace("T"," ").slice(0,16)+" UTC"],
      ["시드",r.seeds[0]+"~"+r.seeds[r.seeds.length-1]+" ("+r.seeds.length+"개), 시나리오 4개"],["정지 규칙",r.stop],
      ["경로 그림","시드 "+r.traceSeed+", "+(r.traceEvery/10000)+"만 회마다, "+(r.traceMax/10000)+"만 회까지"],
      ["실험 코드","papers/axelrod_story/replication/run.js"],["결과 파일","papers/axelrod_story/replication/results.json"]]
      .map(function(x){return"<tr><th style=\"width:110px\">"+x[0]+"</th><td>"+x[1]+"</td></tr>";}).join("")+"</tbody></table>";});
})();
