/* Canonical-domain metadata */
(()=>{
  const canonicalDomain="https://mass.llc";
  const cleanPath=(location.pathname==="/"||/\/index\.html$/i.test(location.pathname))?"/":location.pathname.replace(/\.html$/i,"");
  const canonicalUrl=canonicalDomain+cleanPath;
  const canonical=document.querySelector('link[rel="canonical"]');
  if(canonical)canonical.href=canonicalUrl;
  const ogUrl=document.querySelector('meta[property="og:url"]');
  if(ogUrl)ogUrl.content=canonicalUrl;
})();

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
  if(cta){cta.href="/contact";cta.innerHTML='Start a project <span aria-hidden="true">↗</span>'}
  const links=[
    ["/","Home","01"],["/about","About","02"],["/website","Web Services","03"],
    ["/agentic-ai","AI Services","04"],["/contact","Contact","05"],
    ["/blog","Blog","06"]
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
      <div class="mass-menu-meta"><a href="mailto:contact@mass.llc">contact@mass.llc</a><span>Web development + Agentic AI</span></div>
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
  document.addEventListener("keydown",event=>{if(!open)return;if(event.key==="Escape"){event.preventDefault();closeMenu();return}if(event.key!=="Tab")return;const focusable=[trigger,...menuLinks,cta].filter(Boolean),first=focusable[0],last=focusable[focusable.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}});
})();

/* Homepage hero-to-work scroll stack */
(()=>{
  const stack=document.querySelector(".home-scroll-stack"),hero=stack?.querySelector(".hero"),next=stack?.querySelector(".work-showcase");
  if(!stack||!hero||!next||typeof gsap==="undefined"||typeof ScrollTrigger==="undefined")return;
  gsap.registerPlugin(ScrollTrigger);
  const mm=gsap.matchMedia();
  mm.add({desktop:"(min-width: 801px)",mobile:"(max-width: 800px)",reduce:"(prefers-reduced-motion: reduce)"},context=>{
    const {desktop,reduce}=context.conditions;
    if(reduce){gsap.set([hero,next],{clearProps:"transform,borderRadius,boxShadow"});return}
    const heroTween=gsap.to(hero,{scale:desktop ? .82 : .94,rotation:desktop ? -4.5 : -1.2,yPercent:desktop ? -2 : 0,borderRadius:desktop ? "0 0 28px 28px" : "0 0 14px 14px",ease:"none",scrollTrigger:{id:"mass-home-hero",trigger:stack,start:()=>`top ${desktop ? 82 : 70}px`,end:()=>`+=${innerHeight*.92}`,scrub:.55,invalidateOnRefresh:true}});
    const nextTween=gsap.fromTo(next,{scale:desktop ? .86 : .97,rotation:desktop ? 4.5 : 1.1,y:desktop ? 70 : 24,borderRadius:desktop ? "28px 28px 0 0" : "14px 14px 0 0",boxShadow:"0 -34px 75px rgba(0,0,0,.28)"},{scale:1,rotation:0,y:0,borderRadius:"0px",boxShadow:"0 -8px 30px rgba(0,0,0,.08)",ease:"none",scrollTrigger:{id:"mass-home-work",trigger:next,start:"top bottom",end:()=>`top ${desktop ? 82 : 70}px`,scrub:.55,invalidateOnRefresh:true}});
    return()=>{heroTween.kill();nextTween.kill()};
  });
  document.fonts?.ready.then(()=>ScrollTrigger.refresh());
})();

/* Selected work — four-step scroll reveal */
(()=>{
  const section=document.querySelector(".web-work"),scrollArea=section?.querySelector(".web-work-scroll"),items=[...(section?.querySelectorAll(".web-work-card")||[])],images=[...(section?.querySelectorAll(".web-work-media img")||[])],rail=section?.querySelector(".web-work-rail i");
  if(!section||!scrollArea||items.length!==4||images.length!==4||!rail||typeof gsap==="undefined"||typeof ScrollTrigger==="undefined")return;
  gsap.registerPlugin(ScrollTrigger);
  const mm=gsap.matchMedia();
  mm.add({desktop:"(min-width: 801px)",reduce:"(prefers-reduced-motion: reduce)"},context=>{
    const {desktop,reduce}=context.conditions;
    if(!desktop||reduce)return;
    const update=progress=>{
      const position=Math.min(.9999,Math.max(0,progress))*4,index=Math.min(3,Math.floor(position)),local=position-index;
      items.forEach((item,itemIndex)=>item.classList.toggle("is-active",itemIndex===index));
      images.forEach((image,imageIndex)=>image.classList.toggle("is-active",imageIndex===index));
      rail.style.height=`${((index+local)/4)*100}%`;
    };
    update(0);
    const trigger=ScrollTrigger.create({id:"mass-web-work",trigger:scrollArea,start:"top 82px",end:"bottom bottom",scrub:.45,invalidateOnRefresh:true,onUpdate:self=>update(self.progress)});
    return()=>trigger.kill();
  });
  document.fonts?.ready.then(()=>ScrollTrigger.refresh());
})();

/* Web development scroll-scrub sequence */
/* AI product ecosystem — five-step scroll reveal */
(()=>{
  const section=document.querySelector(".product-ecosystem"),scrollArea=section?.querySelector(".product-scroll"),items=[...(section?.querySelectorAll(".product-card")||[])],marks=[...(section?.querySelectorAll(".product-media .product-card-mark")||[])],rail=section?.querySelector(".product-rail i");
  if(!section||!scrollArea||items.length!==5||marks.length!==5||!rail||typeof gsap==="undefined"||typeof ScrollTrigger==="undefined")return;
  gsap.registerPlugin(ScrollTrigger);
  const mm=gsap.matchMedia();
  mm.add({desktop:"(min-width: 801px)",reduce:"(prefers-reduced-motion: reduce)"},context=>{
    const {desktop,reduce}=context.conditions;
    if(!desktop||reduce)return;
    const update=progress=>{
      const position=Math.min(.9999,Math.max(0,progress))*5,index=Math.min(4,Math.floor(position)),local=position-index;
      items.forEach((item,itemIndex)=>item.classList.toggle("is-active",itemIndex===index));
      marks.forEach((mark,markIndex)=>mark.classList.toggle("is-active",markIndex===index));
      rail.style.height=`${((index+local)/5)*100}%`;
    };
    update(0);
    const trigger=ScrollTrigger.create({id:"mass-ai-products",trigger:scrollArea,start:"top 82px",end:"bottom 18%",scrub:.45,invalidateOnRefresh:true,onUpdate:self=>update(self.progress)});
    return()=>trigger.kill();
  });
  document.fonts?.ready.then(()=>ScrollTrigger.refresh());
})();
/* About — word-by-word scroll highlight */
(()=>{
  const paragraphs=[...document.querySelectorAll(".about-section .scroll-highlight")];
  if(!paragraphs.length)return;
  paragraphs.forEach(paragraph=>{const words=paragraph.textContent.trim().split(/\s+/);paragraph.textContent="";words.forEach((word,index)=>{const span=document.createElement("span");span.className="scroll-word";span.textContent=word;paragraph.append(span);if(index<words.length-1)paragraph.append(document.createTextNode(" "))})});
  const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
  if(reduced||typeof gsap==="undefined"||typeof ScrollTrigger==="undefined")return;
  gsap.registerPlugin(ScrollTrigger);
  paragraphs.forEach((paragraph,index)=>{const words=[...paragraph.querySelectorAll(".scroll-word")];gsap.set(words,{color:"rgba(250,250,247,.24)"});gsap.to(words,{color:"#fafaf7",stagger:.1,ease:"none",scrollTrigger:{id:`mass-about-highlight-${index+1}`,trigger:paragraph,start:"top 78%",end:"bottom 42%",scrub:true,invalidateOnRefresh:true}})});
  document.fonts?.ready.then(()=>ScrollTrigger.refresh());
})();

/* About page — scroll-driven cinematic journey */
(()=>{
  const hero=document.querySelector(".about-story"),canvas=document.querySelector(".about-hero-canvas"),cue=document.querySelector(".about-scroll-cue");
  if(!hero||!canvas)return;
  const context=canvas.getContext("2d",{alpha:false}),frameCount=192,reduced=matchMedia("(prefers-reduced-motion: reduce)").matches,compact=matchMedia("(max-width: 800px)").matches,lowEnd=(navigator.hardwareConcurrency||8)<=4||navigator.connection?.saveData;
  const cache=new Map(),maxCache=compact||lowEnd?20:36;
  let wanted=reduced?Math.floor(frameCount*.42):0,displayed=wanted,clock=0,raf=0,canvasWidth=1280,canvasHeight=960;
  const src=index=>`assets/frame-sequences/about-journey/frame_${String(index+1).padStart(4,"0")}.webp`;
  const trim=()=>{if(cache.size<=maxCache)return;const entries=[...cache.entries()].filter(([index,item])=>index!==wanted&&item.ready).sort((a,b)=>a[1].used-b[1].used);while(cache.size>maxCache&&entries.length){const [index,item]=entries.shift();item.img.onload=null;item.img.src="";cache.delete(index)}};
  const paint=item=>{const image=item.img,iw=image.naturalWidth||1280,ih=image.naturalHeight||960,scale=Math.max(canvasWidth/iw,canvasHeight/ih),dw=iw*scale,dh=ih*scale;context.fillStyle="#050505";context.fillRect(0,0,canvasWidth,canvasHeight);context.drawImage(image,(canvasWidth-dw)/2,(canvasHeight-dh)/2,dw,dh)};
  const draw=index=>{index=Math.max(0,Math.min(frameCount-1,Math.round(index)));let item=cache.get(index);if(!item?.ready){for(let distance=1;distance<20&&!item?.ready;distance++)item=cache.get(Math.max(0,index-distance))?.ready?cache.get(Math.max(0,index-distance)):cache.get(Math.min(frameCount-1,index+distance))}if(!item?.ready)return;item.used=++clock;paint(item)};
  const load=index=>{index=Math.max(0,Math.min(frameCount-1,Math.round(index)));if(cache.has(index)){cache.get(index).used=++clock;return}const img=new Image(),item={img,ready:false,used:++clock};cache.set(index,item);img.decoding="async";img.onload=()=>{item.ready=true;if(Math.abs(index-wanted)<4||cache.size===1)draw(displayed);trim()};img.src=src(index)};
  const primeAround=index=>{load(index);const reach=compact||lowEnd?4:8;for(let offset=1;offset<=reach;offset++){load(index+offset);if(offset<=3)load(index-offset)}};
  const resize=()=>{const rect=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,1.5);canvasWidth=Math.max(1,Math.round(rect.width*dpr));canvasHeight=Math.max(1,Math.round(rect.height*dpr));if(canvas.width!==canvasWidth||canvas.height!==canvasHeight){canvas.width=canvasWidth;canvas.height=canvasHeight}draw(displayed)};
  const measure=()=>{
    const rect=hero.getBoundingClientRect(),distance=Math.max(1,hero.offsetHeight-innerHeight),progress=Math.max(0,Math.min(1,-rect.top/distance));
    wanted=progress*(frameCount-1);primeAround(wanted);
    if(cue)cue.style.opacity=String(Math.max(0,1-progress*4));
  };
  const render=()=>{
    displayed+=(wanted-displayed)*(compact?.2:.14);
    draw(displayed);
    raf=requestAnimationFrame(render);
  };
  primeAround(wanted);resize();
  if(!reduced){measure();cancelAnimationFrame(raf);render()}
  const preloadObserver=new IntersectionObserver(entries=>{if(!entries.some(entry=>entry.isIntersecting))return;for(let index=0;index<frameCount;index+=(compact||lowEnd?18:12))load(index);primeAround(wanted);preloadObserver.disconnect()},{rootMargin:"45% 0px"});
  preloadObserver.observe(hero);
  addEventListener("scroll",measure,{passive:true});
  addEventListener("resize",()=>{resize();measure()},{passive:true});
})();

/* Field Notes — cursor-following article preview */
(()=>{
  const section=document.querySelector(".field-notes-section"),rows=[...document.querySelectorAll(".field-notes-section .post")];
  if(!section||!rows.length)return;
  const fine=matchMedia("(hover: hover) and (pointer: fine)").matches,reduced=matchMedia("(prefers-reduced-motion: reduce)").matches,lowEnd=(navigator.hardwareConcurrency||8)<=2;
  if(!fine||reduced||lowEnd||typeof gsap==="undefined"){document.documentElement.classList.add("field-notes-static");return}
  const preview=document.createElement("div");
  preview.className="field-notes-preview";preview.setAttribute("aria-hidden","true");
  preview.innerHTML=`<div class="field-notes-preview-images">${rows.map((row,index)=>{const source=row.querySelector(".post-media img");return `<img class="field-notes-preview-image" data-preview="${index}" src="${source.src}" alt="">`}).join("")}</div><span class="field-notes-preview-read">READ</span>`;
  document.body.appendChild(preview);
  const images=[...preview.querySelectorAll(".field-notes-preview-image")],xTo=gsap.quickTo(preview,"x",{duration:.48,ease:"power3.out"}),yTo=gsap.quickTo(preview,"y",{duration:.48,ease:"power3.out"});
  let active=-1,shown=false;
  gsap.set(preview,{autoAlpha:0,scale:.82,transformOrigin:"50% 50%"});gsap.set(images,{autoAlpha:0,scale:1.08});
  const move=event=>{const width=preview.offsetWidth,height=preview.offsetHeight,pad=18;let left=event.clientX+52;if(left+width+52>innerWidth)left=event.clientX-width-68;const top=Math.max(pad,Math.min(innerHeight-height-pad,event.clientY-height*.5));xTo(left);yTo(top)};
  const select=index=>{if(index===active)return;const previous=images[active],next=images[index];if(previous)gsap.to(previous,{autoAlpha:0,scale:.96,duration:.24,ease:"power2.in",overwrite:"auto"});gsap.fromTo(next,{autoAlpha:0,scale:1.08},{autoAlpha:1,scale:1,duration:.46,ease:"power3.out",overwrite:"auto"});active=index};
  const show=event=>{move(event);if(!shown){shown=true;document.documentElement.classList.add("field-notes-preview-active");gsap.to(preview,{autoAlpha:1,scale:1,duration:.38,ease:"power3.out",overwrite:"auto"})}};
  const hide=()=>{shown=false;document.documentElement.classList.remove("field-notes-preview-active");gsap.to(preview,{autoAlpha:0,scale:.84,duration:.28,ease:"power2.in",overwrite:"auto"})};
  rows.forEach((row,index)=>row.addEventListener("pointerenter",event=>{select(index);show(event)}));
  section.querySelector(".blog-grid")?.addEventListener("pointermove",event=>{if(shown)move(event)},{passive:true});
  section.querySelector(".blog-grid")?.addEventListener("pointerleave",hide);
  addEventListener("blur",hide);document.addEventListener("visibilitychange",()=>{if(document.hidden)hide()});
})();

/* Homepage — audience and problem explorers */
(()=>{
  const audienceData={
    technology:{index:"01",title:"Technology companies",summary:"Turn complex products into clear digital experiences—and connect the systems behind them.",needs:["Product and solution websites that explain technical value clearly","Customer portals and workflow tools built around real operations","AI agents that connect support, reporting, and internal knowledge"],outcomes:["Sharper product positioning","Faster paths from interest to action","Less operational friction as you scale"]},
    staffing:{index:"02",title:"Staffing & recruitment",summary:"Move candidates and clients through the hiring journey with less administrative drag.",needs:["Career and recruitment experiences built around candidate intent","Screening and qualification workflows with human review","Connected ATS, CRM, email, and document processes"],outcomes:["Faster response to strong candidates","More consistent screening and follow-up","A clearer experience for candidates and clients"]},
    ecommerce:{index:"03",title:"E-commerce",summary:"Create a faster buying experience while reducing the manual work behind every order.",needs:["Conversion-focused storefronts and product journeys","Automated order, inventory, and customer updates","Support agents grounded in your products and policies"],outcomes:["Fewer barriers between discovery and checkout","Faster answers before and after purchase","Operations that handle growth more reliably"]},
    professional:{index:"04",title:"Professional services",summary:"Make expertise easier to understand, trust, and buy—then streamline the work after the enquiry.",needs:["Authority-building websites with clear service pathways","Lead qualification and appointment workflows","Knowledge and document systems for delivery teams"],outcomes:["A stronger first impression","Better-qualified enquiries","Less time spent coordinating routine work"]},
    startups:{index:"05",title:"Startups",summary:"Validate the right product quickly without building a fragile foundation you have to replace.",needs:["Focused MVPs and launch-ready marketing sites","Fast product prototyping around real user journeys","Practical AI features tied to a specific job"],outcomes:["A shorter path from idea to feedback","Clearer product learning","A maintainable base for the next stage"]},
    operations:{index:"06",title:"Operations-heavy businesses",summary:"Connect fragmented processes so information moves accurately without constant human chasing.",needs:["Workflow mapping across teams, tools, and documents","Automations with validation, approvals, and exception handling","Operational dashboards and AI-assisted coordination"],outcomes:["Fewer repetitive handoffs","Cleaner and more visible information","More capacity without adding busywork"]}
  };
  const problemData={
    "data-entry":{index:"01",title:"Manual data entry",summary:"People repeatedly copy, paste, and retype information between tools—slowing the work and creating avoidable errors.",happening:"Forms, emails, spreadsheets, and PDFs hold related information, but people must move it manually because the systems do not connect.",build:"Reliable automations that capture, validate, and route information between your existing tools—with clear review points where people still need control.",change:"Cleaner records, fewer handoffs, and more time for decisions and customer work instead of repetitive administration."},
    "lead-response":{index:"02",title:"Slow lead response",summary:"Good enquiries wait in an inbox while teams qualify, assign, and answer them by hand.",happening:"Lead details arrive through different channels, ownership is unclear, and the first useful response depends on someone being available.",build:"A connected intake and qualification flow that enriches each enquiry, routes it correctly, and prepares a relevant first response for approval.",change:"Prospects hear from the right person sooner, while sales teams begin with the context they need."},
    support:{index:"03",title:"Repetitive customer support",summary:"Support teams answer the same questions repeatedly while complex cases compete for attention.",happening:"Useful answers are spread across help documents, past tickets, product notes, and individual team members’ knowledge.",build:"A support assistant grounded in approved sources that resolves routine questions and escalates uncertain or sensitive cases with context.",change:"Customers get faster, more consistent help and specialists can focus on issues that require judgement."},
    screening:{index:"04",title:"Manual candidate screening",summary:"Recruiters spend hours reviewing similar profiles before they can speak with the people most likely to fit.",happening:"Requirements, resumes, notes, and availability are compared manually, making early screening slow and inconsistent.",build:"A structured screening workflow that extracts relevant evidence, applies agreed criteria, and presents recommendations for recruiter review.",change:"Recruiters reach suitable candidates sooner while keeping hiring decisions transparent and human-led."},
    "scattered-data":{index:"05",title:"Scattered business data",summary:"Teams make decisions from partial information because important data lives in disconnected tools.",happening:"Customer, operational, and financial records use different structures and are updated on different schedules.",build:"A dependable integration and reporting layer that reconciles key records, documents sources, and highlights exceptions.",change:"Teams work from a shared view of the business and spend less time debating which number is correct."},
    documents:{index:"06",title:"Inefficient document workflows",summary:"Documents move through email threads, folders, and spreadsheets with unclear status and repeated checking.",happening:"Information must be extracted, renamed, verified, approved, and entered elsewhere before the process can continue.",build:"A document pipeline that classifies files, extracts required fields, validates them, and routes exceptions to the right reviewer.",change:"Documents move faster with a clear audit trail, while people concentrate on exceptions instead of routine handling."},
    websites:{index:"07",title:"Outdated websites",summary:"The website no longer reflects the business, performs poorly, or makes important information difficult to find.",happening:"Years of additions have weakened the structure, mobile experience, technical foundation, and clarity of the customer journey.",build:"A modern, accessible website with purposeful information architecture, fast delivery, clean analytics, and maintainable content patterns.",change:"Visitors understand the offer more quickly, the team can update content confidently, and the site supports current growth goals."},
    conversion:{index:"08",title:"Poor conversion rates",summary:"Traffic reaches the site, but too few visitors take the next useful step.",happening:"Messaging, proof, page speed, calls to action, or form friction create uncertainty at key decision points.",build:"A measured conversion redesign that clarifies intent, removes friction, strengthens proof, and instruments the journey for learning.",change:"More visitors reach an appropriate next step, and future decisions are based on visible behaviour rather than guesswork."}
  };
  const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
  const transition=(panel,update)=>{
    panel.classList.add("is-changing");
    if(typeof gsap==="undefined"||reduced){update();panel.classList.remove("is-changing");return}
    gsap.to(panel,{autoAlpha:0,y:12,duration:.16,ease:"power2.in",overwrite:true,onComplete:()=>{update();gsap.fromTo(panel,{autoAlpha:0,y:12},{autoAlpha:1,y:0,duration:.34,ease:"power3.out",clearProps:"transform,opacity,visibility",onComplete:()=>panel.classList.remove("is-changing")})}})
  };
  const wireTabs=(listSelector,panelSelector,data,render)=>{
    const buttons=[...document.querySelectorAll(listSelector)],panel=document.querySelector(panelSelector);
    if(!buttons.length||!panel)return;
    const select=button=>{
      if(button.classList.contains("is-active"))return;
      buttons.forEach(item=>{const active=item===button;item.classList.toggle("is-active",active);item.setAttribute("aria-selected",String(active));item.tabIndex=active?0:-1});
      transition(panel,()=>render(panel,data[button.dataset.audience||button.dataset.problem]));
    };
    buttons.forEach((button,index)=>{
      button.tabIndex=index===0?0:-1;
      button.addEventListener("click",()=>select(button));
      button.addEventListener("keydown",event=>{if(!["ArrowDown","ArrowRight","ArrowUp","ArrowLeft","Home","End"].includes(event.key))return;event.preventDefault();let next=index;if(event.key==="Home")next=0;else if(event.key==="End")next=buttons.length-1;else next=(index+(["ArrowDown","ArrowRight"].includes(event.key)?1:-1)+buttons.length)%buttons.length;buttons[next].focus();select(buttons[next])});
    });
  };
  wireTabs(".audience-option","#audience-panel",audienceData,(panel,item)=>{
    panel.querySelector(".audience-panel-index").textContent=item.index;panel.querySelector("h3").textContent=item.title;panel.querySelector(".audience-summary").textContent=item.summary;
    [[".audience-needs",item.needs],[".audience-outcomes",item.outcomes]].forEach(([selector,values])=>{const list=panel.querySelector(selector);list.replaceChildren(...values.map(value=>{const li=document.createElement("li");li.textContent=value;return li}))});
  });
  wireTabs(".problem-option","#problem-panel",problemData,(panel,item)=>{
    panel.querySelector(".problem-panel-index").textContent=item.index;panel.querySelector("h3").textContent=item.title;panel.querySelector(".problem-summary").textContent=item.summary;panel.querySelector(".problem-happening").textContent=item.happening;panel.querySelector(".problem-build").textContent=item.build;panel.querySelector(".problem-change").textContent=item.change;
  });
  if(typeof gsap!=="undefined"&&typeof ScrollTrigger!=="undefined"&&!reduced){
    gsap.registerPlugin(ScrollTrigger);
    [".audience-section",".problems-section"].forEach(selector=>{const section=document.querySelector(selector);if(!section)return;const targets=section.querySelectorAll(".audience-intro > *, .problems-heading > *, .audience-list, .problems-list, .audience-panel, .problem-panel");gsap.from(targets,{y:28,autoAlpha:0,duration:.72,stagger:.08,ease:"power3.out",scrollTrigger:{trigger:section,start:"top 76%",once:true}})});
  }
})();

/* Homepage — Why MASS principle runway */
(()=>{
  const section=document.querySelector(".why-mass-section"),panel=section?.querySelector(".why-mass-panel"),evidence=section?.querySelector(".why-mass-evidence"),steps=[...(section?.querySelectorAll(".why-mass-step")||[])];
  if(!section||!panel||!evidence||!steps.length)return;
  const principles=[
    {key:"business",index:"01",title:"Business-first development",summary:"We begin with the business goal, the people affected, and the constraints. Technology follows the outcome—not the other way around.",decision:"We validate the real problem, define success, and prioritise what will move the business forward.",method:"Requirements, scope, and technical choices are evaluated against the agreed outcome.",experience:"You can see why decisions are made and how each deliverable supports the goal."},
    {key:"one-team",index:"02",title:"One team across design and development",summary:"Strategy, design, engineering, automation, and AI move through one connected workflow instead of separate handoffs.",decision:"Product and technical decisions are considered together, so feasibility and user experience stay aligned.",method:"The same team carries context from discovery through design, development, testing, and launch.",experience:"You work with one accountable partner and spend less time repeating context between specialists."},
    {key:"automation",index:"03",title:"Automation-ready architecture",summary:"Websites and applications are planned to exchange information with the systems your business already uses.",decision:"We identify where data should enter, move, be checked, and trigger the next approved action.",method:"Clear system boundaries and dependable integrations make later automation practical rather than disruptive.",experience:"New workflows can connect to the product without rebuilding its foundations every time."},
    {key:"scale",index:"04",title:"Built for scalability",summary:"The architecture supports the next realistic stage of the business while avoiding complexity that has no current purpose.",decision:"We separate immediate requirements from likely growth needs and design the right extension points.",method:"Maintainable components, clear data structures, and measured performance keep change manageable.",experience:"The product can evolve with new users, workflows, and services without becoming fragile."},
    {key:"transparent",index:"05",title:"Transparent development",summary:"Progress, trade-offs, and changes stay visible so decisions are made with shared context.",decision:"Milestones and deliverables define what success looks like before work moves into implementation.",method:"Regular demonstrations, plain-language updates, and documented decisions keep delivery understandable.",experience:"You know what is complete, what comes next, and where your input is needed."}
  ];
  const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
  const prevPeek=section.querySelector(".why-mass-peek-prev"),nextPeek=section.querySelector(".why-mass-peek-next");
  let active=0,startX=0,dragging=false;
  const setPeek=(element,item)=>{element.querySelector("span").textContent=item.index;element.querySelector("strong").textContent=item.title};
  const render=index=>{
    active=(index+principles.length)%principles.length;
    const item=principles[active],previous=principles[(active-1+principles.length)%principles.length],next=principles[(active+1)%principles.length];
    panel.querySelector(".why-mass-index").textContent=item.index;panel.querySelector("h3").textContent=item.title;panel.querySelector(".why-mass-principle p").textContent=item.summary;
    evidence.querySelector(".why-mass-decision").textContent=item.decision;evidence.querySelector(".why-mass-method").textContent=item.method;evidence.querySelector(".why-mass-experience").textContent=item.experience;
    setPeek(prevPeek,previous);setPeek(nextPeek,next);
    steps.forEach((step,stepIndex)=>{const selected=stepIndex===active;step.classList.toggle("is-active",selected);step.setAttribute("aria-selected",String(selected));step.tabIndex=selected?0:-1});
  };
  const select=(index,direction=index>active?1:-1)=>{
    if(index===active)return;
    const targets=[panel,evidence,prevPeek,nextPeek];targets.forEach(target=>target.classList.add("is-changing"));
    if(typeof gsap==="undefined"||reduced){render(index);targets.forEach(target=>target.classList.remove("is-changing"));return}
    gsap.to(targets,{autoAlpha:0,x:-direction*20,duration:.17,ease:"power2.in",overwrite:true,onComplete:()=>{render(index);gsap.fromTo(targets,{autoAlpha:0,x:direction*20},{autoAlpha:1,x:0,duration:.38,stagger:.035,ease:"power3.out",clearProps:"transform,opacity,visibility",onComplete:()=>targets.forEach(target=>target.classList.remove("is-changing"))})}})
  };
  steps.forEach((step,index)=>{step.addEventListener("click",()=>select(index));step.addEventListener("keydown",event=>{if(!["ArrowLeft","ArrowRight","Home","End"].includes(event.key))return;event.preventDefault();const target=event.key==="Home"?0:event.key==="End"?steps.length-1:(index+(event.key==="ArrowRight"?1:-1)+steps.length)%steps.length;steps[target].focus();select(target,event.key==="ArrowLeft"?-1:1)})});
  section.querySelector(".why-mass-prev").addEventListener("click",()=>select((active-1+principles.length)%principles.length,-1));section.querySelector(".why-mass-next").addEventListener("click",()=>select((active+1)%principles.length,1));
  section.querySelector(".why-mass-stage").addEventListener("pointerdown",event=>{if(event.pointerType==="mouse"&&event.button!==0)return;startX=event.clientX;dragging=true},{passive:true});
  section.querySelector(".why-mass-stage").addEventListener("pointerup",event=>{if(!dragging)return;dragging=false;const distance=event.clientX-startX;if(Math.abs(distance)>48)select((active+(distance<0?1:-1)+principles.length)%principles.length,distance<0?1:-1)},{passive:true});
  if(typeof gsap!=="undefined"&&typeof ScrollTrigger!=="undefined"&&!reduced){gsap.registerPlugin(ScrollTrigger);gsap.from([section.querySelector(".why-mass-heading"),section.querySelector(".why-mass-progress"),section.querySelector(".why-mass-stage"),evidence],{y:26,autoAlpha:0,duration:.72,stagger:.09,ease:"power3.out",scrollTrigger:{trigger:section,start:"top 76%",once:true}})}
})();
/* Homepage FAQ tabs and accordions */
(()=>{
  const section=document.querySelector(".faq-section");
  if(!section)return;
  const tabs=[...section.querySelectorAll(".faq-tab")],panels=[...section.querySelectorAll(".faq-panel")];
  const activateTab=(tab,moveFocus=false)=>{
    tabs.forEach(item=>{const active=item===tab;item.classList.toggle("is-active",active);item.setAttribute("aria-selected",String(active));item.tabIndex=active?0:-1});
    panels.forEach(panel=>panel.hidden=panel.id!==tab.getAttribute("aria-controls"));
    if(moveFocus)tab.focus();
  };
  tabs.forEach((tab,index)=>{
    tab.addEventListener("click",()=>activateTab(tab));
    tab.addEventListener("keydown",event=>{
      if(!["ArrowLeft","ArrowRight","Home","End"].includes(event.key))return;
      event.preventDefault();
      const target=event.key==="Home"?0:event.key==="End"?tabs.length-1:(index+(event.key==="ArrowRight"?1:-1)+tabs.length)%tabs.length;
      activateTab(tabs[target],true);
    });
  });
  section.querySelectorAll(".faq-item h3 button").forEach(button=>button.addEventListener("click",()=>{
    const item=button.closest(".faq-item"),panel=item.closest(".faq-panel"),opening=!item.classList.contains("is-open");
    panel.querySelectorAll(".faq-item").forEach(other=>{other.classList.remove("is-open");other.querySelector("h3 button").setAttribute("aria-expanded","false")});
    if(opening){item.classList.add("is-open");button.setAttribute("aria-expanded","true")}
  }));
})();

const form=document.querySelector("#contact-form");
form?.addEventListener("submit",e=>{e.preventDefault();let ok=true;const fields=[...form.querySelectorAll("[required]")];fields.forEach(f=>{const err=f.parentElement.querySelector(".error");let msg="";if(!f.value.trim())msg="This field is required.";else if(f.type==="email"&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value))msg="Enter a valid email address.";f.setAttribute("aria-invalid",!!msg);err.textContent=msg;ok=!msg&&ok});if(ok){form.reset();form.hidden=true;const success=document.querySelector(".success");success.classList.add("show");success.focus()}});
if(!matchMedia("(prefers-reduced-motion: reduce)").matches&&navigator.hardwareConcurrency>4){document.addEventListener("pointermove",e=>{document.documentElement.style.setProperty("--mx",e.clientX+"px");document.documentElement.style.setProperty("--my",e.clientY+"px")},{passive:true})}
(()=>{
  const fine=matchMedia("(hover: hover) and (pointer: fine)").matches,reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
  if(!fine||reduced)return;
  const dot=document.createElement("span"),ring=document.createElement("span");dot.className="mass-cursor-dot";ring.className="mass-cursor-ring";dot.setAttribute("aria-hidden","true");ring.setAttribute("aria-hidden","true");document.body.append(dot,ring);document.documentElement.classList.add("has-mass-cursor");
  let x=-100,y=-100,rx=-100,ry=-100,visible=false,raf=0;
  const aboutPage=!!document.querySelector(".about-story");
  if(aboutPage)document.documentElement.classList.add("about-neon-cursor");
  const darkSelector=".hero,.dark,.web-work,.site-header.dark,.ai-editorial,.ai-page,.product-page,.article-hero,.product-hero,.article-callout,.footer,.site-footer,.about-static-hero,.principles,.page-hero,.contact-form-section,.testimonial-scroll-section";
  const interactiveSelector="a,button,[role='button'],summary,.post,.product-card,.web-work-card,input,textarea,select";
  const setTone=target=>{const light=!aboutPage&&(!!target?.closest(".product-ecosystem")||!target?.closest(darkSelector));dot.classList.toggle("is-light",light);ring.classList.toggle("is-light",light)};
  const animate=()=>{rx+=(x-rx)*.16;ry+=(y-ry)*.16;dot.style.transform=`translate3d(${x}px,${y}px,0)`;ring.style.transform=`translate3d(${rx}px,${ry}px,0)`;raf=requestAnimationFrame(animate)};
  document.addEventListener("pointermove",e=>{x=e.clientX;y=e.clientY;if(!visible){visible=true;dot.classList.add("is-visible");ring.classList.add("is-visible");rx=x;ry=y}const target=document.elementFromPoint(x,y);setTone(target);const textField=target?.closest("input,textarea,select,[contenteditable='true']");dot.style.opacity=textField?"0":"";ring.style.opacity=textField?"0":"";ring.classList.toggle("is-active",!!target?.closest(interactiveSelector)&&!textField)},{passive:true});
  document.addEventListener("pointerdown",()=>ring.classList.add("is-pressed"),{passive:true});document.addEventListener("pointerup",()=>ring.classList.remove("is-pressed"),{passive:true});document.documentElement.addEventListener("mouseleave",()=>{visible=false;dot.classList.remove("is-visible");ring.classList.remove("is-visible")});window.addEventListener("blur",()=>{dot.classList.remove("is-visible");ring.classList.remove("is-visible")});raf=requestAnimationFrame(animate);
})();
const heroLiquidGrid=document.querySelector(".hero-liquid-grid");
if(heroLiquidGrid){
  const ctx=heroLiquidGrid.getContext("2d"),hero=heroLiquidGrid.closest(".hero"),reduced=matchMedia("(prefers-reduced-motion: reduce)").matches,lowEnd=(navigator.hardwareConcurrency||8)<=4;
  let width=0,height=0,dpr=1,raf=0,pointer={x:0,y:0,active:false},ripples=[];
  const resizeGrid=()=>{const r=hero.getBoundingClientRect();width=Math.max(1,r.width);height=Math.max(1,r.height);dpr=Math.min(devicePixelRatio||1,2);heroLiquidGrid.width=Math.round(width*dpr);heroLiquidGrid.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0)};
  const drawGrid=time=>{ctx.clearRect(0,0,width,height);ctx.fillStyle="#000";ctx.fillRect(0,0,width,height);const cell=lowEnd?34:26,radius=115,now=time||0;for(let y=-cell;y<height+cell;y+=cell){ctx.beginPath();for(let x=-cell;x<width+cell;x+=cell){let dx=0,dy=0,glow=0;if(pointer.active&&!reduced){const px=x-pointer.x,py=y-pointer.y,d=Math.hypot(px,py)||1;if(d<radius){const f=(1-d/radius);dy+=Math.sin(d*.085-now*.007)*f*8;dx+=px/d*f*2.5;glow=Math.max(glow,f)}}for(const ring of ripples){const d=Math.hypot(x-ring.x,y-ring.y),gap=Math.abs(d-ring.r);if(gap<28){const f=(1-gap/28)*ring.a;dy+=Math.sin(gap*.16)*f*10;glow=Math.max(glow,f)}}const xx=x+dx,yy=y+dy;if(x===-cell)ctx.moveTo(xx,yy);else ctx.lineTo(xx,yy)}ctx.strokeStyle="rgba(255,255,255,.105)";ctx.lineWidth=.7;ctx.stroke()}for(let x=-cell;x<width+cell;x+=cell){ctx.beginPath();for(let y=-cell;y<height+cell;y+=cell){let dx=0,dy=0,glow=0;if(pointer.active&&!reduced){const px=x-pointer.x,py=y-pointer.y,d=Math.hypot(px,py)||1;if(d<radius){const f=1-d/radius;dx+=Math.sin(d*.085-now*.007)*f*8;dy+=py/d*f*2.5;glow=Math.max(glow,f)}}for(const ring of ripples){const d=Math.hypot(x-ring.x,y-ring.y),gap=Math.abs(d-ring.r);if(gap<28){const f=(1-gap/28)*ring.a;dx+=Math.sin(gap*.16)*f*10;glow=Math.max(glow,f)}}const xx=x+dx,yy=y+dy;if(y===-cell)ctx.moveTo(xx,yy);else ctx.lineTo(xx,yy)}ctx.strokeStyle="rgba(255,255,255,.105)";ctx.lineWidth=.7;ctx.stroke()}if(!reduced&&!lowEnd){ctx.fillStyle="#CFFF04";for(let y=0;y<height;y+=cell)for(let x=0;x<width;x+=cell){const d=pointer.active?Math.hypot(x-pointer.x,y-pointer.y):999;if(d<radius){const a=(1-d/radius)*.55;ctx.globalAlpha=a;ctx.beginPath();ctx.arc(x,y,1.1+a*1.4,0,Math.PI*2);ctx.fill()}}ctx.globalAlpha=1}ripples=ripples.map(r=>({...r,r:r.r+3.2,a:r.a*.966})).filter(r=>r.a>.04&&r.r<Math.hypot(width,height));if(!reduced)raf=requestAnimationFrame(drawGrid)};
  const local=e=>{const r=hero.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top}};
  hero.addEventListener("pointermove",e=>{if(reduced||lowEnd)return;pointer={...local(e),active:true}},{passive:true});hero.addEventListener("pointerleave",()=>pointer.active=false);hero.addEventListener("pointerdown",e=>{if(reduced||lowEnd)return;const p=local(e);ripples.push({...p,r:0,a:1});if(ripples.length>4)ripples.shift()});
  resizeGrid();drawGrid(0);addEventListener("resize",()=>{resizeGrid();if(reduced||lowEnd)drawGrid(0)},{passive:true});
}

/* Blog — interactive luminous globe mesh */
(()=>{
  const mount=document.querySelector(".blog-globe");
  if(!mount||typeof THREE==="undefined")return;
  const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
  let renderer,scene,camera,globe,frame=0,dragging=false,lastX=0,lastY=0,velocityX=0,velocityY=0,aimX=0,aimY=0,grip=0,targetGrip=0;
  try{renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:"low-power"})}catch{return}
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.setClearColor(0x000000,0);mount.appendChild(renderer.domElement);
  scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(38,1,.1,100);camera.position.z=4.2;globe=new THREE.Group();scene.add(globe);
  const radius=1.24,cageMaterial=new THREE.LineBasicMaterial({color:0x55ff56,transparent:true,opacity:.27});const cage=new THREE.LineSegments(new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(radius*1.17,1)),cageMaterial);globe.add(cage);
  const points=[],colors=[],base=new THREE.Color("#d8ccff"),lime=new THREE.Color("#57ff4b"),pink=new THREE.Color("#ffb3dc");for(let row=1;row<30;row++)for(let col=0;col<64;col++){const phi=Math.PI*row/30,theta=2*Math.PI*col/64,r=radius*.975;points.push(r*Math.sin(phi)*Math.cos(theta),r*Math.cos(phi),r*Math.sin(phi)*Math.sin(theta));const c=base.clone();if(Math.sin(theta*.85+phi*1.4)>.64)c.lerp(lime,.72);if(Math.cos(theta*1.15-phi*2.2)>.8)c.lerp(pink,.56);colors.push(c.r,c.g,c.b)}const pointGeo=new THREE.BufferGeometry();pointGeo.setAttribute("position",new THREE.Float32BufferAttribute(points,3));pointGeo.setAttribute("color",new THREE.Float32BufferAttribute(colors,3));const pointMat=new THREE.PointsMaterial({vertexColors:true,size:.0125,transparent:true,opacity:.7,sizeAttenuation:true,blending:THREE.AdditiveBlending,depthWrite:false});globe.add(new THREE.Points(pointGeo,pointMat));
  const halo=new THREE.Mesh(new THREE.SphereGeometry(radius,28,18),new THREE.MeshBasicMaterial({color:0x53ff53,transparent:true,opacity:.012,side:THREE.BackSide,blending:THREE.AdditiveBlending,depthWrite:false}));globe.add(halo);
  const resize=()=>{const r=mount.getBoundingClientRect();renderer.setSize(r.width,r.height,false);camera.aspect=r.width/Math.max(1,r.height);camera.updateProjectionMatrix()};
  const pointerDown=e=>{dragging=true;lastX=e.clientX;lastY=e.clientY;mount.style.cursor="grabbing"};const pointerMove=e=>{const r=mount.getBoundingClientRect();aimX=((e.clientX-r.left)/r.width-.5)*.46;aimY=((e.clientY-r.top)/r.height-.5)*.28;if(!dragging)return;velocityY=(e.clientX-lastX)*.008;velocityX=(e.clientY-lastY)*.008;lastX=e.clientX;lastY=e.clientY};const pointerUp=()=>{dragging=false;mount.style.cursor="grab"};
  mount.addEventListener("pointerdown",pointerDown);mount.addEventListener("pointerenter",()=>targetGrip=1);mount.addEventListener("pointerleave",()=>{targetGrip=0;pointerUp()});window.addEventListener("pointermove",pointerMove,{passive:true});window.addEventListener("pointerup",pointerUp,{passive:true});
  const render=()=>{grip+=(targetGrip-grip)*.08;if(!reduced){globe.rotation.y+=.00135+velocityY+(aimX-globe.rotation.y*.035)*.015;globe.rotation.x+=(aimY-globe.rotation.x)*.035+velocityX;velocityX*=.9;velocityY*=.9;pointMat.size=.0125+grip*.003;pointMat.opacity=.7+grip*.12;cageMaterial.opacity=.27+grip*.12;frame=requestAnimationFrame(render)}renderer.render(scene,camera)};
  const observer=new ResizeObserver(resize);observer.observe(mount);resize();render();
})();

const heroParticleCanvas=document.querySelector(".hero-art .particle-mark");
if(heroParticleCanvas){
  const heroParticleContext=heroParticleCanvas.getContext("2d");
  const heroParticleImage=new Image();
  const heroParticleReduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
  let heroParticles=[],heroParticleFrame=0,heroParticlePointer={x:-9999,y:-9999,active:false};
  const buildHeroParticles=()=>{
    const rect=heroParticleCanvas.getBoundingClientRect(),ratio=Math.min(devicePixelRatio||1,2);
    heroParticleCanvas.width=Math.round(rect.width*ratio);heroParticleCanvas.height=Math.round(rect.height*ratio);
    const mask=document.createElement("canvas"),maskContext=mask.getContext("2d",{willReadFrequently:true});
    mask.width=420;mask.height=320;
    const imageRatio=heroParticleImage.naturalWidth/heroParticleImage.naturalHeight,drawWidth=300,drawHeight=drawWidth/imageRatio;
    maskContext.drawImage(heroParticleImage,(mask.width-drawWidth)/2,(mask.height-drawHeight)/2,drawWidth,drawHeight);
    const pixels=maskContext.getImageData(0,0,mask.width,mask.height).data,points=[];
    for(let y=0;y<mask.height;y+=4)for(let x=0;x<mask.width;x+=4)if(pixels[(y*mask.width+x)*4+3]>45){const nx=x/mask.width-.5,ny=y/mask.height-.5,seamProgress=Math.max(0,Math.min(1,(ny+.303)/.647)),leftSeam=-.233*(1-seamProgress),rightSeam=.245*(1-seamProgress),onPlaneSeam=ny>-.32&&ny<.35&&(Math.abs(nx-leftSeam)<.011||Math.abs(nx-rightSeam)<.011);if(!onPlaneSeam)points.push({x:nx*Math.min(rect.width*.68,430),y:ny*Math.min(rect.height*.48,330)})}
    heroParticles=points.slice(0,1800).map((point,index)=>({x:Math.random()*rect.width,y:Math.random()*rect.height*.82,targetX:rect.width*.52+point.x,targetY:rect.height*.43+point.y,scatterX:Math.random()*rect.width,scatterY:Math.random()*rect.height*.82,phase:index*.19+Math.random()*4,vx:0,vy:0}));
    heroParticleContext.setTransform(ratio,0,0,ratio,0,0);
  };
  const drawHeroParticles=time=>{
    const rect=heroParticleCanvas.getBoundingClientRect();
    heroParticleContext.clearRect(0,0,rect.width,rect.height);
    heroParticleContext.fillStyle="#CFFF04";
    for(const particle of heroParticles){
      const driftX=Math.sin(time*.00035+particle.phase)*16,driftY=Math.cos(time*.00028+particle.phase)*11;
      let targetX=particle.targetX+driftX*.08,targetY=particle.targetY+driftY*.08;
      if(heroParticlePointer.active&&!heroParticleReduced){const dx=particle.x-heroParticlePointer.x,dy=particle.y-heroParticlePointer.y,distance=Math.hypot(dx,dy)||1;if(distance<105){const force=(105-distance)*1.65;targetX+=dx/distance*force;targetY+=dy/distance*force}}
      particle.vx+=(targetX-particle.x)*.032;particle.vy+=(targetY-particle.y)*.032;
      particle.vx*=.82;particle.vy*=.82;particle.x+=particle.vx;particle.y+=particle.vy;
      heroParticleContext.beginPath();heroParticleContext.arc(particle.x,particle.y,1.15,0,Math.PI*2);heroParticleContext.fill();
    }
    heroParticleFrame=requestAnimationFrame(drawHeroParticles);
  };
  heroParticleCanvas.addEventListener("pointermove",event=>{const rect=heroParticleCanvas.getBoundingClientRect();heroParticlePointer={x:event.clientX-rect.left,y:event.clientY-rect.top,active:true}});
  heroParticleCanvas.addEventListener("pointerleave",()=>heroParticlePointer.active=false);
  heroParticleImage.onload=()=>{buildHeroParticles();cancelAnimationFrame(heroParticleFrame);heroParticleFrame=requestAnimationFrame(drawHeroParticles)};
  heroParticleImage.src=heroParticleCanvas.dataset.particleSource;
  addEventListener("resize",buildHeroParticles,{passive:true});
}

/* Randomized vertical letter swap for the service process titles */
(()=>{
  const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll("[data-letter-swap]").forEach(title=>{
    const label=title.textContent.trim();
    if(!label)return;
    title.setAttribute("aria-label",label);
    title.textContent="";
    const word=document.createElement("span");
    word.className="letter-swap__word";
    [...label].forEach(letter=>{
      if(letter===" "){word.append(" ");return}
      const cell=document.createElement("span"),primary=document.createElement("span"),secondary=document.createElement("span");
      cell.className="letter-swap__cell";
      primary.className="letter-swap__letter";
      secondary.className="letter-swap__letter-alt";
      primary.setAttribute("aria-hidden","true");
      secondary.setAttribute("aria-hidden","true");
      primary.textContent=letter;
      secondary.textContent=letter;
      cell.append(primary,secondary);
      word.append(cell);
    });
    title.append(word);
    const shuffle=()=>{
      const letters=[...title.querySelectorAll(".letter-swap__cell")].sort(()=>Math.random()-.5);
      letters.forEach((cell,index)=>cell.style.setProperty("--letter-delay",`${index*36}ms`));
    };
    if(!reduce){
      title.addEventListener("mouseenter",()=>{shuffle();title.classList.add("is-swapping")});
      title.addEventListener("mouseleave",()=>{shuffle();title.classList.remove("is-swapping")});
    }
  });
})();

/* MASS footer dotted surface */
(()=>{
  const container=document.getElementById("footer-wave");
  if(!container||container.dataset.ready)return;
  container.dataset.ready="true";
  const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
  const lowEnd=(navigator.hardwareConcurrency||8)<=4;
  const drawFallback=()=>{
    const canvas=document.createElement("canvas"),ctx=canvas.getContext("2d"),dpr=Math.min(devicePixelRatio||1,2);
    const render=()=>{const w=container.clientWidth,h=container.clientHeight;canvas.width=w*dpr;canvas.height=h*dpr;canvas.style.width=w+"px";canvas.style.height=h+"px";ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);ctx.fillStyle="rgba(217,217,217,.68)";for(let x=0;x<w+18;x+=18)for(let y=35;y<h+18;y+=18){const wave=Math.sin(x*.018)*18+Math.sin(y*.032)*12;ctx.beginPath();ctx.arc(x,y+wave,1.15,0,Math.PI*2);ctx.fill()}};
    container.appendChild(canvas);render();addEventListener("resize",render,{passive:true});
  };
  if(typeof THREE==="undefined"||lowEnd){drawFallback();return}
  try{
    const SEPARATION=110,AMOUNTX=60,AMOUNTY=30;
    let W=container.offsetWidth,H=container.offsetHeight,count=0,frame=0,visible=false;
    const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(78,W/H,1,10000);
    camera.position.set(0,260,1100);
    const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true});
    renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));renderer.setSize(W,H);renderer.setClearColor(0x000000,0);container.appendChild(renderer.domElement);
    const geometry=new THREE.BufferGeometry(),positions=new Float32Array(AMOUNTX*AMOUNTY*3),colors=new Float32Array(AMOUNTX*AMOUNTY*3);
    let i=0;for(let ix=0;ix<AMOUNTX;ix++)for(let iy=0;iy<AMOUNTY;iy++){positions[i*3]=ix*SEPARATION-AMOUNTX*SEPARATION/2;positions[i*3+2]=iy*SEPARATION-AMOUNTY*SEPARATION/2;colors[i*3]=colors[i*3+1]=colors[i*3+2]=.85;i++}
    geometry.setAttribute("position",new THREE.BufferAttribute(positions,3));geometry.setAttribute("color",new THREE.BufferAttribute(colors,3));
    scene.add(new THREE.Points(geometry,new THREE.PointsMaterial({size:6,vertexColors:true,transparent:true,opacity:.85,sizeAttenuation:true})));
    const render=()=>{const arr=geometry.attributes.position.array;let idx=0;for(let ix=0;ix<AMOUNTX;ix++)for(let iy=0;iy<AMOUNTY;iy++){arr[idx*3+1]=Math.sin((ix+count)*.3)*50+Math.sin((iy+count)*.5)*50;idx++}geometry.attributes.position.needsUpdate=true;renderer.render(scene,camera)};
    const animate=()=>{if(!visible)return;render();count+=.07;frame=requestAnimationFrame(animate)};
    if(reduced){render()}else{const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible&&!frame)animate();else if(!visible){cancelAnimationFrame(frame);frame=0}},{rootMargin:"200px"});observer.observe(container)}
    let rt;addEventListener("resize",()=>{clearTimeout(rt);rt=setTimeout(()=>{W=container.offsetWidth;H=container.offsetHeight;camera.aspect=W/H;camera.updateProjectionMatrix();renderer.setSize(W,H);render()},100)},{passive:true});
  }catch(error){container.replaceChildren();drawFallback()}
})();
