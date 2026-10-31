'use strict';
const KEY='vyro_creator_os_state',DEFAULT_ST=['Idea','Script','Recording','Editing','Thumbnail','Published'];let ST=DEFAULT_ST.slice();const SC=['#98A2B3','#2F4BFF','#7A5AF8','#FFB020','#FF2D6F','#12B886'];
const GR=['linear-gradient(135deg,#2F4BFF,#7A5AF8)','linear-gradient(135deg,#FF2D6F,#FFB020)','linear-gradient(135deg,#12B886,#2F4BFF)','linear-gradient(135deg,#101828,#7A5AF8)'],EM=['🎬','🚀','🎥','⚡','🔥','💡','🎯','🧠'];
const TT={home:'Desk',videos:'Pipeline',tasks:'To-do',brands:'Deals',calendar:'Schedule',settings:'Settings'};
const $=s=>document.querySelector(s),pad=n=>String(n).padStart(2,'0'),uid=()=>Date.now()*10+Math.floor(Math.random()*10);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const iso=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const money=n=>S.settings.cur+Number(n||0).toLocaleString('en-IN');
const byDate=(a,b)=>(a.date+(a.time||'')).localeCompare(b.date+(b.time||''));
const fmt=d=>new Date(d+'T00:00').toLocaleDateString('en-IN',{day:'numeric',month:'short'});
function seed(){return{view:'home',settings:{name:'Creator',cur:'₹',pipelineStages:DEFAULT_ST.slice()},videos:[],tasks:[],brands:[],events:[]}}
function removeDemoData(state){
 const demoVideoTitles=new Set(['I Spent 50 Hours In VR','The Truth About Tech in 2026','My ₹10,000 Studio Tour']);
 const demoTaskTitles=new Set(['Review sponsor contract','Record B-roll for VR video','Send thumbnail drafts to designer']);
 const demoBrandNames=new Set(['TechCorp','VPN Secure','EnergyDrink']);
 const demoEventTitles=new Set(['Publish VR video','TechCorp sponsor call']);
 state.videos=(state.videos||[]).filter(v=>!demoVideoTitles.has(v.title));
 state.tasks=(state.tasks||[]).filter(t=>!demoTaskTitles.has(t.title));
 state.brands=(state.brands||[]).filter(b=>!demoBrandNames.has(b.name));
 state.events=(state.events||[]).filter(e=>!demoEventTitles.has(e.title));
 return state;
}
function cleanViews(value){const raw=String(value??'').trim();if(!raw||raw==='-')return '';if(/^\d+$/.test(raw))return raw;const m=raw.match(/^([\d.]+)\s*([KMB])$/i);if(m){const n=Number(m[1])*({K:1e3,M:1e6,B:1e9}[m[2].toUpperCase()]);return Number.isFinite(n)?String(Math.round(n)):''}return raw}
function formatViews(value){const n=Number(value);if(!Number.isFinite(n)||!value)return String(value||'');if(n>=1e9)return (n/1e9).toFixed(n>=1e10?0:1).replace(/\.0$/,'')+'B';if(n>=1e6)return (n/1e6).toFixed(n>=1e7?0:1).replace(/\.0$/,'')+'M';if(n>=1e4)return (n/1e3).toFixed(n>=1e5?0:1).replace(/\.0$/,'')+'K';return n.toLocaleString('en-IN')}
function load(){const s=seed();try{const o=JSON.parse(localStorage.getItem(KEY));if(!o){ST=DEFAULT_ST.slice();return s}ST=Array.isArray(o.settings?.pipelineStages)?o.settings.pipelineStages.filter(x=>typeof x==='string'&&x.trim()).map(x=>x.trim()).slice(0,12):DEFAULT_ST.slice();if(ST.length<2)ST=DEFAULT_ST.slice();
const n={...s,...o,settings:{...s.settings,...o.settings,name:o.settings?.name||o.settings?.creatorName||s.settings.name,pipelineStages:ST.slice()}};
n.view=TT[o.view]?o.view:'home';
n.videos=(n.videos||[]).map(v=>({...v,status:ST.includes(v.status)?v.status:ST[0],views:cleanViews(v.views)}));
n.brands=(n.brands||[]).map(b=>({...b,amount:Number(String(b.amount).replace(/[^0-9.]/g,''))||0}));
n.events=(n.events||[]).filter(e=>/^\d{4}-\d\d-\d\d$/.test(e.date||''));return removeDemoData(n)}catch(e){return s}}
let S=load(),cal=(d=>({y:d.getFullYear(),m:d.getMonth(),sel:iso(d)}))(new Date()),pend=null;
function save(){try{localStorage.setItem(KEY,JSON.stringify(S));if(window.VyroBackend?.queueSync)window.VyroBackend.queueSync(S);return true}catch(e){toast('Storage is full. Use a smaller thumbnail or export your data in Settings.');return false}}
function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove('on'),2800)}
function ask(h){$('#sheet').innerHTML=h;enhanceSelects($('#main'));enhanceSelects($('#sheet'));$('#modal').hidden=false;const fi=$('#sheet input:not([type=hidden]),#sheet .vd-trigger,#sheet textarea');fi&&fi.focus()}
function shut(){$('#modal').hidden=true;document.querySelectorAll('.vd-open').forEach(o=>o.classList.remove('vd-open'));pend=null}

/* ---------- Custom dropdowns: replace every native <select> app-wide ---------- */
var vdSeq=0;/* V39 FIX: was undeclared -> strict-mode ReferenceError "vdSeq is not
   defined" crashed ask() for EVERY sheet containing a <select> (Add event,
   New video, tasks...). Now initialised here so buildVd() can use it. */
function vdId(){vdSeq=(vdSeq||0)+1;return 'vd-'+vdSeq}
function buildVd(sel){
  if(sel.dataset.vd)return;
  sel.dataset.vd='1';
  const id=sel.id||vdId();sel.id=id;
  const w=document.createElement('div');w.className='vd';
  const t=document.createElement('button');t.type='button';t.className='vd-trigger';
  t.setAttribute('role','combobox');t.setAttribute('aria-haspopup','listbox');t.setAttribute('aria-expanded','false');
  t.setAttribute('aria-labelledby',(sel.closest('label')?sel.closest('label').firstChild.textContent.trim():'')+' '+id);
  const lb=document.createElement('span');lb.className='vd-label';
  const ic=document.createElement('span');ic.className='vd-ico';ic.setAttribute('aria-hidden','true');
  t.append(lb,ic);
  const p=document.createElement('div');p.className='vd-panel';p.setAttribute('role','listbox');
  const fill=()=>{
    p.innerHTML='';
    [...sel.options].forEach(o=>{
      const it=document.createElement('button');it.type='button';it.className='vd-opt';it.setAttribute('role','option');
      it.dataset.value=o.value;
      const dot=document.createElement('span');dot.className='vd-dot';
      const c=o.getAttribute('data-color')||(/^(high|medium|low)$/i.test(o.value)?{high:'#E5484D',medium:'#F0A93B',low:'#3B9EFF'}[o.value.toLowerCase()]:null)
        ||(typeof DS!=='undefined'&&DS[o.value]?DS[o.value]:null);
      if(c)dot.style.background=c;else dot.remove();
      it.append(dot,document.createTextNode(o.textContent));
      it.onclick=e=>{e.preventDefault();e.stopPropagation();sel.value=o.value;sel.dispatchEvent(new Event('change',{bubbles:true}));syncVd(sel);closeVd()};
      p.append(it);
    });
  };
  fill();
  sel._vdFill=fill;
  const sync=()=>{if(sel._vdFill)sel._vdFill();syncVd(sel)};
  sel.addEventListener('change',syncVd.bind(null,sel));
  sel.addEventListener('vd-refresh',sync);
  t.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();
    if(t.disabled)return;
    const open=w.classList.contains('vd-open');closeVd();
    if(!open){w.classList.add('vd-open');t.setAttribute('aria-expanded','true');syncVd(sel);fitVd(w,t,p)}});
  w.append(t,p);
  sel.parentNode.insertBefore(w,sel);
  sel.classList.add('vd-native');
  w._vd={sel,trigger:t,label:lb,panel:p};
  syncVd(sel);
}
function syncVd(sel){
  const w=sel.previousElementSibling;if(!w||!w._vd)return;
  const o=sel.options[sel.selectedIndex];
  w._vd.label.textContent=o?o.textContent:'';
  w._vd.trigger.disabled=!!sel.disabled;
  w.classList.toggle('vd-disabled',!!sel.disabled);
  w._vd.panel.querySelectorAll('.vd-opt').forEach(b=>b.classList.toggle('sel',b.dataset.value===(o?o.value:'')));
}
function closeVd(){document.querySelectorAll('.vd.vd-open').forEach(w=>{w.classList.remove('vd-open');w._vd&&w._vd.trigger.setAttribute('aria-expanded','false')})}
function fitVd(w,t,p){
  w.classList.remove('up');p.style.maxHeight='';
  const r=t.getBoundingClientRect(),vh=window.innerHeight;
  const roomB=vh-r.bottom-14,roomT=r.top-14;
  if(roomB<Math.min(250,p.scrollHeight+16)&&roomT>roomB){w.classList.add('up')}
  const room=w.classList.contains('up')?roomT:roomB;
  p.style.maxHeight=Math.max(150,Math.min(p.scrollHeight+10,room-10))+'px';
}
function enhanceSelects(root){(root||document).querySelectorAll('select:not([data-vd])').forEach(buildVd)}
document.addEventListener('click',closeVd);
window.addEventListener('resize',closeVd);
window.addEventListener('scroll',()=>{if(document.querySelector('.vd.vd-open'))closeVd()},true);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.querySelector('.vd.vd-open')){e.stopPropagation();closeVd()}},true);
const th=v=>v.thumb?'<div class="th th-has-upload"><img class="gt-uploaded-main" src="'+esc(v.thumb)+'" alt="'+esc(v.title||'Video thumbnail')+'"><div class="gt-uploaded-shade"></div><span class="gt-uploaded-title">'+esc(v.title||'Video thumbnail')+'</span></div>':`<div class="th"><div class="gt tone-${Math.abs(Number(v.id)||0)%4}"><span class="gt-kicker">VYRO / VIDEO</span><span class="gt-icon" aria-hidden="true">${EM[Math.abs(Number(v.id)||0)%8]}</span><span class="gt-title">${esc(v.title||'New video')}</span><span class="gt-index">${String(Math.abs(Number(v.id)||0)%99+1).padStart(2,'0')}</span></div></div>`;
const done=(fn)=>{if(!save())return;shut();draw();fn&&toast(fn)};
function confirmUI(title,message,action,onConfirm){const safe=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));ask('<div class="confirm-dialog"><div class="confirm-symbol">!</div><div class="confirm-copy"><span class="form-eyebrow">PLEASE CONFIRM</span><h3>'+safe(title)+'</h3><p>'+safe(message)+'</p></div><div class="confirm-actions"><button type="button" class="btn ghost" onclick="shut()">Cancel</button><button type="button" class="btn danger" id="confirm-action">'+safe(action)+'</button></div></div>');const b=document.querySelector('#confirm-action');if(b)b.onclick=()=>{shut();onConfirm()}}
const V={};


/* Temporary donation preview — replace with real payment details before launch. */
function openDonate(){
  const cells=[1,0,1,1,0,1,0,1,1,0,0,1,0,1,1,1,0,0,1,0,1,0,1,1,0,1,0,0,1,1,0,1,0,1,1,0,1,0,0,1,1,1,0,1,0,1,0,0,1,1,0,1,0,1,1,0,0,1,0,1,1,0,1,0,1,1,0,0,1,0,1,1,1,0,1,0,0,1,1,0,1,0,1,0,1,1,0,1,0,0,1,1,0,1,0,1,1,0,1,0,1,0,0,1];
  const pattern=cells.map((v,i)=>'<i class="'+(v?'dark':'')+'" style="grid-area:'+ (Math.floor(i/10)+1)+'/'+(i%10+1)+'"></i>').join('');
  ask('<div class="donate-modal"><div class="donate-head"><div class="donate-mark">♡</div><div><span class="form-eyebrow">SUPPORT THE PROJECT</span><h3>Support Creator OS</h3><p>If this workspace helps you create, you can support its development.</p></div><button type="button" class="donate-close" onclick="shut()" aria-label="Close donation popup">×</button></div><div class="donate-demo-note"><strong>Demo payment details</strong><span>This is a temporary mock-up. The QR is not scannable and the UPI ID is not real. Do not send money to these placeholders.</span></div><div class="donate-pay-card"><div class="donate-qr" aria-label="Non-functional demo QR code"><div class="donate-qr-pattern">'+pattern+'</div><div class="donate-qr-stamp">DEMO</div></div><div class="donate-pay-copy"><span class="donate-label">UPI ID · PLACEHOLDER</span><strong class="donate-upi">your-upi-id@replace</strong><p>Replace this with your real UPI ID later.</p></div></div><button type="button" class="btn donate-done" onclick="shut()">Got it</button><p class="donate-foot">Once you provide your QR code and UPI ID, these demo details can be replaced.</p></div>');
}
