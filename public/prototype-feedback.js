(function(root){
  function text(v){ return String(v||''); }
  function isPrototype(item,comments){
    if(/prototype/i.test(text(item.source))) return true;
    if(/launchpad-prototype:/.test(text(item.sourceRef||item.source_ref))) return true;
    var ref=text(item.cardId||((text(item.sourceRef||item.source_ref).match(/launchpad-card:([^;\s]+)/)||[])[1]));
    if((comments||[]).some(function(c){return (ref&&c.id===ref)||(text(item.raw||item.raw_text).trim()&&text(c.body).trim()===text(item.raw||item.raw_text).trim());})) return true;
    // This specific source correction was confirmed by the submitting PM.
    return /brand logos\/branding on reports/i.test(text(item.title)) && /SCRUM-16/i.test([item.reason,item.attention_reason,item.change,item.proposed_change].join(' '));
  }
  function normalize(item,comments,links){
    if(!isPrototype(item,comments)) return false;
    var before=JSON.stringify(item);
    item.source='Prototype Feedback';
    item.affected=(item.affected||[]).filter(function(s){return s!=='Jira';});
    if(item.affected.indexOf('Stakeholder Feedback')<0) item.affected.push('Stakeholder Feedback');
    var branding=/brand logos\/branding on reports/i.test(text(item.title));
    if(branding){
      item.reason='Prototype feedback raises a branding requirements question for the report builder beta; a scope decision is needed.';
      item.points=(item.points||[]).filter(function(p){return !/SCRUM-16.*(?:In Progress|Highest priority|unassigned|no due date)/i.test(p);}).map(function(p){return text(p).replace(/asked on SCRUM-16/i,'asked in prototype feedback');});
      item.change=text(item.change).replace(/^Jira:[\s\S]*?(?=Requirements:)/i,'');
      if(/SCRUM-16/i.test(item.link||'')) item.link=(links||{}).prototype||'';
    }
    return before!==JSON.stringify(item);
  }
  function sync(items,comments,links){
    var changed=false;
    (items||[]).forEach(function(item){
      if(normalize(item,comments,links)) changed=true;
      if(item.source!=='Prototype Feedback') return;
      var ref=text(item.cardId||((text(item.sourceRef).match(/launchpad-(?:card|prototype):([^;\s]+)/)||[])[1]));
      var body=text(item.raw).trim()||item.title;
      var existing=comments.find(function(c){return (ref&&c.id===ref)||c.itemKey===item.key||text(c.body).trim()===body;});
      if(existing){ if(!item.cardId){item.cardId=existing.id;changed=true;} return; }
      var id=ref||'prototype-'+item.key;
      comments.unshift({id:id,itemKey:item.key,by:item.by,date:item.date,body:body,clients:item.clients||'',source:'Prototype Feedback',audience:'internal',imported:true});
      item.cardId=id; changed=true;
    });
    return changed;
  }
  root.PrototypeFeedback={normalize:normalize,sync:sync};
})(typeof window!=='undefined'?window:globalThis);