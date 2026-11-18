/* ScrollStory: 스크롤 단계에 맞춰 고정 그래픽을 바꾸는 엔진 + 데이터 바인딩 + SVG 차트
   마크업: .sc-ch > .sc-wrap > .sc-steps > .sc-step[data-g="그래픽id"][data-s="단계번호"]
                           > .sc-fig > .sc-sticky > .sc-g#그래픽id
   핸들러: ScrollStory.on("그래픽id", function(s, g){ ... })  // s = 현재 단계의 data-s
   데이터: ScrollStory.data = {...};  <span data-v="경로" data-f="형식"></span> 은 값으로 채움
   키보드: ↓ → PageDown 스페이스 = 다음 단계, ↑ ← PageUp = 이전 단계
   주소에 ?step=번호 를 붙이면 그 단계(1부터)로 바로 이동, ?shot=번호 는 그 단계의 글과 그래픽만 한 화면에(캡처용) */
(function(){
  var H={},S={};
  window.ScrollStory=S;S.data={};
  S.on=function(id,fn){H[id]=fn;};

  /* 데이터 바인딩: data-v="a.b.c" data-f="pct|man|int|f1|f2|f3" */
  function get(o,p){return p.split(".").reduce(function(a,k){return a==null?a:a[k];},o);}
  var F={pct:function(v){return Math.round(v*100)+"%";},man:function(v){return (v/10000).toFixed(1)+"만";},
    int:function(v){return Math.round(v).toLocaleString();},f1:function(v){return (+v).toFixed(1);},f2:function(v){return (+v).toFixed(2);},f3:function(v){return (+v).toFixed(3);}};
  S.fmt=F;
  S.bind=function(root){[].forEach.call((root||document).querySelectorAll("[data-v]"),function(e){var v=get(S.data,e.dataset.v);
    e.textContent=v==null||v!==v?"–":(F[e.dataset.f]?F[e.dataset.f](v):v);});};

  /* SVG 차트 */
  var CS=getComputedStyle(document.documentElement);function cv(n,d){var v=(CS.getPropertyValue(n)||"").trim();return v||d;}
  var C={navy:cv("--c-ink","#203044"),accent:cv("--c-accent","#0046CB"),gray:cv("--c-gray","#6B7280"),grid:cv("--c-grid","#DFE3EA"),pale:cv("--c-pale","#EEF1F6"),mid:cv("--c-mid","#9AA8BC"),gold:cv("--c-yellow","#C98A12"),yellow:cv("--c-yellow","#FFE000")};
  S.color=C;
  function el(t,a,txt){var e=document.createElementNS("http://www.w3.org/2000/svg",t);for(var k in a)e.setAttribute(k,a[k]);if(txt!=null)e.textContent=txt;return e;}
  S.svg=el;
  function frame(box,o){box.innerHTML="";var W=o.w||760,Hh=o.h||420,s=el("svg",{viewBox:"0 0 "+W+" "+Hh});box.appendChild(s);return{s:s,W:W,H:Hh,L:o.l||70,R:W-(o.r||20),T:o.t||30,B:Hh-(o.b||50)};}
  function axisY(f,max,step,fmt,label){for(var v=0;v<=max+1e-9;v+=step){var y=f.B-(v/max)*(f.B-f.T);
      f.s.appendChild(el("line",{x1:f.L,x2:f.R,y1:y,y2:y,stroke:C.grid}));
      f.s.appendChild(el("text",{x:f.L-8,y:y+5,"text-anchor":"end","font-size":15,fill:C.gray},fmt?fmt(v):v));}
    if(label)f.s.appendChild(el("text",{x:f.L,y:f.T-12,"font-size":15,fill:C.navy,"font-weight":700},label));}
  /* 점 그림: groups=[{label, values:[...], color}] , 평균 막대 표시 */
  S.dots=function(box,groups,o){o=o||{};var f=frame(box,o),max=o.max,step=o.step;
    if(!max){max=Math.max.apply(null,groups.map(function(g){return Math.max.apply(null,g.values);}));}
    axisY(f,max,step||max/4,o.fmt,o.ylabel);
    var bw=(f.R-f.L)/groups.length;
    groups.forEach(function(g,i){var cx=f.L+bw*(i+.5);
      g.values.forEach(function(v,k){var jit=((k*37)%11-5)*bw*.035,y=f.B-(v/max)*(f.B-f.T);
        f.s.appendChild(el("circle",{cx:cx+jit,cy:y,r:7,fill:g.color||C.accent,"fill-opacity":g.opacity||.55,stroke:g.stroke||g.color||C.accent,"stroke-width":2}));});
      if(g.values.length){var m=g.values.reduce(function(a,b){return a+b;},0)/g.values.length,ym=f.B-(m/max)*(f.B-f.T);
        f.s.appendChild(el("line",{x1:cx-bw*.3,x2:cx+bw*.3,y1:ym,y2:ym,stroke:C.navy,"stroke-width":4}));
        f.s.appendChild(el("text",{x:cx+bw*.32,y:ym+5,"font-size":15,fill:C.navy,"font-weight":700},"평균 "+(o.fmt?o.fmt(m):m.toFixed(1))));}
      f.s.appendChild(el("text",{x:cx,y:f.B+24,"text-anchor":"middle","font-size":18,fill:C.navy,"font-weight":700},g.label));
      if(g.sub)f.s.appendChild(el("text",{x:cx,y:f.B+42,"text-anchor":"middle","font-size":15,fill:C.gray},g.sub));});
    return f;};
  /* 선 그림: series=[{label, pts:[[x,y],...], color, dash}] */
  S.lines=function(box,series,o){o=o||{};var f=frame(box,Object.assign({t:70},o)),xmax=o.xmax,max=o.max||1;
    if(!xmax)xmax=Math.max.apply(null,series.map(function(s){return s.pts[s.pts.length-1][0];}));
    axisY(f,max,o.step||max/4,o.fmt,o.ylabel);
    for(var k=0;k<=4;k++){var x=f.L+(f.R-f.L)*k/4;f.s.appendChild(el("text",{x:x,y:f.B+22,"text-anchor":"middle","font-size":15,fill:C.gray},o.xfmt?o.xfmt(xmax*k/4):xmax*k/4));}
    if(o.xlabel)f.s.appendChild(el("text",{x:f.R,y:f.B+42,"text-anchor":"end","font-size":15,fill:C.navy,"font-weight":700},o.xlabel));
    series.forEach(function(s,i){var d="",pen=false;s.pts.forEach(function(p){if(!isFinite(p[1])){pen=false;return;}
        var x=f.L+(p[0]/xmax)*(f.R-f.L),y=f.B-(p[1]/max)*(f.B-f.T);d+=(pen?"L":"M")+x.toFixed(1)+" "+y.toFixed(1);pen=true;});
      if(s.outline)f.s.appendChild(el("path",{d:d,fill:"none",stroke:s.outline,"stroke-width":(s.w||3)+3,"stroke-dasharray":s.dash||"none"}));
      var path=el("path",{d:d,fill:"none",stroke:s.color,"stroke-width":s.w||3,"stroke-dasharray":s.dash||"none"});f.s.appendChild(path);
      var lx=f.L+i*150;f.s.appendChild(el("line",{x1:lx,x2:lx+22,y1:f.T-40,y2:f.T-40,stroke:s.color,"stroke-width":4,"stroke-dasharray":s.dash||"none"}));
      f.s.appendChild(el("text",{x:lx+28,y:f.T-34,"font-size":15,fill:C.navy},s.label));});
    return f;};
  /* 가로 막대: items=[{label, value, color, note}] */
  S.hbars=function(box,items,o){o=o||{};var f=frame(box,Object.assign({l:170,r:80},o)),max=o.max||Math.max.apply(null,items.map(function(i){return i.value;}));
    var bh=(f.B-f.T)/items.length;
    items.forEach(function(it,i){var y=f.T+bh*i+bh*.2,w=(it.value/max)*(f.R-f.L);
      f.s.appendChild(el("rect",{x:f.L,y:y,width:f.R-f.L,height:bh*.6,fill:C.pale}));
      f.s.appendChild(el("rect",{x:f.L,y:y,width:w,height:bh*.6,fill:it.color||C.accent}));
      f.s.appendChild(el("text",{x:f.L-12,y:y+bh*.3+6,"text-anchor":"end","font-size":18,fill:C.navy,"font-weight":700},it.label));
      f.s.appendChild(el("text",{x:f.L+w+10,y:y+bh*.3+6,"font-size":18,fill:C.navy,"font-weight":700},it.text||it.value));
      if(it.note)f.s.appendChild(el("text",{x:f.L,y:y+bh*.6+16,"font-size":15,fill:C.gray},it.note));});
    return f;};

  /* 엔진 */
  function init(){
    S.bind();
    var steps=[].slice.call(document.querySelectorAll(".sc-step")),cur=-1,top=document.querySelector(".sc-top");
    var chs=[].slice.call(document.querySelectorAll(".sc-ch"));
    function activate(i){if(i===cur||i<0)return;cur=i;var st=steps[i],ch=st.closest(".sc-ch"),gid=st.dataset.g;
      steps.forEach(function(x,k){x.classList.toggle("on",k===i);});
      [].forEach.call(ch.querySelectorAll(".sc-g"),function(g){g.classList.toggle("on",g.id===gid);});
      var g=document.getElementById(gid);if(g&&H[gid])H[gid](+(st.dataset.s||1),g,st);
      var c=top&&top.querySelector(".c"),h=ch.querySelector(".sc-chh h2");if(c&&h)c.textContent=ch.dataset.n+" · "+h.textContent;
      [].forEach.call(document.querySelectorAll(".sc-toc a"),function(a){a.classList.toggle("cur",a.getAttribute("href")==="#"+ch.id);});}
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting)activate(steps.indexOf(e.target));});},{rootMargin:"-45% 0px -45% 0px"});
    steps.forEach(function(s){io.observe(s);});
    function go(d){var i=cur<0?0:cur+d;if(cur<0&&d<0)return;i=Math.max(0,Math.min(steps.length-1,i));
      var hero=document.querySelector(".sc-hero");if(d<0&&cur===0&&hero){hero.scrollIntoView({behavior:"smooth"});return;}
      steps[i].scrollIntoView({behavior:"smooth",block:"center"});}
    document.addEventListener("keydown",function(e){var t=e.target;if(t&&/INPUT|TEXTAREA|SELECT|BUTTON/.test(t.tagName)&&e.key===" ")return;
      if(["ArrowDown","ArrowRight","PageDown"," "].indexOf(e.key)>=0){e.preventDefault();go(1);}
      else if(["ArrowUp","ArrowLeft","PageUp"].indexOf(e.key)>=0){e.preventDefault();go(-1);}});
    var sh=location.search.match(/[?&]shot=(\d+)/);if(sh&&steps[+sh[1]-1]){var tgt=steps[+sh[1]-1],tch=tgt.closest(".sc-ch");document.body.classList.add("sc-shot");
      chs.forEach(function(c){c.style.display=c===tch?"":"none";});steps.forEach(function(x){x.style.display=x===tgt?"":"none";});activate(+sh[1]-1);return;}
    var m=location.search.match(/[?&]step=(\d+)/);if(m&&steps[+m[1]-1]){steps[+m[1]-1].scrollIntoView({block:"center"});activate(+m[1]-1);}
    var prog=document.querySelector(".sc-prog");
    function onScroll(){var h=document.documentElement,max=h.scrollHeight-h.clientHeight;if(prog)prog.style.width=(max>0?h.scrollTop/max*100:0)+"%";}
    window.addEventListener("scroll",onScroll,{passive:true});onScroll();
    var toc=document.querySelector(".sc-toc"),tb=document.getElementById("sc-toc-btn");
    if(toc&&tb){tb.onclick=function(e){e.stopPropagation();toc.classList.toggle("on");};document.addEventListener("click",function(){toc.classList.remove("on");});}
    var fb=document.getElementById("sc-full-btn");if(fb)fb.onclick=function(){if(document.fullscreenElement)document.exitFullscreen();else document.documentElement.requestFullscreen();};
  }
  /* 캡처 모드는 로드 전에 바로 배치 */
  (function(){var sh=location.search.match(/[?&]shot=(\d+)/);if(!sh)return;
    if(sh[1]==="0"){document.body.classList.add("sc-shot","sc-shot0");[].forEach.call(document.querySelectorAll(".sc-ch,.sc-end"),function(c){c.style.display="none";});return;}
    var st=document.querySelectorAll(".sc-step"),t=st[+sh[1]-1];if(!t)return;var ch=t.closest(".sc-ch");
    document.body.classList.add("sc-shot");[].forEach.call(document.querySelectorAll(".sc-ch"),function(c){c.style.display=c===ch?"":"none";});[].forEach.call(st,function(x){x.style.display=x===t?"":"none";});
    [].forEach.call(ch.querySelectorAll(".sc-g"),function(g){g.classList.toggle("on",g.id===t.dataset.g);});})();
  document.addEventListener("DOMContentLoaded",function(){S.bind();});
  window.addEventListener("load",function(){setTimeout(init,0);});
})();
