const {JSDOM}=require('jsdom');
const fs=require('fs');
const html='<!doctype html><html><body><div id="clock"></div><main id="main"></main><h1 id="title"></h1><div id="modal" hidden><div id="sheet"></div></div><div id="toast"></div></body></html>';
const dom=new JSDOM(html,{url:'http://localhost',runScripts:'dangerously'});
const w=dom.window;
w.matchMedia=w.matchMedia||(q=>({matches:false,addListener(){},removeListener(){}}));
// load local scripts as real <script> tags so they share the browser's global lexical scope
for(const f of ['js/app.js','js/dashboard.js','js/videos.js','js/tasks.js','js/brands.js','js/calendar.js','js/settings.js','js/admin.js','js/theme.js','js/navigation.js']){
  const s=w.document.createElement('script');
  s.textContent=fs.readFileSync(f,'utf8');
  try{ w.document.body.appendChild(s); }catch(e){ console.log('LOAD ERROR in '+f+': '+e.message); }
}
console.log('typeof vdSeq (in-page): '+w.eval('typeof vdSeq'));
try{ w.eval("S.view='calendar';draw();"); console.log('calendar drawn OK'); }catch(e){ console.log('draw error: '+e.message); }
const btn=w.document.getElementById('calAddEventBtn');
console.log('button exists: '+!!btn);
let alertMsg=null; w.alert=m=>{alertMsg=m};
try{ btn.click(); }catch(e){ console.log('click threw: '+e.message); }
console.log('alert: '+alertMsg);
const modal=w.document.getElementById('modal');
console.log('modal hidden after click: '+modal.hidden);
console.log('title input: '+!!modal.querySelector('#sheet input[name=title]'));
console.log('custom dropdown rendered: '+!!modal.querySelector('#sheet .vd-trigger'));
const ti=modal.querySelector('#sheet input[name=title]'); if(ti) ti.value='Test event';
const sel=modal.querySelector('select[name=type]'); if(sel) sel.value='video';
modal.querySelector('form').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
const evts=w.eval('S.events').filter(e=>e.title==='Test event');
console.log('event saved: '+(evts.length===1)+' '+JSON.stringify(evts[0]));
console.log('modal closed after save: '+modal.hidden);
