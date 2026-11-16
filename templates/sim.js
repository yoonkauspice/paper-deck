/* PaperSim: 슬라이드 안의 시뮬레이션 공통 부품
   모형 정의: PaperSim.register(이름, {
     params:[{key,label,type:'range'|'seg',min,max,step,value,fmt,options:[[값,라벨],...]}],
     presets:{이름:{label, values:{key:value}}},
     views:[[값,라벨],...],            // 선택: 그리기 방식
     legend:function(view){return [[색,라벨],...]},
     metrics:[{key,label,fmt,chart:true,max,color}],
     init(p,rng), step(st,p,rng,n), measure(st,p) -> {key:값}, draw(ctx,st,o)  // o={w,h,view,p}
     batch:한 프레임당 단계 수, speeds:[1,4,16], ffChunk(정지 판정 간격), ffMeasure(측정 간격), ffMax
   })
   슬라이드 마크업: <div class="sim" data-sim="이름" data-seed="7"></div>
   장이 보이면 초기화, 넘기면 멈춤. 같은 시드는 같은 결과. */
(function(){
  var REG={};
  function rng32(seed){return function(){seed|=0;seed=(seed+0x6D2B79F5)|0;var t=Math.imul(seed^(seed>>>15),1|seed);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296;};}
  function h(tag,cls,html){var e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e;}
  function fit(cv){var w=Math.max(1,Math.round(cv.clientWidth*2)),hh=Math.max(1,Math.round(cv.clientHeight*2));if(cv.width!==w)cv.width=w;if(cv.height!==hh)cv.height=hh;return{w:w,h:hh};}

  function mount(root){
    var def=REG[root.dataset.sim];
    if(!def){root.textContent="등록되지 않은 모형: "+root.dataset.sim;return;}
    var slide=root.closest(".slide")||root.closest(".sc-g")||root,ACT=slide.classList.contains("slide")?"active":"on",seed0=+(root.dataset.seed||1),seed=seed0;
    var p={};def.params.forEach(function(q){p[q.key]=q.value;});
    var view=def.views?def.views[0][0]:null,speeds=def.speeds||[1,4,16],spd=speeds[1]||speeds[0];
    var st,rng,t=0,hist=[],playing=false;

    /* 화면 구성 */
    var L=h("div","sim-l"),R=h("div","sim-r");
    var stage=h("div","sim-stage"),cv=h("canvas");stage.appendChild(cv);
    var lg=h("div","sim-lg"),bar=h("div","sim-bar");
    var bPlay=h("button","pr","▶ 시작"),bStep=h("button","","한 단계"),bFF=h("button","","끝까지"),bReset=h("button","","초기화"),bSeed=h("button","","새 시드"),tk=h("span","tk","");
    [bPlay,bStep,bFF,bReset,bSeed,tk].forEach(function(e){bar.appendChild(e);});
    L.appendChild(stage);L.appendChild(lg);L.appendChild(bar);
    var ctrls={};
    if(def.presets){var g=h("div","sim-g");g.appendChild(h("h6","","시나리오"));var sg=h("div","sim-seg");
      Object.keys(def.presets).forEach(function(k){var b=h("button","",def.presets[k].label);b.dataset.pre=k;b.onclick=function(){Object.assign(p,def.presets[k].values);sync();reset();};sg.appendChild(b);});
      g.appendChild(sg);R.appendChild(g);}
    if(def.views){var gv=h("div","sim-g");gv.appendChild(h("h6","","보기"));var sv=h("div","sim-seg");
      def.views.forEach(function(v){var b=h("button",v[0]===view?"on":"",v[1]);b.onclick=function(){view=v[0];[].forEach.call(sv.children,function(x){x.classList.toggle("on",x===b);});legend();paint();};sv.appendChild(b);});
      gv.appendChild(sv);R.appendChild(gv);}
    def.params.forEach(function(q){var g=h("div","sim-g"),t6=h("h6","",q.label+(q.type==="range"?" <span></span>":""));g.appendChild(t6);
      if(q.type==="range"){var r=h("input");r.type="range";r.min=q.min;r.max=q.max;r.step=q.step||1;
        r.oninput=function(){t6.querySelector("span").textContent=q.fmt?q.fmt(+r.value):r.value;};
        r.onchange=function(){p[q.key]=+r.value;sync();reset();};g.appendChild(r);ctrls[q.key]=function(){r.value=p[q.key];r.oninput();};}
      else{var s=h("div","sim-seg");q.options.forEach(function(o){var b=h("button","",o[1]);b.onclick=function(){p[q.key]=o[0];sync();reset();};b.dataset.opt=String(o[0]);s.appendChild(b);});
        g.appendChild(s);ctrls[q.key]=function(){[].forEach.call(s.children,function(b){b.classList.toggle("on",b.dataset.opt===String(p[q.key]));});};}
      R.appendChild(g);});
    var mx=h("div","sim-mx"),tiles={};
    def.metrics.forEach(function(m){if(m.tile===false)return;var d=h("div","","<b>–</b><span>"+m.label+"</span>");tiles[m.key]=d.querySelector("b");mx.appendChild(d);});
    var ch=h("div","sim-ch"),cc=h("canvas");ch.appendChild(cc);
    R.appendChild(mx);R.appendChild(ch);
    root.appendChild(L);root.appendChild(R);

    function sync(){Object.keys(ctrls).forEach(function(k){ctrls[k]();});
      if(def.presets)[].forEach.call(R.querySelectorAll("[data-pre]"),function(b){var v=def.presets[b.dataset.pre].values;b.classList.toggle("on",Object.keys(v).every(function(k){return v[k]===p[k];}));});}
    function legend(){lg.innerHTML="";if(def.legend)def.legend(view).forEach(function(x){lg.appendChild(h("span","","<i style=\"background:"+x[0]+"\"></i>"+x[1]));});}
    function fmt(m,v){return m.fmt?m.fmt(v):(Math.round(v*100)/100).toLocaleString();}
    function sample(){var v=def.measure(st,p);v._t=t;hist.push(v);if(hist.length>600)hist=hist.filter(function(_,i){return i%2===0;});
      def.metrics.forEach(function(m){if(tiles[m.key])tiles[m.key].textContent=fmt(m,v[m.key]);});tk.textContent=(def.tLabel||"단계")+" "+t.toLocaleString();return v;}
    function paint(){var o=fit(cv);var c=cv.getContext("2d");c.clearRect(0,0,o.w,o.h);def.draw(c,st,{w:o.w,h:o.h,view:view,p:p});chart();}
    function chart(){var o=fit(cc),c=cc.getContext("2d");c.clearRect(0,0,o.w,o.h);var ser=def.metrics.filter(function(m){return m.chart;});
      var pad=8,top=34;c.font="500 22px 'Noto Sans KR',sans-serif";var x=pad;
      ser.forEach(function(m){c.fillStyle=m.color;c.fillRect(x,10,18,6);c.fillStyle="#6B7280";c.fillText(m.label,x+24,20);x+=c.measureText(m.label).width+52;});
      if(hist.length<2)return;var tmax=Math.max(1,hist[hist.length-1]._t);
      ser.forEach(function(m){var mxv=m.max||Math.max.apply(null,hist.map(function(v){return isFinite(v[m.key])?v[m.key]:0;}))||1;
        c.strokeStyle=m.color;c.lineWidth=3;c.beginPath();
        var pen=false;hist.forEach(function(v){var y=v[m.key];if(!isFinite(y)){pen=false;return;}var px=pad+(v._t/tmax)*(o.w-2*pad),py=o.h-pad-(y/mxv)*(o.h-top-pad);pen?c.lineTo(px,py):c.moveTo(px,py);pen=true;});c.stroke();});}
    function reset(newSeed){stop();if(newSeed)seed=Math.floor(Math.random()*1e9);rng=rng32(seed);st=def.init(p,rng);t=0;hist=[];sample();paint();}
    function adv(n){def.step(st,p,rng,n);t+=n;}
    function frame(){if(!playing)return;adv((def.batch||100)*spd);sample();paint();requestAnimationFrame(frame);}
    function stop(){playing=false;bPlay.textContent="▶ 시작";}
    bPlay.onclick=function(){if(playing){stop();return;}playing=true;bPlay.textContent="❚❚ 멈춤";requestAnimationFrame(frame);};
    bStep.onclick=function(){stop();adv(def.batch||100);sample();paint();};
    bFF.onclick=function(){stop();var chunk=def.ffChunk||20000,max=def.ffMax||2e6,prev=null,same=0;
      var fine=def.ffMeasure||chunk;while(t<max&&same<3){for(var k=0;k<chunk;k+=fine){adv(fine);if(k+fine<chunk)def.measure(st,p);}var v=sample();var keys=def.metrics.map(function(m){return m.key;});
        same=(prev&&keys.every(function(k){var a=prev[k],b=v[k];return (a!==a&&b!==b)||Math.abs(a-b)<1e-9;}))?same+1:0;prev=v;}paint();};
    bReset.onclick=function(){reset(false);};
    bSeed.onclick=function(){reset(true);};
    if(def.speeds){var sb=h("button","","속도 ×"+spd);sb.onclick=function(){spd=speeds[(speeds.indexOf(spd)+1)%speeds.length];sb.textContent="속도 ×"+spd;};bar.insertBefore(sb,tk);}

    root._sim={preset:function(k){Object.assign(p,def.presets[k].values);sync();reset();},set:function(o){Object.assign(p,o);sync();reset();},
      view:function(v){if(!def.views)return;[].forEach.call(sv.children,function(b,k){if(def.views[k][0]===v)b.onclick();});},
      reset:function(){reset(false);},play:function(){if(!playing)bPlay.onclick();},stop:stop,ff:function(){bFF.onclick();},measure:function(){return hist[hist.length-1];}};
    sync();legend();
    rng=rng32(seed);st=def.init(p,rng);sample();
    var was=false;
    new MutationObserver(function(){var now=(slide===root||slide.classList.contains(ACT));if(now&&!was){seed=seed0;reset(false);}if(!now&&was)stop();was=now;}).observe(slide,{attributes:true,attributeFilter:["class"]});
    if((slide===root||slide.classList.contains(ACT))){was=true;paint();}
    window.addEventListener("resize",function(){if((slide===root||slide.classList.contains(ACT)))paint();});
    window.addEventListener("beforeprint",function(){stop();paint();});
  }
  window.PaperSim={register:function(n,d){REG[n]=d;},rng:rng32,
    mountAll:function(){[].forEach.call(document.querySelectorAll(".sim[data-sim]"),function(r){if(!r.dataset.mounted){r.dataset.mounted=1;mount(r);}});}};
  window.addEventListener("load",function(){window.PaperSim.mountAll();});
})();
