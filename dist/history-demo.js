const HistoryDemo={
 dates:['2026-10-09','2026-10-12','2026-10-15','2026-10-18','2026-10-21','2026-10-23'],
 sites:{site1:[126,129,134,148,163,175],site2:[112,114,116,123,132,140],site3:[98,100,101,105,110,116]},
 series(site){return this.dates.map((date,i)=>({date,value:this.sites[site][i]}));},
 delta(series,index){return {first:series[index].value-series[0].value,previous:index?series[index].value-series[index-1].value:null};}
};
if(typeof module!=='undefined')module.exports=HistoryDemo;
