// Spaced review schedule, shared by the home page and the prayer pages.
// Each prayer's schedule is stored as <key>-review = {stage, due, history:[{date, pct}]}.
// Dates are local calendar dates ("YYYY-MM-DD"), never timestamps, so time zones and time of day don't move them.
// Pure functions only: each page does its own localStorage reads and writes through its store helper.
window.Review=(function(){
  const INTERVALS=[1,3,7,14,30,60,120]; // days until the next review, by stage
  const PASS=90;                        // Recite score that counts as a passed review
  const pad=n=>String(n).padStart(2,"0");
  const fmt=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
  const parts=s=>s.split("-").map(Number);
  const valid=s=>typeof s==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(s);

  // debug: the value of localStorage "debug-today", passed in by the caller (testing hook)
  const today=debug=>valid(debug)?debug:fmt(new Date());
  const addDays=(s,n)=>{const [y,m,d]=parts(s);return fmt(new Date(y,m-1,d+n));};
  // whole days from a to b (positive when b is later); UTC math so daylight-saving changes don't matter
  const daysBetween=(a,b)=>{const u=s=>{const [y,m,d]=parts(s);return Date.UTC(y,m-1,d);};return Math.round((u(b)-u(a))/864e5);};
  // "Oct 26", or "Jan 3, 2027" when the year differs from today's
  const label=(s,t)=>{const [y,m,d]=parts(s),o={month:"short",day:"numeric"};if(t&&s.slice(0,4)!==t.slice(0,4))o.year="numeric";
    return new Date(y,m-1,d).toLocaleDateString("en-US",o);};
  const plural=(n,w)=>`${n} ${w}${n===1?"":"s"}`;

  // A stored schedule we can trust, or null.
  const clean=rv=>rv&&valid(rv.due)&&Number.isInteger(rv.stage)&&rv.stage>=0&&rv.stage<INTERVALS.length?rv:null;
  // First schedule, made when all five steps are finished.
  const start=t=>({stage:0,due:addDays(t,INTERVALS[0]),history:[]});
  // Learners who finished all five steps before reviews existed are reviewed right away.
  const migrate=(rv,allDone,t)=>!rv&&allDone?{stage:0,due:t,history:[]}:rv;
  const isDue=(rv,t)=>!!rv&&daysBetween(rv.due,t)>=0;

  // One-line status with the same wording on the prayer page and the home page.
  // overdue: days past due (0 = due today, negative = scheduled ahead).
  const status=(rv,t)=>{
    if(!rv)return {state:"none",overdue:null,text:"Finish all five steps to start reviews"};
    const late=daysBetween(rv.due,t);
    if(late>0)return {state:"due",overdue:late,text:`Review overdue by ${plural(late,"day")}`};
    if(late===0)return {state:"due",overdue:0,text:"Review due today"};
    return {state:"scheduled",overdue:late,text:`Next review: ${label(rv.due,t)} (stage ${rv.stage+1} of ${INTERVALS.length})`};
  };
  // Record a Recite attempt made on or after the due date. Pass moves up a stage; anything else starts over tomorrow.
  const record=(rv,pct,t)=>{
    const pass=pct>=PASS,stage=pass?Math.min(rv.stage+1,INTERVALS.length-1):0;
    return {stage,due:addDays(t,pass?INTERVALS[stage]:1),history:[...(rv.history||[]),{date:t,pct}]};
  };
  // "Next review in 7 days, Oct 26"
  const nextText=(rv,t)=>{const n=daysBetween(t,rv.due);return `Next review ${n===1?"tomorrow":"in "+plural(n,"day")}, ${label(rv.due,t)}`;};

  return {INTERVALS,PASS,today,addDays,daysBetween,label,clean,start,migrate,isDue,status,record,nextText};
})();
