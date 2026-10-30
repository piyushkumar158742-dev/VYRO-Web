'use strict';
V.calendar=()=>{const{y,m}=cal,first=new Date(y,m,1).getDay(),n=new Date(y,m+1,0).getDate(),td=iso(new Date());let c='';
for(let i=0;i<first;i++)c+='<div class="day mute"></div>';
for(let d=1;d<=n;d++){const k=`${y}-${pad(m+1)}-${pad(d)}`,E=S.events.filter(e=>e.date===k).sort(byDate);c+=`<button class="day ${k===td?'today':''} ${k===cal.sel?'sel':''} ${E.length?'has':''}" onclick="calSel('${k}')"><span class="n">${d}</span>${E.slice(0,2).map(e=>`<i class="${e.type||''}">${esc(e.title)}</i>`).join('')}</button>`}
const day=S.events.filter(e=>e.date===cal.sel).sort(byDate),up=S.events.filter(e=>e.date>td).sort(byDate);
const li=e=>`<div class="row"><div><strong>${esc(e.title)}</strong><small>${fmt(e.date)} ${esc(e.time||'')}</small></div><button class="btn del" onclick="edel(${e.id},this)" aria-label="Delete event">✕</button></div>`;
return`<div class="cal"><section class="panel"><header><h3>${new Date(y,m,1).toLocaleString('en-IN',{month:'long',year:'numeric'})}</h3><div class="nav2"><button onclick="calMove(-1)" aria-label="Previous month">‹</button><button onclick="calSel('${td}')">Today</button><button onclick="calMove(1)" aria-label="Next month">›</button></div></header>
<div class="dow">${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d=>`<span>${d}</span>`).join('')}</div><div class="grid">${c}</div></section>
<aside><section class="panel cal-day-panel"><header><h3>${fmt(cal.sel)}</h3><button class="lnk" onclick="em()">+ Add event</button></header><div class="cal-scroll">${day.map(li).join('')||'<div class="empty">Nothing planned for this day.</div>'}</div></section>
<section class="panel cal-up-panel"><header><h3>Coming up</h3></header><div class="cal-scroll">${up.map(li).join('')||'<div class="empty">No upcoming events.</div>'}</div></section></aside></div>`};
function calSel(k){const[y,m]=k.split('-').map(Number);cal={y,m:m-1,sel:k};if(S.view==='calendar')draw()}
/* Equal-height side panels: measure both at their natural content height, then
   pin both to the taller one (capped to the viewport). Lists scroll inside. */
function calPanels(){try{
  const aside=document.querySelector('.cal aside');if(!aside)return;
  if(!matchMedia('(min-width:1001px)').matches){delete aside.dataset.calSync;aside.style.removeProperty('--cal-panel-h');return}
  aside.style.setProperty('--cal-panel-h','auto');aside.removeAttribute('data-cal-sync');
  const P=[...aside.querySelectorAll('.panel')];if(P.length!==2)return;
  const H=P.map(p=>p.offsetHeight);
  const cap=Math.max(360,window.innerHeight-32),shared=Math.min(Math.max(...H),cap);
  aside.style.setProperty('--cal-panel-h',Math.round(shared)+'px');
  aside.setAttribute('data-cal-sync','1');
}catch(_){}}
addEventListener('resize',()=>{if(S&&S.view==='calendar')calPanels()});
function calMove(n){const d=new Date(cal.y,cal.m+n,1);cal.y=d.getFullYear();cal.m=d.getMonth();cal.sel=iso(d);draw()}
function em(){ask(`<div class="form-heading"><span class="form-mark">✦</span><div><span class="form-eyebrow">PLAN AHEAD</span><h3>Add event</h3><p>Put an important deadline, upload, or call on your schedule.</p></div></div><form class="f standard-form" onsubmit="esave(event)"><label>Title<input name="title" required maxlength="100"></label><label>Date<input name="date" type="date" required value="${cal.sel}"></label><label>Time<input name="time" type="time"></label>
<label>Type<select name="type"><option value="video">Video</option><option value="brand">Brand</option><option value="other">Other</option></select></label><div class="acts"><button type="button" class="btn ghost" onclick="shut()">Cancel</button><button class="btn">Add event</button></div></form>`)}
function esave(e){e.preventDefault();const f=new FormData(e.target);S.events.push({id:uid(),title:f.get('title').trim(),date:f.get('date'),time:f.get('time'),type:f.get('type')});calSel(f.get('date'));done('Event added')}
function edel(id,btn){const old=S.events;S.events=old.filter(e=>e.id!==id);if(!save()){S.events=old;return}
/* subtle removal animation: fade + collapse the row, then repaint the panels */
const reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches,row=btn&&btn.closest?btn.closest('.row'):null;
if(row&&!reduce){try{row.style.setProperty('--rm-h',row.offsetHeight+'px')}catch(_){}
row.classList.add('row-removing');if(btn)btn.disabled=true;setTimeout(draw,340)}else draw()}
