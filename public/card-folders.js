(function(root){
  // Folder rules from the card's status field.
  function norm(s){ s=String(s||'').toLowerCase(); return s==='applied'?'accepted':s; }
  function folders(status){
    var s=norm(status);
    if(s==='pending') return ['pending'];
    if(s==='delayed') return ['decided','delayed'];
    if(s==='accepted') return ['decided','accepted'];
    if(s==='rejected') return ['decided','rejected'];
    return [];
  }
  function inFolder(item,folder){
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
  root.CardFolders={norm:norm,folders:folders,inFolder:inFolder,reconcile:reconcile};
})(typeof window!=='undefined'?window:globalThis);
