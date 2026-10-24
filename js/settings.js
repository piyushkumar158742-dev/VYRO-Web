'use strict';
const SXI={
 pencil:'<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
 logout:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',
 coins:'<circle cx="8" cy="8" r="5.5"/><path d="M18.1 10.4A6 6 0 1 1 10.4 18"/><path d="M7 6h1v4"/><path d="m16.7 13.9.7.7-2.8 2.8"/>',
 youtube:'<rect x="2.5" y="5" width="19" height="14" rx="4.5"/><path d="m10.2 9.2 4.6 2.8-4.6 2.8Z" fill="currentColor" stroke="none"/>',
 db:'<ellipse cx="12" cy="5.5" rx="8" ry="3"/><path d="M4 5.5v13c0 1.7 3.6 3 8 3s8-1.3 8-3v-13"/><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
 download:'<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/>',
 trash:'<path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="m19 6-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/>',
 shield:'<path d="M12 3 4.5 6v5.5c0 4.5 3.2 8.2 7.5 9.5 4.3-1.3 7.5-5 7.5-9.5V6Z"/>',
 out:'<path d="M7 17 17 7"/><path d="M8 7h9v9"/>',
 cloud:'<path d="M17.5 19H9a7 7 0 1 1 6.7-9h1.8a4.5 4.5 0 1 1 0 9Z"/>',
 sync:'<path d="M21 12a9 9 0 0 1-15.5 6.2L3 16"/><path d="M3 21v-5h5"/><path d="M3 12a9 9 0 0 1 15.5-6.2L21 8"/><path d="M21 3v5h-5"/>'
};
const sxi=(n,c='')=>`<svg class="sx-svg ${c}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${SXI[n]}</svg>`;
V.settings=()=>{
 const bc=window.VyroBackend?.status?.()||{};
 const ch=S.settings.youtubeChannel;
 const name=esc(S.settings.name||'Creator');
 const cur=S.settings.cur||'₹';
 const num=n=>Number(n||0).toLocaleString('en-IN');
 const synced=ch?.lastSyncedAt?new Date(ch.lastSyncedAt).toLocaleString('en-IN',{day:'numeric',month:'short',hour:'numeric',minute:'2-digit'}):'';
 return `<div class="sx">
<section class="sx-card" aria-label="Settings">
 <div class="sx-hero">
  <div class="sx-banner">
   <div class="sx-banner-name"><h2 id="settings-display-name">${name}</h2><button type="button" class="sx-icon-btn" onclick="seditname()" aria-label="Change your name" title="Change name">${sxi('pencil')}</button></div>
  </div>
  <div class="sx-hero-body">
   <div class="sx-avatar" aria-hidden="true">${esc((S.settings.name||'Creator').trim().charAt(0).toUpperCase())}</div>
   <div class="sx-id">
    <div class="sx-meta"><span class="sx-email">${bc.user?esc(bc.user.email||bc.user.displayName||'Connected account'):'Local workspace'}</span><span class="sx-pill ${bc.user?'is-on':''}"><i></i>${bc.user?'Connected':'On this device'}</span></div>

   </div>
   ${bc.user?`<button type="button" class="sx-btn sx-signout" onclick="VyroBackend.signOut()">${sxi('logout')}Sign out</button>`:''}
  </div>
 </div>
 ${bc.authResolved&&!bc.user?`<div class="sx-row sx-row-sync"><div class="sx-ico">${sxi('cloud')}</div><div class="sx-copy"><h3>Sync across devices</h3><p>Sign in to keep your workspace backed up and available everywhere.</p></div><div class="sx-actions"><button type="button" class="sx-btn sx-btn-primary" onclick="VyroBackend.signGoogle()">Continue with Google</button></div>
  <details class="sx-email-login"><summary>Use email instead</summary><div class="sx-fields"><label>Email<input id="backend-email" type="email" placeholder="you@example.com" autocomplete="email"></label><label>Password<input id="backend-password" type="password" minlength="6" placeholder="At least 6 characters" autocomplete="current-password"></label></div><div class="sx-actions sx-actions-start"><button type="button" class="sx-btn sx-btn-primary" onclick="VyroBackend.signEmail('login')">Sign in</button><button type="button" class="sx-btn" onclick="VyroBackend.signEmail('create')">Create account</button></div></details></div>`}
 <div class="sx-row">
  <div class="sx-ico">${sxi('coins')}</div>
  <div class="sx-copy"><h3 id="sx-cur-label">Display currency</h3><p>Default currency for brand deals and sponsorship pipelines.</p></div>
  <div class="sx-seg" role="group" aria-labelledby="sx-cur-label">
   ${[['₹','INR'],['$','USD'],['€','EUR'],['£','GBP']].map(([symbol,code])=>`<button type="button" class="sx-cur ${cur===symbol?'is-on':''}" data-currency="${symbol}" aria-pressed="${cur===symbol}" onclick="scurrency('${symbol}')"><b>${symbol}</b><span>${code}</span></button>`).join('')}
  </div><input type="hidden" id="sc" value="${esc(cur)}">
 </div>
 <div class="sx-row sx-row-yt">
  <div class="sx-ico sx-ico-yt">${sxi('youtube')}</div>
  <div class="sx-copy"><h3>YouTube channel <span class="sx-tag ${ch?'is-on':''}">${ch?'Connected':'Optional'}</span></h3>
   <p>${ch?`Read-only access${synced?' · last synced '+esc(synced):''}`:'Import recent videos and channel analytics with read-only access.'}</p>
   ${ch?`<div class="sx-channel">${ch.thumbnail?`<img src="${esc(ch.thumbnail)}" alt="" referrerpolicy="no-referrer">`:''}<div><strong>${esc(ch.title)}</strong><small>${ch.subscribers==null?'Hidden subscribers':num(ch.subscribers)+' subscribers'} · ${num(ch.views)} views · ${num(ch.videoCount)} videos</small></div></div>`:''}
  </div>
  <div class="sx-actions"><button type="button" class="sx-btn ${ch?'':'sx-btn-primary'}" data-yt-connect onclick="VyroBackend.connectYouTube()">${ch?sxi('sync')+'Sync again':'Connect YouTube'}</button>${ch?'<button type="button" class="sx-btn" onclick="VyroBackend.disconnectYouTube()">Disconnect</button>':''}</div>
 </div>
 <div class="sx-row">
  <div class="sx-ico">${sxi('db')}</div>
  <div class="sx-copy"><h3>Workspace data</h3><p>Export a backup of your pipeline, or reset everything saved on this device.</p></div>
  <div class="sx-actions"><button type="button" class="sx-btn" onclick="sexp()">${sxi('download')}Export data</button><button type="button" class="sx-btn sx-btn-danger" onclick="srst()">${sxi('trash')}Reset workspace</button></div>
 </div>
</section>
<footer class="sx-foot"><span>${sxi('shield')}Review how Vyro handles workspace and YouTube data.</span><nav><a href="html/privacy.html" target="_blank" rel="noopener">Privacy Policy${sxi('out')}</a><a href="html/terms.html" target="_blank" rel="noopener">Terms of Service${sxi('out')}</a></nav></footer>
</div>`;
};
function seditname(){const title=$('#settings-display-name');if(!title)return;if(title.isContentEditable){title.blur();return}title.dataset.previousName=title.textContent.trim();title.contentEditable='true';title.setAttribute('role','textbox');title.setAttribute('aria-label','Edit display name');title.setAttribute('data-placeholder','Your name');title.classList.add('is-editing-name');title.focus();const range=document.createRange();range.selectNodeContents(title);range.collapse(false);const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range)}
function sfinishname(cancel=false){const title=$('#settings-display-name');if(!title)return;const before=title.dataset.previousName||'Creator';const name=(cancel?before:title.textContent).trim().slice(0,20)||before;title.textContent=name;title.contentEditable='false';title.removeAttribute('role');title.removeAttribute('aria-label');title.classList.remove('is-editing-name');title.removeAttribute('data-placeholder');S.settings.name=name;const avatar=document.querySelector('.sx-avatar');if(avatar)avatar.textContent=name.charAt(0).toUpperCase();if(!cancel&&name!==before){save();toast('Name updated')}delete title.dataset.previousName}
function scancelname(){sfinishname(true)}
document.addEventListener('input',e=>{if(e.target?.id==='settings-display-name'&&e.target.isContentEditable){const title=e.target;if(title.textContent.length>20)title.textContent=title.textContent.slice(0,20);S.settings.name=title.textContent.trim()||'';const avatar=document.querySelector('.sx-avatar');if(avatar)avatar.textContent=(S.settings.name||'C').charAt(0).toUpperCase();save()}});
document.addEventListener('keydown',e=>{if(e.target?.id!=='settings-display-name'||!e.target.isContentEditable)return;if(e.key==='Enter'){e.preventDefault();sfinishname(false)}if(e.key==='Escape'){e.preventDefault();scancelname()}});
document.addEventListener('focusout',e=>{if(e.target?.id==='settings-display-name'&&e.target.isContentEditable)sfinishname(false)});
function scurrency(symbol){const input=$('#sc');if(input)input.value=symbol;document.querySelectorAll('.sx-cur').forEach(b=>{const on=b.dataset.currency===symbol;b.classList.toggle('is-on',on);b.setAttribute('aria-pressed',String(on))});if(S.settings.cur!==symbol){S.settings.cur=symbol;if(save())toast('Currency set to '+symbol)}}
function ssave(){const name=$('#sn').value.trim().slice(0,20)||'Creator';S.settings.name=name;S.settings.cur=$('#sc').value||'₹';save();draw();toast('Settings saved')}
function sexp(){const a=document.createElement('a');const url=URL.createObjectURL(new Blob([JSON.stringify(S,null,2)],{type:'application/json'}));a.href=url;a.download='vyro-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
function srst(){confirmUI('Reset your workspace?','This will erase all videos, tasks, deals and events saved on this device. This cannot be undone.','Reset workspace',()=>{S=seed();save();go('home');toast('Workspace reset')})}
document.addEventListener('vyro-auth-change',()=>{if(S?.view==='settings'||S?.view==='admin')if(typeof draw==='function')draw()});
