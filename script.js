const initialTriples = [
  {s:"DKTE Institute",p:"offers",o:"MCA courses",status:"Supported"},
  {s:"Students",p:"learn",o:"Java",status:"Supported"},
  {s:"Food Donation System",p:"connects",o:"Donors and NGOs",status:"Supported"},
  {s:"Food Donation System",p:"uses database",o:"MySQL",status:"Supported"},
  {s:"MySQL",p:"stores",o:"student attendance",status:"Review"}
];
const sourceText = document.getElementById("sourceText");
const tripleRows = document.getElementById("tripleRows");
const graphArea = document.getElementById("graphArea");
function renderTriples(items){
  tripleRows.innerHTML = items.map(t=>`<tr><td>${escapeHTML(t.s)}</td><td>${escapeHTML(t.p)}</td><td>${escapeHTML(t.o)}</td><td><span class="tag ${t.status==="Supported"?"ok":"review"}">${t.status==="Supported"?"✓ Supported":"! Review"}</span></td></tr>`).join("");
  const verified = items.filter(t=>t.status==="Supported").length;
  document.getElementById("entityCount").textContent = new Set(items.flatMap(t=>[t.s,t.o])).size;
  document.getElementById("relationCount").textContent = items.length;
  document.getElementById("verifiedCount").textContent = `${verified}/${items.length}`;
  document.getElementById("unsupportedCount").textContent = items.length-verified;
  document.getElementById("summaryText").textContent = `${verified} supported relationships · ${items.length-verified} needs review`;
  drawGraph(items);
}
function escapeHTML(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function drawGraph(items){
  const names=[...new Set(items.flatMap(t=>[t.s,t.o]))].slice(0,8);
  const w=520,h=280,cx=w/2,cy=h/2,rx=180,ry=95;
  const pos=names.map((name,i)=>({name,x:cx+rx*Math.cos((i*2*Math.PI/names.length)-Math.PI/2),y:cy+ry*Math.sin((i*2*Math.PI/names.length)-Math.PI/2)}));
  const edges=items.map(t=>{const a=pos.find(n=>n.name===t.s),b=pos.find(n=>n.name===t.o);if(!a||!b)return "";const mx=(a.x+b.x)/2,my=(a.y+b.y)/2;return `<line class="graph-edge" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"/><text class="graph-edge-label" x="${mx}" y="${my-5}" text-anchor="middle">${escapeHTML(t.p.slice(0,17))}</text>`}).join("");
  const nodes=pos.map((n,i)=>`<g><circle class="graph-node ${i%2?"alt":""}" cx="${n.x}" cy="${n.y}" r="31"/><text class="graph-label" x="${n.x}" y="${n.y+4}" text-anchor="middle">${escapeHTML(n.name.length>12?n.name.slice(0,11)+"…":n.name)}</text></g>`).join("");
  graphArea.innerHTML=`<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="Knowledge graph">${edges}${nodes}</svg>`;
}
document.getElementById("charCount").textContent=`${sourceText.value.length} characters`;
sourceText.addEventListener("input",()=>document.getElementById("charCount").textContent=`${sourceText.value.length} characters`);
document.getElementById("extractBtn").addEventListener("click",()=>{
  const text=sourceText.value.toLowerCase();
  const candidates=[
    {s:"DKTE Institute",p:"offers",o:"MCA courses",keys:["dkte","mca","courses"]},
    {s:"Students",p:"learn",o:"Java",keys:["students","learn","java"]},
    {s:"Food Donation System",p:"connects",o:"Donors and NGOs",keys:["food donation","donors","ngo"]},
    {s:"Food Donation System",p:"uses database",o:"MySQL",keys:["food donation","mysql","database"]},
    {s:"MySQL",p:"stores",o:"donation records",keys:["mysql","store","records"]},
    {s:"Students",p:"develop",o:"web projects",keys:["students","develop","projects"]}
  ];
  let found=candidates.filter(t=>t.keys.every(k=>text.includes(k)));
  if(!found.length) found=[{s:"Source paragraph",p:"contains",o:"user-provided text",status:"Supported"}];
  found=found.map(t=>({...t,status:"Supported"}));
  if(found.length>1) found.push({s:"MySQL",p:"stores",o:"student attendance",status:"Review"});
  renderTriples(found);
  document.getElementById("notice").textContent="Demo extraction complete. Check every triple against the source paragraph; the app uses rule-based sample matching, not a live AI API.";
});
document.getElementById("resetBtn").addEventListener("click",()=>{sourceText.value="DKTE Institute offers MCA courses. Students learn Java and database management. The Food Donation System connects donors with NGOs. The system uses a MySQL database to store donation records. Students develop projects using web technologies.";document.getElementById("charCount").textContent=`${sourceText.value.length} characters`;renderTriples(initialTriples);document.getElementById("notice").textContent="Demo reset. Click Generate to create sample entities and relationships from the paragraph.";});
document.getElementById("exportBtn").addEventListener("click",()=>{
  const rows=[["Subject","Predicate","Object","Verification"],...Array.from(tripleRows.querySelectorAll("tr")).map(r=>Array.from(r.children).map((c,i)=>i===3?c.innerText.trim():c.innerText.trim()))];
  const csv=rows.map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(",")).join("\n");
  const blob=new Blob([csv],{type:"text/csv;charset=utf-8;"}),url=URL.createObjectURL(blob),a=document.createElement("a");
  a.href=url;a.download="knowledge_graph_audit.csv";a.click();URL.revokeObjectURL(url);
});
renderTriples(initialTriples);