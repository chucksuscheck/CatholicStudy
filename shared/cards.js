// Prayer cards and saved progress, shared by the Prayers and Rosary pages. Load after shared/emblems.js and shared/prayers.js.
// Progress is what prayers/practice.js saves: <key>-done (steps finished) and <key>-best (best typed recital, older saves).
(function(){
  const STEPS=["study","fade","cues","order","recall"];
  const get=(k,d)=>{try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}};
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  window.esc=window.esc||esc;
  window.PRACTICE_STEPS=STEPS;

  // {done, best, n (steps finished), learned (all five)} for a prayer from shared/prayers.js.
  window.prayerProgress=p=>{
    const done=get(p.key+"-done",{})||{},best=get(p.key+"-best",null);
    const n=STEPS.filter(s=>done[s]).length;
    return {done,best,n,learned:n===STEPS.length};
  };

  // A card linking to a prayer's practice page.
  //   href: link from the current page; desc: the line under the title;
  //   rank/rankLabel: optional number in the badge's corner, with its spoken label.
  window.prayerCard=(p,{href,desc,rank,rankLabel})=>{
    const {best,n}=window.prayerProgress(p);
    const txt=(n===5?"All 5 steps ✦":n?`${n} of 5 steps`:"Not started")+(best!=null?` · best recital ${best}%`:"");
    const a=document.createElement("a");a.className="feature";a.href=href;
    a.innerHTML=`<div class="badge">${rank!=null?`<span class="rank" aria-label="${esc(rankLabel||"Number "+rank)}">${rank}</span>`:""}<svg width="54" height="54" viewBox="-50 -50 100 100" aria-hidden="true"></svg></div>
      <div style="min-width:0"><div class="t">${esc(p.title)}</div><div class="d"><i>${esc(p.latin)}</i> · ${esc(desc)}</div>
      <div class="prog"><div class="pips">${[0,1,2,3,4].map(i=>`<i class="${i<n?"on":""}"></i>`).join("")}</div><span>${esc(txt)}</span></div></div>`;
    window.drawEmblem(a.querySelector("svg"),p.emblem);
    return a;
  };
})();
