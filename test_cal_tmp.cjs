const {JSDOM}=require('jsdom');const fs=require('fs');
const html='<!DOCTYPE html><html><body><div id="modal" class="modal" hidden><div class="sheet" id="sheet"></div></div><div id="toast"></div><main id="main"></main></body></html>';
const dom=new JSDOM(html,{runScripts:'outside-only',pretendToBeVisual:true});
const w=dom.window;
w.matchMedia=w.matchMedia||(()=>({matches:false}));
w.eval([
 "window.S={view:'calendar',settings:{name:'C',cur:'x'},videos:[],tasks:[],brands:[],events:[]};",
 "window.cal={y:2026,m:9,sel:'2026-10-31'};",
 "window.$=s=>document.querySelector(s);",
 "window.pad=n=>String(n).padStart(2,'0');",
 "window.uid=()=>Date.now()*10+Math.floor(Math.random()*10);",
 "window.esc=v=>String(v==null?'':v).replace(/[&<>\\\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]));",
 "window.iso=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());",
 "window.byDate=(a,b)=>(a.date+(a.time||'')).localeCompare(b.date+(b.time||''));",
 "window.fmt=d=>new Date(d+'T00:00').toLocaleDateString('en-IN',{day:'numeric',month:'short'});",
 "window.save=function(){return true};",
 "window.toast=function(m){window.__toasts=window.__toasts||[];window.__toasts.push(m)};",
 "window.ask=function(h){document.getElementById('sheet').innerHTML=h;document.getElementById('modal').hidden=false};",
 "window.shut=function(){document.getElementById('modal').hidden=true};",
 "window.enhanceSelects=function(){};",
 "window.V={};",
 "window.draw=function(){if(V[S.view])document.getElementById('main').innerHTML=V[S.view]()}",
 "window.done=function(m){if(save()){shut();draw();m&&toast(m)}}"
].join('\n'));
w.eval('var _calSrc='+JSON.stringify(fs.readFileSync('/workspace/js/calendar.js','utf8'))+';(0,eval)(_calSrc);window.esave=esave;window.em=em;');
w.eval("for(let i=0;i<7;i++)S.events.push({id:1000+i,title:'Up '+i,date:'2026-11-'+pad(i+2),time:'',type:'other'});for(let i=0;i<6;i++)S.events.push({id:2000+i,title:'Today '+i,date:'2026-10-31',time:'',type:'video'})");
w.eval('draw()');
const doc=w.document;
let ok=true;const chk=(name,cond)=>{console.log((cond?'PASS':'FAIL')+' - '+name);if(!cond)ok=false};
chk('weekday labels exactly 7 (once each)',doc.querySelectorAll('.dow span').length===7);
const btn=doc.querySelector('#calAddEventBtn');
chk('add-event button rendered',!!btn);
chk('button has inline onclick calAddEvent',/calAddEvent\(event\)/.test(btn.getAttribute('onclick')||''));
btn.click();
chk('modal opened after click',doc.getElementById('modal').hidden===false);
chk('title input present',!!doc.querySelector('#sheet input[name="title"]'));
chk('date input prefilled',doc.querySelector('#sheet input[name="date"]').value==='2026-10-31');
chk('veil animation stripped',doc.getElementById('modal').style.animation==='none');
chk('veil z-index forced',doc.getElementById('modal').style.zIndex==='2147483000');
// fill form and submit properly
doc.querySelector('#sheet input[name="title"]').value='Test event';
w.eval("esave({preventDefault:function(){},target:document.querySelector('#sheet form')})");
chk('event saved via esave',w.S.events.some(e=>e.title==='Test event'));
chk('modal closed after save',doc.getElementById('modal').hidden===true);
const upRows=doc.querySelectorAll('.cal-up-panel .cal-list > .row').length;
chk('coming up capped at 4 rows',upRows===4);
chk('coming up shows +N more',!!doc.querySelector('.cal-up-panel .cal-more'));
const dayRows=doc.querySelectorAll('.cal-day-panel .cal-list > .row').length;
chk('today panel rows <=4',dayRows<=4&&dayRows>=1);
// second open works (no double-open guard blocking)
doc.querySelector('#calAddEventBtn').click();
chk('second open works',doc.getElementById('modal').hidden===false);
console.log(ok?'ALL GOOD':'SOME FAILED');process.exit(ok?0:1);
