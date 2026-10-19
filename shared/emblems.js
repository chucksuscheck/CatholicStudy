// Gold emblems for prayer headers and home-page cards, drawn into an <svg viewBox="-50 -50 100 100">.
// Each has a ring of twelve (stars, apostles, articles of faith) around a central sign.
(function(){
  const GOLD="#E6C46A",LIGHT="#FFF8E6";
  const star=(cx,cy,r)=>{let d="";for(let k=0;k<10;k++){const a=-Math.PI/2+k*Math.PI/5,rr=k%2?r*.42:r;
    d+=(k?"L":"M")+(cx+rr*Math.cos(a)).toFixed(2)+","+(cy+rr*Math.sin(a)).toFixed(2);}return d+"Z";};
  const ring=(f)=>Array.from({length:12},(_,i)=>{const a=-Math.PI/2+i*Math.PI/6;
    return f(+(40*Math.cos(a)).toFixed(2),+(40*Math.sin(a)).toFixed(2),`class="twinkle" style="animation-delay:${(i*.27).toFixed(2)}s"`);}).join("");
  const halo=`<circle r="27" fill="rgba(255,255,255,.08)" stroke="${GOLD}" stroke-width="1.2"/>`;

  const KINDS={
    // Hail, Holy Queen: the crown of twelve stars (Rev 12:1) around a Marian M.
    marian:()=>ring((x,y,a)=>`<path ${a} fill="${GOLD}" d="${star(x,y,5)}"/>`)+halo+
      `<text y="11" text-anchor="middle" font-family="Spectral,Georgia,serif" font-size="32" font-weight="500" fill="${LIGHT}">M</text>`,
    // Apostles' Creed: twelve small crosses for the twelve apostles around a Latin cross.
    apostles:()=>ring((x,y,a)=>`<path ${a} d="M${x},${y-4.5}V${y+4.5}M${x-3.2},${y-1.3}H${x+3.2}" stroke="${GOLD}" stroke-width="1.8" stroke-linecap="round"/>`)+halo+
      `<path d="M0,-17V19M-10.5,-5.5H10.5" stroke="${LIGHT}" stroke-width="4" stroke-linecap="round"/>`,
    // Nicene Creed: three interlocking circles for the Trinity.
    nicene:()=>ring((x,y,a)=>`<circle ${a} cx="${x}" cy="${y}" r="2.6" fill="${GOLD}"/>`)+halo+
      [-90,30,150].map(d=>{const r=d*Math.PI/180;return `<circle cx="${(7*Math.cos(r)).toFixed(2)}" cy="${(7*Math.sin(r)).toFixed(2)}" r="11.5" fill="none" stroke="${LIGHT}" stroke-width="2.2"/>`;}).join(""),
    // Glory Be: rays of glory around the Trinity triangle.
    glory:()=>ring((x,y,a)=>`<path ${a} d="M${(x*.88).toFixed(2)},${(y*.88).toFixed(2)}L${(x*1.1).toFixed(2)},${(y*1.1).toFixed(2)}" stroke="${GOLD}" stroke-width="2.4" stroke-linecap="round"/>`)+halo+
      `<path d="M0,-15L13,8.5H-13Z" fill="none" stroke="${LIGHT}" stroke-width="2.6" stroke-linejoin="round"/><circle cy="1" r="2.6" fill="${GOLD}"/>`,
    // Memorare: the mystical rose, a Marian title from the Litany of Loreto.
    rose:()=>ring((x,y,a)=>`<circle ${a} cx="${x}" cy="${y}" r="2.8" fill="${GOLD}"/>`)+halo+
      [0,72,144,216,288].map(d=>{const r=(d-90)*Math.PI/180;return `<circle cx="${(8*Math.cos(r)).toFixed(2)}" cy="${(8*Math.sin(r)).toFixed(2)}" r="8" fill="none" stroke="${LIGHT}" stroke-width="2"/>`;}).join("")+
      `<circle r="4" fill="${GOLD}"/>`,
    // Hail Mary: the Annunciation lily.
    lily:()=>ring((x,y,a)=>`<circle ${a} cx="${x}" cy="${y}" r="2.6" fill="none" stroke="${GOLD}" stroke-width="1.6"/>`)+halo+
      `<g fill="none" stroke="${LIGHT}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
       <path d="M0,19V0"/><path d="M0,0C-5,-6 -5,-13 0,-18C5,-13 5,-6 0,0Z"/>
       <path d="M0,0C-6,-2 -12,-8 -13,-14C-7,-12 -3,-8 0,0Z"/><path d="M0,0C6,-2 12,-8 13,-14C7,-12 3,-8 0,0Z"/>
       <path d="M0,13C-4,9 -9,9 -11,11M0,13C4,9 9,9 11,11"/></g>`,
    // Fatima Prayer: the Immaculate Heart, ringed with flames.
    fatima:()=>ring((x,y,a)=>`<path ${a} fill="${GOLD}" d="M${x},${y-4.5}C${x+3},${y-.5} ${x+2.4},${y+3} ${x},${y+3}C${x-2.4},${y+3} ${x-3},${y-.5} ${x},${y-4.5}Z"/>`)+halo+
      `<path d="M0,15C-13,6 -15,-3 -9,-8C-5,-11 -1,-9 0,-5C1,-9 5,-11 9,-8C15,-3 13,6 0,15Z" fill="none" stroke="${LIGHT}" stroke-width="2.2" stroke-linejoin="round"/>
       <path d="M0,-9C-2.5,-12 -1,-16 0,-19C2.5,-16 2.5,-12 0,-9Z" fill="${GOLD}"/>`,
    // Act of Contrition: the crossed keys of absolution (Matthew 16:19).
    keys:()=>ring((x,y,a)=>`<path ${a} d="M${x},${y-3.5}L${x+3},${y}L${x},${y+3.5}L${x-3},${y}Z" fill="none" stroke="${GOLD}" stroke-width="1.5"/>`)+halo+
      [35,-35].map(r=>`<g transform="rotate(${r})" fill="none" stroke="${r>0?LIGHT:GOLD}" stroke-width="2.2" stroke-linecap="round">
       <circle cy="-13" r="5"/><path d="M0,-8V18"/><path d="${r>0?"M0,12H5M0,16H5":"M0,12H-5M0,16H-5"}"/></g>`).join(""),
    // Our Father: the Chi-Rho, monogram of Christ who taught the prayer.
    paternoster:()=>ring((x,y,a)=>`<path ${a} fill="${GOLD}" d="M${x},${y-4}L${x+3},${y}L${x},${y+4}L${x-3},${y}Z"/>`)+halo+
      `<g fill="none" stroke="${LIGHT}" stroke-width="2.6" stroke-linecap="round"><path d="M0,-17V18"/><path d="M0,-17H4.5A6,6 0 0 1 4.5,-5H0"/><path d="M-10,-1L10,13M10,-1L-10,13"/></g>`
  };

  window.drawEmblem=(svg,kind)=>{
    svg.innerHTML=`<circle r="47" fill="none" stroke="rgba(230,196,106,.35)" stroke-width="1"/>`+(KINDS[kind]||KINDS.marian)();
  };
})();
