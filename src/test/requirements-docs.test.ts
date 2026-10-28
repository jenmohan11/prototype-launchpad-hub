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
