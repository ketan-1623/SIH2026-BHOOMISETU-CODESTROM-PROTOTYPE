/* BHOOMISETU V3 - safe local, stateful end-to-end demo */
const stages=[
 ['project','Project Identification','Create and register the proposed public project.'],['location','Land / Location Identification','Identify the proposed corridor/site and confirm the area.'],['survey','Preliminary Survey','Record initial field observations and feasibility notes.'],['measurement','Land Measurement & Mapping','Capture illustrative area and mapping details.'],['parcels','Land Parcel Identification','Create and identify affected land parcels.'],['owners','Landowner / Stakeholder Identification','Link demo owners and stakeholders to parcels.'],['documents','Document Verification','Verify sample ownership and supporting records.'],['assessment','Social / Environmental Assessment','Record illustrative assessment findings and mitigation notes.'],['notification','Acquisition Notification','Issue a demo notification after prerequisites are complete.'],['grievances','Objections / Grievances','Receive and resolve demo objections.'],['valuation','Valuation','Record an illustrative land valuation rate.'],['compensation','Compensation Calculation','Calculate illustrative compensation from parcel area and rate.'],['approval','Compensation Approval','Approve the illustrative compensation proposal.'],['award','Award','Generate the demo award record.'],['payment','Payment / Disbursement','Mark demo compensation as disbursed.'],['possession','Possession','Record possession after payment.'],['handover','Final Handover','Record final handover to the project authority.'],['completion','Project Completion','Close the demonstration project.']
];
const demo=()=>({project:{id:'PRJ-MP-001',name:'NH-47 Expansion Project',district:'Indore',purpose:'Road infrastructure',location:'Indore–Dewas corridor',area:12.6,created:false},survey:false,measurement:false,parcels:[],owners:[],documents:{ownership:false,map:false,identity:false},assessment:false,notification:false,grievances:[],rate:0,compensation:0,approval:false,award:false,payment:false,possession:false,handover:false,completed:false});
let state=loadState();
function clone(v){return JSON.parse(JSON.stringify(v));}
function projectSnapshot(){const copy=clone(state);delete copy.projects;delete copy.activeProjectId;return copy;}
function loadState(){
  try{
    const x=JSON.parse(localStorage.getItem('bhoomisetuV3'));
    if(x&&Array.isArray(x.projects)&&x.projects.length){
      const activeId=x.activeProjectId||x.projects[0].project.id;
      const active=x.projects.find(p=>p.project.id===activeId)||x.projects[0];
      const activeCopy=clone(active);
      activeCopy.projects=clone(x.projects);
      activeCopy.activeProjectId=active.project.id;
      return activeCopy;
    }
    if(x&&x.project){
      const snap=clone(x); delete snap.projects; delete snap.activeProjectId;
      return {...snap,projects:[snap],activeProjectId:snap.project.id};
    }
  }catch(e){}
  const first=demo(); first.project.created=true;
  return {...first,projects:[clone(first)],activeProjectId:first.project.id};
}
function syncActiveProject(){
  if(!Array.isArray(state.projects)) state.projects=[];
  const snap=projectSnapshot();
  const idx=state.projects.findIndex(p=>p.project.id===state.activeProjectId);
  if(idx>=0) state.projects[idx]=snap; else state.projects.push(snap);
}
function save(){syncActiveProject();localStorage.setItem('bhoomisetuV3',JSON.stringify({projects:state.projects,activeProjectId:state.activeProjectId}));renderAll()}
function activateProject(id){
  syncActiveProject();
  const found=state.projects.find(p=>p.project.id===id);
  if(!found)return showToast('Project record not found.');
  const collection=state.projects;
  state=clone(found); state.projects=collection; state.activeProjectId=id;
  localStorage.setItem('bhoomisetuV3',JSON.stringify({projects:state.projects,activeProjectId:id}));
  window.showAllStages=false; renderAll(); showPage('dashboard'); showToast(`${state.project.name} is now the active project.`);
}
function nextProjectId(){
  const nums=state.projects.map(p=>Number(String(p.project.id||'').match(/(\d+)$/)?.[1]||0));
  return 'PRJ-MP-'+String(Math.max(0,...nums)+1).padStart(3,'0');
}
function resetDemo(){
  const first=demo(); first.project.created=true;
  state={...first,projects:[clone(first)],activeProjectId:first.project.id};
  localStorage.setItem('bhoomisetuV3',JSON.stringify({projects:state.projects,activeProjectId:state.activeProjectId}));
  renderAll(); closeProfile(); showPage('dashboard'); showToast('Demo reset. One sample project is ready.');
}
function currentIndex(){for(let i=0;i<stages.length;i++){if(!isComplete(i))return i}return stages.length-1}
function isComplete(i){const id=stages[i][0];return ({project:state.project.created,location:state.project.locationConfirmed,survey:state.survey,measurement:state.measurement,parcels:state.parcels.length>0,owners:state.owners.length>0,documents:Object.values(state.documents).every(Boolean),assessment:state.assessment,notification:state.notification,grievances:state.grievances.some(g=>g.status==='Resolved')||state.grievances.length===0&&state.notification,valuation:state.rate>0,compensation:state.compensation>0,approval:state.approval,award:state.award,payment:state.payment,possession:state.possession,handover:state.handover,completion:state.completed})[id]===true}
function unlocked(i){return i<=currentIndex()}
function pct(){return Math.round(((currentIndex())/(stages.length-1))*100)}
function showPage(id,button=null){document.querySelectorAll('.page').forEach(p=>p.classList.remove('active-page'));const el=document.getElementById(id);if(!el)return;el.classList.add('active-page');document.querySelectorAll('.nav-item').forEach(b=>b.classList.remove('active'));if(button)button.classList.add('active');else document.querySelectorAll('.nav-item').forEach(b=>{if((b.getAttribute('onclick')||'').includes("'"+id+"'"))b.classList.add('active')});window.scrollTo({top:0,behavior:'smooth'});renderPage(id)}
function renderAll(){['dashboard','projects','land','workflow','landowners','documents','compensation','grievances','analytics','decision','important'].forEach(renderPage)}
function renderPage(id){const el=document.getElementById(id);if(!el)return;const ci=currentIndex();
if(id==='dashboard')el.innerHTML=dashboardHTML(ci);
if(id==='projects')el.innerHTML=projectsHTML();
if(id==='land')el.innerHTML=landHTML();
if(id==='workflow')el.innerHTML=workflowHTML(ci);
if(id==='landowners')el.innerHTML=ownersHTML();
if(id==='documents')el.innerHTML=documentsHTML();
if(id==='compensation')el.innerHTML=compHTML();
if(id==='grievances')el.innerHTML=grievanceHTML();
if(id==='analytics')el.innerHTML=analyticsHTML();
if(id==='decision')el.innerHTML=decisionHTML(ci);
if(id==='important')el.innerHTML=importantHTML()}
function header(title,sub,action=''){return `<div class="page-heading"><div><span class="eyebrow">BHOOMISETU • END-TO-END LIFECYCLE</span><h1>${title}</h1><p>${sub}</p></div>${action}</div>`}
function dashboardHTML(ci){
  const s=stages[ci], m=(typeof workflowMetrics==='function'?workflowMetrics():{completed:stages.filter((_,i)=>isComplete(i)).length,risk:0,unresolved:0,pendingDocs:0,estimatedDays:0,compDelay:0});
  const delayed=state.parcels.filter((p,i)=>parcelDelayInfo(p,i).status==='Delayed').length;
  const atRisk=state.parcels.filter((p,i)=>parcelDelayInfo(p,i).status==='At Risk').length;
  const onTrack=Math.max(0,state.parcels.length-delayed-atRisk);
  const area=state.parcels.reduce((a,p)=>a+p.area,0);
  return header('Project Command Center','Monitor, manage and complete land acquisition with transparency and intelligence.',`<button class="primary-btn dashboard-continue" onclick="continueFlow()">Continue: ${s[1]} →</button>`)+
  `<div class="active-project-bar"><div><span>ACTIVE PROJECT</span><b>${escapeHTML(state.project.name)}</b><small>${escapeHTML(state.project.id)} • ${escapeHTML(state.project.district)}</small></div><button class="secondary-btn" onclick="showPage('projects')">Switch Project</button></div>`+
  `<div class="color-stats-grid">
    <div class="color-stat blue"><div class="color-stat-icon">▣</div><div><span>Projects</span><strong>${state.projects.length}</strong><small>In Workspace</small></div></div>
    <div class="color-stat green"><div class="color-stat-icon">⌖</div><div><span>Parcels Identified</span><strong>${state.parcels.length}</strong><small>Total Parcels</small></div></div>
    <div class="color-stat orange"><div class="color-stat-icon">♙</div><div><span>Landowners</span><strong>${state.owners.length}</strong><small>Linked Owners</small></div></div>
    <div class="color-stat purple"><div class="color-stat-icon">✓</div><div><span>Workflow Progress</span><strong>${pct()}%</strong><small>${s[1]}</small></div><div class="stat-ring" style="--progress:${pct()*3.6}deg"></div></div>
    <div class="color-stat cyan"><div class="color-stat-icon">₹</div><div><span>Est. Compensation</span><strong>₹${state.compensation?Math.round(state.compensation/100000)/10+' L':'0'}</strong><small>${state.approval?'Approved':'Illustrative'}</small></div></div>
    <div class="color-stat red"><div class="color-stat-icon">!</div><div><span>Delayed Parcels</span><strong>${delayed}</strong><small>Require Attention</small></div></div>
  </div>
  <div class="dashboard-main-grid">
    <div class="dashboard-left">
      <div class="card journey-card">
        <div class="journey-head"><div><h3>📍 Live Project Journey <span>(18 Stages)</span></h3><small>Follow the complete acquisition lifecycle step-by-step.</small></div><div class="journey-progress"><span>Overall Progress</span><div class="progress-line"><i style="width:${pct()}%"></i></div><b>${pct()}%</b></div></div>
        ${flowHTML(ci)}
      </div>
      <div class="dashboard-lower-grid">
        <div class="card current-stage-card"><div class="panel-title"><h3>🚩 Current Stage</h3><button class="mini-link" onclick="showPage('workflow')">View Full Workflow</button></div><div class="detail-grid"><div class="detail accent-detail"><span>Stage</span><b>${s[1]}</b></div><div class="detail"><span>Project</span><b>${state.project.name}</b></div><div class="detail"><span>District</span><b>${state.project.district}</b></div></div><div class="notice stage-note">${s[2]}</div><div class="stage-actions"><button class="primary-btn" onclick="continueFlow()">→ Open Current Stage</button><button class="secondary-btn" onclick="showPage('landowners')" ${unlocked(5)?'':'disabled'}>♙ Link Landowners</button><button class="secondary-btn" onclick="showPage('landowners')">♙ View Stakeholders</button></div></div>
        <div class="card summary-card"><div class="panel-title"><h3>Stage Progress Summary</h3></div><div class="donut-wrap"><div class="donut" style="--p:${pct()}%"><strong>${pct()}%</strong><span>Overall<br>Progress</span></div><div class="summary-list"><div><i class="dot green-dot"></i>Completed <b>${m.completed}</b></div><div><i class="dot blue-dot"></i>In Progress <b>${m.completed<18?1:0}</b></div><div><i class="dot orange-dot"></i>At Risk <b>${atRisk}</b></div><div><i class="dot red-dot"></i>Delayed <b>${delayed}</b></div><div><i class="dot gray-dot"></i>Pending <b>${Math.max(0,18-m.completed-1)}</b></div><strong class="total-stages">Total Stages <span>18</span></strong></div></div></div>
      </div>
      <div class="health-grid"><div class="health-card green"><span>✓</span><div><small>On Track Parcels</small><strong>${onTrack} / ${state.parcels.length}</strong></div><b>${state.parcels.length?Math.round(onTrack/state.parcels.length*100):0}%</b></div><div class="health-card orange"><span>!</span><div><small>At Risk Parcels</small><strong>${atRisk} / ${state.parcels.length}</strong></div><b>${state.parcels.length?Math.round(atRisk/state.parcels.length*100):0}%</b></div><div class="health-card red"><span>⏰</span><div><small>Delayed Parcels</small><strong>${delayed} / ${state.parcels.length}</strong></div><b>${state.parcels.length?Math.round(delayed/state.parcels.length*100):0}%</b></div><div class="health-card blue"><span>⌖</span><div><small>Total Area</small><strong>${area.toFixed(2)} ha</strong></div><b>Project Area</b></div></div>
    </div>
    <div class="dashboard-right">
      <div class="card important-mini"><div class="panel-title"><h3>★ IMPORTANT FEATURES</h3><button class="collapse-mini">⌄</button></div><button onclick="showPage('important')"><span class="feature-icon red">⚠</span><div><b>Delay Probability</b><small>${m.risk}% • ${(typeof riskLabel==='function'?riskLabel(m.risk):'LOW')} Risk</small></div><em>›</em></button><button onclick="showPage('important')"><span class="feature-icon blue">◷</span><div><b>Project Completion Time</b><small>${state.completed?'Completed':m.estimatedDays+' days estimated'}</small></div><em>›</em></button><button onclick="showPage('important')"><span class="feature-icon orange">₹</span><div><b>Compensation Delay</b><small>${m.compDelay?m.compDelay+' days':'No delay'}</small></div><em>›</em></button><button onclick="showPage('important')"><span class="feature-icon purple">◆</span><div><b>Risk Factors</b><small>${m.unresolved+m.pendingDocs} active blockers</small></div><em>›</em></button><button onclick="showPage('important')"><span class="feature-icon green">✓</span><div><b>Recommended Next Action</b><small>View suggested action</small></div><em>›</em></button></div>
      <div class="ai-preview"><div class="ai-preview-icon">✦</div><div><h3>AI Guide</h3><p>Ask me about projects, parcels, workflow or procedures.</p></div><button onclick="toggleAIGuide()">Ask AI Assistant</button></div>
    </div>
  </div>`
}
function flowHTML(ci){
  const all=window.showAllStages===true;
  const count=all?stages.length:6;
  const visible=stages.slice(0,count);
  return `<div class="stage-view-toggle"><span><b>${all?'All 18 stages':'First 6 of 18 stages'}</b> <small>${all?'Complete journey visible.':'Quick overview — expand when you need the complete journey.'}</small></span><button type="button" class="see-more-btn" onclick="toggleStagesView()">${all?'Show Less ↑':'See More Stages · 18 →'}</button></div><div class="color-stage-grid ${all?'all-stages':'compact-stages'}">${visible.map((s,i)=>{const complete=isComplete(i),current=i===ci;return `<button type="button" class="color-stage ${complete?'done':current?'current':'locked'} stage-color-${(i%6)+1}" onclick="handleStageClick(${i})"><div class="stage-top"><span class="stage-number">${complete?'✓':i+1}</span><span class="stage-status">${complete?'Completed':current?'In Progress':'Pending'}</span></div><div class="stage-symbol">${['⚑','⌖','♜','⌁','▤','♙','▧','◒','⚑','☁','₹','▦','✓','⚖','▣','⌑','◆','✓'][i]}</div><b>${s[1]}</b><small>${complete?'Open completed stage':current?'Open current stage':'Locked • Complete previous stage'}</small></button>`}).join('')}</div><div class="journey-legend"><span><i class="legend-dot completed"></i>Completed</span><span><i class="legend-dot progress"></i>In Progress</span><span><i class="legend-dot risk"></i>At Risk</span><span><i class="legend-dot delayed"></i>Delayed</span><span><i class="legend-dot pending"></i>Pending</span></div>`
}
function toggleStagesView(){window.showAllStages=!window.showAllStages;renderPage('dashboard');}
function projectProgress(p){const old=state;state=clone(p);const value=pct();state=old;return value;}
function projectStage(p){const old=state;state=clone(p);const value=stages[currentIndex()][1];state=old;return value;}

/* V3.7 - Project-wise monitoring & intelligence */
function withProject(p, fn){
  const old=state; state=clone(p); let value; try{ value=fn(); } finally{ state=old; } return value;
}
function projectMetrics(p){
  return withProject(p, ()=>{
    const m=workflowMetrics();
    const progress=pct();
    const delayed=state.parcels.filter((x,i)=>parcelDelayInfo(x,i).status==='Delayed').length;
    const atRisk=state.parcels.filter((x,i)=>parcelDelayInfo(x,i).status==='At Risk').length;
    const area=state.parcels.reduce((a,x)=>a+Number(x.area||0),0);
    return {progress,risk:m.risk,estimatedDays:m.estimatedDays,delayed,atRisk,parcels:state.parcels.length,owners:state.owners.length,compensation:state.compensation||0,area,currentStage:stages[currentIndex()][1],completed:state.completed};
  });
}
function projectStatus(p){
  const m=projectMetrics(p);
  if(m.completed)return {label:'Completed',cls:'status-complete'};
  if(m.risk>=60||m.delayed>0)return {label:'Delayed / Attention',cls:'status-delayed'};
  if(m.risk>=30||m.atRisk>0)return {label:'At Risk',cls:'status-risk'};
  return {label:m.progress>0?'In Progress':'Not Started',cls:m.progress>0?'status-progress':'status-pending'};
}
function formatMoney(n){
  n=Number(n||0); if(!n)return '₹0';
  if(n>=10000000)return '₹'+(n/10000000).toFixed(2)+' Cr';
  if(n>=100000)return '₹'+(n/100000).toFixed(2)+' Lakh';
  return '₹'+n.toLocaleString('en-IN');
}
function projectSearch(q){
  const query=(q||'').toLowerCase().trim();
  return state.projects.filter(p=>{
    if(!query)return true;
    const x=p.project||{};
    return [x.id,x.name,x.district,x.purpose,x.location].some(v=>String(v||'').toLowerCase().includes(query));
  });
}
function projectsHTML(){
  const query=window.projectListQuery||'';
  const list=projectSearch(query);
  const rows=list.map(p=>{
    const active=p.project.id===state.activeProjectId;
    const m=projectMetrics(p), st=projectStatus(p);
    return `<tr class="${active?'active-project-row':''}">
      <td><b>${escapeHTML(p.project.id)}</b></td>
      <td><b>${escapeHTML(p.project.name)}</b>${active?'<span class="active-project-badge">ACTIVE</span>':''}<small class="table-subline">${escapeHTML(p.project.location||'Location pending')}</small></td>
      <td>${escapeHTML(p.project.district)}</td>
      <td>${escapeHTML(p.project.purpose)}</td>
      <td><span class="project-status ${st.cls}">${st.label}</span><small class="table-subline">${escapeHTML(m.currentStage)}</small></td>
      <td><div class="table-progress"><span>${m.progress}%</span><i><em style="width:${m.progress}%"></em></i></div></td>
      <td><button class="secondary-btn" onclick="openProjectById('${escapeHTML(p.project.id)}')">${active?'Open':'Switch & Open'}</button></td>
    </tr>`;
  }).join('');
  const activeM=projectMetrics(state), activeSt=projectStatus(state);
  return header('Projects','One workspace for many acquisition projects. Every project keeps its own workflow, parcels, stakeholders, documents and compensation records.',`<button class="primary-btn" onclick="openCreateProject()">+ Create Project</button>`)+
  `<div class="project-command-card">
    <div class="project-command-main"><div class="project-command-icon">⌂</div><div><span class="eyebrow">ACTIVE PROJECT</span><h2>${escapeHTML(state.project.name)}</h2><p>${escapeHTML(state.project.id)} • ${escapeHTML(state.project.district)} • ${escapeHTML(state.project.purpose)}</p></div></div>
    <div class="project-command-metrics"><div><span>Status</span><b class="project-status ${activeSt.cls}">${activeSt.label}</b></div><div><span>Progress</span><b>${activeM.progress}%</b></div><div><span>Delay Risk</span><b>${activeM.risk}%</b></div><div><span>Est. Time</span><b>${state.completed?'Completed':activeM.estimatedDays+' days'}</b></div></div>
  </div>
  <div class="projects-overview"><div class="project-overview-card blue"><span>▣</span><div><b>${state.projects.length}</b><small>Total Projects</small></div></div><div class="project-overview-card green"><span>✓</span><div><b>${state.projects.filter(p=>projectStatus(p).label==='In Progress').length}</b><small>In Progress</small></div></div><div class="project-overview-card orange"><span>!</span><div><b>${state.projects.filter(p=>['At Risk','Delayed / Attention'].includes(projectStatus(p).label)).length}</b><small>Need Attention</small></div></div><div class="project-overview-card purple"><span>⌛</span><div><b>${state.projects.filter(p=>projectStatus(p).label==='Completed').length}</b><small>Completed</small></div></div></div>
  <div class="card project-workspace-card"><div class="projects-list-head"><div><h3>Project Workspace</h3><p>Search, compare and switch between project records.</p></div><button class="secondary-btn" onclick="openCreateProject()">+ Add Another Project</button></div>
  <div class="project-search-row"><div class="project-search"><span>⌕</span><input id="projectListSearch" value="${escapeHTML(query)}" placeholder="Search by Project ID, name, district or purpose..." oninput="searchProjectList(this.value)"></div><span class="search-result-count">${list.length} of ${state.projects.length} projects</span></div>
  <div class="table-wrap"><table class="data-table"><thead><tr><th>ID</th><th>Project</th><th>District</th><th>Purpose</th><th>Status / Current Stage</th><th>Progress</th><th></th></tr></thead><tbody>${rows||`<tr><td colspan="7"><div class="empty-search"><b>No project found</b><span>Try a project name, ID or district.</span></div></td></tr>`}</tbody></table></div></div>`;
}
function searchProjectList(q){window.projectListQuery=q;renderPage('projects');}

function escapeHTML(v){return String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
function parcelDelayInfo(p,index){
  const open=state.grievances.find(g=>g.parcel===p.id&&g.status!=='Resolved');
  if(open) return {status:'Delayed',level:'high',reason:`Open grievance ${open.id}`,region:p.village};
  if(!state.owners.some(o=>o.parcel===p.id) && currentIndex()>=5) return {status:'At Risk',level:'medium',reason:'Landowner link pending',region:p.village};
  const docsPending=Object.values(state.documents).some(v=>!v);
  if(docsPending && currentIndex()>=6) return {status:'At Risk',level:'medium',reason:'Document verification pending',region:p.village};
  if(state.compensation>0 && !state.payment && currentIndex()>=12) return {status:'Delayed',level:'high',reason:'Compensation disbursement pending',region:p.village};
  if(state.approval && !state.award && currentIndex()>=13) return {status:'At Risk',level:'medium',reason:'Award generation pending',region:p.village};
  return {status:'On Track',level:'low',reason:'No parcel-specific blocker detected',region:p.village};
}
function parcelSearch(q){
  const query=(q||'').toLowerCase().trim();
  const rows=state.parcels.map((p,i)=>({p,i,info:parcelDelayInfo(p,i)}));
  if(!query)return rows;
  return rows.filter(x=>[x.p.id,x.p.village,x.p.owner||'',x.info.reason].some(v=>String(v).toLowerCase().includes(query)));
}
function landHTML(){
  const rows=parcelSearch(window.parcelMapQuery||'');
  const delayed=state.parcels.filter((p,i)=>parcelDelayInfo(p,i).status==='Delayed').length;
  const atRisk=state.parcels.filter((p,i)=>parcelDelayInfo(p,i).status==='At Risk').length;
  const all=state.parcels.length;
  const mapPositions=[{x:70,y:55,w:210,h:110},{x:300,y:40,w:230,h:125},{x:170,y:190,w:245,h:125},{x:445,y:205,w:190,h:105},{x:650,y:80,w:155,h:115}];
  const visible=rows.map(x=>x.p.id);
  const shapes=state.parcels.map((p,i)=>{const pos=mapPositions[i%mapPositions.length],info=parcelDelayInfo(p,i),active=visible.includes(p.id),cls=info.level;return `<button type="button" class="map-parcel ${cls} ${active?'':'map-hidden'}" style="left:${pos.x}px;top:${pos.y}px;width:${pos.w}px;height:${pos.h}px" onclick="openParcelDetail('${escapeHTML(p.id)}')" title="${escapeHTML(p.id)} • ${escapeHTML(info.reason)}"><span>${escapeHTML(p.id)}</span><small>${escapeHTML(p.village)}</small><em>${escapeHTML(info.status)}</em></button>`}).join('');
  return header('Land Parcels & Delay Map','Search a parcel number or region to locate the affected land and see its current delay exposure.',`<button class="secondary-btn" onclick="clearParcelSearch()">Clear Search</button>`)+
  `<div class="notice map-safety"><b>Safe prototype map:</b> This is a schematic demonstration map, not live GIS. No GPS, satellite data, cadastral database or external map service is connected.</div>`+
  `${state.parcels.length?`<div class="map-toolbar card"><div class="parcel-search"><span>⌕</span><input id="parcelMapSearch" value="${escapeHTML(window.parcelMapQuery||'')}" placeholder="Search Parcel ID, village, owner..." oninput="searchParcelMap(this.value)"></div><div class="map-filters"><span class="map-count">${all} parcels</span><span class="map-count high">${delayed} delayed</span><span class="map-count medium">${atRisk} at risk</span></div></div>
  <div class="parcel-map-layout"><div class="card map-card"><div class="map-head"><div><h3>Project Area • Parcel Delay Monitor</h3><p>Click a parcel to open its record.</p></div><div class="map-legend"><span><i class="legend-dot low"></i>On Track</span><span><i class="legend-dot medium"></i>At Risk</span><span><i class="legend-dot high"></i>Delayed</span></div></div><div class="schematic-map"><div class="map-road road-a"></div><div class="map-road road-b"></div><div class="map-label label-north">N</div><div class="map-label label-project">NH-47 • DEMO PROJECT AREA</div>${shapes}</div></div>
  <div class="card parcel-results"><h3>Parcel Search Results</h3><p class="muted">${rows.length} matching record${rows.length===1?'':'s'}</p>${rows.length?rows.map(({p,i,info})=>`<button type="button" class="parcel-result" onclick="openParcelDetail('${escapeHTML(p.id)}')"><div><b>${escapeHTML(p.id)}</b><small>${escapeHTML(p.village)} • ${escapeHTML(p.area)} ha</small></div><span class="badge ${info.level}">${escapeHTML(info.status)}</span></button>`).join(''):`<div class="notice">No parcel matched your search. Try a Parcel ID such as <b>MP-IND-004821</b>.</div>`}</div></div>
  <div class="card" style="margin-top:18px"><h3>All Identified Parcels</h3><div class="table-wrap"><table class="data-table"><thead><tr><th>Parcel ID</th><th>Region / Village</th><th>Area</th><th>Owner</th><th>Delay Status</th><th>Reason</th></tr></thead><tbody>${rows.map(({p,i,info})=>`<tr><td><button class="table-link" onclick="openParcelDetail('${escapeHTML(p.id)}')">${escapeHTML(p.id)}</button></td><td>${escapeHTML(p.village)}</td><td>${escapeHTML(p.area)} ha</td><td>${escapeHTML(p.owner||'Not linked')}</td><td><span class="badge ${info.level}">${escapeHTML(info.status)}</span></td><td>${escapeHTML(info.reason)}</td></tr>`).join('')||`<tr><td colspan="6">No matching parcels.</td></tr>`}</tbody></table></div></div>`:`<div class="card"><div class="notice">Parcel identification is locked. Complete <b>Land Measurement & Mapping</b> first; then BHOOMISETU will create the demo parcels and show them on this map.</div></div>`}`;
}
function searchParcelMap(q){window.parcelMapQuery=q;renderPage('land');}
function clearParcelSearch(){window.parcelMapQuery='';renderPage('land');}
function openParcelDetail(id){const p=state.parcels.find(x=>x.id===id);if(!p)return;const i=state.parcels.indexOf(p),info=parcelDelayInfo(p,i),owner=state.owners.find(o=>o.parcel===id);modal(`<span class="eyebrow">LAND PARCEL RECORD • DEMO</span><h2>${escapeHTML(p.id)}</h2><div class="modal-data"><div><span>Region / Village</span><strong>${escapeHTML(p.village)}</strong></div><div><span>Area</span><strong>${escapeHTML(p.area)} ha</strong></div><div><span>Landowner</span><strong>${escapeHTML(owner?.name||'Not linked')}</strong></div><div><span>Delay Status</span><strong>${escapeHTML(info.status)}</strong></div><div><span>Delay / Risk Reason</span><strong>${escapeHTML(info.reason)}</strong></div><div><span>Workflow Stage</span><strong>${escapeHTML(stages[currentIndex()][1])}</strong></div></div><div class="notice" style="margin-top:14px"><b>Traceability:</b> This parcel can be followed from identification → owner → documents → valuation → compensation → payment → possession.</div><div class="stage-actions"><button class="primary-btn" onclick="closeModal();showPage('workflow')">View Workflow →</button></div>`)}
function workflowHTML(ci){return header('Acquisition Workflow','A single sequential journey. Click any completed/current stage to open it; locked stages explain what must be completed first.')+`<div class="card"><h3>18-Stage Lifecycle</h3>${stages.map((s,i)=>`<button type="button" class="stage-row ${isComplete(i)?'done':i===ci?'current':'locked'}" onclick="handleStageClick(${i})"><div class="stage-dot">${isComplete(i)?'✓':i+1}</div><div><b>${s[1]}</b><small>${s[2]}</small></div><span class="badge ${isComplete(i)?'done':i===ci?'current':'locked'}">${isComplete(i)?'Completed':i===ci?'Current':'Locked'}</span></button>`).join('')}<div class="stage-actions"><button class="primary-btn" onclick="continueFlow()">Continue Current Stage →</button></div></div>`}
function ownersHTML(){return header('Landowners & Stakeholders','Link sample owners to the parcels identified during the acquisition process.',`<button class="primary-btn" onclick="openOwnerForm()" ${unlocked(5)?'':'disabled'}>+ Add Owner</button>`)+`<div class="card">${state.owners.length?`<table class="data-table"><thead><tr><th>Name</th><th>Parcel</th><th>Stakeholder</th><th>Status</th></tr></thead><tbody>${state.owners.map(o=>`<tr><td><b>${o.name}</b></td><td>${o.parcel}</td><td>${o.type}</td><td><span class="badge done">Linked</span></td></tr>`).join('')}</tbody></table>`:`<div class="notice">Complete Parcel Identification, then add at least one demo owner to unlock Document Verification.</div>`}</div>`}
function documentsHTML(){return header('Document Verification','Verify the core sample records before assessment and notification.')+`<div class="card"><div class="detail-grid">${[['ownership','Ownership / Land Record'],['map','Survey / Map Record'],['identity','Owner Identity Record']].map(x=>`<div class="detail"><span>${x[1]}</span><b>${state.documents[x[0]]?'Verified ✓':'Pending'}</b><div style="margin-top:9px"><button class="secondary-btn" onclick="verifyDoc('${x[0]}')" ${unlocked(6)&&!state.documents[x[0]]?'':'disabled'}>${state.documents[x[0]]?'Verified':'Verify Record'}</button></div></div>`).join('')}</div><div class="notice" style="margin-top:14px">All three sample records must be verified before Social / Environmental Assessment.</div></div>`}
function compHTML(){return header('Compensation','Illustrative valuation and compensation tracking for the demo project.')+`<div class="stats-grid"><div class="stat-card"><div><span>Total Identified Area</span><strong>${state.parcels.reduce((a,p)=>a+p.area,0).toFixed(2)} ha</strong><small>Sample parcel area</small></div></div><div class="stat-card"><div><span>Illustrative Rate</span><strong>₹${state.rate.toLocaleString('en-IN')}</strong><small>Per hectare</small></div></div><div class="stat-card"><div><span>Calculated Amount</span><strong>₹${state.compensation.toLocaleString('en-IN')}</strong><small>${state.approval?'Approved':'Pending approval'}</small></div></div><div class="stat-card"><div><span>Payment</span><strong>${state.payment?'Disbursed':'Pending'}</strong><small>${state.possession?'Possession recorded':'Not yet'}</small></div></div></div><div class="card" style="margin-top:18px"><h3>Compensation Stage</h3><div class="stage-actions"><button class="secondary-btn" onclick="openValuation()" ${unlocked(10)&&!state.rate?'':'disabled'}>1. Set Illustrative Valuation</button><button class="secondary-btn" onclick="calculateComp()" ${unlocked(11)&&state.rate&&!state.compensation?'':'disabled'}>2. Calculate Compensation</button><button class="secondary-btn" onclick="approveComp()" ${unlocked(12)&&state.compensation&&!state.approval?'':'disabled'}>3. Approve Compensation</button><button class="secondary-btn" onclick="makeAward()" ${unlocked(13)&&state.approval&&!state.award?'':'disabled'}>4. Generate Award</button><button class="primary-btn" onclick="makePayment()" ${unlocked(14)&&state.award&&!state.payment?'':'disabled'}>5. Mark Payment Disbursed</button></div></div>`}
function grievanceHTML(){return header('Objections & Grievances','Capture demo objections after notification and resolve them before valuation.')+`<div class="card"><div class="stage-actions"><button class="primary-btn" onclick="fileGrievance()" ${unlocked(9)?'':'disabled'}>+ File Demo Objection</button></div><div style="margin-top:15px">${state.grievances.length?state.grievances.map((g,i)=>`<div class="alert-item"><b>${g.id} • ${g.text}</b><p>Status: ${g.status}</p>${g.status==='Open'?`<button class="secondary-btn" onclick="resolveGrievance(${i})">Mark Resolved</button>`:''}</div>`).join(''):`<div class="notice">No objection recorded. In this demo, the stage can be completed with zero objections or by resolving a filed objection.</div>`}</div></div>`}
function analyticsHTML(){return header('Analytics','Simple live metrics generated from the same workflow state.')+`<div class="stats-grid"><div class="stat-card"><div><span>Completed Stages</span><strong>${stages.filter((_,i)=>isComplete(i)).length}/18</strong></div></div><div class="stat-card"><div><span>Owners Linked</span><strong>${state.owners.length}</strong></div></div><div class="stat-card"><div><span>Verified Records</span><strong>${Object.values(state.documents).filter(Boolean).length}/3</strong></div></div><div class="stat-card"><div><span>Grievances</span><strong>${state.grievances.length}</strong></div></div></div><div class="card" style="margin-top:18px"><h3>Stage Completion</h3><div style="background:#e8edf2;border-radius:20px;height:13px;overflow:hidden"><div style="width:${pct()}%;height:100%;background:#3b6f99"></div></div><p style="font-size:12px;color:#708094">${pct()}% of the illustrative lifecycle is complete.</p></div>`}
function decisionHTML(ci){return header('Decision Support','A transparent demo view of what needs attention next.')+`<div class="section-grid"><div class="card"><h3>Recommended Next Action</h3><div class="notice"><b>${stages[ci][1]}</b><br>${stages[ci][2]}</div><div class="stage-actions"><button class="primary-btn" onclick="continueFlow()">Open Stage →</button></div></div><div class="card"><h3>Risk / Readiness</h3><p style="font-size:13px">${state.documents && !Object.values(state.documents).every(Boolean)?'Document verification is incomplete. Do not proceed to assessment.':'The workflow is progressing through prerequisite checks.'}</p><p style="font-size:11px;color:#718094">This is rule-based demo decision support, not legal or administrative advice.</p></div></div>`}
function continueFlow(){const i=currentIndex();if(i===0&&!state.project.created)return openCreateProject();if(i===1)return openLocation();if(i===2)return openSurvey();if(i===3)return openMeasurement();if(i===4)return createParcels();if(i===5)return openOwnerForm();if(i===6)return showPage('documents');if(i===7)return openAssessment();if(i===8)return issueNotification();if(i===9)return showPage('grievances');if(i===10)return openValuation();if(i===11)return calculateComp();if(i===12)return approveComp();if(i===13)return makeAward();if(i===14)return makePayment();if(i===15)return takePossession();if(i===16)return finalHandover();if(i===17)return completeProject()}
function modal(html){document.getElementById('modalContent').innerHTML=html;document.getElementById('modal').classList.add('show')}
function closeModal(){document.getElementById('modal').classList.remove('show')}
function openCreateProject(){modal(`<span class="eyebrow">PROJECT WORKSPACE • NEW RECORD</span><h2>Create New Project</h2><p style="color:#6f7d91;line-height:1.6">Create a separate project record. Its workflow, parcels, owners, documents, grievances and compensation will be stored independently from other projects.</p><div class="form-grid"><label>Project Name<input id="pname" maxlength="80" placeholder="e.g. NH-52 Bypass Project"></label><label>District<input id="pdistrict" maxlength="50" placeholder="e.g. Bhopal"></label><label>Purpose<select id="ppurpose"><option>Road infrastructure</option><option>Rail infrastructure</option><option>Public utility</option><option>Irrigation infrastructure</option><option>Other public infrastructure</option></select></label><label>Proposed Area (ha)<input id="parea" type="number" min="0.1" step="0.1" placeholder="e.g. 18.5"></label></div><div class="notice" style="margin-top:12px"><b>Data separation:</b> This project will start at Stage 1 and will not overwrite the currently active project.</div><div class="stage-actions"><button class="secondary-btn" onclick="closeModal()">Cancel</button><button class="primary-btn" onclick="createProject()">Create Project & Open →</button></div>`)}
function createProject(){
  const n=document.getElementById('pname').value.trim(),d=document.getElementById('pdistrict').value.trim(),a=Number(document.getElementById('parea').value);
  if(!n||!d||!a||a<=0)return showToast('Enter a valid project name, district and area.');
  syncActiveProject();
  const id=nextProjectId();
  const fresh=demo();
  fresh.project={id,name:n,district:d,purpose:document.getElementById('ppurpose').value,location:'',area:a,created:true,locationConfirmed:false};
  state.projects.push(clone(fresh));
  const collection=state.projects;
  state=clone(fresh); state.projects=collection; state.activeProjectId=id;
  localStorage.setItem('bhoomisetuV3',JSON.stringify({projects:state.projects,activeProjectId:id}));
  closeModal(); window.showAllStages=false; renderAll(); showPage('dashboard'); showToast(`${n} created successfully. This project starts at Land / Location Identification.`);
}
function openProjectById(id){activateProject(id)}
function openLocation(){modal(`<span class="eyebrow">STAGE 2 • LOCATION IDENTIFICATION</span><h2>Confirm Proposed Location</h2><div class="form-grid"><label>Corridor / Site<input id="loc" value="${state.project.location||'Indore–Dewas corridor'}"></label><label>Approx. Area (ha)<input id="locarea" type="number" step="0.1" value="${state.project.area}"></label></div><div class="notice" style="margin-top:12px">Illustrative location confirmation for the SIH prototype. No live GIS or government land database is connected.</div><div class="stage-actions"><button class="primary-btn" onclick="confirmLocation()">Confirm Location</button></div>`)}
function confirmLocation(){state.project.location=document.getElementById('loc').value.trim();state.project.area=Number(document.getElementById('locarea').value)||state.project.area;state.project.locationConfirmed=!!state.project.location;closeModal();save();showToast('Location identified. Preliminary Survey is unlocked.');}
function openSurvey(){modal(`<span class="eyebrow">STAGE 3 • PRELIMINARY SURVEY</span><h2>Record Survey Findings</h2><div class="form-grid"><label>Field Observation<select id="obs"><option>Feasible — no major constraint</option><option>Requires route adjustment</option><option>Requires additional study</option></select></label><label>Survey Team<input id="team" value="District Survey Cell"></label><label style="grid-column:1/-1">Notes<textarea id="snotes">Initial field survey completed for the proposed public infrastructure corridor.</textarea></label></div><div class="stage-actions"><button class="primary-btn" onclick="completeSurvey()">Complete Preliminary Survey</button></div>`)}
function completeSurvey(){state.survey=true;closeModal();save();showToast('Survey completed. Land Measurement & Mapping is unlocked.');}
function openMeasurement(){modal(`<span class="eyebrow">STAGE 4 • MEASUREMENT & MAPPING</span><h2>Record Illustrative Measurement</h2><div class="form-grid"><label>Measured Area (ha)<input id="measured" type="number" min="0.1" step="0.01" value="${state.project.area}"></label><label>Map Reference<input id="mapref" value="MAP-MP-001"></label></div><div class="notice" style="margin-top:12px">For demonstration only. A production system would connect verified survey/GIS records.</div><div class="stage-actions"><button class="primary-btn" onclick="completeMeasurement()">Save Measurement</button></div>`)}
function completeMeasurement(){const a=Number(document.getElementById('measured').value);if(!a||a<=0)return showToast('Enter a valid measured area.');state.project.area=a;state.measurement=true;closeModal();save();showToast('Measurement recorded. Parcel Identification is unlocked.');}
function createParcels(){if(state.parcels.length){showToast('Parcels are already identified.');return}if(!unlocked(4))return showToast('Complete measurement first.');const total=state.project.area;const code=(state.project.id.match(/(\d+)$/)||['','001'])[1].padStart(3,'0');state.parcels=[{id:`MP-${code}-001`,village:'Demo Village A',area:+(total*.42).toFixed(2)},{id:`MP-${code}-002`,village:'Demo Village B',area:+(total*.33).toFixed(2)},{id:`MP-${code}-003`,village:'Demo Village C',area:+(total*.25).toFixed(2)}];save();showToast('3 demo land parcels identified from this project. Landowner identification is unlocked.')}
function openOwnerForm(){if(!unlocked(5))return showToast('Identify parcels before adding owners.');modal(`<span class="eyebrow">STAGE 6 • LANDOWNER IDENTIFICATION</span><h2>Link Demo Landowner</h2><div class="form-grid"><label>Owner Name<input id="oname" value="Demo Landowner"></label><label>Parcel<select id="oparcel">${state.parcels.map(p=>`<option>${p.id}</option>`).join('')}</select></label><label>Stakeholder Type<select id="otype"><option>Landowner</option><option>Co-owner</option><option>Institutional Stakeholder</option></select></label></div><div class="stage-actions"><button class="primary-btn" onclick="addOwner()">Link Owner</button></div>`)}
function addOwner(){const name=document.getElementById('oname').value.trim();if(!name)return showToast('Enter an owner name.');const parcel=document.getElementById('oparcel').value;state.owners.push({name,parcel,type:document.getElementById('otype').value});const p=state.parcels.find(x=>x.id===parcel);if(p)p.owner=name;closeModal();save();showToast('Landowner linked. Add another or proceed to Document Verification.');}
function verifyDoc(k){if(!unlocked(6))return showToast('Link a landowner first.');state.documents[k]=true;save();showToast('Sample record verified.');}
function openAssessment(){if(!Object.values(state.documents).every(Boolean))return showToast('Verify all required sample documents first.');modal(`<span class="eyebrow">STAGE 8 • SOCIAL / ENVIRONMENTAL ASSESSMENT</span><h2>Record Assessment</h2><div class="form-grid"><label>Assessment Status<select id="astatus"><option>Completed — no major issue in demo</option><option>Mitigation measures required</option></select></label><label>Reviewer<input id="reviewer" value="District Assessment Cell"></label><label style="grid-column:1/-1">Findings<textarea id="findings">Illustrative assessment completed. Any real project would require applicable statutory studies and approvals.</textarea></label></div><div class="stage-actions"><button class="primary-btn" onclick="completeAssessment()">Complete Assessment</button></div>`)}
function completeAssessment(){state.assessment=true;closeModal();save();showToast('Assessment completed. Acquisition Notification is unlocked.');}
function issueNotification(){if(!state.assessment)return showToast('Complete assessment first.');modal(`<span class="eyebrow">STAGE 9 • ACQUISITION NOTIFICATION</span><h2>Issue Demo Notification</h2><p>This action creates a simulated notice record for the prototype.</p><div class="detail-grid"><div class="detail"><span>Notice ID</span><b>NOT-MP-001</b></div><div class="detail"><span>Project</span><b>${state.project.name}</b></div><div class="detail"><span>Status</span><b>Draft → Issue</b></div></div><div class="stage-actions"><button class="primary-btn" onclick="confirmNotification()">Issue Demo Notification</button></div>`)}
function confirmNotification(){state.notification=true;closeModal();save();showToast('Demo notification issued. Objections / Grievances stage is unlocked.');}
function fileGrievance(){if(!state.notification)return showToast('Notification must be issued first.');modal(`<span class="eyebrow">STAGE 10 • OBJECTION</span><h2>File Demo Objection</h2><div class="form-grid"><label>Parcel<select id="gparcel">${state.parcels.map(p=>`<option>${p.id}</option>`).join('')}</select></label><label>Reason<select id="greason"><option>Area / measurement objection</option><option>Ownership record clarification</option><option>Compensation concern</option></select></label><label style="grid-column:1/-1">Details<textarea id="gtext">Demo objection submitted for review.</textarea></label></div><div class="stage-actions"><button class="primary-btn" onclick="addGrievance()">Submit Objection</button></div>`)}
function addGrievance(){state.grievances.push({id:'GRV-'+String(state.grievances.length+1).padStart(3,'0'),text:document.getElementById('gtext').value.trim()||'Demo objection',status:'Open',parcel:document.getElementById('gparcel').value});closeModal();save();showToast('Objection recorded. Resolve it before valuation.');}
function resolveGrievance(i){state.grievances[i].status='Resolved';save();showToast('Demo grievance resolved. Valuation is now available.');}
function openValuation(){if(!state.notification)return showToast('Issue notification first.');if(state.grievances.some(g=>g.status==='Open'))return showToast('Resolve all open objections before valuation.');modal(`<span class="eyebrow">STAGE 11 • VALUATION</span><h2>Set Illustrative Valuation Rate</h2><div class="form-grid"><label>Rate per hectare (₹)<input id="rate" type="number" min="1" value="2500000"></label><label>Basis<select><option>Illustrative demo rate</option><option>Sample district benchmark</option></select></label></div><div class="notice" style="margin-top:12px">This is not a legal compensation rate. It exists only to demonstrate the calculation flow.</div><div class="stage-actions"><button class="primary-btn" onclick="setRate()">Save Valuation</button></div>`)}
function setRate(){state.rate=Number(document.getElementById('rate').value);if(!state.rate||state.rate<=0)return showToast('Enter a valid rate.');closeModal();save();showToast('Illustrative valuation saved. Compensation Calculation is unlocked.');}
function calculateComp(){if(!state.rate)return showToast('Set valuation first.');const area=state.parcels.reduce((a,p)=>a+p.area,0);state.compensation=Math.round(area*state.rate);save();showToast('Illustrative compensation calculated. Approval is unlocked.');}
function approveComp(){if(!state.compensation)return showToast('Calculate compensation first.');state.approval=true;save();showToast('Illustrative compensation approved. Award is unlocked.');}
function makeAward(){if(!state.approval)return showToast('Approve compensation first.');state.award=true;save();showToast('Demo award generated. Payment is unlocked.');}
function makePayment(){if(!state.award)return showToast('Generate award first.');state.payment=true;save();showToast('Demo payment marked as disbursed. Possession is unlocked.');}
function takePossession(){if(!state.payment)return showToast('Payment must be marked disbursed first.');state.possession=true;save();showToast('Possession recorded. Final Handover is unlocked.');}
function finalHandover(){if(!state.possession)return showToast('Record possession first.');state.handover=true;save();showToast('Final handover recorded. Project Completion is unlocked.');}
function completeProject(){if(!state.handover)return showToast('Complete final handover first.');state.completed=true;save();showToast('🎉 Demo project lifecycle completed end-to-end.');}
function openProject(){
  const m=projectMetrics(state), st=projectStatus(state);
  modal(`<span class="eyebrow">ACTIVE PROJECT • ${escapeHTML(state.project.id)}</span><h2>${escapeHTML(state.project.name)}</h2>
  <div class="project-modal-status"><span class="project-status ${st.cls}">${st.label}</span><span>Current stage: <b>${escapeHTML(m.currentStage)}</b></span></div>
  <div class="modal-data"><div><span>Project ID</span><strong>${escapeHTML(state.project.id)}</strong></div><div><span>District</span><strong>${escapeHTML(state.project.district)}</strong></div><div><span>Location</span><strong>${escapeHTML(state.project.location||'Pending')}</strong></div><div><span>Area</span><strong>${state.project.area} ha</strong></div><div><span>Progress</span><strong>${m.progress}%</strong></div><div><span>Delay Probability</span><strong>${m.risk}%</strong></div><div><span>Est. Completion</span><strong>${state.completed?'Completed':m.estimatedDays+' days'}</strong></div><div><span>Parcels / Owners</span><strong>${m.parcels} / ${m.owners}</strong></div></div>
  <div class="notice" style="margin-top:14px"><b>Project-specific monitoring:</b> dashboard and workflow data shown after opening this record belong only to this project.</div>
  <div class="stage-actions"><button class="primary-btn" onclick="closeModal();showPage('dashboard')">Open Project Dashboard →</button><button class="secondary-btn" onclick="closeModal();showPage('workflow')">View Workflow</button><button class="secondary-btn" onclick="closeModal();showPage('projects')">All Projects</button></div>`)
}
function showNotifications(){modal(`<span class="eyebrow">NOTIFICATION CENTER</span><h2>Workflow Notifications</h2><div class="alert-item"><b>Current stage: ${stages[currentIndex()][1]}</b><p>${stages[currentIndex()][2]}</p></div><div class="alert-item"><b>Safety</b><p>Prototype is local-only and uses sample data.</p></div>`)}
function openProfile(){document.getElementById('profilePanel').classList.add('show')};function closeProfile(){document.getElementById('profilePanel').classList.remove('show')}
function showToast(m){const t=document.getElementById('toast');t.querySelector('p').textContent=m;t.classList.add('show');clearTimeout(window.bt);window.bt=setTimeout(()=>t.classList.remove('show'),3000)}
function searchData(){const input=document.getElementById('globalSearch');const q=input.value.toLowerCase().trim();if(!q)return;const exactParcel=state.parcels.find(p=>[p.id,p.village,p.owner||''].some(v=>String(v).toLowerCase().includes(q)));if(exactParcel){window.parcelMapQuery=q;showPage('land');setTimeout(()=>openParcelDetail(exactParcel.id),120);return}const projectMatch=state.projects.find(p=>[p.project.id,p.project.name,p.project.district,p.project.purpose,p.project.location].some(v=>String(v||'').toLowerCase().includes(q)));if(projectMatch){activateProject(projectMatch.project.id);return}const map=[['project','projects'],['parcel','land'],['map','land'],['delay','important'],['risk','important'],['completion','important'],['owner','landowners'],['document','documents'],['workflow','workflow'],['compensation','compensation'],['grievance','grievances'],['analytics','analytics'],['decision','decision']];const m=map.find(x=>q.includes(x[0]));if(m){if(m[1]==='projects')window.projectListQuery=q;showPage(m[1])}}
function toggleAIGuide(){document.getElementById('aiGuidePanel').classList.toggle('show')}
function addAIMessage(text,type){const box=document.getElementById('aiMessages');const d=document.createElement('div');d.className='ai-message '+type;d.innerHTML='<strong>'+(type==='user'?'You':'AI Guide')+'</strong><p></p>';d.querySelector('p').textContent=text;box.appendChild(d);box.scrollTop=box.scrollHeight}
function getAIResponse(q){q=q.toLowerCase();const i=currentIndex();if(q.includes('next')||q.includes('what'))return `You are at Stage ${i+1}: ${stages[i][1]}. ${stages[i][2]} Complete this action to unlock Stage ${Math.min(i+2,18)}: ${stages[Math.min(i+1,17)][1]}.`;if(q.includes('complete flow'))return stages.map((s,i)=>`${i+1}. ${s[1]}`).join(' → ');if(q.includes('parcel')||q.includes('map')){const delayed=state.parcels.filter((p,j)=>parcelDelayInfo(p,j).status==='Delayed');return state.parcels.length?`The Land Parcel Delay Map shows ${state.parcels.length} demo parcels. Search by Parcel ID or village to locate a record. ${delayed.length?`Currently ${delayed.length} parcel(s) are marked Delayed.`:'No parcel is currently marked Delayed.'}`:'Complete Land Parcel Identification first to create demo parcels and use the map.';}if(q.includes('explain'))return `Stage ${i+1} is ${stages[i][1]}. In this prototype, it is connected to the previous stage and unlocks the next stage only after completion.`;if(q.includes('safe')||q.includes('security'))return 'The prototype uses local HTML/CSS/JavaScript, sample data and browser storage. No API key, payment gateway or real government database is connected.';if(q.includes('project status')||q.includes('status')){const m=workflowMetrics(),st=projectStatus(state);return `${state.project.name} is ${st.label}. Progress is ${pct()}%, delay probability is ${m.risk}%, and the current stage is ${stages[currentIndex()][1]}.`;}if(q.includes('completion time')||q.includes('completion')){const m=workflowMetrics();return state.completed?'This project is already completed in the demo.':`Estimated remaining time for ${state.project.name}: ${m.estimatedDays} days, based on the current workflow state and demo risk rules.`;}if(q.includes('delay')||q.includes('risk')){const m=workflowMetrics();return `${state.project.name} currently has an indicative delay probability of ${m.risk}%. ${m.unresolved?m.unresolved+' grievance(s) are unresolved. ':''}${m.pendingDocs?m.pendingDocs+' document check(s) are pending. ':''}The figure is illustrative decision support, not an official prediction.`;}return 'Ask me “What should I do next?”, “Project status”, “Completion time”, “Delay risk”, “Explain this stage”, or “Show complete flow”.'}
function askAI(q){if(!q)return;addAIMessage(q,'user');addAIMessage(getAIResponse(q),'bot')};function sendAIMessage(){const x=document.getElementById('aiInput');askAI(x.value.trim());x.value=''}
renderAll();


/* V3.1 - Important Features / Decision Intelligence */
function workflowMetrics(){
  const completed = stages.filter((_,i)=>isComplete(i)).length;
  const pendingDocs = Object.values(state.documents).filter(v=>!v).length;
  const unresolved = state.grievances.filter(g=>g.status!=='Resolved').length;
  const current = currentIndex();
  const remainingStages = Math.max(0, stages.length-1-current);
  let risk = 8 + pendingDocs*8 + unresolved*15;
  if(!state.project.locationConfirmed) risk += 5;
  if(state.project.created && !state.survey) risk += 5;
  if(state.survey && !state.measurement) risk += 4;
  if(state.notification && !state.rate) risk += 5;
  if(state.compensation && !state.approval) risk += 10;
  if(state.approval && !state.payment) risk += 12;
  if(state.payment && !state.possession) risk += 5;
  if(state.possession && !state.handover) risk += 3;
  if(state.completed) risk = 0;
  risk=Math.max(0,Math.min(95,risk));
  const baseDays = 7;
  const estimatedDays = state.completed ? 0 : remainingStages*baseDays + pendingDocs*5 + unresolved*10 + (state.compensation&&!state.approval?7:0) + (state.approval&&!state.payment?8:0);
  const compensationPending = Math.max(0, (state.compensation||0) - (state.payment ? state.compensation : 0));
  let compDelay = 0;
  if(state.compensation>0 && !state.payment) compDelay = (state.approval?7:14) + (unresolved*5);
  if(state.payment) compDelay = 0;
  return {completed,pendingDocs,unresolved,current,remainingStages,risk,estimatedDays,compensationPending,compDelay};
}
function riskClass(r){return r>=60?'risk-high':r>=30?'risk-medium':'risk-low'}
function riskLabel(r){return r>=60?'HIGH':r>=30?'MEDIUM':'LOW'}
function formatDateFromDays(days){const d=new Date();d.setDate(d.getDate()+days);return d.toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}
function importantHTML(){
  const m=workflowMetrics(), r=m.risk, rc=riskClass(r), rl=riskLabel(r), s=stages[m.current];
  const completionDate=state.completed?'Completed':formatDateFromDays(m.estimatedDays);
  const compStatus=state.payment?'DISBURSED':(state.compensation>0?(state.approval?'PAYMENT PENDING':'APPROVAL PENDING'):'NOT CALCULATED');
  const factors=[];
  if(m.pendingDocs) factors.push(`Pending documents <b>+${m.pendingDocs*8}%</b>`);
  if(m.unresolved) factors.push(`Unresolved grievances <b>+${m.unresolved*15}%</b>`);
  if(!state.project.locationConfirmed && state.project.created) factors.push(`Location confirmation pending <b>+5%</b>`);
  if(state.compensation && !state.approval) factors.push(`Compensation approval pending <b>+10%</b>`);
  if(state.approval && !state.payment) factors.push(`Payment/disbursement pending <b>+12%</b>`);
  if(!factors.length) factors.push(state.completed?'Project lifecycle completed':'No major delay factors detected');
  return header('Important Features','Decision intelligence for delay risk, completion forecasting and compensation monitoring.')+
  `<div class="notice">⚠ <b>Illustrative Decision Support:</b> These estimates use demo workflow data and simple prototype rules. They are not legal, financial or official government predictions.</div>`+
  `<div class="risk-grid" style="margin-top:18px">
    <div class="risk-card"><div class="risk-icon">⚠</div><h3>Delay Probability</h3><div class="risk-value ${rc}">${r}%</div><div class="risk-sub">Current risk level: <b class="${rc}">${rl}</b></div><div class="risk-meter"><span style="width:${r}%"></span></div><div class="risk-sub">Based on current workflow blockers</div></div>
    <div class="risk-card"><div class="risk-icon">◷</div><h3>Project Completion Time</h3><div class="risk-value">${completionDate}</div><div class="risk-sub">${state.completed?'Project completed successfully.':`${m.estimatedDays} estimated days remaining`}</div><div class="metric-row" style="margin-top:14px"><div class="mini-metric"><span>Current Stage</span><strong>${s[1]}</strong></div><div class="mini-metric"><span>Stages Remaining</span><strong>${m.remainingStages}</strong></div></div></div>
    <div class="risk-card"><div class="risk-icon">₹</div><h3>Compensation Delay</h3><div class="risk-value ${m.compDelay>0?'risk-high':'risk-low'}">${m.compDelay?m.compDelay+' days':'0 days'}</div><div class="risk-sub">Status: <b>${compStatus}</b></div><div class="metric-row" style="margin-top:14px"><div class="mini-metric"><span>Calculated</span><strong>₹${Number(state.compensation||0).toLocaleString('en-IN')}</strong></div><div class="mini-metric"><span>Pending</span><strong>₹${Number(m.compensationPending||0).toLocaleString('en-IN')}</strong></div></div></div>
  </div>
  <div class="section-grid"><div class="card"><h3>Why is the project at this risk?</h3><div class="factor-list">${factors.map(x=>`<div class="factor"><span>${x}</span><span>•</span></div>`).join('')}</div></div><div class="card"><h3>Recommended Next Action</h3><p style="font-size:13px;line-height:1.6;color:#687588">${state.completed?'All lifecycle stages are complete. The project is ready for final demonstration review.':`Complete <b>${s[1]}</b> to move the project forward and reduce the remaining workflow exposure.`}</p><button class="primary-btn" onclick="continueFlow()">${state.completed?'View Completion':'Continue Current Stage →'}</button></div></div>`;
}
const _renderAll=renderAll; renderAll=function(){_renderAll();renderPage('important')};
const _renderPage=renderPage; renderPage=function(id){if(id==='important'){document.getElementById('important').innerHTML=importantHTML();return}_renderPage(id)};
function stageAction(i){return {project:()=>openCreateProject(),location:()=>openLocation(),survey:()=>openSurvey(),measurement:()=>openMeasurement(),parcels:()=>createParcels(),owners:()=>openOwnerForm(),documents:()=>showPage('documents'),assessment:()=>openAssessment(),notification:()=>issueNotification(),grievances:()=>showPage('grievances'),valuation:()=>openValuation(),compensation:()=>calculateComp(),approval:()=>approveComp(),award:()=>makeAward(),payment:()=>makePayment(),possession:()=>takePossession(),handover:()=>finalHandover(),completion:()=>completeProject()}[stages[i][0]]}
function stagePage(i){return {project:'projects',location:'workflow',survey:'workflow',measurement:'workflow',parcels:'land',owners:'landowners',documents:'documents',assessment:'workflow',notification:'workflow',grievances:'grievances',valuation:'compensation',compensation:'compensation',approval:'compensation',award:'compensation',payment:'compensation',possession:'workflow',handover:'workflow',completion:'workflow'}[stages[i][0]]||'workflow'}
function handleStageClick(i){const ci=currentIndex();if(i>ci){showToast(`Stage ${i+1} is locked. Complete Stage ${ci+1}: ${stages[ci][1]} first.`);return}if(isComplete(i)){showPage(stagePage(i));showToast(`Stage ${i+1}: ${stages[i][1]} is already completed.`);return}const action=stageAction(i);if(typeof action==='function'){action()}else{showPage(stagePage(i))}}
function continueFlow(){const ci=currentIndex();handleStageClick(ci)}
