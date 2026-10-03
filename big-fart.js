(function(){
  function show(error,context){
    const e=error instanceof Error?error:new Error(String(error||'Unknown failure'));
    let o=document.getElementById('big-fart-overlay');
    if(!o){
      o=document.createElement('div');o.id='big-fart-overlay';
      o.style.cssText='position:fixed;inset:0;z-index:99999;background:rgba(8,8,10,.94);display:grid;place-items:center;padding:20px;font-family:system-ui;color:#f4f1e8';
      o.innerHTML='<div style="width:min(760px,100%);background:#15151a;border:2px solid #ffb84d;border-radius:18px;padding:24px"><h1 style="font-size:clamp(42px,10vw,72px);margin:0 0 8px;color:#ffb84d">💨 BIG FART</h1><p id="big-fart-message"></p><details><summary>Technical details</summary><pre id="big-fart-details" style="white-space:pre-wrap;max-height:240px;overflow:auto;background:#0b0b0e;padding:12px;border-radius:10px"></pre></details><button id="big-fart-reload" style="margin-top:16px;padding:11px 15px;border:0;border-radius:10px;font-weight:900;cursor:pointer">Reload</button></div>';
      document.body.appendChild(o);o.querySelector('#big-fart-reload').onclick=()=>location.reload();
    }
    o.querySelector('#big-fart-message').textContent=(context?context+': ':'')+e.message;
    o.querySelector('#big-fart-details').textContent=e.name+': '+e.message+'\n\n'+(e.stack||'No stack trace available.');
  }
  window.showBigFart=show;
  window.addEventListener('error',e=>show(e.error||e.message,'JavaScript error'));
  window.addEventListener('unhandledrejection',e=>show(e.reason,'Unhandled promise rejection'));
})();