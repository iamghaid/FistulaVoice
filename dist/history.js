const historyAudioUrls=new Map();
new MutationObserver(()=>{for(const [audio,url] of historyAudioUrls){if(!audio.isConnected){audio.pause();URL.revokeObjectURL(url);historyAudioUrls.delete(audio);}}}).observe(document.body,{childList:true,subtree:true});
function renderCaptureHistory(root=$('historyContent')){
 root.replaceChildren();
 if(!realSamples.length){root.append(el('p','empty',t('historyEmpty')));return;}
 for(const group of HistoryProtocol.groups(realSamples)){
  const first=group[0],card=el('article','review-item');
  card.append(el('h3',null,(first.accessCode||t('noMetadata'))+' · '+(first.site?t(first.site):t('noMetadata'))+' · '+(first.device||t('unknownDevice'))));
  if(!first.accessCode||!first.site)card.append(el('p','method-note',t('legacyCapture')));
  group.forEach((s,i)=>{
   const row=el('div','review-item');row.append(el('strong',null,new Date(s.date).toLocaleString(locale())),el('p','detail-meta',t(s.condition==='position'?'differentPosition':s.condition)+' · RMS '+level(s.metrics.rmsDb)+' dBFS · '+fmt(s.metrics.centroidHz,1)+' Hz'));
   if(i===0)row.append(el('p','method-note',t('referenceLabel')));
   const prev=group.slice(0,i).reverse().find(r=>HistoryProtocol.compatible(s,r));
   if(prev){const score=Signal.similarity(s.metrics,prev.metrics);row.append(el('p','detail-meta',t('compareHistory')+' · '+dateLabel(prev.date)+' · '+t('similarity')+': '+fmt(score,4)),el('p','method-note',t('similarityNote')));}
   else row.append(el('p','method-note',t('noHistoryPair')));
   const listen=el('details');listen.append(el('summary',null,t('pairListen')));const pair=el('div','paired-audio');
   for(const [record,key] of [[s,'pairCurrent'],...(prev?[[prev,'pairPrevious']]:[])]){const box=el('div');box.append(el('strong',null,t(key)),el('p','detail-meta',dateLabel(record.date)+' · '+t(record.site)+' · '+record.device));const audio=el('audio');audio.controls=true;audio.preload='none';audio.setAttribute('aria-label',t(key)+' '+dateLabel(record.date));const url=URL.createObjectURL(record.blob);historyAudioUrls.set(audio,url);audio.src=url;box.append(audio);pair.append(box);}listen.append(pair);row.append(listen);
   const inspect=el('button','secondary',t('viewSample'));inspect.onclick=()=>{selectedId=s.id;filter='real';show('recordings');};row.append(inspect);
   const label=el('label',null,t('reviewLocal')),note=el('textarea');note.maxLength=500;note.value=s.reviewNote||'';note.placeholder=t('historyReviewHint');note.setAttribute('aria-label',t('reviewLocal')+' '+s.id);
   const save=el('button','secondary',t('saveLocal'));save.onclick=async()=>{save.disabled=true;try{const updated={...s,reviewNote:note.value.trim()};await dbAction('readwrite',store=>store.put(updated));s.reviewNote=updated.reviewNote;toast('noteSaved');}catch{toast('noteFailed');}finally{save.disabled=false;}};
   row.append(label,note,save);card.append(row);
  });root.append(card);
 }root.append(el('p','method-note',t('historyCaution')));
}
document.querySelector('[data-view="history"]').onclick=()=>show('history');
