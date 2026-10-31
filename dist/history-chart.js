Object.assign(I18N.en,{
 demoHistory:'Demo timeline',myHistory:'My recordings',fictionalHistory:'FICTIONAL DEMO · NOT PATIENT DATA',
 demoDescription:'One fictional access, three fixed sites, six visits over 14 days. Select a site and a date to inspect the change.',
 demoMetric:'Spectral centroid (Hz)',demoMetricHelp:'A technical measure of the frequency balance of a recording. Higher values do not establish disease.',
 selectedVisit:'Selected visit',sinceFirst:'Change from first visit',sincePrevious:'Change from previous visit',firstVisit:'First visit',
 datedHistory:'Dated recording history',visitDate:'Visit date',recordedValue:'Centroid (Hz)',changePrevious:'Δ vs previous (Hz)',
 viewDate:'View date',demoContext:'DEMO-ACCESS-A · PHONE-A · Quiet / position A',demoNoClinical:'Illustrative values only. This trend is invented to demonstrate the interface; it does not show real clinical progression.',
 visitCount:'Visits',timeSpan:'Days shown',siteCount:'Fixed sites'
});
Object.assign(I18N.ar,{
 demoHistory:'سجل تجريبي',myHistory:'تسجيلاتي',fictionalHistory:'بيانات وهمية للعرض؛ ليست بيانات مريض',
 demoDescription:'ناسور وهمي واحد، ثلاثة مواضع ثابتة، وست زيارات خلال 14 يوماً. اختر الموضع والتاريخ لرؤية الفرق.',
 demoMetric:'المركز الطيفي (Hz)',demoMetricHelp:'قياس تقني لتوازن الترددات؛ ارتفاعه لا يثبت وجود مرض.',
 selectedVisit:'الزيارة المحددة',sinceFirst:'الفرق عن أول زيارة',sincePrevious:'الفرق عن الزيارة السابقة',firstVisit:'أول زيارة',
 datedHistory:'سجل التسجيلات بالتاريخ',visitDate:'تاريخ الزيارة',recordedValue:'المركز الطيفي (Hz)',changePrevious:'الفرق عن السابق (Hz)',
 viewDate:'عرض التاريخ',demoContext:'DEMO-ACCESS-A · PHONE-A · هدوء / وضعية A',demoNoClinical:'قيم توضيحية مخترعة لعرض الواجهة؛ لا تمثل تطوراً سريرياً حقيقياً.',
 visitCount:'زيارات',timeSpan:'يوماً معروضاً',siteCount:'مواضع ثابتة'
});
let historyMode='demo',historySite='site1',historyIndex=5;
const demoDate=date=>new Date(date+'T12:00:00Z').toLocaleDateString(locale(),{day:'2-digit',month:'short',year:'numeric',timeZone:'UTC'});
function renderHistory(){
 const root=$('historyContent');root.replaceChildren();
 const tabs=el('div','segmented history-tabs');
 for(const mode of ['demo','real']){const b=el('button',historyMode===mode?'active':'',t(mode==='demo'?'demoHistory':'myHistory'));b.setAttribute('aria-pressed',historyMode===mode);b.onclick=()=>{historyMode=mode;renderHistory();};tabs.append(b);}root.append(tabs);
 if(historyMode==='real'){const holder=el('div');root.append(holder);renderCaptureHistory(holder);return;}
 root.append(el('span','badge history-demo-badge',t('fictionalHistory')),el('p','detail-meta',t('demoDescription')));
 const stats=el('div','history-stats');for(const [n,key] of [[6,'visitCount'],[14,'timeSpan'],[3,'siteCount']]){const box=el('div');box.append(el('strong',null,String(n)),el('span',null,t(key)));stats.append(box);}root.append(stats);
 const tools=el('div','history-controls'),label=el('label',null,t('siteLabel')),sites=el('select');sites.id='historySite';label.htmlFor=sites.id;for(const site of ['site1','site2','site3']){const option=el('option',null,t(site));option.value=site;sites.append(option);}sites.value=historySite;sites.onchange=()=>{historySite=sites.value;renderHistory();};tools.append(label,sites,el('p','detail-meta',t('demoContext')));root.append(tools);
 const data=HistoryDemo.series(historySite),selected=data[historyIndex],diff=HistoryDemo.delta(data,historyIndex),signed=n=>(n>0?'+':'')+n;
 const summary=el('div','history-summary');for(const [key,value] of [['selectedVisit',demoDate(selected.date)],['demoMetric',selected.value+' Hz'],['sinceFirst',signed(diff.first)+' Hz'],['sincePrevious',diff.previous===null?t('firstVisit'):signed(diff.previous)+' Hz']]){const box=el('div');box.append(el('span',null,t(key)),el('strong',null,value));summary.append(box);}root.append(summary);
 const chart=el('div','history-chart');const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 900 310');svg.setAttribute('role','img');svg.setAttribute('aria-label',t('demoMetric')+' · '+data.map(d=>demoDate(d.date)+': '+d.value+' Hz').join('; '));
 const make=(name,attrs,text)=>{const e=document.createElementNS(ns,name);for(const [k,v]of Object.entries(attrs))e.setAttribute(k,v);if(text!==undefined)e.textContent=text;svg.append(e);return e;};
 const x=i=>70+(Date.parse(data[i].date)-Date.parse(data[0].date))/(14*86400000)*770,y=v=>245-(v-80)/120*205;
 for(const tick of [80,110,140,170,200]){make('line',{x1:70,x2:840,y1:y(tick),y2:y(tick),class:'history-grid'});make('text',{x:54,y:y(tick)+5,'text-anchor':'end',class:'history-axis'},String(tick));}
 make('text',{x:70,y:20,class:'history-axis'},'Hz');
 make('path',{d:data.map((d,i)=>(i?'L':'M')+x(i)+' '+y(d.value)).join(' '),class:'history-line'});
 data.forEach((d,i)=>{make('circle',{cx:x(i),cy:y(d.value),r:i===historyIndex?9:6,class:'history-point'+(i===historyIndex?' selected':'')});make('text',{x:x(i),y:y(d.value)-16,'text-anchor':'middle',class:'history-value'},d.value);make('text',{x:x(i),y:277,'text-anchor':'middle',class:'history-axis'},new Date(d.date+'T12:00:00Z').toLocaleDateString(locale(),{day:'2-digit',month:'short',timeZone:'UTC'}));});chart.append(svg);root.append(chart,el('p','method-note',t('demoMetricHelp')));
 const dates=el('div','history-date-buttons');data.forEach((d,i)=>{const b=el('button',i===historyIndex?'primary':'secondary',demoDate(d.date));b.setAttribute('aria-pressed',i===historyIndex);b.onclick=()=>{historyIndex=i;renderHistory();};dates.append(b);});root.append(dates);
 root.append(el('h3','history-table-title',t('datedHistory')));const wrap=el('div','history-table-wrap'),table=el('table','history-table'),head=el('thead'),hr=el('tr');for(const key of ['visitDate','recordedValue','changePrevious'])hr.append(el('th',null,t(key)));head.append(hr);table.append(head);const body=el('tbody');data.forEach((d,i)=>{const row=el('tr',i===historyIndex?'selected':'');row.append(el('td',null,demoDate(d.date)),el('td',null,String(d.value)),el('td',null,i?signed(d.value-data[i-1].value):'—'));body.append(row);});table.append(body);wrap.append(table);root.append(wrap,el('p','inline-note',t('demoNoClinical')));
}
show('history');
