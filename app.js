const $ = (id) => document.getElementById(id);
const STORAGE_KEY = "jdl45_pronostic_demo_v1";
const initial = { platforms: [{id: crypto.randomUUID(), name:"WINWINBET", code:"", url:""}], links: [], audioUrl:"" };
let data;
try { data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || initial; } catch { data = initial; }
function save(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); render(); }
function safe(v){ return String(v ?? "").replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
function validUrl(v){ try { const u=new URL(v); return ["http:","https:"].includes(u.protocol) ? u.href : ""; } catch { return ""; } }
function render(){
  $("platforms").innerHTML = data.platforms.map(p=>{
    const url=validUrl(p.url);
    return `<div class="platform-item"><div class="platform-main"><div class="platform-logo">🏷️</div><div><div class="platform-name">${safe(p.name)}</div>${p.code?`<span class="promo">Code promo : <b>${safe(p.code)}</b></span>`:`<span class="promo">Code promo à ajouter</span>`}</div></div><div class="platform-actions">${p.code?`<button class="icon-btn copy-code" data-id="${p.id}" title="Copier le code">▢</button>`:""}${url?`<a class="icon-btn" href="${safe(url)}" target="_blank" rel="noopener noreferrer" title="Ouvrir le lien">↗</a>`:""}</div></div>`;
  }).join("");
  $("platformEmpty").classList.toggle("hidden",data.platforms.length>0);
  $("links").innerHTML=data.links.map(l=>`<a class="link-item" href="${safe(validUrl(l.url)||"#")}" ${validUrl(l.url)?'target="_blank" rel="noopener noreferrer"':""}><span class="link-symbol">${l.type==="WhatsApp"?"☏":l.type==="Facebook"?"f":l.type==="Messagerie anonyme"?"🕵":"↗"}</span><span>${safe(l.name)}</span><span class="arrow">›</span></a>`).join("");
  $("linksEmpty").classList.toggle("hidden",data.links.length>0);
  $("managePlatforms").innerHTML=data.platforms.map(p=>`<div class="manage-row"><span>${safe(p.name)}${p.code?" · "+safe(p.code):""}</span><button data-delete-platform="${p.id}">Supprimer</button></div>`).join("");
  $("manageLinks").innerHTML=data.links.map(l=>`<div class="manage-row"><span>${safe(l.name)}</span><button data-delete-link="${l.id}">Supprimer</button></div>`).join("");
  $("audio").src=validUrl(data.audioUrl)||"";
  $("audioEmpty").classList.toggle("hidden",!!validUrl(data.audioUrl));
  $("audioControls").classList.toggle("hidden",!validUrl(data.audioUrl));
}
$("themeToggle").addEventListener("click",()=>{document.body.classList.toggle("day");localStorage.setItem("jdl45_theme",document.body.classList.contains("day")?"day":"night");$("themeToggle").textContent=document.body.classList.contains("day")?"🌙":"☀️";});
if(localStorage.getItem("jdl45_theme")==="day"){document.body.classList.add("day");$("themeToggle").textContent="🌙";}
$("adminOpen").onclick=()=>{$("adminModal").classList.remove("hidden");$("loginMessage").textContent="";};
$("closeAdmin").onclick=()=>$("adminModal").classList.add("hidden");
$("adminModal").addEventListener("click",e=>{if(e.target===$("adminModal"))$("adminModal").classList.add("hidden");});
$("loginForm").addEventListener("submit",e=>{e.preventDefault();$("loginMessage").textContent="La connexion sécurisée nécessite la configuration Supabase. Cette démo ne vérifie pas réellement les identifiants.";$("adminPanel").classList.remove("hidden");});
$("logout").onclick=()=>{$("adminPanel").classList.add("hidden");$("loginMessage").textContent="Vous êtes déconnecté.";};
$("platformForm").addEventListener("submit",e=>{e.preventDefault();data.platforms.push({id:crypto.randomUUID(),name:$("pName").value.trim(),code:$("pCode").value.trim(),url:validUrl($("pUrl").value)});e.target.reset();save();});
$("linkForm").addEventListener("submit",e=>{e.preventDefault();const url=validUrl($("lUrl").value);if(!url){alert("Entre un lien valide commençant par https://");return;}data.links.push({id:crypto.randomUUID(),name:$("lName").value.trim(),url,type:$("lType").value});e.target.reset();save();});
document.addEventListener("click",async e=>{
  const pc=e.target.closest("[data-delete-platform]");if(pc){data.platforms=data.platforms.filter(p=>p.id!==pc.dataset.deletePlatform);save();}
  const lc=e.target.closest("[data-delete-link]");if(lc){data.links=data.links.filter(l=>l.id!==lc.dataset.deleteLink);save();}
  const cp=e.target.closest(".copy-code");if(cp){const p=data.platforms.find(p=>p.id===cp.dataset.id);if(p?.code){try{await navigator.clipboard.writeText(p.code);cp.textContent="✓";setTimeout(()=>cp.textContent="▢",1200)}catch{alert("Code promo : "+p.code)}}}
});
$("audioForm").addEventListener("submit",e=>{e.preventDefault();data.audioUrl=validUrl($("audioUrl").value);save();alert("Lien audio enregistré sur cet appareil.");});
$("clearAudio").onclick=()=>{data.audioUrl="";$("audioUrl").value="";save();};
function fmt(t){if(!Number.isFinite(t))return "0:00";return Math.floor(t/60)+":"+String(Math.floor(t%60)).padStart(2,"0");}
$("playBtn").onclick=()=>{$("audio").paused? $("audio").play():$("audio").pause();};
$("audio").addEventListener("play",()=>{$("playBtn").textContent="Ⅱ";});
$("audio").addEventListener("pause",()=>{$("playBtn").textContent="▶";});
$("audio").addEventListener("loadedmetadata",()=>{$("duration").textContent=fmt($("audio").duration);});
$("audio").addEventListener("timeupdate",()=>{const a=$("audio");$("currentTime").textContent=fmt(a.currentTime);$("seek").value=a.duration?a.currentTime/a.duration*100:0;});
$("seek").addEventListener("input",()=>{const a=$("audio");if(a.duration)a.currentTime=Number($("seek").value)/100*a.duration;});
$("speed").onchange=()=>{$("audio").playbackRate=Number($("speed").value);};
render();
