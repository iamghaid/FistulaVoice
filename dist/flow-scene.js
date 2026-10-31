/* Perspective projection of a schematic vessel, not a physiological flow model. */
window.FlowScene=(()=>{
 const scenes=new Set(),reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const tr=(en,ar)=>document.documentElement.lang==='ar'?ar:en;
 function create(host){
  const box=document.createElement('section');box.className='flow-scene';
  const head=document.createElement('div');head.className='flow-head';
  const title=document.createElement('strong'),badge=document.createElement('span');head.append(title,badge);
  const canvas=document.createElement('canvas');canvas.width=900;canvas.height=380;canvas.setAttribute('role','img');
  const controls=document.createElement('div');controls.className='flow-controls';
  const label=document.createElement('label'),slider=document.createElement('input');slider.type='range';slider.min='-40';slider.max='40';slider.value='12';label.append(slider);
  const button=document.createElement('button');button.type='button';button.className='secondary';controls.append(label,button);
  const note=document.createElement('p');box.append(head,canvas,controls,note);host.append(box);
  const ctx=canvas.getContext('2d');let time=0,level=0,active=false,frozen=reduced.matches,angle=.21,paintedTime=0;
  function labels(){title.textContent=tr('Inside the vessel','داخل الوعاء');badge.textContent=tr('Illustrative 3D','تصوّر ثلاثي الأبعاد');canvas.setAttribute('aria-label',tr('Schematic vessel with moving blood-cell illustrations. Audio changes brightness, not blood-flow measurements.','رسم توضيحي لوعاء وخلايا متحركة. الصوت يغيّر الإضاءة ولا يقيس تدفق الدم.'));label.firstChild?.nodeType===3&&label.firstChild.remove();label.prepend(document.createTextNode(tr('Viewing angle','زاوية العرض')));slider.setAttribute('aria-label',tr('Vessel viewing angle','زاوية عرض الوعاء'));button.textContent=frozen?tr('Resume motion','تحريك المشهد'):tr('Pause motion','تثبيت المشهد');button.setAttribute('aria-pressed',String(frozen));note.textContent=tr('Illustration only. Audio intensity controls the glow; cell speed is illustrative and fixed. This is not a measurement of blood flow, pulse or narrowing.','للتوضيح فقط. شدة الصوت تتحكم بالإضاءة؛ سرعة الخلايا افتراضية وثابتة. لا يقيس المشهد تدفق الدم أو النبض أو التضيق.');}
  function project(x,y,z){const a=angle,c=Math.cos(a),s=Math.sin(a),xx=x*c+z*s,zz=-x*s+z*c,scale=700/(700+zz);return{x:450+xx*scale,y:190+y*scale,scale,z:zz};}
  const center=x=>28*Math.sin(x/135);
  function draw(){
   if(!box.isConnected)return;
   const dark=document.documentElement.dataset.theme==='dark';
   ctx.fillStyle=dark?'#101827':'#f0f4f8';ctx.fillRect(0,0,900,380);
   // Cross-sections describe a curved tube in 3D space; perspective changes with angle.
   const rings=[];for(let i=0;i<65;i++){const x=-330+i*660/64;const p=project(x,center(x),0);rings.push({x,p});}
   rings.sort((a,b)=>b.p.z-a.p.z);
   for(const {x,p} of rings){ctx.beginPath();for(let j=0;j<=40;j++){const a=j/40*Math.PI*2,q=project(x,center(x)+65*Math.cos(a),65*Math.sin(a));j?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y);}ctx.closePath();ctx.fillStyle=dark?'rgba(113,151,207,.025)':'rgba(47,86,145,.025)';ctx.fill();ctx.strokeStyle=dark?'rgba(150,181,222,.13)':'rgba(47,86,145,.15)';ctx.lineWidth=1;ctx.stroke();}
   for(const side of [-1,1]){ctx.beginPath();for(let i=0;i<=80;i++){const x=-330+i*660/80,p=project(x,center(x)+side*65,0);i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y);}ctx.strokeStyle=dark?'#799bc9':'#53769e';ctx.lineWidth=2;ctx.stroke();}
   const cells=[];for(let i=0;i<28;i++){const u=((i/28+paintedTime*.09)%1+1)%1,x=-315+630*u,a=i*2.4,y=center(x)+Math.sin(a)*34,z=Math.cos(a)*32;cells.push({...project(x,y,z),i});}cells.sort((a,b)=>b.z-a.z);
   for(const p of cells){const radius=(10+(p.i%3))*p.scale;ctx.save();ctx.translate(p.x,p.y);ctx.rotate(Math.sin(p.i)*.6);ctx.scale(1,.62);const g=ctx.createRadialGradient(-radius*.3,-radius*.3,1,0,0,radius);g.addColorStop(0,'#ffbc9f');g.addColorStop(.5,'#cf655b');g.addColorStop(1,'#893d50');ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,radius,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#6c304b';ctx.lineWidth=1.2;ctx.beginPath();ctx.ellipse(0,0,radius*.45,radius*.55,0,0,Math.PI*2);ctx.stroke();ctx.restore();}
   if(active&&level>0){const g=ctx.createRadialGradient(450,190,10,450,190,260);g.addColorStop(0,`rgba(242,183,102,${Math.min(.23,level*.7)})`);g.addColorStop(1,'rgba(242,183,102,0)');ctx.fillStyle=g;ctx.fillRect(80,60,740,260);}
   ctx.font='16px Segoe UI, Arial';ctx.fillStyle=dark?'#b5c3d9':'#435875';ctx.textAlign='center';ctx.fillText(active?tr('Audio active • illustrative motion','الصوت نشط • حركة توضيحية'):tr('Ready • record or play audio','جاهز • سجّل أو شغّل الصوت'),450,345);
  }
  const scene={update(rms,seconds,playing){level=Math.min(1,Math.sqrt(Math.max(0,rms)));time=seconds;active=playing;if(!frozen)paintedTime=time;draw();},refresh(){labels();draw();},dispose(){scenes.delete(scene);box.remove();}};
  slider.oninput=()=>{angle=Number(slider.value)*Math.PI/180;draw();};button.onclick=()=>{frozen=!frozen;labels();draw();};scenes.add(scene);labels();draw();return scene;
 }
 new MutationObserver(()=>scenes.forEach(s=>s.refresh())).observe(document.documentElement,{attributes:true,attributeFilter:['lang','data-theme']});
 const capture=create(document.querySelector('.live-display').parentElement);
 return{create,capture};
})();
