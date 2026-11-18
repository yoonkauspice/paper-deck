(function(){
  var p=document.getElementById("psx");if(p)mkStep(p,4);
  var t=document.getElementById("thx");
  if(t){var E=[[90,10,"(90 − 10) ÷ 100 = 0.80",0.80,"You are a strong Democrat."],[55,50,"(55 − 50) ÷ 100 = 0.05",0.05,"You prefer neither party."],[15,80,"(15 − 80) ÷ 100 = −0.65",-0.65,"You are a strong Republican."]];
    mkStep(t,3,function(st){var e=E[st-1],b=t.querySelectorAll(".tr i"),v=t.querySelectorAll(".tbar .v");
      b[0].style.width=e[0]+"%";b[1].style.width=e[1]+"%";v[0].textContent=e[0];v[1].textContent=e[1];
      document.getElementById("thc").textContent=e[2];var x=(e[3]+1)/2*100;
      t.querySelector(".mk").style.left=x+"%";var mv=t.querySelector(".mv");mv.style.left=x+"%";mv.textContent=(e[3]>0?"+":"")+e[3].toFixed(2);
      document.getElementById("ths").textContent=e[4];});}
  var f=document.getElementById("flx");
  if(f)mkStep(f,5,function(st){f.querySelectorAll(".fb").forEach(function(b){b.classList.toggle("cur",+b.dataset.k===st);});});
  var q=document.getElementById("pfx");
  if(q)mkStep(q,3,function(st){q.querySelectorAll(".pfc").forEach(function(c){c.classList.toggle("on",+c.dataset.p===st);});
    var ul=q.querySelector(".fdl"),li=[].slice.call(ul.children);
    li.forEach(function(l){var r=+l.dataset.r.split(",")[st-1],v=l.dataset.v.split("|")[st-1];l.classList.toggle("off",r===0);
      l.querySelector(".rn").textContent=r||"–";var tp=l.querySelector(".sc .tip");tp.textContent=v||"–";tp.dataset.tip=l.dataset.t.split("|")[st-1];l.style.order=r||9;});
    ul.style.display="flex";});
  var b=document.getElementById("bcx");
  if(b)mkStep(b,4,function(st){b.querySelectorAll(".bcl li").forEach(function(l){var o=st>=4?+l.dataset.b:+l.dataset.o+1;l.style.order=o;l.querySelector(".rn").textContent=o;});});
  var e=document.getElementById("eix");
  if(e){var X=[[1,19],[5,15],[10,10],[13,7]];
    mkStep(e,4,function(st){var a=X[st-1],v=(a[0]-a[1])/(a[0]+a[1]),ii=e.querySelectorAll(".eib i");
      ii[0].style.flex=a[0];ii[0].textContent="E "+a[0];ii[1].style.flex=a[1];ii[1].textContent="I "+a[1];
      var s=(v>0?"+":(v<0?"−":""))+Math.abs(v).toFixed(2);
      document.getElementById("eic").textContent="("+a[0]+" − "+a[1]+") ÷ 20 = "+s;
      var x=(v+1)/2*100;e.querySelector(".mk").style.left=x+"%";var mv=e.querySelector(".mv");mv.style.left=x+"%";mv.textContent=s;
      e.querySelectorAll(".eit tr[data-x]").forEach(function(r){r.classList.toggle("cur",+r.dataset.x===st);});});}
})();
(function(){
  [["thr20",6],["thr21",5]].forEach(function(x){var r=document.getElementById(x[0]);if(!r)return;var N=x[1],last=0;
    mkStep(r,N,function(st,anim){
      r.querySelectorAll(".cm").forEach(function(c){var k=+c.dataset.k,on=k<=st;c.classList.toggle("on",on);c.classList.remove("typing");
        if(anim&&on&&k===st&&st>last){c.classList.add("typing");setTimeout(function(){c.classList.remove("typing");},700);}});
      r.querySelectorAll(".thr").forEach(function(t){var L=+t.dataset.likes;t.querySelector(".lkn").textContent=Math.round(L*Math.min(1,st/N));});
      last=st;});});
})();
