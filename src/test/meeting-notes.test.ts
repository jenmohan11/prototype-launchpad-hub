import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { describe, expect, it } from 'vitest';

const sandbox = { URL, MeetingNotes: undefined as any };
runInNewContext(readFileSync('public/meeting-notes.js', 'utf8'), sandbox);
const api = sandbox.MeetingNotes;
const doc = 'https://docs.google.com/document/d/1BjSj3XePm_HCXpv1t9Xu7nUIBb_DDANyfSGbmXIbFpo/edit';

describe('Meeting notes repository', () => {
  it('logs the October 21 meeting once for multiple proposals and retains its specific document', () => {
    const notes: any[] = [];
    const rows = ['Legal review', 'Time zone decision'].map(raw_text => ({ source: 'Meeting Notes', source_link: doc, source_date: '2026-10-21T04:00:00.000Z', raw_text }));
    expect(api.importSources(notes, rows)).toBe(true);
    expect(notes).toHaveLength(1);
    expect(notes[0].date).toBe('2026-10-21');
    expect(notes[0].docUrl).toBe(doc);
    expect(notes[0].excerpts).toEqual(['Legal review', 'Time zone decision']);
    expect(api.importSources(notes, rows)).toBe(false);
    expect(notes).toHaveLength(1);
  });
  it('keeps Kickoff sync and a manually added note without duplicating its document', () => {
    const notes = [{ id: 'n1', title: 'Kickoff sync' }, { id: 'n2', title: 'Requirements review', docUrl: doc }];
    api.importSources(notes, [{ source: 'Meeting Notes', source_link: doc }]);
    expect(notes).toHaveLength(2);
    expect(notes[0].title).toBe('Kickoff sync');
  });
  it('accepts only specific HTTPS Google documents', () => {
    expect(api.googleDocUrl(doc)).toBe(doc);
    expect(api.googleDocUrl('https://docs.google.com.evil.example/document/d/abc/edit')).toBe('');
    expect(api.googleDocUrl('javascript:alert(1)')).toBe('');
  });
});