// The site menu: brand on the left, the four sections on the right. Load it as the LAST script on every page
// (prayer pages rebuild <body> in practice.js, so the menu has to be added after that).
// Links are relative to this script's folder, so the site works from any folder depth and when opened from disk.
(function(){
  const SECTIONS=[
    {key:"prayers",href:"prayers/index.html",label:"Prayers"},
    {key:"rosary", href:"rosary/prayers.html", label:"Rosary"},   // the Rosary section starts on its Prayers page
    {key:"mass",   href:"mass/index.html",   label:"Mass"},
    {key:"history",href:"history/index.html",label:"History",title:"Salvation History"}
  ];
  const root=new URL("../",document.currentScript.src).href;   // the site root, from shared/nav.js
  const here=location.href.split(/[?#]/)[0];
  const current=SECTIONS.find(s=>here.startsWith(root+s.key+"/"));
  const isHome=here===root||here===root+"index.html";

  const css=`
.site-nav{max-width:var(--wrap,680px);margin:0 auto 20px;display:flex;align-items:center;justify-content:space-between;gap:8px 16px;flex-wrap:wrap}
.site-nav .brand{display:flex;align-items:center;gap:10px;color:var(--ink);text-decoration:none;padding:4px 0;min-height:44px}
.site-nav .brand img{width:38px;height:38px;border-radius:9px;flex:none}
.site-nav .brand b{display:block;font:500 20px/1.1 var(--serif)}
.site-nav .brand small{display:block;margin-top:3px;font:500 12.5px/1.2 var(--sans);color:var(--muted);letter-spacing:.01em}
.site-nav .brand:focus-visible,.site-nav .links a:focus-visible{outline:2px solid var(--gold);outline-offset:2px;border-radius:8px}
.site-nav .links{display:flex;gap:2px;background:var(--card);border:1px solid var(--line);border-radius:12px;padding:3px}
.site-nav .links a{display:grid;place-items:center;min-height:38px;padding:0 13px;border-radius:9px;font:600 14.5px var(--sans);color:var(--muted);text-decoration:none;white-space:nowrap}
@media (hover:hover){.site-nav .links a:hover{color:var(--accent);background:var(--accent-soft)}}
.site-nav .links a[aria-current="page"],.site-nav .links a[aria-current="true"]{background:var(--accent);color:var(--card)}
@media (max-width:520px){
  .site-nav .links{width:100%}
  .site-nav .links a{flex:1;padding:0 4px}
}
.site-contact{margin:0;text-align:center;font-size:14px;color:var(--muted)}
.site-contact a{color:var(--accent);font-weight:600;text-decoration:none;display:inline-block;padding:6px 2px}
.site-contact a:hover{text-decoration:underline}
.site-contact a:focus-visible{outline:2px solid var(--gold);outline-offset:2px;border-radius:4px}`;
  const style=document.createElement("style");style.textContent=css;document.head.appendChild(style);

  const nav=document.createElement("nav");
  nav.className="site-nav";nav.setAttribute("aria-label","Site");
  nav.innerHTML=`<a class="brand" href="${root}index.html"${isHome?' aria-current="page"':""}><img src="${root}images/favicon.svg" alt=""><span><b>Faith by Heart</b><small>Memorize the essentials of the Catholic faith</small></span></a>
    <div class="links">${SECTIONS.map(s=>{
      // "page" on the section's own landing page, "true" anywhere else inside the section (e.g. a prayer page).
      const cur=current&&current.key===s.key?(here===root+s.href?"page":"true"):"";
      return `<a href="${root}${s.href}"${s.title?` title="${s.title}"`:""}${cur?` aria-current="${cur}"`:""}>${s.label}</a>`;}).join("")}</div>`;
  document.body.prepend(nav);

  // Contact line at the bottom of every page (links to the contact form): after the page's footer, or at the end of its column.
  const contact=document.createElement("p");
  contact.className="site-contact";
  contact.innerHTML=`Questions or suggestions? <a href="${root}contact/index.html">Send us a note</a>`;
  const col=document.querySelector(".wrap")||document.body;
  if(!here.startsWith(root+"contact/"))col.appendChild(contact);   // not on the contact page itself
})();
