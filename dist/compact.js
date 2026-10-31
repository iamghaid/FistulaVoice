/* Put recording data first; keep explanations available on demand. */
(() => {
 const copy={en:{historyTitle:'Sound history',historySubtitle:'Compare recordings by site and date.',researchTitle:'Research recordings',researchSubtitle:'Two participants. Source-provided examination findings.',historyNote:'Saved in this browser only.',fictionalHistory:'Fictional demo data',demoMetricHelp:'Audio frequency balance — not a disease score.',demoNoClinical:'Fictional values, not clinical progression.'},ar:{historyTitle:'السجل الصوتي',historySubtitle:'قارن التسجيلات حسب الموضع والتاريخ.',researchTitle:'التسجيلات البحثية',researchSubtitle:'مشاركان مختلفان. نتائج الفحص من المصدر.',historyNote:'محفوظ في هذا المتصفح فقط.',fictionalHistory:'بيانات تجريبية وهمية',demoMetricHelp:'توازن ترددات الصوت؛ ليس مؤشر مرض.',demoNoClinical:'قيم وهمية لا تمثل تطورًا سريريًا.'}};
 Object.assign(I18N.en,copy.en);Object.assign(I18N.ar,copy.ar);
 const journey=document.querySelector('.evidence-journey'),help=el('details','compact-help'),summary=el('summary');help.append(summary);journey.before(help);help.append(journey);
 const original=renderHistory;renderHistory=function(){original();const root=$('historyContent');if(historyMode==='demo'){root.querySelector('.history-demo-badge + .detail-meta')?.remove();root.querySelector(':scope > .inline-note')?.remove();} };
 function refresh(){summary.textContent=lang==='ar'?'طريقة الاستخدام':'How to use';$('pageTitle').textContent=t(view+'Title');$('pageSubtitle').textContent=t(view+'Subtitle');document.querySelector('[data-i18n="historyNote"]').textContent=t('historyNote');}
 new MutationObserver(refresh).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});refresh();if(view==='history')renderHistory();
})();
