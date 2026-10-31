const assert=require('node:assert/strict');
const H=require('./dist/history-protocol.js');
const a={id:'A',accessCode:'DEMO-A',site:'site1',device:'PHONE-A',condition:'quiet',date:'2026-10-20',metrics:{sampleRate:48000}};
const b={...a,id:'B',date:'2026-10-21'};
assert(H.compatible(a,b));
for(const [key,value] of Object.entries({accessCode:'DEMO-B',site:'site2',device:'PHONE-B',condition:'noise'}))assert(!H.compatible(a,{...b,[key]:value}),key);
assert(!H.compatible(a,{...b,metrics:{sampleRate:16000}}));
assert(!H.compatible({...a,site:undefined},{...b,site:undefined}));
assert.deepEqual(H.groups([b,a]).map(g=>g.map(s=>s.id)),[['A','B']]);
assert.equal(H.groups([a,{...b,site:'site2'}]).length,2);
console.log('PASS: personal comparison isolation, legacy exclusion, sample rate and recording context, chronological grouping.');
const demo=require('./dist/history-demo.js');
for(const site of Object.keys(demo.sites)){
 const series=demo.series(site);assert.equal(series.length,6);
 assert.equal((Date.parse(series.at(-1).date)-Date.parse(series[0].date))/86400000,14);
 assert.equal(demo.delta(series,0).previous,null);
 assert.equal(demo.delta(series,5).first,series[5].value-series[0].value);
 assert.equal(demo.delta(series,5).previous,series[5].value-series[4].value);
}
assert.equal(demo.series('site1')[5].value,175);
assert.equal(demo.delta(demo.series('site1'),5).first,49);
console.log('PASS: fictional date range, three site series and dated differences.');
