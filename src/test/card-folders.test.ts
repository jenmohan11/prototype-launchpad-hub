import { describe, it, expect, beforeAll } from "vitest";
let CF: any;
beforeAll(async () => { // @ts-expect-error plain browser script
  await import("../../public/card-folders.js"); CF = (globalThis as any).CardFolders; });
describe("card folders", () => {
  it("pending only in Needs Attention", () => expect(CF.folders("pending")).toEqual(["pending"]));
  it("delayed in Decided and Delayed, never Needs Attention", () => expect(CF.folders("delayed")).toEqual(["decided", "delayed"]));
  it("accepted/applied in Decided + Accepted", () => { expect(CF.folders("accepted")).toEqual(["decided", "accepted"]); expect(CF.folders("applied")).toEqual(["decided", "accepted"]); });
  it("rejected in Decided + Rejected", () => expect(CF.folders("rejected")).toEqual(["decided", "rejected"]));
  it("card missing from n8n leaves Needs Attention", () => {
    const items = [{ key: "a", status: "pending" }, { key: "b", status: "pending" }];
    CF.reconcile(items, [{ item_key: "a", status: "pending" }]);
    expect(items.filter((i) => CF.inFolder(i, "pending")).map((i) => i.key)).toEqual(["a"]);
  });
  it("local decision is not undone by n8n pending on reload", () => {
    const items = [{ key: "a", status: "delayed" }];
    CF.reconcile(items, [{ item_key: "a", status: "pending" }]);
    expect(CF.inFolder(items[0], "pending")).toBe(false);
  });
  it("reopened card stays in Needs Attention", () => {
    const items = [{ key: "a", status: "pending", reopened: true }];
    CF.reconcile(items, [{ item_key: "a", status: "delayed" }]);
    expect(CF.inFolder(items[0], "pending")).toBe(true);
  });
  it("decided duplicates stay in Decided and never Needs Attention", () => {
    const rows = CF.fromResponse({items:[{item_key:'d',title:'Duplicate: same'}],decided:[{item_key:'d',decision:'duplicate'}]});
    expect(rows).toHaveLength(1);
    expect(CF.inFolder(rows[0],'duplicate')).toBe(true);
    expect(CF.inFolder(rows[0],'decided')).toBe(true);
    expect(CF.inFolder(rows[0],'pending')).toBe(false);
  });
  it("pending Duplicate: cards stay in Needs Attention and count with marked duplicates", () => {
    const rows = CF.fromResponse({items:[{item_key:'p',title:'Duplicate: request'},{item_key:'n',title:'Not Duplicate: request'},{item_key:'c',title:'duplicate: request'}],decided:[{item_key:'d',decision:'duplicate'},{item_key:'a',decision:'accepted',title:'Duplicate: accepted'}]});
    const groups = CF.duplicateGroups(rows);
    expect(groups.total).toBe(2);
    expect(groups.pending.map((r:any)=>r.item_key)).toEqual(['p']);
    expect(groups.decided.map((r:any)=>r.item_key)).toEqual(['d']);
    expect(CF.inFolder(groups.pending[0],'pending')).toBe(true);
  });
  it("recalculates duplicates from the latest response, not saved or sample cards", () => {
    expect(CF.duplicateGroups([{title:'Duplicate: local',status:'pending'},{status:'duplicate'}]).total).toBe(0);
    expect(CF.duplicateGroups(CF.fromResponse({items:[],decided:[]})).total).toBe(0);
  });
  it("marking a live pending card duplicate immediately moves it into both folders", () => {
    const row = CF.fromResponse({items:[{item_key:'x',title:'Request'}]})[0];
    Object.assign(row,{status:'duplicate',decision:'duplicate',n8nGroup:'decided'});
    expect(CF.inFolder(row,'pending')).toBe(false);
    expect(CF.inFolder(row,'decided')).toBe(true);
    expect(CF.duplicateGroups([row]).total).toBe(1);
  });
  it("formats decided_at in Eastern Time, not the browser timezone", () => {
    expect(CF.duplicateStamp('2026-10-30T02:51:00Z')).toBe('Oct 29, 2026, 10:51 PM ET');
    expect(CF.duplicateStamp('2026-12-01T15:00:00Z')).toBe('Dec 1, 2026, 10:00 AM ET');
  });
  it("duplicates are capped at medium priority, never above a blocker", () => {
    const rows = CF.fromResponse({items:[{item_key:'p',title:'Duplicate: request',priority:'high'}],decided:[{item_key:'d',decision:'duplicate',priority:'high'},{item_key:'b',decision:'accepted',priority:'high'}]});
    expect(rows.find((r:any)=>r.item_key==='p').priority).toBe('medium');
    expect(rows.find((r:any)=>r.item_key==='d').priority).toBe('medium');
    expect(rows.find((r:any)=>r.item_key==='b').priority).toBe('high');
  });
  it("a low-priority duplicate stays low", () => {
    const row = CF.fromResponse({items:[{item_key:'p',title:'Duplicate: request',priority:'low'}]})[0];
    expect(row.priority).toBe('low');
  });
});
