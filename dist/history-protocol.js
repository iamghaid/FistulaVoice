/* Comparison eligibility only; this does not establish clinical comparability. */
const HistoryProtocol={
 compatible(a,b){return Boolean(a.accessCode&&a.site&&a.device&&a.accessCode===b.accessCode&&a.site===b.site&&a.device===b.device&&a.condition===b.condition&&a.metrics.sampleRate===b.metrics.sampleRate);},
 groups(samples){const map=new Map();for(const s of samples){const key=JSON.stringify([s.accessCode||'',s.site||'',s.device||'']);if(!map.has(key))map.set(key,[]);map.get(key).push(s);}return [...map.values()].map(g=>g.sort((a,b)=>new Date(a.date)-new Date(b.date)));}
};
if(typeof module!=='undefined')module.exports=HistoryProtocol;
