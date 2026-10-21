'use strict';
V.settings=()=>{
 const bc=window.VyroBackend?.status?.()||{};
 const ch=S.settings.youtubeChannel;
 const name=esc(S.settings.name||'Creator');
 return `<div class="set user-settings settings-hub">
<section class="settings-profile">
 <div class="profile-avatar" aria-hidden="true">${(S.settings.name||'Creator').trim().charAt(0).toUpperCase()}</div>
 <div class="profile-identity"><div class="profile-name-line"><h2 id="settings-display-name">${name}</h2><button type="button" class="name-edit-button" onclick="seditname()" aria-label="Change your name" title="Change name">✎</button></div>
 <div class="profile-email">${bc.user?esc(bc.user.email||bc.user.displayName||'Connected account'):'Local workspace'} <span class="profile-status ${bc.user?'is-connected':''}"><i></i>${bc.user?'Connected':'On this device'}</span></div>
 <div id="name-edit-row" class="name-edit-row" hidden><input id="sn" value="${name}" maxlength="20" autocomplete="nickname" aria-label="Your name" onkeydown="if(event.key==='Enter')ssave();if(event.key==='Escape')scancelname()"><button class="btn" type="button" onclick="ssave()">Save</button><button class="btn ghost" type="button" onclick="scancelname()">Cancel</button></div>
 </div>
 ${bc.user?'<button class="btn ghost profile-signout" onclick="VyroBackend.signOut()">↪ Sign out</button>':''}
</section>
<section class="settings-row currency-row"><div class="settings-row-icon" aria-hidden="true">◉</div><div class="settings-row-copy"><h3>Display currency</h3><p>Default currency for brand deals and sponsorship pipelines.</p></div><fieldset class="currency-picker"><legend class="sr-only">Display currency</legend><div class="currency-options">
${[['₹','INR'],['$','USD'],['€','EUR'],['£','GBP']].map(([symbol,code])=>`<button type="button" class="currency-choice ${(S.settings.cur||'₹')===symbol?'selected':''}" data-currency="${symbol}" aria-pressed="${(S.settings.cur||'₹')===symbol}" onclick="scurrency('${symbol}')"><strong>${symbol}</strong><span>${code}</span></button>`).join('')}
</div><input type="hidden" id="sc" value="${S.settings.cur||'₹'}"></fieldset></section>
<section class="settings-row"><div class="settings-row-icon youtube-icon" aria-hidden="true">▷</div><div class="settings-row-copy"><h3>YouTube channel <span class="settings-tag">${ch?'Connected':'Optional'}</span></h3>
${ch?`<p>Connected to ${esc(ch.title)} · ${Number(ch.videoCount||0).toLocaleString('en-IN')} videos</p>`:'<p>Import recent videos and channel stats with read-only access.</p>'}
${ch?`<div class="settings-channel-inline">${ch.thumbnail?`<img src="${esc(ch.thumbnail)}" alt="">`:''}<span>${esc(ch.title)}<small>${Number(ch.views||0).toLocaleString('en-IN')} views</small></span></div>`:''}
</div><div class="settings-row-actions"><button class="btn" onclick="VyroBackend.connectYouTube()">${ch?'Reconnect':'Connect YouTube'}</button>${ch?'<button class="btn ghost" onclick="VyroBackend.disconnectYouTube()">Disconnect</button>':''}</div></section>
<section class="settings-row"><div class="settings-row-icon" aria-hidden="true">▤</div><div class="settings-row-copy"><h3>Workspace data</h3><p>Export a backup or clear cached files from this device.</p></div><div class="settings-row-actions"><button class="btn ghost" onclick="sexp()">↓ Export data</button><button class="btn ghost" onclick="sclearcache()">Clear cache</button></div></section>
<section class="settings-footer"><span>♧ Review how Vyro handles workspace and YouTube data.</span><div><a href="privacy.html" target="_blank" rel="noopener">Privacy Policy ↗</a><a href="terms.html" target="_blank" rel="noopener">Terms of Service ↗</a></div></section>
<section class="settings-account">${bc.user?'':`<h3>Sync your workspace</h3><p class="backend-help">Sign in to keep your workspace synced across devices.</p><div class="acts"><button class="btn" onclick="VyroBackend.signGoogle()">Continue with Google →</button><details class="simple-email-login"><summary>Or sign in with email</summary><div class="backend-grid auth-fields"><label>Email<input id="backend-email" type="email" placeholder="you@example.com" autocomplete="email"></label><label>Password<input id="backend-password" type="password" minlength="6" placeholder="At least 6 characters" autocomplete="current-password"></label></div><div class="acts"><button class="btn ghost" onclick="VyroBackend.signEmail('login')">Sign in</button><button class="btn ghost" onclick="VyroBackend.signEmail('create')">Create account</button></div></details></div>`}</section>
</div>`;
};
function scurrency(symbol){const input=$('#sc');if(input)input.value=symbol;document.querySelectorAll('.currency-choice').forEach(b=>{const on=b.dataset.currency===symbol;b.classList.toggle('selected',on);b.setAttribute('aria-pressed',String(on))})}
function ssave(){const name=$('#sn').value.trim().slice(0,20)||'Creator';S.settings.name=name;S.settings.cur=$('#sc').value||'₹';save();draw();toast('Settings saved')}
function sexp(){const a=document.createElement('a');const url=URL.createObjectURL(new Blob([JSON.stringify(S,null,2)],{type:'application/json'}));a.href=url;a.download='vyro-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
function srst(){confirmUI('Reset your workspace?','This will erase all videos, tasks, deals and events saved on this device. This cannot be undone.','Reset workspace',()=>{S=seed();save();go('home');toast('Workspace reset')})}
document.addEventListener('vyro-auth-change',()=>{if(S?.view==='settings'||S?.view==='admin')if(typeof draw==='function')draw()});
