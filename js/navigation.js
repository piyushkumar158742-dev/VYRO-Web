'use strict';
const VYRO_ADMIN_EMAIL='piyushkumar158742@gmail.com';
function isVyroAdmin(){return String(window.VyroBackend?.status?.().user?.email||'').toLowerCase()===VYRO_ADMIN_EMAIL;}
function draw(){
 const auth=window.VyroBackend?.status?.()||{};
 if(S.view==='admin'&&auth.user&&!isVyroAdmin()&&!ADMIN_ENTRY){S.view='home';save();$('#main').innerHTML='<div class="panel"><div class="empty">This page is unavailable.</div></div>';$('#title').textContent='Desk';return}
 document.querySelectorAll('[data-nav]').forEach(b=>b.classList.toggle('on',b.dataset.nav===S.view));$('#title').textContent=S.view==='admin'?'Admin Panel':TT[S.view]||'Desk';
 try{$('#main').innerHTML=V[S.view]?V[S.view]():'<div class="panel"><div class="empty">Page not found.</div></div>'}catch(e){console.error(e);$('#main').innerHTML='<div class="panel"><div class="empty">Something broke while drawing this page. Open Settings and reset the workspace, then reload.</div></div>'}
 if(S.view==='calendar'){(requestAnimationFrame||setTimeout)(()=>{try{calPanels&&calPanels()}catch(_){}},0)}
}
function go(v){if(v==='admin'&&window.VyroBackend?.status?.().user&&!isVyroAdmin()){toast('Admin access only.');return}if(!TT[v]&&v!=='admin')return;S.view=v;save();draw();scrollTo(0,0)}
function tick(){const now=new Date();$('#clock').textContent=new Intl.DateTimeFormat('en-IN',{timeZone:'Asia/Kolkata',weekday:'short',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit',hour12:true}).format(now).replace(/ am| pm/i,m=>m.toLowerCase())}
document.addEventListener('keydown',e=>{if(e.key==='Escape')shut()});
/* Global shortcuts: N = new video, ⌘/Ctrl+K = new video, 1–5 = switch workspace pages */
document.addEventListener('keydown',e=>{
 if(e.ctrlKey||e.metaKey||e.altKey)return;
 const t=e.target,tag=(t&&t.tagName||'').toLowerCase();
 if(tag==='input'||tag==='select'||tag==='textarea'||(t&&t.isContentEditable))return;
 if(e.key==='n'||e.key==='N'){e.preventDefault();vm();return}
 if(/^[1-5]$/.test(e.key)){e.preventDefault();go(['home','videos','tasks','brands','calendar'][+e.key-1])}
});
const ADMIN_ENTRY=new URLSearchParams(window.location.search).get('admin')==='1';
if(ADMIN_ENTRY)S.view='admin';
document.addEventListener('vyro-auth-change',()=>{
 if(ADMIN_ENTRY){S.view='admin';draw();return}
 if(S.view==='settings'||S.view==='admin')draw();
});
tick();setInterval(tick,1000);draw();
