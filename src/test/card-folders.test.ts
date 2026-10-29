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
});
