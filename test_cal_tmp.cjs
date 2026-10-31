
const {JSDOM}=require('jsdom');const fs=require('fs');
const html='<!DOCTYPE html><html><body><div id="modal" class="modal" hidden><div class="sheet" id="sheet"></div></div><div id="toast"></div><main id="main"></main></body></html>';
const dom=new JSDOM(html,{runScripts:'outside-only',pretendToBeVisual:true});
const w=dom.window;
w.matchMedia=w.matchMedia||(()=>({matches:false}));
// define globals as window properties so every separate eval shares them
w.eval([
 "window.S={view:'calendar',settings:{name:'C',cur:'x'},videos:[],tasks:[],brands:[],events:[]};",
 "window.cal={y:2026,m:9,sel:'2026-10-31'};",
 "window.$=s=>document.querySelector(s);",
 "window.pad=n=>String(n).padStart(2,'0');",
 "window.uid=()=>Date.now()*10+Math.floor(Math.random()*10);",
 "window.esc=v=>String(v==null?'':v).replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]));",
 "window.iso=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());",
 "window.byDate=(a,b)=>(a.date+(a.time||'')).localeCompare(b.date+(b.time||''));",
 "window.fmt=d=>new Date(d+'T00:00').toLocaleDateString('en-IN',{day:'numeric',month:'short'});",
 "window.save=function(){return true};",
 "window.toast=function(m){window.__toasts=window.__toasts||[];window.__toasts.push(m)};",
 "window.ask=function(h){document.getElementById('sheet').innerHTML=h;document.getElementById('modal').hidden=false};",
 "window.shut=function(){document.getElementById('modal').hidden=true};",
 "window.enhanceSelects=function(){};",
 "window.V={};",
 "window.draw=function(){if(V[S.view])document.getElementById('main').innerHTML=V[S.view]()}"
].join('\n'));
w.eval(fs.readFileSync('/workspace/js/calendar.js','utf8'));
w.eval("for(let i=0;i<7;i++)S.events.push({id:1000+i,title:'Up '+i,date:'2026-11-'+pad(i+2),time:'',type:'other'});for(let i=0;i<6;i++)S.events.push({id:2000+i,title:'Today '+i,date:'2026-10-31',time:'',type:'video'})");
w.eval('draw()');
const doc=w.document;
const dow=doc.querySelectorAll('.dow span');
console.log('weekday spans:',dow.length,'|',[...dow].map(s=>s.textContent).join(','));
const lists=doc.querySelectorAll('.cal aside .cal-list');
console.log('aside lists:',lists.length);
lists.forEach((l,i)=>{
  const rows=l.querySelectorAll('.row').length;
  const more=l.querySelector('.cal-more');
  console.log('list '+i+': rows='+rows+' more='+(more?more.textContent:'none'));
});
const btn=doc.getElementById('calAddEventBtn');
console.log('add btn exists:',!!btn,'inline onclick attr:',JSON.stringify(btn.getAttribute('onclick')));
btn.dispatchEvent(new w.MouseEvent('click',{bubbles:true,cancelable:true}));
console.log('modal open after click:',!doc.getElementById('modal').hidden);
console.log('sheet has Add event form:',/Add event/.test(doc.getElementById('sheet').innerHTML));
console.log('toasts:',w.__toasts||[]);
btn.dispatchEvent(new w.MouseEvent('click',{bubbles:true,cancelable:true}));
console.log('modal still open after 2nd click:',!doc.getElementById('modal').hidden);
const before=w.eval('S.events.length');
w.eval('edel(2000,null)');
console.log('events after delete:',w.eval('S.events.length'),'(was',before+')');
// calPanels runs without layout in jsdom but must not throw
w.eval('calPanels(); "ok"');
console.log('calPanels did not throw');
