import { beforeAll, describe, expect, it } from 'vitest';
let policy: { canCall: (persona: string) => boolean; canSeeMessages: (persona: string) => boolean; canRunAction: (persona: string, action: string) => boolean };
beforeAll(async () => {
  // @ts-expect-error plain browser script
  await import('../../public/n8n-visibility.js');
  policy = (globalThis as any).N8nVisibility;
});
describe('n8n persona controls', () => {
  it.each(['business', 'dev'])('%s cannot manually call or test n8n', (persona) => {
    expect(policy.canCall(persona)).toBe(false);
    for (const action of ['n8n-sync', 'n8n-check', 'n8n-test', 'n8n-retry', 'n8n-clear', 'import-toggle', 'import-go']) {
      expect(policy.canRunAction(persona, action)).toBe(false);
    }
  });
  it('Business cannot see operational messages', () => expect(policy.canSeeMessages('business')).toBe(false));
  it('Dev can see operational messages', () => expect(policy.canSeeMessages('dev')).toBe(true));
  it('PM retains n8n calls and tests', () => {
    expect(policy.canCall('admin')).toBe(true);
    expect(policy.canRunAction('admin', 'n8n-check')).toBe(true);
  });
  it.each(['business', 'dev'])('%s retains ordinary feedback actions', (persona) => {
    expect(policy.canRunAction(persona, 'open-card')).toBe(true);
  });
});