/* Requirements docs rule: one master doc per project.
   A new doc can only be added when none is linked; deleting the doc re-enables adding. */
(function (global) {
  function canAddReqDoc(reqDocs) {
    return !reqDocs || reqDocs.length === 0;
  }
  global.ReqDocs = { canAddReqDoc: canAddReqDoc };
})(typeof window !== 'undefined' ? window : globalThis);
