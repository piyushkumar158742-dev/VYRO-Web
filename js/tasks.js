'use strict';
let taskAnimation=null;
V.tasks=()=>{
 const pending=S.tasks.filter(x=>!x.completed);
 const completed=S.tasks.filter(x=>x.completed);
 const list=(items,kind)=>`<section class="panel task-panel task-panel-${kind}"><header><div><h3><span class="task-heading-icon" aria-hidden="true">${kind==='pending'?'◷':'✓'}</span>${kind==='pending'?'Up next':'Completed'} <span class="task-count">${items.length}</span></h3></div>${kind==='pending'?'<button class="btn ghost task-add-small" onclick="tm()">+ Add task</button>':''}</header><div class="task-list">${items.map((x,index)=>`<div class="row task-row ${x.completed?'done task-completed':''} ${taskAnimation?.id===x.id?'task-animate-'+taskAnimation.direction:''}" style="--task-delay:${Math.min(index,7)*35}ms"><button class="chk ${x.completed?'on':''}" onclick="tk(${x.id})" aria-label="Mark ${x.completed?'not done':'done'}" aria-pressed="${x.completed}"><span>${x.completed?'✓':''}</span></button><div class="task-copy"><strong>${esc(x.title)}</strong></div><span class="tag ${x.priority}">${x.priority}</span><button class="btn del task-delete" onclick="tdel(${x.id})" aria-label="Delete task">✕</button></div>`).join('')|| (kind==='pending'?`<div class="task-empty"><h4>You’re all caught up</h4></div>`:`<div class="task-empty task-empty-quiet"><span>Completed tasks will show up here.</span></div>` )}</div></section>`;
 return `<div class="tasks-page"><div class="tasks-columns">${list(pending,'pending')}${list(completed,'completed')}</div></div>`;
};
function tm(){ask(`<div class="form-heading"><span class="form-mark">✓</span><div><span class="form-eyebrow">STAY ON TRACK</span><h3>Add task</h3><p>Make the next step clear and manageable.</p></div></div><form class="f standard-form" onsubmit="tsave(event)"><label>Task<input name="title" required maxlength="100" placeholder="What needs to get done?"></label><label>Priority<select name="priority"><option value="high">High</option><option value="medium" selected>Medium</option><option value="low">Low</option></select></label><div class="acts"><button type="button" class="btn ghost" onclick="shut()">Cancel</button><button class="btn">Add task</button></div></form>`)}
function tsave(e){e.preventDefault();const f=new FormData(e.target);S.tasks.push({id:uid(),title:f.get('title').trim(),completed:false,priority:f.get('priority')});done('Task added')}
let taskTransitionBusy=false;
function tk(id){
 if(taskTransitionBusy)return;
 const task=S.tasks.find(x=>x.id===id);if(!task)return;
 const previous=!!task.completed,next=!previous;
 const row=[...document.querySelectorAll('.task-row')].find(el=>el.querySelector('.chk')?.getAttribute('onclick')===`tk(${id})`);
 if(!row){task.completed=next;if(save())draw();else task.completed=previous;return}
 taskTransitionBusy=true;
 row.classList.remove('task-animate-complete','task-animate-reopen');
 void row.offsetWidth;
 row.classList.add(next?'task-animate-complete':'task-animate-reopen');
 const check=row.querySelector('.chk');
 if(check){check.classList.toggle('on',next);check.setAttribute('aria-pressed',String(next));check.setAttribute('aria-label',next?'Mark not done':'Mark done');const mark=check.querySelector('span');if(mark)mark.textContent=next?'✓':''}
 const duration=next?430:390;
 setTimeout(()=>{
   task.completed=next;
   taskAnimation=null;
   if(!save())task.completed=previous;
   taskTransitionBusy=false;
   draw();
 },duration);
}
function tdel(id){const old=S.tasks;S.tasks=old.filter(x=>x.id!==id);if(!save()){S.tasks=old;return}draw()}
