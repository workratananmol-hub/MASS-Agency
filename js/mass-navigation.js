/* MASS global navigation */
(()=>{
  const header=document.querySelector(".site-header"),trigger=header?.querySelector(".menu"),logo=header?.querySelector(".logo"),cta=header?.querySelector(".nav-cta");
  if(!header||!trigger||!logo||document.querySelector(".mass-menu-overlay"))return;
  const current=(location.pathname==="/"?"/":location.pathname.replace(/\/$/,"").replace(/\.html$/i,"")).toLowerCase();
  const primaryNav=header.querySelector(".nav");
  if(primaryNav){
    [["/about","About"],["/blog","Blog"]].forEach(([href,label])=>{
      if(!primaryNav.querySelector(`a[href="${href}"]`)){const link=document.createElement("a");link.href=href;link.textContent=label;primaryNav.append(link)}
    });
    primaryNav.querySelectorAll("a").forEach(link=>{if(link.getAttribute("href")===current)link.setAttribute("aria-current","page")});
  }
  trigger.classList.add("mass-menu-trigger");
  trigger.innerHTML='<span class="mass-menu-icon" aria-hidden="true"><i></i><i></i></span><span class="mass-menu-trigger-label">Menu</span>';
  trigger.setAttribute("aria-label","Open navigation");
  trigger.setAttribute("aria-controls","mass-menu-overlay");
  logo.setAttribute("aria-label","MASS home");
  // Each page keeps its own approved primary CTA and destination.
  const links=[
    ["/","Home","01"],["/about","About","02"],["/web-development","Web Services","03"],
    ["/agentic-ai","AI Services","04"],["/mims","MIMS","05"],["/campus","Campus","06"],
    ["/contact","Contact","07"],["/blog","Blog","08"]
  ];
  const art=[
    '<circle cx="105" cy="105" r="70"/><circle cx="105" cy="105" r="38"/><path d="M105 18v174M18 105h174"/>',
    '<path d="M28 64h150v112H28zM48 86h110M48 112h72M48 138h92"/><path d="m142 30 36 34-36 34"/>',
    '<path d="M105 25 174 65v80l-69 40-69-40V65zM105 105l69-40M105 105 36 65M105 105 36 65M105 105v80"/><circle cx="105" cy="105" r="18"/>',
    '<path d="M42 30h126v150H42zM62 58h86M62 84h86M62 110h58M62 136h72"/><circle cx="164" cy="158" r="24"/>',
    '<path d="M24 105h162M105 24v162"/><circle cx="105" cy="105" r="58"/><circle cx="105" cy="105" r="12"/><path d="m148 62 38-38M166 24h20v20"/>',
    '<path d="M38 30h116l18 18v132H38zM154 30v20h18M60 72h90M60 98h90M60 124h64M60 150h76"/><circle cx="155" cy="146" r="23"/>'
  ];
  const overlay=document.createElement("div");
  overlay.id="mass-menu-overlay";overlay.className="mass-menu-overlay";overlay.hidden=true;overlay.setAttribute("aria-hidden","true");
  overlay.innerHTML=`<button class="mass-menu-backdrop" type="button" aria-label="Close navigation"></button>
    <div class="mass-menu-layer mass-menu-layer--one" aria-hidden="true"></div><div class="mass-menu-layer mass-menu-layer--two" aria-hidden="true"></div>
    <div class="mass-menu-panel"><div class="mass-menu-layout">
      <nav class="mass-menu-nav" aria-label="Full navigation"><p class="mass-menu-eyebrow">Navigate / MASS</p><ol class="mass-menu-list">${links.map(([href,label,num],i)=>`<li><a class="mass-menu-link" data-shape="${i}" href="${href}"${((href===current)||(href==="index.html"&&current===""))?' aria-current="page"':''}><span class="mass-menu-number">${num}</span><span>${label}</span><span class="mass-menu-arrow" aria-hidden="true">↗</span></a></li>`).join("")}</ol></nav>
      <aside class="mass-menu-visual" aria-hidden="true"><p>Digital systems<br>built to move.</p><div class="mass-menu-arts">${art.map((paths,i)=>`<svg class="mass-menu-art${i===0?' is-active':''}" data-art="${i}" viewBox="0 0 210 210" fill="none">${paths}</svg>`).join("")}</div><span>Herndon, Virginia · 38.9696° N</span></aside>
      <div class="mass-menu-meta"><a href="mailto:info@mass.llc">info@mass.llc</a><span>Web, AI and learning systems</span></div>
    </div></div>`;
  document.body.appendChild(overlay);
  const backdrop=overlay.querySelector(".mass-menu-backdrop"),panel=overlay.querySelector(".mass-menu-panel"),layers=[...overlay.querySelectorAll(".mass-menu-layer")],menuLinks=[...overlay.querySelectorAll(".mass-menu-link")],arts=[...overlay.querySelectorAll(".mass-menu-art")];
  const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
  let open=false,closing=false,lastFocus=null;
  const setArt=index=>arts.forEach((shape,i)=>shape.classList.toggle("is-active",i===index));
  menuLinks.forEach((link,i)=>{link.addEventListener("pointerenter",()=>setArt(i));link.addEventListener("focus",()=>setArt(i));link.addEventListener("click",event=>{const destination=new URL(link.href,location.href),samePage=destination.pathname===location.pathname&&destination.hash;if(!samePage){closeMenu(false);return}event.preventDefault();closeMenu(false);const moveToSection=()=>{const target=document.querySelector(destination.hash);if(!target)return;history.pushState(null,"",destination.hash);target.scrollIntoView({behavior:reduced?"auto":"smooth",block:"start"})};reduced?moveToSection():setTimeout(moveToSection,680)})});
  const openMenu=()=>{if(open||closing)return;open=true;lastFocus=document.activeElement;overlay.hidden=false;overlay.setAttribute("aria-hidden","false");document.body.classList.add("mass-menu-open");header.classList.add("mass-menu-header-open");trigger.classList.add("is-open");trigger.setAttribute("aria-expanded","true");trigger.setAttribute("aria-label","Close navigation");requestAnimationFrame(()=>{overlay.classList.add("is-open");if(reduced)menuLinks[0]?.focus();else setTimeout(()=>menuLinks[0]?.focus(),620)})};
  const closeMenu=(restore=true)=>{if(!open||closing)return;closing=true;open=false;overlay.classList.remove("is-open");trigger.classList.remove("is-open");trigger.setAttribute("aria-expanded","false");trigger.setAttribute("aria-label","Open navigation");const finish=()=>{overlay.hidden=true;overlay.setAttribute("aria-hidden","true");document.body.classList.remove("mass-menu-open");header.classList.remove("mass-menu-header-open");closing=false;if(restore)lastFocus?.focus()};reduced?finish():setTimeout(finish,650)};
  trigger.addEventListener("click",()=>open?closeMenu():openMenu());backdrop.addEventListener("click",()=>closeMenu());
  cta?.addEventListener("click",event=>{if(!open)return;const destination=new URL(cta.href,location.href);if(destination.pathname!==location.pathname||!destination.hash)return;event.preventDefault();closeMenu(false);const moveToSection=()=>{const target=document.querySelector(destination.hash);if(!target)return;history.pushState(null,"",destination.hash);target.scrollIntoView({behavior:reduced?"auto":"smooth",block:"start"})};reduced?moveToSection():setTimeout(moveToSection,680)});
  document.addEventListener("keydown",event=>{if(!open)return;if(event.key==="Escape"){event.preventDefault();closeMenu();return}if(event.key!=="Tab")return;const focusable=[...header.querySelectorAll("a[href],button:not([disabled])"),...panel.querySelectorAll("a[href],button:not([disabled])")].filter(element=>element.getClientRects().length&&getComputedStyle(element).visibility!=="hidden");if(!focusable.length)return;event.preventDefault();const index=focusable.indexOf(document.activeElement),step=event.shiftKey?-1:1;focusable[(index+step+focusable.length)%focusable.length].focus()});
  header.classList.add("mass-navigation-ready");
})();
