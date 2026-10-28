import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { describe, expect, it } from 'vitest';

const sandbox = { ReqDocs: undefined as any };
runInNewContext(readFileSync('public/requirements-docs.js', 'utf8'), sandbox);
const api = sandbox.ReqDocs;

describe('Requirements docs: one master doc', () => {
  it('allows adding a doc only when none is linked', () => {
    expect(api.canAddReqDoc([])).toBe(true);
    expect(api.canAddReqDoc(undefined)).toBe(true);
    expect(api.canAddReqDoc([{ id: 'd1', title: 'PRD v1' }])).toBe(false);
  });

  it('re-enables adding once the linked doc is removed', () => {
    const docs: any[] = [{ id: 'd1', title: 'PRD v1' }];
    expect(api.canAddReqDoc(docs)).toBe(false);
    docs.pop();
    expect(api.canAddReqDoc(docs)).toBe(true);
  });

  it('dedupes saved state down to one master doc', () => {
    expect(api.dedupe(undefined)).toEqual([]);
    expect(api.dedupe([
      { id: 'd1', title: 'Reporting Manager requirements (Confluence page)' },
      { id: 'd2', title: 'Reporting Manager requirements (Confluence page)' },
      { id: 'd3', title: 'A different doc' },
    ])).toEqual([{ id: 'd1', title: 'Reporting Manager requirements (Confluence page)' }]);
    expect(api.dedupe([])).toEqual([]);
  });
});

describe('Requirements: deferred items leave the requirements list', () => {
  const reqs = [
    { id: 'R-9', text: 'CSV and PDF export for reports', from: 'x' },
    { id: 'R-10', text: 'Requirements: add new post-beta requirement "Slack delivery for scheduled reports (needs Slack app)"', from: 'scrum-meeting-slack-delivery-requirement-20261021' },
  ];
  it('removes the Slack requirement when Slack is pushed to phase 2', () => {
    const item = { key: 'k1', title: 'Push Slack delivery to phase 2 or later', change: 'Defer Slack integration' };
    expect(api.deferredMatches(item, reqs).map((r: any) => r.id)).toEqual(['R-10']);
  });
  it('removes nothing for an item that is not a deferral', () => {
    expect(api.deferredMatches({ key: 'k2', title: 'Add Slack delivery', change: 'Add it' }, reqs)).toEqual([]);
  });
});

describe('Deleted R13 Slack delivery requirement', () => {
  const text = 'Scheduled reports can be delivered to Slack (needs Slack app and per-workspace authorization; ~2-3 week estimate) (P2, Phase 2 or later)';
  it('removes the specified R13 line without removing other requirements', () => {
    expect(api.removeDeletedSlackLine('R12 Email delivery\nR13 ' + text + '\nR14 Report exports')).toBe('R12 Email delivery\nR14 Report exports');
    expect(api.isDeletedSlackRequirement('R-13', text)).toBe(true);
    expect(api.isDeletedSlackRequirement('R14', text)).toBe(false);
    expect(api.isDeletedSlackRequirement('R13', 'Slack delivery audit logging')).toBe(false);
  });
});
