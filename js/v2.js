(function(){
  var d=document.documentElement;
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var top=document.getElementById('top');
  function setTop(){ if(top) d.style.setProperty('--top-h', top.offsetHeight+'px'); }
  setTop(); window.addEventListener('resize', setTop);

  /* menu */
  var btn=document.querySelector('.burger'), menu=document.getElementById('menu');
  function closeMenu(){ btn.setAttribute('aria-expanded','false'); menu.hidden=true; setTop(); }
  if(btn&&menu){
    btn.addEventListener('click', function(){
      if(btn.getAttribute('aria-expanded')==='true'){ closeMenu(); }
      else { btn.setAttribute('aria-expanded','true'); menu.hidden=false; setTop(); }
    });
    menu.addEventListener('click', function(e){ if(e.target.closest('a')) closeMenu(); });
    window.matchMedia('(min-width: 961px)').addEventListener('change', function(m){ if(m.matches) closeMenu(); });
  }

  /* dust: faint motes rising, above sections and below the header; pauses when hidden or idle */
  var cv=document.getElementById('dust'), ctx=cv&&cv.getContext('2d'), motes=[], raf=0, lastInput=Date.now(), W=0, H=0, dpr=1;
  function sizeDust(){ dpr=Math.min(window.devicePixelRatio||1,2); W=window.innerWidth; H=window.innerHeight; cv.width=W*dpr; cv.height=H*dpr; ctx.setTransform(dpr,0,0,dpr,0,0); }
  function seed(){ motes=[]; var n=Math.round(Math.min(46, W*H/26000)); for(var i=0;i<n;i++){ motes.push({x:Math.random()*W,y:Math.random()*H,r:.6+Math.random()*1.6,v:.12+Math.random()*.35,a:.15+Math.random()*.35,ph:Math.random()*6.28}); } }
  function frame(){
    raf=0;
    if(document.hidden || Date.now()-lastInput>15000) return;
    ctx.clearRect(0,0,W,H);
    for(var i=0;i<motes.length;i++){ var m=motes[i]; m.y-=m.v; m.ph+=.01; var x=m.x+Math.sin(m.ph)*6; if(m.y<-6){ m.y=H+6; m.x=Math.random()*W; }
      ctx.beginPath(); ctx.arc(x,m.y,m.r,0,6.283); ctx.fillStyle='rgba(240,214,160,'+m.a+')'; ctx.fill(); }
    raf=requestAnimationFrame(frame);
  }
  function wake(){ lastInput=Date.now(); if(!raf && !document.hidden && !reduce) raf=requestAnimationFrame(frame); }
  if(cv && ctx && !reduce){
    sizeDust(); seed(); wake();
    window.addEventListener('resize', function(){ sizeDust(); seed(); });
    ['pointermove','pointerdown','scroll','keydown','touchstart','wheel'].forEach(function(t){ window.addEventListener(t, wake, {passive:true}); });
    document.addEventListener('visibilitychange', wake);
  }

  /* intro: count 3..0, cracks in bursts, name appears in its hero spot, wall breaks along the cracks */
  var intro=document.getElementById('intro'), wall=document.getElementById('wall'), digit=document.getElementById('digit'), word=document.getElementById('word');
  var done=false, timers=[], anims=[];
  function later(fn,ms){ timers.push(setTimeout(fn,ms)); }
  function finish(){
    if(done) return; done=true;
    timers.forEach(clearTimeout); anims.forEach(function(a){ try{a.cancel();}catch(e){} });
    d.classList.remove('intro-on'); if(intro) intro.remove();
    setTop(); wake();
  }
  window.__finishIntro=finish;
  if(!d.classList.contains('intro-on') || !intro){ finish(); }
  else {
    if('scrollRestoration' in history) history.scrollRestoration='manual';
    window.scrollTo(0,0);
    var NS='http://www.w3.org/2000/svg';
    var vw=window.innerWidth, vh=window.innerHeight;
    wall.setAttribute('viewBox','0 0 '+vw+' '+vh);
    // noise texture for the wall
    var nc=document.createElement('canvas'); nc.width=nc.height=200; var nx=nc.getContext('2d'); var id=nx.createImageData(200,200);
    for(var i=0;i<id.data.length;i+=4){ var g=Math.random()*26-13; id.data[i]=44+g; id.data[i+1]=51+g; id.data[i+2]=34+g*.8; id.data[i+3]=255; }
    nx.putImageData(id,0,0);
    var defs=document.createElementNS(NS,'defs'); var pat=document.createElementNS(NS,'pattern');
    pat.setAttribute('id','noise'); pat.setAttribute('patternUnits','userSpaceOnUse'); pat.setAttribute('width','200'); pat.setAttribute('height','200');
    var pim=document.createElementNS(NS,'image'); pim.setAttribute('href',nc.toDataURL()); pim.setAttribute('width','200'); pim.setAttribute('height','200');
    pat.appendChild(pim); defs.appendChild(pat); wall.appendChild(defs);
    // keep the digit clear of the future button
    var cta=document.getElementById('hero-bottom');
    if(cta){ var cr=cta.getBoundingClientRect(); digit.style.bottom=Math.max(vh-cr.top+12, vh*.08)+'px'; }
    var dr=digit.getBoundingClientRect();
    var O={x:Math.min(dr.right-dr.width*.15, vw*.6), y:Math.max(dr.top+dr.height*.15, vh*.25)};
    // crack geometry: rays x rings around O
    var R=Math.hypot(Math.max(O.x,vw-O.x),Math.max(O.y,vh-O.y))*1.15;
    var rays=12, rings=[0,.13,.27,.44,.64,.86,1.12];
    var P=[];
    for(var a=0;a<rays;a++){ var base=a/rays*6.283+.2, col=[];
      for(var j=0;j<rings.length;j++){ if(j===0){ col.push({x:O.x,y:O.y}); continue; }
        var ang=base+(Math.random()-.5)*(6.283/rays)*.45, rr=R*rings[j]*(1+(Math.random()-.5)*.16);
        col.push({x:O.x+Math.cos(ang)*rr,y:O.y+Math.sin(ang)*rr}); }
      P.push(col); }
    var pieces=document.createElementNS(NS,'g'), cracks=document.createElementNS(NS,'g');
    cracks.setAttribute('fill','none'); cracks.setAttribute('stroke','#0f120a'); cracks.setAttribute('stroke-linecap','round');
    wall.appendChild(pieces); wall.appendChild(cracks);
    function pt(p){ return p.x.toFixed(1)+','+p.y.toFixed(1); }
    var cells=[];
    for(var a2=0;a2<rays;a2++){ var b2=(a2+1)%rays;
      for(var j2=0;j2<rings.length-1;j2++){
        var poly=document.createElementNS(NS,'polygon'), pts=[P[a2][j2],P[a2][j2+1],P[b2][j2+1],P[b2][j2]];
        poly.setAttribute('points',pts.map(pt).join(' ')); poly.setAttribute('fill','url(#noise)'); poly.setAttribute('stroke','url(#noise)'); poly.setAttribute('stroke-width','1.5');
        poly.style.transformBox='fill-box'; poly.style.transformOrigin='center';
        pieces.appendChild(poly); cells.push({el:poly,ring:j2});
      } }
    var bursts=[[],[],[]];
    function seg(p,q,w,burst){ var path=document.createElementNS(NS,'path'); var mx=(p.x+q.x)/2+(Math.random()-.5)*12, my=(p.y+q.y)/2+(Math.random()-.5)*12;
      path.setAttribute('d','M'+pt(p)+' L'+mx.toFixed(1)+','+my.toFixed(1)+' L'+pt(q)); path.setAttribute('stroke-width',w);
      cracks.appendChild(path); var L=path.getTotalLength(); path.style.strokeDasharray=L; path.style.strokeDashoffset=L; bursts[burst].push({el:path,L:L}); }
    for(var a3=0;a3<rays;a3++){ for(var j3=0;j3<rings.length-1;j3++){ seg(P[a3][j3],P[a3][j3+1], j3<2?2.4:1.8, j3<2?0:(j3<4?1:2)); } }
    for(var j4=1;j4<rings.length-1;j4++){ for(var a4=0;a4<rays;a4++){ seg(P[a4][j4],P[(a4+1)%rays][j4],1.3,2); } }
    // hairlines inside pieces
    cells.forEach(function(c){ if(Math.random()<.6){ var pts=c.el.getAttribute('points').split(' ').map(function(s){var v=s.split(',');return {x:+v[0],y:+v[1]};});
      var cx=(pts[0].x+pts[1].x+pts[2].x+pts[3].x)/4, cy=(pts[0].y+pts[1].y+pts[2].y+pts[3].y)/4, k=pts[Math.floor(Math.random()*4)];
      var path=document.createElementNS(NS,'path'); path.setAttribute('d','M'+cx.toFixed(1)+','+cy.toFixed(1)+' L'+((cx+k.x)/2).toFixed(1)+','+((cy+k.y)/2).toFixed(1));
      path.setAttribute('stroke-width','.6'); path.setAttribute('stroke','rgba(15,18,10,.8)'); cracks.appendChild(path); var L=path.getTotalLength(); path.style.strokeDasharray=L; path.style.strokeDashoffset=L; bursts[2].push({el:path,L:L}); } });

    function showDigit(n,at){ later(function(){ var s=digit.firstElementChild; s.textContent=n;
      anims.push(s.animate([{clipPath:'inset(0 0 100% 0)'},{clipPath:'inset(0 0 0 0)'}],{duration:420,easing:'cubic-bezier(.2,.7,.2,1)',fill:'both'})); },at); }
    showDigit('3',0); showDigit('2',1000); showDigit('1',2000); showDigit('0',3000);
    [].forEach.call(intro.querySelectorAll('.intro__card'), function(c,k){ var rot=(k%2?1:-1)*(4+Math.random()*5);
      anims.push(c.animate([{transform:'translateY(-120%) rotate('+(-rot)+'deg)'},{transform:'translateY('+(vh+40)+'px) rotate('+rot+'deg)'}],
        {duration:1700,delay:150+k*700,easing:'cubic-bezier(.45,.05,.55,.95)',fill:'both'})); });
    function runBurst(k,at,dur){ later(function(){ bursts[k].forEach(function(s,i){ anims.push(s.el.animate([{strokeDashoffset:s.L},{strokeDashoffset:0}],{duration:dur,delay:Math.random()*dur*.5,easing:'ease-out',fill:'forwards'})); }); },at); }
    var t0=3600; runBurst(0,t0,260); runBurst(1,t0+620,300); runBurst(2,t0+1280,420);
    var tWord=t0+1900;
    later(function(){ word.style.transition='opacity .45s ease'; word.style.opacity='1'; },tWord);
    var tBreak=tWord+650;
    later(function(){
      digit.style.transition='opacity .25s'; digit.style.opacity='0';
      cells.forEach(function(c){ var dx=(Math.random()-.5)*6, dy=(Math.random()-.5)*6;
        anims.push(c.el.animate([{transform:'translate(0,0)'},{transform:'translate('+dx+'px,'+dy+'px)'}],{duration:220,fill:'forwards'}));
        var fx=dx+(Math.random()-.5)*80, rot=(Math.random()-.5)*50, wave=(rings.length-2-c.ring);
        anims.push(c.el.animate([{transform:'translate('+dx+'px,'+dy+'px) rotate(0deg)',opacity:1},{transform:'translate('+fx+'px,'+(vh*1.25)+'px) rotate('+rot+'deg)',opacity:1}],
          {duration:900+Math.random()*250,delay:300+wave*110+Math.random()*90,easing:'cubic-bezier(.5,0,.85,.4)',fill:'forwards'}));
      });
      cracks.style.transition='opacity .3s'; later(function(){ cracks.style.opacity='0'; },260);
      anims.push(word.animate([{transform:'scale(1)'},{transform:'scale(1.06)'},{transform:'scale(1)'}],{duration:420,delay:300,easing:'ease-in-out'}));
    },tBreak);
    later(function(){ word.style.transition=''; word.style.opacity=''; finish(); },tBreak+2200);
    intro.addEventListener('click', finish);
    window.addEventListener('keydown', function(e){ if(e.key==='Escape') finish(); });
  }

  /* carousels: photos and reviews */
  [].forEach.call(document.querySelectorAll('[data-carousel]'), function(root){
    var track=root.querySelector('.carousel__track'), slides=[].slice.call(track.children), dots=root.querySelector('[data-dots]');
    var label=track.getAttribute('aria-label')==='Отзывы гостей'?'Отзыв ':'Фото ';
    slides.forEach(function(s,i){ var b=document.createElement('button'); b.type='button'; b.setAttribute('aria-label',label+(i+1));
      b.addEventListener('click', function(){ go(i); }); dots.appendChild(b); });
    function cur(){ var x=track.scrollLeft, best=0, bd=1e9; slides.forEach(function(s,i){ var dd=Math.abs(s.offsetLeft-track.offsetLeft-x); if(dd<bd){bd=dd;best=i;} }); return best; }
    function maxIdx(){ var per=Math.max(1,Math.round((track.clientWidth+20)/(slides[0].getBoundingClientRect().width+20))); return Math.max(0,slides.length-per); }
    function go(i){ i=Math.max(0,Math.min(i,maxIdx())); track.scrollTo({left:slides[i].offsetLeft-track.offsetLeft,behavior:reduce?'auto':'smooth'}); }
    function mark(){ var m=maxIdx(), c=Math.min(cur(),m); [].forEach.call(dots.children,function(b,i){ b.setAttribute('aria-current', i===c?'true':'false'); b.hidden=i>m; }); }
    root.querySelector('[data-prev]').addEventListener('click', function(){ go(cur()-1); });
    root.querySelector('[data-next]').addEventListener('click', function(){ go(cur()+1); });
    track.addEventListener('keydown', function(e){ if(e.key==='ArrowRight'){e.preventDefault();go(cur()+1);} if(e.key==='ArrowLeft'){e.preventDefault();go(cur()-1);} });
    track.addEventListener('scroll', function(){ window.requestAnimationFrame(mark); }, {passive:true});
    window.addEventListener('resize', mark); mark();
  });

  /* section shots open as a circle from the centre, then the clip is dropped */
  var gal=document.getElementById('gallery');
  if(gal && !reduce && 'IntersectionObserver' in window){
    gal.classList.add('reveal');
    var io=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ io.disconnect(); gal.classList.add('revealed');
      setTimeout(function(){ gal.classList.add('settled'); }, 1000); } }); }, {threshold:.15});
    io.observe(gal);
  }

  /* map loads on click, opens on the place */
  var ml=document.getElementById('map-load');
  if(ml){ ml.addEventListener('click', function(){ var f=document.createElement('iframe'); f.src='https://yandex.ru/map-widget/v1/org/lepota/32314139566/'; f.title='Салон «Лепота» на карте'; f.allowFullscreen=true; var m=document.getElementById('map'); m.appendChild(f); ml.remove(); }); }
})();
