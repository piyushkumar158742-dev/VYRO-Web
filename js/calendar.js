'use strict';
V.calendar=()=>{const{y,m}=cal,first=new Date(y,m,1).getDay(),n=new Date(y,m+1,0).getDate(),td=iso(new Date());let c='';
for(let i=0;i<first;i++)c+='<div class="day mute"></div>';
for(let d=1;d<=n;d++){const k=`${y}-${pad(m+1)}-${pad(d)}`,E=S.events.filter(e=>e.date===k).sort(byDate);c+=`<button class="day ${k===td?'today':''} ${k===cal.sel?'sel':''} ${E.length?'has':''}" onclick="calSel('${k}')"><span class="n">${d}</span>${E.slice(0,2).map(e=>`<i class="${e.type||''}">${esc(e.title)}</i>`).join('')}</button>`}
const day=S.events.filter(e=>e.date===cal.sel).sort(byDate),up=S.events.filter(e=>e.date>td).sort(byDate);
const li=e=>`<div class="row"><div><strong>${esc(e.title)}</strong><small>${fmt(e.date)} ${esc(e.time||'')}</small></div><button class="btn del" onclick="edel(${e.id},this)" aria-label="Delete event">✕</button></div>`;
return`<div class="cal"><section class="panel"><header><h3>${new Date(y,m,1).toLocaleString('en-IN',{month:'long',year:'numeric'})}</h3><div class="nav2"><button onclick="calMove(-1)" aria-label="Previous month">‹</button><button onclick="calSel('${td}')">Today</button><button onclick="calMove(1)" aria-label="Next month">›</button></div></header>
<div class="dow" aria-hidden="true">${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d=>`<span>${d}</span>`).join('')}</div><div class="grid">${c}</div></section>
<aside><section class="panel cal-day-panel"><header><h3>${fmt(cal.sel)}</h3><button class="lnk" onclick="em()">+ Add event</button></header><div class="cal-scroll">${day.map(li).join('')||'<div class="empty">Nothing planned for this day.</div>'}</div></section>
<section class="panel cal-up-panel"><header><h3>Coming up</h3></header><div class="cal-scroll">${up.map(li).join('')||'<div class="empty">No upcoming events.</div>'}</div></section></aside></div>`};
function calSel(k){const[y,m]=k.split('-').map(Number);cal={y,m:m-1,sel:k};if(S.view==='calendar')draw()}
/* Side panels are ALWAYS exactly four event rows tall (plus the header).
   Both boxes get the identical fixed height so they line up perfectly; any
   events beyond the fourth scroll inside the box — never the whole page. */
function calPanels(){try{
  const aside=document.querySelector('.cal aside');if(!aside)return;
  const P=[...aside.querySelectorAll('.panel')];if(!P.length)return;
  /* measure a single row once (rows are equal height by design) */
  let rh=52;
  const probe=aside.querySelector('.cal-scroll .row');
  if(probe){const h=probe.getBoundingClientRect().height;if(h>8)rh=h}
  else{/* no rows anywhere yet — build a temp probe row with the real panel markup */
    const tmp=document.createElement('div');tmp.className='cal';tmp.setAttribute('data-cal-sync','0');tmp.style.cssText='position:absolute;left:-9999px;top:0;width:'+Math.max(260,(P[0].getBoundingClientRect().width||300))+'px;visibility:hidden;height:auto;max-height:none';
    tmp.innerHTML='<section class="panel"><header><h3>.</h3></header><div class="cal-scroll"><div class="row"><div><strong>Probe row height</strong><small>probe probe</small></div><button class="btn del">✕</button></div></div></section>';
    document.body.appendChild(tmp);const r=tmp.querySelector('.row');if(r){const h=r.getBoundingClientRect().height;if(h>8)rh=h}
    tmp.remove();
  }
  const vh=window.innerHeight||document.documentElement.clientHeight||800;
  /* desktop: generous cap so 4 rows always fit even on short windows;
     mobile/tablet: keep the box inside the viewport */
  const wide=matchMedia('(min-width:1001px)').matches;
  const maxList=wide?Math.max(4*rh,vh-230):Math.max(2.4*rh,vh-330);
  const listH=Math.min(4*rh,maxList);
  aside.style.setProperty('--cal-list-h',Math.round(listH)+'px');
  aside.setAttribute('data-cal-sync','1');
}catch(_){}}
addEventListener('resize',()=>{if(S&&S.view==='calendar')calPanels()});

/* ---------- "Add event" robustness ---------- */
/* If the inline onclick ever fails to fire (stale cache, CSP, etc.), this
   document-level listener opens the sheet as a fallback. It bails out when
   #modal is already open, and em() itself guards against double-rendering,
   so the form can NEVER be created twice. */
document.addEventListener('click',e=>{
  try{
    const t=e.target,b=t&&t.closest?t.closest('.lnk'):null;
    if(!b||!/Add event/.test(b.textContent||''))return;
    const modal=document.getElementById('modal');
    if(modal&&!modal.hidden)return; /* inline handler already opened it */
    if(typeof em==='function'){e.preventDefault();em()}
  }catch(_){}},false);
function calMove(n){const d=new Date(cal.y,cal.m+n,1);cal.y=d.getFullYear();cal.m=d.getMonth();cal.sel=iso(d);draw()}
function em(){
  /* guard: never re-open the sheet if it is already showing the Add-event form */
  const modal=document.getElementById('modal'),sheet=document.getElementById('sheet');
  if(modal&&!modal.hidden&&sheet&&/PLAN AHEAD/.test(sheet.innerHTML))return;
  ask(`<div class="form-heading"><span class="form-mark">✦</span><div><span class="form-eyebrow">PLAN AHEAD</span><h3>Add event</h3><p>Put an important deadline, upload, or call on your schedule.</p></div></div><form class="f standard-form" onsubmit="esave(event)"><label>Title<input name="title" required maxlength="100"></label><label>Date<input name="date" type="date" required value="${cal.sel}"></label><label>Time<input name="time" type="time"></label>
<label>Type<select name="type"><option value="video">Video</option><option value="brand">Brand</option><option value="other">Other</option></select></label><div class="acts"><button type="button" class="btn ghost" onclick="shut()">Cancel</button><button class="btn">Add event</button></div></form>`)}
function esave(e){e.preventDefault();const f=new FormData(e.target);S.events.push({id:uid(),title:f.get('title').trim(),date:f.get('date'),time:f.get('time'),type:f.get('type')});calSel(f.get('date'));done('Event added')}
function edel(id,btn){const old=S.events;S.events=old.filter(e=>e.id!==id);if(!save()){S.events=old;return}
/* subtle removal animation: fade + collapse the row, then repaint the panels */
const reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches,row=btn&&btn.closest?btn.closest('.row'):null;
if(row&&!reduce){try{row.style.setProperty('--rm-h',row.offsetHeight+'px')}catch(_){}
row.classList.add('row-removing');if(btn)btn.disabled=true;setTimeout(draw,340)}else draw()}
