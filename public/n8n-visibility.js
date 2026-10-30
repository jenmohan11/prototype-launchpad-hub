(function(root){
  function canCall(persona){ return persona==='admin'; }
  function canSeeMessages(persona){ return persona==='admin'||persona==='dev'; }
  function canRunAction(persona,action){
    return !(/^n8n-/.test(action)||action==='import-toggle'||action==='import-go')||canCall(persona);
  }
  root.N8nVisibility={canCall:canCall,canSeeMessages:canSeeMessages,canRunAction:canRunAction};
})(typeof window!=='undefined'?window:globalThis);