// Shared memory-practice engine. Each prayer page defines window.PRAYER, then loads shared/review.js and this script:
//   key          localStorage prefix, e.g. "hhq" (the home page reads <key>-done, <key>-best and <key>-review)
//   title, eyebrow, incipit (opening Latin words), emblem (a kind in shared/emblems.js), heroPos (CSS background-position)
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
             set(k,v){try{localStorage.setItem(P.key+"-"+k,JSON.stringify(v))}catch(e){}},
             raw(k){try{return localStorage.getItem(k)}catch(e){return null}}}; // unprefixed, unparsed (e.g. "debug-today")
const esc=s=>s.replace(/[&<>]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[c]));
const today=()=>Review.today(store.raw("debug-today"));

document.title=P.title;
document.body.innerHTML=`<div class="wrap">
  <a class="home" href="../index.html">← All exercises</a>
  <header><a class="hero" href="../index.html" title="Back to all prayers" style="--hero-pos:${P.heroPos||"70% 72%"}">
    <div style="position:relative;z-index:1;min-width:0">
      <span class="eyebrow">${P.eyebrow} · Memory practice</span>
      <h1>${P.title}</h1>
      <p class="sub">Five exercises, from reading to reciting it cold.</p>
      <p class="latin">${P.incipit}</p>
    </div>
    <svg class="emblem" id="emblem" viewBox="-50 -50 100 100" aria-hidden="true"></svg>
    <cite class="credit">Zünd, The Road to Emmaus, 1877</cite>
  </a></header>
  <div class="path"><span id="pathlabel">0 of 5 steps</span><div class="bar"><div class="fill" id="pathfill" style="width:0"></div></div></div>
  <div class="review" id="review" role="status"></div>
  <nav role="tablist" id="tabs">
    <button role="tab" data-m="study"><b>1</b>Study</button>
    <button role="tab" data-m="fade"><b>2</b>Fade</button>
    <button role="tab" data-m="cues"><b>3</b>Initials</button>
    <!-- Labeled "Next line" but keyed "order": the step used to be Order, and <key>-done.order must keep counting. -->
    <button role="tab" data-m="order"><b>4</b>Next line</button>
    <button role="tab" data-m="recall"><b>5</b>Recite</button>
  </nav>
  <main id="view"></main>
  <footer>
    <strong>A routine that works</strong>
    <ol>
      <li>Learn the ${NUM} movements in Study until you can name them in order.</li>
      <li>Fade up one level each day, reading aloud until it feels easy.</li>
      <li>Use Initials, then Next line, to recall it line by line.</li>
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
// Review schedule: a separate layer on top of the five badges (see shared/review.js).
let review=Review.clean(store.get("review",null));
{const m=Review.migrate(review,STEPS.every(s=>done[s]),today());if(m!==review){review=m;store.set("review",review);}}
function drawReview(){
  const s=Review.status(review,today()),el=document.getElementById("review");
  el.className="review "+s.state;
  el.innerHTML=`<span>${esc(s.text)}</span>${s.state==="due"?`<button class="btn primary" id="reviewnow">Review now</button>`:""}`;
  if(s.state==="due")document.getElementById("reviewnow").onclick=()=>{go("recall");document.getElementById("recall").focus();};
}
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
  const first=n===5&&!review;
  if(first){review=Review.start(today());store.set("review",review);drawReview();}
  toast(n===5?`<b>✦</b> All five steps complete.${first?" First review: tomorrow.":""}`:`<b>✓</b> Step ${STEPS.indexOf(step)+1} complete · ${n} of 5`);
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
  // Ordering quiz: the real movement names mixed with decoys that aren't in this prayer.
  // While it runs the movement list is hidden; finishing it completes the Study step.
  const DECOYS=P.decoys||["Thanksgiving","A prayer for the dead","The Ten Commandments"];
  let quiz=null; // {next, pool:[{name,real}], placed:[], msg}
  const startQuiz=()=>{quiz={next:0,placed:[],msg:"",
    pool:[...MOVES.map((m,i)=>({name:m.name,real:i})),...DECOYS.map(d=>({name:d,real:-1}))].sort(()=>Math.random()-.5)};draw();};
  const quizHTML=()=>{
   const intro=`<h3 class="qh">Test yourself: order the movements</h3>
     <p class="hint">This prayer has <strong>${NUM} movements</strong>, but there are ${MOVES.length+DECOYS.length} cards below. Some aren't part of this prayer. Tap the ${NUM} that are, in order.</p>`;
   if(!quiz)return `<div class="card quiz">${intro}
     <div class="row">${done.study?`<span class="done">✓ You've put the movements in order.</span>`:""}
      <button class="btn gold" id="qstart">${done.study?"Practice again":"Start (hides the movements)"}</button></div></div>`;
   const fin=quiz.next===MOVES.length;
   return `<div class="card quiz">${intro}
     <div>${quiz.placed.length?quiz.placed.map(i=>`<p class="placed"><span class="mark">${ROMAN[i]}</span>${esc(MOVES[i].name)}</p>`).join(""):`<p class="hint">Movement I goes here.</p>`}</div>
     ${fin?`<p class="done">${MOVES.length===2?"Both":"All "+NUM} movements in order.</p>`:`<div class="pool">${quiz.pool.map((c,k)=>c.placed?"":`<button class="chip${c.decoy?" decoy":""}" data-k="${k}"${c.decoy?" disabled":""}>${esc(c.name)}</button>`).join("")}</div>`}
     <p class="qmsg" role="status">${quiz.msg}</p>
     <div class="row">${fin?`<button class="btn" id="qclose">Show the movements</button><button class="btn" id="qstart">Practice again</button>`
       :`<button class="btn" id="qstart">Start over</button><button class="btn" id="qclose">Stop and show the movements</button>`}</div></div>`;
  };
  const draw=()=>{
   view.innerHTML=`<div style="display:flex;flex-direction:column;gap:12px">
    <div class="card about"><span class="ic">✦</span><div>${P.about.map(p=>`<p>${p}</p>`).join("")}</div></div>
    ${quiz?"":`<div class="row" style="justify-content:space-between"><p class="hint" style="flex:1;min-width:200px">${NUM[0].toUpperCase()+NUM.slice(1)} movements. Learn their names and hooks first; the words hang on them.</p>
     <button class="btn" id="latin" aria-pressed="${latin}">${latin?"Hide Latin":"Show Latin"}</button></div>
    <div class="card">${MOVES.map((m,i)=>`<div class="mv"><div class="n">${ROMAN[i]}</div>
      <div style="min-width:0"><h3>${m.name}</h3><div class="t${m.vr?" vr":""}">${m.lines.map(esc).join("<br>")}</div>
      ${latin?`<div class="la">${m.latin.map(esc).join("<br>")}</div>`:""}</div>
      <p class="hook">${m.hook}</p></div>`).join("")}</div>`}
    ${quizHTML()}</div>`;
   const $=id=>document.getElementById(id);
   if($("latin"))$("latin").onclick=()=>{latin=!latin;store.set("latin",latin);draw();};
   if($("qstart"))$("qstart").onclick=startQuiz;
   if($("qclose"))$("qclose").onclick=()=>{quiz=null;draw();};
   view.querySelectorAll(".quiz .chip").forEach(b=>b.onclick=()=>{
     const c=quiz.pool[+b.dataset.k];
     if(c.real===quiz.next){c.placed=true;quiz.placed.push(c.real);quiz.next++;quiz.msg="";draw();
       if(quiz.next===MOVES.length)complete("study");}
     else{
       if(c.real<0){c.decoy=true;quiz.msg=`“${esc(c.name)}” isn't part of this prayer.`;draw();
         const d=view.querySelector(`.quiz .chip[data-k="${b.dataset.k}"]`);if(d)d.classList.add("wrong");}
       else{quiz.msg=`Not yet: “${esc(c.name)}” comes later.`;view.querySelector(".qmsg").innerHTML=quiz.msg;
         b.classList.remove("wrong");void b.offsetWidth;b.classList.add("wrong");}
     }
   });
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
 // Next line (cued recall). The step key stays "order" so progress saved under the old Order exercise still counts.
 // Show the line before, hide the target; the learner says it aloud, reveals, and marks Got it / Missed it.
 // A missed line comes back 3 cards later. The session ends when every line has been marked Got it once.
 order(){
  const INFO=MOVES.flatMap(m=>m.lines.map((l,li)=>({l,name:m.name,vr:!!m.vr,mark:m.vr?(li===0?"℣":"℟"):""})));
  const lineHTML=i=>`${INFO[i].mark?`<span class="mark">${INFO[i].mark}</span>`:""}${esc(INFO[i].l)}`;
  let shuffled=store.get("nextmode","inorder")==="shuffled",s;
  const start=()=>{const q=LINES.map((_,i)=>i);if(shuffled)q.sort(()=>Math.random()-.5);
    s={queue:q,got:new Set(),missed:new Set(),shown:false};draw();};
  const reveal=()=>{s.shown=true;draw();};
  const mark=ok=>{const i=s.queue.shift();
    if(ok)s.got.add(i);else{s.missed.add(i);s.queue.splice(Math.min(3,s.queue.length),0,i);}
    s.shown=false;draw();if(!s.queue.length)complete("order");};
  const draw=()=>{
   const n=LINES.length,i=s.queue[0],fin=i===undefined;
   const cardHTML=fin?`<div class="card nl"><p class="done">All ${n} lines recalled.</p>
     ${s.missed.size?`<p class="hint">Missed at least once, so worth drilling:</p>
      <div>${[...s.missed].sort((a,b)=>a-b).map(k=>`<p class="placed miss${INFO[k].vr?" vr":""}">${lineHTML(k)}</p>`).join("")}</div>`
      :`<p class="hint">No misses: every line on the first try.</p>`}
     <div class="row"><button class="btn primary" id="again">Go again</button></div></div>`
    :`<div class="card nl">
     <h3 class="qh">${esc(INFO[i].name)}</h3>
     <p class="nl-cue${i&&INFO[i-1].vr?" vr":""}">${i?lineHTML(i-1):`<span class="nl-start">(Start of the prayer)</span> ${esc(P.title)}`}</p>
     <div class="nl-target${s.shown?" shown":""}${s.shown&&INFO[i].vr?" vr":""}" aria-live="polite">${s.shown?lineHTML(i):"Say the next line aloud, then reveal it."}</div>
     <div class="row">${s.shown?`<button class="btn ok" id="got">Got it</button><button class="btn" id="miss">Missed it</button>`
       :`<button class="btn primary" id="reveal">Reveal</button>`}</div>
     <p class="kbd">Keyboard: Space or Enter to reveal · 1 got it · 2 missed it</p></div>`;
   view.innerHTML=`<div style="display:flex;flex-direction:column;gap:12px">
    <p class="hint">Read the cue, then say the line that comes next from memory.</p>
    <div class="row" style="justify-content:space-between">
     <div class="seg" role="group" aria-label="Line order"><button type="button" data-mode="inorder" aria-pressed="${!shuffled}">In order</button><button type="button" data-mode="shuffled" aria-pressed="${shuffled}">Shuffled</button></div>
     <span class="nl-count">${s.got.size} of ${n} lines</span></div>
    ${cardHTML}</div>`;
   const $=id=>document.getElementById(id);
   view.querySelectorAll(".seg button").forEach(b=>b.onclick=()=>{shuffled=b.dataset.mode==="shuffled";store.set("nextmode",shuffled?"shuffled":"inorder");start();});
   if($("reveal"))$("reveal").onclick=reveal;
   if($("got"))$("got").onclick=()=>mark(true);
   if($("miss"))$("miss").onclick=()=>mark(false);
   if($("again"))$("again").onclick=start;
  };
  onKey=e=>{
   const t=e.target instanceof Element?e.target:document.body;
   if(e.metaKey||e.ctrlKey||e.altKey||t.closest("textarea,input,select")||!s.queue.length)return;
   if(!s.shown&&(e.key===" "||e.key==="Enter")){if(t.tagName==="BUTTON"&&t.id!=="reveal")return;e.preventDefault();reveal();}
   else if(s.shown&&(e.key==="1"||e.key==="2")){e.preventDefault();mark(e.key==="1");}
  };
  start();
 },
 recall(){
  const best=store.get("best",null);
  view.innerHTML=`<div style="display:flex;flex-direction:column;gap:12px">
   <p class="hint">Type the whole prayer from memory. Spelling of each word counts; punctuation and capitals don't. Score 90% or more to complete this step.</p>
   ${Review.isDue(review,today())?`<p class="rvnote due">This attempt counts as today's review.</p>`:""}
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
   // On or after the due date this attempt is the review; before it, it's practice and the schedule stays put.
   const t=today();let note="";
   if(Review.isDue(review,t)){
    review=Review.record(review,pct,t);store.set("review",review);drawReview();
    const dn=view.querySelector(".rvnote.due");if(dn)dn.remove();
    note=pct>=Review.PASS?`Review passed. ${Review.nextText(review,t)}.`:`Below ${Review.PASS}%, so this prayer comes back tomorrow for another review.`;
    toast(`<b>${pct>=Review.PASS?"✓":"↻"}</b> ${esc(note)}`);
   }else if(review)note=`Practice attempt. Your review schedule doesn't change. ${Review.status(review,t).text}.`;
   document.getElementById("result").innerHTML=`<div class="card" style="display:flex;flex-direction:column;gap:10px">
    <div class="score"><span class="big">${pct}%</span><span>${got} of ${n} words${extra?` · ${extra} extra`:""}</span>
     <span class="best">${pct>prev?"New best":"Best: "+Math.max(prev,pct)+"%"}</span></div>
    ${note?`<p class="rvnote">${esc(note)}</p>`:""}
    <p class="legend"><span class="r-ok">Green</span> words you had. <span class="r-miss">Red</span> words you missed or changed.</p>
    <div class="prayer">${prayerHTML((w,k)=>`<span class="${hit[k]?"r-ok":"r-miss"}">${esc(w)}</span>`).replace('class="card prayer"','')}</div></div>`;
   if(pct>=90)complete("recall");
  };
 }
};

// Keyboard shortcuts belong to the current tab; switching tabs clears them.
let onKey=null;
document.addEventListener("keydown",e=>{if(onKey)onKey(e);});

function go(m){mode=m;store.set("mode",m);onKey=null;
  document.querySelectorAll("#tabs button").forEach(b=>b.setAttribute("aria-selected",b.dataset.m===m));
  MODES[m]();}
document.querySelectorAll("#tabs button").forEach(b=>b.onclick=()=>go(b.dataset.m));
drawProgress();
drawReview();
// "#recite" (from the home page's Due today list) opens straight to Recite.
go(location.hash==="#recite"?"recall":MODES[mode]?mode:"study");
})();
