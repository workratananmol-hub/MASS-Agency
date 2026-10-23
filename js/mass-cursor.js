/* Shared MASS cursor: computes the visible surface below a fine pointer without polling. */
(()=>{
  if(window.__massCursorInstance)return;
  const fine=matchMedia("(hover: hover) and (pointer: fine)");
  const reduced=matchMedia("(prefers-reduced-motion: reduce)");
  if(!fine.matches||reduced.matches||!document.body)return;
  const dot=document.createElement("span"),ring=document.createElement("span");
  dot.className="mass-cursor-dot";ring.className="mass-cursor-ring";
  dot.setAttribute("aria-hidden","true");ring.setAttribute("aria-hidden","true");
  document.body.append(dot,ring);
  document.documentElement.classList.add("mass-cursor-enabled");
  window.__massCursorInstance=true;
  let x=-100,y=-100,rx=-100,ry=-100,visible=false,active=false,frame=0,toneFrame=0;
  const nativeSelector="input,textarea,select,[contenteditable='true']";
  const interactiveSelector="a,button,[role='button'],summary,[data-cursor-active]";
  const rgb=value=>{
    const m=String(value||"").match(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:\s*[,/]\s*([\d.]+))?\s*\)/i);
    return m?[+m[1],+m[2],+m[3],m[4]===undefined?1:+m[4]]:null;
  };
  const luminance=([r,g,b])=>((r/255<=.04045?r/255/12.92:((r/255+.055)/1.055)**2.4)*.2126+(g/255<=.04045?g/255/12.92:((g/255+.055)/1.055)**2.4)*.7152+(b/255<=.04045?b/255/12.92:((b/255+.055)/1.055)**2.4)*.0722);
  const toneAt=(clientX,clientY)=>{
    const target=document.elementFromPoint(clientX,clientY);
    if(!target)return false;
    const explicit=target.closest("[data-cursor-tone]")?.dataset.cursorTone;
    if(explicit==="ink")return true;
    if(explicit==="lime")return false;
    const chain=[];let node=target,ambiguous=false,imageForeground=null;
    while(node&&node.nodeType===1){
      const style=getComputedStyle(node),color=rgb(style.backgroundColor);
      if(style.backgroundImage!=="none"){ambiguous=true;imageForeground=rgb(style.color);}
      if(color&&color[3]>0)chain.push(color);if(color&&color[3]>=1)break;
      node=node.parentElement;
    }
    let composite=[250,250,247];
    for(let i=chain.length-1;i>=0;i--){const [r,g,b,a]=chain[i];composite=[r*a+composite[0]*(1-a),g*a+composite[1]*(1-a),b*a+composite[2]*(1-a)];}
    if(ambiguous){
      const foreground=imageForeground||rgb(getComputedStyle(target).color);
      return foreground?luminance(foreground)<.35:true;
    }
    return luminance(composite)>.18;
  };
  const applyTone=()=>{toneFrame=0;if(!visible)return;const ink=toneAt(x,y);dot.classList.toggle("is-ink",ink);ring.classList.toggle("is-ink",ink);};
  const scheduleTone=()=>{if(!visible||toneFrame)return;toneFrame=requestAnimationFrame(applyTone);};
  const render=()=>{frame=0;dot.style.transform=`translate3d(${x}px,${y}px,0)`;rx+=(x-rx)*.22;ry+=(y-ry)*.22;ring.style.transform=`translate3d(${rx}px,${ry}px,0)`;if(Math.abs(x-rx)>.15||Math.abs(y-ry)>.15)frame=requestAnimationFrame(render);};
  const scheduleRender=()=>{if(!frame)frame=requestAnimationFrame(render);};
  addEventListener("pointermove",event=>{if(event.pointerType&&event.pointerType!=="mouse")return;x=event.clientX;y=event.clientY;if(!visible){visible=true;dot.classList.add("is-visible");ring.classList.add("is-visible");}const target=event.target;if(target?.closest(nativeSelector)){visible=false;dot.classList.remove("is-visible");ring.classList.remove("is-visible","is-active");return;}if(!visible){visible=true;dot.classList.add("is-visible");ring.classList.add("is-visible");}ring.classList.toggle("is-active",!!target?.closest(interactiveSelector));scheduleTone();scheduleRender();},{passive:true});
  addEventListener("pointerdown",event=>{if(event.pointerType&&event.pointerType!=="mouse")return;active=true;ring.classList.add("is-pressed");},{passive:true});
  addEventListener("pointerup",()=>{active=false;ring.classList.remove("is-pressed");},{passive:true});
  const hide=()=>{
    visible=false;
    dot.classList.remove("is-visible");
    ring.classList.remove("is-visible","is-active","is-pressed");
  };
  addEventListener("pointerleave",event=>{
    if(event.pointerType&&event.pointerType!=="mouse")return;
    hide();
  });
  document.addEventListener("pointerover",event=>{
    if(event.target instanceof HTMLIFrameElement)hide();
  },true);
  addEventListener("scroll",scheduleTone,{passive:true});addEventListener("resize",scheduleTone,{passive:true});
  document.addEventListener("transitionend",scheduleTone,true);document.addEventListener("click",()=>requestAnimationFrame(scheduleTone),true);
  document.addEventListener("focusin",event=>{if(event.target.closest(nativeSelector)){ring.classList.remove("is-active");}});
})();
