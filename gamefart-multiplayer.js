/* GameFart multiplayer bridge
   Runs in the trusted parent page. Community games stay sandboxed.
*/
(function(){
  const SUPABASE_URL='https://hfdekvptcyjpgjypbakm.supabase.co';
  const SUPABASE_KEY='sb_publishable_Of_AeC0QNct7de72es504w_X5MBIdHZ';
  const supabase=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
  let channel=null;
  let frame=null;
  let gameId=null;
  let realPlayers=[];
  let messageHandlers=[];
  let botTimer=null;
  let playerHandlers=[];

  function uniquePlayers(state){
    const out=new Map();
    Object.entries(state||{}).forEach(([key,metas])=>{
      const meta=Array.isArray(metas)?metas[metas.length-1]:metas;
      const userId=meta?.userId||key;
      if(userId) out.set(userId,{id:userId});
    });
    return [...out.values()];
  }

  function botState(){
    return realPlayers.length===0
      ? [{id:'bot-1',name:'Bot 1'},{id:'bot-2',name:'Bot 2'}]
      : [];
  }

  function publishPlayers(){
    const bots=botState();
    const payload={
      type:'GF_PLAYERS',
      players:realPlayers,
      playerCount:realPlayers.length,
      bots,
      botCount:bots.length,
      hasRealPlayers:realPlayers.length>0
    };
    if(frame?.contentWindow) frame.contentWindow.postMessage(payload,'*');
    playerHandlers.forEach(fn=>{try{fn(payload)}catch(e){console.error(e)}});
    const count=document.querySelector('#player-count');
    if(count) count.textContent=realPlayers.length+' player'+(realPlayers.length===1?'':'s');
    const bot=document.querySelector('#bot-status');
    if(bot) bot.textContent=bots.length ? '🤖 Bot slots active' : '';
    if(bots.length && !botTimer && frame?.contentWindow){botTimer=setInterval(()=>frame.contentWindow.postMessage({type:'GF_BOT_TICK',bots:bots},'*'),750)}
    if(!bots.length && botTimer){clearInterval(botTimer);botTimer=null}
  }

  async function start(game,iframe){
    gameId=game;
    frame=iframe;
    const user=await GameFartAuth.getUser();
    if(!user || user.is_anonymous){
      publishPlayers();
      if(frame?.contentWindow) frame.contentWindow.postMessage({type:'GF_INIT',gameId,authenticated:false,playerCount:0,players:[],bots:botState()},'*');
      return {active:false,reason:'sign-in-required'};
    }

    await supabase.realtime.setAuth();
    channel=supabase.channel('game:'+gameId,{
      config:{
        private:true,
        presence:{key:user.id},
        broadcast:{ack:true,self:false}
      }
    });

    channel
      .on('presence',{event:'sync'},()=>{realPlayers=uniquePlayers(channel.presenceState());publishPlayers()})
      .on('broadcast',{event:'game-event'},payload=>{
        const data=payload?.payload;
        if(frame?.contentWindow) frame.contentWindow.postMessage({type:'GF_MESSAGE',data},'*');
        messageHandlers.forEach(fn=>{try{fn(data)}catch(e){console.error(e)}});
      });

    const status=await new Promise(resolve=>{
      channel.subscribe(async s=>{
        if(s==='SUBSCRIBED'){
          await channel.track({userId:user.id});
          resolve(s);
        } else if(s==='CHANNEL_ERROR'||s==='TIMED_OUT'||s==='CLOSED'){
          resolve(s);
        }
      });
    });

    if(status!=='SUBSCRIBED') throw new Error('Multiplayer connection failed: '+status);
    realPlayers=uniquePlayers(channel.presenceState());
    publishPlayers();
    if(frame?.contentWindow) frame.contentWindow.postMessage({
      type:'GF_INIT',gameId,authenticated:true,playerCount:realPlayers.length,
      players:realPlayers,bots:botState()
    },'*');
    return {active:true};
  }

  async function send(data){
    if(!channel) return {status:'not-connected'};
    return channel.send({type:'broadcast',event:'game-event',payload:data});
  }

  function onMessage(fn){if(typeof fn==='function')messageHandlers.push(fn);return()=>messageHandlers=messageHandlers.filter(x=>x!==fn)}
  function onPlayers(fn){if(typeof fn==='function')playerHandlers.push(fn);return()=>playerHandlers=playerHandlers.filter(x=>x!==fn)}
  function getPlayers(){return [...realPlayers]}
  function getBots(){return botState()}

  async function stop(){
    if(channel){await channel.untrack().catch(()=>{});await supabase.removeChannel(channel);channel=null}
    if(botTimer){clearInterval(botTimer);botTimer=null}
    realPlayers=[];publishPlayers();
  }

  window.GameFartMultiplayer={start,send,onMessage,onPlayers,getPlayers,getBots,stop};
})();
