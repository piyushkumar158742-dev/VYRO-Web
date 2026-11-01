const {JSDOM}=require('jsdom');
const fs=require('fs'),path=require('path');
let html=fs.readFileSync('index.html','utf8')
  .replace(/<script src="https:\/\/[^"]*"[^>]*><\/script>/g,'')
  .replace(/<link[^>]*>/g,'');
html=html.replace(/<script src="(js\/[^"?]+)(\?v=\d+)?" defer><\/script>/g,(m,p)=>'<script>'+fs.readFileSync(p,'utf8')+'</scr'+'ipt>');
const dom=new JSDOM(html,{url:'http://localhost/',runScripts:'dangerously',
  resources:{fetch(url){
    const p=url.replace('http://localhost/','').split('?')[0];
    if(p.startsWith('js/')||p.startsWith('css/')){
      try{return Promise.resolve(fs.readFileSync(path.join('/workspace',p)))}catch(_){return null}
    }
    return Promise.reject(new Error('skip'));
  }},pretendToBeVisual:true});
setTimeout(()=>{
const w=dom.window,d=w.document;
let fails=0;const alerts=[];w.alert=m=>alerts.push(String(m));
function check(name,cond){console.log((cond?'PASS':'FAIL')+' - '+name);if(!cond)fails++}

check('scripts loaded (V present)',typeof w.V==='object'&&!!w.V.calendar);
w.go('calendar');
check('calendar renders',!!d.querySelector('.cal'));
const addBtn=d.getElementById('calAddEventBtn');
check('add-event button exists',!!addBtn);
addBtn.click();
check('modal opens after click',!d.getElementById('modal').hidden);
check('title input present',!!d.querySelector('#sheet input[name="title"]'));
check('custom dropdown built in sheet',!!d.querySelector('#sheet .vd-trigger'));
const form=d.querySelector('#sheet form');
form.querySelector('input[name="title"]').value='Sim event';
const before=w.S.events.length;
form.dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
check('event saved & modal closed',w.S.events.length===before+1&&d.getElementById('modal').hidden);
check('no alerts during add-event flow',alerts.length===0);

w.go('tasks');
const tmBtn=[...d.querySelectorAll('button')].find(b=>/Add task/.test(b.textContent));
check('task add button exists',!!tmBtn);
tmBtn.click();
check('task modal opens',!d.getElementById('modal').hidden&&/Add task/.test(d.querySelector('#sheet h3').textContent));
check('task priority dropdown customised',!!d.querySelector('#sheet .vd-trigger'));
const tform=d.querySelector('#sheet form');
tform.querySelector('input[name="title"]').value='Sim task';
const tb=w.S.tasks.length;
tform.dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
check('task saved',w.S.tasks.length===tb+1);

w.go('brands');
const bmBtn=[...d.querySelectorAll('button,.deal.add')].find(b=>/Add a deal|Add deal/.test(b.textContent));
check('deal add button exists',!!bmBtn);
bmBtn.click();
check('deal modal opens',!d.getElementById('modal').hidden&&/Add deal/.test(d.querySelector('#sheet h3').textContent));
const bform=d.querySelector('#sheet form');
bform.querySelector('input[name="name"]').value='SimBrand';
const bb=w.S.brands.length;
bform.dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
check('deal saved',w.S.brands.length===bb+1);

w.vm();
check('video modal opens',!d.getElementById('modal').hidden&&/New video/.test(d.querySelector('#sheet h3').textContent));
w.shut();

w.go('calendar');
d.getElementById('calAddEventBtn').click();
const ok1=!d.getElementById('modal').hidden;
setTimeout(()=>{
  d.getElementById('calAddEventBtn').click();
  check('repeated clicks keep sheet open',ok1&&!d.getElementById('modal').hidden);
  const wd=[...d.querySelectorAll('.cal-weekday span')].map(s=>s.textContent.trim()).join(',');
  check('weekdays exactly 7 unique',[...new Set(wd.split(','))].length===7&&wd.split(',').length===7);
  console.log('ALERTS:',alerts.length?alerts.join('|'):'none');
  process.exit(fails?1:0);
},450);
},2500);
