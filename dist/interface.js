(() => {
  const icons={history:'M4 5v15h16M8 14l4-5 4 3 4-7',lab:'M9 4a3 3 0 0 1 6 0v8a3 3 0 0 1-6 0ZM5 10v2a7 7 0 0 0 14 0v-2M12 19v3M8 22h8',recordings:'M5 3h14v18H5ZM8 8h8M8 12h8M8 16h5',research:'M2 12h4l3-7 5 14 3-7h5',evidence:'M4 4h6l2 2 2-2h6v16h-6l-2 2-2-2H4ZM12 6v16'};
  const names={en:{history:'History',lab:'Record',recordings:'Library',research:'Signals',evidence:'Evidence'},ar:{history:'السجل',lab:'التسجيل',recordings:'المكتبة',research:'الإشارات',evidence:'الأدلة'}};
  const main=document.querySelector('main');main.id='main-content';main.tabIndex=-1;
  const skip=document.createElement('a');skip.className='skip-main';skip.href='#main-content';document.body.prepend(skip);
  const nav=document.querySelector('nav');
  const originalHistory=renderHistory;
  renderHistory=function(){originalHistory();
    for(const target of document.querySelectorAll('.history-chart,.history-table-wrap')){target.tabIndex=0;target.setAttribute('role','region');target.setAttribute('aria-label',lang==='ar'?'تفاصيل التاريخ، قابلة للتمرير أفقيًا':'Dated history, horizontally scrollable');}
    const chart=document.querySelector('.history-chart');if(chart){const hint=el('p','chart-scroll-hint',lang==='ar'?'مرّر الرسم أفقيًا لرؤية جميع التواريخ.':'Scroll the chart sideways to see all dates.');chart.after(hint);}
  };
  function refreshNav(){
    const language=document.documentElement.lang==='ar'?'ar':'en';
    skip.textContent=language==='ar'?'انتقل إلى المحتوى':'Skip to content';nav.setAttribute('aria-label',language==='ar'?'التنقل الرئيسي':'Main navigation');
    for(const key of ['history','lab','recordings','research','evidence']){
      const button=nav.querySelector(`[data-view="${key}"]`);if(!button)continue;
      const count=button.querySelector('.nav-count');button.replaceChildren();
      const icon=document.createElement('span');icon.className='nav-icon';icon.setAttribute('aria-hidden','true');icon.innerHTML=`<svg viewBox="0 0 24 24"><path d="${icons[key]}"/></svg>`;
      const label=document.createElement('span');label.className='nav-label-text';label.textContent=names[language][key];button.append(icon,label);if(count)button.append(count);
      button.setAttribute('aria-label',t(key));button.title=t(key);nav.append(button);
    }
  }
  const originalShow=show;
  show=function(next){originalShow(next);if(view!==next)return;for(const b of nav.querySelectorAll('button')){if(b.dataset.view===next)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');}if(location.hash!==`#/${next}`)history.replaceState(null,'',`#/${next}`);window.scrollTo({top:0,behavior:'instant'});};
  new MutationObserver(()=>queueMicrotask(refreshNav)).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});refreshNav();
  document.querySelectorAll('img').forEach(img=>{if(!img.hasAttribute('width'))img.setAttribute('width','40');if(!img.hasAttribute('height'))img.setAttribute('height','40');});
  for(const id of ['accessCode','device','sampleNote']){const input=$(id);input.name=id;input.autocomplete='off';if(id!=='sampleNote')input.spellcheck=false;}
  document.querySelector('.brand').onclick=e=>{e.preventDefault();show('history');};
  const views=['history','lab','recordings','research','evidence'];const route=()=>location.hash.replace(/^#\/?/,'');const requested=route();show(views.includes(requested)?requested:'history');
  window.addEventListener('hashchange',()=>{if(views.includes(route()))show(route());});
  window.addEventListener('load',()=>window.scrollTo({top:0,behavior:'instant'}),{once:true});
})();
