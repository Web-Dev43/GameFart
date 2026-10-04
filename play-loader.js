function escText(value){return String(value??"")}
function escAttr(value){return String(value??"").replace(/&/g,"&amp;").replace(/"/g,"&quot;")}
async function load(){
  try{
    const params=new URLSearchParams(location.search),id=params.get("id");
    const titleEl=document.getElementById("title"),descriptionEl=document.getElementById("description");
    if(!id){titleEl.textContent="Missing game";return}
    const user=await GameFartAuth.getUser();
    const staff=!!user&&(GameFartAuth.isModerator(user)||GameFartAuth.isOwner(user));
    const source=staff?GameFartAuth.client:GameFartAuth.publicClient;
    const query=source.from("gamefart_games").select("title,description,html,css,javascript,bot_count,status").eq("id",id);
    if(!staff)query.eq("status","published");
    const {data,error}=await query.single();
    if(error||!data){titleEl.textContent="Game not found";descriptionEl.textContent="It may still be in moderation, or a moderator yeeted it.";return}
    titleEl.textContent=data.title;
    descriptionEl.textContent=data.description||"";
    if(staff&&data.status!=="published")descriptionEl.textContent=(data.description||"")+" · Staff preview: "+data.status;
    const botCount=Math.max(0,Math.min(8,Number(data.bot_count)||0));
    document.getElementById("bot-info").textContent=botCount?"🤖 "+botCount+" bot opponent"+(botCount===1?"":"s")+" may compete in this game.":"";
    const frame=document.getElementById("frame");
    const botCode=botCount?(`window.GameFartBots=(function(){const maxBots=${botCount};function create(options){options=options||{};const requested=options.count===undefined?maxBots:Number(options.count);const count=Math.max(0,Math.min(maxBots,Math.floor(Number.isFinite(requested)?requested:0)));const interval=Math.max(50,Math.min(2000,Math.floor(Number(options.interval)||250)));const update=typeof options.update==="function"?options.update:function(){};const names=Array.isArray(options.names)?options.names:[];const bots=Array.from({length:count},(_,i)=>({id:"bot-"+(i+1),name:String(names[i]||("Bot "+(i+1))).slice(0,24),score:0,state:{}}));let timer=setInterval(()=>bots.forEach(bot=>{try{update(bot,bots)}catch(e){console.error("Bot error",e)}}),interval);return {bots,stop(){clearInterval(timer);timer=null}}}return {maxBots,create};})();`):"";
    const doc="<!doctype html><html><head><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><style>"+escText(data.css)+"</style></head><body>"+escText(data.html)+(botCode?"<script>"+botCode+"</script>":"")+"<script>"+escText(data.javascript)+"</script></body></html>";
    frame.srcdoc=doc;
  }catch(e){window.showBigFart?.(e,"Loading community game")}
}
load();
