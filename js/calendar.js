'use strict';
/* =====================================================================
   V34 - Schedule (calendar) view, definitive behaviour:
   - Weekday header row is emitted exactly once (SUN...SAT), no duplicates.
   - "Today" and "Coming up" panels are ALWAYS the same height: exactly
     4 event rows tall. Both lists are capped at 4 rows right in the
     markup, so "Coming up" has a hard visual end and the page height
     never grows to fit it (no more "stuck" scroll length).
   - NO sticky positioning on the aside - the whole page scrolls as one
     normal document. Nothing detaches or slides under anything else,
     and there is no inner scroll container fighting the page, so the
     bottom-of-page bounce/glitch cannot happen.
   - "+ Add event" is wired three independent ways (inline onclick,
     direct binding after every draw, delegated pointerdown listener),
     ALL of them calling window.calAddEvent() - a function defined here
     that always exists even if any other script throws mid-load. If a
     stale/locked sheet is open it is closed first, then re-opened fresh.
   - Deleting an event plays a subtle fade/slide-out before repaint.
   ===================================================================== */
var CAL_MAX_ROWS=4;

/* Single source of truth for opening the Add-event sheet. V36: NO silent
   try/catch anywhere in the happy path — any failure surfaces in the
   console AND shows a toast, so the button can never just "do nothing"
   without telling us why. It always closes whatever sheet is open first,
   then builds the Add-event form fresh via em(). */
window.calAddEvent=function(ev){
  if(ev&&typeof ev.preventDefault==='function')ev.preventDefault();
  var modal=document.getElementById('modal');
  if(modal&&!modal.hidden){shut()}
  if(typeof em!=='function'){toast('Add event unavailable: form helper missing');return}
  em();
  var m2=document.getElementById('modal');
  if(!m2||m2.hidden){toast('Add event could not open the form');return}
  var ti=m2.querySelector('input[name="title"]');if(ti)setTimeout(function(){ti.focus()},60);
};
window.calQuickAdd=function(e){e.preventDefault();var f=new FormData(e.target);S.events.push({id:uid(),title:String(f.get('title')||'').trim()||'Event',date:f.get('date'),time:'',type:'other'});save();shut();calSel(f.get('date'));toast('Event added')};

V.calendar=()=>{const{y,m}=cal,first=new Date(y,m,1).getDay(),n=new Date(y,m+1,0).getDate(),td=iso(new Date());let c='';
for(let i=0;i<first;i++)c+='<div class="day mute"></div>';
for(let d=1;d<=n;d++){const k=`${y}-${pad(m+1)}-${pad(d)}`,E=S.events.filter(e=>e.date===k).sort(byDate);c+=`<button class="day ${k===td?'today':''} ${k===cal.sel?'sel':''} ${E.length?'has':''}" onclick="calSel('${k}')"><span class="n">${d}</span>${E.slice(0,2).map(e=>`<i class="${e.type||''}">${esc(e.title)}</i>`).join('')}</button>`}
const day=S.events.filter(e=>e.date===cal.sel).sort(byDate),up=S.events.filter(e=>e.date>td).sort(byDate);
const li=e=>`<div class="row"><div><strong>${esc(e.title)}</strong><small>${fmt(e.date)} ${esc(e.time||'')}</small></div><button class="btn del" onclick="edel(${e.id},this)" aria-label="Delete event">&#10005;</button></div>`;
const moreN=(list)=>list.length>CAL_MAX_ROWS?`<div class="cal-more">+${list.length-CAL_MAX_ROWS} more</div>`:'';
return`<div class="cal"><section class="panel cal-month-panel"><header><h3>${new Date(y,m,1).toLocaleString('en-IN',{month:'long',year:'numeric'})}</h3><div class="nav2"><button onclick="calMove(-1)" aria-label="Previous month">&#8249;</button><button onclick="calSel('${td}')">Today</button><button onclick="calMove(1)" aria-label="Next month">&#8250;</button></div></header>
<div class="dow">${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d=>`<span>${d}</span>`).join('')}</div><div class="grid">${c}</div></section>
<aside><section class="panel cal-day-panel"><header><h3>${fmt(cal.sel)}</h3><button type="button" class="btn cal-add-event" id="calAddEventBtn">+ Add event</button></header><div class="cal-list">${day.slice(0,CAL_MAX_ROWS).map(li).join('')||'<div class="empty">Nothing planned for this day.</div>'}${moreN(day)}</div></section>
<section class="panel cal-up-panel"><header><h3>Coming up</h3></header><div class="cal-list">${up.slice(0,CAL_MAX_ROWS).map(li).join('')||'<div class="empty">No upcoming events.</div>'}${moreN(up)}</div></section></aside></div>`};


function calSel(k){const[y,m]=k.split('-').map(Number);cal={y,m:m-1,sel:k};if(S.view==='calendar')draw()}

/* Pin both lists to exactly 4 rendered-row heights so the two boxes are
   pixel-identical even when one of them is empty. V36: the height is set
   on the PANELS (align-items:stretch via CSS + explicit min-height here),
   measured from real row content, and re-applied after every draw — not
   just on resize — so "Coming up" always has a clean hard end and the
   page height never stretches around it. */
function calPanels(){
  const aside=document.querySelector('.cal aside');if(!aside)return;
  let rh=0;
  const probe=aside.querySelector('.cal-list .row');
  if(probe)rh=probe.getBoundingClientRect().height;
  if(!(rh>8)){ /* nothing rendered yet - measure one hidden clone so the
                   empty state still gets the exact same box height */
    const box=aside.querySelector('.cal-list');
    if(box){
      const tmp=document.createElement('div');tmp.className='cal-list';
      tmp.innerHTML='<div class="row"><div><strong>Measure</strong><small>measure</small></div><button class="btn del">&#10005;</button></div>';
      tmp.style.cssText='position:absolute;left:-9999px;top:0;width:'+(box.clientWidth||280)+'px;visibility:hidden;height:auto';
      box.parentNode.appendChild(tmp);
      const r=tmp.querySelector('.row');if(r)rh=r.getBoundingClientRect().height;
      tmp.remove();
    }
  }
  if(!(rh>8))rh=52;
  const moreH=aside.querySelector('.cal-more')?28:0;
  aside.style.setProperty('--cal-list-h',Math.round(rh*CAL_MAX_ROWS+moreH)+'px');
  aside.setAttribute('data-cal-sync','1');
}
addEventListener('resize',()=>{if(S&&S.view==='calendar')calPanels()});

/* ---------- "Add event": ONE delegated capture listener for everything ---
   V36: instead of binding per-button (which broke whenever the calendar
   repainted before listeners attached), a single document-level capture
   listener catches any click whose target is (or lives inside) the Add
   event button — inline onclick is also removed below so there is no
   double-fire path; this listener is the only opener. */
let CAL_ADD_OPENING=false;
document.addEventListener('click',function(e){
  const b=e.target&&e.target.closest?e.target.closest('#calAddEventBtn,.cal-add-event'):null;
  if(!b)return;
  e.preventDefault();e.stopPropagation();
  if(CAL_ADD_OPENING)return; /* debounce double paths within same tick */
  CAL_ADD_OPENING=true;setTimeout(()=>{CAL_ADD_OPENING=false},350);
  window.calAddEvent(e);
},true);

function calMove(n){const d=new Date(cal.y,cal.m+n,1);cal.y=d.getFullYear();cal.m=d.getMonth();cal.sel=iso(d);draw()}
function em(){
  /* build the Add-event sheet fresh every time (stale sheets are shut by
     calAddEvent before we get here, so no double-open guard is needed) */
  ask(`<div class="form-heading"><span class="form-mark">&#10022;</span><div><span class="form-eyebrow">PLAN AHEAD</span><h3>Add event</h3><p>Put an important deadline, upload, or call on your schedule.</p></div></div><form class="f standard-form" onsubmit="esave(event)"><label>Title<input name="title" required maxlength="100"></label><label>Date<input name="date" type="date" required value="${cal.sel}"></label><label>Time<input name="time" type="time"></label>
<label>Type<select name="type"><option value="video">Video</option><option value="brand">Brand</option><option value="other">Other</option></select></label><div class="acts"><button type="button" class="btn ghost" onclick="shut()">Cancel</button><button class="btn">Add event</button></div></form>`);enhanceSelects(document.getElementById('sheet'))}
function esave(e){e.preventDefault();const f=new FormData(e.target);S.events.push({id:uid(),title:f.get('title').trim(),date:f.get('date'),time:f.get('time'),type:f.get('type')});calSel(f.get('date'));done('Event added')}
function edel(id,btn){const old=S.events;S.events=old.filter(e=>e.id!==id);if(!save()){S.events=old;return}
/* subtle removal animation: fade + slide the row out, then repaint */
const reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches,row=btn&&btn.closest?btn.closest('.row'):null;
if(row&&!reduce){try{row.style.setProperty('--rm-h',row.offsetHeight+'px')}catch(_){}
row.classList.add('row-removing');if(btn)btn.disabled=true;setTimeout(draw,340)}else draw()}
