// Data shared by the Rosary pages. Load after shared/emblems.js, shared/prayers.js and shared/cards.js.
// The Rosary's prayers come from shared/prayers.js (by key), so cards and progress match the Prayers section.
window.ROSARY=(function(){
  const BY=Object.fromEntries(window.PRAYERS.map(p=>[p.key,p]));
  const url=p=>"../"+p.href;   // prayer pages, from a page in rosary/

  // The Rosary's prayers, in the order to learn them, from each prayer's rosary entry in shared/prayers.js.
  // [key, where it's said] pairs.
  const LEARN=window.PRAYERS.filter(p=>p.rosary).sort((a,b)=>a.rosary.order-b.rosary.order).map(p=>[p.key,p.rosary.where]);

  // The whole Rosary, used by the Mechanics drills and Study view (which show each step's name and ×times).
  // key is a prayer in shared/prayers.js. where, bead ("big", "small" or "none") and words aren't shown at the moment;
  // they describe each step for a fuller outline.
  const SIGN={name:"Sign of the Cross",words:"In the name of the Father, and of the Son, and of the Holy Spirit. Amen."};
  const SEQ=[
    {id:"opening",title:"Opening",steps:[
      {...SIGN,where:"Holding the crucifix",bead:"big"},
      {key:"apc",where:"On the crucifix",bead:"big"},
      {key:"paf",where:"On the first large bead",bead:"big"},
      {key:"hmy",times:3,where:"On the next three beads, for faith, hope and charity",bead:"small"},
      {key:"glb",where:"After the third Hail Mary",bead:"none"}]},
    {id:"decade",title:"Each decade",note:"Said five times",steps:[
      {name:"Announce the mystery",where:"Name the mystery you will think about during this decade",bead:"none"},
      {key:"paf",where:"On the large bead",bead:"big"},
      {key:"hmy",times:10,where:"On the ten small beads, thinking about the mystery",bead:"small"},
      {key:"glb",where:"After the tenth Hail Mary",bead:"none"},
      {key:"fat",where:"After the Glory Be",bead:"none"}]},
    {id:"closing",title:"Closing",steps:[
      {key:"hhq",where:"After the fifth decade",bead:"big"},
      {...SIGN,where:"To end",bead:"big"}]}
  ];
  const DRILLS=["opening","decade","closing"];   // parts drilled on the Mechanics page, in order

  // The mysteries, in the order of Christ's life, each with the days it's traditionally prayed.
  const MYSTERIES=[
    {id:"joyful",title:"The Joyful Mysteries",note:"Monday and Saturday",items:[
      "The Annunciation","The Visitation","The Nativity","The Presentation in the Temple","The Finding in the Temple"]},
    {id:"luminous",title:"The Luminous Mysteries",note:"Thursday",items:[
      "The Baptism of the Lord","The Wedding at Cana","The Proclamation of the Kingdom","The Transfiguration","The Institution of the Eucharist"]},
    {id:"sorrowful",title:"The Sorrowful Mysteries",note:"Tuesday and Friday",items:[
      "The Agony in the Garden","The Scourging at the Pillar","The Crowning with Thorns","The Carrying of the Cross","The Crucifixion"]},
    {id:"glorious",title:"The Glorious Mysteries",note:"Wednesday and Sunday",items:[
      "The Resurrection","The Ascension","The Descent of the Holy Spirit","The Assumption","The Coronation of Mary"]}
  ];

  const store={get(k,d){try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}},
               set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
  const esc=window.esc;
  // Progress summaries.
  const prayersLearned=()=>LEARN.filter(([k])=>window.prayerProgress(BY[k]).learned).length;
  const known=()=>store.get("rosary-order",{});   // {opening:true, decade:true, closing:true}: drilled with no mistakes

  // Put in order / Study switch: .modes buttons with data-mode="order"|"study" toggle #order and #study.
  // Always opens on Put in order; Study is one tap away.
  function modes(){
    const set=m=>{
      document.querySelectorAll(".modes button").forEach(b=>b.setAttribute("aria-pressed",b.dataset.mode===m));
      document.getElementById("study").hidden=m!=="study";
      document.getElementById("order").hidden=m!=="order";
    };
    document.querySelectorAll(".modes button").forEach(b=>b.onclick=()=>set(b.dataset.mode));
    set("order");
  }

  // A Put in order drill: the items shuffled; tap the one that comes next. Finishing with no mistakes saves
  // saveKey = {<id>: true, …} and shows "✦ Known". noun names the items in hints ("prayer", "mystery").
  const shuffle=a=>{const b=[...a];for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]];}return b;};
  function orderDrill({id,title,note,items},saveKey,noun){
    const box=document.createElement("div");box.className="drill";
    let placed,misses;
    function start(){
      placed=0;misses=0;
      // Shuffle until the choices aren't already in order.
      let order;do{order=shuffle(items.map((_,i)=>i));}while(order.every((v,i)=>v===i));
      const isKnown=store.get(saveKey,{})[id];
      box.innerHTML=`<div class="drill-h"><h3>${esc(title)}${note?`<small>${esc(note)}</small>`:""}</h3>
          <span class="status">${isKnown?"✦ Known":""}</span></div>
        <ol class="slots" aria-label="Your order">${items.map((_,i)=>`<li class="${i?"":"next"}">${i?"":`Tap the first ${noun}`}</li>`).join("")}</ol>
        <div class="choices">${order.map(i=>`<button type="button" data-i="${i}">${esc(items[i])}</button>`).join("")}</div>
        <p class="feedback" aria-live="polite"></p>`;
      box.querySelectorAll(".choices button").forEach(b=>b.onclick=()=>pick(b));
    }
    function pick(b){
      const i=+b.dataset.i, fb=box.querySelector(".feedback"), slots=box.querySelectorAll(".slots li");
      if(i!==placed){
        misses++;b.classList.remove("miss");void b.offsetWidth;b.classList.add("miss");
        fb.className="feedback";fb.textContent=placed?`Not next. What comes after ${items[placed-1]}?`:`Not first. Which ${noun} comes first?`;
        return;
      }
      box.querySelectorAll(".choices .miss").forEach(x=>x.classList.remove("miss"));   // a right answer clears earlier misses
      slots[placed].className="filled";slots[placed].textContent=items[i];
      const rest=[...box.querySelectorAll(".choices button")].filter(x=>x!==b);
      b.remove();placed++;
      if(rest.length&&document.activeElement===document.body)rest[0].focus();   // keep keyboard users in the choices
      if(placed<items.length){
        slots[placed].className="next";
        fb.className="feedback";fb.textContent="";
        return;
      }
      const perfect=misses===0;
      if(perfect){const k=store.get(saveKey,{});k[id]=true;store.set(saveKey,k);box.querySelector(".status").textContent="✦ Known";}
      fb.className="feedback done";
      fb.textContent=perfect?"All in order, with no mistakes. ✦":`All in order, with ${misses} mistake${misses>1?"s":""}. Try it again until it’s clean.`;
      const again=document.createElement("button");again.type="button";again.className="again";again.textContent="Again, shuffled";
      again.onclick=()=>{start();box.querySelector(".choices button").focus();};
      fb.after(again);
    }
    start();
    return box;
  }

  // Study view: each list as a finished Put in order drill, every slot filled in. lists: [{title, note, items}]
  const studyCards=lists=>lists.map(l=>`<div class="drill"><div class="drill-h"><h3>${esc(l.title)}${l.note?`<small>${esc(l.note)}</small>`:""}</h3></div>
    <ol class="slots">${l.items.map(t=>`<li class="filled">${esc(t)}</li>`).join("")}</ol></div>`).join("");
  // A Mechanics step's name, as shown in the drills and the Study view ("Hail Mary ×3").
  const stepLabel=s=>(s.key?BY[s.key].title:s.name)+(s.times?` ×${s.times}`:"");

  return {BY,url,LEARN,SEQ,SIGN,DRILLS,MYSTERIES,store,prayersLearned,known,modes,orderDrill,studyCards,stepLabel};
})();
