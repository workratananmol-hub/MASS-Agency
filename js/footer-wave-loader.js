/* Static CSS dots are the reliable footer fallback; WebGL is an optional late enhancement. */
(()=>{
  const threeSource="/assets/vendor/three.min.js";
  const canEnhance=()=>!matchMedia("(prefers-reduced-motion: reduce)").matches&&!(navigator.connection?.saveData)&&(navigator.hardwareConcurrency||8)>4;
  const loadThree=()=>{
    if(window.THREE)return Promise.resolve(window.THREE);
    if(window.__massFooterThreePromise)return window.__massFooterThreePromise;
    window.__massFooterThreePromise=new Promise((resolve,reject)=>{
      const existing=document.querySelector(`script[src="${threeSource}"]`);
      if(existing){existing.addEventListener("load",()=>window.THREE?resolve(window.THREE):reject(new Error("Three.js did not initialise")),{once:true});existing.addEventListener("error",()=>reject(new Error("Three.js failed to load")),{once:true});return}
      const script=document.createElement("script");
      script.src=threeSource;script.async=true;script.onload=()=>window.THREE?resolve(window.THREE):reject(new Error("Three.js did not initialise"));script.onerror=()=>reject(new Error("Three.js failed to load"));document.head.append(script);
    });
    return window.__massFooterThreePromise;
  };
  const drawFallback=container=>{
    if(container.querySelector("canvas[data-footer-fallback]"))return;
    const canvas=document.createElement("canvas"),context=canvas.getContext("2d"),ratio=Math.min(devicePixelRatio||1,2);
    canvas.dataset.footerFallback="true";canvas.setAttribute("aria-hidden","true");
    const render=()=>{
      const width=container.clientWidth,height=container.clientHeight;
      if(!width||!height)return;
      canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);canvas.style.width=`${width}px`;canvas.style.height=`${height}px`;
      context.setTransform(ratio,0,0,ratio,0,0);context.clearRect(0,0,width,height);context.fillStyle="rgba(217,217,217,.7)";
      const rows=17;
      for(let row=0;row<rows;row++){
        const progress=row/(rows-1),depth=.18+progress*.82,spacing=12+depth*18,radius=.55+depth*.85,y=height*(.08+progress*.88),amplitude=4+depth*17,offset=Math.sin(row*.74)*spacing*.45;
        for(let x=-spacing*2;x<width+spacing*2;x+=spacing){const wave=Math.sin(x*.018+row*.42)*amplitude+Math.sin(row*.55)*amplitude*.3;context.beginPath();context.arc(x+offset,y+wave,radius,0,Math.PI*2);context.fill()}
      }
    };
    container.append(canvas);container.dataset.footerFallback="true";render();
    if("ResizeObserver" in window)new ResizeObserver(render).observe(container);else addEventListener("resize",render,{passive:true});
  };
  const createSurface=container=>{
    if(container.dataset.webglReady||!window.THREE)return;
    const THREE=window.THREE,SEPARATION=110,AMOUNTX=60,AMOUNTY=30;
    let scene,camera,renderer,geometry,observer,frame=0,visible=false,count=0,resizeTimer;
    const resize=()=>{const width=container.clientWidth,height=container.clientHeight;if(!width||!height)return;renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();render()};
    const render=()=>{const positions=geometry.attributes.position.array;let point=0;for(let ix=0;ix<AMOUNTX;ix++)for(let iy=0;iy<AMOUNTY;iy++){positions[point*3+1]=Math.sin((ix+count)*.3)*50+Math.sin((iy+count)*.5)*50;point++}geometry.attributes.position.needsUpdate=true;renderer.render(scene,camera)};
    const animate=()=>{if(!visible)return;render();count+=.07;frame=requestAnimationFrame(animate)};
    try{
      scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(78,1,1,10000);
      camera.position.set(0,260,1100);
      renderer=new THREE.WebGLRenderer({alpha:true,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));renderer.setClearColor(0x000000,0);
      geometry=new THREE.BufferGeometry();const positions=new Float32Array(AMOUNTX*AMOUNTY*3),colors=new Float32Array(AMOUNTX*AMOUNTY*3);
      let point=0;for(let ix=0;ix<AMOUNTX;ix++)for(let iy=0;iy<AMOUNTY;iy++){positions[point*3]=ix*SEPARATION-AMOUNTX*SEPARATION/2;positions[point*3+2]=iy*SEPARATION-AMOUNTY*SEPARATION/2;colors[point*3]=colors[point*3+1]=colors[point*3+2]=.85;point++}
      geometry.setAttribute("position",new THREE.BufferAttribute(positions,3));geometry.setAttribute("color",new THREE.BufferAttribute(colors,3));scene.add(new THREE.Points(geometry,new THREE.PointsMaterial({size:6,vertexColors:true,transparent:true,opacity:.85,sizeAttenuation:true})));
      container.replaceChildren(renderer.domElement);delete container.dataset.footerFallback;container.dataset.webglReady="true";resize();
      observer=new IntersectionObserver(entries=>{visible=entries.some(entry=>entry.isIntersecting);if(visible&&!frame)animate();else if(!visible&&frame){cancelAnimationFrame(frame);frame=0}},{rootMargin:"200px"});observer.observe(container);
      addEventListener("resize",()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(resize,120)},{passive:true});
    }catch(error){cancelAnimationFrame(frame);observer?.disconnect();geometry?.dispose();renderer?.dispose();container.replaceChildren();delete container.dataset.webglReady;container.dataset.footerEnhancement="fallback";drawFallback(container)}
  };
  const init=()=>{
    const container=document.getElementById("footer-wave");
    if(!container||container.dataset.footerEnhancement)return;
    container.dataset.footerEnhancement="static";drawFallback(container);
    if(!canEnhance()||!("IntersectionObserver" in window))return;
    const requestEnhancement=()=>loadThree().then(()=>createSurface(container)).catch(()=>{container.dataset.footerEnhancement="fallback"});
    const proximity=new IntersectionObserver(entries=>{if(!entries.some(entry=>entry.isIntersecting))return;proximity.disconnect();requestEnhancement()},{rootMargin:"450px 0px"});
    proximity.observe(container);
  };
  window.MASSFooterWave={init};
  init();
})();
