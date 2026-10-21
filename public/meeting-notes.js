(function (root) {
  function googleDocUrl(value) {
    try {
      var url = new URL(String(value || ''));
      return url.protocol === 'https:' && url.hostname === 'docs.google.com' && /^\/document\/d\/[A-Za-z0-9_-]+(?:\/|$)/.test(url.pathname) ? url.href : '';
    } catch (e) { return ''; }
  }
  function docId(value) {
    var url = googleDocUrl(value);
    return url ? new URL(url).pathname.split('/')[3] : '';
  }
  function importSources(notes, rows) {
    var changed = false;
    rows.forEach(function (row) {
      if (!row || !/^meeting notes?$/i.test(String(row.source || ''))) return;
      var ref = String(row.source_ref || row.sourceRef || '');
      var url = googleDocUrl(row.source_link || row.link || row.docUrl || ref);
      if (!url && /^[A-Za-z0-9_-]{20,}$/.test(ref)) url = 'https://docs.google.com/document/d/' + ref + '/edit';
      var identity = docId(url) || ref;
      if (!identity) return;
      var note = notes.find(function (n) { return docId(n.docUrl) === identity || n.sourceRef === identity || n.id === identity; });
      if (!note) {
        note = { id: 'doc-' + identity, sourceRef: identity, title: row.meeting_title || row.document_title || 'Meeting notes', date: String(row.source_date || row.date || '').slice(0, 10), by: row.submitted_by || row.by || 'n8n', status: 'processed', text: '', excerpts: [], imported: true, docUrl: url };
        notes.unshift(note); changed = true;
      }
      if (url && note.docUrl !== url) { note.docUrl = url; changed = true; }
      var excerpt = String(row.raw_text || row.raw || '').trim();
      if (note.imported && excerpt) {
        note.excerpts = note.excerpts || [];
        if (note.excerpts.indexOf(excerpt) === -1) { note.excerpts.push(excerpt); changed = true; }
      }
    });
    return changed;
  }
  root.MeetingNotes = { googleDocUrl: googleDocUrl, importSources: importSources };
})(globalThis);