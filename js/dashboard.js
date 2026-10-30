'use strict';
function timeline(){const s=new Date();s.setHours(0,0,0,0);s.setDate(s.getDate()-2);const D=[...Array(14)].map((_,i)=>{const x=new Date(s);x.setDate(s.getDate()+i);return x}),ds=D.map(iso),td=iso(new Date());
return`<div class="tl"><div class="tl-in"><div class="tl-head"><span></span><div>${D.map(d=>`<i class="${iso(d)===td?'now':''}">${'SMTWTFS'[d.getDay()]}<b>${d.getDate()}</b></i>`).join('')}</div></div>
${[['Videos','video'],['Brands','brand'],['Other','other']].map(([n,k])=>`<div class="tl-row"><em>${n}</em><div class="tl-track">${S.events.filter(e=>(e.type||'other')===k&&ds.includes(e.date)).map(e=>{const i=ds.indexOf(e.date);return`<button class="clip ${k}" style="grid-column:${i+1}/span ${Math.min(3,14-i)}" onclick="calSel('${e.date}');go('calendar')"><b>${esc(e.title)}</b>${esc(e.time||'')}</button>`}).join('')}</div></div>`).join('')}
<u class="head"></u></div></div>`}

V.home=()=>{const{videos:v,brands:b,tasks}=S;
const latest=(tasks||[]).slice().reverse().slice(0,3);
return`<h2 class="hi">${esc(S.settings.name)}'s workspace</h2>
<section class="strip" aria-label="Channel overview">
  <div><b>${S.settings.youtubeChannel?.subscribers==null?'—':Number(S.settings.youtubeChannel.subscribers).toLocaleString('en-IN')}</b><span>Subscribers</span><small class="stat-note">${S.settings.youtubeChannel?'YouTube channel':'Connect YouTube to sync'}</small></div>
  <div><b>${S.settings.youtubeChannel?Number(S.settings.youtubeChannel.views||0).toLocaleString('en-IN'):'—'}</b><span>Total views</span><small class="stat-note">${S.settings.youtubeChannel?'Across your channel':'Connect YouTube to sync'}</small></div>
  <div><b>${b.length}</b><span>Brands</span></div>
  <div><b>${v.length}</b><span>Videos</span></div>
</section>
<section class="panel"><header><h3>Next two weeks</h3><button class="lnk" onclick="go('calendar')">Open schedule</button></header>${timeline()}</section>
<section class="panel dashboard-tasks"><header><h3>Latest tasks</h3><button class="lnk" onclick="go('tasks')">All tasks</button></header>
${latest.map(t=>`<div class="row ${t.completed?'done':''}"><button class="chk ${t.completed?'on':''}" onclick="tk(${t.id})" aria-label="Mark ${t.completed?'not done':'done'}">${t.completed?'✓':''}</button><button class="task-title" onclick="go('tasks')"><strong>${esc(t.title)}</strong></button><span class="tag ${esc(t.priority||'medium')}">${esc(t.priority||'medium')}</span></div>`).join('')||'<div class="empty">No tasks yet. Add your first task.</div>'}
</section>`};
