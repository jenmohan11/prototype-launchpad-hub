/* Requirements docs rule: one master doc per project.
   A new doc can only be added when none is linked; deleting the doc re-enables adding.
   dedupe() cleans saved state that predates the rule: same-title duplicates are
   collapsed and at most one doc is kept (the first). */
(function (global) {
  function canAddReqDoc(reqDocs) {
    return !reqDocs || reqDocs.length === 0;
  }
  function dedupe(reqDocs) {
    if (!reqDocs || !Array.isArray(reqDocs)) return [];
    var seen = {};
    var out = [];
    reqDocs.forEach(function (d) {
      if (!d) return;
      var k = String(d.title || '').trim().toLowerCase();
      if (!k || seen[k]) return;
      seen[k] = true;
      out.push(d);
    });
    return out.slice(0, 1);
  }
  global.ReqDocs = { canAddReqDoc: canAddReqDoc, dedupe: dedupe };
})(typeof window !== 'undefined' ? window : globalThis);
