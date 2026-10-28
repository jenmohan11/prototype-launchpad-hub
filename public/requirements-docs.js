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
  /* Deferral: an accepted item saying something is pushed to phase 2 / later /
     out of scope removes the matching requirements (topic-word overlap). */
  var DEFER = /phase\s*(2|two|ii)\b|later phase|later release|push(ed|ing)?\s+(back|out|to)|defer|descope|de-scope|out of scope|not in (the )?(beta|mvp|phase 1)|move(d)? to (phase|a later)/i;
  var GENERIC = 'requirement requirements report reports reporting scheduled client clients beta post phase later release item note notes needs need will would should with from that this into feature features project manager stakeholder feedback next steps step meeting scrum add added change changes update push pushed defer deferred move moved priya prioritize'.split(' ');
  function words(s) {
    return String(s || '').toLowerCase().match(/[a-z][a-z0-9-]{3,}/g) || [];
  }
  function isDeferral(item) {
    if (!item) return false;
    return DEFER.test([item.title, item.change, item.proposed_change, item.decision_notes].join(' '));
  }
  function deferredMatches(item, requirements) {
    if (!isDeferral(item) || !requirements) return [];
    var topic = {};
    words(item.title).concat(words(item.change)).forEach(function (w) {
      if (GENERIC.indexOf(w) === -1) topic[w] = true;
    });
    return requirements.filter(function (r) {
      if (!r || r.from === item.key) return false;
      return words(r.text).some(function (w) { return topic[w]; });
    });
  }
  global.ReqDocs = { canAddReqDoc: canAddReqDoc, dedupe: dedupe, isDeferral: isDeferral, deferredMatches: deferredMatches };
})(typeof window !== 'undefined' ? window : globalThis);
