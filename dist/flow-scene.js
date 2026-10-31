/* Original procedural 3D illustration. Fixed illustrative speed, never physiological inference. */
window.FlowScene=(()=>{
 const instances=new Set(),tr=(en,ar)=>document.documentElement.lang==='ar'?ar:en;
 function create(host){
  const box=document.createElement('section');box.className='flow-scene';
  box.innerHTML='<div class="flow-head"><strong></strong><span></span></div><div class="vessel-stage"></div><div class="flow-direction" aria-hidden="true">→ → → → →</div><div class="flow-controls"><button type="button" class="secondary"></button><label><span></span><input type="range" min="-30" max="30" value="0"></label></div><p></p>';
  host.append(box);const stage=box.querySelector('.vessel-stage'),button=box.querySelector('button'),slider=box.querySelector('input');
  let renderer,scene,camera,group,cells=[],material,frame=0,preview=false,playing=false,frozen=matchMedia('(prefers-reduced-motion: reduce)').matches,time=0,signal=0,last=0,disposed=false;
  try{
   renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(900,430,false);renderer.outputColorSpace=THREE.SRGBColorSpace;stage.append(renderer.domElement);
   renderer.domElement.setAttribute('role','img');
   scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(35,900/430,.1,100);camera.position.set(0,1.3,12);camera.lookAt(0,0,0);group=new THREE.Group();scene.add(group);
   scene.add(new THREE.HemisphereLight(0xffffff,0x493530,2.4));const light=new THREE.DirectionalLight(0xffe5cf,3);light.position.set(-3,6,6);scene.add(light);const rim=new THREE.DirectionalLight(0xffffff,1.7);rim.position.set(4,-2,-2);scene.add(rim);
   // A cutaway cylinder exposes its interior rather than hiding cells behind a transparent tube.
   const wall=new THREE.Mesh(new THREE.CylinderGeometry(1.15,1.15,8,64,1,true,Math.PI*.15,Math.PI*1.25),new THREE.MeshStandardMaterial({color:0xb7706f,roughness:.55,metalness:.08,side:THREE.DoubleSide}));wall.rotation.z=Math.PI/2;wall.rotation.x=.25;group.add(wall);
   material=new THREE.MeshStandardMaterial({color:0xc64246,roughness:.38,metalness:.06,emissive:0x482014,emissiveIntensity:0});
   const profile=[];for(let i=0;i<=24;i++){const a=i/24*Math.PI;profile.push(new THREE.Vector2(Math.sin(a)*.28,Math.cos(a)*(.07+.10*Math.sin(a)**2)));}const geometry=new THREE.LatheGeometry(profile,24);
   for(let i=0;i<24;i++){const cell=new THREE.Mesh(geometry,material);cell.userData={offset:i/24,phase:i*2.4};group.add(cell);cells.push(cell);}
   const arrow=new THREE.ArrowHelper(new THREE.Vector3(1,0,0),new THREE.Vector3(-3.5,-1.6,0),7,0xf2b766,.28,.17);group.add(arrow);
  }catch{stage.textContent=tr('3D is unavailable on this browser. Audio recording still works.','العرض ثلاثي الأبعاد غير متاح. التسجيل الصوتي يعمل.');}
  function draw(){if(!renderer||disposed)return;group.rotation.y=Number(slider.value)*Math.PI/180;for(const cell of cells){const u=(cell.userData.offset+time*.16)%1;cell.position.set(-3.8+7.6*u,Math.sin(cell.userData.phase)*.55,Math.cos(cell.userData.phase)*.55);cell.rotation.set(.5+Math.sin(time+cell.userData.phase)*.3,cell.userData.phase,time*.6);}material.emissiveIntensity=playing?Math.min(.7,signal*2):0;renderer.render(scene,camera);}
  function labels(){box.querySelector('strong').textContent=tr('Blood movement • cutaway view','حركة الدم • مقطع مفتوح');box.querySelector('.flow-head span').textContent=playing?tr('Audio linked','مرتبط بالصوت'):tr('Illustration','توضيحي');button.textContent=preview?tr('Stop preview','إيقاف العرض'):playing&&!frozen?tr('Pause motion','تثبيت الحركة'):playing?tr('Resume motion','تحريك المشهد'):tr('Preview blood movement','شاهد حركة الدم');slider.setAttribute('aria-label',tr('Viewing angle','زاوية العرض'));box.querySelector('label span').textContent=tr('Rotate','تدوير');box.querySelector('p').textContent=tr('Illustrative direction and speed. Sound changes the glow—not a blood-flow measurement.','الاتجاه والسرعة للتوضيح. الصوت يغير الإضاءة، وليس قياسًا لتدفق الدم.');renderer?.domElement.setAttribute('aria-label',tr('Open vessel with red blood cells moving left to right','وعاء مفتوح بخلايا حمراء تتحرك من اليسار لليمين'));}
  function tick(now){frame=0;if(disposed||!preview)return;if(!box.isConnected||box.closest('[hidden]')||document.hidden){preview=false;labels();return;}time+=Math.min((now-last)/1000,.05);last=now;draw();frame=requestAnimationFrame(tick);}
  button.onclick=()=>{if(playing){frozen=!frozen;}else{preview=!preview;cancelAnimationFrame(frame);if(preview){last=performance.now();frame=requestAnimationFrame(tick);}}labels();};slider.oninput=draw;
  const item={update(rms,seconds,on){if(on&&preview){preview=false;cancelAnimationFrame(frame);}const changed=playing!==on;playing=on;signal=rms;if(!frozen&&on)time=seconds;draw();if(changed)labels();},refresh(){labels();draw();},dispose(){disposed=true;cancelAnimationFrame(frame);scene?.traverse(o=>{o.geometry?.dispose();});material?.dispose();renderer?.dispose();box.remove();instances.delete(item);}};
  instances.add(item);labels();draw();return item;
 }
 new MutationObserver(()=>instances.forEach(s=>s.refresh())).observe(document.documentElement,{attributes:true,attributeFilter:['lang','data-theme']});
 return{create,capture:create(document.querySelector('.live-display').parentElement)};
})();
