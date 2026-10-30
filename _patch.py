def edit(path, pairs):
    s = open(path, encoding='utf-8').read()
    for old, new in pairs:
        assert old in s, (path, old[:70])
        s = s.replace(old, new, 1)
    open(path, 'w', encoding='utf-8').write(s)
    print('patched', path)

# ---------------- js/dashboard.js ----------------
edit('js/dashboard.js', [
 ("V.home=()=>{const{videos:v,brands:b,tasks}=S;",
  "V.home=()=>{const{videos:v,brands:b,tasks}=S,yt=!!S.settings.youtubeChannel,ch=S.settings.youtubeChannel;\n"
  " const num=n=>Number(n||0).toLocaleString('en-IN');\n"
  " const connectCue='<button type=\"button\" class=\"strip-note-link\" onclick=\"go(\\'settings\\')\" title=\"Open Settings and connect your YouTube channel\"><i aria-hidden=\"true\"></i>Connect YouTube</button>';"),
 ("<div><b>${S.settings.youtubeChannel?.subscribers==null?'—':Number(S.settings.youtubeChannel.subscribers).toLocaleString('en-IN')}</b>",
  "<div class=\"${yt?'':'is-muted'}\"><b>${yt?(ch.subscribers==null?'Hidden':num(ch.subscribers)):'—'}</b>"),
 ("${S.settings.youtubeChannel?'YouTube channel':'Connect YouTube to sync'}", "${yt?'YouTube channel':connectCue}"),
 ("<div><b>${S.settings.youtubeChannel?Number(S.settings.youtubeChannel.views||0).toLocaleString('en-IN'):'—'}</b>",
  "<div class=\"${yt?'':'is-muted'}\"><b>${yt?num(ch.views):'—'}</b>"),
 ("${S.settings.youtubeChannel?'Across your channel':'Connect YouTube to sync'}", "${yt?'Across your channel':connectCue}"),
 ("<div><b>${b.length}</b><span>Brands</span></div>",
  "<div><b>${b.length}</b><span>Brand deals</span><small class=\"stat-note\" style=\"display:block\">${b.length===1?'deal in progress':b.length+' deals in progress'}</small></div>"),
 ("<div><b>${v.length}</b><span>Videos</span></div>",
  "<div><b>${v.length}</b><span>Videos</span><small class=\"stat-note\" style=\"display:block\">${v.length===1?'project in pipeline':'projects in pipeline'}</small></div>"),
 ("""'<div class="empty">No tasks yet. Add your first task.</div>'""",
  """'<div class="empty v-empty"><span class="v-empty-ico" aria-hidden="true">✓</span><h4 class="v-empty-title">No tasks yet</h4><p class="v-empty-sub">Capture the next step — scripting, recording, or an edit note — so nothing slips.</p><div class="v-empty-actions"><button class="btn" onclick="tm()">Add your first task</button></div></div>'"""),
 # timeline guide line aligned with the existing .head marker
 ('.tl-in>.tl-guide{position:absolute;top:8px;bottom:8px;width:2px;background:var(--flag);left:calc(64px + 16px + (100% - 96px) * 2.5 / 14);pointer-events:none}',
  '.tl-in>.tl-guide,.tl-in>u.head{position:absolute;top:8px;bottom:8px;width:1.5px;margin-left:-.75px;border-radius:2px;pointer-events:none;z-index:0;background:linear-gradient(180deg,color-mix(in srgb,var(--ink) 30%,transparent),color-mix(in srgb,var(--ink) 5%,transparent))}\n.tl-in>.tl-guide{left:calc(64px + 16px + (100% - 96px) * 2.5 / 14)}'),
 ('<u class="head"></u>', '<span class="tl-guide" aria-hidden="true"></span>'),
 # clips become real buttons with a hover cue
 ('return`<button class="clip ${k}" style="grid-column:${i+1}/span ${Math.min(3,14-i)}" onclick="calSel(\''+e.date+'\');go(\'calendar\')"',
  'return`<button type="button" class="clip ${k}" style="grid-column:${i+1}/span ${Math.min(3,14-i)}" title="${esc(e.title)} · open in schedule" onclick="calSel(\''+e.date+'\');go(\'calendar\')"'),
])

# ---------------- js/tasks.js ----------------
edit('js/tasks.js', [
 ('class="panel task-panel task-panel-${kind}"',
  "class=\"panel task-panel task-panel-${kind}${kind==='completed'?' task-panel-done':''}\""),
 ("""'<div class="task-empty"><h4>You’re all caught up</h4></div>'""",
  """'<div class="task-empty v-empty"><span class="v-empty-ico" aria-hidden="true">✓</span><h4 class="v-empty-title">You’re all caught up</h4><p class="v-empty-sub">Every task is done. Add your next step to keep momentum going.</p><div class="v-empty-actions"><button class="btn" onclick="tm()">Add a task</button></div></div>'"""),
 ("""'<div class="task-empty task-empty-quiet"><span>Completed tasks will show up here.</span></div>'""",
  """'<div class="task-empty task-empty-quiet v-empty"><span class="v-empty-ico" aria-hidden="true">☰</span><h4 class="v-empty-title">No completed tasks yet</h4><span class="v-empty-sub">Tick a task off and it will land here as proof of progress.</span></div>'"""),
])

# ---------------- js/videos.js ----------------
edit('js/videos.js', [
 ('V.videos=()=>`<div class="video-library">',
  'V.videos=()=>`${S.videos.length?\'\':\'<div class="panel"><div class="empty v-empty"><span class="v-empty-ico" aria-hidden="true">✳</span><h4 class="v-empty-title">Your pipeline is empty</h4><p class="v-empty-sub">Every series starts with one idea. Capture yours — title, stage, and notes — and track it from concept to upload.</p><div class="v-empty-actions"><button class="btn" onclick="vm()">Create your first video</button></div></div></div>\'}<div class="video-library">'),
])

# ---------------- js/brands.js ----------------
edit('js/brands.js', [
 ("'use strict';\nconst DS=",
  "'use strict';\nconst fmtDate=v=>{const d=new Date(v||Date.now());return isNaN(d)?'recently':new Intl.DateTimeFormat('en-IN',{day:'numeric',month:'short'}).format(d)};\nconst DS="),
 ('V.brands=()=>`<div class="deals">${S.brands.map(',
  'V.brands=()=>`<div class="deals">${S.brands.length?\'\':\'<div class="panel deal-empty-wrap" style="grid-column:1/-1"><div class="empty v-empty"><span class="v-empty-ico" aria-hidden="true">◈</span><h4 class="v-empty-title">No partnerships yet</h4><p class="v-empty-sub">Track brand deals in one place — stage, value, and contact, from first pitch to payment.</p><div class="v-empty-actions"><button class="btn" onclick="bm()">Add your first deal</button></div></div></div>\'}${S.brands.map('),
 ("""${b.email?`<a class="btn ghost" href="mailto:${esc(b.email)}">Email</a>`:''}</div></article>""",
  """${b.email?`<a class="btn ghost" href="mailto:${esc(b.email)}">Email</a>`:''}</div><footer><small>Added ${fmtDate(b.created)}</small>${b.email?`<a class="deal-mail" href="mailto:${esc(b.email)}" title="Email ${esc(b.email)}">${esc(b.email)} ↗</a>`:'<small>Contact not saved</small>'}</footer></article>"""),
])

# ---------------- js/calendar.js ----------------
edit('js/calendar.js', [
 ('return`<div class="cal">',
  'const evEmpty=(t,p,a)=>`<div class="empty v-empty"><span class="v-empty-ico" aria-hidden="true">✦</span><h4 class="v-empty-title">${t}</h4><p class="v-empty-sub">${p}</p>${a?`<div class="v-empty-actions">${a}</div>`:``}</div>`;\nreturn`<div class="cal">'),
 ("""'<div class="empty">Nothing planned for this day.</div>'""",
  """evEmpty('Nothing planned for this day','Uploads, calls, and deadlines you add will appear here.',`<button class="btn ghost" onclick="em()">Add event on this day</button>`)"""),
 ("""'<div class="empty">No upcoming events.</div>'""",
  """evEmpty('No upcoming events','Your days ahead are clear. Schedule something to keep the streak going.',`<button class="btn ghost" onclick="em()">Add event</button>`)"""),
])

# ---------------- css/redesign.css tweaks ----------------
edit('css/redesign.css', [
 ('.tl-head i.now b{box-shadow:0 0 0 4px color-mix(in srgb,var(--ink) 8%,transparent)}\n.tl-in{position:relative}\n.tl-in>.tl-guide{\n  position:absolute;z-index:0;top:8px;bottom:8px;width:1.5px;margin-left:-0.75px;pointer-events:none;\n  background:linear-gradient(180deg,color-mix(in srgb,var(--ink) 26%,transparent),color-mix(in srgb,var(--ink) 6%,transparent));\n  border-radius:2px;\n}\n.tl-in>*{position:relative}\n.tl-head,.tl-row,.tl-in>.tl-guide{z-index:1}\n',
  ''),
 ('.cal .dow span{font-size:0;line-height:1;padding:12px 0 10px}\n.cal .dow span:before{font-size:10.5px;font-weight:700;letter-spacing:.08em;color:var(--mut)}\n.cal .dow span:nth-child(1):before{content:"SUN"}.cal .dow span:nth-child(2):before{content:"MON"}\n.cal .dow span:nth-child(3):before{content:"TUE"}.cal .dow span:nth-child(4):before{content:"WED"}\n.cal .dow span:nth-child(5):before{content:"THU"}.cal .dow span:nth-child(6):before{content:"FRI"}\n.cal .dow span:nth-child(7):before{content:"SAT"}\n@media(max-width:600px){\n  .cal .dow span:before{font-size:9.5px;letter-spacing:.02em}\n  .cal .dow span:nth-child(1):before{content:"S"}.cal .dow span:nth-child(2):before{content:"M"}\n  .cal .dow span:nth-child(3):before{content:"T"}.cal .dow span:nth-child(4):before{content:"W"}\n  .cal .dow span:nth-child(5):before{content:"T"}.cal .dow span:nth-child(6):before{content:"F"}\n  .cal .dow span:nth-child(7):before{content:"S"}\n}\n',
  '.cal .dow span{text-align:center;font-size:11px;font-weight:750;letter-spacing:.06em;color:var(--mut);padding:12px 0 10px;text-transform:uppercase}\n'),
])

# ---------------- index.html cache busting ----------------
edit('index.html', [
 ('js/dashboard.js?v=27', 'js/dashboard.js?v=28'),
 ('js/videos.js?v=32', 'js/videos.js?v=33'),
 ('js/tasks.js?v=33', 'js/tasks.js?v=34'),
 ('js/brands.js?v=28', 'js/brands.js?v=29'),
 ('js/calendar.js?v=28', 'js/calendar.js?v=29'),
 ('css/redesign.css?v=1', 'css/redesign.css?v=2'),
])
print('ALL OK')
