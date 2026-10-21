// Shared memory-practice engine. Each prayer page defines window.PRAYER, then loads shared/prayers.js and this script:
//   key          localStorage prefix, e.g. "hhq" (the home page reads <key>-done and <key>-best)
//   title, eyebrow, incipit (opening Latin words), emblem (a kind in shared/emblems.js)
//   about        array of HTML paragraphs shown at the top of Study
//   placeholder  hint text for the Recite box
//   moves        [{name, desc (what it says, without the prayer's words; the Recite hint), hook (HTML), lines:[...], latin:[...], vr (true for a versicle & response)}]
//   parts        optional, for long prayers: [{name, from, to}] splits moves[from..to) into parts. Steps 1–4 then work on
//                one part at a time (picked above the tabs) and count as done once every part has done them; Recite is always whole.
(function(){
const P=window.PRAYER;
const ALL=P.moves,PARTS=P.parts||null;
// The movements the current step works on: one part for steps 1–4 of a sectioned prayer, otherwise the whole prayer.
// OFF is the first movement's index in the whole prayer (for numbering); PREV the line just before the part, if any.
let MOVES,LINES,WORDS,NUM,OFF,PREV;
const scopeTo=(a,b)=>{MOVES=ALL.slice(a,b);LINES=MOVES.flatMap(m=>m.lines);WORDS=LINES.join(" ").split(/\s+/);
  NUM=["one","two","three","four","five","six","seven","eight","nine","ten"][MOVES.length-1]||MOVES.length;
  OFF=a;PREV=a?ALL[a-1].lines[ALL[a-1].lines.length-1]:null;};
scopeTo(0,ALL.length);
const norm=s=>s.toLowerCase().replace(/[^a-z]/g,"");
const STEPS=["study","fade","cues","order","recall"];
const ROMAN=["I","II","III","IV","V","VI","VII","VIII","IX","X"];

// Word-index range [start, end) of each movement within WORDS.
const RANGE=[];{let c=0;MOVES.forEach(m=>{const n=m.lines.join(" ").split(/\s+/).length;RANGE.push([c,c+n]);c+=n;});}
const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};

const store={get(k,d){try{const v=localStorage.getItem(P.key+"-"+k);return v==null?d:JSON.parse(v)}catch(e){return d}},
             set(k,v){try{localStorage.setItem(P.key+"-"+k,JSON.stringify(v))}catch(e){}}};
const esc=s=>s.replace(/[&<>]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[c]));

document.title=P.title;
// Header line: the same description as this prayer's home page card (Most Common view), from shared/prayers.js.
const CARD=(window.PRAYERS||[]).find(p=>p.key===P.key);
const DESC=CARD&&window.prayerNote?window.prayerNote(CARD,CARD.why):"";
document.body.innerHTML=`<div class="wrap">
  <a class="home" href="../index.html">← All prayers</a>
  <header><a class="hero" href="../index.html" title="Back to all prayers">
    <div style="position:relative;z-index:1;min-width:0">
      <span class="eyebrow">${P.eyebrow} · Memory practice</span>
      <h1>${P.title}</h1>
      ${DESC?`<p class="sub">${esc(DESC)}</p>`:""}
      <p class="latin">${P.incipit}</p>
    </div>
    <svg class="emblem" id="emblem" viewBox="-50 -50 100 100" aria-hidden="true"></svg>
    <cite class="credit">Zünd, The Road to Emmaus, 1877</cite>
  </a></header>
  <div class="path"><span id="pathlabel">0 of 5 steps</span><div class="bar"><div class="fill" id="pathfill" style="width:0"></div></div></div>
  <nav role="tablist" id="tabs">
    <button role="tab" data-m="study"><b>1</b>Study</button>
    <button role="tab" data-m="fade"><b>2</b>Fade</button>
    <button role="tab" data-m="cues"><b>3</b>Initials</button>
    <!-- Labeled "Next line" but keyed "order": the step used to be Order, and <key>-done.order must keep counting. -->
    <button role="tab" data-m="order"><b>4</b>Next line</button>
    <button role="tab" data-m="recall"><b>5</b>Recite</button>
  </nav>
  <div class="parts" id="parts" hidden></div>
  <main id="view"></main>
  <div class="nextnav" id="nextnav"></div>
  <footer>
    <strong>A routine that works</strong>
    <ol>
      <li>Learn the ${NUM} movements in Study until you can name them in order.</li>
      <li>Fade up one level each day, reading aloud until it feels easy.</li>
      <li>Use Initials, then Next line, to recall it line by line.</li>
      <li>Recite from memory.</li>
    </ol>
    ${PARTS?`<p>This prayer is long, so steps 1–4 are done one part at a time. Once every part is done, recite the whole prayer.</p>`:""}
  </footer>
</div>
<div class="toast" id="toast" role="status" aria-live="polite"></div>`;
window.drawEmblem(document.getElementById("emblem"),P.emblem);

let mode=store.get("mode","study");
const view=document.getElementById("view");

// Progress: one badge per exercise, kept in localStorage alongside the rest.
let done=store.get("done",{});
// Sectioned prayers: steps 1–4 done per part, kept in <key>-partdone as [{study:true,…},…]. A step goes into done once all parts have it.
let part=Math.min(Math.max(+store.get("part",0)||0,0),PARTS?PARTS.length-1:0);
const partdone=PARTS?PARTS.map((_,i)=>(store.get("partdone",[])||[])[i]||{}):null;
const inPart=step=>PARTS&&step!=="recall";
const isDone=step=>inPart(step)?!!partdone[part][step]||!!done[step]:!!done[step];
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
  if(inPart(step)&&!done[step]){
    if(partdone[part][step])return;
    partdone[part][step]=true;store.set("partdone",partdone);drawParts();
    if(partdone.some(d=>!d[step])){burst();
      const k=partdone.filter(d=>d[step]).length;
      toast(`<b>✓</b> Part ${ROMAN[part]}: step ${STEPS.indexOf(step)+1} done · ${k} of ${PARTS.length} parts`);return;}
  }
  if(done[step])return;
  done[step]=true;store.set("done",done);drawProgress();burst();
  const n=STEPS.filter(s=>done[s]).length;
  toast(n===5?`<b>✦</b> All five steps complete. It's now in Review on the home page.`:`<b>✓</b> Step ${STEPS.indexOf(step)+1} complete · ${n} of 5`);
}

function drawParts(){
  const el=document.getElementById("parts");el.hidden=!PARTS||mode==="recall";if(el.hidden)return;
  el.innerHTML=`<span class="parts-l">Part</span><div class="seg" role="group" aria-label="Part to study">${PARTS.map((p,i)=>{
    const ok=STEPS.slice(0,4).every(s=>partdone[i][s]||done[s]);
    return `<button type="button" data-part="${i}" aria-pressed="${i===part}">${ROMAN[i]}. ${esc(p.name)}${ok?" ✓":""}</button>`;}).join("")}</div>`;
  el.querySelectorAll("button").forEach(b=>b.onclick=()=>{if(+b.dataset.part===part)return;part=+b.dataset.part;store.set("part",part);go(mode);});
}

function prayerHTML(fn,a=0,b=WORDS.length){ // fn(word,globalIndex) -> html; only lines starting in [a,b) are shown
  let i=0,out="";
  MOVES.forEach(m=>m.lines.forEach((l,li)=>{
    const words=l.split(/\s+/),s=i;i+=words.length;
    if(s<a||s>=b)return;
    const ws=words.map((w,k)=>fn(w,s+k)).join(" ");
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
     <p class="hint">${PARTS?`Part ${ROMAN[part]}`:"This prayer"} has <strong>${NUM} movements</strong>, but there are ${MOVES.length+DECOYS.length} cards below. Some aren't part of ${PARTS?"it":"this prayer"}. Tap the ${NUM} that are, in order.</p>`;
   if(!quiz)return `<div class="card quiz">${intro}
     <div class="row">${isDone("study")?`<span class="done">✓ You've put the movements in order.</span>`:""}
      <button class="btn gold" id="qstart">${isDone("study")?"Practice again":"Start (hides the movements)"}</button></div></div>`;
   const fin=quiz.next===MOVES.length;
   return `<div class="card quiz">${intro}
     <div>${quiz.placed.length?quiz.placed.map(i=>`<p class="placed"><span class="mark">${ROMAN[i+OFF]}</span>${esc(MOVES[i].name)}</p>`).join(""):`<p class="hint">Movement ${ROMAN[OFF]} goes here.</p>`}</div>
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
    <div class="card">${MOVES.map((m,i)=>`<div class="mv"><div class="n">${ROMAN[i+OFF]}</div>
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
  // Hiding order, fixed for this visit so each level hides everything the level below did:
  // words missed in Recite first, then the rest, each group shuffled. "New pattern" reshuffles.
  // Missed words are stored as indices into the whole prayer; shift them into the current part.
  const w0=ALL.slice(0,OFF).flatMap(m=>m.lines).join(" ").split(/\s+/).filter(Boolean).length;
  const missed=[...new Set(store.get("missed",[]))].map(i=>i-w0).filter(i=>Number.isInteger(i)&&i>=0&&i<WORDS.length);
  let rank;
  const reshuffle=()=>{const ms=new Set(missed);rank=[];
    [...shuffle(missed),...shuffle(WORDS.map((_,i)=>i).filter(i=>!ms.has(i)))].forEach((w,r)=>rank[w]=r);};
  const draw=()=>{
   const cut=Math.round(WORDS.length*lvl/5),n=missed.length;
   view.innerHTML=`<div style="display:flex;flex-direction:column;gap:12px">
    <p class="hint">Read it aloud, filling the blanks from memory. Tap a blank to check. Reach level 5 to complete this step.</p>
    ${n?`<p class="hint">${n===1?"Your 1 missed word from your last recitation is hidden first.":`Your ${n} missed words from your last recitation are hidden first.`}</p>`:""}
    <div class="row"><div class="levels">${[0,1,2,3,4,5].map(n=>`<button id="lv${n}" aria-pressed="${n===lvl}" data-n="${n}">${n}</button>`).join("")}</div>
    <div class="row" style="justify-content:space-between;width:100%"><span class="lvlabel" style="width:auto">Level ${lvl}: ${labels[lvl]}</span>
     <button class="btn" id="newpat">New pattern</button></div></div>
    ${lvl===5?`<p class="aloud">Say the whole prayer aloud from the blanks. Speaking it helps you remember it.</p>`:""}
    ${prayerHTML((w,i)=>rank[i]<cut?`<span class="w hid" data-w="${esc(w)}" data-c="${esc(w)}">${esc(w)}</span>`:esc(w))}</div>`;
   view.querySelectorAll(".hid").forEach(el=>el.onclick=()=>el.classList.toggle("peek"));
   const setLvl=n=>{lvl=n;draw();if(lvl===5)complete("fade");};
   view.querySelectorAll(".levels button").forEach(b=>b.onclick=()=>setLvl(+b.dataset.n));
   document.getElementById("newpat").onclick=()=>{reshuffle();draw();};
   // Next: up one level; at level 5, on to the next step.
   nextAction=lvl<5?{label:`Next: Level ${lvl+1}`,fn:()=>{setLvl(lvl+1);scrollToEl(view.querySelector(".levels"));}}:null;
   drawNext("fade");
  };reshuffle();draw();
 },
 cues(){
  view.innerHTML=`<div style="display:flex;flex-direction:column;gap:12px">
   <p class="hint">Only the first letter of each word remains, with punctuation as a guide to the rhythm. Recite the whole prayer; tap a letter if you're stuck.</p>
   ${prayerHTML(w=>{const m=w.match(/^([^A-Za-z]*)([A-Za-z])[A-Za-z']*(.*)$/);const c=m?m[1]+m[2]+m[3]:w;
     return `<span class="w cue" data-w="${esc(w)}" data-c="${esc(c)}">${esc(c)}</span>`;})}
   <div class="row"><button class="btn gold" id="recited">${isDone("cues")?"✓ Recited from initials":"I recited it from the initials"}</button></div></div>`;
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
  const ndKey=PARTS?"nextdone-"+part:"nextdone";
  const start=()=>{const q=LINES.map((_,i)=>i);if(shuffled)q.sort(()=>Math.random()-.5);
    s={queue:q,got:new Set(),missed:new Set(),shown:false};draw();};
  const reveal=()=>{s.shown=true;draw();};
  const mark=ok=>{const i=s.queue.shift();
    if(ok)s.got.add(i);else{s.missed.add(i);s.queue.splice(Math.min(3,s.queue.length),0,i);}
    if(!s.queue.length){const nd=store.get(ndKey,{});nd[shuffled?"shuffled":"inorder"]=true;store.set(ndKey,nd);}
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
     <p class="nl-cue${i&&INFO[i-1].vr||!i&&PREV&&ALL[OFF-1].vr?" vr":""}">${i?lineHTML(i-1):PREV?esc(PREV):`<span class="nl-start">(Start of the prayer)</span> ${esc(P.title)}`}</p>
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
   // Next: the first round not yet finished (In order, then Shuffled), then Recite. If that's the round you're in, the one after it.
   const nd=store.get(ndKey,{}),cur=shuffled?"shuffled":"inorder",ST=["inorder","shuffled","recall"];
   let t=ST.find(x=>x==="recall"||!nd[x]);if(t===cur)t=ST[ST.indexOf(cur)+1];
   nextAction=t==="recall"?null:{label:`Next: ${t==="inorder"?"In order":"Shuffled"}`,
     fn:()=>{shuffled=t==="shuffled";store.set("nextmode",t);start();scrollToEl(view);}};
   drawNext("order");
  };
  onKey=e=>{
   const t=e.target instanceof Element?e.target:document.body;
   if(e.metaKey||e.ctrlKey||e.altKey||t.closest("textarea,input,select")||!s.queue.length)return;
   if(!s.shown&&(e.key===" "||e.key==="Enter")){if(t.tagName==="BUTTON"&&t.id!=="reveal")return;e.preventDefault();reveal();}
   else if(s.shown&&(e.key==="1"||e.key==="2")){e.preventDefault();mark(e.key==="1");}
  };
  start();
 },
 // Recite: say the whole prayer aloud from memory; nothing is typed. Show prayer reveals the words to check yourself.
 // Show hints picks a hint at random, the initials or the movements, and toggles to Hide hints.
 // Show prayer toggles to Hide prayer, which clears the hint too, leaving the box blank. While the prayer shows, Show hints swaps it for a new hint.
 recall(){
  let shown=false,said=false,hint=null; // hint: null, "initials" or "movements"
  const HINTS={
   initials:()=>`<p class="qh">Hint: the initials</p>${prayerHTML(w=>{const m=w.match(/^([^A-Za-z]*)([A-Za-z])[A-Za-z']*(.*)$/);const c=m?m[1]+m[2]+m[3]:w;
     return `<span class="w cue" data-w="${esc(w)}" data-c="${esc(c)}">${esc(c)}</span>`;})}`,
   movements:()=>`<p class="qh">Hint: the movements</p><div class="card">${MOVES.map((m,i)=>`<div class="mv"><div class="n">${ROMAN[i]}</div>
     <div style="min-width:0"><h3>${esc(m.name)}</h3><p class="hook">${esc(m.desc||"")}</p></div></div>`).join("")}</div>`
  };
  const toggleHint=()=>{hint=hint&&!shown?null:Math.random()<.5?"initials":"movements";shown=false;draw();};
  const draw=()=>{
  view.innerHTML=`<div style="display:flex;flex-direction:column;gap:12px">
   <p class="aloud">Say the whole prayer aloud from memory. Stuck? Show hints. When you've finished, show the prayer and check yourself.</p>
   <div aria-live="polite" style="display:flex;flex-direction:column;gap:8px">${shown?prayerHTML(esc):hint?HINTS[hint]():""}</div>
   <div class="row"><button class="btn" id="hint" aria-pressed="${!!hint&&!shown}">${hint&&!shown?"Hide hints":"Show hints"}</button><button class="btn primary" id="show" aria-pressed="${shown}">${shown?"Hide prayer":"Show prayer"}</button>
    <button class="btn ok" id="said">${said||done.recall?"✓ Said it from memory":"I said it correctly"}</button></div></div>`;
  const $=id=>document.getElementById(id);
  bindPeek();
  $("hint").onclick=toggleHint;
  $("show").onclick=()=>{if(shown)hint=null;shown=!shown;draw();};
  $("said").onclick=()=>{said=true;complete("recall");draw();};
  };draw();
 }
};

// Keyboard shortcuts belong to the current tab; switching tabs clears them.
let onKey=null;
document.addEventListener("keydown",e=>{if(onKey)onKey(e);});

// Next button under each exercise: the next step, or from Recite back to the home page.
// A tab can take over the button for steps within itself by setting nextAction={label, fn} and calling drawNext.
const TAB_NAMES={study:"Study",fade:"Fade",cues:"Initials",order:"Next line",recall:"Recite"};
let nextAction=null;
const scrollToEl=el=>el.scrollIntoView({block:"start",behavior:matchMedia("(prefers-reduced-motion:reduce)").matches?"auto":"smooth"});
function drawNext(m){
  const el=document.getElementById("nextnav"),k=STEPS.indexOf(m);
  if(nextAction){
    el.innerHTML=`<button class="btn primary" id="nextstep">${esc(nextAction.label)} →</button>`;
    document.getElementById("nextstep").onclick=nextAction.fn;
    return;
  }
  // Sectioned prayer, last part step: on to the next part that still has steps to do, before Recite.
  const np=PARTS&&m==="order"?[...PARTS.keys()].map(d=>(part+1+d)%PARTS.length).find(i=>i!==part&&STEPS.slice(0,4).some(s=>!partdone[i][s]&&!done[s])):undefined;
  if(np!==undefined){
    el.innerHTML=`<button class="btn primary" id="nextstep">Next: Part ${ROMAN[np]} · Study →</button>`;
    document.getElementById("nextstep").onclick=()=>{part=np;store.set("part",part);go("study");scrollToEl(document.getElementById("parts"));};
    return;
  }
  if(k<STEPS.length-1){
    el.innerHTML=`<button class="btn primary" id="nextstep">Next step: ${esc(TAB_NAMES[STEPS[k+1]])} →</button>`;
    document.getElementById("nextstep").onclick=()=>{go(STEPS[k+1]);scrollToEl(document.getElementById("tabs"));};
    return;
  }
  el.innerHTML=`<a class="btn primary" href="../index.html">Next: All prayers →</a>`;
}
function go(m){mode=m;store.set("mode",m);onKey=null;nextAction=null;
  document.querySelectorAll("#tabs button").forEach(b=>b.setAttribute("aria-selected",b.dataset.m===m));
  if(inPart(m))scopeTo(PARTS[part].from,PARTS[part].to);else scopeTo(0,ALL.length);
  drawParts();MODES[m]();drawNext(m);}
document.querySelectorAll("#tabs button").forEach(b=>b.onclick=()=>go(b.dataset.m));
drawProgress();
// "#recite" (from the home page's Review list) opens straight to Recite.
go(location.hash==="#recite"?"recall":MODES[mode]?mode:"study");
})();
