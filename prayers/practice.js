// Shared memory-practice engine. Each prayer page defines window.PRAYER, then loads this script:
//   key          localStorage prefix, e.g. "hhq" (the home page reads <key>-done and <key>-best)
//   title, eyebrow, incipit (opening Latin words), emblem ("marian" | "apostles" | "nicene"), heroPos (CSS background-position)
//   about        array of HTML paragraphs shown at the top of Study
//   placeholder  hint text for the Recite box
//   moves        [{name, hook (HTML), lines:[...], latin:[...], vr (true for a versicle & response)}]
(function(){
const P=window.PRAYER;
const MOVES=P.moves;
const LINES=MOVES.flatMap(m=>m.lines);
const WORDS=LINES.join(" ").split(/\s+/);
const norm=s=>s.toLowerCase().replace(/[^a-z]/g,"");
const STEPS=["study","fade","cues","order","recall"];
const NUM=["one","two","three","four","five","six","seven","eight","nine","ten"][MOVES.length-1]||MOVES.length;
const ROMAN=["I","II","III","IV","V","VI","VII","VIII","IX","X"];

// deterministic order in which words disappear
const ORDER=WORDS.map((_,i)=>i).sort((a,b)=>((a*61+17)%97)-((b*61+17)%97));
const RANK=[];ORDER.forEach((w,r)=>RANK[w]=r);

const store={get(k,d){try{const v=localStorage.getItem(P.key+"-"+k);return v==null?d:JSON.parse(v)}catch(e){return d}},
             set(k,v){try{localStorage.setItem(P.key+"-"+k,JSON.stringify(v))}catch(e){}}};
const esc=s=>s.replace(/[&<>]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[c]));

document.title=P.title;
document.body.innerHTML=`<div class="wrap">
  <a class="home" href="../index.html">← All exercises</a>
  <header class="hero" style="--hero-pos:${P.heroPos||"70% 72%"}">
    <div style="position:relative;z-index:1;min-width:0">
      <span class="eyebrow">${P.eyebrow} · Memory practice</span>
      <h1>${P.title}</h1>
      <p class="sub">Five exercises, from reading to reciting it cold.</p>
      <p class="latin">${P.incipit}</p>
    </div>
    <svg class="emblem" id="emblem" viewBox="-50 -50 100 100" aria-hidden="true"></svg>
    <cite class="credit">Zünd, The Road to Emmaus, 1877</cite>
  </header>
  <div class="path"><span id="pathlabel">0 of 5 steps</span><div class="bar"><div class="fill" id="pathfill" style="width:0"></div></div></div>
  <nav role="tablist" id="tabs">
    <button role="tab" data-m="study"><b>1</b>Study</button>
    <button role="tab" data-m="fade"><b>2</b>Fade</button>
    <button role="tab" data-m="cues"><b>3</b>Initials</button>
    <button role="tab" data-m="order"><b>4</b>Order</button>
    <button role="tab" data-m="recall"><b>5</b>Recite</button>
  </nav>
  <main id="view"></main>
  <footer>
    <strong>A routine that works</strong>
    <ol>
      <li>Learn the ${NUM} movements in Study until you can name them in order.</li>
      <li>Fade up one level each day, reading aloud until it feels easy.</li>
      <li>Use Initials, then Order, to check the sequence.</li>
      <li>Recite from memory. Repeat tomorrow before anything else.</li>
    </ol>
  </footer>
</div>
<div class="toast" id="toast" role="status" aria-live="polite"></div>`;
window.drawEmblem(document.getElementById("emblem"),P.emblem);

let mode=store.get("mode","study");
const view=document.getElementById("view");

// Progress: one badge per exercise, kept in localStorage alongside the rest.
let done=store.get("done",{});
function drawProgress(){
  const n=STEPS.filter(s=>done[s]).length;
  document.getElementById("pathlabel").textContent=n===5?"All 5 steps complete":`${n} of 5 steps`;
  document.getElementById("pathfill").style.width=(n*20)+"%";
  document.querySelectorAll("#tabs button").forEach(b=>b.dataset.done=!!done[b.dataset.m]);
}
let toastTimer;
function toast(html){const t=document.getElementById("toast");t.innerHTML=html;t.classList.add("show");
  clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove("show"),2600);}
function burst(){
  if(matchMedia("(prefers-reduced-motion:reduce)").matches)return;
  const cx=innerWidth/2,cy=innerHeight-60;
  for(let i=0;i<14;i++){const e=document.createElement("span");e.className="burst";e.textContent="✦";
    const a=Math.PI+Math.random()*Math.PI,d=80+Math.random()*120;
    e.style.left=cx+"px";e.style.top=cy+"px";e.style.setProperty("--dx",Math.cos(a)*d+"px");e.style.setProperty("--dy",Math.sin(a)*d+"px");
    document.body.appendChild(e);setTimeout(()=>e.remove(),1200);}
}
function complete(step){
  if(done[step])return;
  done[step]=true;store.set("done",done);drawProgress();burst();
  const n=STEPS.filter(s=>done[s]).length;
  toast(n===5?`<b>✦</b> All five steps complete. You know the ${esc(P.title.replace(/^The /,""))} by heart.`:`<b>✓</b> Step ${STEPS.indexOf(step)+1} complete · ${n} of 5`);
}

function prayerHTML(fn){ // fn(word,index) -> html
  let i=0,out="";
  MOVES.forEach(m=>m.lines.forEach((l,li)=>{
    const ws=l.split(/\s+/).map(w=>fn(w,i++)).join(" ");
    const mk=m.vr?`<span class="mark">${li===0?"℣":"℟"}</span>`:"";
    out+=`<p class="${m.vr?"vr":""}">${mk}${ws}</p>`;
  }));
  return `<div class="card prayer">${out}</div>`;
}
function bindPeek(){view.querySelectorAll(".hid,.cue").forEach(el=>el.onclick=()=>{
  const p=el.classList.toggle("peek");el.textContent=p?el.dataset.w:el.dataset.c;});}

const MODES={
 study(){
  let latin=store.get("latin",false);
  const draw=()=>{
   view.innerHTML=`<div style="display:flex;flex-direction:column;gap:12px">
    <div class="card about"><span class="ic">✦</span><div>${P.about.map(p=>`<p>${p}</p>`).join("")}</div></div>
    <div class="row" style="justify-content:space-between"><p class="hint" style="flex:1;min-width:200px">${NUM[0].toUpperCase()+NUM.slice(1)} movements. Learn their names and hooks first; the words hang on them.</p>
     <button class="btn" id="latin" aria-pressed="${latin}">${latin?"Hide Latin":"Show Latin"}</button></div>
    <div class="card">${MOVES.map((m,i)=>`<div class="mv"><div class="n">${ROMAN[i]}</div>
      <div style="min-width:0"><h3>${m.name}</h3><div class="t${m.vr?" vr":""}">${m.lines.map(esc).join("<br>")}</div>
      ${latin?`<div class="la">${m.latin.map(esc).join("<br>")}</div>`:""}</div>
      <p class="hook">${m.hook}</p></div>`).join("")}</div>
    <div class="row"><button class="btn gold" id="known">${done.study?`✓ You know the ${NUM} movements`:`I can name all ${NUM} movements`}</button></div></div>`;
   document.getElementById("latin").onclick=()=>{latin=!latin;store.set("latin",latin);draw();};
   document.getElementById("known").onclick=()=>{complete("study");draw();};
  };draw();
 },
 fade(){
  let lvl=0; // always open on the full text
  const labels=["Full text","A few gaps","About 40% hidden","About 60% hidden","Most hidden","All hidden"];
  const draw=()=>{
   const cut=Math.round(WORDS.length*lvl/5);
   view.innerHTML=`<div style="display:flex;flex-direction:column;gap:12px">
    <p class="hint">Read it aloud, filling the blanks from memory. Tap a blank to check. Reach level 5 to complete this step.</p>
    <div class="row"><div class="levels">${[0,1,2,3,4,5].map(n=>`<button id="lv${n}" aria-pressed="${n===lvl}" data-n="${n}">${n}</button>`).join("")}</div>
    <span class="lvlabel">Level ${lvl}: ${labels[lvl]}</span></div>
    ${prayerHTML((w,i)=>RANK[i]<cut?`<span class="w hid" data-w="${esc(w)}" data-c="${esc(w)}">${esc(w)}</span>`:esc(w))}</div>`;
   view.querySelectorAll(".hid").forEach(el=>el.onclick=()=>el.classList.toggle("peek"));
   view.querySelectorAll(".levels button").forEach(b=>b.onclick=()=>{lvl=+b.dataset.n;draw();if(lvl===5)complete("fade");});
  };draw();
 },
 cues(){
  view.innerHTML=`<div style="display:flex;flex-direction:column;gap:12px">
   <p class="hint">Only the first letter of each word remains, with punctuation as a guide to the rhythm. Recite the whole prayer; tap a letter if you're stuck.</p>
   ${prayerHTML(w=>{const m=w.match(/^([^A-Za-z]*)([A-Za-z])[A-Za-z']*(.*)$/);const c=m?m[1]+m[2]+m[3]:w;
     return `<span class="w cue" data-w="${esc(w)}" data-c="${esc(c)}">${esc(c)}</span>`;})}
   <div class="row"><button class="btn gold" id="recited">${done.cues?"✓ Recited from initials":"I recited it from the initials"}</button></div></div>`;
  bindPeek();
  document.getElementById("recited").onclick=e=>{complete("cues");e.target.textContent="✓ Recited from initials";};
 },
 order(){
  let next=0,pool=LINES.map((l,i)=>i).sort(()=>Math.random()-.5);
  const draw=()=>{
   view.innerHTML=`<div style="display:flex;flex-direction:column;gap:12px">
    <p class="hint">Tap the lines in the order they're prayed.</p>
    <div class="card">${next?LINES.slice(0,next).map(l=>`<p class="placed">${esc(l)}</p>`).join(""):`<p class="hint" style="margin:0">Line 1 of ${LINES.length} goes here.</p>`}
    ${next===LINES.length?`<p class="done">All ${LINES.length} lines in order.</p>`:""}</div>
    <div class="pool">${pool.map(i=>`<button class="chip" id="c${i}" data-i="${i}">${esc(LINES[i])}</button>`).join("")}</div>
    <div class="row"><button class="btn" id="reshuffle">Shuffle again</button></div></div>`;
   view.querySelectorAll(".chip").forEach(b=>b.onclick=()=>{
     const i=+b.dataset.i;
     if(i===next){next++;pool=pool.filter(x=>x!==i);draw();if(next===LINES.length)complete("order");}
     else{b.classList.remove("wrong");void b.offsetWidth;b.classList.add("wrong");}
   });
   document.getElementById("reshuffle").onclick=()=>MODES.order();
  };draw();
 },
 recall(){
  const best=store.get("best",null);
  view.innerHTML=`<div style="display:flex;flex-direction:column;gap:12px">
   <p class="hint">Type the whole prayer from memory. Spelling of each word counts; punctuation and capitals don't. Score 90% or more to complete this step.</p>
   <textarea id="recall" placeholder="${esc(P.placeholder)}" spellcheck="false" autocapitalize="sentences"></textarea>
   <div class="row"><button class="btn primary" id="check">Check my recitation</button><button class="btn" id="clear">Clear</button></div>
   <div id="result">${best!=null?`<p class="legend">Your best so far: ${best}%</p>`:""}</div></div>`;
  const ta=document.getElementById("recall");
  ta.value=store.get("draft","");ta.oninput=()=>store.set("draft",ta.value);
  document.getElementById("clear").onclick=()=>{ta.value="";store.set("draft","");document.getElementById("result").innerHTML="";ta.focus();};
  document.getElementById("check").onclick=()=>{
   const said=ta.value.split(/\s+/).map(norm).filter(Boolean),exp=WORDS.map(norm);
   // LCS to find which expected words were recalled in order
   const n=exp.length,m=said.length,dp=Array.from({length:n+1},()=>new Uint16Array(m+1));
   for(let i=n-1;i>=0;i--)for(let j=m-1;j>=0;j--)dp[i][j]=exp[i]===said[j]?dp[i+1][j+1]+1:Math.max(dp[i+1][j],dp[i][j+1]);
   const hit=new Array(n).fill(false);let i=0,j=0;
   while(i<n&&j<m){if(exp[i]===said[j]){hit[i]=true;i++;j++;}else if(dp[i+1][j]>=dp[i][j+1])i++;else j++;}
   const got=hit.filter(Boolean).length,pct=Math.round(got/n*100),extra=m-got;
   const prev=store.get("best",0);if(pct>prev)store.set("best",pct);
   document.getElementById("result").innerHTML=`<div class="card" style="display:flex;flex-direction:column;gap:10px">
    <div class="score"><span class="big">${pct}%</span><span>${got} of ${n} words${extra?` · ${extra} extra`:""}</span>
     <span class="best">${pct>prev?"New best":"Best: "+Math.max(prev,pct)+"%"}</span></div>
    <p class="legend"><span class="r-ok">Green</span> words you had. <span class="r-miss">Red</span> words you missed or changed.</p>
    <div class="prayer">${prayerHTML((w,k)=>`<span class="${hit[k]?"r-ok":"r-miss"}">${esc(w)}</span>`).replace('class="card prayer"','')}</div></div>`;
   if(pct>=90)complete("recall");
  };
 }
};

function go(m){mode=m;store.set("mode",m);
  document.querySelectorAll("#tabs button").forEach(b=>b.setAttribute("aria-selected",b.dataset.m===m));
  MODES[m]();}
document.querySelectorAll("#tabs button").forEach(b=>b.onclick=()=>go(b.dataset.m));
drawProgress();
go(MODES[mode]?mode:"study");
})();
