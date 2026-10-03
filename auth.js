(function(){
  const URL='https://hfdekvptcyjpgjypbakm.supabase.co';
  const KEY='sb_publishable_Of_AeC0QNct7de72es504w_X5MBIdHZ';
  const client=window.supabase.createClient(URL,KEY);
  const publicClient=window.supabase.createClient(URL,KEY,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
  async function getSession(){return (await client.auth.getSession()).data.session||null}
  async function getUser(){const {data}=await client.auth.getUser();return data.user||null}
  async function ensureGuest(){const session=await getSession();if(session?.user)return session.user;const {data,error}=await client.auth.signInAnonymously();if(error)throw error;return data.user}
  async function continueAsGuest(){return ensureGuest()}
  async function linkGuestEmail(email){const user=await refreshAuthState();if(!user?.is_anonymous)return {user,error:null};const {data,error}=await client.auth.updateUser({email:email.trim().toLowerCase()});return {user:data.user||null,error}}
  async function signUp(email,password){return client.auth.signUp({email:email.trim().toLowerCase(),password,options:{emailRedirectTo:location.origin+location.pathname}})}
  async function signIn(email,password){return client.auth.signInWithPassword({email:email.trim().toLowerCase(),password})}
  async function sendMagicLink(email){return client.auth.signInWithOtp({email:email.trim().toLowerCase(),options:{emailRedirectTo:location.origin+location.pathname}})}
  async function signOut(){return client.auth.signOut()}
  function isModerator(user){return user?.app_metadata?.role==='moderator'}
  function isOwner(user){return user?.app_metadata?.role==='owner'}
  async function manageModerators(action,email){const {data,error}=await client.functions.invoke('manage-moderators',{body:{action,email}});if(error)throw error;return data}
  async function listModerators(){return manageModerators('list','')}
  async function refreshAuthState(){try{await client.auth.refreshSession()}catch(e){}return getUser()}
async function renderAuthActions(){
  const box=document.querySelector('.auth-actions'); if(!box)return; try {
  const user=await refreshAuthState();
  box.replaceChildren();
  if(!user){
    const guest=document.createElement('button'); guest.id='guest'; guest.textContent='Continue as Guest'; box.append(guest);
    const signup=document.createElement('a'); signup.href='auth.html'; signup.textContent='Sign Up'; box.append(signup); return;
  }
  if(user.is_anonymous){
    const guest=document.createElement('button'); guest.id='guest'; guest.textContent='Guest Mode'; box.append(guest);
    const signup=document.createElement('a'); signup.href='auth.html'; signup.textContent='Sign Up'; box.append(signup); return;
  }
  const label=document.createElement('span'); label.className='account-label'; label.textContent=user.email||'Signed in'; box.append(label);
  if(isOwner(user)){const owner=document.createElement('a');owner.href='owner.html';owner.textContent='Owner Dashboard';box.append(owner)}
  else if(isModerator(user)){const mod=document.createElement('a');mod.href='moderator.html';mod.textContent='Moderator';box.append(mod)}
  const logout=document.createElement('button'); logout.id='logout'; logout.textContent='Log Out'; logout.onclick=async()=>{await signOut();location.reload()}; box.append(logout);
  const state=document.querySelector('#account-state'); if(state) state.textContent='';
  } catch(e) { console.error(e); }
}
async function requireCreator(){const user=await ensureGuest();if(user.is_anonymous)return {ok:false,user};return {ok:true,user}}
  window.GameFartAuth={client,publicClient,getSession,getUser,ensureGuest,continueAsGuest,linkGuestEmail,signUp,signIn,sendMagicLink,signOut,isModerator,isOwner,manageModerators,listModerators,renderAuthActions,requireCreator};
})();