(function(){
  var top=document.getElementById('top');
  function setTop(){ if(top) document.documentElement.style.setProperty('--top-h', top.offsetHeight+'px'); }
  setTop(); window.addEventListener('resize', setTop);
  var btn=document.querySelector('.burger'), menu=document.getElementById('menu');
  if(!btn||!menu) return;
  function close(){ btn.setAttribute('aria-expanded','false'); menu.hidden=true; setTop(); }
  btn.addEventListener('click', function(){
    var open=btn.getAttribute('aria-expanded')==='true';
    if(open){ close(); } else { btn.setAttribute('aria-expanded','true'); menu.hidden=false; setTop(); }
  });
  menu.addEventListener('click', function(e){ if(e.target.closest('a')) close(); });
  window.matchMedia('(min-width: 961px)').addEventListener('change', function(m){ if(m.matches) close(); });
})();
