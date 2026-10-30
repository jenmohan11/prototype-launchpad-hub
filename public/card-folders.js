(function(root){
  // Folder rules from the card's status field.
  function norm(s){ s=String(s||'').toLowerCase(); return s==='applied'?'accepted':s; }
  function folders(status){
    var s=norm(status);
    if(s==='pending') return ['pending'];
    if(s==='delayed') return ['decided','delayed'];
    if(s==='accepted') return ['decided','accepted'];
    if(s==='rejected') return ['decided','rejected'];
    if(s==='duplicate') return ['decided','duplicate'];
    return [];
  }
  function inFolder(item,folder){
    if(folder==='duplicate') return (item.n8nGroup==='decided' && item.decision==='duplicate') || (item.n8nGroup==='items' && item.status==='pending' && !item.stale && String(item.title||'').startsWith('Duplicate: '));
    if(folder==='pending' && item.n8nGroup==='decided') return false;
    if(folder==='decided' && item.n8nGroup==='decided') return true;
    if(folder==='pending' && item.stale) return false;
    return folders(item.status).indexOf(folder)>-1;
  }
  // Reconcile local cards with the latest full n8n items list.
  // - A card missing from n8n leaves Needs Attention (marked stale).
  // - A local decision is never undone by n8n saying pending (only "Move back" reopens).
  // - n8n decisions apply to local pending cards unless the PM just reopened them.
  function reconcile(items,rows){
    var byKey={}; (rows||[]).forEach(function(r){ if(r&&typeof r==='object'){ var k=String(r.item_key||r.key||''); if(k) byKey[k]=r; } });
    var changed=false;
    (items||[]).forEach(function(it){
      var r=byKey[it.key];
      var stale=!r;
      if(!!it.stale!==stale){ if(stale) it.stale=true; else delete it.stale; changed=true; }
      if(!r) return;
      var rs=norm(r.status);
      if(it.status==='pending' && !it.reopened && ['accepted','rejected','delayed'].indexOf(rs)>-1){ it.status=rs; changed=true; }
      if(it.reopened && rs==='pending'){ delete it.reopened; changed=true; }
    });
    return changed;
  }
  function fromResponse(response){
    var pending=Array.isArray(response.items)?response.items:[], decided=Array.isArray(response.decided)?response.decided:[];
    var keys={}; decided.forEach(function(row){ if(row && (row.item_key||row.key)) keys[String(row.item_key||row.key)]=true; });
    return pending.filter(function(row){return row && !keys[String(row.item_key||row.key||'')];}).map(function(row){return Object.assign({},row,{status:'pending',n8nGroup:'items',decision:undefined});})
      .concat(decided.filter(function(row){return row && typeof row==='object';}).map(function(row){return Object.assign({},row,{status:norm(row.decision||row.status),n8nGroup:'decided'});}));
  }
  function duplicateGroups(items){
    var duplicates=(items||[]).filter(function(item){return inFolder(item,'duplicate');});
    return {pending:duplicates.filter(function(item){return item.status==='pending';}),decided:duplicates.filter(function(item){return item.n8nGroup==='decided';}),total:duplicates.length};
  }
  function duplicateStamp(iso){
    var date=new Date(iso); if(!iso || isNaN(date.getTime())) return '';
    return date.toLocaleString('en-US',{timeZone:'America/New_York',year:'numeric',month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})+' ET';
  }
  root.CardFolders={norm:norm,folders:folders,inFolder:inFolder,reconcile:reconcile,fromResponse:fromResponse,duplicateGroups:duplicateGroups,duplicateStamp:duplicateStamp};
})(typeof window!=='undefined'?window:globalThis);
