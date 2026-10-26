/* Vyro backend: Firebase Auth + Firestore sync, plus read-only YouTube channel stats.
   Firebase web config and OAuth client IDs are public identifiers, not server secrets. */
(function(){
'use strict';
const CFG='vyro_backend_config_v1';
let auth=null,db=null,user=null,saveTimer=null,googleTokenClient=null,ready=false,authResolved=false;
const $=s=>document.querySelector(s);
const say=m=>{if(typeof toast==='function')toast(m);else alert(m)};
const DEFAULT_CFG={firebaseApiKey:'AIzaSyCoiNZ0WtsxrC-rHX-xGEkQkWIurnj5J4k',firebaseAuthDomain:'vyro-cd2fd.firebaseapp.com',firebaseProjectId:'vyro-cd2fd',firebaseAppId:'1:574510502743:web:947b8e4e768de1025ea412'};
const cfg=()=>{try{return {...DEFAULT_CFG,...JSON.parse(localStorage.getItem(CFG)||'{}')}}catch(e){return {...DEFAULT_CFG}}};
function saveCfg(c){localStorage.setItem(CFG,JSON.stringify(c))}
function firebaseAvailable(){return !!(window.firebase&&firebase.initializeApp&&firebase.auth&&firebase.firestore)}
function configure(){
 const c=cfg();
 if(!c.firebaseApiKey||!c.firebaseProjectId||!c.firebaseAppId)return {ok:false,reason:'Add your Firebase web config in Settings first.'};
 if(ready&&auth&&db)return {ok:true};
 if(!firebaseAvailable())return {ok:false,reason:'Firebase SDK did not load. Check your internet connection and reload.'};
 try{
  let app=firebase.apps.find(a=>a.name==='vyro-app');
  if(!app)app=firebase.initializeApp({apiKey:c.firebaseApiKey,authDomain:c.firebaseAuthDomain||c.firebaseProjectId+'.firebaseapp.com',projectId:c.firebaseProjectId,appId:c.firebaseAppId},'vyro-app');
  auth=app.auth();db=app.firestore();ready=true;
  auth.onAuthStateChanged(async u=>{
   user=u||null;
   authResolved=true;
   window.VyroBackend.user=user;
   if(user){
    try{
     const ref=db.collection('users').doc(user.uid).collection('workspace').doc('main');
     const snap=await ref.get();
     if(snap.exists&&typeof S!=='undefined'&&typeof save==='function'){
      const cloud=snap.data().state;
      if(cloud&&typeof cloud==='object'){
       const localExists=!!localStorage.getItem('vyro_creator_os_state');
       const localState=typeof S==='object'?JSON.parse(JSON.stringify(S)):null;
       if(localExists&&localState&&workspaceSignature(localState)!==workspaceSignature(cloud)){
        promptWorkspaceConflict(localState,cloud,ref);
        return;
       }
       applyCloudWorkspace(cloud);
      }
     }else if(typeof S!=='undefined')queueSync(S);
     say('Signed in. Workspace sync is ready.');
    }catch(e){console.error(e);say('Signed in, but workspace sync failed. Check Firestore setup and rules.')}
   }
   document.dispatchEvent(new CustomEvent('vyro-auth-change',{detail:{user}}));
  });
  return {ok:true};
 }catch(e){console.error(e);return {ok:false,reason:e.message||'Firebase setup failed.'}}
}
function stableWorkspaceValue(value){
 if(Array.isArray(value))return value.map(stableWorkspaceValue);
 if(value&&typeof value==='object')return Object.keys(value).sort().reduce((out,key)=>{out[key]=stableWorkspaceValue(value[key]);return out;},{});
 return value;
}
function workspaceSignature(state){
 const comparable={...state,view:'home'};
 return JSON.stringify(stableWorkspaceValue(comparable));
}
function applyCloudWorkspace(cloud){
 const requestedView=new URLSearchParams(window.location.search).get('admin')==='1'?'admin':null;
 S=removeDemoData({...seed(),...cloud,settings:{...seed().settings,...cloud.settings}});
 if(requestedView)S.view=requestedView;
 if(typeof load==='function'&&Array.isArray(S.settings.pipelineStages))ST=S.settings.pipelineStages.slice();
 if(typeof save==='function')save();
 if(typeof draw==='function')draw();
}
function promptWorkspaceConflict(localState,cloudState,ref){
 if(typeof ask!=='function'){
  say('Your local and cloud workspaces differ. Your local copy was preserved; reload the app to choose which version to keep.');
  return;
 }
 ask(`<div class="form-heading"><span class="form-mark">↔</span><div><span class="form-eyebrow">WORKSPACE SYNC</span><h3>Choose your workspace</h3><p>This device and your cloud workspace contain different data. Choose which copy to keep before syncing so nothing is silently overwritten.</p></div></div><div class="f standard-form"><button type="button" class="btn ghost" id="vyro-keep-local">Keep this device's workspace</button><button type="button" class="btn" id="vyro-use-cloud">Use cloud workspace</button></div>`);
 const localButton=document.querySelector('#vyro-keep-local');
 const cloudButton=document.querySelector('#vyro-use-cloud');
 if(localButton)localButton.addEventListener('click',()=>{
  shut();
  queueSync(localState);
  say('This device’s workspace was kept. Cloud sync will update to this copy.');
 });
 if(cloudButton)cloudButton.addEventListener('click',()=>{
  shut();
  applyCloudWorkspace(cloudState);
  say('Cloud workspace loaded on this device.');
 });
}
function queueSync(state){if(!user||!db||!state)return;clearTimeout(saveTimer);saveTimer=setTimeout(async()=>{try{await db.collection('users').doc(user.uid).collection('workspace').doc('main').set({state:JSON.parse(JSON.stringify(state)),updatedAt:firebase.firestore.FieldValue.serverTimestamp()})}catch(e){console.error('Vyro cloud sync:',e);say('Cloud save failed. Check Firestore rules; this device still has a local copy.')}},700)}
const LEGAL_CONSENT_KEY='vyro_legal_consent_v2';
const PRIVACY_VERSION='2026-10-17';
const TERMS_VERSION='2026-10-17';
function legalConsentCurrent(){try{const v=JSON.parse(localStorage.getItem(LEGAL_CONSENT_KEY)||'null');return !!(v&&v.privacyVersion===PRIVACY_VERSION&&v.termsVersion===TERMS_VERSION&&v.privacy===true&&v.terms===true)}catch(e){return false}}
function recordLegalConsent(){try{localStorage.setItem(LEGAL_CONSENT_KEY,JSON.stringify({privacy:true,terms:true,acceptedAt:new Date().toISOString(),privacyVersion:PRIVACY_VERSION,termsVersion:TERMS_VERSION}))}catch(e){}}
function requestLegalConsent(onAccept){
 if(legalConsentCurrent()){onAccept();return}
 document.querySelector('#vyro-legal-consent-modal')?.remove();
 const modal=document.createElement('div');modal.id='vyro-legal-consent-modal';modal.className='vyro-legal-modal';modal.innerHTML=`<section class="vyro-legal-dialog" role="dialog" aria-modal="true" aria-labelledby="vyro-legal-title"><button class="vyro-legal-close" type="button" aria-label="Close">×</button><div class="vyro-legal-eyebrow">Before you continue</div><h2 id="vyro-legal-title">Review Vyro’s policies</h2><p>Please read the policies before connecting your account. Both agreements are required to continue.</p><label class="vyro-legal-check"><input type="checkbox" id="vyro-modal-privacy"><span>I have read and agree to the <a href="html/privacy.html" target="_blank" rel="noopener">Privacy Policy</a>.</span></label><label class="vyro-legal-check"><input type="checkbox" id="vyro-modal-terms"><span>I have read and agree to the <a href="html/terms.html" target="_blank" rel="noopener">Terms of Service</a>.</span></label><p class="vyro-legal-error" role="alert" hidden>Please select both checkboxes to continue.</p><div class="vyro-legal-actions"><button class="btn ghost vyro-legal-cancel" type="button">Cancel</button><button class="btn vyro-legal-continue" type="button">Agree & continue</button></div></section>`;
 document.body.appendChild(modal);
 const close=()=>modal.remove();
 modal.querySelector('.vyro-legal-close').addEventListener('click',close);
 modal.querySelector('.vyro-legal-cancel').addEventListener('click',close);
 modal.addEventListener('click',e=>{if(e.target===modal)close()});
 modal.querySelector('.vyro-legal-continue').addEventListener('click',()=>{if(!modal.querySelector('#vyro-modal-privacy').checked||!modal.querySelector('#vyro-modal-terms').checked){modal.querySelector('.vyro-legal-error').hidden=false;return}recordLegalConsent();close();onAccept()});
 modal.querySelector('#vyro-modal-privacy').focus();
}
async function signGoogle(){requestLegalConsent(async()=>{const x=configure();if(!x.ok){say(x.reason);return}try{await auth.signInWithPopup(new firebase.auth.GoogleAuthProvider())}catch(e){console.error(e);say(authError(e))}})}
async function signEmail(mode){requestLegalConsent(async()=>{const x=configure();if(!x.ok){say(x.reason);return}const email=($('#backend-email')?.value||'').trim(),pass=$('#backend-password')?.value||'';if(!email||!pass){say('Enter your email and password.');return}try{if(mode==='create')await auth.createUserWithEmailAndPassword(email,pass);else await auth.signInWithEmailAndPassword(email,pass)}catch(e){say(authError(e))}})}
function authError(e){return ({'auth/unauthorized-domain':'This website domain is not authorized in Firebase Authentication settings.','auth/operation-not-allowed':'Email/password sign-in is not enabled in Firebase Authentication.','auth/popup-blocked':'Allow pop-ups for Vyro and try again.','auth/invalid-credential':'Email or password is incorrect. If you created your account with Google, use Continue with Google.','auth/invalid-email':'Enter a valid email address.','auth/email-already-in-use':'An account with this email already exists. Choose “Sign in” instead of “Create account”, or use Continue with Google if you originally registered with Google.','auth/user-not-found':'No account was found for this email. Choose “Create account” to register, or use Continue with Google if appropriate.','auth/wrong-password':'That password is incorrect. Check it and try again.','auth/weak-password':'Choose a password with at least 6 characters.','auth/popup-closed-by-user':'The Google window was closed before finishing. Try again.','auth/cancelled-popup-request':'Another sign-in window is already open.','auth/user-mismatch':'Choose the same Google account you are signed in with.','auth/credential-already-in-use':'That Google account already belongs to another Vyro account. Sign out, then sign in with Google.','auth/provider-already-linked':'Google is already linked to this account. Try again.','auth/network-request-failed':'Network error. Check your connection and try again.'})[e.code]||e.message||'Sign-in failed.'}
async function signOut(){if(auth)await auth.signOut();say('Signed out of Creator OS cloud sync.')}
async function youtubeRequest(path,token,key){
 const url='https://www.googleapis.com/youtube/v3/'+path+(key?(path.includes('?')?'&':'?')+'key='+encodeURIComponent(key):'');
 const res=await fetch(url,{headers:{Authorization:'Bearer '+token}});
 let data={};try{data=await res.json()}catch(e){}
 if(!res.ok){
  const msg=data.error?.message||'YouTube API request failed ('+res.status+').';
  if(res.status===403&&/not been used|disabled/i.test(msg))throw new Error('Enable “YouTube Data API v3” for this Firebase project in Google Cloud Console, then try again.');
  if(res.status===401)throw new Error('YouTube access expired. Press Connect YouTube again.');
  throw new Error(msg);
 }
 return data;
}
async function syncChannelVideos(channel,token,key){
 const uploads=channel.contentDetails?.relatedPlaylists?.uploads;
 if(!uploads)throw new Error('YouTube did not return an uploads playlist for this channel.');
 const items=[];let pageToken='';
 // Import the 200 most recent uploads to keep first sync fast and within API quotas.
 for(let page=0;page<4;page++){
  const q=new URLSearchParams({part:'snippet,contentDetails',playlistId:uploads,maxResults:'50'});
  if(pageToken)q.set('pageToken',pageToken);
  const data=await youtubeRequest('playlistItems?'+q.toString(),token,key);
  items.push(...(data.items||[]));pageToken=data.nextPageToken||'';
  if(!pageToken)break;
 }
 const ids=items.map(x=>x.contentDetails?.videoId||x.snippet?.resourceId?.videoId).filter(Boolean);
 const stats={};
 for(let i=0;i<ids.length;i+=50){
  const q=new URLSearchParams({part:'statistics,snippet',id:ids.slice(i,i+50).join(',')});
  const data=await youtubeRequest('videos?'+q.toString(),token,key);
  (data.items||[]).forEach(v=>{stats[v.id]=v.statistics||{}});
 }
 const stages=Array.isArray(ST)&&ST.length?ST:['Idea','Script','Recording','Editing','Thumbnail','Published'];
 const published=stages.includes('Published')?'Published':stages[stages.length-1];
 return items.map(item=>{
  const sn=item.snippet||{},id=item.contentDetails?.videoId||sn.resourceId?.videoId;
  if(!id)return null;
  const stat=stats[id]||{};
  return {id:Date.now()*1000+Math.floor(Math.random()*100000),youtubeVideoId:id,title:String(sn.title||'Untitled YouTube video').slice(0,100),status:published,views:String(stat.viewCount||'0'),notes:'Imported from YouTube · '+(sn.publishedAt?new Date(sn.publishedAt).toLocaleDateString():'Publication date unavailable'),thumb:sn.thumbnails?.maxres?.url||sn.thumbnails?.high?.url||sn.thumbnails?.medium?.url||sn.thumbnails?.default?.url||'',youtubeUrl:'https://www.youtube.com/watch?v='+id,publishedAt:sn.publishedAt||''};
 }).filter(Boolean);
}
const YT_SCOPE='https://www.googleapis.com/auth/youtube.readonly';
function ytBusy(on){document.querySelectorAll('[data-yt-connect]').forEach(b=>{if(on){if(b.dataset.html===undefined)b.dataset.html=b.innerHTML;b.disabled=true;b.classList.add('is-busy');b.textContent='Connecting…'}else{b.disabled=false;b.classList.remove('is-busy');if(b.dataset.html!==undefined){b.innerHTML=b.dataset.html;delete b.dataset.html}}})}
async function youtubeAccessToken(){
 const x=configure();if(!x.ok)throw new Error(x.reason);
 const provider=new firebase.auth.GoogleAuthProvider();
 provider.addScope(YT_SCOPE);
 const u=auth.currentUser;
 let result;
 if(!u){provider.setCustomParameters({prompt:'select_account consent'});result=await auth.signInWithPopup(provider)}
 else if(u.providerData.some(p=>p.providerId==='google.com')){provider.setCustomParameters({prompt:'consent',login_hint:u.email||''});result=await u.reauthenticateWithPopup(provider)}
 else{provider.setCustomParameters({prompt:'select_account consent'});result=await u.linkWithPopup(provider)}
 const token=result?.credential?.accessToken;
 if(!token)throw new Error('Google did not return YouTube access. Try again and approve the YouTube permission.');
 return token;
}
function connectYouTube(){
 requestLegalConsent(async()=>{
  if(typeof S==='undefined'||!S?.settings){say('Workspace is still loading. Try again in a moment.');return}
  const key=cfg().youtubeApiKey||'';
  ytBusy(true);
  try{
   const token=await youtubeAccessToken();
   say('Connected to Google. Syncing your YouTube channel…');
   const data=await youtubeRequest('channels?part=snippet,statistics,contentDetails&mine=true',token,key);
   if(!data.items?.length)throw new Error('No YouTube channel was found on that Google account. Pick the account that owns your channel.');
   const ch=data.items[0];
   const imported=await syncChannelVideos(ch,token,key);
   // Keep manual videos and any pipeline progress; refresh stats on videos imported earlier.
   const known=new Map((S.videos||[]).filter(v=>v.youtubeVideoId).map(v=>[v.youtubeVideoId,v]));
   const merged=imported.map(v=>known.has(v.youtubeVideoId)?{...known.get(v.youtubeVideoId),views:v.views,thumb:v.thumb||known.get(v.youtubeVideoId).thumb}:v);
   S.videos=[...merged,...(S.videos||[]).filter(v=>!v.youtubeVideoId)];
   S.settings.youtubeChannel={id:ch.id,title:ch.snippet.title,thumbnail:ch.snippet.thumbnails?.default?.url||'',subscribers:ch.statistics.hiddenSubscriberCount?null:Number(ch.statistics.subscriberCount||0),views:Number(ch.statistics.viewCount||0),videoCount:Number(ch.statistics.videoCount||0),connectedAt:S.settings.youtubeChannel?.connectedAt||new Date().toISOString(),lastSyncedAt:new Date().toISOString(),syncedVideoCount:imported.length};
   if(typeof save==='function'&&!save())throw new Error('Your browser could not save the synced workspace. Free up storage and try again.');
   if(typeof draw==='function')draw();
   say('YouTube connected. Synced '+imported.length+' videos.');
  }catch(e){
   console.error('YouTube connect:',e);
   say(e.code?authError(e):(e.message||'Could not sync YouTube data.'));
  }finally{ytBusy(false)}
 });
}
function disconnectYouTube(){
 if(typeof S==='undefined'||!S?.settings){say('Workspace is still loading. Wait a moment and try again.');return}
 try{
  const previous=S.settings.youtubeChannel;
  if(!previous){say('No YouTube channel is connected.');return}
  delete S.settings.youtubeChannel;
  // Remove only videos imported from YouTube; keep videos created manually in Vyro.
  S.videos=(S.videos||[]).filter(v=>!v.youtubeVideoId);
  if(typeof save==='function'&&!save()){
   S.settings.youtubeChannel=previous;
   say('Could not disconnect because the workspace could not be saved. Export a backup or free browser storage, then try again.');
   return;
  }
  if(typeof draw==='function')draw();
  say('YouTube channel disconnected from Vyro. Your manually created videos and Google workspace sign-in are unchanged.');
 }catch(e){
  console.error('YouTube disconnect failed:',e);
  say('Could not disconnect the channel: '+(e.message||'unexpected error'));
 }
}
function saveSettingsFromForm(){
 const c=cfg();
 c.firebaseApiKey=$('#fb-api-key')?.value.trim()||'';c.firebaseAuthDomain=$('#fb-auth-domain')?.value.trim()||'';c.firebaseProjectId=$('#fb-project-id')?.value.trim()||'';c.firebaseAppId=$('#fb-app-id')?.value.trim()||'';c.youtubeClientId=$('#yt-client-id')?.value.trim()||'';c.youtubeApiKey=$('#yt-api-key')?.value.trim()||'';
 saveCfg(c);const result=configure();if(result.ok)say('Connection settings saved. You can now sign in.');else say('Settings saved on this device. '+result.reason);
}
function status(){return {configured:ready,user,authResolved,config:cfg()}}
window.VyroBackend={configure,queueSync,signGoogle,signEmail,signOut,connectYouTube,disconnectYouTube,saveSettingsFromForm,status,user:null};
document.addEventListener('DOMContentLoaded',()=>{const x=configure();if(!x.ok){authResolved=true;document.dispatchEvent(new CustomEvent('vyro-auth-change',{detail:{user:null,unavailable:true}}));console.info('Vyro backend not configured yet:',x.reason)}});
})();
