(function(){
  const URL='https://hfdekvptcyjpgjypbakm.supabase.co';
  const KEY='sb_publishable_Of_AeC0QNct7de72es504w_X5MBIdHZ';
  const client=window.supabase.createClient(URL,KEY);
  const publicClient=window.supabase.createClient(URL,KEY,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
  async function getSession(){return (await client.auth.getSession()).data.session||null}
  async function getUser(){const {data}=await client.auth.getUser();return data.user||null}
  async function ensureGuest(){const session=await getSession();if(session?.user)return session.user;const {data,error}=await client.auth.signInAnonymously();if(error)throw error;return data.user}
  async function continueAsGuest(){return ensureGuest()}
  async function linkGuestEmail(email){const user=await getUser();if(!user?.is_anonymous)return {user,error:null};const {data,error}=await client.auth.updateUser({email:email.trim().toLowerCase()});return {user:data.user||null,error}}
  async function signUp(email,password){return client.auth.signUp({email:email.trim().toLowerCase(),password,options:{emailRedirectTo:location.origin+location.pathname}})}
  async function signIn(email,password){return client.auth.signInWithPassword({email:email.trim().toLowerCase(),password})}
  async function sendMagicLink(email){return client.auth.signInWithOtp({email:email.trim().toLowerCase(),options:{emailRedirectTo:location.origin+location.pathname}})}
  async function signOut(){return client.auth.signOut()}
  function isModerator(user){return user?.app_metadata?.role==='moderator'}
  async function requireCreator(){const user=await ensureGuest();if(user.is_anonymous)return {ok:false,user};return {ok:true,user}}
  window.GameFartAuth={client,publicClient,getSession,getUser,ensureGuest,continueAsGuest,linkGuestEmail,signUp,signIn,sendMagicLink,signOut,isModerator,requireCreator};
})();