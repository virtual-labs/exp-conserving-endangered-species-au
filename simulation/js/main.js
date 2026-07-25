const Chart=(()=>{function draw(cv,series,opts={}){const dpr=window.devicePixelRatio||1;const cssW=cv.clientWidth||cv.width,cssH=cssW*(opts.ratio||0.5);cv.width=cssW*dpr;cv.height=cssH*dpr;const g=cv.getContext('2d');g.setTransform(dpr,0,0,dpr,0,0);const W=cssW,H=cssH,m={l:58,r:18,t:16,b:44};g.clearRect(0,0,W,H);let xs=[],ys=[];series.forEach(s=>s.data.forEach(p=>{xs.push(p[0]);ys.push(p[1]);}));if(!xs.length){g.fillStyle='#9aa3b2';g.font='15px Segoe UI';g.textAlign='center';g.fillText('Press "Compute" to see results',W/2,H/2);cv._series=null;return;}let xmin=Math.min(...xs),xmax=Math.max(...xs),ymin=0,ymax=Math.max(...ys);if(xmax===xmin)xmax=xmin+1;if(ymax===ymin)ymax=ymin+1;ymax+=(ymax-ymin)*0.08;const X=x=>m.l+(x-xmin)/(xmax-xmin)*(W-m.l-m.r);const Y=y=>H-m.b-(y-ymin)/(ymax-ymin)*(H-m.t-m.b);g.font='12px Segoe UI';const nT=6;for(let i=0;i<=nT;i++){const gy=ymin+(ymax-ymin)*i/nT;g.strokeStyle='#eef1f6';g.beginPath();g.moveTo(m.l,Y(gy));g.lineTo(W-m.r,Y(gy));g.stroke();g.fillStyle='#7b8494';g.textAlign='right';g.textBaseline='middle';g.fillText(fmt(gy),m.l-8,Y(gy));}for(let i=0;i<=nT;i++){const gx=xmin+(xmax-xmin)*i/nT;g.strokeStyle='#f4f6fa';g.beginPath();g.moveTo(X(gx),m.t);g.lineTo(X(gx),H-m.b);g.stroke();g.fillStyle='#7b8494';g.textAlign='center';g.textBaseline='top';g.fillText(fmt(gx),X(gx),H-m.b+6);}g.strokeStyle='#c7ccd6';g.beginPath();g.moveTo(m.l,m.t);g.lineTo(m.l,H-m.b);g.lineTo(W-m.r,H-m.b);g.stroke();g.fillStyle='#4a5261';g.font='13px Segoe UI';if(opts.xlabel){g.textAlign='center';g.fillText(opts.xlabel,(m.l+W-m.r)/2,H-10);}if(opts.ylabel){g.save();g.translate(15,(m.t+H-m.b)/2);g.rotate(-Math.PI/2);g.textAlign='center';g.fillText(opts.ylabel,0,0);g.restore();}series.forEach(s=>{if(!s.data.length)return;g.strokeStyle=s.color;g.lineWidth=2.4;g.beginPath();s.data.forEach((p,i)=>{const px=X(p[0]),py=Y(p[1]);i?g.lineTo(px,py):g.moveTo(px,py);});g.stroke();g.fillStyle=s.color;s.data.forEach(p=>{g.beginPath();g.arc(X(p[0]),Y(p[1]),3,0,7);g.fill();});});cv._series=series;}
function fmt(v){const a=Math.abs(v);if(a>=1000)return(v/1000).toFixed(1)+'k';if(a>0&&a<1)return v.toFixed(2);if(!Number.isInteger(v))return v.toFixed(1);return''+v;}return{draw};})();

/* [x, nx, mx, cause] */
const SPECIES={
 dall:{name:'Dall Mountain Sheep (Ovis dalli dalli)',rows:[[0,1000,0,'—'],[1,946,0,'Predation'],[2,801,0,'Predation'],[3,789,2,'Intestinal worms'],[4,776,3,'Intestinal worms'],[5,764,3,'Dysentery'],[6,734,3,'Malaria'],[7,688,4,'Fungus'],[8,640,4,'Fungus'],[9,571,5,'Fungus'],[10,439,5,'Predation'],[11,252,6,'Predation'],[12,96,6,'Predation'],[13,6,6,'Intestinal worms'],[14,3,0,'Old age']]},
 thrush:{name:'Song Thrush',rows:[[0,1000,0,'Fungal disease'],[1,444,0,'Fungal disease'],[2,259,0,'Predation'],[3,123,30,'Intestinal worms'],[4,51,10,'Intestinal worms'],[5,30,8,'Predation'],[6,17,5,'Predation'],[7,6,1,'Predation'],[8,3,0,'Old age']]},
 glandula:{name:'The barnacle, Balanus glandula',rows:[[0,1000,0,'Predation'],[1,801,14,'Predation'],[2,789,12,'Predation'],[3,776,11,'Predation'],[4,764,9,'Predation'],[5,734,9,'Predation'],[6,688,7,'Predation'],[7,640,7,'Predation'],[8,571,6,'Predation'],[9,439,4,'Predation'],[10,252,4,'Predation'],[11,96,2,'Predation'],[12,6,0,'Predation'],[13,3,0,'Programmed death']]},
 robin:{name:'American Robin (Turdus m. migratorius)',rows:[[0,1000,0,'Predation'],[1,497,28,'Fungal disease'],[2,229,12,'Intestinal worms'],[3,99,9,'Predation'],[4,36,9,'Fungus'],[5,10,5,'Fungus'],[6,6,1,'Old age']]}
};
let curSpecies='dall',lastLT=null;

function selSpecies(el){curSpecies=el.value;document.querySelectorAll('.spopt').forEach(o=>o.classList.toggle('sel',o.contains(el)));document.getElementById('userEditor').style.display=curSpecies==='user'?'block':'none';if(curSpecies==='user'&&!document.querySelector('#userTable tbody tr')){seedUserTable();}}
function getRows(){
  if(curSpecies!=='user')return SPECIES[curSpecies].rows;
  const rows=[];document.querySelectorAll('#userTable tbody tr').forEach((tr,i)=>{
    const nx=+tr.querySelector('.nx').value||0,mx=+tr.querySelector('.mx').value||0,cause=tr.querySelector('.cause').value||'—';
    rows.push([i,nx,mx,cause]);
  });
  return rows;
}
function buildLifeTable(rows){
  const n0=rows[0][1]||1;const lt=rows.map(r=>({x:r[0],nx:r[1],mx:r[2],cause:r[3],lx:r[1]/n0}));
  for(let i=0;i<lt.length;i++){lt[i].px=(i<lt.length-1&&lt[i].lx>0)?lt[i+1].lx/lt[i].lx:0;lt[i].lxmx=lt[i].lx*lt[i].mx;lt[i].xlxmx=lt[i].x*lt[i].lxmx;}
  const R0=lt.reduce((s,r)=>s+r.lxmx,0);
  const sumX=lt.reduce((s,r)=>s+r.xlxmx,0);
  const T=R0>0?sumX/R0:0;
  const r=(R0>0&&T>0)?Math.log(R0)/T:0;
  const lambda=Math.exp(r);
  const thalf=r!==0?Math.log(0.5)/r:Infinity;
  // critical stage: reproductive age class (mx>0) with the highest survival px
  let crit=-1,best=-1;
  lt.forEach((row,i)=>{const w=row.px*(1+row.mx);if(row.mx>0&&w>best){best=w;crit=i;}});
  if(crit<0){lt.forEach((row,i)=>{if(row.px>best){best=row.px;crit=i;}});}
  return {lt,R0,T,r,lambda,thalf,crit};
}
function compute(){
  const rows=getRows();
  if(rows.length<2){toast('Add at least 2 age classes');return;}
  const res=buildLifeTable(rows);lastLT=res;
  const name=curSpecies==='user'?'User-defined species':SPECIES[curSpecies].name;
  document.getElementById('spTitle').textContent='Survivorship curve — '+name;
  Chart.draw(document.getElementById('chart'),[{color:'#b50246',data:res.lt.map(r=>[r.x,r.nx])}],{xlabel:'Age class (x)',ylabel:'Survivors nₓ',ratio:0.46});
  document.getElementById('legend').innerHTML='<span><i style="background:#b50246"></i>Survivors nₓ vs age</span>';
  // metrics
  const grow=res.lambda>=1;
  document.getElementById('metrics').innerHTML=[
    ['R₀ (net repro. rate)',res.R0.toFixed(3)],
    ['T (generation time)',res.T.toFixed(3)],
    ['r (intrinsic rate)',res.r.toFixed(4)],
    ['λ (geometric rate)',res.lambda.toFixed(3)],
    ['t½ (yrs to halve)',isFinite(res.thalf)?Math.abs(res.thalf).toFixed(2):'—'],
    ['Trend',grow?'▲ Growing':'▼ Declining']
  ].map(m=>`<div class="metric"><div class="k">${m[0]}</div><div class="v">${m[1]}</div></div>`).join('');
  // life table
  const th='<tr><th>x</th><th>nₓ</th><th>lₓ</th><th>pₓ</th><th>mₓ</th><th>lₓmₓ</th><th>x·lₓmₓ</th><th>cause</th></tr>';
  const body=res.lt.map((r,i)=>`<tr class="${i===res.crit?'hot':''}"><td>${r.x}</td><td>${r.nx}</td><td>${r.lx.toFixed(3)}</td><td>${r.px.toFixed(3)}</td><td>${r.mx}</td><td>${r.lxmx.toFixed(3)}</td><td>${r.xlxmx.toFixed(3)}</td><td style="white-space:normal">${r.cause}</td></tr>`).join('');
  document.getElementById('lifeTable').innerHTML=`<table class="data">${th}${body}</table>`;
  // leslie matrix
  buildLeslie(res.lt);
  // insight
  const c=res.lt[res.crit];
  document.getElementById('insight').style.display='block';
  document.getElementById('insight').innerHTML=`<b>Conservation insight:</b> age class <b>${c.x}</b> has the greatest effect on the population growth rate (high survival & reproduction). Its major cause of mortality is <b>${c.cause}</b>. Protecting this stage from ${c.cause.toLowerCase()} will most raise λ. `+(grow?'The population is currently growing (λ ≥ 1).':'The population is declining (λ < 1) and needs intervention.');
  toast('Computed '+name);
}
function buildLeslie(lt){
  const n=lt.length;let html='<table><tr>';
  // fertility row: F_x = m_x (top row)
  for(let j=0;j<n;j++)html+=`<td class="fert">${lt[j].mx.toFixed(2)}</td>`;
  html+='</tr>';
  for(let i=1;i<n;i++){html+='<tr>';for(let j=0;j<n;j++){if(j===i-1)html+=`<td class="diag">${lt[i-1].px.toFixed(3)}</td>`;else html+='<td>0</td>';}html+='</tr>';}
  html+='</table>';
  document.getElementById('leslie').innerHTML=html;
}
/* user table editing */
function addRow(nx,mx,cause){
  const tb=document.querySelector('#userTable tbody');const i=tb.children.length;
  const tr=document.createElement('tr');
  tr.innerHTML=`<td>${i}</td><td><input class="nx" type="number" min="0" value="${nx??''}" placeholder="nₓ"></td><td><input class="mx" type="number" min="0" step="0.1" value="${mx??''}" placeholder="mₓ"></td><td><input class="cause wide" type="text" value="${cause??''}" placeholder="cause"></td><td><button class="btn btn-ghost btn-sm" onclick="delRow(this)">✕</button></td>`;
  tb.appendChild(tr);
}
function delRow(b){const tb=b.closest('tbody');b.closest('tr').remove();[...tb.children].forEach((tr,i)=>tr.firstChild.textContent=i);}
function seedUserTable(){document.querySelector('#userTable tbody').innerHTML='';addRow(1000,0,'—');addRow(500,4,'Predation');addRow(200,6,'Disease');addRow(40,2,'Old age');}
function sync(){}
function resetSim(){const rb=document.querySelector('input[name="sp"][value="dall"]');rb.checked=true;selSpecies(rb);lastLT=null;Chart.draw(document.getElementById('chart'),[]);document.getElementById('metrics').innerHTML='';document.getElementById('lifeTable').innerHTML='';document.getElementById('leslie').innerHTML='';document.getElementById('insight').style.display='none';document.getElementById('legend').innerHTML='';toast('Reset');}
function downloadPNG(){const cv=document.getElementById('chart');if(!cv._series){toast('Compute first');return;}const o=document.createElement('canvas');o.width=cv.width;o.height=cv.height;const c=o.getContext('2d');c.fillStyle='#fff';c.fillRect(0,0,o.width,o.height);c.drawImage(cv,0,0);const a=document.createElement('a');a.download='survivorship.png';a.href=o.toDataURL();a.click();toast('PNG downloaded');}
function downloadCSV(){if(!lastLT){toast('Compute first');return;}let csv='x,nx,lx,px,mx,lxmx,xlxmx,cause\n'+lastLT.lt.map(r=>[r.x,r.nx,r.lx.toFixed(4),r.px.toFixed(4),r.mx,r.lxmx.toFixed(4),r.xlxmx.toFixed(4),'"'+r.cause+'"'].join(',')).join('\n');csv+=`\n\nR0,${lastLT.R0.toFixed(4)}\nT,${lastLT.T.toFixed(4)}\nr,${lastLT.r.toFixed(5)}\nlambda,${lastLT.lambda.toFixed(4)}`;dl(csv,'life-table.csv','text/csv');toast('CSV downloaded');}
function saveRun(){const o={sp:curSpecies};if(curSpecies==='user')o.rows=getRows();localStorage.setItem('conserve',JSON.stringify(o));toast('Saved');}
function loadRun(){const s=localStorage.getItem('conserve');if(!s){toast('No saved run');return;}const o=JSON.parse(s);const rb=document.querySelector('input[name="sp"][value="'+o.sp+'"]');if(rb){rb.checked=true;selSpecies(rb);}if(o.sp==='user'&&o.rows){document.querySelector('#userTable tbody').innerHTML='';o.rows.forEach(r=>addRow(r[1],r[2],r[3]));}compute();toast('Loaded');}
function dl(t,n,ty){const b=new Blob([t],{type:ty});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=n;a.click();URL.revokeObjectURL(a.href);}
function toast(m){const t=document.getElementById('toast');t.textContent=m;t.classList.add('show');clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove('show'),2200);}


compute();window.addEventListener('resize',()=>{if(lastLT)Chart.draw(document.getElementById('chart'),[{color:'#b50246',data:lastLT.lt.map(r=>[r.x,r.nx])}],{xlabel:'Age class (x)',ylabel:'Survivors nₓ',ratio:0.46});});

/* ---- fullscreen (whole simulation box) ---- */
function toggleFS(){var el=document.getElementById('simbox');var fsEl=document.fullscreenElement||document.webkitFullscreenElement;if(!fsEl){var rq=el.requestFullscreen||el.webkitRequestFullscreen;if(rq)rq.call(el);}else{var ex=document.exitFullscreen||document.webkitExitFullscreen;if(ex)ex.call(document);}}
function _fsSync(){var b=document.getElementById('fsBtn');var on=document.fullscreenElement||document.webkitFullscreenElement;if(b)b.textContent=on?'✕':'⛶';setTimeout(function(){window.dispatchEvent(new Event('resize'));},70);}
document.addEventListener('fullscreenchange',_fsSync);
document.addEventListener('webkitfullscreenchange',_fsSync);
