(function(){
  function install(){
    if(document.getElementById("big-fart-overlay")) return;
    const style=document.createElement("style");
    style.id="big-fart-overlay-style";
    style.textContent="#big-fart-overlay{position:fixed;inset:0;z-index:99999;background:rgba(8,8,10,.92);display:none;place-items:center;padding:20px;font-family:system-ui,-apple-system,Segoe UI,sans-serif}#big-fart-overlay.show{display:grid}.big-fart-box{width:min(760px,100%);background:#15151a;border:2px solid #ffb84d;border-radius:18px;padding:24px;box-shadow:0 20px 80px rgba(0,0,0,.55)}.big-fart-title{font-size:clamp(38px,10vw,72px);font-weight:1000;letter-spacing:-.07em;color:#ffb84d;margin:0 0 8px}.big-fart-message{color:#f4f1e8;font-size:17px;word-break:break-word}.big-fart-details{margin-top:16px;background:#0b0b0e;border:1px solid #2b2b33;border-radius:10px;padding:12px;color:#9a999f;white-space:pre-wrap;max-height:220px;overflow:auto;font:12px/1.5 ui-monospace,SFMono-Regular,monospace}.big-fart-actions{display:flex;gap:10px;margin-top:16px;flex-wrap:wrap}.big-fart-actions button{border:0;border-radius:10px;padding:11px 15px;font-weight:950;cursor:pointer;background:#ffb84d;color:#171006}.big-fart-actions button.secondary{background:#1c1c22;color:#f4f1e8;border:1px solid #2b2b33}";
    document.head.appendChild(style);
    const overlay=document.createElement("div");
    overlay.id="big-fart-overlay";
    overlay.setAttribute("role","alertdialog");
    overlay.setAttribute("aria-modal","true");
    overlay.innerHTML='<div class="big-fart-box"><h1 class="big-fart-title">💨 BIG FART</h1><div id="big-fart-message" class="big-fart-message">Something exploded.</div><details><summary>Technical details</summary><div id="big-fart-details" class="big-fart-details"></div></details><div class="big-fart-actions"><button type="button" id="big-fart-reload">Reload</button><button type="button" class="secondary" id="big-fart-dismiss">Dismiss</button></div></div>';
    document.body.appendChild(overlay);
    const msg=overlay.querySelector("#big-fart-message"),details=overlay.querySelector("#big-fart-details");
    window.showBigFart=function(error,context){
      const e=error instanceof Error?error:new Error(String(error||"Unknown failure"));
      msg.textContent=context?context+": "+e.message:e.message;
      details.textContent=[e.name+": "+e.message,e.stack||"No stack trace available."].join("\n\n");
      overlay.classList.add("show");
    };
    overlay.querySelector("#big-fart-reload").onclick=()=>location.reload();
    overlay.querySelector("#big-fart-dismiss").onclick=()=>overlay.classList.remove("show");
  }
  function catchErrors(){
    window.addEventListener("error",e=>{if(e.message==="Script error."&&!e.error&&!e.filename)return;window.showBigFart&&window.showBigFart(e.error||e.message,"JavaScript error")});
    window.addEventListener("unhandledrejection",e=>window.showBigFart&&window.showBigFart(e.reason,"Unhandled promise rejection"));
  }
  if(document.body) install(); else document.addEventListener("DOMContentLoaded",install,{once:true});
  catchErrors();
})();