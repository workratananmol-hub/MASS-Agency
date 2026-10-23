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
