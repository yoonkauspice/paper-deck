(function(){
  // 8장: 에이전트의 한 주 (행동 1~4)
  var w=document.getElementById("wkx");
  if(w)mkStep(w,5,function(st){w.querySelectorAll(".fb").forEach(function(b){b.classList.toggle("cur",+b.dataset.k===st);});});
  // 9장: 태도 조절 온도 (식 2). 버튼 1~4 = T 0.5, 0.7, 1.0, 2.0. 처음 화면은 T = 1.0(원래 분포)
  var t=document.getElementById("tmx");
  if(t){var TS=[0.5,0.7,1.0,2.0];
    mkStep(t,4,function(st){var T=TS[st-1],hs=[];
      t.querySelectorAll(".tmd").forEach(function(d){var p=d.dataset.p.split(",").map(Number),q=p.map(function(x){return Math.pow(x,1/T);}),s=q.reduce(function(a,b){return a+b;},0);
        q=q.map(function(x){return x/s;});
        d.querySelectorAll(".tbar").forEach(function(r,i){r.querySelector(".tr i").style.width=(q[i]*100)+"%";r.querySelector(".v").textContent=q[i].toFixed(2);});
        hs.push((q[0]+q[1]).toFixed(2));});
      document.getElementById("tmc").textContent=T===1?"T = 1.0: 원래 분포 그대로":"T = "+T.toFixed(1)+": 각 확률을 "+(1/T).toFixed(2)+"제곱한 뒤 합이 1이 되도록 나눔";
      document.getElementById("tms").textContent="A "+hs[0]+" · B "+hs[1];},3);}
})();
