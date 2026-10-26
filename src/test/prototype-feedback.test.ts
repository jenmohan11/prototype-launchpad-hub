import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { describe, expect, it } from 'vitest';

const sandbox = { PrototypeFeedback: undefined as any };
runInNewContext(readFileSync('public/prototype-feedback.js', 'utf8'), sandbox);
const api = sandbox.PrototypeFeedback;

describe('Prototype feedback provenance', () => {
  it('corrects the confirmed branding comment without unrelated SCRUM-16 details', () => {
    const item = { key: 'branding', title: 'Clarify requirement: brand logos/branding on reports (report builder beta)', source: 'Jira Comment', affected: ['Requirements', 'Jira'], reason: 'Question on SCRUM-16', points: ['Jen Mohan asked on SCRUM-16 whether reports will support brand logos.', 'SCRUM-16 is In Progress, Highest priority, currently unassigned, no due date.'], change: 'Jira: note on SCRUM-16. Requirements: add open branding question.', raw: 'Will reports support brand logos?', by: 'Jen Mohan' };
    const comments: any[] = [];
    api.sync([item], comments, {});
    expect(item.source).toBe('Prototype Feedback');
    expect(JSON.stringify([item.reason, item.points, item.change])).not.toContain('SCRUM-16');
    expect(item.affected).toEqual(['Requirements', 'Stakeholder Feedback']);
    expect(comments[0].body).toBe('Will reports support brand logos?');
  });
  it('retains a prototype submission as one stakeholder record when the agent mislabels its returned proposal', () => {
    const comments = [{ id: 'p123', body: 'Make the report logo larger.' }];
    const item = { key: 'returned', source: 'Jira Comment', cardId: 'p123', raw: 'Make the report logo larger.', affected: ['Requirements'] };
    api.sync([item], comments, {});
    api.sync([item], comments, {});
    expect(item.source).toBe('Prototype Feedback');
    expect(item.affected).toContain('Stakeholder Feedback');
    expect(comments).toHaveLength(1);
  });
  it('does not relabel genuine Jira comments that mention a prototype or SCRUM-16', () => {
    const item = { key: 'jira', title: 'Review prototype', source: 'Jira Comment', reason: 'Question on SCRUM-16', affected: ['Jira'] };
    expect(api.normalize(item, [], {})).toBe(false);
    expect(item.source).toBe('Jira Comment');
    expect(item.affected).toEqual(['Jira']);
  });
});